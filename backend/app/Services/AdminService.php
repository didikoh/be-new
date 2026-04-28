<?php

namespace App\Services;

use App\Models\Coach;
use App\Models\CourseBooking;
use App\Models\CourseSession;
use App\Models\Student;
use App\Models\Transaction;
use App\Models\User;
use App\Models\UserCard;
use Illuminate\Database\Capsule\Manager as Capsule;
use TCPDF;

class AdminInvoicePdf extends TCPDF
{
    public function Header(): void
    {
        $this->SetDrawColor(44, 62, 153);
        $this->SetLineWidth(2);
        $this->Line(10, 15, 200, 15);
    }

    public function Footer(): void
    {
        $this->SetY(-15);
        $this->SetFont('helvetica', '', 10);
        $this->SetTextColor(128, 128, 128);
        $this->Cell(0, 10, 'This is computer-generated document. No signature is required', 0, false, 'L');
    }
}

class AdminService
{
    private BookingService $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    public function homeStats(): array
    {
        $today = date('Y-m-d');

        $userCount = Student::query()->count();
        $memberCount = Student::query()->where('is_member', 1)->count();

        $bookingCount = Capsule::table('course_session as c')
            ->leftJoin('course_booking as b', 'c.id', '=', 'b.course_id')
            ->whereDate('c.start_time', $today)
            ->where('b.status', '!=', 'cancelled')
            ->sum('b.head_count');

        $totalAmount = Capsule::table('transaction_list')
            ->where('type', 'payment')
            ->whereDate('time', $today)
            ->sum('amount');

        return [
            'success' => true,
            'data' => [
                'user_count' => (int) $userCount,
                'member_count' => (int) $memberCount,
                'booking_count' => (int) $bookingCount,
                'total_amount' => (int) $totalAmount,
            ],
        ];
    }

    private function parsePaginationParams(array $params): array
    {
        $page    = max(1, (int) ($params['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($params['per_page'] ?? 10)));
        $search  = trim((string) ($params['search'] ?? ''));

        return [$page, $perPage, $search];
    }

    private function buildPagination(int $total, int $page, int $perPage): array
    {
        $totalPages = $perPage > 0 ? (int) ceil($total / $perPage) : 1;

        return [
            'page'        => $page,
            'per_page'    => $perPage,
            'total'       => $total,
            'total_pages' => $totalPages,
            'has_next'    => $page < $totalPages,
            'has_prev'    => $page > 1,
        ];
    }

    public function listCourses(array $params = []): array
    {
        [$page, $perPage, $search] = $this->parsePaginationParams($params);
        $date   = trim((string) ($params['date'] ?? ''));
        $offset = ($page - 1) * $perPage;

        $query = Capsule::table('course_session as c')
            ->leftJoin('coach_list as co', 'c.coach_id', '=', 'co.id')
            ->leftJoin(
                Capsule::raw('(SELECT course_id, SUM(head_count) AS booking_count FROM course_booking WHERE status != \'cancelled\' GROUP BY course_id) AS b'),
                'c.id', '=', 'b.course_id'
            )
            ->where('c.state', '!=', -1)
            ->select('c.*', 'co.name as coach_name', Capsule::raw('IFNULL(b.booking_count, 0) AS booking_count'));

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('c.name', 'like', "%{$search}%")
                  ->orWhere('co.name', 'like', "%{$search}%");
            });
        }

        if ($date !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            $query->whereDate('c.start_time', $date);
        }

        $total   = $query->count();
        $courses = $query->orderBy('c.start_time', 'desc')
            ->offset($offset)
            ->limit($perPage)
            ->get();

        return [
            'success' => true,
            'data'    => [
                'items'      => $courses->toArray(),
                'pagination' => $this->buildPagination($total, $page, $perPage),
            ],
        ];
    }

