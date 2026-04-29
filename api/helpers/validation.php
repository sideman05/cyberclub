<?php

declare(strict_types=1);

function request_input(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if (str_contains($contentType, 'application/json')) {
        $raw = file_get_contents('php://input') ?: '';
        if ($raw === '') {
            return [];
        }

        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            json_error('Invalid JSON payload', ['body' => 'Malformed JSON body'], 400);
        }

        return $decoded;
    }

    if ($method === 'POST') {
        return $_POST;
    }

    if (in_array($method, ['PUT', 'PATCH'], true)) {
        $raw = file_get_contents('php://input') ?: '';
        $parsed = [];
        parse_str($raw, $parsed);
        return $parsed;
    }

    return [];
}

function clean_string(mixed $value): string
{
    $value = is_scalar($value) ? (string) $value : '';
    $value = str_replace("\0", '', $value);
    return trim(strip_tags($value));
}

function clean_long_text(mixed $value): string
{
    $value = is_scalar($value) ? (string) $value : '';
    $value = str_replace("\0", '', $value);
    $allowedTags = '<p><br><strong><b><em><i><ul><ol><li><a><blockquote><code><pre><h2><h3><h4>';
    return trim(strip_tags($value, $allowedTags));
}

function nullable_clean_string(mixed $value): ?string
{
    $cleaned = clean_string($value);
    return $cleaned === '' ? null : $cleaned;
}

function boolean_value(mixed $value): int
{
    if (is_bool($value)) {
        return $value ? 1 : 0;
    }

    $normalized = strtolower((string) $value);
    return in_array($normalized, ['1', 'true', 'yes', 'on'], true) ? 1 : 0;
}

function integer_value(mixed $value, int $default = 0): int
{
    if ($value === null || $value === '') {
        return $default;
    }

    return filter_var($value, FILTER_VALIDATE_INT) !== false ? (int) $value : $default;
}

function pagination_params(int $defaultLimit = 0, int $maxLimit = 100): array
{
    $limit = integer_value($_GET['limit'] ?? null, $defaultLimit);
    $offset = integer_value($_GET['offset'] ?? null, 0);

    return [
        max(0, min($limit, $maxLimit)),
        max(0, $offset),
    ];
}

function validate_required(array $data, array $fields): array
{
    $errors = [];
    foreach ($fields as $field) {
        if (!array_key_exists($field, $data) || trim((string) $data[$field]) === '') {
            $errors[$field] = 'This field is required.';
        }
    }

    return $errors;
}

function validate_email_field(string $email): ?string
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) ? null : 'Enter a valid email address.';
}

function validate_enum_field(string $value, array $allowed): ?string
{
    return in_array($value, $allowed, true) ? null : 'Invalid value.';
}

function validate_url_field(?string $value): ?string
{
    if ($value === null || $value === '') {
        return null;
    }

    return filter_var($value, FILTER_VALIDATE_URL) ? null : 'Enter a valid URL.';
}

function normalize_date(mixed $value): ?string
{
    $value = clean_string($value);
    if ($value === '') {
        return null;
    }

    $date = DateTime::createFromFormat('Y-m-d', $value);
    return $date && $date->format('Y-m-d') === $value ? $value : null;
}

function normalize_time(mixed $value): ?string
{
    $value = clean_string($value);
    if ($value === '') {
        return null;
    }

    foreach (['H:i:s', 'H:i'] as $format) {
        $time = DateTime::createFromFormat($format, $value);
        if ($time instanceof DateTime) {
            return $time->format('H:i:s');
        }
    }

    return null;
}

function normalize_datetime(mixed $value): ?string
{
    $value = clean_string($value);
    if ($value === '') {
        return null;
    }

    $value = str_replace('T', ' ', $value);
    foreach (['Y-m-d H:i:s', 'Y-m-d H:i'] as $format) {
        $date = DateTime::createFromFormat($format, $value);
        if ($date instanceof DateTime) {
            return $date->format('Y-m-d H:i:s');
        }
    }

    return null;
}

function slugify(string $text): string
{
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9]+/i', '-', $text) ?: '';
    $text = trim($text, '-');

    return $text !== '' ? $text : 'item';
}

function unique_slug(PDO $pdo, string $table, string $baseSlug, ?int $ignoreId = null): string
{
    $allowedTables = ['blog_posts', 'events'];
    if (!in_array($table, $allowedTables, true)) {
        throw new InvalidArgumentException('Unsupported table for slug generation.');
    }

    $slug = $baseSlug;
    $suffix = 2;

    while (true) {
        $sql = "SELECT id FROM {$table} WHERE slug = :slug";
        $params = ['slug' => $slug];
        if ($ignoreId !== null) {
            $sql .= ' AND id <> :id';
            $params['id'] = $ignoreId;
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        if (!$stmt->fetch()) {
            return $slug;
        }

        $slug = "{$baseSlug}-{$suffix}";
        $suffix++;
    }
}
