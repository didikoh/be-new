<?php
require_once '../connect.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$course_id = $data['course_id'];

if (!$course_id) {
    echo json_encode(['success' => false, 'message' => '缺少课程ID']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. 查课程价格
    $stmt = $pdo->prepare("SELECT price_m,price FROM course_session WHERE id = :course_id AND state = 0 FOR UPDATE");
    $stmt->execute([':course_id' => $course_id]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$session) {
        echo json_encode([
            "success" => false,
            "message" => "课程不存在或已开始"
        ]);
        exit;
    }

    $price = floatval($session['price_m']);
    $price_normal = floatval($session['price']);

    // 2. 查所有未取消预约
    $stmt1 = $pdo->prepare("
        SELECT id, student_id, head_count 
        FROM course_booking 
        WHERE course_id = :course_id AND status != 'cancelled'
        FOR UPDATE
    ");
    $stmt1->execute([':course_id' => $course_id]);
    $bookings = $stmt1->fetchAll(PDO::FETCH_ASSOC);

    foreach ($bookings as $booking) {
        $student_id = $booking['student_id'];
        $head_count = $booking['head_count'];
        $booking_id = $booking['id'];
        $frozen_reduce = $price * $head_count;

        if ($student_id != 1) {
            // 2-1. 扣除frozen_balance
            $stmt2 = $pdo->prepare("
            UPDATE user_cards 
            SET frozen_balance = frozen_balance - :amount1,
                balance = balance - :amount2
            WHERE student_id = :student_id
            ");
            $stmt2->execute([
                ':amount1' => $frozen_reduce,
                ':amount2' => $frozen_reduce,
                ':student_id' => $student_id
            ]);

            // 2-2. 增加point
            $stmt3 = $pdo->prepare("
            UPDATE student_list 
            SET point = point + :point1
            WHERE id = :student_id
            ");
            $stmt3->execute([
                ':point1' => $price,
                ':student_id' => $student_id
            ]);

            // 2-3. 写transaction_list
            $description = "Course attended, points awarded. Price: {$price}";
            $stmt4 = $pdo->prepare("
            INSERT INTO transaction_list (student_id, type, amount, point, description,head_count,course_id) 
            VALUES (:student_id, 'payment', :amount, :point, :description,:head_count,:course_id)
            ");
            $stmt4->execute([
                ':student_id' => $student_id,
                ':amount' => $frozen_reduce,
                ':point' => $price,
                ':description' => $description,
                ':head_count' => $head_count,
                ':course_id' => $course_id
            ]);

            // 2-4. 更新预约状态
            $stmt5 = $pdo->prepare("
            UPDATE course_booking 
            SET status = 'paid' 
            WHERE id = :booking_id
            ");
            $stmt5->execute([':booking_id' => $booking_id]);
        } else {
            $frozen_price_normal = $price_normal * $head_count;
            // 2-3. 写transaction_list
            $description = "Course attended, points awarded. Price: {$price_normal}";
            $stmt6 = $pdo->prepare("
            INSERT INTO transaction_list (student_id, type, amount, point, description,head_count,course_id) 
            VALUES (:student_id, 'payment', :amount, :point, :description,:head_count,:course_id)
            ");
            $stmt6->execute([
                ':student_id' => $student_id,
                ':amount' => $frozen_price_normal,
                ':point' => $price_normal,
                ':description' => $description,
                ':head_count' => $head_count,
                ':course_id' => $course_id
            ]);

            // 2-4. 更新预约状态
            $stmt7 = $pdo->prepare("
            UPDATE course_booking 
            SET status = 'paid' 
            WHERE id = :booking_id
            ");
            $stmt7->execute([':booking_id' => $booking_id]);
        }
    }

    // 3. 更新课程状态为“已上课” (state = 1)
    $stmt8 = $pdo->prepare("UPDATE course_session SET state = 1 WHERE id = :course_id");
    $stmt8->execute([':course_id' => $course_id]);

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => '课程已开始，所有预约已处理']);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
