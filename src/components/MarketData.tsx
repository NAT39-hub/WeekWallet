import React, { useState, useEffect } from 'react';
import { TrendingUp, Coins, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';

export const MarketData: React.FC = () => {
  const [rates, setRates] = useState({ gold: '...', silver: '...', usd: '...' });
  const [isFetching, setIsFetching] = useState(false);

  const fetchRates = async () => {
    setIsFetching(true);
    setRates({ gold: '...', silver: '...', usd: '...' }); // Hiệu ứng đang tải

    let newGold = 'Lỗi';
    let newSilver = 'Lỗi';
    let newUsd = 'Lỗi';

    // Hàm proxy "xuyên táo" bọc bằng AllOrigins (có gắn time chống lưu cache)
    const fetchRaw = async (url: string) => {
      try {
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}&disableCache=true&t=${Date.now()}`);
        const data = await res.json();
        return data.contents || '';
      } catch(e) { return ''; }
    };

    try {
      // 1. VÀNG SJC: Chọc thẳng API nội bộ của Bảo Tín Minh Châu (KHÔNG TƯỜNG LỬA)
      try {
        // Link API xịn em vừa đào được trong source code của BTMC
        const btmcRaw = await fetchRaw('http://api.btmc.vn/api/BTMCAPI/getpricebtmc?key=3kd8ub1llcg9t45hnoh8hmn7t5kc2v');
        if (btmcRaw) {
           const btmcJson = JSON.parse(btmcRaw);
           // Dò tìm chính xác món "VÀNG MIẾNG( Vàng SJC-999.9)"
           const sjcData = btmcJson.DataList?.Data?.find((item: any) => item.name_type?.includes('SJC'));
           if (sjcData && sjcData.pb) {
              // Nó trả về "8600000" (Giá 86 triệu). Lệnh này cắt nhỏ ra thành "86.000" K/Lượng
              const price = parseInt(sjcData.pb.replace(/,/g, ''));
              if (price > 1000) {
                  newGold = (price / 1000).toLocaleString('vi-VN').replace(/,/g, '.');
              }
           }
        }
      } catch(e) { console.log('Lỗi bốc Vàng SJC'); }

      // 2. BẠC DOJI: Lách qua trang Chợ Giá (Mềm hơn DOJI chính chủ)
      try {
        const bacHtml = await fetchRaw('https://chogia.vn/gia-bac/');
        // Bắn tỉa đúng dòng chứa chữ "Bạc" và bắt con số kế bên
        const bacMatch = bacHtml.match(/Bạc.*?([2345][.,]\d{3})/i);
        if (bacMatch) newSilver = bacMatch[1].replace(',', '.');
      } catch(e) { console.log('Lỗi bốc Bạc DOJI'); }

      // 3. USD CHỢ ĐEN: Lấy chuẩn xác giá Chợ Đen trên Chợ Giá
      try {
         const usdHtml = await fetchRaw('https://chogia.vn/ty-gia-ngoai-te/usd-cho-den/');
         const usdMatches = usdHtml.match(/2[5678][.,]\d{3}/g);
         if (usdMatches && usdMatches.length >= 2) {
            newUsd = usdMatches[1].replace(',', '.'); // Số thứ 2 luôn là Bán ra
         } else if (usdMatches) {
            newUsd = usdMatches[0].replace(',', '.');
         }
      } catch(e) { console.log('Lỗi bốc USD Chợ đen'); }

      // Đẩy lên giao diện
      setRates({ gold: newGold, silver: newSilver, usd: newUsd });
    } catch(error) {
      setRates({ gold: 'Lỗi', silver: 'Lỗi', usd: 'Lỗi' });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const marketRates = [
    { label: 'VÀNG SJC', value: rates.gold, unit: 'K/Lượng', icon: rates.gold === 'Lỗi' ? <AlertCircle className="w-3 h-3 text-rose-500" /> : <TrendingUp className="w-3 h-3 text-amber-500" /> },
    { label: 'BẠC DOJI', value: rates.silver, unit: 'K/Lượng', icon: rates.silver === 'Lỗi' ? <AlertCircle className="w-3 h-3 text-rose-500" /> : <Coins className="w-3 h-3 text-slate-400" /> },
    { label: 'USD CHỢ ĐEN', value: rates.usd, unit: 'đ', icon: rates.usd === 'Lỗi' ? <AlertCircle className="w-3 h-3 text-rose-500" /> : <DollarSign className="w-3 h-3 text-emerald-500" /> }
  ];

  return (
    <div className="flex items-center space-x-6 relative">
      {marketRates.map((rate, index) => (
        <div key={index} className="flex items-center space-x-2 whitespace-nowrap animate-fade-in-up">
          <div className="p-1.5 bg-slate-50 rounded-lg">{rate.icon}</div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{rate.label}</span>
            <div className="flex items-baseline space-x-1">
              {/* Lỗi thì hiện đỏ, đang lấy thì chớp chớp, có số thì hiện xanh đen */}
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
        onClick={fetchRates} 
        disabled={isFetching} 
        className="ml-4 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-all shadow-sm active:scale-90"
      >
        <RefreshCw className={`w-3 h-3 text-slate-400 ${isFetching ? 'animate-spin text-indigo-500' : ''}`} />
      </button>
    </div>
  );
};
