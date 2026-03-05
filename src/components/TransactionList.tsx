import React from 'react';
import { Transaction } from '../types';
import { formatVND, formatDate } from '../utils';
import { Utensils, Car, Coffee, ShoppingBag, FileText, HelpCircle, Trash2 } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Ăn uống': return <Utensils className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />;
    case 'Di chuyển': return <Car className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
    case 'Cà phê': return <Coffee className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
    case 'Mua sắm': return <ShoppingBag className="w-5 h-5 text-purple-500 dark:text-purple-400" />;
    case 'Hóa đơn': return <FileText className="w-5 h-5 text-red-500 dark:text-red-400" />;
    default: return <HelpCircle className="w-5 h-5 text-gray-400 dark:text-gray-500" />;
  }
};

const getCategoryBg = (category: string) => {
  switch (category) {
    case 'Ăn uống': return 'bg-emerald-50 dark:bg-emerald-500/10';
    case 'Di chuyển': return 'bg-blue-50 dark:bg-blue-500/10';
    case 'Cà phê': return 'bg-amber-50 dark:bg-amber-500/10';
    case 'Mua sắm': return 'bg-purple-50 dark:bg-purple-500/10';
    case 'Hóa đơn': return 'bg-red-50 dark:bg-red-500/10';
    default: return 'bg-gray-50 dark:bg-gray-800';
  }
};

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div className="glass-card p-8 text-center transition-all duration-300">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4 shadow-inner">
          <FileText className="w-8 h-8 text-blue-300 dark:text-blue-500" />
        </div>
        <p className="text-gray-600 dark:text-gray-300 font-medium">Chưa có giao dịch nào</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Hãy thêm chi tiêu đầu tiên của bạn</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-blue-900/10">
      <div className="px-6 py-5 border-b border-gray-100/50 dark:border-gray-800/50 flex justify-between items-center bg-gray-50/30 dark:bg-gray-800/30 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Lịch sử chi tiêu</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">{transactions.length} giao dịch</span>
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {transactions.map((t) => (
          <li key={t.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${getCategoryBg(t.category)}`}>
                  {getCategoryIcon(t.category)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.category}</p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(t.date)}</span>
                    {t.note && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[150px] sm:max-w-[200px]">{t.note}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  -{formatVND(t.amount)}
                </span>
                <button onClick={() => onDelete(t.id)} className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all" title="Xóa">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};