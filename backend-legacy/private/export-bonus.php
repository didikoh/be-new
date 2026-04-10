<?php
declare(strict_types=1);

date_default_timezone_set('Asia/Kuala_Lumpur'); // 马来西亚时区

require __DIR__ . '/../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

$year = (int)date('Y'); // 直接使用当前年份
$start = sprintf('%04d-08-01 00:00:00', $year);
$end   = sprintf('%04d-10-01 00:00:00', $year);

// 数据库配置 - 请根据项目修改
$dbHost =  'bestudiobp.com';
$dbName = 'u839013241_bestudio';
$dbUser = 'u839013241_beadmin';
$dbPass = 'HxDb!20BeS@Xh785!';
$charset = 'utf8mb4';

$dsn = "mysql:host={$dbHost};dbname={$dbName};charset={$charset}";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $dbUser, $dbPass, $options);
} catch (Exception $e) {
    http_response_code(500);
    echo 'DB connection error';
    exit;
}

// 查询：type = 'Top Up Package', payment = 0, amount > 0, time in Aug+Sep of $year
// 关联student_list表获取学生姓名和电话
$sql = "SELECT t.student_id, s.name, s.phone, t.amount, t.`time`
        FROM transaction_list t
        LEFT JOIN student_list s ON t.student_id = s.id
        WHERE t.`type` = :typeVal
          AND t.payment = 0
          AND t.amount > 0
          AND t.`time` >= :start
          AND t.`time` < :end
        ORDER BY t.`time` ASC";
$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':typeVal' => 'Top Up Package',
    ':start' => $start,
    ':end' => $end,
]);
$rows = $stmt->fetchAll();

// 创建 Excel
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setTitle("TopUp_Aug_Sep_{$year}");

// 表头
$headers = ['student_id','name','phone','amount','time'];
$col = 'A';
foreach ($headers as $h) {
    $sheet->setCellValue($col . '1', $h);
    $col++;
}

// 数据行
$r = 2;
foreach ($rows as $row) {
    $col = 'A';
    foreach ($headers as $h) {
        $sheet->setCellValue($col . $r, $row[$h]);
        $col++;
    }
    $r++;
}

// 输出为下载文件
$filename = "transactions_TopUp_Aug_Sep_{$year}.xlsx";
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment;filename="' . $filename . '"');
header('Cache-Control: max-age=0');

$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
?>