<?php
header('Content-Type: application/json');
require_once '../connect.php';

$input = json_decode(file_get_contents("php://input"), true);
$id = $input['user_id'] ?? null;
$role = $input['role'] ?? '';

if (!$id || $role == "") {
    echo json_encode(['success' => false, 'message' => '缺少参数']);
    exit;
}

try {
    if ($role == "student") {
        // 1. 查 student_list 得到 student_id
        $stmt = $pdo->prepare("SELECT id FROM student_list WHERE user_id = ? LIMIT 1");
        $stmt->execute([$id]);
        $student = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$student) {
            echo json_encode(['success' => false, 'message' => '未找到该用户对应的学生信息']);
            exit;
        }

        $student_id = $student['id'];

        // 2. 查 course_booking 是否有 booked 状态
        $stmt2 = $pdo->prepare("SELECT COUNT(*) as cnt FROM course_booking WHERE student_id = ? AND status = 'booked'");
        $stmt2->execute([$student_id]);
        $result = $stmt2->fetch(PDO::FETCH_ASSOC);

        if ($result && $result['cnt'] > 0) {
            echo json_encode(['success' => false, 'message' => '该会员有未完成预约，无法删除']);
            exit;
        }
    }
    // 3. 没有未完成预约，允许逻辑删除
    $stmt3 = $pdo->prepare("UPDATE user_list SET state = -1 WHERE id = ?");
    $stmt3->execute([$id]);

    echo json_encode(['success' => true, 'message' => '会员已删除']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => '删除失败: ' . $e->getMessage()]);
}
exit;