    public function saveCourse(array $payload): array
    {
        $id = $payload['id'] ?? null;
        $delete = $payload['delete'] ?? 'false';

        if ($delete === 'true') {
            if (!$id) {
                return ['success' => false, 'message' => 'Missing course id', 'status' => 422];
            }

            CourseSession::query()->where('id', $id)->update(['state' => -1]);

            return ['success' => true, 'message' => 'Course deleted'];
        }

        $name = $payload['name'] ?? '';
        $coursePic = $payload['course_pic'] ?? '';
        $price = $payload['price'] ?? 0;
        $priceM = $payload['price_m'] ?? 0;
        $minBook = $payload['min_book'] ?? 0;
        $coachId = $payload['coach_id'] ?? '';
        $time = $payload['start_time'] ?? '';
        $duration = $payload['duration'] ?? 0;
        $location = $payload['location'] ?? null;

        if ($time === '') {
            return ['success' => false, 'message' => 'Missing start_time', 'status' => 422];
        }

        $startTime = date('Y-m-d H:i:s', strtotime($time));

        $data = [
            'name' => $name,
            'course_pic' => $coursePic,
            'price' => $price,
            'price_m' => $priceM,
            'min_book' => $minBook,
            'coach_id' => $coachId,
            'start_time' => $startTime,
            'duration' => $duration,
            'location' => $location,
        ];

        if ($id === null || $id === '' || $id === 'null') {
            CourseSession::query()->create($data);
            return ['success' => true, 'message' => 'Course created'];
        }

        CourseSession::query()->where('id', $id)->update($data);

        return ['success' => true, 'message' => 'Course updated'];
    }

    public function deleteCourse(int $courseId): array
    {
        if ($courseId <= 0) {
            return ['success' => false, 'message' => 'Missing course id', 'status' => 422];
        }

        CourseSession::query()->where('id', $courseId)->update(['state' => -1]);

        return ['success' => true, 'message' => 'Course deleted'];
    }

    public function removeCourse(int $courseId): array
    {
        if ($courseId <= 0) {
            return ['success' => false, 'message' => 'Missing course id', 'status' => 422];
        }

        return Capsule::connection()->transaction(function () use ($courseId) {
            $bookingCount = CourseBooking::query()
                ->where('course_id', $courseId)
                ->where('status', '!=', 'cancelled')
                ->count();

            if ($bookingCount > 0) {
                return ['success' => false, 'message' => 'Course has bookings and cannot be cancelled', 'status' => 409];
            }

            CourseSession::query()
                ->where('id', $courseId)
                ->where('state', 0)
                ->update(['state' => -1]);

            return ['success' => true, 'message' => 'Course cancelled'];
        });
    }

    public function startCourse(int $courseId): array
    {
        if ($courseId <= 0) {
            return ['success' => false, 'message' => 'Missing course id', 'status' => 422];
        }

        return Capsule::connection()->transaction(function () use ($courseId) {
            $session = Capsule::table('course_session')
                ->where('id', $courseId)
                ->where('state', 0)
                ->lockForUpdate()
                ->first();

            if (!$session) {
                return ['success' => false, 'message' => 'Course not found or already started', 'status' => 404];
            }

            $price = (float) $session->price_m;
            $priceNormal = (float) $session->price;

            $bookings = Capsule::table('course_booking')
                ->where('course_id', $courseId)
                ->where('status', '!=', 'cancelled')
                ->lockForUpdate()
                ->get();

            foreach ($bookings as $booking) {
                $studentId = (int) $booking->student_id;
                $headCount = (int) $booking->head_count;
                $bookingId = (int) $booking->id;

                if ($studentId !== 1) {
                    $frozenReduce = $price * $headCount;

                    Capsule::table('user_cards')
                        ->where('student_id', $studentId)
                        ->update([
                            'frozen_balance' => Capsule::raw('frozen_balance - ' . $frozenReduce),
                            'balance' => Capsule::raw('balance - ' . $frozenReduce),
                        ]);

                    Capsule::table('student_list')
                        ->where('id', $studentId)
                        ->update([
                            'point' => Capsule::raw('point + ' . $price),
                        ]);

                    $description = "Course attended, points awarded. Price: {$price}";

                    Transaction::query()->create([
                        'student_id' => $studentId,
                        'type' => 'payment',
                        'amount' => $frozenReduce,
                        'point' => $price,
                        'description' => $description,
                        'head_count' => $headCount,
                        'course_id' => $courseId,
                    ]);

                    CourseBooking::query()->where('id', $bookingId)->update(['status' => 'paid']);
                } else {
                    $frozenNormal = $priceNormal * $headCount;
                    $description = "Course attended, points awarded. Price: {$priceNormal}";

                    Transaction::query()->create([
                        'student_id' => $studentId,
                        'type' => 'payment',
                        'amount' => $frozenNormal,
                        'point' => $priceNormal,
                        'description' => $description,
                        'head_count' => $headCount,
                        'course_id' => $courseId,
                    ]);

                    CourseBooking::query()->where('id', $bookingId)->update(['status' => 'paid']);
                }
            }

            CourseSession::query()->where('id', $courseId)->update(['state' => 1]);

            return ['success' => true, 'message' => 'Course started and bookings processed'];
        });
    }

