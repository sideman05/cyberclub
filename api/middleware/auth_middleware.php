<?php

declare(strict_types=1);

function require_admin(PDO $pdo): array
{
    $token = bearer_token();
    if ($token === null) {
        json_error('Authentication required', ['auth' => 'Missing bearer token.'], 401);
    }

    $payload = decode_auth_token($token);
    if ($payload === null) {
        json_error('Invalid or expired authentication token', ['auth' => 'Please log in again.'], 401);
    }

    $stmt = $pdo->prepare('SELECT id, full_name, email, role, created_at, updated_at FROM admins WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => (int) $payload['sub']]);
    $admin = $stmt->fetch();

    if (!$admin) {
        json_error('Admin account not found', ['auth' => 'Please log in again.'], 401);
    }

    return $admin;
}
