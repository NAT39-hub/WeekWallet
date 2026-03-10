import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Category, WeeklyStats } from './types';
import { getWeeklyStats } from './utils';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { AIAdvisor } from './components/AIAdvisor';
import { Wallet } from 'lucide-react';
import { MarketData } from './components/MarketData';

export default function App() {
  // 1. Khởi tạo dữ liệu từ LocalStorage (Lazy initialization để tối ưu hiệu năng)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('transactions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Không thể truy cập LocalStorage');
      return [];
    }
  });

  // 2. Tự động tính toán thống kê khi danh sách giao dịch thay đổi
  // Sử dụng useMemo để tránh tính toán lại không cần thiết
  const stats = useMemo(() => getWeeklyStats(transactions), [transactions]);

  // 3. Lưu dữ liệu vào LocalStorage mỗi khi có thay đổi
  useEffect(() => {
    try {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    } catch (e) {
      console.error('Lỗi khi lưu dữ liệu:', e);
    }
  }, [transactions]);

  // 4. Hàm xử lý thêm giao dịch mới
  const handleAddTransaction = (amount: number, category: Category, note: string, date: string) => {
    const newTransaction: Transaction = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(),
      amount,
      category,
      note,
      date,
    };
    
    setTransactions((prev) => 
      [newTransaction, ...prev].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  };

  // 5. Hàm xử lý xóa giao dịch
  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Anh Tú có chắc muốn xóa giao dịch này không?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Thanh hiển thị tỷ giá (Chỉ hiện trên máy tính) */}
      <div className="bg-white border-b border-gray-200 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-center">
          <MarketData />
        </div>
      </div>

      {/* Header dự án WeekWallet */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                  WeekWallet
                </h1>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">By Tech Chef Tú</p>
              </div>
            </div>
            
            {/* MarketData cho giao diện điện thoại */}
            <div className="sm:hidden block">
              <MarketData />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Cột trái: Nhập liệu và AI tư vấn */}
          <div className="lg:col-span-1 space-y-6 sm:space-y-8 animate-fade-in-up">
            <TransactionForm onAdd={handleAddTransaction} />
            <AIAdvisor transactions={transactions} stats={stats} />
          </div>

          {/* Cột phải: Biểu đồ và Danh sách chi tiết */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            {/* Quan trọng: Truyền transactions vào Dashboard để chạy tính năng Xuất Excel */}
            <Dashboard stats={stats} transactions={transactions} />
            <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
          </div>
          
        </div>
      </main>
      
      {/* Footer bản quyền Tech Chef Tú */}
      <footer className="py-8 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-widest">
          © 2026 Tech Chef Tú - Personal Financial Advisor
        </p>
      </footer>
    </div>
  );
}