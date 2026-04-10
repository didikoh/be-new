<?php

namespace App\Controllers;

use App\Services\StudentService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class StudentController extends Controller
{
    private StudentService $service;

    public function __construct(StudentService $service)
    {
        $this->service = $service;
    }

    public function cards(Request $request, Response $response, array $args): Response
    {
        $studentId = (int) ($args['id'] ?? 0);
        $result = $this->service->getCards($studentId);
        return $this->respond($response, $result);
    }
}
