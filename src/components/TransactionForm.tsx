import React, { useState } from 'react';
import { PlusCircle, Calendar as CalendarIcon, Tag, AlignLeft, DollarSign } from 'lucide-react';
import { Category } from '../types';

interface TransactionFormProps {
  onAdd: (amount: number, category: Category, note: string, date: string) => void;
}

const CATEGORIES: Category[] = [
  'Ăn uống', 'Di chuyển', 'Cà phê', 'Mua sắm', 
  'Hóa đơn', 'Cá nhân', 'Học tập', 'Sức khỏe', 'Khác'
];

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Ăn uống');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    onAdd(Number(amount), category, note, date);
    setAmount('');
    setNote('');
  };

  return (
    <div className="bg-white border border-slate-200 shadow-xl rounded-[2.5rem] p-8 relative overflow-hidden group animate-fade-in-up">
      <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center">
        <PlusCircle className="w-6 h-6 mr-3 text-indigo-600" />
        Thêm chi tiêu mới
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Số tiền (VND)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-amber-500" />
            </div>
            <input 
              type="number" required min="0" step="1000" value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 font-bold text-slate-900 transition-all" 
              placeholder="Ví dụ: 50000" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Danh mục</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Tag className="h-5 w-5 text-indigo-500" />
              </div>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value as Category)} 
                className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 appearance-none"
              >
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Ngày tháng</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-rose-500" />
              </div>
              <input 
                type="date" required value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-500 font-bold text-slate-900" 
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Ghi chú</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 pt-4 pointer-events-none">
              <AlignLeft className="h-5 w-5 text-emerald-500" />
            </div>
            <textarea 
              value={note} onChange={(e) => setNote(e.target.value)} rows={2} 
              className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 resize-none" 
              placeholder="Hôm nay anh Tú mua gì thế?" 
            />
          </div>
        </div>

        {/* NÚT LƯU MÀU VÀNG GOLD ĐẲNG CẤP */}
        <button 
          type="submit" 
          className="w-full py-5 rounded-2xl font-black text-white uppercase tracking-widest
                     bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#B8860B]
                     shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:-translate-y-1 active:scale-95 transition-all animate-shine"
        >
          Lưu chi tiêu ngay
        </button>
      </form>
    </div>
  );
};