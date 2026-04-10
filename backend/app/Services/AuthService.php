<?php

namespace App\Services;

use App\Models\Admin;
use App\Models\Coach;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Capsule\Manager as Capsule;

class AuthService
{
    public function login(string $phone, string $password): array
    {
        $user = User::query()
            ->where('phone', $phone)
            ->where('state', '!=', -1)
            ->first();

        if (!$user) {
            return ['success' => false, 'message' => 'Phone number not found', 'status' => 404];
        }

        if (!password_verify($password, $user->password)) {
            return ['success' => false, 'message' => 'Password incorrect', 'status' => 401];
        }

        $profile = $this->getProfileByRole($user->role, (int) $user->id);

        $_SESSION['user'] = [
            'user_id' => (int) $user->id,
            'role' => $user->role,
            'login_time' => time(),
        ];

        return [
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'profile' => array_merge($profile, ['role' => $user->role]),
            ],
        ];
    }

    public function register(array $payload, ?string $profilePicPath = null): array
    {
        $phone = $payload['phone'] ?? '';

        $exists = User::query()
            ->where('phone', $phone)
            ->where('state', '!=', -1)
            ->exists();

        if ($exists) {
            return ['success' => false, 'message' => 'Phone number already registered', 'status' => 409];
        }

        $password = $payload['password'] ?? '';
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $role = 'student';

        return Capsule::connection()->transaction(function () use ($payload, $phone, $hashedPassword, $role, $profilePicPath) {
            $user = User::query()->create([
                'phone' => $phone,
                'password' => $hashedPassword,
                'role' => $role,
            ]);

            Student::query()->create([
                'user_id' => $user->id,
                'phone' => $phone,
                'name' => $payload['name'] ?? '',
                'birthday' => $payload['birthday'] ?? '',
                'profile_pic' => $profilePicPath,
            ]);

            $profile = $this->getProfileByRole($role, (int) $user->id);

            $_SESSION['user'] = [
                'user_id' => (int) $user->id,
                'role' => $role,
                'login_time' => time(),
            ];

            return [
                'success' => true,
                'message' => 'Registration successful',
                'data' => [
                    'profile' => array_merge($profile, ['role' => $role]),
                ],
            ];
        });
    }

    public function check(): array
    {
        if (!isset($_SESSION['user'])) {
            return ['success' => false, 'message' => 'User not logged in', 'status' => 401];
        }

        $userId = (int) $_SESSION['user']['user_id'];
        $role = (string) $_SESSION['user']['role'];
        $profile = $this->getProfileByRole($role, $userId);

        return [
            'success' => true,
            'message' => 'Profile loaded',
            'data' => [
                'profile' => array_merge($profile, ['role' => $role]),
            ],
        ];
    }

    public function logout(): array
    {
        $_SESSION = [];
        session_unset();
        session_destroy();

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }

        return [
            'success' => true,
            'message' => 'Logged out',
        ];
    }

    private function getProfileByRole(string $role, int $userId): array
    {
        if ($role === 'student') {
            return (array) (Student::query()->where('user_id', $userId)->first()?->toArray() ?? []);
        }

        if ($role === 'coach') {
            return (array) (Coach::query()->where('user_id', $userId)->first()?->toArray() ?? []);
        }

        if ($role === 'admin') {
            return (array) (Admin::query()->where('user_id', $userId)->first()?->toArray() ?? []);
        }

        return [];
    }
}