    public function listCourseTypes(): array
    {
        $types = Capsule::table('course_type')->get();

        return [
            'success' => true,
            'data' => [
                'course_types' => $types->toArray(),
            ],
        ];
    }

    public function listCoaches(): array
    {
        $monthStart = date('Y-m-01 00:00:00');
        $monthEnd = date('Y-m-t 23:59:59');

        $coaches = Capsule::table('coach_list as c')
            ->leftJoin('user_list as u', 'c.user_id', '=', 'u.id')
            ->where('u.state', '!=', -1)
            ->orderBy('c.id', 'desc')
            ->select('c.*')
            ->get();

        $result = [];
        foreach ($coaches as $coach) {
            $coachId = (int) $coach->id;

            $courseIds = Capsule::table('course_session')
                ->where('coach_id', $coachId)
                ->whereBetween('start_time', [$monthStart, $monthEnd])
                ->pluck('id')
                ->toArray();

            $coach->month_course_count = count($courseIds);

            if (count($courseIds) > 0) {
                $studentCount = Capsule::table('course_booking')
                    ->whereIn('course_id', $courseIds)
                    ->where('status', '!=', 'cancelled')
                    ->where('status', '!=', 'absent')
                    ->distinct('student_id')
                    ->count('student_id');

                $coach->month_student_count = (int) $studentCount;
            } else {
                $coach->month_student_count = 0;
            }

            $result[] = (array) $coach;
        }

        return [
            'success' => true,
            'data' => $result,
        ];
    }
    public function coachCourses(int $coachId, string $year, string $month): array
    {
        if ($coachId <= 0) {
            return ['success' => false, 'message' => 'Missing coach_id', 'status' => 422];
        }

        $monthStart = date('Y-m-01 00:00:00', strtotime("{$year}-{$month}-01"));
        $monthEnd = date('Y-m-t 23:59:59', strtotime("{$year}-{$month}-01"));

        $courses = Capsule::table('course_session')
            ->where('coach_id', $coachId)
            ->whereBetween('start_time', [$monthStart, $monthEnd])
            ->orderBy('start_time', 'asc')
            ->select('id', 'name', 'start_time')
            ->get();

        $coursesArr = [];
        foreach ($courses as $course) {
            $studentCount = Capsule::table('course_booking')
                ->where('course_id', $course->id)
                ->where('status', '!=', 'cancelled')
                ->where('status', '!=', 'absent')
                ->sum('head_count');

            $course->student_count = (int) $studentCount;
            $coursesArr[] = (array) $course;
        }

        return [
            'success' => true,
            'data' => [
                'year' => $year,
                'month' => $month,
                'courses' => $coursesArr,
            ],
        ];
    }

