<?php
header('Content-Type: application/json');
require_once '../connect.php';

$insert = json_decode(file_get_contents("php://input"), true);
$booking_id = $insert['booking_id'] ?? 0;

if (!$booking_id) {
    echo json_encode(['success' => false, 'message' => '缺少参数']);
    exit;
}

try {
    // 1. 查 booking 资料
    $stmt = $pdo->prepare("SELECT student_id, head_count, course_id FROM course_booking WHERE id = :booking_id AND status != 'cancelled'");
    $stmt->execute([':booking_id' => $booking_id]);
    $booking = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$booking) {
        echo json_encode([
            "success" => false,
            "message" => "Booking not found"
        ]);
        exit;
    }

    // 2. 查课程价格
    $stmt = $pdo->prepare("SELECT price_m FROM course_session WHERE id = :course_id");
    $stmt->execute([':course_id' => $booking['course_id']]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$session) {
        echo json_encode([
            "success" => false,
            "message" => "Course session not found"
        ]);
        exit;
    }

    $price = $session['price_m'];
    $head_count = $booking['head_count'];
    $student_id = $booking['student_id'];
    $refund_amount = $price * $head_count;

    // 3. 先把 booking 标记为 cancelled
    $stmt = $pdo->prepare("UPDATE course_booking SET status = 'cancelled' WHERE id = :booking_id");
    $stmt->execute([':booking_id' => $booking_id]);

    if ($student_id != 1) {
        // 4. 返还金额到 user_cards
        $sql2 = "UPDATE user_cards 
    SET  frozen_balance = frozen_balance - :froze_money 
    WHERE student_id = :student_id";
        $stmt2 = $pdo->prepare($sql2);
        $stmt2->execute([
            ':froze_money' => $refund_amount,
            ':student_id' => $student_id
        ]);
    }


    echo json_encode([
        "success" => true,
        "message" => "Booking cancelled and balance updated"
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
