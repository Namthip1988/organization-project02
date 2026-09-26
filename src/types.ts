export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  paymentMethod?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  monthlyBudget?: number;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MonthlyBudget {
  userId: string;
  month: string; // YYYY-MM
  amount: number;
  updatedAt?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  bgLight: string;
}

export interface MonthSummaryData {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  transactionCount: number;
  budgetAmount: number;
  remainingBudget: number;
  budgetUsedPercent: number;
}
