<?php

namespace App\Controllers;

use App\Support\ResponseHelper;
use Psr\Http\Message\ResponseInterface as Response;

abstract class Controller
{
    protected function respond(Response $response, array $result): Response
    {
        $success = $result['success'] ?? false;
        $message = $result['message'] ?? ($success ? 'OK' : 'Request failed');
        $status = $result['status'] ?? ($success ? 200 : 400);
        $data = $result['data'] ?? null;
        $errors = $result['errors'] ?? null;

        if ($success) {
            return ResponseHelper::success($response, $message, $data, $status);
        }

        return ResponseHelper::error($response, $message, $errors, $status);
    }
}
