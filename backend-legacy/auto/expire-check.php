<?php
require_once '../connect.php';
header('Content-Type: application/json');

date_default_timezone_set('Asia/Kuala_Lumpur'); // 保证时区正确
$today = date('Y-m-d');

try {
    // 找出所有需要过期的卡片
    $stmt = $pdo->prepare("
        SELECT id, balance, valid_balance_to 
        FROM user_cards 
        WHERE status = 1 
          AND valid_balance_to IS NOT NULL 
          AND valid_balance_to < :today
          AND balance > 0
    ");
    $stmt->execute([':today' => $today]);
    $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$cards) {
        echo json_encode(['success' => true, 'message' => '没有需要过期的卡']);
        exit;
    }

    // 批量更新这些卡片的 balance 为 0
    $ids = array_column($cards, 'id');
    $in = str_repeat('?,', count($ids) - 1) . '?';

    $stmtUpdate = $pdo->prepare("UPDATE user_cards SET balance = 0 WHERE id IN ($in)");
    $stmtUpdate->execute($ids);

    echo json_encode([
        'success' => true,
        'message' => '已清零过期卡片余额',
        'affected_ids' => $ids
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
