<?php

namespace App\Services;

use App\Models\CourseBooking;
use App\Models\CourseSession;
use App\Models\Transaction;
use App\Models\UserCard;
use Illuminate\Database\Capsule\Manager as Capsule;

class BookingService
{
    public function listRecent(): array
    {
        $start = date('Y-m-d', strtotime('-30 days'));
        $end = date('Y-m-d', strtotime('+7 days'));

        $bookings = Capsule::table('course_booking as b')
            ->leftJoin('student_list as st', 'b.student_id', '=', 'st.id')
            ->whereBetween('b.booking_time', [$start, $end])
            ->orderBy('b.booking_time', 'desc')
            ->select('b.*', 'st.name as student_name')
            ->get();

        return $bookings->toArray();
    }

    public function create(array $payload): array
    {
        $studentId = (int) ($payload['student_id'] ?? 0);
        $courseId = (int) ($payload['course_id'] ?? 0);
        $headCount = (int) ($payload['head_count'] ?? 0);

        if ($studentId <= 0 || $courseId <= 0 || $headCount <= 0) {
            return ['success' => false, 'message' => 'student_id, course_id, and head_count are required', 'status' => 422];
        }

        $course = CourseSession::query()
            ->select(['id', 'name', 'price_m', 'state'])
            ->find($courseId);

        if (!$course) {
            return ['success' => false, 'message' => 'Course not found', 'status' => 404];
        }

        $card = UserCard::query()
            ->where('student_id', $studentId)
            ->where('card_type_id', 1)
            ->first();

        if (!$card) {
            return ['success' => false, 'message' => 'Card not found', 'status' => 404];
        }

        if ($card->valid_balance_to < date('Y-m-d')) {
            return ['success' => false, 'message' => 'Card balance expired', 'status' => 400];
        }

        $price = (float) $course->price_m;
        $totalPrice = $price * $headCount;
        $usableBalance = (float) $card->balance - (float) $card->frozen_balance;

        if ($usableBalance < $totalPrice) {
            return [
                'success' => false,
                'message' => "Balance not enough, current usable balance is {$usableBalance}",
                'status' => 400,
            ];
        }

        $booking = CourseBooking::query()
            ->where('student_id', $studentId)
            ->where('course_id', $courseId)
            ->where('status', '!=', 'cancelled')
            ->first();

        if ($booking) {
            if ((int) $course->state === 1) {
                return Capsule::connection()->transaction(function () use ($card, $totalPrice, $booking, $headCount, $course, $studentId) {
                    Capsule::table('user_cards')->where('id', $card->id)->decrement('balance', $totalPrice);

                    CourseBooking::query()
                        ->where('id', $booking->id)
                        ->increment('head_count', $headCount, ['status' => 'paid']);

                    $description = "追加预约并支付课程 {$course->name}, price: {$course->price_m}, head_count: {$headCount}";

                    Transaction::query()->create([
                        'student_id' => $studentId,
                        'type' => 'payment',
                        'amount' => $totalPrice,
                        'point' => $course->price_m,
                        'description' => $description,
                        'head_count' => $headCount,
                        'course_id' => $course->id,
                    ]);

                    return [
                        'success' => true,
                        'message' => '追加预约并支付成功',
                    ];
                });
            }

            return Capsule::connection()->transaction(function () use ($card, $totalPrice, $booking, $headCount) {
                Capsule::table('user_cards')->where('id', $card->id)->increment('frozen_balance', $totalPrice);
                CourseBooking::query()->where('id', $booking->id)->increment('head_count', $headCount);

                return [
                    'success' => true,
                    'message' => 'Additional booking successful',
                ];
            });
        }

        if ((int) $course->state === 1) {
            return Capsule::connection()->transaction(function () use ($card, $totalPrice, $studentId, $courseId, $headCount, $course) {
                Capsule::table('user_cards')->where('id', $card->id)->decrement('balance', $totalPrice);

                $bookingId = CourseBooking::query()->create([
                    'course_id' => $courseId,
                    'student_id' => $studentId,
                    'head_count' => $headCount,
                    'status' => 'paid',
                ])->id;

                $description = "Booked and paid for course {$course->name}, price: {$course->price_m}, head_count: {$headCount}";

                Transaction::query()->create([
                    'student_id' => $studentId,
                    'type' => 'payment',
                    'amount' => $totalPrice,
                    'point' => $course->price_m,
                    'description' => $description,
                    'head_count' => $headCount,
                    'course_id' => $courseId,
                ]);

                return [
                    'success' => true,
                    'message' => 'Course booked and paid',
                    'data' => ['booking_id' => $bookingId],
                ];
            });
        }

        Capsule::table('user_cards')->where('id', $card->id)->increment('frozen_balance', $totalPrice);
        CourseBooking::query()->create([
            'course_id' => $courseId,
            'student_id' => $studentId,
            'head_count' => $headCount,
        ]);

        return [
            'success' => true,
            'message' => 'Course booking successful',
        ];
    }

