<?php
// CLI脚本：每周复制本周课程到下周
require_once '../connect.php'; // 根据实际路径修改

// 设置时区为马来西亚
date_default_timezone_set('Asia/Kuala_Lumpur');

// 日志文件路径（建议创建 logs 目录）
$logFile = __DIR__ . '/logs/course_copy.log';
$logTime = date('Y-m-d H:i:s');
file_put_contents($logFile, "[$logTime] 开始执行课程复制任务...\n", FILE_APPEND);

// 1. 获取本周的周一和周日
$today = date('Y-m-d');
$monday = date('Y-m-d', strtotime('monday this week', strtotime($today)));
$sunday = date('Y-m-d', strtotime('sunday this week', strtotime($today)));
try {
// 2. 查询本周所有课程
$sql = "SELECT * FROM course_session 
        WHERE start_time >= :monday 
        AND start_time <= :sunday AND state != -1";

$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':monday' => $monday . ' 00:00:00',
    ':sunday' => $sunday . ' 23:59:59'
]);
$courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (!$courses) {
   file_put_contents($logFile, "[$logTime] 本周没有课程，任务结束。\n", FILE_APPEND);
   exit;
}

// 3. 插入每个新课程，start_time + 7 天
$count = 0;
foreach ($courses as $course) {
    $new_start_time = date('Y-m-d H:i:s', strtotime($course['start_time'] . ' +7 days'));
    $stmt = $pdo->prepare("INSERT INTO course_session 
        (name, price, price_m, min_book, coach_id, location, start_time, duration, course_pic, created_date, type_id)
        VALUES 
        (:name, :price, :price_m, :min_book, :coach_id, :location, :start_time, :duration, :course_pic, :created_date, :type_id)");
    $stmt->execute([
        ':name' => $course['name'],
        ':price' => $course['price'],
        ':price_m' => $course['price_m'],
        ':min_book' => $course['min_book'],
        ':coach_id' => $course['coach_id'],
        ':location' => $course['location'],
        ':start_time' => $new_start_time,
        ':duration' => $course['duration'],
        ':course_pic' => $course['course_pic'],
        ':created_date' => date('Y-m-d'), // 复制当天
        ':type_id' => $course['type_id'],
    ]);
    $count++;
}

file_put_contents($logFile, "[$logTime] 已复制本周课程到下周，共复制：{$count} 个课程。\n", FILE_APPEND);
} catch (Exception $e) {
    $errorTime = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$errorTime] 错误：{$e->getMessage()}\n", FILE_APPEND);
}
