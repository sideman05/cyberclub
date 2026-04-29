<?php

declare(strict_types=1);

function upload_image(string $fieldName, string $folder): array
{
    if (!isset($_FILES[$fieldName]) || $_FILES[$fieldName]['error'] === UPLOAD_ERR_NO_FILE) {
        return ['success' => true, 'path' => null, 'error' => null];
    }

    $file = $_FILES[$fieldName];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'path' => null, 'error' => 'Image upload failed.'];
    }

    $maxBytes = 5 * 1024 * 1024;
    if ((int) $file['size'] > $maxBytes) {
        return ['success' => false, 'path' => null, 'error' => 'Image must be 5MB or smaller.'];
    }

    $tmpName = $file['tmp_name'];
    if (!is_uploaded_file($tmpName) || getimagesize($tmpName) === false) {
        return ['success' => false, 'path' => null, 'error' => 'Uploaded file must be a valid image.'];
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = $finfo ? finfo_file($finfo, $tmpName) : '';
    if ($finfo) {
        finfo_close($finfo);
    }

    $extensions = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];

    if (!isset($extensions[$mimeType])) {
        return ['success' => false, 'path' => null, 'error' => 'Only JPG, PNG, WEBP, and GIF images are allowed.'];
    }

    $allowedFolders = ['blogs', 'leaders', 'gallery', 'events'];
    if (!in_array($folder, $allowedFolders, true)) {
        return ['success' => false, 'path' => null, 'error' => 'Invalid upload folder.'];
    }

    $uploadRoot = dirname(__DIR__) . '/uploads';
    $targetDir = "{$uploadRoot}/{$folder}";
    if (!is_dir($targetDir) && !mkdir($targetDir, 0755, true)) {
        return ['success' => false, 'path' => null, 'error' => 'Unable to prepare upload directory.'];
    }

    if (!is_writable($targetDir)) {
        return ['success' => false, 'path' => null, 'error' => 'Upload directory is not writable by the web server.'];
    }

    $fileName = bin2hex(random_bytes(16)) . '.' . $extensions[$mimeType];
    $targetPath = "{$targetDir}/{$fileName}";

    if (!move_uploaded_file($tmpName, $targetPath)) {
        return ['success' => false, 'path' => null, 'error' => 'Unable to save uploaded image.'];
    }

    return ['success' => true, 'path' => "uploads/{$folder}/{$fileName}", 'error' => null];
}

function delete_uploaded_image(?string $relativePath): void
{
    if ($relativePath === null || $relativePath === '') {
        return;
    }

    $uploadRoot = realpath(dirname(__DIR__) . '/uploads');
    if ($uploadRoot === false) {
        return;
    }

    $candidate = realpath(dirname(__DIR__) . '/' . ltrim($relativePath, '/'));
    if ($candidate === false || !str_starts_with($candidate, $uploadRoot)) {
        return;
    }

    if (is_file($candidate)) {
        unlink($candidate);
    }
}
