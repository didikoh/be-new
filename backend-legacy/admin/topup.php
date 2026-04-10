<?php
header('Content-Type: application/json');
require_once '../connect.php'; // 替换为你的数据库连接文件

$input = json_decode(file_get_contents("php://input"), true);

$id = $input['id'] ?? null;
$amount = $input['amount'] ?? null;
$valid_balance_to = $input['valid_balance_to'] ?? null;
$package = $input['package'] ?? null;
$payment = $input['payment'] ?? null;

if (!$id || $amount === null || !$valid_balance_to || $package === null || $payment === null) {
    echo json_encode(['success' => false, 'message' => 'Input unmatch']);
    exit;
}

try {
    $pdo->beginTransaction();

    $description = [];
    // 1. 检查 is_member 状态
    $stmt = $pdo->prepare("SELECT is_member FROM student_list WHERE id = ?");
    $stmt->execute([$id]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        throw new Exception('Student not found');
    }

    // 如果之前不是会员，更新为会员，并添加描述
    if ($student['is_member'] == 0 && $package == 1) {
        $stmt = $pdo->prepare("UPDATE student_list SET is_member = 1 WHERE id = ?");
        $stmt->execute([$id]);
        $description[] = 'Member activation';
    }

    // 2. 处理 user_cards
    $stmt = $pdo->prepare("SELECT * FROM user_cards WHERE student_id = ? AND card_type_id = 1");
    $stmt->execute([$id]);
    $card = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($card) {
        // 有卡，更新 balance、valid_balance_to
        $newBalance = bcadd($card['balance'], $amount, 2);
        $stmt = $pdo->prepare("UPDATE user_cards SET balance = ?, valid_balance_to = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$newBalance, $valid_balance_to, $card['id']]);
        $description[] = "Topup {$amount}";
        $card_id = $card['id'];
    } else {
        // 没卡，创建新卡
        $valid_from = date('Y-m-d');
        $valid_to = date('Y-m-d', strtotime('+1 year'));
        $stmt = $pdo->prepare("INSERT INTO user_cards (student_id, card_type_id, balance, valid_balance_to, valid_from, valid_to, status, created_at, updated_at) VALUES (?, 1, ?, ?, ?, ?, 1, NOW(), NOW())");
        $stmt->execute([$id, $amount, $valid_balance_to, $valid_from, $valid_to]);
        $description[] = "Topup {$amount}";
        $description[] = "New card issued";
        $card_id = $pdo->lastInsertId();
    }

    // 0. 先有一个转账描述（可以自行扩展）
    // $description[] = "Transaction processed";

    // 3. 插入 transaction_list
    $stmt = $pdo->prepare("INSERT INTO transaction_list (student_id, type, payment, amount, description) VALUES (?, 'Top Up Package', ?, ?, ?)");
    $stmt->execute([$id, $payment, $amount, implode('; ', $description)]);

    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'Topup success', 'card_id' => $card_id]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
