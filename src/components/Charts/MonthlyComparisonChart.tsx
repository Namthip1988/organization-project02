import React from 'react';
import { CalendarRange, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Transaction } from '../../types';
import { formatCurrency, formatThaiShortMonth } from '../../utils/formatters';

interface MonthlyComparisonChartProps {
  allTransactions: Transaction[];
  currentMonth: string; // YYYY-MM
  onSelectMonth: (month: string) => void;
}

export const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({
  allTransactions,
  currentMonth,
  onSelectMonth,
}) => {
  // Generate list of 6 months ending in currentMonth or recent
  const [currYear, currM] = currentMonth.split('-').map(Number);
  const months: string[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(currYear, currM - 1 - i, 1);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    months.push(`${y}-${m}`);
  }

  // Calculate stats for each month
  const monthlyData = months.map((mStr) => {
    const txs = allTransactions.filter((t) => t.month === mStr);
    const income = txs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = txs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;

    return {
      monthStr: mStr,
      income,
      expense,
      balance,
      hasData: txs.length > 0,
      isCurrent: mStr === currentMonth,
    };
  });

  const maxVal = Math.max(
    ...monthlyData.map((m) => Math.max(m.income, m.expense)),
    10000
  );

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
            <CalendarRange className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">
              เปรียบเทียบสถิติย้อนหลัง 6 เดือน
            </h3>
            <p className="text-xs text-slate-400">
              วิเคราะห์แนวโน้มรายรับ-รายจ่ายต่อเนื่อง
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500" />
            <span className="text-slate-600 font-medium">รายรับ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-500" />
            <span className="text-slate-600 font-medium">รายจ่าย</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 flex flex-col justify-end">
        <div className="grid grid-cols-6 gap-2 sm:gap-4 h-48 pt-4">
          {monthlyData.map((item) => {
            const incomePercent = (item.income / maxVal) * 100;
            const expensePercent = (item.expense / maxVal) * 100;

            return (
              <div
                key={item.monthStr}
                onClick={() => onSelectMonth(item.monthStr)}
                className={`flex flex-col items-center justify-end p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
                  item.isCurrent
                    ? 'bg-emerald-50/70 border border-emerald-300 ring-2 ring-emerald-500/20 shadow-2xs'
                    : 'hover:bg-slate-50'
                }`}
                title={`คลิกเพื่อดูสรุปผลของ ${formatThaiShortMonth(item.monthStr)}`}
              >
                {/* Bars */}
                <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full pb-1">
                  <div
                    className="w-1/2 bg-emerald-500 hover:bg-emerald-600 rounded-t-sm transition-all"
                    style={{
                      height: `${Math.max(incomePercent, item.income > 0 ? 6 : 0)}%`,
                    }}
                    title={`รายรับ: ${formatCurrency(item.income)}`}
                  />
                  <div
                    className="w-1/2 bg-rose-500 hover:bg-rose-600 rounded-t-sm transition-all"
                    style={{
                      height: `${Math.max(expensePercent, item.expense > 0 ? 6 : 0)}%`,
                    }}
                    title={`รายจ่าย: ${formatCurrency(item.expense)}`}
                  />
                </div>

                {/* Balance Indicator */}
                <div className="mt-1 text-[10px] sm:text-xs font-semibold truncate text-center">
                  {item.hasData ? (
                    <span
                      className={
                        item.balance >= 0 ? 'text-teal-700' : 'text-rose-600'
                      }
                    >
                      {item.balance >= 0 ? '+' : ''}
                      {(item.balance / 1000).toFixed(0)}k
                    </span>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </div>

                {/* Month Name */}
                <span
                  className={`text-[10px] sm:text-[11px] mt-0.5 whitespace-nowrap ${
                    item.isCurrent
                      ? 'font-bold text-emerald-800'
                      : 'text-slate-500'
                  }`}
                >
                  {formatThaiShortMonth(item.monthStr)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-2 text-center text-[11px] text-slate-400">
          คลิกที่เดือนเพื่อสลับไปดูรายละเอียดของเดือนนั้น
        </div>
      </div>
    </div>
  );
};
