<?php
header('Content-Type: application/json');
require_once '../connect.php'; // 你的 PDO 和 CORS 设置

try {
    $stmt = $pdo->query("
  SELECT 
    s.*,
    u.id AS user_id,
    u.phone AS user_phone,
    u.state AS user_state,
    c.id AS card_id,
    c.card_type_id,
    t.name AS card_type_name,
    c.balance,
    c.frozen_balance,
    c.expired_balance,
    c.status AS card_status,
    c.valid_balance_to,
    c.valid_from,
    c.valid_to,
    c.created_at AS card_created_at,
    c.updated_at AS card_updated_at
FROM 
    student_list s
LEFT JOIN 
    user_list u ON s.user_id = u.id
LEFT JOIN 
    user_cards c ON s.id = c.student_id
LEFT JOIN 
    card_types t ON c.card_type_id = t.id
WHERE 
    u.state != -1 
ORDER BY 
    s.name ASC

    ");
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $students,
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "读取学生资料失败: " . $e->getMessage(),
    ]);
}
