<?php

declare(strict_types=1);

function event_form_by_id(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM event_forms WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $id]);
    $form = $stmt->fetch();
    return $form ?: null;
}

function form_fields_by_form_id(PDO $pdo, int $form_id): array
{
    $stmt = $pdo->prepare('SELECT * FROM event_form_fields WHERE form_id = :form_id ORDER BY order_index ASC');
    $stmt->execute(['form_id' => $form_id]);
    return $stmt->fetchAll();
}

function form_by_event_id(PDO $pdo, int $event_id): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM event_forms WHERE event_id = :event_id AND is_active = 1 LIMIT 1');
    $stmt->execute(['event_id' => $event_id]);
    $form = $stmt->fetch();
    
    if ($form) {
        $form['fields'] = form_fields_by_form_id($pdo, (int)$form['id']);
    }
    
    return $form ?: null;
}

function form_responses_by_form_id(PDO $pdo, int $form_id): array
{
    $sql = 'SELECT efr.id, efr.form_id, efr.event_id, efr.responder_email, efr.responder_name, efr.created_at,
                GROUP_CONCAT(CONCAT(efrd.field_label, ": ", efrd.answer) SEPARATOR " | ") as response_summary
         FROM event_form_responses efr
         LEFT JOIN event_form_response_data efrd ON efr.id = efrd.response_id
         WHERE efr.form_id = :form_id
         GROUP BY efr.id
         ORDER BY efr.created_at DESC';
    [$limit, $offset] = pagination_params(0, 100);

    if ($limit > 0) {
        $stmt = $pdo->prepare($sql . ' LIMIT :limit OFFSET :offset');
        $stmt->bindValue(':form_id', $form_id, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
    } else {
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['form_id' => $form_id]);
    }

    return $stmt->fetchAll();
}

function response_details_by_id(PDO $pdo, int $response_id): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM event_form_responses WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $response_id]);
    $response = $stmt->fetch();
    
    if ($response) {
        $dataStmt = $pdo->prepare('SELECT * FROM event_form_response_data WHERE response_id = :response_id ORDER BY id ASC');
        $dataStmt->execute(['response_id' => $response_id]);
        $response['answers'] = $dataStmt->fetchAll();
    }
    
    return $response ?: null;
}

function event_form_int_or_null(mixed $value): ?int
{
    if ($value === null || $value === '') {
        return null;
    }

    $id = filter_var($value, FILTER_VALIDATE_INT);
    return $id !== false && (int) $id > 0 ? (int) $id : null;
}

function event_form_answer_value(array $answers, int $fieldId): mixed
{
    if (array_key_exists($fieldId, $answers)) {
        return $answers[$fieldId];
    }

    $key = (string) $fieldId;
    return array_key_exists($key, $answers) ? $answers[$key] : null;
}

function event_form_answer_has_value(mixed $answer): bool
{
    if (is_array($answer)) {
        foreach ($answer as $item) {
            if (trim((string) $item) !== '') {
                return true;
            }
        }

        return false;
    }

    return trim((string) ($answer ?? '')) !== '';
}

function event_form_answer_matches_condition(mixed $answer, string $expected): bool
{
    $expected = trim($expected);
    if ($expected === '') {
        return false;
    }

    if (is_array($answer)) {
        foreach ($answer as $item) {
            if ((string) $item === $expected) {
                return true;
            }
        }

        return false;
    }

    return trim((string) ($answer ?? '')) === $expected;
}

function event_form_field_is_visible(array $field, array $answers, array $fieldsById, array $visited = []): bool
{
    $parentId = event_form_int_or_null($field['conditional_parent_field_id'] ?? null);
    if ($parentId === null) {
        return true;
    }

    $fieldId = (int) $field['id'];
    if (isset($visited[$fieldId])) {
        return false;
    }

    if (!isset($fieldsById[$parentId])) {
        return false;
    }

    $visited[$fieldId] = true;
    $parentField = $fieldsById[$parentId];

    if (!event_form_field_is_visible($parentField, $answers, $fieldsById, $visited)) {
        return false;
    }

    return event_form_answer_matches_condition(
        event_form_answer_value($answers, $parentId),
        clean_string($field['conditional_parent_value'] ?? '')
    );
}

