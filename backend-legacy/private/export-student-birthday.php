<?php
require_once '../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

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

// Get the month parameter (1-12)
$month = isset($_GET['month']) ? intval($_GET['month']) : date('n');

if ($month < 1 || $month > 12) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid month parameter. Must be between 1 and 12.']);
  exit;
}

try {
  // Connect to database
  $dsn = "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']}";
  $pdo = new PDO($dsn, $config['user'], $config['pass'], [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
  ]);

  // Query to get students with birthday in the selected month, including card information
  $sql = "
    SELECT 
      s.id,
      s.phone,
      s.name,
      s.birthday,
      s.is_member,
      s.join_date,
      s.point,
      uc.id as card_id,
      ct.name as card_type,
      ct.description as card_description,
      uc.balance,
      uc.frozen_balance,
      uc.expired_balance,
      uc.status as card_status,
      uc.valid_balance_to,
      uc.valid_from,
      uc.valid_to,
      ct.allow_multi_booking,
      ct.expiry_affect_balance
    FROM student_list s
    LEFT JOIN user_cards uc ON s.id = uc.student_id
    LEFT JOIN card_types ct ON uc.card_type_id = ct.id
    WHERE MONTH(s.birthday) = :month
    ORDER BY s.name, uc.id
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute(['month' => $month]);
  $students = $stmt->fetchAll();

  if (empty($students)) {
    http_response_code(404);
    echo json_encode(['message' => 'No students found with birthdays in month ' . $month]);
    exit;
  }

  // Create new Spreadsheet
  $spreadsheet = new Spreadsheet();
  $sheet = $spreadsheet->getActiveSheet();
  $sheet->setTitle('Birthday Students');

  // Set header row
  $headers = [
    'A1' => 'Student ID',
    'B1' => 'Name',
    'C1' => 'Phone',
    'D1' => 'Birthday',
    'E1' => 'Member',
    'F1' => 'Join Date',
    'G1' => 'Points',
    'H1' => 'Card ID',
    'I1' => 'Card Type',
    'J1' => 'Card Description',
    'K1' => 'Balance',
    'L1' => 'Frozen Balance',
    'M1' => 'Expired Balance',
    'N1' => 'Card Status',
    'O1' => 'Valid Balance To',
    'P1' => 'Valid From',
    'Q1' => 'Valid To',
    'R1' => 'Multi Booking',
    'S1' => 'Expiry Affect Balance'
  ];

  foreach ($headers as $cell => $value) {
    $sheet->setCellValue($cell, $value);
  }

  // Style the header row
  $headerStyle = [
    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
    'fill' => [
      'fillType' => Fill::FILL_SOLID,
      'startColor' => ['rgb' => '4472C4']
    ],
    'alignment' => [
      'horizontal' => Alignment::HORIZONTAL_CENTER,
      'vertical' => Alignment::VERTICAL_CENTER
    ],
    'borders' => [
      'allBorders' => [
        'borderStyle' => Border::BORDER_THIN,
        'color' => ['rgb' => '000000']
      ]
    ]
  ];
  $sheet->getStyle('A1:S1')->applyFromArray($headerStyle);

  // Auto-size columns
  foreach (range('A', 'S') as $col) {
    $sheet->getColumnDimension($col)->setAutoSize(true);
  }

  // Fill data
  $row = 2;
  foreach ($students as $student) {
    $sheet->setCellValue('A' . $row, $student['id']);
    $sheet->setCellValue('B' . $row, $student['name']);
    $sheet->setCellValue('C' . $row, $student['phone']);
    $sheet->setCellValue('D' . $row, $student['birthday']);
    $sheet->setCellValue('E' . $row, $student['is_member'] ? 'Yes' : 'No');
    $sheet->setCellValue('F' . $row, $student['join_date']);
    $sheet->setCellValue('G' . $row, $student['point']);
    $sheet->setCellValue('H' . $row, $student['card_id'] ?? 'N/A');
    $sheet->setCellValue('I' . $row, $student['card_type'] ?? 'N/A');
    $sheet->setCellValue('J' . $row, $student['card_description'] ?? 'N/A');
    $sheet->setCellValue('K' . $row, $student['balance'] ?? '0.00');
    $sheet->setCellValue('L' . $row, $student['frozen_balance'] ?? '0.00');
    $sheet->setCellValue('M' . $row, $student['expired_balance'] ?? '0.00');
    
    $cardStatusText = 'N/A';
    if ($student['card_status'] !== null) {
      $cardStatusText = $student['card_status'] == 1 ? 'Active' : 'Inactive';
    }
    $sheet->setCellValue('N' . $row, $cardStatusText);
    
    $sheet->setCellValue('O' . $row, $student['valid_balance_to'] ?? 'N/A');
    $sheet->setCellValue('P' . $row, $student['valid_from'] ?? 'N/A');
    $sheet->setCellValue('Q' . $row, $student['valid_to'] ?? 'N/A');
    
    $multiBooking = 'N/A';
    if ($student['allow_multi_booking'] !== null) {
      $multiBooking = $student['allow_multi_booking'] ? 'Yes' : 'No';
    }
    $sheet->setCellValue('R' . $row, $multiBooking);
    
    $expiryAffect = 'N/A';
    if ($student['expiry_affect_balance'] !== null) {
      $expiryAffect = $student['expiry_affect_balance'] ? 'Yes' : 'No';
    }
    $sheet->setCellValue('S' . $row, $expiryAffect);
    
    // Add borders to data rows
    $sheet->getStyle('A' . $row . ':S' . $row)->applyFromArray([
      'borders' => [
        'allBorders' => [
          'borderStyle' => Border::BORDER_THIN,
          'color' => ['rgb' => 'CCCCCC']
        ]
      ]
    ]);
    
    $row++;
  }

  // Set the filename with month name
  $monthNames = [
    1 => 'January', 2 => 'February', 3 => 'March', 4 => 'April',
    5 => 'May', 6 => 'June', 7 => 'July', 8 => 'August',
    9 => 'September', 10 => 'October', 11 => 'November', 12 => 'December'
  ];
  
  $filename = 'Birthday_Students_' . $monthNames[$month] . '_' . date('Y') . '.xlsx';

  // Set headers for file download
  header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  header('Content-Disposition: attachment;filename="' . $filename . '"');
  header('Cache-Control: max-age=0');

  // Write file to output
  $writer = new Xlsx($spreadsheet);
  $writer->save('php://output');
  
  exit;

} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
  exit;
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
  exit;
}
