<?php
require_once '../connect.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$phone = $data['phone'] ?? null;
$payment = floatval($data['payment'] ?? 0);
$description = $data['description'] ?? '';

if (!$phone) {
    echo json_encode(['success' => false, 'message' => '手机号无效']);
    exit;
}

if ($payment <= 0) {
    echo json_encode(['success' => false, 'message' => '金额无效']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. 查找 student_id
    $stmt = $pdo->prepare("SELECT id FROM student_list WHERE phone = :phone LIMIT 1");
    $stmt->execute([':phone' => $phone]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        throw new Exception('找不到学生资料');
    }
    $student_id = $student['id'];

    // 2. 查找有效卡（默认一张）
    $stmt = $pdo->prepare("SELECT * FROM user_cards WHERE student_id = :student_id AND status = 1 LIMIT 1 FOR UPDATE");
    $stmt->execute([':student_id' => $student_id]);
    $card = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$card) {
        throw new Exception('找不到有效的储值卡');
    }

    if (floatval($card['balance']-$card['frozen_balance']) < $payment) {
        throw new Exception('余额不足');
    }

    // 3. 扣款
    $new_balance = floatval($card['balance']) - $payment;
    $stmt = $pdo->prepare("UPDATE user_cards SET balance = :new_balance WHERE id = :card_id");
    $stmt->execute([
        ':new_balance' => $new_balance,
        ':card_id' => $card['id']
    ]);

    // 4. 写入交易记录
    $stmt = $pdo->prepare("
        INSERT INTO transaction_list (student_id, type, amount, description)
        VALUES (:student_id, 'purchase', :payment, :description)
    ");
    $stmt->execute([
        ':student_id' => $student_id,
        ':payment' => $payment,
        ':description' => $description
    ]);

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => '购买成功']);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
