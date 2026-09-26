import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  CheckCircle2,
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  Sparkles,
  Layers,
  Filter,
} from 'lucide-react';
import { Transaction, MonthSummaryData, UserProfile } from '../types';
import { formatCurrency, formatThaiMonth, formatThaiDate } from '../utils/formatters';
import { getCategoryInfo } from '../constants/categories';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { User } from 'firebase/auth';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string; // YYYY-MM
  transactions: Transaction[];
  summary: MonthSummaryData;
  user: User | null;
  userProfile: UserProfile | null;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  transactions,
  summary,
  user,
  userProfile,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [includeCategories, setIncludeCategories] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);

  if (!isOpen) return null;

  // Filter and sort transactions for the PDF
  const filteredTxs = transactions
    .filter((t) => {
      if (filterType === 'all') return true;
      return t.type === filterType;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.date.localeCompare(b.date);
      }
      return b.date.localeCompare(a.date);
    });

  // Category breakdown for summary
  const expenseCategoriesMap: { [cat: string]: number } = {};
  const incomeCategoriesMap: { [cat: string]: number } = {};

  transactions.forEach((t) => {
    if (t.type === 'expense') {
      expenseCategoriesMap[t.category] = (expenseCategoriesMap[t.category] || 0) + t.amount;
    } else {
      incomeCategoriesMap[t.category] = (incomeCategoriesMap[t.category] || 0) + t.amount;
    }
  });

  const expenseCategories = Object.entries(expenseCategoriesMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: summary.totalExpense > 0 ? (amount / summary.totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const exportDate = new Date();
  const exportDateStr = `${exportDate.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })} เวลา ${exportDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`;

  // Download PDF using html2canvas & jsPDF
  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const totalPdfHeight = (canvasHeight * pdfWidth) / canvasWidth;

      let position = 0;
      let heightLeft = totalPdfHeight;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;

      // If content is longer than one page, split into multiple pages
      while (heightLeft > 0) {
        position = heightLeft - totalPdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `MoneyTrack_รายงานสรุปการเงิน_${selectedMonth}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF กรุณาลองใช้ตัวเลือก "พิมพ์ / บันทึกด้วยบราวเซอร์" แทน');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-100 rounded-3xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Toolbar (no-print) */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 bg-white border-b border-slate-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                ส่งออกรายงานการเงินประจำเดือน (PDF Document)
              </h3>
              <p className="text-xs text-slate-500">
                เอกสารทางการเงินพร้อมสรุปผลรายรับ-รายจ่ายและตารางบันทึกรายการสำหรับจัดเก็บออฟไลน์
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="สั่งพิมพ์ หรือเลือก Save as PDF ในเมนูของบราวเซอร์"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ / บันทึกผ่านบราวเซอร์</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'กำลังประมวลผล PDF...' : 'ดาวน์โหลด PDF ทันที'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Controls / Filter Bar (no-print) */}
        <div className="no-print px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-700">แสดงรายการ:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-300 outline-hidden font-medium text-slate-800"
              >
                <option value="all">ทั้งหมด (รายรับและรายจ่าย)</option>
                <option value="expense">เฉพาะรายจ่าย</option>
                <option value="income">เฉพาะรายรับ</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-700">เรียงวันที่:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-300 outline-hidden font-medium text-slate-800"
              >
                <option value="asc">วันที่: 1 ไป 31 (เก่าสุด - ล่าสุด)</option>
                <option value="desc">วันที่: ล่าสุด - เก่าสุด</option>
              </select>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer ml-2">
              <input
                type="checkbox"
                checked={includeCategories}
                onChange={(e) => setIncludeCategories(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>ตารางสรุปหมวดหมู่</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>หมายเหตุธุรกรรม</span>
            </label>
          </div>

          <div className="text-slate-400 text-[11px]">
            * เอกสารจะถูกปรับขนาดพอดีหน้ากระดาษ A4 สวยงามสำหรับเปิดอ่าน พิมพ์ หรือแชร์
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/70 flex justify-center">
          
          {/* Printable Report Document (A4 Formatted Container) */}
          <div
            id="printable-pdf-document-wrapper"
            ref={reportRef}
            className="w-full max-w-[800px] bg-white rounded-2xl shadow-md p-8 sm:p-12 text-slate-900 border border-slate-200/90 text-sm font-['Prompt',sans-serif]"
          >
            {/* 1. Header / Letterhead */}
            <div className="border-b-2 border-slate-900 pb-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">
                      MoneyTrack
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-600 uppercase">
                      Financial Statement
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-800">
                    รายงานสรุปผลการเงินและบันทึกบัญชีรายเดือน
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Monthly Income & Expense Ledger Statement
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 inline-block mb-1">
                    ประจำเดือน: {formatThaiMonth(selectedMonth)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    ออกเอกสารเมื่อ: {exportDateStr}
                  </div>
                </div>
              </div>

              {/* User Metadata */}
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">เจ้าของบัญชี</span>
                  <span className="font-bold text-slate-800">
                    {userProfile?.displayName || user?.displayName || 'ผู้ใช้งาน'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">อีเมล (Google Auth)</span>
                  <span className="font-medium text-slate-700 truncate block">
                    {user?.email || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">สกุลเงิน</span>
                  <span className="font-medium text-slate-700">บาท (THB ฿)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">การจัดเก็บข้อมูล</span>
                  <span className="font-medium text-emerald-700">Firebase Firestore</span>
                </div>
              </div>
            </div>

            {/* 2. Executive Summary Cards */}
            <div className="mb-6 page-break-avoid">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                1. สรุปภาพรวมทางการเงิน (Executive Financial Overview)
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Income */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-xl">
                  <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold mb-1">
                    <span>รายรับรวม</span>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-700">
                    {formatCurrency(summary.totalIncome)}
                  </div>
                  <span className="text-[10px] text-emerald-600">เงินเข้าในเดือน</span>
                </div>

                {/* Expense */}
                <div className="bg-rose-50/70 border border-rose-200/80 p-3.5 rounded-xl">
                  <div className="flex items-center justify-between text-rose-800 text-xs font-semibold mb-1">
                    <span>รายจ่ายรวม</span>
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-rose-600">
                    {formatCurrency(summary.totalExpense)}
                  </div>
                  <span className="text-[10px] text-rose-600">
                    {transactions.filter((t) => t.type === 'expense').length} รายการ
                  </span>
                </div>

                {/* Net Balance */}
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                  <div className="flex items-center justify-between text-slate-700 text-xs font-semibold mb-1">
                    <span>ยอดคงเหลือสุทธิ</span>
                    <PiggyBank className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                  <div
                    className={`text-lg sm:text-xl font-bold ${
                      summary.netBalance >= 0 ? 'text-slate-900' : 'text-amber-600'
                    }`}
                  >
                    {formatCurrency(summary.netBalance)}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    ออมได้ {summary.savingsRate.toFixed(1)}% ของรายรับ
                  </span>
                </div>

                {/* Budget Utilization */}
                <div className="bg-indigo-50/70 border border-indigo-200/80 p-3.5 rounded-xl">
                  <div className="flex items-center justify-between text-indigo-800 text-xs font-semibold mb-1">
                    <span>งบประมาณ</span>
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-indigo-900">
                    {summary.budgetAmount > 0 ? formatCurrency(summary.budgetAmount) : 'ไม่ได้ตั้ง'}
                  </div>
                  <span className="text-[10px] text-indigo-700">
                    {summary.budgetAmount > 0
                      ? `ใช้ไปแล้ว ${summary.budgetUsedPercent.toFixed(1)}%`
                      : 'ไม่มีเพดานงบ'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Category Breakdown Table (Optional) */}
            {includeCategories && expenseCategories.length > 0 && (
              <div className="mb-6 page-break-avoid">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  2. สรุปสัดส่วนตามหมวดหมู่รายจ่าย (Expense Category Breakdown)
                </h2>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">หมวดหมู่</th>
                        <th className="py-2 px-3 text-right">จำนวนเงิน (บาท)</th>
                        <th className="py-2 px-3 text-right w-24">สัดส่วน (%)</th>
                        <th className="py-2 px-3 w-40">แถบกราฟิก</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {expenseCategories.map((cat) => (
                        <tr key={cat.category} className="hover:bg-slate-50/50">
                          <td className="py-1.5 px-3 font-medium text-slate-800">
                            {cat.category}
                          </td>
                          <td className="py-1.5 px-3 text-right font-semibold text-rose-600">
                            {formatCurrency(cat.amount)}
                          </td>
                          <td className="py-1.5 px-3 text-right text-slate-500 font-mono">
                            {cat.percentage.toFixed(1)}%
                          </td>
                          <td className="py-1.5 px-3">
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-rose-500 h-full rounded-full"
                                style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. Detailed Transaction Ledger */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {includeCategories && expenseCategories.length > 0 ? '3.' : '2.'} รายการธุรกรรมทั้งหมด ({filteredTxs.length} รายการ)
                </h2>
                <span className="text-[11px] text-slate-400">
                  {filterType === 'all'
                    ? 'แสดงทุกรายการ'
                    : filterType === 'expense'
                    ? 'เฉพาะรายจ่าย'
                    : 'เฉพาะรายรับ'}
                </span>
              </div>

              {filteredTxs.length === 0 ? (
                <div className="p-8 text-center border border-slate-200 rounded-xl text-slate-400 text-xs">
                  ไม่มีรายการธุรกรรมในเดือนนี้
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-24">วันที่</th>
                        <th className="py-2.5 px-3">ชื่อรายการ / คำอธิบาย</th>
                        <th className="py-2.5 px-3">หมวดหมู่</th>
                        <th className="py-2.5 px-3 w-28">ช่องทางชำระ</th>
                        <th className="py-2.5 px-3 text-right w-28">จำนวนเงิน (฿)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTxs.map((tx, idx) => {
                        const isIncome = tx.type === 'income';
                        return (
                          <tr
                            key={tx.id || idx}
                            className={`page-break-avoid ${idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}
                          >
                            <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap">
                              {tx.date}
                            </td>
                            <td className="py-2 px-3">
                              <span className="font-semibold text-slate-800 block">
                                {tx.title}
                              </span>
                              {includeNotes && tx.notes && (
                                <span className="text-[10px] text-slate-400 block italic">
                                  โน้ต: {tx.notes}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                                  isIncome
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {tx.category}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                              {tx.paymentMethod || '-'}
                            </td>
                            <td
                              className={`py-2 px-3 text-right font-bold whitespace-nowrap ${
                                isIncome ? 'text-emerald-700' : 'text-rose-600'
                              }`}
                            >
                              {isIncome ? '+' : '-'}
                              {formatCurrency(tx.amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800">
                      <tr>
                        <td colSpan={4} className="py-2.5 px-3 text-right">
                          ยอดรวมสุทธิของรายการที่แสดง:
                        </td>
                        <td className="py-2.5 px-3 text-right text-sm">
                          {formatCurrency(
                            filteredTxs.reduce(
                              (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
                              0
                            )
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* 5. Statement Footer & Certification Note */}
            <div className="pt-6 border-t border-slate-200 mt-8 text-center text-[10px] text-slate-400 page-break-avoid">
              <div className="flex items-center justify-between mb-2">
                <span>ระบบบริหารจัดการการเงิน MoneyTrack</span>
                <span>สร้างจาก Google Cloud & Firebase Firestore</span>
              </div>
              <p>
                เอกสารนี้เป็นบันทึกสรุปข้อมูลทางการเงินส่วนบุคคลที่จัดทำขึ้นโดยอัตโนมัติ สำหรับใช้เป็นหลักฐานและบันทึกอ้างอิงออฟไลน์
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