    public function listStudents(array $params = []): array
    {
        [$page, $perPage, $search] = $this->parsePaginationParams($params);
        $searchBy = trim((string) ($params['search_by'] ?? ''));
        $offset   = ($page - 1) * $perPage;

        $query = Capsule::table('student_list as s')
            ->leftJoin('user_list as u', 's.user_id', '=', 'u.id')
            ->leftJoin('user_cards as c', 's.id', '=', 'c.student_id')
            ->leftJoin('card_types as t', 'c.card_type_id', '=', 't.id')
            ->where('u.state', '!=', -1)
            ->select(
                's.*',
                'u.id as user_id',
                'u.phone as user_phone',
                'u.state as user_state',
                'c.id as card_id',
                'c.card_type_id',
                't.name as card_type_name',
                'c.balance',
                'c.frozen_balance',
                'c.expired_balance',
                'c.status as card_status',
                'c.valid_balance_to',
                'c.valid_from',
                'c.valid_to',
                'c.created_at as card_created_at',
                'c.updated_at as card_updated_at'
            );

        if ($search !== '') {
            if ($searchBy === 'name') {
                $query->where('s.name', 'like', "%{$search}%");
            } elseif ($searchBy === 'phone') {
                $query->where('u.phone', 'like', "%{$search}%");
            } else {
                $query->where(function ($q) use ($search) {
                    $q->where('s.name', 'like', "%{$search}%")
                      ->orWhere('u.phone', 'like', "%{$search}%");
                });
            }
        }

        $total    = $query->count();
        $students = $query->orderBy('s.name', 'asc')
            ->offset($offset)
            ->limit($perPage)
            ->get();

        return [
            'success' => true,
            'data'    => [
                'items'      => $students->toArray(),
                'pagination' => $this->buildPagination($total, $page, $perPage),
            ],
        ];
    }

    public function lookupStudentName(string $phone): array
    {
        if ($phone === '') {
            return ['success' => false, 'message' => 'Missing phone', 'status' => 422];
        }

        $student = Capsule::table('student_list as s')
            ->leftJoin('user_list as u', 's.user_id', '=', 'u.id')
            ->where('u.state', '!=', -1)
            ->where('u.phone', $phone)
            ->orderBy('s.name', 'asc')
            ->select('s.name')
            ->first();

        if (!$student) {
            return ['success' => false, 'message' => 'Student not found', 'status' => 404];
        }

        return [
            'success' => true,
            'data' => [
                'name' => $student->name,
            ],
        ];
    }

