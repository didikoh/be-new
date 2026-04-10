<?php
require_once '../connect.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);
$type = $input['type'] ?? null;
$t = $type === 'income' ? 'Top Up Package' : ($type === 'expense' ? 'payment' : 'purchase');

try {
    $stmt = $pdo->prepare("
        SELECT
        t.id AS transaction_id,
        t.student_id,
        s.name AS student_name,
        s.phone AS student_phone,
        t.type,
        t.payment,
        t.amount,
        t.point,
        t.head_count,
        t.course_id,
        t.description,
        t.time,
        c.name AS course_name,
        c.start_time
        FROM transaction_list t
        LEFT JOIN student_list s ON t.student_id = s.id
        LEFT JOIN course_session c ON t.course_id = c.id
        WHERE t.state != -1 AND t.type = :type
        ORDER BY t.id DESC LIMIT 200
    ");
    $stmt->execute([':type' => $t]);
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "data" => $transactions]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "获取交易记录失败: " . $e->getMessage()]);
}
