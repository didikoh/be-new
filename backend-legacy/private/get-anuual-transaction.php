<?php
// export_transactions.php

$config = [
  'host' => 'bestudiobp.com',
  'dbname' => 'u839013241_bestudio',
  'user' => 'u839013241_beadmin',
  'pass' => 'HxDb!20BeS@Xh785!',
  'charset' => 'utf8mb4',
];

// 允许跨域（如果前端是 Vite 本地跑）
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// --------- 输入参数 ---------
$format = strtolower($_GET['format'] ?? 'json'); // json | csv
$phone  = trim($_GET['phone'] ?? '');           // 可选：按手机号过滤
$from   = trim($_GET['from'] ?? '');            // 可选：2026-01-01 00:00:00
$to     = trim($_GET['to'] ?? '');              // 可选：2026-02-01 00:00:00

// --------- PDO 连接 ---------
$dsn = sprintf(
  "mysql:host=%s;dbname=%s;charset=%s",
  $config['host'],
  $config['dbname'],
  $config['charset']
);

try {
  $pdo = new PDO($dsn, $config['user'], $config['pass'], [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['success' => false, 'message' => 'DB connection failed'], JSON_UNESCAPED_UNICODE);
  exit;
}

// --------- SQL（含 join）---------
$sql = "
SELECT
  t.id                  AS transaction_id,
  t.type                AS transaction_type,
  t.payment,
  t.amount,
  t.point,
  t.head_count,
  t.course_id,
  t.description,
  t.time                AS transaction_time,
  t.state               AS transaction_state,

  s.id                  AS student_id,
  s.name                AS student_name,
  s.phone               AS student_phone,
  s.is_member,
  s.join_date           AS student_join_date,

  cs.name               AS course_session_name,
  cs.location,
  cs.start_time,
  cs.duration,
  cs.price              AS course_price,
  cs.price_m            AS course_price_member,
  cs.min_book,
  cs.state              AS course_state,

  ct.name               AS course_type_name,

  coach.name            AS coach_name,
  coach.phone           AS coach_phone

FROM transaction_list t
LEFT JOIN student_list s
  ON s.id = t.student_id
LEFT JOIN course_session cs
  ON cs.id = t.course_id
LEFT JOIN course_type ct
  ON ct.id = cs.type_id
LEFT JOIN coach_list coach
  ON coach.id = cs.coach_id
WHERE t.time >= '2025-01-01 00:00:00'
  AND t.time <  '2026-01-01 00:00:00'
ORDER BY t.id ASC;
";

// 动态条件（安全参数绑定）
$params = [];

if ($phone !== '') {
  $sql .= " AND s.phone = :phone ";
  $params[':phone'] = $phone;
}

if ($from !== '') {
  $sql .= " AND t.time >= :from ";
  $params[':from'] = $from;
}

if ($to !== '') {
  $sql .= " AND t.time < :to ";
  $params[':to'] = $to;
}

$sql .= " ORDER BY t.time DESC ";

// --------- 执行查询 ---------
try {
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll();
} catch (Throwable $e) {
  http_response_code(500);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['success' => false, 'message' => 'Query failed'], JSON_UNESCAPED_UNICODE);
  exit;
}

// --------- 输出：JSON ---------
if ($format === 'json') {
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode([
    'success' => true,
    'count' => count($rows),
    'data' => $rows
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// --------- 输出：CSV（Excel 可直接打开） ---------
if ($format === 'csv') {
  $filename = "transactions_" . date('Ymd_His') . ".csv";

  // Excel 更稳定识别 UTF-8：加 BOM
  header('Content-Type: text/csv; charset=utf-8');
  header('Content-Disposition: attachment; filename="'.$filename.'"');
  header('Pragma: no-cache');
  header('Expires: 0');

  $out = fopen('php://output', 'w');

  // UTF-8 BOM
  fwrite($out, "\xEF\xBB\xBF");

  // 表头（你可以按需增删字段）
  $headers = [
    'transaction_id','transaction_type','payment','amount','point','head_count','course_id',
    'description','transaction_time','transaction_state',
    'student_id','student_name','student_phone','is_member','student_join_date',
    'course_session_name','course_type_name','location','start_time','duration',
    'course_price','course_price_member','min_book','course_state',
    'coach_name','coach_phone'
  ];
  fputcsv($out, $headers);

  foreach ($rows as $r) {
    $line = [];
    foreach ($headers as $h) {
      $line[] = $r[$h] ?? '';
    }
    fputcsv($out, $line);
  }

  fclose($out);
  exit;
}

// --------- format 不支持 ---------
http_response_code(400);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['success' => false, 'message' => 'Unsupported format. Use ?format=json or ?format=csv'], JSON_UNESCAPED_UNICODE);
