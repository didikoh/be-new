<?php

namespace App\Middleware;

use App\Support\ResponseHelper;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as Handler;

class AuthMiddleware
{
    private ResponseFactoryInterface $responseFactory;
    private ?string $role;

    public function __construct(ResponseFactoryInterface $responseFactory, ?string $role = null)
    {
        $this->responseFactory = $responseFactory;
        $this->role = $role;
    }

    public function __invoke(Request $request, Handler $handler): Response
    {
        if (!isset($_SESSION['user'])) {
            $response = $this->responseFactory->createResponse(401);
            return ResponseHelper::error($response, 'Unauthorized', null, 401);
        }

        if ($this->role !== null && ($_SESSION['user']['role'] ?? null) !== $this->role) {
            $response = $this->responseFactory->createResponse(403);
            return ResponseHelper::error($response, 'Forbidden', null, 403);
        }

        return $handler->handle($request);
    }
}