    public function listTransactions(array $params): array
    {
        [$page, $perPage, $search] = $this->parsePaginationParams($params);
        $offset = ($page - 1) * $perPage;

        $typeParam = $params['type'] ?? '';
        $type      = $typeParam === 'income' ? 'Top Up Package' : ($typeParam === 'expense' ? 'payment' : 'purchase');

        $query = Capsule::table('transaction_list as t')
            ->leftJoin('student_list as s', 't.student_id', '=', 's.id')
            ->leftJoin('course_session as c', 't.course_id', '=', 'c.id')
            ->where('t.state', '!=', -1)
            ->where('t.type', $type)
            ->select(
                't.id as transaction_id',
                't.student_id',
                's.name as student_name',
                's.phone as student_phone',
                't.type',
                't.payment',
                't.amount',
                't.point',
                't.head_count',
                't.course_id',
                't.description',
                't.time',
                'c.name as course_name',
                'c.start_time'
            );

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('s.name', 'like', "%{$search}%")
                  ->orWhere('s.phone', 'like', "%{$search}%");
            });
        }

        $total        = $query->count();
        $transactions = $query->orderBy('t.id', 'desc')
            ->offset($offset)
            ->limit($perPage)
            ->get();

        return [
            'success' => true,
            'data'    => [
                'items'      => $transactions->toArray(),
                'pagination' => $this->buildPagination($total, $page, $perPage),
            ],
        ];
    }

    public function updateTransactionPayment(int $transactionId, $payment): array
    {
        if ($transactionId <= 0 || !is_numeric($payment)) {
            return ['success' => false, 'message' => 'transaction_id and payment are required', 'status' => 422];
        }

        $updated = Transaction::query()
            ->where('id', $transactionId)
            ->update(['payment' => $payment]);

        if ($updated > 0) {
            return ['success' => true, 'message' => 'Payment updated successfully'];
        }

        return ['success' => false, 'message' => 'Transaction not found or payment is the same', 'status' => 404];
    }

    public function topup(array $payload): array
    {
        $studentId = $payload['id'] ?? null;
        $amount = $payload['amount'] ?? null;
        $validBalanceTo = $payload['valid_balance_to'] ?? null;
        $package = $payload['package'] ?? null;
        $payment = $payload['payment'] ?? null;

        if (!$studentId || $amount === null || !$validBalanceTo || $package === null || $payment === null) {
            return ['success' => false, 'message' => 'Input unmatch', 'status' => 422];
        }

        return Capsule::connection()->transaction(function () use ($studentId, $amount, $validBalanceTo, $package, $payment) {
            $description = [];

            $student = Student::query()->find($studentId);
            if (!$student) {
                return ['success' => false, 'message' => 'Student not found', 'status' => 404];
            }

            if ((int) $student->is_member === 0 && (int) $package === 1) {
                Student::query()->where('id', $studentId)->update(['is_member' => 1]);
                $description[] = 'Member activation';
            }

            $card = UserCard::query()
                ->where('student_id', $studentId)
                ->where('card_type_id', 1)
                ->first();

            if ($card) {
                $newBalance = function_exists('bcadd')
                    ? bcadd((string) $card->balance, (string) $amount, 2)
                    : ((float) $card->balance + (float) $amount);

                UserCard::query()->where('id', $card->id)->update([
                    'balance' => $newBalance,
                    'valid_balance_to' => $validBalanceTo,
                    'updated_at' => Capsule::raw('NOW()'),
                ]);

                $description[] = "Topup {$amount}";
                $cardId = $card->id;
            } else {
                $validFrom = date('Y-m-d');
                $validTo = date('Y-m-d', strtotime('+1 year'));

                $cardId = UserCard::query()->create([
                    'student_id' => $studentId,
                    'card_type_id' => 1,
                    'balance' => $amount,
                    'valid_balance_to' => $validBalanceTo,
                    'valid_from' => $validFrom,
                    'valid_to' => $validTo,
                    'status' => 1,
                    'created_at' => Capsule::raw('NOW()'),
                    'updated_at' => Capsule::raw('NOW()'),
                ])->id;

                $description[] = "Topup {$amount}";
                $description[] = 'New card issued';
            }

            Transaction::query()->create([
                'student_id' => $studentId,
                'type' => 'Top Up Package',
                'payment' => $payment,
                'amount' => $amount,
                'description' => implode('; ', $description),
            ]);

            return ['success' => true, 'message' => 'Topup success', 'data' => ['card_id' => $cardId]];
        });
    }

    public function purchase(array $payload): array
    {
        $phone = $payload['phone'] ?? null;
        $payment = (float) ($payload['payment'] ?? 0);
        $description = $payload['description'] ?? '';

        if (!$phone) {
            return ['success' => false, 'message' => 'Invalid phone', 'status' => 422];
        }

        if ($payment <= 0) {
            return ['success' => false, 'message' => 'Invalid payment amount', 'status' => 422];
        }

        return Capsule::connection()->transaction(function () use ($phone, $payment, $description) {
            $student = Student::query()->where('phone', $phone)->first();
            if (!$student) {
                return ['success' => false, 'message' => 'Student not found', 'status' => 404];
            }

            $card = Capsule::table('user_cards')
                ->where('student_id', $student->id)
                ->where('status', 1)
                ->lockForUpdate()
                ->first();

            if (!$card) {
                return ['success' => false, 'message' => 'Card not found', 'status' => 404];
            }

            $usableBalance = (float) $card->balance - (float) $card->frozen_balance;
            if ($usableBalance < $payment) {
                return ['success' => false, 'message' => 'Balance not enough', 'status' => 400];
            }

            $newBalance = (float) $card->balance - $payment;

            Capsule::table('user_cards')
                ->where('id', $card->id)
                ->update(['balance' => $newBalance]);

            Transaction::query()->create([
                'student_id' => $student->id,
                'type' => 'purchase',
                'amount' => $payment,
                'description' => $description,
            ]);

            return ['success' => true, 'message' => 'Purchase success'];
        });
    }
    public function bookByPhone(array $payload): array
    {
        $phone = $payload['phone'] ?? null;
        $courseId = (int) ($payload['course_id'] ?? 0);
        $headCount = (int) ($payload['head_count'] ?? 0);

        if (!$phone || $courseId <= 0 || $headCount <= 0) {
            return ['success' => false, 'message' => 'phone, course_id, and head_count are required', 'status' => 422];
        }

        $user = User::query()->where('phone', $phone)->where('state', '!=', -1)->first();
        if (!$user) {
            return ['success' => false, 'message' => 'User not found', 'status' => 404];
        }

        $student = Student::query()->where('user_id', $user->id)->first();
        if (!$student) {
            return ['success' => false, 'message' => 'No student found', 'status' => 404];
        }

        return $this->bookingService->create([
            'student_id' => $student->id,
            'course_id' => $courseId,
            'head_count' => $headCount,
        ]);
    }

    public function walkIn(array $payload): array
    {
        $courseId = (int) ($payload['course_id'] ?? 0);
        $headCount = (int) ($payload['head_count'] ?? 0);
        $studentId = 1;

        if ($courseId <= 0 || $headCount <= 0) {
            return ['success' => false, 'message' => 'course_id and head_count are required', 'status' => 422];
        }

        $course = CourseSession::query()
            ->select(['id', 'name', 'price', 'state'])
            ->find($courseId);

        if (!$course) {
            return ['success' => false, 'message' => 'Course not found', 'status' => 404];
        }

        $price = (float) $course->price;
        $totalPrice = $price * $headCount;

        if ((int) $course->state === 1) {
            return Capsule::connection()->transaction(function () use ($courseId, $studentId, $headCount, $course, $totalPrice, $price) {
                $bookingId = CourseBooking::query()->create([
                    'course_id' => $courseId,
                    'student_id' => $studentId,
                    'head_count' => $headCount,
                    'status' => 'paid',
                ])->id;

                $description = "Booked and paid for course {$course->name}, price: {$price}, head_count: {$headCount}";

                Transaction::query()->create([
                    'student_id' => $studentId,
                    'type' => 'payment',
                    'amount' => $totalPrice,
                    'point' => $price,
                    'description' => $description,
                    'head_count' => $headCount,
                    'course_id' => $courseId,
                ]);

                return ['success' => true, 'message' => 'Course booked and paid', 'data' => ['booking_id' => $bookingId]];
            });
        }

        CourseBooking::query()->create([
            'course_id' => $courseId,
            'student_id' => $studentId,
            'head_count' => $headCount,
        ]);

        return ['success' => true, 'message' => 'Booking successful'];
    }

    public function cancelBooking(int $bookingId): array
    {
        if ($bookingId <= 0) {
            return ['success' => false, 'message' => 'Missing booking_id', 'status' => 422];
        }

        $booking = CourseBooking::query()
            ->where('id', $bookingId)
            ->where('status', '!=', 'cancelled')
            ->first();

        if (!$booking) {
            return ['success' => false, 'message' => 'Booking not found', 'status' => 404];
        }

        $session = CourseSession::query()->find($booking->course_id);
        if (!$session) {
            return ['success' => false, 'message' => 'Course session not found', 'status' => 404];
        }

        $price = (float) $session->price_m;
        $refund = $price * (int) $booking->head_count;

        CourseBooking::query()->where('id', $bookingId)->update(['status' => 'cancelled']);

        if ((int) $booking->student_id !== 1) {
            Capsule::table('user_cards')
                ->where('student_id', $booking->student_id)
                ->update([
                    'frozen_balance' => Capsule::raw('frozen_balance - ' . $refund),
                ]);
        }

        return ['success' => true, 'message' => 'Booking cancelled and balance updated'];
    }

    public function saveUser(array $payload): array
    {
        $id = $payload['id'] ?? '';
        $userId = $payload['user_id'] ?? '';
        $role = $payload['role'] ?? '';

        if ($id === '' || $role === '') {
            return ['success' => false, 'message' => 'Missing parameters', 'status' => 422];
        }

        return $this->upsertUser($payload, $id, $userId, $role);
    }

    public function createUser(array $payload): array
    {
        $payload['id'] = -1;
        $payload['user_id'] = $payload['user_id'] ?? '';
        return $this->upsertUser($payload, -1, $payload['user_id'], $payload['role'] ?? '');
    }

    public function updateUser(int $id, array $payload): array
    {
        $payload['id'] = $id;
        return $this->upsertUser($payload, $id, $payload['user_id'] ?? '', $payload['role'] ?? '');
    }

    private function upsertUser(array $payload, $id, $userId, string $role): array
    {
        if ($role === '') {
            return ['success' => false, 'message' => 'Missing role', 'status' => 422];
        }

        $tableName = $role . '_list';
        $phone = $payload['phone'] ?? '';
        $name = $payload['name'] ?? '';
        $birthday = $payload['birthday'] ?? '';

        if ($name === '' || $birthday === '' || $phone === '') {
            return ['success' => false, 'message' => 'Name, birthday, and phone are required', 'status' => 422];
        }

        if ((string) $id !== '-1') {
            $exists = Capsule::table('user_list')
                ->where('phone', $phone)
                ->where('id', '!=', $userId)
                ->where('state', '!=', -1)
                ->count();

            if ($exists > 0) {
                return ['success' => false, 'message' => 'Phone already in use', 'status' => 409];
            }

            Capsule::table($tableName)
                ->where('id', $id)
                ->update([
                    'name' => $name,
                    'birthday' => $birthday,
                    'phone' => $phone,
                ]);

            Capsule::table('user_list')
                ->where('id', $userId)
                ->update(['phone' => $phone]);

            return ['success' => true, 'message' => 'User updated'];
        }

        $exists = Capsule::table('user_list')
            ->where('phone', $phone)
            ->where('state', '!=', -1)
            ->count();

        if ($exists > 0) {
            return ['success' => false, 'message' => 'Phone already exists', 'status' => 409];
        }

        $passwordSeed = substr($phone, -4) . date('Y', strtotime($birthday));
        $password = password_hash($passwordSeed, PASSWORD_DEFAULT);

        return Capsule::connection()->transaction(function () use ($phone, $password, $role, $tableName, $name, $birthday) {
            $userId = Capsule::table('user_list')->insertGetId([
                'phone' => $phone,
                'password' => $password,
                'role' => $role,
            ]);

            Capsule::table($tableName)->insert([
                'user_id' => $userId,
                'phone' => $phone,
                'name' => $name,
                'birthday' => $birthday,
            ]);

            return ['success' => true, 'message' => 'User created'];
        });
    }

    public function deleteUser(int $userId, string $role): array
    {
        if ($userId <= 0 || $role === '') {
            return ['success' => false, 'message' => 'Missing parameters', 'status' => 422];
        }

        if ($role === 'student') {
            $student = Student::query()->where('user_id', $userId)->first();
            if (!$student) {
                return ['success' => false, 'message' => 'Student not found', 'status' => 404];
            }

            $count = CourseBooking::query()
                ->where('student_id', $student->id)
                ->where('status', 'booked')
                ->count();

            if ($count > 0) {
                return ['success' => false, 'message' => 'User has pending bookings', 'status' => 409];
            }
        }

        Capsule::table('user_list')->where('id', $userId)->update(['state' => -1]);

        return ['success' => true, 'message' => 'User deleted'];
    }

    public function getInvoiceData(int $transactionId): array
    {
        if ($transactionId <= 0) {
            return ['success' => false, 'message' => 'Invalid transaction id', 'status' => 422];
        }

        $row = Capsule::table('transaction_list as t')
            ->leftJoin('student_list as s', 't.student_id', '=', 's.id')
            ->where('t.id', $transactionId)
            ->select('t.*', 's.name as student_name')
            ->first();

        if (!$row) {
            return ['success' => false, 'message' => 'Transaction not found', 'status' => 404];
        }

        return [
            'success' => true,
            'data' => [
                'transaction' => (array) $row,
            ],
        ];
    }

    public function renderInvoicePdf(array $transaction): string
    {
        $studentName = $transaction['student_name'] ?? '';
        $invoiceNo = $transaction['id'];
        $date = date('Y-m-d', strtotime($transaction['time']));
        $description = $transaction['type'];
        $amount = $transaction['payment'] ?? 0;

        $invoiceIdStr = str_pad((string) $invoiceNo, 4, '0', STR_PAD_LEFT);
        $customInvoiceNo = $date . '-' . $invoiceIdStr;

        $pdf = new AdminInvoicePdf('P', 'mm', 'A4', true, 'UTF-8', false);
        $pdf->SetMargins(10, 22, 10);
        $pdf->SetAutoPageBreak(true, 15);
        $pdf->AddPage();

        $pdf->SetFont('helvetica', 'B', 15);
        $pdf->SetTextColor(70, 76, 199);
        $pdf->Cell(0, 7, 'Be Glow Studio', 0, 1, 'L');
        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetTextColor(44, 62, 153);
        $pdf->Cell(0, 5, '(003717444-P)', 0, 1, 'L');
        $pdf->SetTextColor(0, 0, 0);
        $pdf->Cell(0, 5, '34A&34B,Jalana Kundang 1,Taman Bukit Pasir', 0, 1, 'L');
        $pdf->Cell(0, 5, '83000 Batu Pahat,Johor.', 0, 1, 'L');
        $pdf->Cell(0, 5, '018 769 5676', 0, 1, 'L');
        $pdf->Ln(5);

        $pdf->SetFont('helvetica', 'B', 22);
        $pdf->SetTextColor(44, 62, 153);
        $pdf->Cell(0, 12, 'Invoice', 0, 1, 'L');
        $pdf->Ln(2);

        $pdf->SetFont('helvetica', '', 11);
        $pdf->SetTextColor(0, 0, 0);
        $startY = $pdf->GetY();
        $pdf->Cell(60, 7, 'Invoice for', 0, 1, 'L');
        $pdf->Cell(60, 7, $studentName, 0, 1, 'L');

        $rightX = $pdf->GetPageWidth() - $pdf->getMargins()['right'] - 60;
        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetXY($rightX, $startY);
        $pdf->Cell(60, 7, 'INVOICE NO.: ' . $customInvoiceNo, 0, 2, 'R');
        $pdf->SetX($rightX);
        $pdf->Cell(60, 7, 'DATE: ' . $date, 0, 1, 'R');

        $pdf->SetY($startY + 14);
        $pdf->Ln(3);

        $html = <<<EOD
<table border="0" cellpadding="6" cellspacing="0" width="100%">
<tr style="background-color:#f0f0f0;font-weight:bold;">
    <td width="50%">Description</td>
    <td width="10%" align="center">Qty</td>
    <td width="20%" align="center">Unit price</td>
    <td width="20%" align="center">Total price</td>
</tr>
<tr>
    <td>{$description}</td>
    <td align="center">1</td>
    <td align="center">RM {$amount}</td>
    <td align="center">RM {$amount}</td>
</tr>
<tr><td colspan="4" height="20"></td></tr>
</table>
EOD;
        $pdf->SetFont('helvetica', '', 12);
        $pdf->writeHTML($html, true, false, false, false, '');

        $pdf->SetFont('helvetica', 'B', 24);
        $pdf->SetTextColor(224, 27, 132);
        $pdf->SetXY(170, $pdf->GetY() + 8);
        $pdf->Cell(30, 8, 'RM' . $amount, 0, 1, 'R');
        $pdf->SetTextColor(44, 62, 153);
        $pdf->SetX(130);

        return $pdf->Output('', 'S');
    }
}
