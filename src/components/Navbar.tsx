import React from 'react';
import {
  Wallet,
  ChevronLeft,
  ChevronRight,
  Calendar,
  LogOut,
  Sliders,
  Sparkles,
  Database,
  User as UserIcon,
  FileText,
} from 'lucide-react';
import { formatThaiMonth } from '../utils/formatters';
import { User } from 'firebase/auth';

interface NavbarProps {
  user: User | null;
  selectedMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  onOpenBudgetModal: () => void;
  onOpenPdfModal: () => void;
  onSignOut: () => void;
  onSignIn: () => void;
  onSeedDemoData: () => void;
  isSeeding: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  selectedMonth,
  onMonthChange,
  onOpenBudgetModal,
  onOpenPdfModal,
  onSignOut,
  onSignIn,
  onSeedDemoData,
  isSeeding,
}) => {
  // Navigate months
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    const prevYear = date.getFullYear();
    const prevMonth = (date.getMonth() + 1).toString().padStart(2, '0');
    onMonthChange(`${prevYear}-${prevMonth}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    const nextYear = date.getFullYear();
    const nextMonth = (date.getMonth() + 1).toString().padStart(2, '0');
    onMonthChange(`${nextYear}-${nextMonth}`);
  };

  const handleMonthInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onMonthChange(e.target.value);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 p-0.5 shadow-md shadow-emerald-500/15 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-900/10 rounded-[14px] flex items-center justify-center text-white">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-slate-900 via-emerald-950 to-indigo-950 bg-clip-text text-transparent">
                  MoneyTrack
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <Database className="w-3 h-3" />
                  Firebase
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block truncate">
                ระบบจัดการรายรับรายจ่าย & วิเคราะห์การเงินรายเดือน
              </p>
            </div>
          </div>

          {/* Month Selector */}
          <div className="flex items-center bg-slate-100/90 hover:bg-slate-100 p-1 rounded-xl border border-slate-200/70 shadow-2xs transition-colors">
            <button
              onClick={handlePrevMonth}
              title="เดือนก่อนหน้า"
              className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="relative flex items-center px-2 sm:px-3">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 mr-1.5 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-slate-800 whitespace-nowrap">
                {formatThaiMonth(selectedMonth)}
              </span>
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthInput}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="เลือกเดือน"
              />
            </div>

            <button
              onClick={handleNextMonth}
              title="เดือนถัดไป"
              className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Right Action: Demo Data, Budget & User Profile */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={onSeedDemoData}
                  disabled={isSeeding}
                  title="ใส่ข้อมูลจำลองเพื่อทดลองใช้งาน"
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50/90 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  {isSeeding ? 'กำลังสร้างข้อมูล...' : 'ใส่ข้อมูลตัวอย่าง'}
                </button>

                <button
                  onClick={onOpenBudgetModal}
                  title="ตั้งค่างบประมาณประจำเดือน"
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">ตั้งงบประมาณ</span>
                </button>

                <button
                  onClick={onOpenPdfModal}
                  title="ส่งออกรายงานสรุปประจำเดือนเป็นเอกสาร PDF"
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden sm:inline">ส่งออก PDF</span>
                </button>

                {/* Profile Pill */}
                <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full ring-2 ring-emerald-500/20 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      {user.displayName ? user.displayName.charAt(0) : <UserIcon className="w-4 h-4" />}
                    </div>
                  )}
                  <div className="hidden lg:block text-left text-xs leading-tight">
                    <div className="font-semibold text-slate-800 truncate max-w-[130px]">
                      {user.displayName || 'ผู้ใช้งาน'}
                    </div>
                    <div className="text-slate-400 text-[10px] truncate max-w-[130px]">
                      {user.email}
                    </div>
                  </div>
                  <button
                    onClick={onSignOut}
                    title="ออกจากระบบ"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onSignIn}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>เข้าสู่ระบบด้วย Gmail</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
