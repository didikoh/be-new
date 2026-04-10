<?php
require_once '../connect.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$course_id = $data['course_id'] ?? 0;

if (!$course_id) {
    echo json_encode(['success' => false, 'message' => '缺少课程ID']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. 检查是否还有预约
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM course_booking WHERE course_id = ? AND status != 'cancelled'");
    $stmt->execute([$course_id]);
    $booking_count = $stmt->fetchColumn();

    if ($booking_count > 0) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => '还有预约，无法取消该课程']);
        exit;
    }

    // 2. 课程 state 设为 -1 （已取消）
    $stmt = $pdo->prepare("UPDATE course_session SET state = -1 WHERE id = ? AND state = 0");
    $stmt->execute([$course_id]);

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => '课程已取消']);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => '取消失败: ' . $e->getMessage()]);
}
