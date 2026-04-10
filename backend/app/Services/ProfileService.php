<?php

namespace App\Services;

use App\Models\Coach;
use App\Models\Student;
use App\Models\User;

class ProfileService
{
    public function update(int $userId, string $role, string $name, string $birthday, ?string $profilePicPath = null): array
    {
        if (!$userId) {
            return ['success' => false, 'message' => 'No user id provided', 'status' => 422];
        }

        if ($name === '' || $birthday === '') {
            return ['success' => false, 'message' => 'Name and birthday cannot be empty', 'status' => 422];
        }

        $data = [
            'name' => $name,
            'birthday' => $birthday,
        ];

        if ($profilePicPath) {
            $data['profile_pic'] = $profilePicPath;
        }

        if ($role === 'coach') {
            Coach::query()->where('user_id', $userId)->update($data);
        } else {
            Student::query()->where('user_id', $userId)->update($data);
        }

        return ['success' => true, 'message' => 'Profile updated successfully'];
    }

    public function changePassword(int $userId, string $oldPassword, string $newPassword): array
    {
        if (!$oldPassword || !$newPassword) {
            return ['success' => false, 'message' => 'Please enter the old and new passwords', 'status' => 422];
        }

        $user = User::query()->select(['id', 'password'])->find($userId);

        if (!$user || !password_verify($oldPassword, $user->password)) {
            return ['success' => false, 'message' => 'Incorrect old password', 'status' => 400];
        }

        $hashed = password_hash($newPassword, PASSWORD_DEFAULT);
        User::query()->where('id', $userId)->update(['password' => $hashed]);

        return ['success' => true, 'message' => 'Password updated successfully'];
    }

    public function adminChangePassword(int $userId, string $newPassword): array
    {
        if (!$newPassword) {
            return ['success' => false, 'message' => 'Missing parameters', 'status' => 422];
        }

        $hashed = password_hash($newPassword, PASSWORD_DEFAULT);
        User::query()->where('id', $userId)->update(['password' => $hashed]);

        return ['success' => true, 'message' => 'Password updated successfully'];
    }
}
