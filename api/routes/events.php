<?php

declare(strict_types=1);

function event_by_id(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM events WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $id]);
    $event = $stmt->fetch();
    return $event ?: null;
}

function event_payload(PDO $pdo, array $input, ?array $existing = null): array
{
    $title = clean_string($input['title'] ?? $existing['title'] ?? '');
    $slugInput = clean_string($input['slug'] ?? $existing['slug'] ?? '');
    $eventDate = array_key_exists('event_date', $input) ? normalize_date($input['event_date']) : ($existing['event_date'] ?? null);
    $eventTime = array_key_exists('event_time', $input) ? normalize_time($input['event_time']) : ($existing['event_time'] ?? null);
    $location = clean_string($input['location'] ?? $existing['location'] ?? '');
    $description = clean_long_text($input['description'] ?? $existing['description'] ?? '');
    $status = clean_string($input['status'] ?? $existing['status'] ?? 'upcoming');

    $errors = validate_required([
        'title' => $title,
        'event_date' => $eventDate,
        'location' => $location,
        'description' => $description,
        'status' => $status,
    ], ['title', 'event_date', 'location', 'description', 'status']);

    if (($statusError = validate_enum_field($status, ['upcoming', 'completed', 'cancelled'])) !== null) {
        $errors['status'] = $statusError;
    }

    if (array_key_exists('event_date', $input) && trim((string) $input['event_date']) !== '' && $eventDate === null) {
        $errors['event_date'] = 'Enter a valid date.';
    }

    if (array_key_exists('event_time', $input) && trim((string) $input['event_time']) !== '' && $eventTime === null) {
        $errors['event_time'] = 'Enter a valid time.';
    }

    if ($errors !== []) {
        json_error('Please fix the highlighted event fields', $errors, 422);
    }

    $baseSlug = slugify($slugInput !== '' ? $slugInput : $title);
    $slug = unique_slug($pdo, 'events', $baseSlug, isset($existing['id']) ? (int) $existing['id'] : null);

    return compact('title', 'slug', 'eventDate', 'eventTime', 'location', 'description', 'status');
}

function handle_event_routes(PDO $pdo, string $method, array $segments): bool
{
    $isPublicEvents = ($segments[0] ?? '') === 'events';
    $isAdminEvents = ($segments[0] ?? '') === 'admin' && ($segments[1] ?? '') === 'events';

    if (!$isPublicEvents && !$isAdminEvents) {
        return false;
    }

    if ($isPublicEvents) {
        if ($method === 'GET' && count($segments) === 1) {
            $sql = "SELECT id, title, slug, event_date, event_time, location, description, image_path, status, created_at
                    FROM events
                    WHERE status IN ('upcoming', 'completed')
                    ORDER BY event_date ASC, event_time ASC, id DESC";
            [$limit, $offset] = pagination_params(0, 50);

            if ($limit > 0) {
                $stmt = $pdo->prepare($sql . ' LIMIT :limit OFFSET :offset');
                $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
                $stmt->execute();
            } else {
                $stmt = $pdo->query($sql);
            }

            json_success('Events fetched successfully', $stmt->fetchAll());
        }

        if ($method === 'GET' && count($segments) === 2) {
            $stmt = $pdo->prepare("SELECT * FROM events WHERE slug = :slug AND status IN ('upcoming', 'completed') LIMIT 1");
            $stmt->execute(['slug' => clean_string($segments[1])]);
            $event = $stmt->fetch();

            if (!$event) {
                json_error('Event not found', [], 404);
            }

            json_success('Event fetched successfully', $event);
        }

        not_found('Events endpoint not found');
        return true;
    }

    require_admin($pdo);
    $id = isset($segments[2]) ? filter_var($segments[2], FILTER_VALIDATE_INT) : null;

    if ($method === 'GET' && count($segments) === 2) {
        $sql = 'SELECT id, title, slug, event_date, event_time, location, description, image_path, status, created_at, updated_at
                FROM events
                ORDER BY event_date DESC, event_time DESC, id DESC';
        [$limit, $offset] = pagination_params(0, 100);

        if ($limit > 0) {
            $stmt = $pdo->prepare($sql . ' LIMIT :limit OFFSET :offset');
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
        } else {
            $stmt = $pdo->query($sql);
        }

        json_success('Events fetched successfully', $stmt->fetchAll());
    }

    if ($method === 'POST' && count($segments) === 2) {
        $input = request_input();
        $payload = event_payload($pdo, $input);
        $upload = upload_image('image_path', 'events');
        if (!$upload['success']) {
            json_error('Image upload failed', ['image_path' => $upload['error']], 422);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO events (title, slug, event_date, event_time, location, description, image_path, status)
             VALUES (:title, :slug, :event_date, :event_time, :location, :description, :image_path, :status)'
        );
        $stmt->execute([
            'title' => $payload['title'],
            'slug' => $payload['slug'],
            'event_date' => $payload['eventDate'],
            'event_time' => $payload['eventTime'],
            'location' => $payload['location'],
            'description' => $payload['description'],
            'image_path' => $upload['path'],
            'status' => $payload['status'],
        ]);

        json_success('Event created successfully', event_by_id($pdo, (int) $pdo->lastInsertId()), 201);
    }

    if (!$id) {
        json_error('Invalid event ID', ['id' => 'A valid numeric ID is required.'], 422);
    }

    $existing = event_by_id($pdo, (int) $id);
    if (!$existing) {
        json_error('Event not found', [], 404);
    }

    if ($method === 'GET' && count($segments) === 3) {
        json_success('Event fetched successfully', $existing);
    }

    if ($method === 'PUT' && count($segments) === 3) {
        $input = request_input();
        $payload = event_payload($pdo, $input, $existing);
        $upload = upload_image('image_path', 'events');
        if (!$upload['success']) {
            json_error('Image upload failed', ['image_path' => $upload['error']], 422);
        }

        $imagePath = $upload['path'] ?? $existing['image_path'];
        $stmt = $pdo->prepare(
            'UPDATE events
             SET title = :title, slug = :slug, event_date = :event_date, event_time = :event_time,
                 location = :location, description = :description, image_path = :image_path, status = :status
             WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id,
            'title' => $payload['title'],
            'slug' => $payload['slug'],
            'event_date' => $payload['eventDate'],
            'event_time' => $payload['eventTime'],
            'location' => $payload['location'],
            'description' => $payload['description'],
            'image_path' => $imagePath,
            'status' => $payload['status'],
        ]);

        if ($upload['path'] !== null && $existing['image_path'] !== null) {
            delete_uploaded_image($existing['image_path']);
        }

        json_success('Event updated successfully', event_by_id($pdo, (int) $id));
    }

    if ($method === 'DELETE' && count($segments) === 3) {
        $stmt = $pdo->prepare('DELETE FROM events WHERE id = :id');
        $stmt->execute(['id' => $id]);
        delete_uploaded_image($existing['image_path']);
        json_success('Event deleted successfully');
    }

    not_found('Events endpoint not found');
    return true;
}
