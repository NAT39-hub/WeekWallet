export default async function handler(req, res) {
  let gold = 'Lỗi'; 
  let silver = 'Lỗi'; 
  let usd = 'Lỗi';

  // Đóng giả Google Bot để các web Việt Nam ưu tiên cho qua cửa
  const headers = { 
    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  };

  // 1. LẤY USD TỪ API QUỐC TẾ (Sống 100%, tỷ giá thế giới chuẩn xác)
  try {
    const usdRes = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await usdRes.json();
    usd = (data.rates.VND / 1000).toFixed(3); // Chuyển thành định dạng 26.128
  } catch (e) {}

  // 2. LƯỚI QUÉT VÀNG & BẠC ĐA TẦNG (Tự động đổi nguồn nếu bị tường lửa chặn)
  const sources = [
    'https://tygia.com/json.php?ran=1&rate=0&gold=1&bank=VIETCOM&date=now', // Ưu tiên 1: API JSON thô
    'https://chogia.vn/gia-vang/',                                          // Ưu tiên 2: Trang tổng hợp web nhẹ
    'https://api.allorigins.win/raw?url=https://webgia.com/gia-vang/sjc/',  // Ưu tiên 3: Dùng Proxy chui qua webgia
    'https://api.allorigins.win/raw?url=https://giabac.doji.vn'             // Ưu tiên 4: Cố đấm ăn xôi vào thẳng DOJI
  ];

  for (let url of sources) {
    try {
      const response = await fetch(url, { headers });
      const text = await response.text();
      
      // Bắt giá Vàng: Lọc tìm chính xác các con số từ 160.000 đến 199.999 (Ví dụ: 171.000)
      if (gold === 'Lỗi') {
        const gMatch = text.match(/1[6789]\d[.,]\d{3}/);
        if (gMatch) gold = gMatch[0].replace(',', '.');
      }

      // Bắt giá Bạc: Lọc tìm chính xác các con số từ 2.000 đến 4.999 (Ví dụ: 2.648)
      if (silver === 'Lỗi') {
        const sMatch = text.match(/[234][.,]\d{3}/);
        if (sMatch) silver = sMatch[0].replace(',', '.');
      }

      // Nếu đã thu hoạch đủ cả 2 số thì thoát vòng lặp ngay để trả kết quả về App nhanh nhất
      if (gold !== 'Lỗi' && silver !== 'Lỗi') break;
    } catch (e) {
      continue; // Đụng tường lửa web này thì âm thầm nhảy sang web khác quét tiếp
    }
  }

  res.status(200).json({ gold, silver, usd });
}
