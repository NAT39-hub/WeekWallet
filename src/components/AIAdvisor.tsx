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
      setError('Cần có ít nhất 1 giao dịch để AI có thể phân tích.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      /**
       * PHẦN NHẬP KEY API:
       * 1. Cách chuẩn (Bảo mật): Sử dụng import.meta.env.VITE_GEMINI_API_KEY
       * 2. Cách Test (Nếu cách 1 lỗi): Bạn xóa dòng dưới và dán trực tiếp: 
       * const apiKey = "AIzaSyB_CUA_BAN_O_DAY";
       */
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error("API Key bị trống (Undefined). Hãy kiểm tra lại cài đặt Vercel.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: "Bạn là chuyên gia phân tích tài chính cá nhân. Dựa trên dữ liệu chi tiêu tuần này (gồm số tiền, ngày, hạng mục), hãy thực hiện: 1. Tóm tắt tổng chi tiêu. 2. Chỉ ra 1 hạng mục đang chi quá tay. 3. Đưa ra 3 lời khuyên ngắn gọn để tiết kiệm cho tuần sau. Trả lời bằng tiếng Việt, súc tích, chuyên nghiệp."
      });

      const prompt = `
        Thống kê chi tiêu tuần này:
        - Tổng chi: ${formatVND(stats.total)}
        - Cơ cấu: ${stats.categoryBreakdown.map(c => `${c.category}: ${formatVND(c.amount)}`).join(', ')}
        - Giao dịch gần đây: ${transactions.slice(0, 10).map(t => `${t.category}: ${formatVND(t.amount)} (${t.note})`).join('; ')}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      setAdvice(response.text() || 'Không thể lấy lời khuyên lúc này.');
    } catch (err: any) {
      console.error(err);
      setError(`Lỗi: ${err.message || 'Kết nối thất bại. Kiểm tra lại API Key.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-xl dark:shadow-2xl rounded-2xl bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-indigo-900/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl transition-colors duration-200">
            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">AI Tối ưu chi tiêu</h3>
            <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80">Nhận lời khuyên tài chính mỗi tối</p>
          </div>
        </div>
        <button 
          onClick={getAdvice} 
          disabled={loading} 
          className="flex items-center px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang phân tích...</> : <><MessageSquareText className="w-4 h-4 mr-2" />Phân tích ngay</>}
        </button>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-500/20">
          {error}
        </div>
      )}
      
      {advice && !loading && (
        <div className="mt-6 p-5 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-xl relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-blue-400"></div>
          <p className="text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line text-sm">{advice}</p>
        </div>
      )}
    </div>
  );
};
