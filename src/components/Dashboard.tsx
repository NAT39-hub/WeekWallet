import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { WeeklyStats } from '../types';
import { formatVND } from '../utils';

interface DashboardProps {
  stats: WeeklyStats;
  isDarkMode?: boolean;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export const Dashboard: React.FC<DashboardProps> = ({ stats, isDarkMode }) => {
  const textColor = isDarkMode ? '#9ca3af' : '#64748b';
  const tooltipBg = isDarkMode ? '#1f2937' : '#ffffff';
  const tooltipBorder = isDarkMode ? '#374151' : '#f1f5f9';
  const tooltipText = isDarkMode ? '#f3f4f6' : '#111827';
  const barBg = isDarkMode ? '#374151' : '#e2e8f0';

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tổng chi tiêu tuần này</h2>
        <div className="text-4xl font-light text-gray-900 dark:text-white">{formatVND(stats.total)}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
          <h3 className="text-base font-medium text-gray-800 dark:text-gray-100 mb-4">Chi tiêu theo ngày</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailyBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: textColor }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: textColor }} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip cursor={{ fill: isDarkMode ? '#374151' : '#f1f5f9' }} contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${tooltipBorder}`, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: tooltipText }} itemStyle={{ color: tooltipText }} formatter={(value: any) => [formatVND(Number(value) || 0), 'Chi tiêu']} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {stats.dailyBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.amount > 0 ? '#3b82f6' : barBg} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
          <h3 className="text-base font-medium text-gray-800 dark:text-gray-100 mb-4">Cơ cấu chi tiêu</h3>
          {stats.categoryBreakdown.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.categoryBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="amount" nameKey="category" stroke={isDarkMode ? '#111827' : '#ffffff'} strokeWidth={2}>
                    {stats.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${tooltipBorder}`, color: tooltipText }} itemStyle={{ color: tooltipText }} formatter={(value: any) => formatVND(Number(value) || 0)} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: textColor }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">Chưa có dữ liệu chi tiêu trong tuần</div>
          )}
        </div>
      </div>
    </div>
  );
};
