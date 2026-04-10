<?php
header('Content-Type: application/json');
require_once './connect.php';

$input = json_decode(file_get_contents('php://input'), true);

$student_id   = $input['student_id']   ?? null;
$course_id    = $input['course_id']    ?? null;
$head_count   = $input['head_count']   ?? 1;
$frozen_price = $input['frozen_price'] ?? null;

if (!$student_id || !$course_id || $frozen_price === null) {
    echo json_encode([
        "success" => false,
        "message" => "student_id, course_id, and frozen_price are required"
    ]);
    exit;
}

if ($frozen_price <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid frozen amount"
    ]);
    exit;
}

// 检查是否已预约
$stmtCheck = $pdo->prepare("SELECT id FROM course_booking WHERE student_id = :student_id AND course_id = :course_id AND status != 'cancelled'");
$stmtCheck->execute([
    ':student_id' => $student_id,
    ':course_id' => $course_id
]);
if ($stmtCheck->rowCount() > 0) {
    echo json_encode([
        "success" => false,
        "message" => "You have already booked this course"
    ]);
    exit;
}

// 查询卡片有效余额日期
$stmtCheck = $pdo->prepare("SELECT id, valid_balance_to FROM user_cards WHERE student_id = :student_id AND card_type_id = 1 LIMIT 1");
$stmtCheck->execute([
    ':student_id' => $student_id
]);
$card = $stmtCheck->fetch(PDO::FETCH_ASSOC);

if (!$card) {
    echo json_encode([
        "success" => false,
        "message" => "Card not found"
    ]);
    exit;
}

// 检查有效期
$today = date('Y-m-d');
if ($card['valid_balance_to'] < $today) {
    echo json_encode([
        "success" => false,
        "message" => "Card balance expired"
    ]);
    exit;
}

// 查询课程信息
$stmt = $pdo->prepare("SELECT id,name, price_m, state FROM course_session WHERE id = :course_id");
$stmt->execute([':course_id' => $course_id]);
$course = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$course) {
    echo json_encode(['success' => false, 'message' => '课程不存在']);
    exit;
}

$price = floatval($course['price_m']);
$course_name = $course['name'];
$state = intval($course['state']);

if ($state === 1) {
    // 直接扣 balance，不冻结
    $total_price = $price * $head_count;
    $pdo->beginTransaction();

    try {
        // 1. 扣 balance
        $stmt = $pdo->prepare("UPDATE user_cards SET balance = balance - :amount WHERE id = :card_id");
        $stmt->execute([
            ':amount' => $total_price,
            ':card_id' => $card['id']
        ]);

        // 2. 新增 booking，status='paid'
        $stmt = $pdo->prepare("INSERT INTO course_booking (course_id, student_id, head_count, status) VALUES (:course_id, :student_id, :head_count, 'paid')");
        $stmt->execute([
            ':course_id' => $course_id,
            ':student_id' => $student_id,
            ':head_count' => $head_count
        ]);
        $booking_id = $pdo->lastInsertId();

        // 3. 写 transaction（参考 start-course.php 逻辑）
        $description = "Booked and paid for course {$course_name}, price: {$price}, head_count: {$head_count}";
        $stmt = $pdo->prepare("INSERT INTO transaction_list (student_id, type, amount, point, description,head_count,course_id) VALUES (:student_id, 'payment', :amount, :price, :description,:head_count,:course_id)");
        $stmt->execute([
            ':student_id' => $student_id,
            ':amount' => $total_price,
            ':price' => $price,
            ':description' => $description,
            ':head_count' => $head_count,
            ':course_id' => $course_id
        ]);

        $pdo->commit();
        echo json_encode(['success' => true, 'message' => '课程已成功预约并扣款', 'booking_id' => $booking_id]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => '预约失败: ' . $e->getMessage()]);
    }
    exit;
}

// 更新 user_cards 的冻结余额
$stmtFrozen = $pdo->prepare("UPDATE user_cards 
        SET frozen_balance = frozen_balance + :amount 
        WHERE id = :card_id");
$success = $stmtFrozen->execute([
    ':amount' => $frozen_price,
    ':card_id' => $card['id']
]);


if ($success) {

    // 插入预约
    $stmt = $pdo->prepare("INSERT INTO course_booking (student_id, course_id, head_count) VALUES (:student_id, :course_id, :head_count)");
    $stmt->execute([
        ':student_id' => $student_id,
        ':course_id' => $course_id,
        ':head_count' => $head_count
    ]);


    echo json_encode([
        "success" => true,
        "message" => "Booking successful"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Booking failed, please try again later"
    ]);
}
