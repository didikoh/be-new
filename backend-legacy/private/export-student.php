<?php

declare(strict_types=1);

date_default_timezone_set('Asia/Kuala_Lumpur'); // 马来西亚时区

require __DIR__ . '/../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

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

try {
  // 建立 PDO 连接
  $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', $config['host'], $config['dbname'], $config['charset']);
  $pdo = new PDO($dsn, $config['user'], $config['pass'], [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);

  // ✅ SQL 查询（去掉 card_count，加入 valid_balance_to/valid_from/valid_to）
  $sql = "
    SELECT
      s.id                              AS student_id,
      s.name                            AS student_name,
      COALESCE(NULLIF(s.phone,''), u.phone) AS phone,
      s.is_member,
      s.point                           AS points,
      s.birthday,
      s.join_date,
      -- 卡片余额汇总
      COALESCE(SUM(uc.balance), 0)         AS total_balance,
      COALESCE(SUM(uc.frozen_balance), 0)  AS total_frozen_balance,
      COALESCE(SUM(uc.expired_balance), 0) AS total_expired_balance,
      -- 有效期聚合
      MAX(uc.valid_balance_to) AS valid_balance_to,
      MIN(uc.valid_from)       AS valid_from,
      MAX(uc.valid_to)         AS valid_to
    FROM student_list s
    LEFT JOIN user_list u
      ON s.user_id = u.id
    LEFT JOIN user_cards uc
      ON uc.student_id = s.id
      WHERE MONTH(s.birthday) IN (2)
    GROUP BY
      s.id, s.name, phone, s.is_member, s.point, s.birthday, s.join_date
    ORDER BY s.id ASC
  ";

  $stmt = $pdo->query($sql);
  $rows = $stmt->fetchAll();

  // 生成 Excel
  $spreadsheet = new Spreadsheet();
  $sheet = $spreadsheet->getActiveSheet();
  $sheet->setTitle('Students');

  // 表头
  $headers = [
    'A1' => 'Student ID',
    'B1' => 'Name',
    'C1' => 'Phone',
    'D1' => 'Is Member',
    'E1' => 'Points',
    'F1' => 'Birthday',
    'G1' => 'Join Date',
    'H1' => 'Total Balance',
    'I1' => 'Frozen Balance',
    'J1' => 'Expired Balance',
    'K1' => 'Valid Balance To',
    'L1' => 'Valid From',
    'M1' => 'Valid To',
  ];
  foreach ($headers as $cell => $title) {
    $sheet->setCellValue($cell, $title);
  }

  // 填充数据
  $rowIndex = 2;
  foreach ($rows as $r) {
    $isMemberText = (string)((int)$r['is_member']) === '1' ? 'Yes' : 'No';
    $birthday = $r['birthday'] ? date('Y-m-d', strtotime($r['birthday'])) : '';
    $joinDate = $r['join_date'] ? date('Y-m-d', strtotime($r['join_date'])) : '';
    $validBalanceTo = $r['valid_balance_to'] ? date('Y-m-d', strtotime($r['valid_balance_to'])) : '';
    $validFrom = $r['valid_from'] ? date('Y-m-d', strtotime($r['valid_from'])) : '';
    $validTo = $r['valid_to'] ? date('Y-m-d', strtotime($r['valid_to'])) : '';

    $sheet->setCellValue("A{$rowIndex}", (int)$r['student_id']);
    $sheet->setCellValueExplicit("B{$rowIndex}", (string)$r['student_name'], \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
    $sheet->setCellValueExplicit("C{$rowIndex}", (string)$r['phone'], \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
    $sheet->setCellValue("D{$rowIndex}", $isMemberText);
    $sheet->setCellValue("E{$rowIndex}", (float)$r['points']);
    $sheet->setCellValue("F{$rowIndex}", $birthday);
    $sheet->setCellValue("G{$rowIndex}", $joinDate);
    $sheet->setCellValue("H{$rowIndex}", (float)$r['total_balance']);
    $sheet->setCellValue("I{$rowIndex}", (float)$r['total_frozen_balance']);
    $sheet->setCellValue("J{$rowIndex}", (float)$r['total_expired_balance']);
    $sheet->setCellValue("K{$rowIndex}", $validBalanceTo);
    $sheet->setCellValue("L{$rowIndex}", $validFrom);
    $sheet->setCellValue("M{$rowIndex}", $validTo);
    $rowIndex++;
  }

  // 自动列宽
  foreach (range('A', 'M') as $col) {
    $sheet->getColumnDimension($col)->setAutoSize(true);
  }

  // 输出下载
  $filename = 'students_' . date('Ymd_His') . '.xlsx';
  header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  header('Content-Disposition: attachment; filename="' . $filename . '"');
  header('Cache-Control: max-age=0');

  $writer = new Xlsx($spreadsheet);
  $writer->save('php://output');
  exit;
} catch (Throwable $e) {
  http_response_code(500);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode([
    'error' => true,
    'message' => $e->getMessage(),
  ], JSON_UNESCAPED_UNICODE);
  exit;
}
