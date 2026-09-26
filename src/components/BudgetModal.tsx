import React, { useState, useEffect } from 'react';
import { X, Target, Save, Check } from 'lucide-react';
import { formatCurrency, formatThaiMonth } from '../utils/formatters';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  selectedMonth: string;
  onSaveBudget: (amount: number) => Promise<void>;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  currentBudget,
  selectedMonth,
  onSaveBudget,
}) => {
  const [budgetStr, setBudgetStr] = useState(currentBudget.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBudgetStr(currentBudget > 0 ? currentBudget.toString() : '25000');
    setError(null);
  }, [currentBudget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(budgetStr);
    if (isNaN(amount) || amount < 0) {
      setError('กรุณากรอกงบประมาณที่เป็นจำนวนบวก');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveBudget(amount);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'บันทึกงบประมาณไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  const presetValues = [15000, 20000, 25000, 30000, 40000, 50000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                ตั้งค่างบประมาณ
              </h3>
              <p className="text-xs text-slate-500">
                สำหรับเดือน {formatThaiMonth(selectedMonth)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              งบประมาณรายจ่ายสูงสุดในเดือนนี้ (บาท)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                ฿
              </span>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={budgetStr}
                onChange={(e) => setBudgetStr(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-xl font-bold text-slate-900 outline-hidden transition-all"
                placeholder="25000"
                autoFocus
              />
            </div>

            {/* Presets */}
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 mr-1">งบยอดนิยม:</span>
              {presetValues.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBudgetStr(val.toString())}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    parseFloat(budgetStr) === val
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {formatCurrency(val)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900">
            ระบบจะใช้ตัวเลขนี้ในการคำนวณแถบสถานะการใช้เงิน แจ้งเตือนเมื่อใกล้เกินงบ และคำนวณยอดเงินที่สามารถใช้ได้เฉลี่ยต่อวัน
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกงบประมาณ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
