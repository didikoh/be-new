<?php
header('Content-Type: application/json');
require_once './connect.php';

$input = json_decode(file_get_contents("php://input"), true);

try {
    // 根据是否有 student_id 动态拼接 SQL
    $sql = "
        SELECT 
            b.*,
            st.name AS student_name
    FROM 
        course_booking b
    LEFT JOIN 
        student_list st ON b.student_id = st.id
    WHERE booking_time 
    BETWEEN DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    ORDER BY booking_time DESC
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute();


    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'bookings' => $bookings,
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => '数据库错误: ' . $e->getMessage()
    ]);
}
