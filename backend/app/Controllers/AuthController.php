<?php

namespace App\Controllers;

use App\Services\AuthService;
use App\Support\UploadHelper;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AuthController extends Controller
{
    private AuthService $service;

    public function __construct(AuthService $service)
    {
        $this->service = $service;
    }

    public function login(Request $request, Response $response): Response
    {
        $body = array_trim((array) $request->getParsedBody());
        $phone = $body['phone'] ?? '';
        $password = $body['password'] ?? '';

        if ($phone === '' || $password === '') {
            return $this->respond($response, [
                'success' => false,
                'message' => 'Please provide phone number and password',
                'status' => 422,
            ]);
        }

        $result = $this->service->login($phone, $password);
        return $this->respond($response, $result);
    }

    public function register(Request $request, Response $response): Response
    {
        $body = array_trim((array) $request->getParsedBody());

        $required = ['name', 'phone', 'birthday', 'password'];
        foreach ($required as $field) {
            if (!isset($body[$field]) || $body[$field] === '') {
                return $this->respond($response, [
                    'success' => false,
                    'message' => "Missing required field: {$field}",
                    'status' => 422,
                ]);
            }
        }

        $profilePicPath = null;

        $uploadedFiles = $request->getUploadedFiles();
        error_log('[register] Content-Type: ' . $request->getHeaderLine('Content-Type'));
        error_log('[register] uploaded file keys: ' . implode(', ', array_keys($uploadedFiles)));

        if (isset($uploadedFiles['profile_pic'])) {
            $file = $uploadedFiles['profile_pic'];
            $uploadError = $file->getError();
            error_log('[register] profile_pic error code: ' . $uploadError);

            if ($uploadError !== UPLOAD_ERR_OK) {
                $uploadErrorMessages = [
                    UPLOAD_ERR_INI_SIZE   => 'File exceeds the server upload size limit (upload_max_filesize)',
                    UPLOAD_ERR_FORM_SIZE  => 'File exceeds the form upload size limit',
                    UPLOAD_ERR_PARTIAL    => 'File was only partially uploaded',
                    UPLOAD_ERR_NO_FILE    => 'No file was received',
                    UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary upload folder on server',
                    UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                    UPLOAD_ERR_EXTENSION  => 'Upload blocked by a PHP extension',
                ];
                $errorMessage = $uploadErrorMessages[$uploadError] ?? "Avatar upload failed (PHP error code {$uploadError})";
                return $this->respond($response, [
                    'success' => false,
                    'message' => $errorMessage,
                    'status' => 422,
                ]);
            }

            try {
                $profilePicPath = UploadHelper::store($file);
                error_log('[register] avatar saved to: ' . $profilePicPath);
            } catch (\Throwable $e) {
                error_log('[register] UploadHelper::store failed: ' . $e->getMessage());
                return $this->respond($response, [
                    'success' => false,
                    'message' => 'Avatar upload failed: ' . $e->getMessage(),
                    'status' => 500,
                ]);
            }
        } else {
            error_log('[register] no profile_pic in uploaded files — registering without avatar');
        }

        try {
            $result = $this->service->register($body, $profilePicPath);
        } catch (\Throwable $e) {
            return $this->respond($response, [
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage(),
                'status' => 500,
            ]);
        }

        return $this->respond($response, $result);
    }

    public function check(Request $request, Response $response): Response
    {
        $result = $this->service->check();
        return $this->respond($response, $result);
    }

    public function logout(Request $request, Response $response): Response
    {
        $result = $this->service->logout();
        return $this->respond($response, $result);
    }
}
