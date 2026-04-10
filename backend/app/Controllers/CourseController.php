<?php

namespace App\Controllers;

use App\Services\CourseService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class CourseController extends Controller
{
    private CourseService $service;

    public function __construct(CourseService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request, Response $response): Response
    {
        $courses = $this->service->listRecent();
        return $this->respond($response, [
            'success' => true,
            'message' => 'Courses loaded',
            'data' => ['courses' => $courses],
        ]);
    }

    public function show(Request $request, Response $response, array $args): Response
    {
        $courseId = (int) ($args['id'] ?? 0);
        if ($courseId <= 0) {
            return $this->respond($response, [
                'success' => false,
                'message' => 'Missing course ID',
                'status' => 422,
            ]);
        }

        $query = $request->getQueryParams();
        $studentId = isset($query['student_id']) ? (int) $query['student_id'] : null;

        $result = $this->service->getDetail($courseId, $studentId);
        return $this->respond($response, $result);
    }
}
