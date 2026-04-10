<?php

namespace App\Support;

use Psr\Http\Message\ResponseInterface as Response;

class ResponseHelper
{
    public static function json(Response $response, array $payload, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_UNICODE));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }

    public static function success(Response $response, string $message, $data = null, int $status = 200): Response
    {
        $payload = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $payload['data'] = $data;
        }

        return self::json($response, $payload, $status);
    }

    public static function error(Response $response, string $message, array $errors = null, int $status = 400): Response
    {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return self::json($response, $payload, $status);
    }
}
