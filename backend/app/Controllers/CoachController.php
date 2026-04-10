<?php

namespace App\Controllers;

use App\Services\CoachService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class CoachController extends Controller
{
    private CoachService $service;

    public function __construct(CoachService $service)
    {
        $this->service = $service;
    }

    public function overview(Request $request, Response $response, array $args): Response
    {
        $coachId = (int) ($args['id'] ?? 0);
        return $this->respond($response, $this->service->overview($coachId));
    }

    public function courseDetail(Request $request, Response $response, array $args): Response
    {
        $courseId = (int) ($args['id'] ?? 0);
        return $this->respond($response, $this->service->courseDetail($courseId));
    }
}
