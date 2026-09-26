import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  testConnection,
  subscribeUserTransactions,
  subscribeMonthlyBudget,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  setMonthlyBudget,
  getUserProfile,
  updateUserBudget,
} from './firebase';
import { Transaction, MonthSummaryData, MonthlyBudget, UserProfile, TransactionType } from './types';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { MonthlySummaryCards } from './components/MonthlySummaryCards';
import { CategoryPieChart } from './components/Charts/CategoryPieChart';
import { DailyTrendChart } from './components/Charts/DailyTrendChart';
import { MonthlyComparisonChart } from './components/Charts/MonthlyComparisonChart';
import { FinancialInsights } from './components/FinancialInsights';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { PdfExportModal } from './components/PdfExportModal';
import { seedDemoTransactions } from './utils/demoData';
import { formatThaiMonth } from './utils/formatters';
import { onAuthStateChanged } from 'firebase/auth';
import { Plus, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Current user state
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Selected month (format: YYYY-MM)
  const currentMonthInitial = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = (today.getMonth() + 1).toString().padStart(2, '0');
    return `${y}-${m}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthInitial);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyBudgetDoc, setMonthlyBudgetDoc] = useState<MonthlyBudget | null>(null);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [categoryChartType, setCategoryChartType] = useState<'expense' | 'income'>('expense');

  // Loading & notification states
  const [isSeeding, setIsSeeding] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Test connection on boot per Firebase skill guidelines
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      } else {
        setUserProfile(null);
        setTransactions([]);
        setMonthlyBudgetDoc(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to user transactions in real-time
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeUserTransactions(
      user.uid,
      (data) => {
        setTransactions(data);
      },
      (err) => {
        console.error('Error subscribing to transactions:', err);
        showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลธุรกรรม', 'error');
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Subscribe to monthly budget for selected month
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeMonthlyBudget(
      user.uid,
      selectedMonth,
      (b) => {
        setMonthlyBudgetDoc(b);
      },
      (err) => {
        console.error('Error subscribing to monthly budget:', err);
      }
    );

    return () => unsubscribe();
  }, [user, selectedMonth]);

  // Filter transactions for current selected month
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => t.month === selectedMonth);
  }, [transactions, selectedMonth]);

  // Calculate summary metrics for the selected month
  const summary: MonthSummaryData = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    currentMonthTransactions.forEach((t) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(((totalIncome - totalExpense) / totalIncome) * 100, 0) : 0;
    const budgetAmount = monthlyBudgetDoc?.amount ?? (userProfile?.monthlyBudget || 0);
    const remainingBudget = Math.max(budgetAmount - totalExpense, 0);
    const budgetUsedPercent = budgetAmount > 0 ? (totalExpense / budgetAmount) * 100 : 0;

    return {
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      transactionCount: currentMonthTransactions.length,
      budgetAmount,
      remainingBudget,
      budgetUsedPercent,
    };
  }, [currentMonthTransactions, monthlyBudgetDoc, userProfile]);

  // Calculate days remaining in selected month
  const daysRemainingInMonth = useMemo(() => {
    const today = new Date();
    const [y, m] = selectedMonth.split('-').map(Number);
    const lastDayOfMonth = new Date(y, m, 0).getDate();

    if (
      today.getFullYear() === y &&
      today.getMonth() + 1 === m
    ) {
      return Math.max(lastDayOfMonth - today.getDate() + 1, 1);
    }
    return lastDayOfMonth;
  }, [selectedMonth]);

  // Handlers
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      showToast('เข้าสู่ระบบด้วย Gmail สำเร็จ');
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      showToast('เข้าสู่ระบบไม่สำเร็จ: ' + (err?.message || 'ข้อผิดพลาดระบบ'), 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      showToast('ออกจากระบบเรียบร้อยแล้ว');
    } catch (err: any) {
      console.error('Sign-out failed:', err);
    }
  };

  const handleSaveTransaction = async (txData: {
    title: string;
    amount: number;
    type: TransactionType;
    category: string;
    date: string;
    month: string;
    paymentMethod: string;
    notes?: string;
  }) => {
    if (!user) return;
    if (editingTransaction) {
      await updateTransaction(user.uid, editingTransaction.id, txData);
      showToast('แก้ไขรายการสำเร็จ');
    } else {
      await addTransaction(user.uid, txData);
      showToast('บันทึกรายการเรียบร้อย');
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (!user) return;
    await deleteTransaction(user.uid, txId);
    showToast('ลบรายการเรียบร้อยแล้ว');
  };

  const handleSaveBudget = async (amount: number) => {
    if (!user) return;
    await setMonthlyBudget(user.uid, selectedMonth, amount);
    await updateUserBudget(user.uid, amount);
    showToast(`บันทึกงบประมาณเดือน ${formatThaiMonth(selectedMonth)} เรียบร้อย`);
  };

  const handleSeedDemoData = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      const count = await seedDemoTransactions(user.uid, selectedMonth);
      showToast(`เพิ่มข้อมูลจำลองสำเร็จ ${count} รายการในเดือน ${formatThaiMonth(selectedMonth)}`);
    } catch (err) {
      console.error('Seed demo data error:', err);
      showToast('ไม่สามารถสร้างข้อมูลจำลองได้', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsTxModalOpen(true);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTxModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg border text-sm font-medium animate-in slide-in-from-top-3 fade-in duration-200 bg-white border-slate-200">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="text-slate-800">{toastMessage.text}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        user={user}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
        onSignOut={handleSignOut}
        onSignIn={handleSignIn}
        onSeedDemoData={handleSeedDemoData}
        isSeeding={isSeeding}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {authLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-medium text-slate-500">กำลังเชื่อมต่อระบบ Firebase...</p>
          </div>
        ) : !user ? (
          /* Landing Screen when not logged in */
          <LandingHero onSignIn={handleSignIn} isConnecting={authLoading} />
        ) : (
          /* Authenticated Dashboard */
          <>
            {/* 1. Monthly Summary Cards */}
            <section>
              <MonthlySummaryCards
                summary={summary}
                onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
                daysRemainingInMonth={daysRemainingInMonth}
              />
            </section>

            {/* 2. Intelligent Financial Insights */}
            <section>
              <FinancialInsights
                transactions={currentMonthTransactions}
                summary={summary}
              />
            </section>

            {/* 3. Graphical Data Analysis (Donut & Daily Trend) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Donut Chart: Category Breakdown */}
              <div className="lg:col-span-5 flex flex-col">
                <CategoryPieChart
                  transactions={currentMonthTransactions}
                  type={categoryChartType}
                  onTypeChange={setCategoryChartType}
                />
              </div>

              {/* Daily Trend Cash Flow Bar Chart */}
              <div className="lg:col-span-7 flex flex-col">
                <DailyTrendChart
                  transactions={transactions}
                  selectedMonth={selectedMonth}
                />
              </div>
            </section>

            {/* 4. 6-Month Historical Comparison Chart */}
            <section>
              <MonthlyComparisonChart
                allTransactions={transactions}
                currentMonth={selectedMonth}
                onSelectMonth={setSelectedMonth}
              />
            </section>

            {/* 5. Transaction History List with Search, Filters, CSV Export */}
            <section>
              <TransactionList
                transactions={currentMonthTransactions}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteTransaction}
                onAddNew={handleOpenAddModal}
                onOpenPdfModal={() => setIsPdfModalOpen(true)}
                selectedMonth={selectedMonth}
              />
            </section>
          </>
        )}
      </main>

      {/* Floating Action Button for Mobile */}
      {user && (
        <button
          onClick={handleOpenAddModal}
          className="fixed bottom-6 right-6 sm:hidden z-40 h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center transition-transform active:scale-95"
          title="เพิ่มรายการใหม่"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-700">MoneyTrack</span> — ระบบจัดการรายรับรายจ่ายและวิเคราะห์การเงิน
          </div>
          <div className="flex items-center gap-2">
            <span>ฐานข้อมูล Firestore (neat-signifier-9vr20)</span>
            <span>•</span>
            <span>ระบบยืนยันตัวตน Google Gmail</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        defaultMonth={selectedMonth}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentBudget={monthlyBudgetDoc?.amount ?? (userProfile?.monthlyBudget || 25000)}
        selectedMonth={selectedMonth}
        onSaveBudget={handleSaveBudget}
      />

      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        selectedMonth={selectedMonth}
        transactions={currentMonthTransactions}
        summary={summary}
        user={user}
        userProfile={userProfile}
      />
    </div>
  );
}
