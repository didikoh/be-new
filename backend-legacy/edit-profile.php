<?php
ini_set('session.gc_maxlifetime', 2592000);      // 后端保存 30 天
ini_set('session.cookie_lifetime', 2592000);     // 客户端 cookie 保存 30 天
session_start();
header('Content-Type: application/json');
require_once './connect.php';

$action = $_POST['action'] ?? '';
$phone = $_POST['phone'] ?? '';
$role = $_POST['role'] ?? 'student'; // 默认是 student
$user_id = $_POST['user_id'] ?? '';

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "No user id provided"]);
    exit;
}

if ($action === 'edit') {
    $name = $_POST['name'] ?? '';
    $birthday = $_POST['birthday'] ?? '';
    $profilePicPath = null;

    if (!$name || !$birthday) {
        echo json_encode(["success" => false, "message" => "Name and birthday cannot be empty"]);
        exit;
    }

    try {
        $updateFields = "name = :name, birthday = :birthday";
        $params = [
            ":name" => $name,
            ":birthday" => $birthday,
            ":user_id" => $user_id
        ];

        // 处理头像上传（可选）
        if (isset($_FILES['profile_pic']) && $_FILES['profile_pic']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = 'uploads/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

            $filename = basename($_FILES['profile_pic']['name']);
            $targetPath = $uploadDir . time() . '_' . $filename;

            if (move_uploaded_file($_FILES['profile_pic']['tmp_name'], $targetPath)) {
                $profilePicPath = $targetPath;
                $updateFields .= ", profile_pic = :profile_pic";
                $params[':profile_pic'] = $profilePicPath;
            }
        }

        // 根据角色更新不同的表
        if ($role === 'coach') {
            $stmt = $pdo->prepare("UPDATE coach_list SET $updateFields WHERE user_id = :user_id");
        } else {
            $stmt = $pdo->prepare("UPDATE student_list SET $updateFields WHERE user_id = :user_id");
        }

        $stmt->execute($params);

        echo json_encode(["success" => true, "message" => "Profile updated successfully"]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Update failed: " . $e->getMessage()]);
    }
} elseif ($action === 'change_password') {
    $passwordOld = $_POST['password_old'] ?? '';
    $passwordNew = $_POST['password_new'] ?? '';

    if (!$passwordOld || !$passwordNew) {
        echo json_encode(["success" => false, "message" => "Please enter the old and new passwords"]);
        exit;
    }

    try {
        // 先查当前密码
        $stmt = $pdo->prepare("SELECT password FROM user_list WHERE id = :user_id LIMIT 1");
        $stmt->execute([':user_id' => $user_id]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($passwordOld, $user['password'])) {
            echo json_encode(["success" => false, "message" => "Incorrect old password"]);
            exit;
        }

        // 更新密码
        $hashedNew = password_hash($passwordNew, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE user_list SET password = :password WHERE id = :user_id");
        $stmt->execute([':password' => $hashedNew, ':user_id' => $user_id]);

        echo json_encode(["success" => true, "message" => "Password updated successfully"]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Password update failed: " . $e->getMessage()]);
    }
    //Not using for Phase 1
} elseif ($action === 'admin_change_password') {
    $passwordNew = $_POST['password_new'] ?? '';

    if (!$passwordNew  || !$role) {
        echo json_encode(["success" => false, "message" => "Missing parameters"]);
        exit;
    }

    try {
        $hashedNew = password_hash($passwordNew, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE user_list SET password = :password WHERE id = :user_id");
        $stmt->execute([':password' => $hashedNew, ':user_id' => $user_id]);

        echo json_encode(["success" => true, "message" => "Password updated successfully"]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Password update failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Unknown action"]);
}
