import React, { useState } from 'react';
import { Sparkles, Loader2, MessageSquareText } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Transaction, WeeklyStats } from '../types';
import { formatVND } from '../utils';

interface AIAdvisorProps {
  transactions: Transaction[];
  stats: WeeklyStats;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions, stats }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAdvice = async () => {
    if (transactions.length === 0) {
      setError('Cần ít nhất 1 giao dịch để phân tích.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // KIỂM TRA KEY: Bạn có thể dán trực tiếp Key vào dấu "" nếu Vercel vẫn lỗi
      const apiKey = AIzaSyCM9xG-THrJgtvmtUVMmSsSvDJ6DCQJhLY ""
      
      if (!apiKey) {
        throw new Error("Không tìm thấy API Key. Hãy kiểm tra lại cấu hình Vercel.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        systemInstruction: "Bạn là chuyên gia tài chính. Phân tích dữ liệu: 1. Tóm tắt tổng chi. 2. Cảnh báo hạng mục chi cao. 3. Đưa ra 3 lời khuyên tiết kiệm súc tích bằng tiếng Việt."
      });

      const prompt = `
        Tổng chi: ${formatVND(stats.total)}
        Cơ cấu: ${stats.categoryBreakdown.map(c => `${c.category}: ${formatVND(c.amount)}`).join(', ')}
        Giao dịch: ${transactions.slice(0, 10).map(t => `${t.category}: ${formatVND(t.amount)} (${t.note})`).join('; ')}
      `;

      const result = await model.generateContent(prompt);
      setAdvice(result.response.text());
    } catch (err: any) {
      console.error(err);
      setError(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-xl rounded-2xl p-6 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/20 dark:to-blue-900/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">AI Tối ưu chi tiêu</h3>
            <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80">Lời khuyên tài chính thông minh</p>
          </div>
        </div>
        <button 
          onClick={getAdvice} 
          disabled={loading} 
          className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquareText className="w-4 h-4 mr-2" />}
          {loading ? 'Đang phân tích...' : 'Phân tích ngay'}
        </button>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-500/20">
          {error}
        </div>
      )}
      
      {advice && !loading && (
        <div className="mt-6 p-5 bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/30 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <p className="text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line text-sm">{advice}</p>
        </div>
      )}
    </div>
  );
};