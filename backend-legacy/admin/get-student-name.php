<?php
header('Content-Type: application/json');
require_once '../connect.php'; // 你的 PDO 和 CORS 设置

$data = json_decode(file_get_contents('php://input'), true);
$phone = $data['phone'] ?? null;

if (!$phone) {
    echo json_encode([
        "success" => false,
        "message" => "缺少手机号参数",
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("
  SELECT 
    s.name
FROM 
    student_list s
LEFT JOIN 
    user_list u ON s.user_id = u.id
WHERE 
    u.state != -1 AND u.phone = :phone
ORDER BY 
    s.name ASC

    ");
    $stmt->execute([':phone' => $phone]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($student) {
        echo json_encode([
            "success" => true,
            "name" => $student['name'],
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "未找到对应学生",
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "读取学生资料失败: " . $e->getMessage(),
    ]);
}
