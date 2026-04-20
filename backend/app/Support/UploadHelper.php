<?php

namespace App\Support;

use Psr\Http\Message\UploadedFileInterface;

class UploadHelper
{
    public static function store(UploadedFileInterface $file): string
    {
        $uploadDir = env('UPLOAD_DIR', '');

        if ($uploadDir === '' || !self::isAbsolutePath($uploadDir)) {
            // Resolve relative to the project root (two levels above app/Support/)
            $projectRoot = dirname(__DIR__, 2);
            $uploadDir = $uploadDir !== ''
                ? $projectRoot . DIRECTORY_SEPARATOR . ltrim($uploadDir, '/\\')
                : $projectRoot . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'uploads';
        }

        $publicPrefix = env('UPLOAD_PUBLIC_PATH', 'uploads');

        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0777, true) && !is_dir($uploadDir)) {
                throw new \RuntimeException("Failed to create upload directory: {$uploadDir}");
            }
        }

        if (!is_writable($uploadDir)) {
            throw new \RuntimeException("Upload directory is not writable: {$uploadDir}");
        }

        $clientName = $file->getClientFilename() ?? 'file';
        $safeName = preg_replace('/[^A-Za-z0-9_.-]/', '_', $clientName);
        $filename = time() . '_' . $safeName;
        $targetPath = rtrim($uploadDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $filename;
        $file->moveTo($targetPath);

        return rtrim($publicPrefix, '/') . '/' . $filename;
    }

    private static function isAbsolutePath(string $path): bool
    {
        if (DIRECTORY_SEPARATOR === '/') {
            return str_starts_with($path, '/');
        }
        // Windows: C:\ or C:/
        return (bool) preg_match('/^[A-Za-z]:[\/\\\\]/', $path);
    }
}
