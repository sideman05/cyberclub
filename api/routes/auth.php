<?php

declare(strict_types=1);

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

        $errors = validate_required(['email' => $email, 'password' => $password], ['email', 'password']);
        if ($email !== '' && ($emailError = validate_email_field($email)) !== null) {
            $errors['email'] = $emailError;
        }

        if ($errors !== []) {
            json_error('Please check your login details', $errors, 422);
        }

        $stmt = $pdo->prepare('SELECT id, full_name, email, password_hash, role, created_at, updated_at FROM admins WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $admin = $stmt->fetch();

        if (!$admin || !password_verify($password, $admin['password_hash'])) {
            json_error('Invalid email or password', ['credentials' => 'The provided credentials are incorrect.'], 401);
        }

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