function event_form_format_answer(mixed $answer): string
{
    if (is_array($answer)) {
        $values = [];
        foreach ($answer as $item) {
            $value = clean_string($item);
            if ($value !== '') {
                $values[] = $value;
            }
        }

        return implode(', ', $values);
    }

    return clean_string($answer);
}

function event_form_validate_condition(PDO $pdo, int $formId, ?int $parentFieldId, string $parentValue, ?int $fieldId = null): array
{
    if ($parentFieldId === null) {
        return [];
    }

    $errors = [];

    if ($parentValue === '') {
        $errors['conditional_parent_value'] = 'Choose the parent option that should show this field.';
    }

    $sql = "SELECT id FROM event_form_fields
            WHERE id = :parent_id
              AND form_id = :form_id
              AND field_type IN ('radio', 'checkbox', 'select')";

    if ($fieldId !== null) {
        $sql .= ' AND id <> :field_id';
    }

    $stmt = $pdo->prepare($sql . ' LIMIT 1');
    $stmt->bindValue(':parent_id', $parentFieldId, PDO::PARAM_INT);
    $stmt->bindValue(':form_id', $formId, PDO::PARAM_INT);

    if ($fieldId !== null) {
        $stmt->bindValue(':field_id', $fieldId, PDO::PARAM_INT);
    }

    $stmt->execute();

    if (!$stmt->fetch()) {
        $errors['conditional_parent_field_id'] = 'Choose a valid parent option field from this form.';
    }

    return $errors;
}

function event_form_payload(PDO $pdo, array $input): array
{
    $title = clean_string($input['title'] ?? '');
    $description = clean_long_text($input['description'] ?? '');
    $eventId = isset($input['event_id']) ? filter_var($input['event_id'], FILTER_VALIDATE_INT) : null;

    $errors = validate_required([
        'title' => $title,
        'event_id' => $eventId,
    ], ['title', 'event_id']);

    if ($eventId && !event_by_id($pdo, $eventId)) {
        $errors['event_id'] = 'The selected event does not exist.';
    }

    if ($errors !== []) {
        json_error('Please fix the highlighted fields', $errors, 422);
    }

    return compact('title', 'description', 'eventId');
}

