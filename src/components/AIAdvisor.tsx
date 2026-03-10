import React, { useState } from 'react';
import { Sparkles, Loader2, MessageSquareText, AlertCircle } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Transaction, WeeklyStats } from '../types';
import { formatVND } from '../utils';

export const AIAdvisor: React.FC<{ transactions: Transaction[], stats: WeeklyStats }> = ({ transactions, stats }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAdvice = async () => {
    if (transactions.length === 0) return setError('Anh Tú ơi, nhập ít nhất 1 giao dịch để em phân tích nhé!');
    setLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `Bạn là cố vấn tài chính VIP của anh Tú. Tổng chi: ${formatVND(stats.total)}. Danh mục: ${stats.categoryBreakdown.map(c => `${c.category}: ${formatVND(c.amount)}`).join(', ')}. Hãy đưa ra 2 lời khuyên cực ngắn, hài hước và thực tế.`;

      const result = await model.generateContent(prompt);
      setAdvice(result.response.text());
    } catch (err: any) {
      if (err.message.includes('429')) {
        setError("Hệ thống AI đang bận tí (hết Quota). Anh Tú đợi khoảng 1 phút rồi bấm lại giúp em nhé! ☕");
      } else {
        setError("Có lỗi nhỏ khi gọi AI. Anh kiểm tra lại API Key nhé!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 shadow-xl rounded-[2.5rem] p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-50 p-3 rounded-2xl animate-floating">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">AI Advisor</h3>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Tech Chef Tú Edition</p>
          </div>
        </div>
        <button 
          onClick={getAdvice} disabled={loading} 
          className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 disabled:opacity-50 transition-all"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquareText className="w-5 h-5" />}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-rose-600 leading-relaxed">{error}</p>
        </div>
      )}

      {advice && !loading && (
        <div className="mt-4 p-5 bg-indigo-50/50 rounded-[2rem] border-l-4 border-indigo-500">
          <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-line italic">
            "{advice}"
          </p>
        </div>
      )}
    </div>
  );
};