    public function createWithFrozenPrice(array $payload): array
    {
        $studentId = (int) ($payload['student_id'] ?? 0);
        $courseId = (int) ($payload['course_id'] ?? 0);
        $headCount = (int) ($payload['head_count'] ?? 1);
        $frozenPrice = $payload['frozen_price'] ?? null;

        if ($studentId <= 0 || $courseId <= 0 || $frozenPrice === null) {
            return ['success' => false, 'message' => 'student_id, course_id, and frozen_price are required', 'status' => 422];
        }

        if ($frozenPrice <= 0) {
            return ['success' => false, 'message' => 'Invalid frozen amount', 'status' => 400];
        }

        $existing = CourseBooking::query()
            ->where('student_id', $studentId)
            ->where('course_id', $courseId)
            ->where('status', '!=', 'cancelled')
            ->exists();

        if ($existing) {
            return ['success' => false, 'message' => 'You have already booked this course', 'status' => 409];
        }

        $card = UserCard::query()
            ->where('student_id', $studentId)
            ->where('card_type_id', 1)
            ->first();

        if (!$card) {
            return ['success' => false, 'message' => 'Card not found', 'status' => 404];
        }

        if ($card->valid_balance_to < date('Y-m-d')) {
            return ['success' => false, 'message' => 'Card balance expired', 'status' => 400];
        }

        $course = CourseSession::query()
            ->select(['id', 'name', 'price_m', 'state'])
            ->find($courseId);

        if (!$course) {
            return ['success' => false, 'message' => 'Course not found', 'status' => 404];
        }

        if ((int) $course->state === 1) {
            $totalPrice = (float) $course->price_m * $headCount;

            return Capsule::connection()->transaction(function () use ($card, $totalPrice, $courseId, $studentId, $headCount, $course) {
                Capsule::table('user_cards')->where('id', $card->id)->decrement('balance', $totalPrice);

                $bookingId = CourseBooking::query()->create([
                    'course_id' => $courseId,
                    'student_id' => $studentId,
                    'head_count' => $headCount,
                    'status' => 'paid',
                ])->id;

                $description = "Booked and paid for course {$course->name}, price: {$course->price_m}, head_count: {$headCount}";

                Transaction::query()->create([
                    'student_id' => $studentId,
                    'type' => 'payment',
                    'amount' => $totalPrice,
                    'point' => $course->price_m,
                    'description' => $description,
                    'head_count' => $headCount,
                    'course_id' => $courseId,
                ]);

                return [
                    'success' => true,
                    'message' => 'Course booked and paid',
                    'data' => ['booking_id' => $bookingId],
                ];
            });
        }

        Capsule::table('user_cards')->where('id', $card->id)->increment('frozen_balance', (float) $frozenPrice);
        CourseBooking::query()->create([
            'course_id' => $courseId,
            'student_id' => $studentId,
            'head_count' => $headCount,
        ]);

        return [
            'success' => true,
            'message' => 'Booking successful',
        ];
    }
}
