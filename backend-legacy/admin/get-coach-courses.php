<?php
header('Content-Type: application/json');
require_once '../connect.php';
date_default_timezone_set('Asia/Kuala_Lumpur'); // 马来西亚时区

// 获取参数
$year = $_GET['year'] ?? date('Y');
$month = $_GET['month'] ?? date('m');
$coach_id = $_GET['coach_id'] ?? '';

if (!$coach_id) {
    echo json_encode(["success" => false, "message" => "缺少教师参数"]);
    exit;
}

// 计算当月范围
$month_start = date('Y-m-01 00:00:00', strtotime("$year-$month-01"));
$month_end = date('Y-m-t 23:59:59', strtotime("$year-$month-01"));

try {
    // 查找该教师该月所有课程
    $stmt = $pdo->prepare("SELECT id, name, start_time FROM course_session WHERE coach_id = :coach_id AND start_time BETWEEN :start AND :end ORDER BY start_time ASC");
    $stmt->execute([
        ':coach_id' => $coach_id,
        ':start' => $month_start,
        ':end' => $month_end,
    ]);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 查询每门课人数
    foreach ($courses as &$course) {
        $stmt2 = $pdo->prepare("
        SELECT COALESCE(SUM(head_count),0)             
        FROM course_booking
        WHERE course_id = :course_id
          AND status != 'cancelled' AND status != 'absent'
        ");
        $stmt2->execute([':course_id' => $course['id']]);

        // 保存到数组，字段名可按需要取；这里改成 head_total
        $course['student_count'] = (int)$stmt2->fetchColumn();
    }

    echo json_encode([
        "success" => true,
        "data" => [
            "year" => $year,
            "month" => $month,
            "courses" => $courses,
        ]
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "查询失败: " . $e->getMessage(),
    ]);
}
