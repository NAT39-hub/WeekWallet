import React, { useState, useEffect } from 'react';
import { TrendingUp, Coins, DollarSign, RefreshCw } from 'lucide-react';

export const MarketData: React.FC = () => {
  // Giá trị gốc dự phòng để không bao giờ bị trống
  const [rates, setRates] = useState({
    gold: '186.100',
    silver: '3.466',
    usd: '27.200'
  });
  const [isFetching, setIsFetching] = useState(false);

  const fetchRealTimeRates = async () => {
    setIsFetching(true);
    try {
      // Hàm bọc Proxy chống Cache cực mạnh
      const getRawText = async (url: string) => {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&disableCache=true&t=${Date.now()}`;
        const res = await fetch(proxyUrl);
        const data = await res.json();
        
        // Lột sạch HTML, chỉ lấy Text thô để quét số không bị vướng
        const doc = new DOMParser().parseFromString(data.contents || "", 'text/html');
        return doc.body.textContent || "";
      };

      // 1. Quét VÀNG SJC (Tìm số dạng 7x.xxx, 8x.xxx, 9x.xxx)
      try {
        const sjcText = await getRawText('https://sjc.com.vn/gia-vang-online');
        const matchGold = sjcText.match(/[789]\d[.,]\d{3}/);
        if (matchGold) setRates(prev => ({ ...prev, gold: matchGold[0].replace(',', '.') }));
      } catch (e) { console.log("Lỗi Vàng"); }

      // 2. Quét BẠC DOJI (Tìm số dạng 3.xxx, 4.xxx)
      try {
        const dojiText = await getRawText('https://giabac.doji.vn');
        const matchSilver = dojiText.match(/[345][.,]\d{3}/);
        if (matchSilver) setRates(prev => ({ ...prev, silver: matchSilver[0].replace(',', '.') }));
      } catch (e) { console.log("Lỗi Bạc"); }

      // 3. Quét USD (Tìm số dạng 25.xxx, 26.xxx, 27.xxx)
      try {
        const usdText = await getRawText('https://tygiausd.org');
        const matchUsd = usdText.match(/2[5678][.,]\d{3}/);
        if (matchUsd) setRates(prev => ({ ...prev, usd: matchUsd[0].replace(',', '.') }));
      } catch (e) { console.log("Lỗi USD"); }

    } catch (error) {
      console.log("Lỗi tổng", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchRealTimeRates();
    // Tự động quét 5 phút / lần
    const interval = setInterval(fetchRealTimeRates, 300000);
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
      
      {/* Nút Refresh thủ công để anh Tú tự bấm Test */}
      <button 
        onClick={fetchRealTimeRates} 
        disabled={isFetching} 
        className="ml-4 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-all shadow-sm active:scale-90"
        title="Tải lại giá ngay"
      >
        <RefreshCw className={`w-3 h-3 text-slate-400 ${isFetching ? 'animate-spin text-indigo-500' : ''}`} />
      </button>
    </div>
  );
};
