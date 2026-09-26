import React from 'react';
import {
  Wallet,
  PieChart,
  BarChart3,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Database,
  CheckCircle2,
} from 'lucide-react';

interface LandingHeroProps {
  onSignIn: () => void;
  isConnecting: boolean;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onSignIn, isConnecting }) => {
  return (
    <div className="relative overflow-hidden py-12 sm:py-20">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-200/40 via-teal-200/30 to-indigo-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-2xs">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>เชื่อมต่อ Firebase Firestore Cloud Database เรียลไทม์</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
          จัดการรายรับ-รายจ่ายอัจฉริยะ <br />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
            สรุปผลรายเดือน & กราฟิกวิเคราะห์ครบวงจร
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          ควบคุมสุขภาพทางการเงินของคุณอย่างมีประสิทธิภาพ บันทึกทุกธุรกรรมได้อย่างง่ายดาย
          ดูแนวโน้มรายวัน สัดส่วนหมวดหมู่ และเปรียบเทียบย้อนหลัง 6 เดือนด้วยความปลอดภัยระดับโลกจาก Firebase
        </p>

        {/* Primary Gmail Sign-in Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onSignIn}
            disabled={isConnecting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isConnecting ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่ระบบด้วย Gmail (Google)'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              สรุปผลรายเดือนชัดเจน
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              ติดตามรายรับสุทธิ รายจ่ายรวม และอัตราการออมเงิน (% Savings Rate) ได้ในหน้าเดียว
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              กราฟิกโดนัท & สัดส่วนหมวดหมู่
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              เห็นโครงสร้างการใช้จ่ายแบบเจาะลึก แยกตามอาหาร ที่พัก เดินทาง ช้อปปิ้ง ชัดเจน
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              แนวโน้มรายวัน & สถิติ 6 เดือน
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              เปรียบเทียบกระแสเงินสดรายวัน และเปรียบเทียบภาพรวมประวัติศาสตร์ทางการเงินย้อนหลัง
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              บันทึกบน Firebase ส่วนตัว
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              จัดเก็บข้อมูลใน Firestore พร้อม Security Rules แยกสิทธิ์เฉพาะผู้ใช้แต่ละคน ปลอดภัย 100%
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
