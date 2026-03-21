import React, { useState, useEffect } from 'react';
import { TrendingUp, Coins, DollarSign } from 'lucide-react';

export const MarketData: React.FC = () => {
  // 1. Giá trị mặc định (Back-up an toàn, đảm bảo app không bao giờ trống)
  const [rates, setRates] = useState({
    gold: '186.100',
    silver: '3.466',
    usd: '27.200'
  });

  useEffect(() => {
    const fetchRealTimeRates = async () => {
      // --- 1. LẤY GIÁ VÀNG SJC ---
      try {
        const sjcUrl = 'https://sjc.com.vn/gia-vang-online';
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(sjcUrl)}`);
        const data = await res.json();
        
        // Dò tìm giá bán (thường là cụm số thứ 2 sau khi có chữ SJC)
        // Lấy định dạng số có 2-3 chữ số, dấu chấm/phẩy, rồi 3 chữ số (VD: 82.500 hoặc 186.100)
        const matches = data.contents.match(/\d{2,3}[.,]\d{3}/g);
        if (matches && matches.length >= 2) {
          // Lấy giá trị thứ 2 (thường là giá Bán ra)
          setRates(prev => ({ ...prev, gold: matches[1].replace(',', '.') }));
        }
      } catch (e) { console.log("Lỗi quét Vàng SJC, giữ nguyên giá cũ."); }

      // --- 2. LẤY GIÁ BẠC DOJI ---
      try {
        const dojiUrl = 'https://giabac.doji.vn';
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(dojiUrl)}`);
        const data = await res.json();
        
        // Dò tìm giá bạc (VD: 3.466)
        const matches = data.contents.match(/\d{1,2}[.,]\d{3}/g);
        if (matches && matches.length > 0) {
          setRates(prev => ({ ...prev, silver: matches[0].replace(',', '.') }));
        }
      } catch (e) { console.log("Lỗi quét Bạc DOJI, giữ nguyên giá cũ."); }

      // --- 3. LẤY GIÁ USD TỶ GIÁ USD ---
      try {
        const usdUrl = 'https://tygiausd.org';
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(usdUrl)}`);
        const data = await res.json();
        
        // Dò tìm giá USD bán ra (Thường đầu số 25, 26, 27... VD: 27.200)
        const matches = data.contents.match(/2[5-9][.,]\d{3}/g);
        if (matches && matches.length > 0) {
          setRates(prev => ({ ...prev, usd: matches[0].replace(',', '.') }));
        }
      } catch (e) { console.log("Lỗi quét USD, giữ nguyên giá cũ."); }
    };

    // Chạy lần đầu ngay khi mở web
    fetchRealTimeRates();
    
    // Đặt lịch tự động quét lại sau mỗi 5 phút (300000ms) để không bị các web kia chặn IP
    const interval = setInterval(fetchRealTimeRates, 300000);
    return () => clearInterval(interval);
  }, []);

  // Khung giao diện chuẩn VIP
  const marketRates = [
    { label: 'VÀNG SJC', value: rates.gold, unit: 'K/Lượng', icon: <TrendingUp className="w-3 h-3 text-amber-500" /> },
    { label: 'BẠC DOJI', value: rates.silver, unit: 'K/Lượng', icon: <Coins className="w-3 h-3 text-slate-400" /> },
    { label: 'USD BÁN RA', value: rates.usd, unit: 'đ', icon: <DollarSign className="w-3 h-3 text-emerald-500" /> }
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
