import { Transaction } from '../types';
import { addTransaction } from '../firebase';

export async function seedDemoTransactions(userId: string, targetMonth: string): Promise<number> {
  // targetMonth format: 'YYYY-MM'
  const [yearStr, monthStr] = targetMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const sampleItems: Array<{
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    day: number;
    paymentMethod: string;
    notes?: string;
  }> = [
    // Income
    { title: 'เงินเดือนประจำ', amount: 48000, type: 'income', category: 'เงินเดือน / ค่าจ้างประจำ', day: 1, paymentMethod: 'โอนเงิน / บัญชีธนาคาร', notes: 'เงินเดือนโอนเข้าบัญชีหลัก' },
    { title: 'งานฟรีแลนซ์ออกแบบเว็บไซต์', amount: 12500, type: 'income', category: 'รายได้เสริม / ฟรีแลนซ์', day: 12, paymentMethod: 'พร้อมเพย์', notes: 'รับค่าจ้างโปรเจกต์ Dashboard' },
    { title: 'เงินปันผลกองทุนรวม', amount: 3200, type: 'income', category: 'ผลตอบแทนการลงทุน / ดอกเบี้ย', day: 18, paymentMethod: 'โอนเงิน / บัญชีธนาคาร' },
    
    // Expenses - Housing & Utilities
    { title: 'ค่าเช่าคอนโดมิเนียม', amount: 12000, type: 'expense', category: 'ที่อยู่อาศัย / ค่าเช่า', day: 2, paymentMethod: 'โอนเงิน / บัญชีธนาคาร' },
    { title: 'ค่าน้ำประปาและค่าไฟฟ้า', amount: 1850, type: 'expense', category: 'บิล / น้ำไฟเน็ต / โทรศัพท์', day: 5, paymentMethod: 'โอนเงิน / บัญชีธนาคาร' },
    { title: 'ค่าอินเทอร์เน็ตบ้านและมือถือ', amount: 899, type: 'expense', category: 'บิล / น้ำไฟเน็ต / โทรศัพท์', day: 8, paymentMethod: 'บัตรเครดิต' },

    // Food & Dining
    { title: 'กาแฟและอาหารเช้า', amount: 140, type: 'expense', category: 'อาหารและเครื่องดื่ม', day: 3, paymentMethod: 'พร้อมเพย์' },
    { title: 'ซื้อของสดซูเปอร์มาร์เก็ต (Gourmet Market)', amount: 2450, type: 'expense', category: 'อาหารและเครื่องดื่ม', day: 4, paymentMethod: 'บัตรเครดิต' },
    { title: 'รับประทานอาหารชาบูมื้อค่ำกับเพื่อน', amount: 790, type: 'expense', category: 'อาหารและเครื่องดื่ม', day: 7, paymentMethod: 'พร้อมเพย์' },
    { title: 'มื้อกลางวันและเครื่องดื่ม', amount: 220, type: 'expense', category: 'อาหารและเครื่องดื่ม', day: 9, paymentMethod: 'พร้อมเพย์' },
    { title: 'สั่งอาหารเดลิเวอรี่ GrabFood', amount: 350, type: 'expense', category: 'อาหารและเครื่องดื่ม', day: 14, paymentMethod: 'บัตรเครดิต' },
    { title: 'อาหารเย็นครอบครัววันหยุด', amount: 1680, type: 'expense', category: 'อาหารและเครื่องดื่ม', day: 19, paymentMethod: 'บัตรเครดิต' },
    { title: 'ของว่างและเครื่องดื่มประจำวัน', amount: 160, type: 'expense', category: 'อาหารและเครื่องดื่ม', day: 22, paymentMethod: 'เงินสด' },

    // Transport
    { title: 'เติมเงินบัตร BTS / MRT ประจำเดือน', amount: 1500, type: 'expense', category: 'เดินทาง / ยานพาหนะ', day: 2, paymentMethod: 'บัตรเครดิต' },
    { title: 'ค่าน้ำมันรถยนต์', amount: 1200, type: 'expense', category: 'เดินทาง / ยานพาหนะ', day: 11, paymentMethod: 'บัตรเครดิต' },
    { title: 'ค่าแท็กซี่ไปสนามบิน', amount: 380, type: 'expense', category: 'เดินทาง / ยานพาหนะ', day: 20, paymentMethod: 'พร้อมเพย์' },

    // Shopping & Personal
    { title: 'ซื้อเสื้อผ้าทำงาน Uniqlo', amount: 1990, type: 'expense', category: 'ช้อปปิ้ง / ของใช้ส่วนตัว', day: 10, paymentMethod: 'บัตรเครดิต' },
    { title: 'ซื้อหูฟังไร้สายและเคส', amount: 1590, type: 'expense', category: 'ช้อปปิ้ง / ของใช้ส่วนตัว', day: 16, paymentMethod: 'บัตรเครดิต' },

    // Entertainment
    { title: 'ค่าสมาชิก Netflix & Spotify', amount: 568, type: 'expense', category: 'ความบันเทิง / ท่องเที่ยว', day: 6, paymentMethod: 'บัตรเครดิต' },
    { title: 'ตั๋วชมภาพยนตร์ IMAX', amount: 700, type: 'expense', category: 'ความบันเทิง / ท่องเที่ยว', day: 15, paymentMethod: 'บัตรเครดิต' },

    // Health
    { title: 'ซื้อวิตามินและยาบำรุง', amount: 850, type: 'expense', category: 'สุขภาพ / ยารักษาโรค', day: 13, paymentMethod: 'บัตรเครดิต' },
    { title: 'ค่าสมาชิกฟิตเนสรายเดือน', amount: 1600, type: 'expense', category: 'สุขภาพ / ยารักษาโรค', day: 5, paymentMethod: 'บัตรเครดิต' },
  ];

  let count = 0;
  for (const item of sampleItems) {
    const dayStr = item.day.toString().padStart(2, '0');
    const date = `${yearStr}-${monthStr}-${dayStr}`;
    await addTransaction(userId, {
      title: item.title,
      amount: item.amount,
      type: item.type,
      category: item.category,
      date,
      month: targetMonth,
      paymentMethod: item.paymentMethod,
      notes: item.notes || '',
    });
    count++;
  }

  return count;
}
