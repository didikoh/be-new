<?php

namespace App\Services;

use App\Models\CourseBooking;
use App\Models\CourseSession;
use Illuminate\Database\Capsule\Manager as Capsule;

class CourseService
{
    public function listRecent(): array
    {
        $start = date('Y-m-d', strtotime('-30 days'));
        $end = date('Y-m-d', strtotime('+7 days'));

        $courses = Capsule::table('course_session as c')
            ->leftJoin('coach_list as co', 'c.coach_id', '=', 'co.id')
            ->whereBetween('c.start_time', [$start, $end])
            ->orderBy('c.start_time', 'desc')
            ->select('c.*', 'co.name as coach_name')
            ->get();

        return $courses->toArray();
    }

    public function getDetail(int $courseId, ?int $studentId = null): array
    {
        $course = Capsule::table('course_session as c')
            ->leftJoin('coach_list as co', 'c.coach_id', '=', 'co.id')
            ->where('c.id', $courseId)
            ->select('c.*', 'co.name as coach_name', 'co.profile_pic as coach_pic')
            ->first();

        if (!$course) {
            return ['success' => false, 'message' => 'Course not found', 'status' => 404];
        }

        $payload = [
            'course' => (array) $course,
        ];

        if ($studentId) {
            $booking = CourseBooking::query()
                ->where('course_id', $courseId)
                ->where('student_id', $studentId)
                ->where('status', '!=', 'cancelled')
                ->select('head_count', 'status')
                ->first();

            $payload['is_booked'] = $booking ? $booking->toArray() : null;
            $payload['head_count'] = $booking ? (int) $booking->head_count : 0;
        }

        return ['success' => true, 'data' => $payload];
    }
}
