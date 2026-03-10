import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Category } from './types';
import { getWeeklyStats } from './utils';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { AIAdvisor } from './components/AIAdvisor';
import { Wallet, ShieldCheck, Zap } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f8fafc]">
      {/* THANH TỶ GIÁ VIP: Hiện đầu tiên trên Mobile */}
      <div className="vip-ticker-bar border-b border-amber-100 overflow-x-auto no-scrollbar sticky top-0 z-[60] bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center min-w-max">
          <div className="flex items-center space-x-2 mr-6 pr-4 border-r border-amber-200">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-[11px] font-black text-amber-600 uppercase tracking-tighter">Live Market</span>
          </div>
          <MarketData />
        </div>
      </div>

      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-[49px] z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">WeekWallet</h1>
              <div className="flex items-center text-[9px] font-bold text-indigo-500 uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3 mr-1" /> PREMIUM ADVISOR
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8 animate-fade-in-up">
            <TransactionForm onAdd={handleAddTransaction} />
            <AIAdvisor transactions={transactions} stats={stats} />
          </div>

          <div className="lg:col-span-8 space-y-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Dashboard stats={stats} transactions={transactions} />
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
               <TransactionList transactions={transactions} onDelete={(id) => setTransactions(prev => prev.filter(t => t.id !== id))} />
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
        Authentic by Tech Chef Tú © 2026
      </footer>
    </div>
  );
}