import React, { useState, useEffect } from 'react';
import { TrendingUp, Coins, DollarSign } from 'lucide-react';

export const MarketData: React.FC = () => {
  // 1. Khởi tạo bằng số cứng y hệt code cũ của anh để giao diện HIỆN NGAY LẬP TỨC
  const [rates, setRates] = useState({
    gold: '186.100',
    silver: '3.466',
    usd: '27.150 - 27.200'
  });

  // 2. Chạy ngầm việc lấy giá USD (Lỗi thì bỏ qua, không làm sập web)
  useEffect(() => {
    const fetchUsd = async () => {
      try {
        const targetUrl = 'https://webgia.com/ty-gia/usd-cho-den/'; 
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
        if (!res.ok) return;
        
        const data = await res.json();
        const html = data.contents;
        
        // Quét tìm tất cả các số định dạng 27.xxx hoặc 27,xxx (Bắt mọi trường hợp)
        const matches = html.match(/2[5678][.,]\d{3}/g);
        if (matches && matches.length >= 2) {
           const buy = matches[0].replace(',', '.');
           const sell = matches[1].replace(',', '.');
           // Cập nhật nếu tìm thấy giá trị hợp lý
           if (buy !== sell) {
              setRates(prev => ({ ...prev, usd: `${buy} - ${sell}` }));
           }
        }
      } catch (e) {
        // Lỗi mạng hoặc web chặn -> Im lặng dùng số mặc định, không báo lỗi
        console.log("Dùng tỷ giá mặc định.");
      }
    };

    fetchUsd();
    // 3 phút quét lại 1 lần
    const interval = setInterval(fetchUsd, 180000);
    return () => clearInterval(interval);
  }, []);

  // 3. Khung hiển thị chuẩn VIP
  const marketRates = [
    { label: 'VÀNG SJC', value: rates.gold, unit: 'K/Lượng', icon: <TrendingUp className="w-3 h-3 text-amber-500" /> },
    { label: 'BẠC DOJI', value: rates.silver, unit: 'K/Lượng', icon: <Coins className="w-3 h-3 text-slate-400" /> },
    { label: 'USD CHỢ ĐEN', value: rates.usd, unit: 'đ', icon: <DollarSign className="w-3 h-3 text-emerald-500" /> }
  ];

  return (
    <div className="flex items-center space-x-8">
      {marketRates.map((rate, index) => (
        <div key={index} className="flex items-center space-x-2 whitespace-nowrap animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
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
    </div>
  );
};
