import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { WeeklyStats, Transaction } from '../types';
import { formatVND, exportToExcel } from '../utils';
import { Download, ChartPie, TrendingUp } from 'lucide-react'; // Đã đổi tên icon ở đây

interface DashboardProps {
  stats: WeeklyStats;
  transactions: Transaction[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b', '#ec4899', '#06b6d4'];

export const Dashboard: React.FC<DashboardProps> = ({ stats, transactions }) => {
  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6 transition-all duration-300">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Tổng chi tiêu tuần này</h2>
        <div className="text-4xl font-light text-gray-900">{formatVND(stats.total)}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6">
          <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-blue-500" /> Theo ngày
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailyBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip formatter={(v: any) => [formatVND(Number(v)), 'Chi tiêu']} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6">
          <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center">
            <ChartPie className="w-4 h-4 mr-2 text-emerald-500" /> Cơ cấu chi tiêu
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.categoryBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="amount" nameKey="category">
                  {stats.categoryBreakdown.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatVND(Number(v))} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center pt-4">
        <button onClick={() => exportToExcel(transactions, stats.total)} className="w-full max-w-md flex items-center justify-center py-4 px-8 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-bold shadow-lg shadow-yellow-500/30 transition-all duration-300 hover:-translate-y-1 active:scale-95 uppercase group">
          <Download className="w-5 h-5 mr-3 group-hover:animate-bounce" /> Xuất báo cáo WeekWallet
        </button>
        <p className="mt-4 text-[10px] text-gray-400 uppercase tracking-[0.2em]">Powered by Tech Chef Tú</p>
      </div>
    </div>
  );
};