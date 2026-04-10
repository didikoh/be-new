<?php
header('Content-Type: application/json');
require_once '../connect.php'; // 你自己的 PDO 初始化文件

// 获取 POST 数据
$id         = $_POST['id'] ?? null;
$name       = $_POST['name'] ?? '';
$course_pic = $_POST['course_pic'] ?? '';
$price      = $_POST['price'] ?? 0;
$price_m    = $_POST['price_m'] ?? 0;
$min_book   = $_POST['min_book'] ?? 0;
$coach_id      = $_POST['coach_id'] ?? '';
$time       = $_POST['start_time'] ?? '';
$duration   = $_POST['duration'] ?? 0;
$location   = $_POST['location'] ?? null;
$delete = $_POST['delete'] ?? "false";

// 转换为标准 DATETIME 格式（MySQL）
$start_time = date('Y-m-d H:i:s', strtotime($time));

try {
    if ($delete == "true") {
        $stmt = $pdo->prepare("
            UPDATE course_session SET
                state = -1
            WHERE id = :id
        ");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode([
            'success' => true,
            'message' => '课程已删除',
        ]);
        exit;
    }
    if ($id === null || $id === '' || $id === 'null') {
        // INSERT 新课程
        $stmt = $pdo->prepare("
            INSERT INTO course_session (name,course_pic, price, price_m, min_book, coach_id, start_time, duration, location)
            VALUES (:name,:course_pic, :price, :price_m, :min_book, :coach_id, :start_time, :duration, :location)
        ");
    } else {
        // UPDATE 已有课程
        $stmt = $pdo->prepare("
            UPDATE course_session SET
                name = :name,
                course_pic = :course_pic,
                price = :price,
                price_m = :price_m,
                min_book = :min_book,
                coach_id = :coach_id,
                start_time = :start_time,
                duration = :duration,
                location = :location
            WHERE id = :id
        ");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    }

    // 通用绑定
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':course_pic', $course_pic);
    $stmt->bindParam(':price', $price);
    $stmt->bindParam(':price_m', $price_m);
    $stmt->bindParam(':min_book', $min_book);
    $stmt->bindParam(':coach_id', $coach_id);
    $stmt->bindParam(':start_time', $start_time);
    $stmt->bindParam(':duration', $duration, PDO::PARAM_INT);
    $stmt->bindParam(':location', $location);

    $stmt->execute();

    echo json_encode([
        'success' => true,
        'message' => $id ? '课程已更新' : '课程已新增',
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => '数据库错误: ' . $e->getMessage(),
    ]);
}
