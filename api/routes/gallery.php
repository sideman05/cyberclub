<?php

declare(strict_types=1);

function gallery_item_by_id(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM gallery WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $id]);
    $item = $stmt->fetch();
    return $item ?: null;
}

function gallery_payload(array $input, ?array $existing = null): array
{
    $title = clean_string($input['title'] ?? $existing['title'] ?? '');
    $category = clean_string($input['category'] ?? $existing['category'] ?? '');
    $description = clean_long_text($input['description'] ?? $existing['description'] ?? '');
    $displayOrder = integer_value($input['display_order'] ?? $existing['display_order'] ?? 0);
    $isFeatured = boolean_value($input['is_featured'] ?? $existing['is_featured'] ?? 0);

    $errors = validate_required([
        'title' => $title,
        'category' => $category,
    ], ['title', 'category']);

    if ($errors !== []) {
        json_error('Please fix the highlighted gallery fields', $errors, 422);
    }

    return compact('title', 'category', 'description', 'displayOrder', 'isFeatured');
}

function handle_gallery_routes(PDO $pdo, string $method, array $segments): bool
{
    $isPublicGallery = ($segments[0] ?? '') === 'gallery';
    $isAdminGallery = ($segments[0] ?? '') === 'admin' && ($segments[1] ?? '') === 'gallery';

    if (!$isPublicGallery && !$isAdminGallery) {
        return false;
    }

    if ($isPublicGallery) {
        if ($method === 'GET' && count($segments) === 1) {
            $sql = 'SELECT id, title, category, image_path, description, display_order, is_featured, created_at
                    FROM gallery
                    ORDER BY display_order ASC, id DESC';
            [$limit, $offset] = pagination_params(0, 60);

            if ($limit > 0) {
                $stmt = $pdo->prepare($sql . ' LIMIT :limit OFFSET :offset');
                $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
                $stmt->execute();
            } else {
                $stmt = $pdo->query($sql);
            }

            json_success('Gallery fetched successfully', $stmt->fetchAll());
        }

        not_found('Gallery endpoint not found');
        return true;
    }

    require_admin($pdo);
    $id = isset($segments[2]) ? filter_var($segments[2], FILTER_VALIDATE_INT) : null;

    if ($method === 'GET' && count($segments) === 2) {
        $sql = 'SELECT id, title, category, image_path, description, display_order, is_featured, created_at, updated_at
                FROM gallery
                ORDER BY display_order ASC, id DESC';
        [$limit, $offset] = pagination_params(0, 100);

        if ($limit > 0) {
            $stmt = $pdo->prepare($sql . ' LIMIT :limit OFFSET :offset');
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
        } else {
            $stmt = $pdo->query($sql);
        }

        json_success('Gallery fetched successfully', $stmt->fetchAll());
    }

    if ($method === 'POST' && count($segments) === 2) {
        $input = request_input();
        $payload = gallery_payload($input);
        $upload = upload_image('image_path', 'gallery');
        if (!$upload['success'] || $upload['path'] === null) {
            json_error('Image upload failed', ['image_path' => $upload['error'] ?: 'Image is required.'], 422);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO gallery (title, category, image_path, description, display_order, is_featured)
             VALUES (:title, :category, :image_path, :description, :display_order, :is_featured)'
        );
        $stmt->execute([
            'title' => $payload['title'],
            'category' => $payload['category'],
            'image_path' => $upload['path'],
            'description' => $payload['description'],
            'display_order' => $payload['displayOrder'],
            'is_featured' => $payload['isFeatured'],
        ]);

        json_success('Gallery item created successfully', gallery_item_by_id($pdo, (int) $pdo->lastInsertId()), 201);
    }

    if (!$id) {
        json_error('Invalid gallery item ID', ['id' => 'A valid numeric ID is required.'], 422);
    }

    $existing = gallery_item_by_id($pdo, (int) $id);
    if (!$existing) {
        json_error('Gallery item not found', [], 404);
    }

    if ($method === 'GET' && count($segments) === 3) {
        json_success('Gallery item fetched successfully', $existing);
    }

    if ($method === 'PUT' && count($segments) === 3) {
        $input = request_input();
        $payload = gallery_payload($input, $existing);
        $upload = upload_image('image_path', 'gallery');
        if (!$upload['success']) {
            json_error('Image upload failed', ['image_path' => $upload['error']], 422);
        }

        $imagePath = $upload['path'] ?? $existing['image_path'];
        $stmt = $pdo->prepare(
            'UPDATE gallery
             SET title = :title, category = :category, image_path = :image_path, description = :description,
                 display_order = :display_order, is_featured = :is_featured
             WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id,
            'title' => $payload['title'],
            'category' => $payload['category'],
            'image_path' => $imagePath,
            'description' => $payload['description'],
            'display_order' => $payload['displayOrder'],
            'is_featured' => $payload['isFeatured'],
        ]);

        if ($upload['path'] !== null && $existing['image_path'] !== null) {
            delete_uploaded_image($existing['image_path']);
        }

        json_success('Gallery item updated successfully', gallery_item_by_id($pdo, (int) $id));
    }

    if ($method === 'DELETE' && count($segments) === 3) {
        $stmt = $pdo->prepare('DELETE FROM gallery WHERE id = :id');
        $stmt->execute(['id' => $id]);
        delete_uploaded_image($existing['image_path']);
        json_success('Gallery item deleted successfully');
    }

    not_found('Gallery endpoint not found');
    return true;
}
