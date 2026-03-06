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
      const apiKey = AIzaSyCM9xG-THrJgtvmtUVMmSsSvDJ6DCQJhLY || "";
      if (!apiKey) throw new Error("Thiếu API Key trên Vercel.");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        systemInstruction: "Bạn là chuyên gia tài chính. Hãy tóm tắt chi tiêu và đưa ra 3 lời khuyên tiết kiệm bằng tiếng Việt."
      });

      const prompt = `Tổng chi: ${formatVND(stats.total)}. Chi tiết: ${stats.categoryBreakdown.map(c => `${c.category}: ${formatVND(c.amount)}`).join(', ')}`;
      const result = await model.generateContent(prompt);
      setAdvice(result.response.text());
    } catch (err: any) {
      setError(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-white/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold">AI Tối ưu chi tiêu</h3>
        </div>
        <button onClick={getAdvice} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-xl disabled:opacity-50">
          {loading ? 'Đang phân tích...' : 'Phân tích ngay'}
        </button>
      </div>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      {advice && <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm whitespace-pre-line">{advice}</div>}
    </div>
  );
};