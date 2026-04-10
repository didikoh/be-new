<?php

namespace App\Controllers;

use App\Services\ProfileService;
use App\Support\UploadHelper;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ProfileController extends Controller
{
    private ProfileService $service;

    public function __construct(ProfileService $service)
    {
        $this->service = $service;
    }

    public function update(Request $request, Response $response): Response
    {
        $body = array_trim((array) $request->getParsedBody());
        $userId = (int) ($body['user_id'] ?? ($_SESSION['user']['user_id'] ?? 0));
        $role = (string) ($body['role'] ?? ($_SESSION['user']['role'] ?? 'student'));
        $name = (string) ($body['name'] ?? '');
        $birthday = (string) ($body['birthday'] ?? '');

        $profilePicPath = $body['profile_pic'] ?? null;

        $uploadedFiles = $request->getUploadedFiles();
        if (isset($uploadedFiles['profile_pic']) && $uploadedFiles['profile_pic']->getError() === UPLOAD_ERR_OK) {
            $profilePicPath = UploadHelper::store($uploadedFiles['profile_pic']);
        }

        $result = $this->service->update($userId, $role, $name, $birthday, $profilePicPath);
        return $this->respond($response, $result);
    }

    public function changePassword(Request $request, Response $response): Response
    {
        $body = array_trim((array) $request->getParsedBody());
        $userId = (int) ($body['user_id'] ?? ($_SESSION['user']['user_id'] ?? 0));
        $oldPassword = (string) ($body['password_old'] ?? '');
        $newPassword = (string) ($body['password_new'] ?? '');

        $result = $this->service->changePassword($userId, $oldPassword, $newPassword);
        return $this->respond($response, $result);
    }

    public function adminChangePassword(Request $request, Response $response): Response
    {
        $body = array_trim((array) $request->getParsedBody());
        $userId = (int) ($body['user_id'] ?? 0);
        $newPassword = (string) ($body['password_new'] ?? '');

        $result = $this->service->adminChangePassword($userId, $newPassword);
        return $this->respond($response, $result);
    }
}
