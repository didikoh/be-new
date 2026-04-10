<?php

require __DIR__ . '/../bootstrap/cli.php';

$logDir = __DIR__ . '/logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0777, true);
}

$logFile = $logDir . '/course_copy.log';
$logTime = date('Y-m-d H:i:s');
file_put_contents($logFile, "[{$logTime}] Start copying weekly courses...\n", FILE_APPEND);

$today = date('Y-m-d');
$monday = date('Y-m-d', strtotime('monday this week', strtotime($today)));
$sunday = date('Y-m-d', strtotime('sunday this week', strtotime($today)));

try {
    $courses = \Illuminate\Database\Capsule\Manager::table('course_session')
        ->where('start_time', '>=', $monday . ' 00:00:00')
        ->where('start_time', '<=', $sunday . ' 23:59:59')
        ->where('state', '!=', -1)
        ->get();

    if ($courses->isEmpty()) {
        file_put_contents($logFile, "[{$logTime}] No courses to copy.\n", FILE_APPEND);
        exit;
    }

    $count = 0;
    foreach ($courses as $course) {
        $newStartTime = date('Y-m-d H:i:s', strtotime($course->start_time . ' +7 days'));

        \Illuminate\Database\Capsule\Manager::table('course_session')->insert([
            'name' => $course->name,
            'price' => $course->price,
            'price_m' => $course->price_m,
            'min_book' => $course->min_book,
            'coach_id' => $course->coach_id,
            'location' => $course->location,
            'start_time' => $newStartTime,
            'duration' => $course->duration,
            'course_pic' => $course->course_pic,
            'created_date' => date('Y-m-d'),
            'type_id' => $course->type_id,
        ]);

        $count++;
    }

    file_put_contents($logFile, "[{$logTime}] Copied {$count} courses to next week.\n", FILE_APPEND);
} catch (Throwable $e) {
    $errorTime = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[{$errorTime}] Error: {$e->getMessage()}\n", FILE_APPEND);
}
