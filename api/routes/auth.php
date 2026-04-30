<?php

declare(strict_types=1);

function admin_login_client_ip(): string
{
    $ip = trim((string) ($_SERVER['REMOTE_ADDR'] ?? ''));
    if ($ip === '' || !filter_var($ip, FILTER_VALIDATE_IP)) {
        return '0.0.0.0';
    }

    return $ip;
}

function admin_is_locked(array $admin): bool
{
    $lockoutUntil = $admin['lockout_until'] ?? null;
    if (!$lockoutUntil) {
        return false;
    }

    try {
        $now = new DateTimeImmutable('now');
        $until = new DateTimeImmutable((string) $lockoutUntil);
        return $until > $now;
    } catch (Throwable) {
        return false;
    }
}

function admin_login_attempt_row(PDO $pdo, string $ipAddress): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM admin_login_attempts WHERE ip_address = :ip_address LIMIT 1');
    $stmt->execute(['ip_address' => $ipAddress]);
    $row = $stmt->fetch();

    return $row ?: null;
}

function admin_login_attempt_is_locked(?array $row): bool
{
    if (!$row || empty($row['lockout_until'])) {
        return false;
    }

    try {
        $until = new DateTimeImmutable((string) $row['lockout_until']);
        return $until > new DateTimeImmutable('now');
    } catch (Throwable) {
        return false;
    }
}

function admin_login_attempt_payload(?array $row): array
{
    if (!$row || empty($row['lockout_until'])) {
        return [];
    }

    try {
        $now = new DateTimeImmutable('now');
        $until = new DateTimeImmutable((string) $row['lockout_until']);
        return [
            'lockout_until' => $row['lockout_until'],
            'retry_after_seconds' => max(0, $until->getTimestamp() - $now->getTimestamp()),
        ];
    } catch (Throwable) {
        return [
            'lockout_until' => $row['lockout_until'],
            'retry_after_seconds' => 0,
        ];
    }
}

function admin_login_record_failure(PDO $pdo, string $ipAddress): array
{
    $stmt = $pdo->prepare(
        'INSERT INTO admin_login_attempts (ip_address, failed_attempts, lockout_until, last_failed_login_at)
         VALUES (:ip_address, 1, NULL, NOW())
         ON DUPLICATE KEY UPDATE
           failed_attempts = IF(lockout_until IS NOT NULL AND lockout_until > NOW(), failed_attempts, failed_attempts + 1),
           lockout_until = CASE
             WHEN lockout_until IS NOT NULL AND lockout_until > NOW() THEN lockout_until
             WHEN failed_attempts + 1 >= 2 THEN DATE_ADD(NOW(), INTERVAL 5 HOUR)
             ELSE NULL
           END,
           last_failed_login_at = NOW()'
    );
    $stmt->execute(['ip_address' => $ipAddress]);

    return admin_login_attempt_row($pdo, $ipAddress) ?? [];
}

function admin_login_clear_attempts(PDO $pdo, string $ipAddress): void
{
    $stmt = $pdo->prepare('DELETE FROM admin_login_attempts WHERE ip_address = :ip_address');
    $stmt->execute(['ip_address' => $ipAddress]);
}

function admin_lockout_payload(array $admin): array
{
    $lockoutUntil = $admin['lockout_until'] ?? null;
    $payload = [];

    if ($lockoutUntil) {
        $payload['lockout_until'] = $lockoutUntil;

        try {
            $now = new DateTimeImmutable('now');
            $until = new DateTimeImmutable((string) $lockoutUntil);
            $remaining = max(0, $until->getTimestamp() - $now->getTimestamp());
            $payload['retry_after_seconds'] = $remaining;
        } catch (Throwable) {
            $payload['retry_after_seconds'] = 0;
        }
    }

    return $payload;
}

