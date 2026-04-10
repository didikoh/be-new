<?php
header('Content-Type: application/json');
require_once './connect.php'; // 你的数据库连接文件

// 获取输入参数
$input = json_decode(file_get_contents("php://input"), true);
$student_id = isset($input['student_id']) ? intval($input['student_id']) : 0;

if (!$student_id) {
    echo json_encode([
        'success' => false,
        'message' => 'student_id is required',
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM user_cards WHERE student_id = :student_id");
    $stmt->execute([':student_id' => $student_id]);
    $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'cards' => $cards,
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
    ]);
}
