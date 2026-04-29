<?php

declare(strict_types=1);

function contact_by_id(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM contact_messages WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $id]);
    $contact = $stmt->fetch();
    return $contact ?: null;
}

function handle_contact_routes(PDO $pdo, string $method, array $segments): bool
{
    $isPublicContact = ($segments[0] ?? '') === 'contact';
    $isAdminContacts = ($segments[0] ?? '') === 'admin' && ($segments[1] ?? '') === 'contacts';

    if (!$isPublicContact && !$isAdminContacts) {
        return false;
    }

    if ($isPublicContact) {
        if ($method === 'POST' && count($segments) === 1) {
            $input = request_input();
            $fullName = clean_string($input['full_name'] ?? '');
            $email = strtolower(clean_string($input['email'] ?? ''));
            $subject = clean_string($input['subject'] ?? '');
            $message = clean_long_text($input['message'] ?? '');

            $errors = validate_required([
                'full_name' => $fullName,
                'email' => $email,
                'subject' => $subject,
                'message' => $message,
            ], ['full_name', 'email', 'subject', 'message']);

            if ($email !== '' && ($emailError = validate_email_field($email)) !== null) {
                $errors['email'] = $emailError;
            }

            if ($errors !== []) {
                json_error('Please fix the highlighted contact fields', $errors, 422);
            }

            $stmt = $pdo->prepare(
                'INSERT INTO contact_messages (full_name, email, subject, message, status)
                 VALUES (:full_name, :email, :subject, :message, :status)'
            );
            $stmt->execute([
                'full_name' => $fullName,
                'email' => $email,
                'subject' => $subject,
                'message' => $message,
                'status' => 'unread',
            ]);

            json_success('Message sent successfully', contact_by_id($pdo, (int) $pdo->lastInsertId()), 201);
        }

        not_found('Contact endpoint not found');
        return true;
    }

    require_admin($pdo);
    $id = isset($segments[2]) ? filter_var($segments[2], FILTER_VALIDATE_INT) : null;

    if ($method === 'GET' && count($segments) === 2) {
        $sql = 'SELECT id, full_name, email, subject, message, status, created_at, updated_at
                FROM contact_messages
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

        json_success('Contact messages fetched successfully', $stmt->fetchAll());
    }

    if (!$id) {
        json_error('Invalid contact message ID', ['id' => 'A valid numeric ID is required.'], 422);
    }

    $existing = contact_by_id($pdo, (int) $id);
    if (!$existing) {
        json_error('Contact message not found', [], 404);
    }

    if ($method === 'GET' && count($segments) === 3) {
        json_success('Contact message fetched successfully', $existing);
    }

    if ($method === 'PUT' && count($segments) === 4 && ($segments[3] ?? '') === 'status') {
        $input = request_input();
        $status = clean_string($input['status'] ?? '');
        $errors = [];

        if (($statusError = validate_enum_field($status, ['unread', 'read', 'archived'])) !== null) {
            $errors['status'] = $statusError;
        }

        if ($errors !== []) {
            json_error('Please choose a valid message status', $errors, 422);
        }

        $stmt = $pdo->prepare('UPDATE contact_messages SET status = :status WHERE id = :id');
        $stmt->execute(['status' => $status, 'id' => $id]);
        json_success('Contact message status updated successfully', contact_by_id($pdo, (int) $id));
    }

    if ($method === 'DELETE' && count($segments) === 3) {
        $stmt = $pdo->prepare('DELETE FROM contact_messages WHERE id = :id');
        $stmt->execute(['id' => $id]);
        json_success('Contact message deleted successfully');
    }

    not_found('Contact endpoint not found');
    return true;
}
