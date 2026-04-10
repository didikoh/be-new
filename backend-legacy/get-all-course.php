<?php
header('Content-Type: application/json');
require_once './connect.php';

$input = json_decode(file_get_contents("php://input"), true);

try {
    // 根据是否有 student_id 动态拼接 SQL
    $sql = "
        SELECT 
            c.*,
            co.name AS coach_name
    FROM 
        course_session c
    LEFT JOIN 
        coach_list co ON c.coach_id = co.id
    WHERE start_time 
    BETWEEN DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    ORDER BY start_time DESC
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute();

    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'courses' => $courses,
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => '数据库错误: ' . $e->getMessage()
    ]);
}
