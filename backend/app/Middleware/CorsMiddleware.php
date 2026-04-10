<?php

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as Handler;
use Slim\Psr7\Response as SlimResponse;

class CorsMiddleware
{
    private array $allowedOrigins;
    private bool $allowCredentials;

    public function __construct()
    {
        $origins = env('CORS_ALLOWED_ORIGINS', '');
        $this->allowedOrigins = array_filter(array_map('trim', explode(',', $origins)));
        $this->allowCredentials = (bool) env('CORS_ALLOW_CREDENTIALS', true);
    }

    public function __invoke(Request $request, Handler $handler): Response
    {
        $origin = $request->getHeaderLine('Origin');
        $isAllowed = $origin && (in_array('*', $this->allowedOrigins, true) || in_array($origin, $this->allowedOrigins, true));

        if ($request->getMethod() === 'OPTIONS') {
            $response = new SlimResponse(204);
            return $this->withCorsHeaders($response, $origin, $isAllowed)->withStatus(204);
        }

        $response = $handler->handle($request);
        return $this->withCorsHeaders($response, $origin, $isAllowed);
    }

    private function withCorsHeaders(Response $response, string $origin, bool $isAllowed): Response
    {
        if ($isAllowed) {
            $response = $response->withHeader('Access-Control-Allow-Origin', $origin);
            if ($this->allowCredentials) {
                $response = $response->withHeader('Access-Control-Allow-Credentials', 'true');
            }
        }

        return $response
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
            ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
}
