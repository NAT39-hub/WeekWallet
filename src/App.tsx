import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Category } from './types';
import { getWeeklyStats } from './utils';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { AIAdvisor } from './components/AIAdvisor';
import { Wallet, ShieldCheck } from 'lucide-react';
import { MarketData } from './components/MarketData';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('transactions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const stats = useMemo(() => getWeeklyStats(transactions), [transactions]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleAddTransaction = (amount: number, category: Category, note: string, date: string) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount, category, note, date,
    };
    setTransactions((prev) => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 relative">
      {/* Tỷ giá Ticker - Thiết kế VIP đặc biệt của Tech Chef Tú */}
      <div className="vip-ticker-bar border-b border-amber-100/50 overflow-x-auto no-scrollbar sticky top-0 z-[60]">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center min-w-max">
          <div className="flex items-center space-x-2 mr-4 pr-4 border-r border-amber-200">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">Live Market</span>
          </div>
          <MarketData />
        </div>
      </div>

      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-[41px] z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-3 rounded-2xl shadow-lg shadow-indigo-200">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-600">
                WeekWallet
              </h1>
              <div className="flex items-center text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3 mr-1" /> PREMIUM ADVISOR
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <TransactionForm onAdd={handleAddTransaction} />
            <AIAdvisor transactions={transactions} stats={stats} />
          </div>

          <div className="lg:col-span-8 space-y-8">
            <Dashboard stats={stats} transactions={transactions} />
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
               <TransactionList transactions={transactions} onDelete={(id) => setTransactions(prev => prev.filter(t => t.id !== id))} />
            </div>
          </div>
        </div>
      </main>

      <footer className="py-10 text-center border-t border-slate-200 bg-white/50 backdrop-blur-md">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">
          Masterpiece by <span className="text-slate-800">Tech Chef Tú</span> © 2026
        </p>
      </footer>
    </div>
  );
}