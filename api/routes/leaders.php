<?php

declare(strict_types=1);

function leader_by_id(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM leaders WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $id]);
    $leader = $stmt->fetch();
    return $leader ?: null;
}

function leader_payload(array $input, ?array $existing = null): array
{
    $fullName = clean_string($input['full_name'] ?? $existing['full_name'] ?? '');
    $position = clean_string($input['position'] ?? $existing['position'] ?? '');
    $bio = clean_long_text($input['bio'] ?? $existing['bio'] ?? '');
    $linkedinUrl = nullable_clean_string($input['linkedin_url'] ?? $existing['linkedin_url'] ?? null);
    $githubUrl = nullable_clean_string($input['github_url'] ?? $existing['twitter_url'] ?? null);
    $displayOrder = integer_value($input['display_order'] ?? $existing['display_order'] ?? 0);
    $isActive = boolean_value($input['is_active'] ?? $existing['is_active'] ?? 1);

    $errors = validate_required([
        'full_name' => $fullName,
        'position' => $position,
    ], ['full_name', 'position']);

    if (($urlError = validate_url_field($linkedinUrl)) !== null) {
        $errors['linkedin_url'] = $urlError;
    }

    if (($urlError = validate_url_field($githubUrl)) !== null) {
        $errors['github_url'] = $urlError;
    }

    if ($errors !== []) {
        json_error('Please fix the highlighted leader fields', $errors, 422);
    }

    return compact('fullName', 'position', 'bio', 'linkedinUrl', 'githubUrl', 'displayOrder', 'isActive');
}

function handle_leader_routes(PDO $pdo, string $method, array $segments): bool
{
    $isPublicLeaders = ($segments[0] ?? '') === 'leaders';
    $isAdminLeaders = ($segments[0] ?? '') === 'admin' && ($segments[1] ?? '') === 'leaders';

    if (!$isPublicLeaders && !$isAdminLeaders) {
        return false;
    }

    if ($isPublicLeaders) {
        if ($method === 'GET' && count($segments) === 1) {
                    $sql = 'SELECT id, full_name, position, bio, image_path, linkedin_url, twitter_url, display_order, is_active
                    FROM leaders
                    WHERE is_active = 1
                    ORDER BY display_order ASC, id ASC';
            [$limit, $offset] = pagination_params(0, 60);

            if ($limit > 0) {
                $stmt = $pdo->prepare($sql . ' LIMIT :limit OFFSET :offset');
                $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
                $stmt->execute();
            } else {
                $stmt = $pdo->query($sql);
            }

            json_success('Leaders fetched successfully', $stmt->fetchAll());
        }

        not_found('Leaders endpoint not found');
        return true;
    }

    require_admin($pdo);
    $id = isset($segments[2]) ? filter_var($segments[2], FILTER_VALIDATE_INT) : null;

    if ($method === 'GET' && count($segments) === 2) {
        $sql = 'SELECT id, full_name, position, bio, image_path, linkedin_url, twitter_url, display_order, is_active, created_at, updated_at
                FROM leaders
                ORDER BY display_order ASC, id ASC';
        [$limit, $offset] = pagination_params(0, 100);

        if ($limit > 0) {
            $stmt = $pdo->prepare($sql . ' LIMIT :limit OFFSET :offset');
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
        } else {
            $stmt = $pdo->query($sql);
        }

        json_success('Leaders fetched successfully', $stmt->fetchAll());
    }

    if ($method === 'POST' && count($segments) === 2) {
        $input = request_input();
        $payload = leader_payload($input);
        $upload = upload_image('image_path', 'leaders');
        if (!$upload['success']) {
            json_error('Image upload failed', ['image_path' => $upload['error']], 422);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO leaders (full_name, position, bio, image_path, linkedin_url, twitter_url, display_order, is_active)
             VALUES (:full_name, :position, :bio, :image_path, :linkedin_url, :twitter_url, :display_order, :is_active)'
        );
        $stmt->execute([
            'full_name' => $payload['fullName'],
            'position' => $payload['position'],
            'bio' => $payload['bio'],
            'image_path' => $upload['path'],
            'linkedin_url' => $payload['linkedinUrl'],
            'twitter_url' => $payload['githubUrl'],
            'display_order' => $payload['displayOrder'],
            'is_active' => $payload['isActive'],
        ]);

        json_success('Leader created successfully', leader_by_id($pdo, (int) $pdo->lastInsertId()), 201);
    }

    if (!$id) {
        json_error('Invalid leader ID', ['id' => 'A valid numeric ID is required.'], 422);
    }

    $existing = leader_by_id($pdo, (int) $id);
    if (!$existing) {
        json_error('Leader not found', [], 404);
    }

    if ($method === 'GET' && count($segments) === 3) {
        json_success('Leader fetched successfully', $existing);
    }

    if ($method === 'PUT' && count($segments) === 3) {
        $input = request_input();
        $payload = leader_payload($input, $existing);
        $upload = upload_image('image_path', 'leaders');
        if (!$upload['success']) {
            json_error('Image upload failed', ['image_path' => $upload['error']], 422);
        }

        $imagePath = $upload['path'] ?? $existing['image_path'];
        $stmt = $pdo->prepare(
            'UPDATE leaders
             SET full_name = :full_name, position = :position, bio = :bio, image_path = :image_path,
                 linkedin_url = :linkedin_url, twitter_url = :twitter_url, display_order = :display_order, is_active = :is_active
             WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id,
            'full_name' => $payload['fullName'],
            'position' => $payload['position'],
            'bio' => $payload['bio'],
            'image_path' => $imagePath,
            'linkedin_url' => $payload['linkedinUrl'],
            'twitter_url' => $payload['githubUrl'],
            'display_order' => $payload['displayOrder'],
            'is_active' => $payload['isActive'],
        ]);

        if ($upload['path'] !== null && $existing['image_path'] !== null) {
            delete_uploaded_image($existing['image_path']);
        }

        json_success('Leader updated successfully', leader_by_id($pdo, (int) $id));
    }

    if ($method === 'DELETE' && count($segments) === 3) {
        $stmt = $pdo->prepare('DELETE FROM leaders WHERE id = :id');
        $stmt->execute(['id' => $id]);
        delete_uploaded_image($existing['image_path']);
        json_success('Leader deleted successfully');
    }

    not_found('Leaders endpoint not found');
    return true;
}
