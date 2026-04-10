<?php

require __DIR__ . '/../bootstrap/cli.php';

$today = date('Y-m-d');

try {
    $cards = \Illuminate\Database\Capsule\Manager::table('user_cards')
        ->where('status', 1)
        ->whereNotNull('valid_balance_to')
        ->where('valid_balance_to', '<', $today)
        ->where('balance', '>', 0)
        ->get();

    if ($cards->isEmpty()) {
        echo json_encode(['success' => true, 'message' => 'No cards to expire']);
        exit;
    }

    $ids = $cards->pluck('id')->toArray();
    \Illuminate\Database\Capsule\Manager::table('user_cards')
        ->whereIn('id', $ids)
        ->update(['balance' => 0]);

    echo json_encode([
        'success' => true,
        'message' => 'Expired card balances cleared',
        'affected_ids' => $ids,
    ]);
} catch (Throwable $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
