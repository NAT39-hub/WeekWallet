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
      setError('Cần có ít nhất 1 giao dịch để phân tích.');
      return;
    }
    setLoading(true);
    setError(null);

    const prompt = `Bạn là chuyên gia tài chính cho nhân viên văn phòng Việt Nam. Phân tích chi tiêu tuần này: Tổng ${formatVND(stats.total)}. Chi tiết: ${stats.categoryBreakdown.map(c => `${c.category}: ${formatVND(c.amount)}`).join(', ')}. Đưa ra 2 lời khuyên ngắn gọn.`;

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Chưa cấu hình API Key trên Vercel.");

      const genAI = new GoogleGenerativeAI(apiKey);
      // Sử dụng gemini-2.0-flash để ổn định nhất năm 2026
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const result = await model.generateContent(prompt);
      setAdvice(result.response.text());
    } catch (err: any) {
      setError("Lỗi AI: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          <div>
            <h3 className="text-lg font-semibold text-indigo-900">AI Tư vấn chi tiêu</h3>
            <p className="text-sm text-gray-500">Tech Chef Tú Advisor</p>
          </div>
        </div>
        <button onClick={getAdvice} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquareText className="w-4 h-4" />}
        </button>
      </div>
      {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs">{error}</div>}
      {advice && !loading && (
        <div className="mt-6 p-4 bg-indigo-50/50 border-l-4 border-indigo-500 rounded-r-xl">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">{advice}</p>
        </div>
      )}
    </div>
  );
};