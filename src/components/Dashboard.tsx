import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { WeeklyStats, Transaction } from '../types';
import { formatVND, exportToExcel } from '../utils'; // Đã thêm exportToExcel từ utils
import { Download, PieChart as PieIcon, TrendingUp } from 'lucide-react';

interface DashboardProps {
  stats: WeeklyStats;
  transactions: Transaction[]; // Thêm prop này để có dữ liệu xuất Excel
  isDarkMode?: boolean;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b', '#ec4899', '#06b6d4', '#f97316'];

export const Dashboard: React.FC<DashboardProps> = ({ stats, transactions, isDarkMode }) => {
  const textColor = isDarkMode ? '#9ca3af' : '#64748b';
  const tooltipBg = isDarkMode ? '#1f2937' : '#ffffff';
  const tooltipBorder = isDarkMode ? '#374151' : '#f1f5f9';
  const tooltipText = isDarkMode ? '#f3f4f6' : '#111827';
  const barBg = isDarkMode ? '#374151' : '#e2e8f0';

  return (
    <div className="space-y-6 pb-10"> {/* Thêm padding bottom để nút không bị sát đáy */}
      {/* 1. Thẻ Tổng chi tiêu */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-xl rounded-2xl p-6">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tổng chi tiêu tuần này</h2>
        <div className="text-4xl font-light text-gray-900 dark:text-white">{formatVND(stats.total)}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Biểu đồ cột theo ngày */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-xl rounded-2xl p-6">
          <h3 className="text-base font-medium text-gray-800 dark:text-gray-100 mb-4 flex items-center">
             <TrendingUp className="w-4 h-4 mr-2 text-blue-500" /> Chi tiêu theo ngày
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailyBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: textColor }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: textColor }} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip cursor={{ fill: isDarkMode ? '#374151' : '#f1f5f9' }} contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${tooltipBorder}` }} formatter={(value: any) => [formatVND(Number(value) || 0), 'Chi tiêu']} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {stats.dailyBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.amount > 0 ? '#3b82f6' : barBg} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Biểu đồ tròn theo danh mục (Cá nhân, Học tập, Sức khỏe...) */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-xl rounded-2xl p-6">
          <h3 className="text-base font-medium text-gray-800 dark:text-gray-100 mb-4 flex items-center">
            <PieIcon className="w-4 h-4 mr-2 text-emerald-500" /> Cơ cấu chi tiêu
          </h3>
          {stats.categoryBreakdown.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.categoryBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="amount" nameKey="category" stroke={isDarkMode ? '#111827' : '#ffffff'} strokeWidth={2}>
                    {stats.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${tooltipBorder}` }} formatter={(value: any) => formatVND(Number(value) || 0)} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: textColor }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu chi tiêu</div>
          )}
        </div>
      </div>

      {/* 4. NÚT XUẤT BÁO CÁO Ở CUỐI TRANG - MÀU VÀNG GOLD TECH CHEF TÚ */}
      <div className="flex flex-col items-center pt-4">
        <button 
          onClick={() => exportToExcel(transactions, stats.total)}
          className="w-full max-w-md flex items-center justify-center py-4 px-8 rounded-2xl 
                     bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 
                     text-white font-bold shadow-lg shadow-yellow-500/30 transition-all duration-300 
                     hover:-translate-y-1 active:scale-95 uppercase tracking-wide group"
        >
          <Download className="w-5 h-5 mr-3 group-hover:animate-bounce" />
          Xuất báo cáo chi tiêu tuần
        </button>
        <p className="mt-4 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium">
          Powered by <span className="text-yellow-600/80 font-bold">Tech Chef Tú</span>
        </p>
      </div>
    </div>
  );
};