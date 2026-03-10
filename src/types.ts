export type Category = 
  | 'Ăn uống' | 'Di chuyển' | 'Cà phê' | 'Mua sắm' 
  | 'Hóa đơn' | 'Cá nhân' | 'Học tập' | 'Sức khỏe' | 'Khác';

export interface Transaction {
  id: string;
  amount: number;
  category: Category;
  note: string;
  date: string;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  total: number;
  dailyBreakdown: { date: string; amount: number }[];
  categoryBreakdown: { category: Category; amount: number }[];
}