function handle_event_form_routes(PDO $pdo, string $method, array $segments): bool
{
    $isPublicForm = ($segments[0] ?? '') === 'events' && ($segments[1] ?? '') === 'forms';
    $isAdminForm = ($segments[0] ?? '') === 'admin' && ($segments[1] ?? '') === 'event-forms';

    if (!$isPublicForm && !$isAdminForm) {
        return false;
    }

    // PUBLIC: Get form by event ID
        if ($isPublicForm && $method === 'GET' && count($segments) === 3) {
            $eventId = filter_var($segments[2] ?? '', FILTER_VALIDATE_INT);
        if (!$eventId) {
            json_error('Invalid event ID', [], 422);
        }

        $form = form_by_event_id($pdo, $eventId);
        if (!$form) {
            json_error('No form found for this event', [], 404);
        }

        json_success('Form fetched successfully', $form);
    }

    // PUBLIC: Submit form response
    if ($isPublicForm && $method === 'POST' && count($segments) === 3 && $segments[2] === 'submit') {
        $input = request_input();
        $formId = filter_var($input['form_id'] ?? '', FILTER_VALIDATE_INT);
        $eventId = filter_var($input['event_id'] ?? '', FILTER_VALIDATE_INT);
        $responderEmail = strtolower(clean_string($input['responder_email'] ?? ''));
        $responderName = clean_string($input['responder_name'] ?? '');
        $answers = $input['answers'] ?? [];

        $errors = validate_required([
            'form_id' => $formId,
            'event_id' => $eventId,
            'responder_email' => $responderEmail,
        ], ['form_id', 'event_id', 'responder_email']);

        if ($responderEmail !== '' && ($emailError = validate_email_field($responderEmail)) !== null) {
            $errors['responder_email'] = $emailError;
        }

        if (!is_array($answers)) {
            $errors['answers'] = 'Answers must be submitted as an object.';
            $answers = [];
        }

        if ($errors !== []) {
            json_error('Please provide all required fields', $errors, 422);
        }

        // Verify form exists and belongs to this event
        $form = event_form_by_id($pdo, $formId);
        if (!$form || (int)$form['event_id'] !== $eventId) {
            json_error('Invalid form or event', [], 422);
        }

        $fields = form_fields_by_form_id($pdo, $formId);
        $fieldsById = [];
        foreach ($fields as $field) {
            $fieldsById[(int) $field['id']] = $field;
        }

        $answerErrors = [];
        foreach ($fields as $field) {
            if (!event_form_field_is_visible($field, $answers, $fieldsById)) {
                continue;
            }

            if ((int) $field['is_required'] === 1 && !event_form_answer_has_value(event_form_answer_value($answers, (int) $field['id']))) {
                $answerErrors['field_' . $field['id']] = $field['label'] . ' is required.';
            }
        }

        if ($answerErrors !== []) {
            json_error('Please complete the required form fields', $answerErrors, 422);
        }

        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;

        // Insert response
        $stmt = $pdo->prepare(
            'INSERT INTO event_form_responses (form_id, event_id, responder_email, responder_name, ip_address)
             VALUES (:form_id, :event_id, :responder_email, :responder_name, :ip_address)'
        );
        $stmt->execute([
            ':form_id' => $formId,
            ':event_id' => $eventId,
            ':responder_email' => $responderEmail,
            ':responder_name' => $responderName,
            ':ip_address' => $ipAddress,
        ]);

        $responseId = (int)$pdo->lastInsertId();

        // Insert response data
        $answerStmt = $pdo->prepare(
            'INSERT INTO event_form_response_data (response_id, field_id, field_label, answer)
             VALUES (:response_id, :field_id, :field_label, :answer)'
        );

        foreach ($fields as $field) {
            if (!event_form_field_is_visible($field, $answers, $fieldsById)) {
                continue;
            }

            $answer = event_form_answer_value($answers, (int) $field['id']);
            if (!event_form_answer_has_value($answer)) {
                continue;
            }

            $answerStmt->execute([
                ':response_id' => $responseId,
                ':field_id' => (int) $field['id'],
                ':field_label' => $field['label'],
                ':answer' => event_form_format_answer($answer),
            ]);
        }

        json_success('Response submitted successfully', ['response_id' => $responseId], 201);
    }

    require_admin($pdo);
    $id = isset($segments[2]) ? filter_var($segments[2], FILTER_VALIDATE_INT) : null;

    // ADMIN: Get all event forms
    if ($isAdminForm && $method === 'GET' && count($segments) === 2) {
        $sql = 'SELECT id, event_id, title, description, is_active, created_at, updated_at
                FROM event_forms
                ORDER BY created_at DESC';
        [$limit, $offset] = pagination_params(0, 100);

        if ($limit > 0) {
            $stmt = $pdo->prepare($sql . ' LIMIT :limit OFFSET :offset');
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
        } else {
            $stmt = $pdo->query($sql);
        }

        json_success('Forms fetched successfully', $stmt->fetchAll());
    }

    // ADMIN: Create form
    if ($isAdminForm && $method === 'POST' && count($segments) === 2) {
        $input = request_input();
        $payload = event_form_payload($pdo, $input);

        $stmt = $pdo->prepare(
            'INSERT INTO event_forms (event_id, title, description, is_active)
             VALUES (:event_id, :title, :description, 1)'
        );
        $stmt->execute([
            ':event_id' => $payload['eventId'],
            ':title' => $payload['title'],
            ':description' => $payload['description'],
        ]);

        $formId = (int)$pdo->lastInsertId();
        $form = event_form_by_id($pdo, $formId);
        $form['fields'] = [];

        json_success('Form created successfully', $form, 201);
    }

    if (!$id) {
        json_error('Invalid form ID', ['id' => 'A valid numeric ID is required.'], 422);
    }

    $existing = event_form_by_id($pdo, $id);
    if (!$existing) {
        json_error('Form not found', [], 404);
    }

    // ADMIN: Get form with fields
    if ($isAdminForm && $method === 'GET' && count($segments) === 3) {
        $existing['fields'] = form_fields_by_form_id($pdo, $id);
        json_success('Form fetched successfully', $existing);
    }

    // ADMIN: Update form
    if ($isAdminForm && $method === 'PUT' && count($segments) === 3) {
        $input = request_input();
        $title = clean_string($input['title'] ?? $existing['title']);
        $description = clean_long_text($input['description'] ?? $existing['description']);
        $isActive = isset($input['is_active']) ? (int)(bool)$input['is_active'] : $existing['is_active'];

        $stmt = $pdo->prepare(
            'UPDATE event_forms SET title = :title, description = :description, is_active = :is_active WHERE id = :id'
        );
        $stmt->execute([
            ':id' => $id,
            ':title' => $title,
            ':description' => $description,
            ':is_active' => $isActive,
        ]);

        $updated = event_form_by_id($pdo, $id);
        $updated['fields'] = form_fields_by_form_id($pdo, $id);

        json_success('Form updated successfully', $updated);
    }

    // ADMIN: Delete form
    if ($isAdminForm && $method === 'DELETE' && count($segments) === 3) {
        $stmt = $pdo->prepare('DELETE FROM event_forms WHERE id = :id');
        $stmt->execute([':id' => $id]);

        json_success('Form deleted successfully', []);
    }

    // ADMIN: Handle form fields
    if ($isAdminForm && count($segments) >= 4) {
        $action = $segments[3] ?? '';

        // Handle form responses before field routes so response IDs are never treated as field IDs.
        if ($action === 'responses') {
            if ($method === 'GET' && count($segments) === 4) {
                $responses = form_responses_by_form_id($pdo, $id);
                json_success('Responses fetched successfully', $responses);
            }

            $responseId = isset($segments[4]) ? filter_var($segments[4], FILTER_VALIDATE_INT) : null;

            if (!$responseId) {
                json_error('Invalid response ID', ['id' => 'A valid numeric response ID is required.'], 422);
            }

            if ($method === 'GET' && count($segments) === 5) {
                $response = response_details_by_id($pdo, $responseId);
                if (!$response || (int)$response['form_id'] !== $id) {
                    json_error('Response not found', [], 404);
                }
                json_success('Response fetched successfully', $response);
            }

            if ($method === 'DELETE' && count($segments) === 5) {
                $stmt = $pdo->prepare('DELETE FROM event_form_responses WHERE id = :id AND form_id = :form_id');
                $stmt->execute([':id' => $responseId, ':form_id' => $id]);

                if ($stmt->rowCount() === 0) {
                    json_error('Response not found', [], 404);
                }

                json_success('Response deleted successfully', []);
            }

            not_found('Response endpoint not found');
        }

        if ($action === 'fields') {
            // Get fields
            if ($method === 'GET' && count($segments) === 4) {
                $fields = form_fields_by_form_id($pdo, $id);
                json_success('Fields fetched successfully', $fields);
            }

            // Add field
            if ($method === 'POST' && count($segments) === 4) {
                $input = request_input();
                $fieldType = clean_string($input['field_type'] ?? '');
                $label = clean_string($input['label'] ?? '');
                $placeholder = clean_string($input['placeholder'] ?? '');
                $options = $input['options'] ?? [];
                $isRequired = isset($input['is_required']) ? (int)(bool)$input['is_required'] : 0;
                $helpText = clean_string($input['help_text'] ?? '');
                $conditionalParentFieldId = array_key_exists('conditional_parent_field_id', $input)
                    ? event_form_int_or_null($input['conditional_parent_field_id'])
                    : null;
                $conditionalParentValue = clean_string($input['conditional_parent_value'] ?? '');

                if ($conditionalParentFieldId === null) {
                    $conditionalParentValue = '';
                }

                $errors = validate_required([
                    'field_type' => $fieldType,
                    'label' => $label,
                ], ['field_type', 'label']);

                $validTypes = ['text', 'email', 'number', 'textarea', 'radio', 'checkbox', 'select', 'date', 'time', 'tel', 'url'];
                if (!in_array($fieldType, $validTypes, true)) {
                    $errors['field_type'] = 'Invalid field type.';
                }

                $errors = array_merge(
                    $errors,
                    event_form_validate_condition($pdo, $id, $conditionalParentFieldId, $conditionalParentValue)
                );

                if ($errors !== []) {
                    json_error('Please fix the highlighted fields', $errors, 422);
                }

                $orderIndex = $pdo->query("SELECT MAX(order_index) as max_order FROM event_form_fields WHERE form_id = $id")->fetch()['max_order'] ?? 0;

                $optionsJson = !empty($options) ? json_encode($options) : null;

                $stmt = $pdo->prepare(
                    'INSERT INTO event_form_fields (form_id, field_type, label, placeholder, options, is_required, order_index, help_text, conditional_parent_field_id, conditional_parent_value)
                     VALUES (:form_id, :field_type, :label, :placeholder, :options, :is_required, :order_index, :help_text, :conditional_parent_field_id, :conditional_parent_value)'
                );
                $stmt->execute([
                    ':form_id' => $id,
                    ':field_type' => $fieldType,
                    ':label' => $label,
                    ':placeholder' => $placeholder,
                    ':options' => $optionsJson,
                    ':is_required' => $isRequired,
                    ':order_index' => $orderIndex + 1,
                    ':help_text' => $helpText,
                    ':conditional_parent_field_id' => $conditionalParentFieldId,
                    ':conditional_parent_value' => $conditionalParentValue,
                ]);

                $fieldId = (int)$pdo->lastInsertId();

                $stmt = $pdo->prepare('SELECT * FROM event_form_fields WHERE id = :id');
                $stmt->execute([':id' => $fieldId]);
                $field = $stmt->fetch();

                json_success('Field added successfully', $field, 201);
            }

            // Update field order
            if ($method === 'PATCH' && count($segments) === 4) {
                $input = request_input();
                $fields = $input['fields'] ?? [];

                foreach ($fields as $index => $fieldData) {
                    $fieldId = filter_var($fieldData['id'] ?? '', FILTER_VALIDATE_INT);
                    if ($fieldId) {
                        $stmt = $pdo->prepare('UPDATE event_form_fields SET order_index = :order WHERE id = :id AND form_id = :form_id');
                        $stmt->execute([
                            ':order' => $index,
                            ':id' => $fieldId,
                            ':form_id' => $id,
                        ]);
                    }
                }

                json_success('Field order updated successfully', form_fields_by_form_id($pdo, $id));
            }
        }

        // Handle individual field (only when action is 'fields')
        $fieldId = isset($segments[4]) ? filter_var($segments[4], FILTER_VALIDATE_INT) : null;
        if ($action === 'fields' && $fieldId) {
            $stmt = $pdo->prepare('SELECT * FROM event_form_fields WHERE id = :id AND form_id = :form_id LIMIT 1');
            $stmt->execute([':id' => $fieldId, ':form_id' => $id]);
            $field = $stmt->fetch();

            if (!$field) {
                json_error('Field not found', [], 404);
            }

            // Update field
            if ($method === 'PUT' && count($segments) === 5) {
                $input = request_input();
                $fieldType = clean_string($input['field_type'] ?? $field['field_type']);
                $label = clean_string($input['label'] ?? $field['label']);
                $placeholder = clean_string($input['placeholder'] ?? $field['placeholder']);
                $options = $input['options'] ?? [];
                $isRequired = isset($input['is_required']) ? (int)(bool)$input['is_required'] : $field['is_required'];
                $helpText = clean_string($input['help_text'] ?? $field['help_text']);
                $conditionalParentFieldId = array_key_exists('conditional_parent_field_id', $input)
                    ? event_form_int_or_null($input['conditional_parent_field_id'])
                    : event_form_int_or_null($field['conditional_parent_field_id'] ?? null);
                $conditionalParentValue = array_key_exists('conditional_parent_value', $input)
                    ? clean_string($input['conditional_parent_value'])
                    : clean_string($field['conditional_parent_value'] ?? '');

                if ($conditionalParentFieldId === null) {
                    $conditionalParentValue = '';
                }

                $errors = validate_required([
                    'field_type' => $fieldType,
                    'label' => $label,
                ], ['field_type', 'label']);

                $validTypes = ['text', 'email', 'number', 'textarea', 'radio', 'checkbox', 'select', 'date', 'time', 'tel', 'url'];
                if (!in_array($fieldType, $validTypes, true)) {
                    $errors['field_type'] = 'Invalid field type.';
                }

                $errors = array_merge(
                    $errors,
                    event_form_validate_condition($pdo, $id, $conditionalParentFieldId, $conditionalParentValue, $fieldId)
                );

                if ($errors !== []) {
                    json_error('Please fix the highlighted fields', $errors, 422);
                }

                $optionsJson = !empty($options) ? json_encode($options) : null;

                $stmt = $pdo->prepare(
                    'UPDATE event_form_fields 
                     SET field_type = :field_type, label = :label, placeholder = :placeholder, options = :options, is_required = :is_required, help_text = :help_text, conditional_parent_field_id = :conditional_parent_field_id, conditional_parent_value = :conditional_parent_value
                     WHERE id = :id'
                );
                $stmt->execute([
                    ':field_type' => $fieldType,
                    ':label' => $label,
                    ':placeholder' => $placeholder,
                    ':options' => $optionsJson,
                    ':is_required' => $isRequired,
                    ':help_text' => $helpText,
                    ':conditional_parent_field_id' => $conditionalParentFieldId,
                    ':conditional_parent_value' => $conditionalParentValue,
                    ':id' => $fieldId,
                ]);

                $stmt = $pdo->prepare('SELECT * FROM event_form_fields WHERE id = :id');
                $stmt->execute([':id' => $fieldId]);
                $updated = $stmt->fetch();

                json_success('Field updated successfully', $updated);
            }

            // Delete field
            if ($method === 'DELETE' && count($segments) === 5) {
                $stmt = $pdo->prepare('DELETE FROM event_form_fields WHERE id = :id');
                $stmt->execute([':id' => $fieldId]);

                json_success('Field deleted successfully', []);
            }
        }

        // Handle form responses
        if ($action === 'responses') {
            // Get all responses for a form
            if ($method === 'GET' && count($segments) === 4) {
                $responses = form_responses_by_form_id($pdo, $id);
                json_success('Responses fetched successfully', $responses);
            }

            // Get specific response details
            $responseId = isset($segments[4]) ? filter_var($segments[4], FILTER_VALIDATE_INT) : null;
            if ($responseId) {
                if ($method === 'GET' && count($segments) === 5) {
                    $response = response_details_by_id($pdo, $responseId);
                    if (!$response) {
                        json_error('Response not found', [], 404);
                    }
                    json_success('Response fetched successfully', $response);
                }

                // Delete response
                if ($method === 'DELETE' && count($segments) === 5) {
                    $stmt = $pdo->prepare('DELETE FROM event_form_responses WHERE id = :id AND form_id = :form_id');
                    $stmt->execute([':id' => $responseId, ':form_id' => $id]);
                    json_success('Response deleted successfully', []);
                }
            }
        }
    }

    not_found('Event form endpoint not found');
    return true;
}
