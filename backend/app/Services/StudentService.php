<?php

namespace App\Services;

use App\Models\UserCard;

class StudentService
{
    public function getCards(int $studentId): array
    {
        if ($studentId <= 0) {
            return ['success' => false, 'message' => 'student_id is required', 'status' => 422];
        }

        $cards = UserCard::query()
            ->where('student_id', $studentId)
            ->get();

        return [
            'success' => true,
            'data' => [
                'cards' => $cards->toArray(),
            ],
        ];
    }
}
