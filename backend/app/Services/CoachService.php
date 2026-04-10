<?php

namespace App\Services;

use App\Models\Coach;
use Illuminate\Database\Capsule\Manager as Capsule;

class CoachService
{
    public function overview(int $coachId): array
    {
        if ($coachId <= 0) {
            return ['success' => false, 'message' => 'Missing coach id', 'status' => 422];
        }

        $coach = Coach::query()->select('id', 'name')->find($coachId);
        if (!$coach) {
            return ['success' => false, 'message' => 'Coach not found', 'status' => 404];
        }

        $startOfMonth = date('Y-m-01 00:00:00');
        $endOfMonth = date('Y-m-t 23:59:59');

        $classCount = Capsule::table('course_session')
            ->where('coach_id', $coachId)
            ->whereBetween('start_time', [$startOfMonth, $endOfMonth])
            ->where('state', '!=', -1)
            ->count();

        $studentCount = Capsule::table('course_session as c')
            ->join('course_booking as b', function ($join) {
                $join->on('b.course_id', '=', 'c.id')
                    ->where('b.status', '!=', 'cancelled')
                    ->where('b.status', '!=', 'absent');
            })
            ->where('c.coach_id', $coachId)
            ->whereBetween('c.start_time', [$startOfMonth, $endOfMonth])
            ->where('c.state', '!=', -1)
            ->sum('b.head_count');

        $courses = Capsule::table('course_session as c')
            ->where('c.coach_id', $coachId)
            ->orderBy('c.start_time', 'desc')
            ->select(
                'c.*',
                Capsule::raw("(SELECT COALESCE(SUM(b.head_count), 0) FROM course_booking b WHERE b.course_id = c.id AND b.status != 'cancelled' AND b.status != 'absent') AS booking_count")
            )
            ->get();

        return [
            'success' => true,
            'data' => [
                'courses' => $courses->toArray(),
                'classCountThisMonth' => (int) $classCount,
                'studentCountThisMonth' => (int) $studentCount,
            ],
        ];
    }

    public function courseDetail(int $courseId): array
    {
        if ($courseId <= 0) {
            return ['success' => false, 'message' => 'Missing course_id', 'status' => 422];
        }

        $course = Capsule::table('course_session as c')
            ->leftJoin('coach_list as co', 'c.coach_id', '=', 'co.id')
            ->where('c.id', $courseId)
            ->select('c.*', 'co.name as coach_name', 'co.profile_pic as coach_pic')
            ->first();

        if (!$course) {
            return ['success' => false, 'message' => 'Course not found', 'status' => 404];
        }

        $bookings = Capsule::table('course_booking as b')
            ->join('student_list as s', 'b.student_id', '=', 's.id')
            ->where('b.course_id', $courseId)
            ->where('b.status', '!=', 'cancelled')
            ->where('b.status', '!=', 'absent')
            ->orderBy('b.booking_time', 'desc')
            ->select('b.*', 's.name as student_name', 's.phone as student_phone')
            ->get();

        return [
            'success' => true,
            'data' => [
                'course' => (array) $course,
                'bookings' => $bookings->toArray(),
            ],
        ];
    }
}
