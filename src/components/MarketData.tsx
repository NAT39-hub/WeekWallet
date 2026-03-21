import React, { useState, useEffect } from 'react';
import { TrendingUp, Coins, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';

export const MarketData: React.FC = () => {
  // Trạng thái ban đầu là "..."
  const [rates, setRates] = useState({
    gold: '...',
    silver: '...',
    usd: '...'
  });
  const [isFetching, setIsFetching] = useState(false);

  const fetchRealTimeRates = async () => {
    setIsFetching(true);
    // Bấm nút là đưa về "..." để biết máy đang làm việc
    setRates({ gold: '...', silver: '...', usd: '...' }); 
    
    try {
      const res = await fetch('/api/rates');
      if (!res.ok) throw new Error('API sập');
      
      const data = await res.json();
      setRates({
        gold: data.gold || 'Lỗi',
        silver: data.silver || 'Lỗi',
        usd: data.usd || 'Lỗi'
      });
    } catch (error) {
      setRates({ gold: 'Lỗi', silver: 'Lỗi', usd: 'Lỗi' });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchRealTimeRates();
    const interval = setInterval(fetchRealTimeRates, 180000);
    return () => clearInterval(interval);
  }, []);

  const marketRates = [
    { label: 'VÀNG SJC', value: rates.gold, unit: 'K/Lượng', icon: rates.gold === 'Lỗi' ? <AlertCircle className="w-3 h-3 text-rose-500" /> : <TrendingUp className="w-3 h-3 text-amber-500" /> },
    { label: 'BẠC DOJI', value: rates.silver, unit: 'K/Lượng', icon: rates.silver === 'Lỗi' ? <AlertCircle className="w-3 h-3 text-rose-500" /> : <Coins className="w-3 h-3 text-slate-400" /> },
    { label: 'USD BÁN RA', value: rates.usd, unit: 'đ', icon: rates.usd === 'Lỗi' ? <AlertCircle className="w-3 h-3 text-rose-500" /> : <DollarSign className="w-3 h-3 text-emerald-500" /> }
  ];

  return (
    <div className="flex items-center space-x-6 relative">
      {marketRates.map((rate, index) => (
        <div key={index} className="flex items-center space-x-2 whitespace-nowrap animate-fade-in-up">
          <div className="p-1.5 bg-slate-50 rounded-lg">{rate.icon}</div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{rate.label}</span>
            <div className="flex items-baseline space-x-1">
              {/* Nếu dính Lỗi thì đổi màu chữ sang đỏ cho dễ nhìn */}
              <span className={`text-xs font-black tracking-tight ${rate.value === 'Lỗi' ? 'text-rose-600' : rate.value === '...' ? 'text-slate-400 animate-pulse' : 'text-slate-800'}`}>
                {rate.value}
              </span>
              {rate.value !== 'Lỗi' && rate.value !== '...' && (
                <span className="text-[10px] font-bold text-slate-400 underline decoration-slate-200">{rate.unit}</span>
              )}
            </div>
          </div>
        </div>
      ))}
      
      <button 
        onClick={fetchRealTimeRates} 
        disabled={isFetching} 
        className="ml-4 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-all shadow-sm active:scale-90"
      >
        <RefreshCw className={`w-3 h-3 text-slate-400 ${isFetching ? 'animate-spin text-indigo-500' : ''}`} />
      </button>
    </div>
  );
};
