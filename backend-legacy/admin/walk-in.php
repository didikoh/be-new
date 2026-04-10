<?php
header('Content-Type: application/json');
require_once '../connect.php';

$input = json_decode(file_get_contents('php://input'), true);

$student_id   = 1;
$course_id    = $input['course_id']    ?? null;
$head_count   = $input['head_count'];

if ($student_id === null || $student_id === '' || !$course_id || !$head_count || $head_count <= 0) {
    var_dump($student_id, $course_id, $head_count);

    echo json_encode([
        "success" => false,
        "message" => "student_id, course_id, and frozen_price are required"
    ]);
    exit;
}

// 查询课程信息
$stmt = $pdo->prepare("SELECT id,name, price, state FROM course_session WHERE id = :course_id");
$stmt->execute([':course_id' => $course_id]);
$course = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$course) {
    echo json_encode(['success' => false, 'message' => '课程不存在']);
    exit;
}

$price = floatval($course['price']);
$course_name = $course['name'];
$state = intval($course['state']);
$total_price = $price * $head_count;
$success = false;

if ($state === 1) {
    // 直接扣 balance，不冻结
    $pdo->beginTransaction();

    try {
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
        $success = true;
        echo json_encode(['success' => true, 'message' => '课程已成功预约并扣款', 'booking_id' => $booking_id]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => '预约失败: ' . $e->getMessage()]);
    }
    exit;
}

try {
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
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Booking failed, please try again later"
    ]);
}
exit;
