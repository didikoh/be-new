<?php
header('Content-Type: application/json');
require_once '../connect.php';

try {
    $stmt = $pdo->prepare("
        SELECT 
            c.*,
            co.name AS coach_name,
            IFNULL(SUM(b.head_count), 0) AS booking_count
        FROM 
            course_session c
        LEFT JOIN 
            coach_list co ON c.coach_id = co.id
        LEFT JOIN 
            user_list u ON co.user_id = u.id
        LEFT JOIN 
            course_booking b ON c.id = b.course_id AND b.status != 'cancelled'
        WHERE 
            c.state != -1
        GROUP BY 
            c.id
        ORDER BY 
            c.start_time DESC LIMIT 100
    ");
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