function handle_auth_routes(PDO $pdo, string $method, array $segments): bool
{
    if (($segments[0] ?? '') !== 'auth') {
        return false;
    }

    $action = $segments[1] ?? '';

    if ($method === 'POST' && $action === 'login') {
        $input = request_input();
        $email = strtolower(clean_string($input['email'] ?? ''));
        $password = (string) ($input['password'] ?? '');
        $clientIp = admin_login_client_ip();

        $ipAttempt = admin_login_attempt_row($pdo, $clientIp);
        if (admin_login_attempt_is_locked($ipAttempt)) {
            json_error(
                'Too many failed attempts from this device or network. Please try again later.',
                admin_login_attempt_payload($ipAttempt),
                423
            );
        }

        $errors = validate_required(['email' => $email, 'password' => $password], ['email', 'password']);
        if ($email !== '' && ($emailError = validate_email_field($email)) !== null) {
            $errors['email'] = $emailError;
        }

        if ($errors !== []) {
            json_error('Please check your login details', $errors, 422);
        }

        $stmt = $pdo->prepare('SELECT id, full_name, email, password_hash, role, failed_login_attempts, lockout_until, created_at, updated_at FROM admins WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $admin = $stmt->fetch();

        if ($admin && admin_is_locked($admin)) {
            json_error(
                'Too many failed attempts. Please try again later.',
                admin_lockout_payload($admin),
                423
            );
        }

        if (!$admin || !password_verify($password, $admin['password_hash'])) {
            if ($admin) {
                $attempts = (int) ($admin['failed_login_attempts'] ?? 0) + 1;

                if ($attempts >= 2) {
                    $stmt = $pdo->prepare(
                        'UPDATE admins
                         SET failed_login_attempts = 2,
                             lockout_until = DATE_ADD(NOW(), INTERVAL 5 HOUR),
                             last_failed_login_at = NOW()
                         WHERE id = :id'
                    );
                    $stmt->execute(['id' => $admin['id']]);

                    $stmt = $pdo->prepare('SELECT lockout_until FROM admins WHERE id = :id LIMIT 1');
                    $stmt->execute(['id' => $admin['id']]);
                    $fresh = $stmt->fetch() ?: [];

                    json_error(
                        'Too many failed attempts. Your account is locked for 5 hours.',
                        [
                            'credentials' => 'The provided credentials are incorrect.',
                            'lockout_until' => $fresh['lockout_until'] ?? null,
                            'retry_after_seconds' => 5 * 60 * 60,
                        ],
                        423
                    );
                }

                $stmt = $pdo->prepare(
                    'UPDATE admins
                     SET failed_login_attempts = :attempts,
                         last_failed_login_at = NOW(),
                         lockout_until = NULL
                     WHERE id = :id'
                );
                $stmt->execute([
                    'attempts' => $attempts,
                    'id' => $admin['id'],
                ]);
            }

            $ipRow = admin_login_record_failure($pdo, $clientIp);
            if (admin_login_attempt_is_locked($ipRow)) {
                json_error(
                    'Too many failed attempts from this device or network. Your access is blocked for 5 hours.',
                    admin_login_attempt_payload($ipRow),
                    423
                );
            }

            json_error('Invalid email or password', ['credentials' => 'The provided credentials are incorrect.'], 401);
        }

        if ($admin) {
            $stmt = $pdo->prepare(
                'UPDATE admins
                 SET failed_login_attempts = 0,
                     lockout_until = NULL,
                     last_failed_login_at = NULL
                 WHERE id = :id'
            );
            $stmt->execute(['id' => $admin['id']]);
        }

        admin_login_clear_attempts($pdo, $clientIp);

        $token = create_auth_token($admin);

        json_success('Logged in successfully', [
            'admin' => public_admin($admin),
            'token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => AUTH_TOKEN_TTL,
        ]);
    }

    if ($method === 'GET' && $action === 'me') {
        $admin = require_admin($pdo);
        json_success('Admin fetched successfully', public_admin($admin));
    }

    if ($method === 'POST' && $action === 'logout') {
        json_success('Logged out successfully');
    }

    not_found('Auth endpoint not found');
    return true;
}
