<?php

declare(strict_types=1);

require __DIR__ . '/config/cors.php';
require __DIR__ . '/config/database.php';
require __DIR__ . '/helpers/response.php';
require __DIR__ . '/helpers/auth.php';
require __DIR__ . '/helpers/validation.php';
require __DIR__ . '/helpers/upload.php';
require __DIR__ . '/middleware/auth_middleware.php';
require __DIR__ . '/routes/auth.php';
require __DIR__ . '/routes/blogs.php';
require __DIR__ . '/routes/leaders.php';
require __DIR__ . '/routes/gallery.php';
require __DIR__ . '/routes/events.php';
require __DIR__ . '/routes/event_forms.php';
require __DIR__ . '/routes/contacts.php';

function route_path(): string
{
    $requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $scriptName = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '');
    $scriptDir = rtrim(str_replace('\\', '/', dirname($scriptName)), '/');

    if ($scriptName !== '' && str_starts_with($requestPath, $scriptName)) {
        $route = substr($requestPath, strlen($scriptName));
    } elseif ($scriptDir !== '' && $scriptDir !== '/' && str_starts_with($requestPath, $scriptDir)) {
        $route = substr($requestPath, strlen($scriptDir));
    } else {
        $route = $requestPath;
    }

    $route = '/' . trim($route, '/');
    return $route === '/' ? '/' : $route;
}

function request_method(): string
{
    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    $override = $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ?? $_POST['_method'] ?? '';

    if ($method === 'POST' && $override !== '') {
        $override = strtoupper((string) $override);
        if (in_array($override, ['PUT', 'PATCH', 'DELETE'], true)) {
            return $override;
        }
    }

    return $method;
}

try {
    $pdo = Database::connection();
    $method = request_method();
    $path = route_path();
    $segments = $path === '/' ? [] : explode('/', trim($path, '/'));

    if (handle_auth_routes($pdo, $method, $segments)) {
        exit;
    }

    if (handle_blog_routes($pdo, $method, $segments)) {
        exit;
    }

    if (handle_leader_routes($pdo, $method, $segments)) {
        exit;
    }

    if (handle_gallery_routes($pdo, $method, $segments)) {
        exit;
    }

    if (handle_event_form_routes($pdo, $method, $segments)) {
        exit;
    }

    if (handle_event_routes($pdo, $method, $segments)) {
        exit;
    }

    if (handle_contact_routes($pdo, $method, $segments)) {
        exit;
    }

    not_found();
} catch (PDOException $exception) {
    json_error('Database error', ['database' => $exception->getMessage()], 500);
} catch (Throwable $exception) {
    json_error('Server error', ['server' => $exception->getMessage()], 500);
}
