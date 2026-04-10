<?php

require __DIR__ . '/../bootstrap/cli.php';

$logDir = __DIR__ . '/logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0777, true);
}

try {
    $courses = \Illuminate\Database\Capsule\Manager::table('course_session')
        ->where('state', 1)
        ->get(['id', 'start_time', 'duration']);

    $finished = [];
    $now = new DateTime();

    foreach ($courses as $course) {
        $startTime = new DateTime($course->start_time);
        $endTime = clone $startTime;
        $endTime->modify('+' . (int) $course->duration . ' minutes');
        $endTime->modify('+1 day');

        if ($now >= $endTime) {
            \Illuminate\Database\Capsule\Manager::table('course_session')
                ->where('id', $course->id)
                ->update(['state' => 2]);

            \Illuminate\Database\Capsule\Manager::table('course_booking')
                ->where('course_id', $course->id)
                ->where('status', 'paid')
                ->update(['status' => 'completed']);

            $finished[] = $course->id;
        }
    }

    file_put_contents($logDir . '/cron-finish.log', date('Y-m-d H:i:s') . ' - Finished courses: ' . implode(', ', $finished) . "\n", FILE_APPEND);
} catch (Throwable $e) {
    file_put_contents($logDir . '/cron-error.log', date('Y-m-d H:i:s') . ' ERROR: ' . $e->getMessage() . "\n", FILE_APPEND);
}
