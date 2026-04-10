<?php
// 如果不是 CLI，就禁止运行
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden: CLI only']);
    exit;
}

$host = 'localhost';
$db = 'u839013241_bestudio';
$user = 'u839013241_beadmin';
$pass = 'HxDb!20BeS@Xh785!';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, // 报错时抛出异常
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // 默认取回关联数组
    PDO::ATTR_EMULATE_PREPARES => false,                  // 禁用模拟预处理（更安全）
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    $pdo->exec("SET time_zone = '+08:00'");
    // 可选：连接成功提示
    // echo "✅ 数据库连接成功！";
} catch (PDOException $e) {
    file_put_contents(__DIR__ . '/cron-error.log', date('Y-m-d H:i:s') . " DB ERROR: " . $e->getMessage() . "\n", FILE_APPEND);
    exit;
}


try {
    // 1. 获取所有 state = 1 的课程
    $stmt = $pdo->prepare("
        SELECT id, start_time, duration
        FROM course_session
        WHERE state = 1
    ");
    $stmt->execute();
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $finished_courses = [];
    $now = new DateTime();

    foreach ($courses as $course) {
        // 计算课程结束时间
        $start_time = new DateTime($course['start_time']);
        $end_time = clone $start_time;
        $end_time->modify('+' . intval($course['duration']) . ' minutes');

        // 2) 额外再加 1 天
        $end_time->modify('+1 day');

        // 如果当前时间大于等于结束时间，则可结课
        if ($now >= $end_time) {
            $course_id = $course['id'];

            // 2. 课程 state = 2
            $update_course = $pdo->prepare("UPDATE course_session SET state = 2 WHERE id = :id");
            $update_course->execute([':id' => $course_id]);

            // 3. booking status: paid => complete
            $update_booking = $pdo->prepare("
                UPDATE course_booking
                SET status = 'completed'
                WHERE course_id = :course_id AND status = 'paid'
            ");
            $update_booking->execute([':course_id' => $course_id]);

            $finished_courses[] = $course_id;
        }
    }

    file_put_contents(__DIR__ . '/cron-finish.log', date('Y-m-d H:i:s') . " - Finished courses: " . implode(', ', $finished_courses) . "\n", FILE_APPEND);
} catch (Exception $e) {
    file_put_contents(__DIR__ . '/cron-error.log', date('Y-m-d H:i:s') . " ERROR: " . $e->getMessage() . "\n", FILE_APPEND);

}
