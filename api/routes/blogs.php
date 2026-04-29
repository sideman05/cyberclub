<?php

declare(strict_types=1);

function blog_by_id(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM blog_posts WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $id]);
    $blog = $stmt->fetch();
    return $blog ?: null;
}

function blog_payload(PDO $pdo, array $input, ?array $existing = null): array
{
    $title = clean_string($input['title'] ?? $existing['title'] ?? '');
    $slugInput = clean_string($input['slug'] ?? $existing['slug'] ?? '');
    $category = clean_string($input['category'] ?? $existing['category'] ?? '');
    $excerpt = clean_long_text($input['excerpt'] ?? $existing['excerpt'] ?? '');
    $content = clean_long_text($input['content'] ?? $existing['content'] ?? '');
    $author = clean_string($input['author'] ?? $existing['author'] ?? '');
    $status = clean_string($input['status'] ?? $existing['status'] ?? 'draft');
    $publishedAt = array_key_exists('published_at', $input)
        ? normalize_datetime($input['published_at'])
        : ($existing['published_at'] ?? null);

    if ($status === 'published' && $publishedAt === null) {
        $publishedAt = date('Y-m-d H:i:s');
    }

    if ($status === 'draft' && array_key_exists('published_at', $input) && trim((string) $input['published_at']) === '') {
        $publishedAt = null;
    }

    $errors = validate_required([
        'title' => $title,
        'category' => $category,
        'excerpt' => $excerpt,
        'content' => $content,
        'author' => $author,
        'status' => $status,
    ], ['title', 'category', 'excerpt', 'content', 'author', 'status']);

    if (($statusError = validate_enum_field($status, ['draft', 'published'])) !== null) {
        $errors['status'] = $statusError;
    }

    if (array_key_exists('published_at', $input) && trim((string) $input['published_at']) !== '' && $publishedAt === null) {
        $errors['published_at'] = 'Enter a valid date and time.';
    }

    if ($errors !== []) {
        json_error('Please fix the highlighted blog fields', $errors, 422);
    }

    $baseSlug = slugify($slugInput !== '' ? $slugInput : $title);
    $slug = unique_slug($pdo, 'blog_posts', $baseSlug, isset($existing['id']) ? (int) $existing['id'] : null);

    return compact('title', 'slug', 'category', 'excerpt', 'content', 'author', 'status', 'publishedAt');
}

function handle_blog_routes(PDO $pdo, string $method, array $segments): bool
{
    $isPublicBlogs = ($segments[0] ?? '') === 'blogs';
    $isAdminBlogs = ($segments[0] ?? '') === 'admin' && ($segments[1] ?? '') === 'blogs';

    if (!$isPublicBlogs && !$isAdminBlogs) {
        return false;
    }

    if ($isPublicBlogs) {
        if ($method === 'GET' && count($segments) === 1) {
            $sql = "SELECT id, title, slug, category, excerpt, featured_image, author, status, published_at, created_at
                    FROM blog_posts
                    WHERE status = 'published'
                    ORDER BY COALESCE(published_at, created_at) DESC, id DESC";
            [$limit, $offset] = pagination_params(0, 50);

            if ($limit > 0) {
                $stmt = $pdo->prepare($sql . ' LIMIT :limit OFFSET :offset');
                $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
                $stmt->execute();
            } else {
                $stmt = $pdo->query($sql);
            }

            json_success('Blog posts fetched successfully', $stmt->fetchAll());
        }

        if ($method === 'GET' && count($segments) === 2) {
            $stmt = $pdo->prepare("SELECT * FROM blog_posts WHERE slug = :slug AND status = 'published' LIMIT 1");
            $stmt->execute(['slug' => clean_string($segments[1])]);
            $blog = $stmt->fetch();

            if (!$blog) {
                json_error('Blog post not found', [], 404);
            }

            json_success('Blog post fetched successfully', $blog);
        }

        not_found('Blog endpoint not found');
        return true;
    }

    require_admin($pdo);
    $id = isset($segments[2]) ? filter_var($segments[2], FILTER_VALIDATE_INT) : null;

    if ($method === 'GET' && count($segments) === 2) {
        $sql = 'SELECT id, title, slug, category, featured_image, author, status, published_at, created_at, updated_at
                FROM blog_posts
                ORDER BY created_at DESC, id DESC';
        [$limit, $offset] = pagination_params(0, 100);

        if ($limit > 0) {
            $stmt = $pdo->prepare($sql . ' LIMIT :limit OFFSET :offset');
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
        } else {
            $stmt = $pdo->query($sql);
        }

        json_success('Blog posts fetched successfully', $stmt->fetchAll());
    }

    if ($method === 'POST' && count($segments) === 2) {
        $input = request_input();
        $payload = blog_payload($pdo, $input);
        $upload = upload_image('featured_image', 'blogs');
        if (!$upload['success']) {
            json_error('Image upload failed', ['featured_image' => $upload['error']], 422);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO blog_posts (title, slug, category, excerpt, content, featured_image, author, status, published_at)
             VALUES (:title, :slug, :category, :excerpt, :content, :featured_image, :author, :status, :published_at)'
        );
        $stmt->execute([
            'title' => $payload['title'],
            'slug' => $payload['slug'],
            'category' => $payload['category'],
            'excerpt' => $payload['excerpt'],
            'content' => $payload['content'],
            'featured_image' => $upload['path'],
            'author' => $payload['author'],
            'status' => $payload['status'],
            'published_at' => $payload['publishedAt'],
        ]);

        json_success('Blog post created successfully', blog_by_id($pdo, (int) $pdo->lastInsertId()), 201);
    }

    if (!$id) {
        json_error('Invalid blog post ID', ['id' => 'A valid numeric ID is required.'], 422);
    }

    $existing = blog_by_id($pdo, (int) $id);
    if (!$existing) {
        json_error('Blog post not found', [], 404);
    }

    if ($method === 'GET' && count($segments) === 3) {
        json_success('Blog post fetched successfully', $existing);
    }

    if ($method === 'PUT' && count($segments) === 3) {
        $input = request_input();
        $payload = blog_payload($pdo, $input, $existing);
        $upload = upload_image('featured_image', 'blogs');
        if (!$upload['success']) {
            json_error('Image upload failed', ['featured_image' => $upload['error']], 422);
        }

        $imagePath = $upload['path'] ?? $existing['featured_image'];
        $stmt = $pdo->prepare(
            'UPDATE blog_posts
             SET title = :title, slug = :slug, category = :category, excerpt = :excerpt, content = :content,
                 featured_image = :featured_image, author = :author, status = :status, published_at = :published_at
             WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id,
            'title' => $payload['title'],
            'slug' => $payload['slug'],
            'category' => $payload['category'],
            'excerpt' => $payload['excerpt'],
            'content' => $payload['content'],
            'featured_image' => $imagePath,
            'author' => $payload['author'],
            'status' => $payload['status'],
            'published_at' => $payload['publishedAt'],
        ]);

        if ($upload['path'] !== null && $existing['featured_image'] !== null) {
            delete_uploaded_image($existing['featured_image']);
        }

        json_success('Blog post updated successfully', blog_by_id($pdo, (int) $id));
    }

    if ($method === 'DELETE' && count($segments) === 3) {
        $stmt = $pdo->prepare('DELETE FROM blog_posts WHERE id = :id');
        $stmt->execute(['id' => $id]);
        delete_uploaded_image($existing['featured_image']);
        json_success('Blog post deleted successfully');
    }

    not_found('Blog endpoint not found');
    return true;
}
