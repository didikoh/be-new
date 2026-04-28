<?php

namespace App\Controllers;

use App\Services\AdminService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AdminController extends Controller
{
    private AdminService $service;

    public function __construct(AdminService $service)
    {
        $this->service = $service;
    }

    public function home(Request $request, Response $response): Response
    {
        return $this->respond($response, $this->service->homeStats());
    }

    public function courses(Request $request, Response $response): Response
    {
        $query = $request->getQueryParams();
        return $this->respond($response, $this->service->listCourses($query));
    }

    public function saveCourse(Request $request, Response $response): Response
    {
        $body = array_trim((array) $request->getParsedBody());
        return $this->respond($response, $this->service->saveCourse($body));
    }

    public function createCourse(Request $request, Response $response): Response
    {
        $body = array_trim((array) $request->getParsedBody());
        return $this->respond($response, $this->service->saveCourse($body));
    }

    public function updateCourse(Request $request, Response $response, array $args): Response
    {
        $body = array_trim((array) $request->getParsedBody());
        $body['id'] = (int) ($args['id'] ?? 0);
        return $this->respond($response, $this->service->saveCourse($body));
    }

    public function deleteCourse(Request $request, Response $response, array $args): Response
    {
        $courseId = (int) ($args['id'] ?? 0);
        return $this->respond($response, $this->service->deleteCourse($courseId));
    }

    public function cancelCourse(Request $request, Response $response, array $args): Response
    {
        $courseId = (int) ($args['id'] ?? 0);
        return $this->respond($response, $this->service->removeCourse($courseId));
    }

    public function startCourse(Request $request, Response $response, array $args): Response
    {
        $courseId = (int) ($args['id'] ?? 0);
        return $this->respond($response, $this->service->startCourse($courseId));
    }

    public function courseTypes(Request $request, Response $response): Response
    {
        return $this->respond($response, $this->service->listCourseTypes());
    }

    public function coaches(Request $request, Response $response): Response
    {
        return $this->respond($response, $this->service->listCoaches());
    }

    public function coachCourses(Request $request, Response $response, array $args): Response
    {
        $query = $request->getQueryParams();
        $year = (string) ($query['year'] ?? date('Y'));
        $month = (string) ($query['month'] ?? date('m'));
        $coachId = (int) ($args['id'] ?? 0);

        return $this->respond($response, $this->service->coachCourses($coachId, $year, $month));
    }

    public function students(Request $request, Response $response): Response
    {
        $query = $request->getQueryParams();
        return $this->respond($response, $this->service->listStudents($query));
    }

    public function studentLookup(Request $request, Response $response): Response
    {
        $body = array_trim((array) $request->getParsedBody());
        $phone = (string) ($body['phone'] ?? '');
        return $this->respond($response, $this->service->lookupStudentName($phone));
    }

    public function transactions(Request $request, Response $response): Response
    {
        $query  = $request->getQueryParams();
        $body   = array_trim((array) $request->getParsedBody());
        $params = array_merge($body, $query); // query params take precedence

        return $this->respond($response, $this->service->listTransactions($params));
    }

    public function updateTransactionPayment(Request $request, Response $response, array $args): Response
    {
        $body = array_trim((array) $request->getParsedBody());
        $payment = $body['payment'] ?? null;
        $transactionId = (int) ($args['id'] ?? 0);

        return $this->respond($response, $this->service->updateTransactionPayment($transactionId, $payment));
    }

    public function topup(Request $request, Response $response): Response
    {
        $body = array_trim((array) $request->getParsedBody());
        return $this->respond($response, $this->service->topup($body));
    }

    public function purchase(Request $request, Response $response): Response
    {
        $body = array_trim((array) $request->getParsedBody());
        return $this->respond($response, $this->service->purchase($body));
    }

    public function bookByPhone(Request $request, Response $response): Response
    {
        $body = array_trim((array) $request->getParsedBody());
        return $this->respond($response, $this->service->bookByPhone($body));
    }

    public function walkIn(Request $request, Response $response): Response
    {
        $body = array_trim((array) $request->getParsedBody());
        return $this->respond($response, $this->service->walkIn($body));
    }

    public function cancelBooking(Request $request, Response $response, array $args): Response
    {
        $bookingId = (int) ($args['id'] ?? 0);
        return $this->respond($response, $this->service->cancelBooking($bookingId));
    }

    public function saveUser(Request $request, Response $response): Response
    {
        $body = array_trim((array) $request->getParsedBody());
        return $this->respond($response, $this->service->saveUser($body));
    }

    public function createUser(Request $request, Response $response): Response
    {
        $body = array_trim((array) $request->getParsedBody());
        return $this->respond($response, $this->service->createUser($body));
    }

    public function updateUser(Request $request, Response $response, array $args): Response
    {
        $body = array_trim((array) $request->getParsedBody());
        $id = (int) ($args['id'] ?? 0);
        return $this->respond($response, $this->service->updateUser($id, $body));
    }

    public function deleteUser(Request $request, Response $response, array $args): Response
    {
        $query = $request->getQueryParams();
        $role = (string) ($query['role'] ?? '');
        $userId = (int) ($args['id'] ?? 0);

        return $this->respond($response, $this->service->deleteUser($userId, $role));
    }

    public function invoice(Request $request, Response $response, array $args): Response
    {
        $transactionId = (int) ($args['id'] ?? 0);
        $result = $this->service->getInvoiceData($transactionId);

        if (!($result['success'] ?? false)) {
            return $this->respond($response, $result);
        }

        $transaction = $result['data']['transaction'] ?? [];
        $pdfContent = $this->service->renderInvoicePdf($transaction);

        $filename = 'invoice-' . ($transaction['id'] ?? $transactionId) . '.pdf';
        $response->getBody()->write($pdfContent);

        return $response
            ->withHeader('Content-Type', 'application/pdf')
            ->withHeader('Content-Disposition', 'inline; filename="' . $filename . '"');
    }
}
