<?php

namespace App\Support;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Exception\HttpException;
use Throwable;

class JsonErrorHandler
{
    private ResponseFactoryInterface $responseFactory;

    public function __construct(ResponseFactoryInterface $responseFactory)
    {
        $this->responseFactory = $responseFactory;
    }

    public function __invoke(
        Request $request,
        Throwable $exception,
        bool $displayErrorDetails,
        bool $logErrors,
        bool $logErrorDetails
    ): Response {
        $status = 500;
        $message = 'Server error';

        if ($exception instanceof HttpException) {
            $status = $exception->getStatusCode();
            $message = $exception->getMessage();
        }

        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($displayErrorDetails) {
            $payload['errors'] = [
                'type' => get_class($exception),
                'detail' => $exception->getMessage(),
            ];
        }

        $response = $this->responseFactory->createResponse($status);
        $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_UNICODE));

        return $response->withHeader('Content-Type', 'application/json');
    }
}
