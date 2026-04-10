<?php
header('Content-Type: application/json');
require_once '../connect.php';

$user_id = 1;
$role = 'admin';
$phone = '+60147752891';
$name = 'Xiao Hann';
$level = '1';

if (!$name || !$phone) {
    echo json_encode(["success" => false, "message" => "名字和电话不能为空"]);
    exit;
}

try {
    $password = password_hash("xiaohann", PASSWORD_DEFAULT);

    $pdo->beginTransaction();

    // 插入 user_list 表
    $stmt1 = $pdo->prepare("INSERT INTO user_list (phone, password, role) VALUES (:phone, :password, :role)");
    $stmt1->execute([
        ':phone' => $phone,
        ':password' => $password,
        ':role' => $role
    ]);

    // 获取刚插入的 user_id
    $user_id = $pdo->lastInsertId();

    // 插入 role 对应表，并带上 user_id
    $stmt2 = $pdo->prepare("INSERT INTO admin_list (user_id, phone, name, level) 
                                VALUES (:user_id, :phone, :name, :level)");
    $stmt2->execute([
        ':user_id' => $user_id,
        ':phone' => $phone,
        ':name' => $name,
        ':level' => $level,
    ]);

    $stmt3 = $pdo->prepare("INSERT INTO user_list (phone, password, role) VALUES (:phone, :password, :role)");
    $stmt3->execute([
        ':phone' => '+601111111111',
        ':password' => $password,
        ':role' => 'student'
    ]);

    // 获取刚插入的 user_id
    $user_id2 = $pdo->lastInsertId();

    // 插入 role 对应表，并带上 user_id
    $stmt4 = $pdo->prepare("INSERT INTO student_list (user_id, phone, name, birthday, is_member) 
                                VALUES (:user_id, :phone, :name, NOW(), 1)");
    $stmt4->execute([
        ':user_id' => $user_id2,
        ':phone' => '+601111111111',
        ':name' => 'Guest',
    ]);

    // 获取刚插入的 user_id
    $user_id3 = $pdo->lastInsertId();

    // 插入 role 对应表，并带上 user_id
    $stmt5 = $pdo->prepare("INSERT INTO user_cards (student_id,card_type_id,valid_balance_to,valid_from,valid_to) 
                                VALUES (:user_id,1,DATE_ADD(NOW(),INTERVAL 100 YEAR),NOW(),DATE_ADD(NOW(),INTERVAL 100 YEAR))");
    $stmt5->execute([
        ':user_id' => $user_id3
    ]);

        // 插入 user_list 表
    $stmt6 = $pdo->prepare("INSERT INTO user_list (phone, password, role) VALUES (:phone, :password, :role)");
    $stmt6->execute([
        ':phone' => '+601222222222',
        ':password' => $password,
        ':role' => 'coach'
    ]);

    // 获取刚插入的 user_id
    $user_id4 = $pdo->lastInsertId();

    // 插入 role 对应表，并带上 user_id
    $stmt6 = $pdo->prepare("INSERT INTO coach_list (user_id, phone, name, birthday) 
                                VALUES (:user_id, :phone, :name, NOW())");
    $stmt6->execute([
        ':user_id' => $user_id4,
        ':phone' => '+601222222222',
        ':name' => 'Guest Coach',
    ]);

    $pdo->commit();
    echo json_encode([
        "success" => true,
        "message" => "新管理员添加成功",
    ]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(["success" => false, "message" => "操作失败: " . $e->getMessage()]);
}
