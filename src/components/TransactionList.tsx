import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Edit2,
  Trash2,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  AlertCircle,
  Receipt,
  Plus,
  FileText,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatThaiDate, exportTransactionsToCSV } from '../utils/formatters';
import { getCategoryInfo, ALL_CATEGORIES } from '../constants/categories';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (txId: string) => Promise<void>;
  onAddNew: () => void;
  onOpenPdfModal: () => void;
  selectedMonth: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onAddNew,
  onOpenPdfModal,
  selectedMonth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered and sorted transactions
  const processedTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Filter by type
        if (filterType !== 'all' && t.type !== filterType) return false;
        // Filter by category
        if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchCategory = t.category.toLowerCase().includes(q);
          const matchNotes = (t.notes || '').toLowerCase().includes(q);
          const matchMethod = (t.paymentMethod || '').toLowerCase().includes(q);
          if (!matchTitle && !matchCategory && !matchNotes && !matchMethod) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return b.date !== a.date ? b.date.localeCompare(a.date) : (b.createdAt || '').localeCompare(a.createdAt || '');
        }
        if (sortBy === 'date_asc') {
          return a.date !== b.date ? a.date.localeCompare(b.date) : (a.createdAt || '').localeCompare(b.createdAt || '');
        }
        if (sortBy === 'amount_desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount_asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, filterType, selectedCategory, searchQuery, sortBy]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteId);
      setDeleteId(null);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(
      processedTransactions,
      `MoneyTrack_${selectedMonth}_transactions.csv`
    );
  };

  // Unique categories in current month
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [transactions]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* List Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">
              ประวัติรายการรายรับ-รายจ่าย
            </h3>
            <p className="text-xs text-slate-500">
              พบ {processedTransactions.length} รายการ (จากทั้งหมด {transactions.length} รายการในเดือนนี้)
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleExportCSV}
              disabled={processedTransactions.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-40"
              title="ส่งออกรายการเป็นไฟล์ CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ส่งออก CSV</span>
            </button>

            <button
              onClick={onOpenPdfModal}
              disabled={transactions.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-colors disabled:opacity-40"
              title="ส่งออกสรุปผลและรายการธุรกรรมเป็นเอกสาร PDF"
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span>ส่งออก PDF</span>
            </button>

            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มรายการ</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
          {/* Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อรายการ, หมวดหมู่, โน้ต..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-hidden"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="sm:col-span-3 flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 py-1 rounded-md transition-all font-medium ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`flex-1 py-1 rounded-md transition-all font-medium ${
                filterType === 'expense'
                  ? 'bg-white text-rose-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`flex-1 py-1 rounded-md transition-all font-medium ${
                filterType === 'income'
                  ? 'bg-white text-emerald-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ
            </button>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-hidden"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-hidden"
            >
              <option value="date_desc">วันที่: ล่าสุด</option>
              <option value="date_asc">วันที่: เก่าสุด</option>
              <option value="amount_desc">จำนวนเงิน: สูง-ต่ำ</option>
              <option value="amount_asc">จำนวนเงิน: ต่ำ-สูง</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List Body */}
      {processedTransactions.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <p className="text-slate-700 font-semibold text-sm">
            {transactions.length === 0
              ? 'ยังไม่มีรายการสำหรับเดือนนี้'
              : 'ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา'}
          </p>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            {transactions.length === 0
              ? 'คุณสามารถคลิกปุ่ม "เพิ่มรายการ" ด้านบน หรือกดปุ่ม "ใส่ข้อมูลตัวอย่าง" เพื่อเริ่มต้นได้ทันที'
              : 'ลองปรับคำค้นหา หรือรีเซ็ตตัวกรองหมวดหมู่'}
          </p>
          {transactions.length === 0 && (
            <button
              onClick={onAddNew}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              เริ่มบันทึกรายการแรก
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-x-auto">
          {processedTransactions.map((tx) => {
            const catInfo = getCategoryInfo(tx.category, tx.type);
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 group"
              >
                {/* Left: Category Icon & Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                    style={{ backgroundColor: catInfo.bgLight, color: catInfo.color }}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: catInfo.color }} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm truncate">
                        {tx.title}
                      </span>
                      <span
                        className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-medium"
                        style={{ backgroundColor: catInfo.bgLight, color: catInfo.color }}
                      >
                        {tx.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatThaiDate(tx.date)}
                      </span>
                      {tx.paymentMethod && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{tx.paymentMethod}</span>
                        </>
                      )}
                      {tx.notes && (
                        <>
                          <span>•</span>
                          <span className="italic truncate max-w-[150px]" title={tx.notes}>
                            "{tx.notes}"
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-bold tracking-tight ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {isIncome ? 'รายรับ' : 'รายจ่าย'}
                    </span>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(tx)}
                      title="แก้ไขรายการ"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(tx.id)}
                      title="ลบรายการ"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">
              ยืนยันการลบรายการ?
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              เมื่อลบรายการนี้แล้ว ข้อมูลจะถูกลบออกจากฐานข้อมูล Firebase ทันทีและไม่สามารถกู้คืนได้
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
