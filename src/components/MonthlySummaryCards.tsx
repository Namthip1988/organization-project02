import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { MonthSummaryData } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface MonthlySummaryCardsProps {
  summary: MonthSummaryData;
  onOpenBudgetModal: () => void;
  daysRemainingInMonth: number;
}

export const MonthlySummaryCards: React.FC<MonthlySummaryCardsProps> = ({
  summary,
  onOpenBudgetModal,
  daysRemainingInMonth,
}) => {
  const {
    totalIncome,
    totalExpense,
    netBalance,
    savingsRate,
    budgetAmount,
    remainingBudget,
    budgetUsedPercent,
    transactionCount,
  } = summary;

  // Daily spendable based on remaining budget and days left
  const dailySpendable = daysRemainingInMonth > 0 && remainingBudget > 0
    ? remainingBudget / daysRemainingInMonth
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Income */}
      <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            รายรับทั้งหมด
          </span>
          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-700">
            {formatCurrency(totalIncome)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
            <ArrowUpRight className="w-4 h-4 shrink-0" />
            <span className="font-medium">
              {totalIncome > 0 ? 'เงินเข้ากระเป๋า' : 'ยังไม่มีรายรับในเดือนนี้'}
            </span>
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full pointer-events-none" />
      </div>

      {/* 2. Total Expense */}
      <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            รายจ่ายทั้งหมด
          </span>
          <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-600">
            {formatCurrency(totalExpense)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600">
            <ArrowDownRight className="w-4 h-4 shrink-0" />
            <span className="font-medium">
              {transactionCount} รายการที่บันทึกแล้ว
            </span>
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-500/5 rounded-full pointer-events-none" />
      </div>

      {/* 3. Net Balance */}
      <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            ยอดคงเหลือสุทธิ
          </span>
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
            netBalance >= 0 ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${
            netBalance >= 0 ? 'text-slate-900' : 'text-amber-600'
          }`}>
            {formatCurrency(netBalance)}
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs">
            {netBalance >= 0 ? (
              <span className="inline-flex items-center gap-1 text-teal-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ออมเงินได้ {savingsRate.toFixed(1)}% ของรายรับ
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                รายจ่ายเกินรายรับ {formatCurrency(Math.abs(netBalance))}
              </span>
            )}
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-500/5 rounded-full pointer-events-none" />
      </div>

      {/* 4. Budget Tracking */}
      <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            งบประมาณประจำเดือน
          </span>
          <button
            onClick={onOpenBudgetModal}
            className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            ปรับงบ
          </button>
        </div>

        <div className="mt-2">
          {budgetAmount > 0 ? (
            <>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(totalExpense)}
                </span>
                <span className="text-xs text-slate-500">
                  / {formatCurrency(budgetAmount)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    budgetUsedPercent > 100
                      ? 'bg-rose-500'
                      : budgetUsedPercent > 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className={`font-medium ${
                  budgetUsedPercent > 100
                    ? 'text-rose-600'
                    : budgetUsedPercent > 80
                    ? 'text-amber-600'
                    : 'text-slate-600'
                }`}>
                  ใช้ไป {budgetUsedPercent.toFixed(1)}%
                </span>
                {remainingBudget > 0 ? (
                  <span className="text-slate-500 truncate" title={`เหลือเฉลี่ยวันละ ${formatCurrency(dailySpendable)}`}>
                    เหลือเฉลี่ย {formatCurrency(dailySpendable)}/วัน
                  </span>
                ) : (
                  <span className="text-rose-600 font-medium">เกินงบแล้ว!</span>
                )}
              </div>
            </>
          ) : (
            <div className="py-2">
              <p className="text-xs text-slate-500 mb-2">ยังไม่ได้กำหนดงบประมาณสำหรับเดือนนี้</p>
              <button
                onClick={onOpenBudgetModal}
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium border border-indigo-200 transition-colors"
              >
                <Target className="w-3.5 h-3.5" />
                ตั้งงบประมาณเดือนนี้
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
