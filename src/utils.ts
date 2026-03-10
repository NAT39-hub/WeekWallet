import { Transaction, WeeklyStats, Category } from './types';

// 1. Định dạng tiền VND
export const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// 2. Định dạng ngày tháng (Cần thiết cho TransactionList)
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// 3. Logic tính toán thống kê tuần
export const getWeeklyStats = (transactions: Transaction[]): WeeklyStats => {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const categoryMap = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, amount]) => ({ category: category as Category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const dailyMap = transactions.reduce((acc, t) => {
    const date = t.date.split('T')[0];
    acc[date] = (acc[date] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const dailyBreakdown = Object.entries(dailyMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { weekStart: '', weekEnd: '', total, dailyBreakdown, categoryBreakdown };
};

// 4. Logic Xuất file Excel (CSV)
export const exportToExcel = (transactions: Transaction[], total: number) => {
  const headers = ['Ngày', 'Danh mục', 'Số tiền (VND)', 'Ghi chú'];
  const rows = transactions.map(t => [
    t.date.split('T')[0],
    t.category,
    t.amount.toString(),
    t.note || ''
  ]);
  const csvContent = "\uFEFF" + [headers, ...rows, ['', 'TỔNG CỘNG', total.toString(), ''], ['', 'BÁO CÁO TỪ', 'TECH CHEF TÚ', '']]
    .map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `WeekWallet-Bao-cao.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};