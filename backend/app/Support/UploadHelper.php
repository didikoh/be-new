<?php

namespace App\Support;

use Psr\Http\Message\UploadedFileInterface;

class UploadHelper
{
    public static function store(UploadedFileInterface $file): string
    {
        $uploadDir = env('UPLOAD_DIR', 'public/uploads');
        $publicPrefix = env('UPLOAD_PUBLIC_PATH', 'uploads');

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $clientName = $file->getClientFilename() ?? 'file';
        $safeName = preg_replace('/[^A-Za-z0-9_.-]/', '_', $clientName);
        $filename = time() . '_' . $safeName;
        $targetPath = rtrim($uploadDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $filename;
        $file->moveTo($targetPath);

        return rtrim($publicPrefix, '/') . '/' . $filename;
    }
}
