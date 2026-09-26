import React, { useState } from 'react';
import { BarChart3, Calendar, Info } from 'lucide-react';
import { Transaction } from '../../types';
import { formatCurrency, formatThaiDate } from '../../utils/formatters';

interface DailyTrendChartProps {
  transactions: Transaction[];
  selectedMonth: string; // YYYY-MM
}

export const DailyTrendChart: React.FC<DailyTrendChartProps> = ({
  transactions,
  selectedMonth,
}) => {
  const [hoveredDay, setHoveredDay] = useState<{
    day: number;
    date: string;
    income: number;
    expense: number;
  } | null>(null);

  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  // Number of days in current month
  const totalDays = new Date(year, month, 0).getDate();

  // Aggregate daily income and expense
  const dailyData: Array<{
    day: number;
    date: string;
    income: number;
    expense: number;
  }> = [];

  for (let d = 1; d <= totalDays; d++) {
    const dayPadded = d.toString().padStart(2, '0');
    const dateStr = `${selectedMonth}-${dayPadded}`;
    dailyData.push({
      day: d,
      date: dateStr,
      income: 0,
      expense: 0,
    });
  }

  transactions.forEach((tx) => {
    if (tx.month === selectedMonth && tx.date) {
      const dayNum = parseInt(tx.date.split('-')[2], 10);
      if (dayNum >= 1 && dayNum <= totalDays) {
        if (tx.type === 'income') {
          dailyData[dayNum - 1].income += tx.amount;
        } else {
          dailyData[dayNum - 1].expense += tx.amount;
        }
      }
    }
  });

  // Find max value for scaling
  const maxVal = Math.max(
    ...dailyData.map((d) => Math.max(d.income, d.expense)),
    1000
  );

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">
              แนวโน้มรายวัน (Daily Cash Flow)
            </h3>
            <p className="text-xs text-slate-400">
              เปรียบเทียบรายรับและรายจ่ายในแต่ละวันของเดือน
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="text-slate-600 font-medium">รายรับ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-500" />
            <span className="text-slate-600 font-medium">รายจ่าย</span>
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="mt-6 flex-1 flex flex-col justify-end">
        {/* Hovered Day Tooltip Card */}
        <div className="h-10 mb-2 flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-xl text-xs border border-slate-100">
          {hoveredDay ? (
            <>
              <span className="font-semibold text-slate-700">
                {formatThaiDate(hoveredDay.date)}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-700 font-medium">
                  รับ: +{formatCurrency(hoveredDay.income)}
                </span>
                <span className="text-rose-600 font-medium">
                  จ่าย: -{formatCurrency(hoveredDay.expense)}
                </span>
                <span
                  className={`font-semibold ${
                    hoveredDay.income - hoveredDay.expense >= 0
                      ? 'text-teal-700'
                      : 'text-amber-600'
                  }`}
                >
                  คงเหลือ: {formatCurrency(hoveredDay.income - hoveredDay.expense)}
                </span>
              </div>
            </>
          ) : (
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <Info className="w-3.5 h-3.5" />
              ชี้หรือแตะที่แท่งกราฟเพื่อดูรายละเอียดของแต่ละวัน
            </span>
          )}
        </div>

        {/* Bars Container */}
        <div className="flex items-end gap-1 sm:gap-1.5 h-44 sm:h-52 pt-4 px-1 overflow-x-auto">
          {dailyData.map((d) => {
            const incomeHeightPercent = (d.income / maxVal) * 100;
            const expenseHeightPercent = (d.expense / maxVal) * 100;
            const hasData = d.income > 0 || d.expense > 0;
            const isHovered = hoveredDay?.day === d.day;

            return (
              <div
                key={d.day}
                className="flex-1 min-w-[8px] sm:min-w-[12px] flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setHoveredDay(d)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Bar columns side by side */}
                <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full pb-1">
                  {/* Income bar */}
                  <div
                    className={`w-1/2 rounded-t-sm transition-all duration-300 ${
                      d.income > 0 ? 'bg-emerald-500 group-hover:bg-emerald-400' : 'bg-transparent'
                    } ${isHovered ? 'ring-1 ring-emerald-300' : ''}`}
                    style={{
                      height: `${Math.max(incomeHeightPercent, d.income > 0 ? 5 : 0)}%`,
                    }}
                  />
                  {/* Expense bar */}
                  <div
                    className={`w-1/2 rounded-t-sm transition-all duration-300 ${
                      d.expense > 0 ? 'bg-rose-500 group-hover:bg-rose-400' : 'bg-transparent'
                    } ${isHovered ? 'ring-1 ring-rose-300' : ''}`}
                    style={{
                      height: `${Math.max(expenseHeightPercent, d.expense > 0 ? 5 : 0)}%`,
                    }}
                  />
                </div>

                {/* Day label */}
                <div
                  className={`text-[9px] sm:text-[10px] text-center font-mono mt-1 ${
                    hasData
                      ? 'text-slate-800 font-semibold'
                      : 'text-slate-300'
                  }`}
                >
                  {d.day % 2 === 1 || totalDays <= 15 ? d.day : ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis bottom label */}
        <div className="mt-2 text-center text-[11px] text-slate-400">
          วันที่ 1 - {totalDays}
        </div>
      </div>
    </div>
  );
};
