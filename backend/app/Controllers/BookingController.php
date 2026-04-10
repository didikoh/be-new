<?php

namespace App\Controllers;

use App\Services\BookingService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class BookingController extends Controller
{
    private BookingService $service;

    public function __construct(BookingService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request, Response $response): Response
    {
        $bookings = $this->service->listRecent();
        return $this->respond($response, [
            'success' => true,
            'message' => 'Bookings loaded',
            'data' => ['bookings' => $bookings],
        ]);
    }

    public function store(Request $request, Response $response): Response
    {
        $body = array_trim((array) $request->getParsedBody());
        $result = $this->service->create($body);
        return $this->respond($response, $result);
    }

    public function storeFrozen(Request $request, Response $response): Response
    {
        $body = array_trim((array) $request->getParsedBody());
        $result = $this->service->createWithFrozenPrice($body);
        return $this->respond($response, $result);
    }
}
