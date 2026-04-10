<?php
header('Content-Type: application/json');
require_once './connect.php';

$input = json_decode(file_get_contents('php://input'), true);

$student_id = $input['student_id'] ?? null;
$course_id  = $input['course_id'] ?? null;
$head_count = $input['head_count'] ?? 0;

function respond($success, $message, $extra = [])
{
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

try {
    if (!$student_id || !$course_id || $head_count <= 0) {
        respond(false, "student_id, course_id, and head_count are required");
    }
    // 查课程
    $stmt = $pdo->prepare("SELECT id, name, price_m, state FROM course_session WHERE id = :course_id");
    $stmt->execute([':course_id' => $course_id]);
    $course = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$course) respond(false, "课程不存在");
    $course_name = $course['name'];
    $price       = floatval($course['price_m']);
    $state       = intval($course['state']);
    $total_price = $price * $head_count;

    // 查卡片
    $stmt = $pdo->prepare("SELECT id, balance, frozen_balance, valid_balance_to FROM user_cards WHERE student_id = :student_id AND card_type_id = 1 LIMIT 1");
    $stmt->execute([':student_id' => $student_id]);
    $card = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$card) respond(false, "Card not found");

    if ($card['valid_balance_to'] < date('Y-m-d')) {
        respond(false, "Card balance expired");
    }
    $card_id = $card['id'];

    // 检查是否余额足够
    $usable_balance = $card['balance'] - $card['frozen_balance'];
    if ($usable_balance < $total_price) {
        respond(false, "Balance not enough, current usable balance is {$usable_balance}");
    }

    // 是否已预约
    $stmt = $pdo->prepare("SELECT id, head_count, status FROM course_booking 
                           WHERE student_id = :student_id AND course_id = :course_id AND status != 'cancelled'");
    $stmt->execute([
        ':student_id' => $student_id,
        ':course_id' => $course_id
    ]);
    $booking = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($booking) {
        // 课程已开始，直接扣款并插入交易
        if ($state === 1) {
            $pdo->beginTransaction();
            try {
                $stmt = $pdo->prepare("UPDATE user_cards 
                SET balance = balance - :amount 
                WHERE id = :card_id");
                $stmt->execute([':amount' => $total_price, ':card_id' => $card_id]);

                $stmt = $pdo->prepare("UPDATE course_booking 
                SET head_count = head_count + :head_count, status = 'paid' 
                WHERE id = :booking_id");
                $stmt->execute([
                    ':head_count'  => $head_count,
                    ':booking_id'  => $booking['id']
                ]);

                $description = "追加预约并支付课程 {$course_name}, price: {$price}, head_count: {$head_count}";
                $stmt = $pdo->prepare("INSERT INTO transaction_list 
                (student_id, type, amount, point, description, head_count, course_id) 
                VALUES (:student_id, 'payment', :amount, :price, :description, :head_count, :course_id)");
                $stmt->execute([
                    ':student_id'  => $student_id,
                    ':amount'      => $total_price,
                    ':price'       => $price,
                    ':description' => $description,
                    ':head_count'  => $head_count,
                    ':course_id'   => $course_id
                ]);

                $pdo->commit();
                respond(true, "追加预约并支付成功");
            } catch (Exception $e) {
                $pdo->rollBack();
                respond(false, "追加预约失败: " . $e->getMessage());
            }
        }

        // 已预约的追加处理（课程未开始，冻结余额和人数）
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("UPDATE user_cards 
            SET frozen_balance = frozen_balance + :amount 
            WHERE id = :card_id");
            $stmt->execute([':amount' => $total_price, ':card_id' => $card_id]);

            $stmt = $pdo->prepare("UPDATE course_booking 
            SET head_count = head_count + :head_count 
            WHERE id = :booking_id");
            $stmt->execute([
                ':head_count'  => $head_count,
                ':booking_id'  => $booking['id']
            ]);

            $pdo->commit();
            respond(true, "Additional booking successful");
        } catch (Exception $e) {
            $pdo->rollBack();
            respond(false, "追加预约失败: " . $e->getMessage());
        }
    }

    // 新预约处理
    if ($state === 1) {
        // 课程已开始，立即扣款
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("UPDATE user_cards SET balance = balance - :amount WHERE id = :card_id");
            $stmt->execute([':amount' => $total_price, ':card_id' => $card_id]);

            $stmt = $pdo->prepare("INSERT INTO course_booking (course_id, student_id, head_count, status) 
                                   VALUES (:course_id, :student_id, :head_count, 'paid')");
            $stmt->execute([
                ':course_id'   => $course_id,
                ':student_id'  => $student_id,
                ':head_count'  => $head_count
            ]);
            $booking_id = $pdo->lastInsertId();

            $description = "Booked and paid for course {$course_name}, price: {$price}, head_count: {$head_count}";
            $stmt = $pdo->prepare("INSERT INTO transaction_list 
                (student_id, type, amount, point, description, head_count, course_id) 
                VALUES (:student_id, 'payment', :amount, :price, :description, :head_count, :course_id)");
            $stmt->execute([
                ':student_id'  => $student_id,
                ':amount'      => $total_price,
                ':price'       => $price,
                ':description' => $description,
                ':head_count'  => $head_count,
                ':course_id'   => $course_id
            ]);

            $pdo->commit();
            respond(true, "课程已成功预约并扣款", ['booking_id' => $booking_id]);
        } catch (Exception $e) {
            $pdo->rollBack();
            respond(false, "预约失败: " . $e->getMessage());
        }
    } else {
        // 课程未开始，仅冻结
        $stmt = $pdo->prepare("UPDATE user_cards 
            SET frozen_balance = frozen_balance + :amount 
            WHERE id = :card_id");
        $success = $stmt->execute([':amount' => $total_price, ':card_id' => $card_id]);

        if ($success) {
            $stmt = $pdo->prepare("INSERT INTO course_booking (student_id, course_id, head_count) 
                                   VALUES (:student_id, :course_id, :head_count)");
            $stmt->execute([
                ':student_id'  => $student_id,
                ':course_id'   => $course_id,
                ':head_count'  => $head_count
            ]);
            respond(true, "课程预约成功");
        } else {
            respond(false, "预约失败，请稍后再试");
        }
    }
} catch (Exception $e) {
    respond(false, "系统错误: " . $e->getMessage());
}
