import React, { useState, useEffect } from 'react';
import { TrendingUp, Coins, DollarSign, RefreshCw } from 'lucide-react';

export const MarketData: React.FC = () => {
  const [rates, setRates] = useState({
    gold: '171.000', // Giá khởi tạo tắp lự
    silver: '3.090',
    usd: '27.200'
  });
  const [isFetching, setIsFetching] = useState(false);

  const fetchRealTimeRates = async () => {
    setIsFetching(true);
    try {
      // Gọi trực tiếp đến API Backend nhà làm (bỏ qua mọi rào cản proxy bên ngoài)
      const res = await fetch('/api/rates');
      if (!res.ok) throw new Error('API Error');
      
      const data = await res.json();
      setRates({
        gold: data.gold,
        silver: data.silver,
        usd: data.usd
      });
    } catch (error) {
      console.log("Dùng số dự phòng vì Backend bận.");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchRealTimeRates();
    // Tự động quét 3 phút / lần
    const interval = setInterval(fetchRealTimeRates, 180000);
    return () => clearInterval(interval);
  }, []);

  const marketRates = [
    { label: 'VÀNG SJC', value: rates.gold, unit: 'K/Lượng', icon: <TrendingUp className="w-3 h-3 text-amber-500" /> },
    { label: 'BẠC DOJI', value: rates.silver, unit: 'K/Lượng', icon: <Coins className="w-3 h-3 text-slate-400" /> },
    { label: 'USD BÁN RA', value: rates.usd, unit: 'đ', icon: <DollarSign className="w-3 h-3 text-emerald-500" /> }
  ];

  return (
    <div className="flex items-center space-x-6 relative">
      {marketRates.map((rate, index) => (
        <div key={index} className="flex items-center space-x-2 whitespace-nowrap animate-fade-in-up">
          <div className="p-1.5 bg-slate-50 rounded-lg">{rate.icon}</div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{rate.label}</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xs font-black text-slate-800 tracking-tight">{rate.value}</span>
              <span className="text-[10px] font-bold text-slate-400 underline decoration-slate-200">{rate.unit}</span>
            </div>
          </div>
        </div>
      ))}
      
      {/* Nút bấm tải lại thần thánh */}
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
