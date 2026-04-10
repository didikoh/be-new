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

        $profilePicPath = $body['profile_pic'] ?? null;

        $uploadedFiles = $request->getUploadedFiles();
        if (isset($uploadedFiles['profile_pic']) && $uploadedFiles['profile_pic']->getError() === UPLOAD_ERR_OK) {
            $profilePicPath = UploadHelper::store($uploadedFiles['profile_pic']);
        }

        $result = $this->service->register($body, $profilePicPath);
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
