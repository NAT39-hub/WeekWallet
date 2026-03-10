import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Category } from './types';
import { getWeeklyStats } from './utils';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { AIAdvisor } from './components/AIAdvisor';
import { Wallet } from 'lucide-react';
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

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Anh Tú có chắc muốn xóa không?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-200 hidden sm:block"><div className="max-w-7xl mx-auto px-8 py-2"><MarketData /></div></div>
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2.5 rounded-xl"><Wallet className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-xl font-bold">WeekWallet</h1>
              <p className="text-[10px] text-gray-400 uppercase">By Tech Chef Tú</p>
            </div>
          </div>
          <div className="sm:hidden"><MarketData /></div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <TransactionForm onAdd={handleAddTransaction} />
            <AIAdvisor transactions={transactions} stats={stats} />
          </div>
          <div className="lg:col-span-2 space-y-8">
            <Dashboard stats={stats} transactions={transactions} />
            <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
          </div>
        </div>
      </main>
    </div>
  );
}