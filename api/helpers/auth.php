<?php

declare(strict_types=1);

const AUTH_TOKEN_TTL = 86400;

function jwt_secret(): string
{
    return getenv('JWT_SECRET') ?: 'change-this-dit-cyberclub-secret-in-production';
}

function base64url_encode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string|false
{
    $padding = 4 - (strlen($data) % 4);
    if ($padding < 4) {
        $data .= str_repeat('=', $padding);
    }

    return base64_decode(strtr($data, '-_', '+/'), true);
}

function create_auth_token(array $admin): string
{
    $header = ['typ' => 'JWT', 'alg' => 'HS256'];
    $issuedAt = time();
    $payload = [
        'sub' => (int) $admin['id'],
        'email' => $admin['email'],
        'role' => $admin['role'],
        'iat' => $issuedAt,
        'exp' => $issuedAt + AUTH_TOKEN_TTL,
    ];

    $encodedHeader = base64url_encode(json_encode($header, JSON_THROW_ON_ERROR));
    $encodedPayload = base64url_encode(json_encode($payload, JSON_THROW_ON_ERROR));
    $signature = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", jwt_secret(), true);

    return "{$encodedHeader}.{$encodedPayload}." . base64url_encode($signature);
}

function decode_auth_token(string $token): ?array
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }

    [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;
    $signature = base64url_decode($encodedSignature);
    if ($signature === false) {
        return null;
    }

    $expectedSignature = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", jwt_secret(), true);
    if (!hash_equals($expectedSignature, $signature)) {
        return null;
    }

    $payloadJson = base64url_decode($encodedPayload);
    if ($payloadJson === false) {
        return null;
    }

    $payload = json_decode($payloadJson, true);
    if (!is_array($payload) || !isset($payload['sub'], $payload['exp'])) {
        return null;
    }

    if ((int) $payload['exp'] < time()) {
        return null;
    }

    return $payload;
}

function bearer_token(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';

    if ($header === '' && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if (preg_match('/Bearer\s+(\S+)/i', $header, $matches)) {
        return $matches[1];
    }

    return null;
}

function public_admin(array $admin): array
{
    return [
        'id' => (int) $admin['id'],
        'full_name' => $admin['full_name'],
        'email' => $admin['email'],
        'role' => $admin['role'],
        'created_at' => $admin['created_at'] ?? null,
        'updated_at' => $admin['updated_at'] ?? null,
    ];
}
