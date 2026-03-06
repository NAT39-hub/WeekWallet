import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Coins } from 'lucide-react';

export const MarketData: React.FC = () => {
  // 1. Khai báo các State để lưu trữ dữ liệu
  const [usd, setUsd] = useState<number | null>(null);
  const [gold, setGold] = useState<string | null>(null);
  const [silver, setSilver] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Sử dụng useEffect để gọi API khi component được render lần đầu
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // --- 1. LẤY TỶ GIÁ USD (Dùng API ổn định hơn) ---
      try {
        const fallbackRes = await fetch('https://open.er-api.com/v6/latest/USD');
        const fallbackData = await fallbackRes.json();
        if (fallbackData && fallbackData.rates && fallbackData.rates.VND) {
          setUsd(fallbackData.rates.VND);
        }
      } catch (error) {
        console.error("Lỗi khi lấy USD:", error);
      }

      // --- 2. LẤY GIÁ VÀNG SJC ---
      try {
        const sjcApiUrl = 'https://sjc.com.vn/GoldPrice/Services/PriceService.ashx';
        const goldRes = await fetch(sjcApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ method: 'GetSJCGoldPriceByDate' })
        });

        const goldData = await goldRes.json();
        if (goldData && goldData.success && goldData.data) {
          const hcmGold = goldData.data.find((item: any) =>
            item.BranchName === 'Hồ Chí Minh' && item.TypeName.includes('SJC 1L')
          );

          if (hcmGold && hcmGold.Sell) {
            setGold(`${hcmGold.Sell} VNĐ/lượng`);
          } else if (goldData.data.length > 0 && goldData.data[0].Sell) {
            setGold(`${goldData.data[0].Sell} VNĐ/lượng`);
          } else {
            setGold('Không tìm thấy giá');
          }
        } else {
          setGold('Lỗi dữ liệu');
        }
      } catch (error) {
        console.error("Lỗi khi lấy Vàng (thường do CORS):", error);
        setGold('Lỗi kết nối');
      }

      // --- 3. LẤY GIÁ BẠC DOJI ---
      try {
        const silverRes = await fetch('https://api.codetabs.com/v1/proxy?quest=https://giabac.doji.vn/data/DataBac9991Luong.txt');
        const silverText = await silverRes.text();

        const lines = silverText.trim().split('\n');
        if (lines.length > 0) {
          const lastLine = lines[lines.length - 1];
          const parts = lastLine.split('|');
          if (parts.length >= 2) {
            const sellPrice = parseInt(parts[1], 10);
            if (!isNaN(sellPrice)) {
              setSilver(`${new Intl.NumberFormat('vi-VN').format(sellPrice)} VNĐ/lượng`);
            } else {
              setSilver('Lỗi dữ liệu');
            }
          } else {
            setSilver('Lỗi dữ liệu');
          }
        } else {
          setSilver('Không tìm thấy giá');
        }
      } catch (error) {
        console.error("Lỗi khi lấy Bạc:", error);
        setSilver('Lỗi kết nối');
      }

      setIsLoading(false);
    };

    // Gọi hàm lấy dữ liệu ngay lập tức
    fetchData();

    // 3. Thiết lập tự động cập nhật lại mỗi 5 phút (300,000 milliseconds)
    const interval = setInterval(fetchData, 5 * 60 * 1000);

    // Cleanup function: Xóa bộ đếm thời gian khi component bị hủy
    return () => clearInterval(interval);
  }, []);

  // 4. Render giao diện
  return (
    <div className="flex items-center space-x-3 sm:space-x-6">
      {/* Khối hiển thị Vàng */}
      <div className="flex items-center space-x-2">
        <TrendingUp className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium leading-none">Vàng SJC</span>
          <span className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
            {isLoading && !gold ? '...' : gold || '--'}
          </span>
        </div>
      </div>

      {/* Đường gạch dọc phân cách */}
      <div className="w-px h-6 bg-gray-200 dark:bg-gray-800"></div>

      {/* Khối hiển thị Bạc */}
      <div className="flex items-center space-x-2">
        <Coins className="w-4 h-4 text-gray-400 dark:text-gray-300" />
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium leading-none">Bạc Doji</span>
          <span className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
            {isLoading && !silver ? '...' : silver || '--'}
          </span>
        </div>
      </div>

      {/* Đường gạch dọc phân cách */}
      <div className="w-px h-6 bg-gray-200 dark:bg-gray-800"></div>

      {/* Khối hiển thị USD */}
      <div className="flex items-center space-x-2">
        <DollarSign className="w-4 h-4 text-green-600 dark:text-green-500" />
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium leading-none">USD</span>
          <span className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
            {isLoading && !usd ? '...' : (usd ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(usd) : '--')}
          </span>
        </div>
      </div>
    </div>
  );
};
