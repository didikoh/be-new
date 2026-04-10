<?php
require_once('../vendor/tecnickcom/tcpdf/tcpdf.php'); // 路径根据你的实际位置
require_once "../connect.php"; // 包含 PDO 和 CORS 设置

// 自定义 Header
class MYPDF extends TCPDF
{
    public function Header()
    {
        // 蓝色横线
        $this->SetDrawColor(44, 62, 153);
        $this->SetLineWidth(2);
        $this->Line(10, 15, 200, 15);
    }
    public function Footer()
    {
        // Position at 15 mm from bottom
        $this->SetY(-15);
        $this->SetFont('helvetica', '', 10);
        $this->SetTextColor(128, 128, 128); // 灰色
        $this->Cell(0, 10, 'This is computer-generated document. No signature is required', 0, false, 'L', 0, '', 0, false, 'T', 'M');
    }
}

// 获取参数
$transaction_id = $_GET['transaction_id'] ?? null;

if (!$transaction_id) {
    die("无效的交易ID");
}

// 查询交易和会员信息
$stmt = $pdo->prepare("
  SELECT t.*, s.name AS student_name
  FROM transaction_list t
  LEFT JOIN student_list s ON t.student_id = s.id
  WHERE t.id = :id
");
$stmt->execute([':id' => $transaction_id]);
$row = $stmt->fetch();

if (!$row) die("未找到交易信息");

// 填充 PDF 字段
$student_name = $row['student_name'];
$invoice_no = $row['id'];
$date = date('Y-m-d', strtotime($row['time']));
$description = $row['type'];
$amount = $row['payment'] ?? 0;

// id 补零到4位
$invoice_id_str = str_pad($invoice_no, 4, '0', STR_PAD_LEFT);
// 组合成 "date-id" 格式
$custom_invoice_no = $date . '-' . $invoice_id_str;

// 创建PDF对象
$pdf = new MYPDF('P', 'mm', 'A4', true, 'UTF-8', false);

// 页边距
$pdf->SetMargins(10, 22, 10);
$pdf->SetAutoPageBreak(TRUE, 15);
$pdf->AddPage();

// 字体（Arial 用 Helvetica, TCPDF 默认支持，中文可用 DejaVu 或 simsun.ttf）
$pdf->SetFont('helvetica', '', 11);

// ===== 头部公司资料 =====
$pdf->SetTextColor(70, 76, 199);
$pdf->SetFont('helvetica', 'B', 15);
$pdf->Cell(0, 7, 'Be Glow Studio', 0, 1, 'L', 0, '', 0);
$pdf->SetFont('helvetica', '', 10);
$pdf->SetTextColor(44, 62, 153);
$pdf->Cell(0, 5, '(003717444-P)', 0, 1, 'L', 0, '', 0);
$pdf->SetTextColor(0, 0, 0);
$pdf->Cell(0, 5, '34A&34B,Jalana Kundang 1,Taman Bukit Pasir', 0, 1, 'L', 0, '', 0);
$pdf->Cell(0, 5, '83000 Batu Pahat,Johor.', 0, 1, 'L', 0, '', 0);
$pdf->Cell(0, 5, '018 769 5676', 0, 1, 'L', 0, '', 0);

$pdf->Ln(5);

// ===== 发票标题 =====
$pdf->SetFont('helvetica', 'B', 22);
$pdf->SetTextColor(44, 62, 153);
$pdf->Cell(0, 12, 'Invoice', 0, 1, 'L', 0, '', 0);

$pdf->Ln(2);

// ===== 客户与发票号/日期 =====
// 左侧：Invoice for & 客户名
$pdf->SetFont('helvetica', '', 11);
$pdf->SetTextColor(0, 0, 0);
$startY = $pdf->GetY(); // 当前Y值，备用

$pdf->Cell(60, 7, 'Invoice for', 0, 1, 'L');
$pdf->Cell(60, 7,  $student_name, 0, 1, 'L');

// 右侧：INVOICE NO. 和 DATE
$rightX = $pdf->GetPageWidth() - $pdf->getMargins()['right'] - 60; // 60为右侧块宽，可按需调整
$pdf->SetFont('helvetica', '', 10);
$pdf->SetXY($rightX, $startY); // 回到第一行的右侧
$pdf->Cell(60, 7, 'INVOICE NO.: ' . $custom_invoice_no, 0, 2, 'R'); // 右对齐

$pdf->SetFont('helvetica', '', 10);
$pdf->SetX($rightX); // 第二行同X，向下
$pdf->Cell(60, 7, 'DATE: ' . $date, 0, 1, 'R');

// 恢复光标到两行后的最大Y
$pdf->SetY($startY + 14); // 两行高
$pdf->Ln(3); // 适当间距



// ===== 表格头和内容 =====
$html = <<<EOD
<table border="0" cellpadding="6" cellspacing="0" width="100%">
<tr style="background-color:#f0f0f0;font-weight:bold;">
    <td width="50%">Description</td>
    <td width="10%" align="center">Qty</td>
    <td width="20%" align="center">Unit price</td>
    <td width="20%" align="center">Total price</td>
</tr>
<tr>
    <td>$description</td>
    <td align="center">1</td>
    <td align="center">RM $amount</td>
    <td align="center">RM $amount</td>
</tr>
<tr><td colspan="4" height="20"></td></tr>
</table>
EOD;
$pdf->SetFont('helvetica', '', 12);
$pdf->writeHTML($html, true, false, false, false, '');

// ===== 小计与总计 =====
// 小计和折扣区域靠右且不重叠
$pdf->SetFont('helvetica', 'B', 24);     
$pdf->SetTextColor(224, 27, 132);        
// 靠右对齐（比如在页宽减去边距后-60的地方）
$pdf->SetXY(170, $pdf->GetY() + 8);
$pdf->Cell(30, 8, 'RM' . $amount, 0, 1, 'R');
$pdf->SetTextColor(44, 62, 153);
$pdf->SetX(130);


// ===== 输出PDF =====
$pdf->Output('invoice.pdf', 'I');
