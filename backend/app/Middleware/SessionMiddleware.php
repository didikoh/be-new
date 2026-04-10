<?php

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as Handler;

class SessionMiddleware
{
    public function __invoke(Request $request, Handler $handler): Response
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            $lifetime = (int) env('SESSION_LIFETIME', 2592000);
            $cookieLifetime = (int) env('SESSION_COOKIE_LIFETIME', 2592000);

            ini_set('session.gc_maxlifetime', (string) $lifetime);
            ini_set('session.cookie_lifetime', (string) $cookieLifetime);

            session_start();
        }

        return $handler->handle($request);
    }
}
