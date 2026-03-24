import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';

export const MarketData: React.FC = () => {
  const [goldRate, setGoldRate] = useState('...');
  const [isFetching, setIsFetching] = useState(false);

  const fetchRates = async () => {
    setIsFetching(true);
    setGoldRate('...'); // Chớp chớp hiệu ứng đang tải

    let finalGold = '167.000'; // Giá dự phòng chuẩn

    try {
      // Quét duy nhất SJC Cần Thơ (Web nhẹ, không chặn Bot)
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://sjccantho.vn/gia-vang')}&disableCache=true&t=${Date.now()}`);
      const data = await res.json();
      const sjcHtml = data.contents || '';

      // Khóa mục tiêu tìm đúng chữ 1L hoặc 1 Lượng
      const idx = sjcHtml.search(/1L|1 Lượng/i);
      const block = idx !== -1 ? sjcHtml.substring(idx, idx + 300) : sjcHtml;

      // Quét số Bán ra định dạng 167.000.000
      const goldMatches = block.match(/1[6789]\d[.,]\d{3}[.,]\d{3}/g);
      if (goldMatches && goldMatches.length >= 2) {
        // Lấy số thứ 2, gọt lấy 7 ký tự đầu để ra "167.000"
        finalGold = goldMatches[1].substring(0, 7).replace(',', '.');
      } else if (goldMatches) {
        finalGold = goldMatches[0].substring(0, 7).replace(',', '.');
      }
    } catch (error) {
      console.log("Lỗi mạng, dùng giá dự phòng");
    } finally {
      setGoldRate(finalGold);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  return (
    <div className="flex items-center space-x-6 relative">
      <div className="flex items-center space-x-2 whitespace-nowrap animate-fade-in-up">
        <div className="p-1.5 bg-slate-50 rounded-lg">
          <TrendingUp className="w-3 h-3 text-amber-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">VÀNG SJC</span>
          <div className="flex items-baseline space-x-1">
            <span className={`text-xs font-black tracking-tight ${goldRate === '...' ? 'text-slate-400 animate-pulse' : 'text-slate-800'}`}>
              {goldRate}
            </span>
            {goldRate !== '...' && (
              <span className="text-[10px] font-bold text-slate-400 underline decoration-slate-200">K/Lượng</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Nút Refresh gọn gàng bên cạnh */}
      <button 
        onClick={fetchRates} 
        disabled={isFetching} 
        className="ml-2 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-all shadow-sm active:scale-90"
      >
        <RefreshCw className={`w-3 h-3 text-slate-400 ${isFetching ? 'animate-spin text-indigo-500' : ''}`} />
      </button>
    </div>
  );
};
