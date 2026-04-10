<?php
require_once '../connect.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);
$action = $input['action'] ?? null;

if (!$action) {
    echo json_encode(["success" => false, "message" => "Missing action"]);
    exit;
}

try {
    if ($action == "GET") {
        $stmt = $pdo->prepare("
            SELECT * FROM course_type
        ");
        $stmt->execute();
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $courses]);
        exit;
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "获取交易记录失败: " . $e->getMessage()]);
}
