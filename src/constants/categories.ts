import { CategoryInfo } from '../types';

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { id: 'food', name: 'อาหารและเครื่องดื่ม', type: 'expense', icon: 'Utensils', color: '#f97316', bgLight: '#ffedd5' },
  { id: 'transport', name: 'เดินทาง / ยานพาหนะ', type: 'expense', icon: 'Car', color: '#0ea5e9', bgLight: '#e0f2fe' },
  { id: 'housing', name: 'ที่อยู่อาศัย / ค่าเช่า', type: 'expense', icon: 'Home', color: '#8b5cf6', bgLight: '#ede9fe' },
  { id: 'bills', name: 'บิล / น้ำไฟเน็ต / โทรศัพท์', type: 'expense', icon: 'Receipt', color: '#eab308', bgLight: '#fef9c3' },
  { id: 'shopping', name: 'ช้อปปิ้ง / ของใช้ส่วนตัว', type: 'expense', icon: 'ShoppingBag', color: '#ec4899', bgLight: '#fce7f3' },
  { id: 'entertainment', name: 'ความบันเทิง / ท่องเที่ยว', type: 'expense', icon: 'Film', color: '#a855f7', bgLight: '#f3e8ff' },
  { id: 'health', name: 'สุขภาพ / ยารักษาโรค', type: 'expense', icon: 'HeartPulse', color: '#ef4444', bgLight: '#fee2e2' },
  { id: 'education', name: 'การศึกษา / พัฒนาตนเอง', type: 'expense', icon: 'GraduationCap', color: '#14b8a6', bgLight: '#ccfbf1' },
  { id: 'family', name: 'ครอบครัว / ให้คนอื่น', type: 'expense', icon: 'Users', color: '#f43f5e', bgLight: '#ffe4e6' },
  { id: 'other_expense', name: 'รายจ่ายอื่นๆ', type: 'expense', icon: 'MoreHorizontal', color: '#64748b', bgLight: '#f1f5f9' },
];

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { id: 'salary', name: 'เงินเดือน / ค่าจ้างประจำ', type: 'income', icon: 'Briefcase', color: '#10b981', bgLight: '#d1fae5' },
  { id: 'bonus', name: 'โบนัส / ค่าคอมมิชชั่น', type: 'income', icon: 'Sparkles', color: '#059669', bgLight: '#a7f3d0' },
  { id: 'freelance', name: 'รายได้เสริม / ฟรีแลนซ์', type: 'income', icon: 'Laptop', color: '#0284c7', bgLight: '#bae6fd' },
  { id: 'investment', name: 'ผลตอบแทนการลงทุน / ดอกเบี้ย', type: 'income', icon: 'TrendingUp', color: '#6366f1', bgLight: '#e0e7ff' },
  { id: 'gift', name: 'ของขวัญ / เงินช่วยเหลือ', type: 'income', icon: 'Gift', color: '#d946ef', bgLight: '#fae8ff' },
  { id: 'other_income', name: 'รายรับอื่นๆ', type: 'income', icon: 'Coins', color: '#14b8a6', bgLight: '#ccfbf1' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const PAYMENT_METHODS = [
  { id: 'bank_transfer', name: 'โอนเงิน / บัญชีธนาคาร' },
  { id: 'cash', name: 'เงินสด' },
  { id: 'promptpay', name: 'พร้อมเพย์' },
  { id: 'credit_card', name: 'บัตรเครดิต' },
  { id: 'e_wallet', name: 'กระเป๋าเงินอิเล็กทรอนิกส์ (E-Wallet)' },
];

export function getCategoryInfo(categoryName: string, type: 'income' | 'expense'): CategoryInfo {
  const match = ALL_CATEGORIES.find(c => c.name === categoryName && c.type === type)
    || ALL_CATEGORIES.find(c => c.name === categoryName);
  if (match) return match;
  return {
    id: 'unknown',
    name: categoryName,
    type,
    icon: type === 'income' ? 'Coins' : 'Receipt',
    color: type === 'income' ? '#10b981' : '#f97316',
    bgLight: type === 'income' ? '#d1fae5' : '#ffedd5',
  };
}
