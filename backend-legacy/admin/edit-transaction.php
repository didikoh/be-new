<?php
header('Content-Type: application/json');
require_once '../connect.php'; // 按实际路径修改

$input = json_decode(file_get_contents("php://input"), true);
$transaction_id = $input['transaction_id'] ?? null;
$payment = $input['payment'] ?? null;

// 简单校验
if (!$transaction_id || !is_numeric($payment)) {
    echo json_encode([
        "success" => false,
        "message" => "transaction_id 和 payment（金额）是必需的"
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE transaction_list SET payment = :payment WHERE id = :id");
    $stmt->execute([
        ':payment' => $payment,
        ':id' => $transaction_id
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Payment updated successfully"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Transaction not found or payment is the same"
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
