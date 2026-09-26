export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

const THAI_MONTH_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const THAI_SHORT_MONTH_NAMES = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

export function formatThaiMonth(monthStr: string): string {
  if (!monthStr || !monthStr.includes('-')) return monthStr;
  const [yearStr, monthNumStr] = monthStr.split('-');
  const monthIdx = parseInt(monthNumStr, 10) - 1;
  const christianYear = parseInt(yearStr, 10);
  const thaiYear = christianYear + 543;
  const monthName = THAI_MONTH_NAMES[monthIdx] || '';
  return `${monthName} ${thaiYear}`;
}

export function formatThaiShortMonth(monthStr: string): string {
  if (!monthStr || !monthStr.includes('-')) return monthStr;
  const [yearStr, monthNumStr] = monthStr.split('-');
  const monthIdx = parseInt(monthNumStr, 10) - 1;
  const christianYear = parseInt(yearStr, 10);
  const thaiYear = (christianYear + 543).toString().slice(-2);
  const monthName = THAI_SHORT_MONTH_NAMES[monthIdx] || '';
  return `${monthName} '${thaiYear}`;
}

export function formatThaiDate(dateStr: string): string {
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  const [yearStr, monthNumStr, dayStr] = dateStr.split('-');
  const monthIdx = parseInt(monthNumStr, 10) - 1;
  const christianYear = parseInt(yearStr, 10);
  const thaiYear = christianYear + 543;
  const day = parseInt(dayStr, 10);
  const monthName = THAI_SHORT_MONTH_NAMES[monthIdx] || '';
  return `${day} ${monthName} ${thaiYear}`;
}

export function exportTransactionsToCSV(transactions: any[], filename = 'moneytrack_transactions.csv') {
  if (!transactions || transactions.length === 0) return;

  const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'ชื่อรายการ', 'จำนวนเงิน (บาท)', 'วิธีชำระเงิน', 'โน้ต'];
  const rows = transactions.map((t) => [
    t.date,
    t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
    `"${(t.category || '').replace(/"/g, '""')}"`,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.amount,
    `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
