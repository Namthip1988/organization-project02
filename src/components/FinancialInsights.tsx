import React from 'react';
import { Lightbulb, Award, AlertCircle, Sparkles, Compass } from 'lucide-react';
import { Transaction, MonthSummaryData } from '../types';
import { formatCurrency } from '../utils/formatters';

interface FinancialInsightsProps {
  transactions: Transaction[];
  summary: MonthSummaryData;
}

export const FinancialInsights: React.FC<FinancialInsightsProps> = ({
  transactions,
  summary,
}) => {
  const { totalIncome, totalExpense, netBalance, savingsRate, budgetAmount, budgetUsedPercent } = summary;

  // Filter expenses
  const expenseTxs = transactions.filter((t) => t.type === 'expense');

  // Top spending category
  const catSums: { [cat: string]: number } = {};
  expenseTxs.forEach((t) => {
    catSums[t.category] = (catSums[t.category] || 0) + t.amount;
  });

  const sortedCats = Object.entries(catSums).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCats[0];

  // Highest single expense
  const highestExpense = expenseTxs.reduce<Transaction | null>(
    (max, t) => (!max || t.amount > max.amount ? t : max),
    null
  );

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-indigo-900/50">
      <div className="flex items-center justify-between pb-3 border-b border-indigo-800/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm text-slate-100">
            สรุปบทวิเคราะห์การเงินอัจฉริยะ (Financial Insights)
          </h3>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-500/20">
          วิเคราะห์อัตโนมัติ
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Insight 1: Top Category */}
        <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-indigo-300 text-xs mb-1 font-medium">
            <Compass className="w-3.5 h-3.5" />
            หมวดหมู่ที่จ่ายมากที่สุด
          </div>
          {topCategory ? (
            <div>
              <div className="text-base font-bold text-white truncate">
                {topCategory[0]}
              </div>
              <div className="text-xs text-indigo-200/80 mt-0.5">
                {formatCurrency(topCategory[1])} (
                {totalExpense > 0
                  ? ((topCategory[1] / totalExpense) * 100).toFixed(0)
                  : 0}
                % ของรายจ่ายทั้งหมด)
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 mt-1">ยังไม่มีข้อมูลรายจ่าย</div>
          )}
        </div>

        {/* Insight 2: Savings Health */}
        <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-teal-300 text-xs mb-1 font-medium">
            <Award className="w-3.5 h-3.5" />
            สุขภาพทางการเงิน
          </div>
          {totalIncome > 0 ? (
            <div>
              <div className="text-base font-bold text-teal-200">
                {savingsRate >= 20
                  ? 'ยอดเยี่ยม (สุขภาพดี)'
                  : savingsRate >= 10
                  ? 'อยู่ในเกณฑ์ดี'
                  : savingsRate >= 0
                  ? 'พอใช้ (ควรเพิ่มเงินออม)'
                  : 'รายจ่ายสูงกว่ารายรับ'}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                อัตราการออมสุทธิ {savingsRate.toFixed(1)}% (
                {netBalance >= 0 ? `+${formatCurrency(netBalance)}` : formatCurrency(netBalance)})
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 mt-1">รอการบันทึกรายรับ</div>
          )}
        </div>

        {/* Insight 3: Single Highest Transaction */}
        <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-amber-300 text-xs mb-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            รายการจ่ายสูงสุดในเดือน
          </div>
          {highestExpense ? (
            <div>
              <div className="text-base font-bold text-amber-200 truncate">
                {highestExpense.title}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                {formatCurrency(highestExpense.amount)} ({highestExpense.date})
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 mt-1">ยังไม่มีรายจ่ายชิ้นใหญ่</div>
          )}
        </div>
      </div>

      {/* Advisory tip */}
      <div className="mt-3.5 flex items-start gap-2.5 text-xs text-indigo-200/90 bg-indigo-950/60 p-2.5 rounded-xl border border-indigo-800/30">
        <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {budgetAmount > 0 && budgetUsedPercent > 90 ? (
            <span className="text-amber-200 font-medium">
              คำแนะนำ: คุณได้ใช้งบประมาณไปแล้ว {budgetUsedPercent.toFixed(0)}% ควรระมัดระวังค่าใช้จ่ายไม่จำเป็นในช่วงวันที่เหลือของเดือน
            </span>
          ) : savingsRate >= 20 ? (
            <span>
              เยี่ยมมาก! การออมเงินเกิน 20% ของรายได้ตามหลักสากล 50/30/20 ช่วยสร้างความมั่นคงทางการเงินและกองทุนฉุกเฉินได้อย่างรวดเร็ว
            </span>
          ) : (
            <span>
              เทคนิคการเงิน: ลองตั้งเป้าหมายเก็บออมทันทีที่เงินเดือนเข้า (Pay Yourself First) อย่างน้อย 10-20% เพื่ออนาคตที่มั่นคง
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
