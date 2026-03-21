export default async function handler(req, res) {
  // Giả danh trình duyệt siêu cấp để lách Cloudflare
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
  };

  // Giá trị dự phòng (Đã cập nhật Bạc theo ảnh anh gửi)
  let gold = '171.000'; 
  let silver = '2.648'; 
  let usd = '27.200';

  try {
    // 1. LẤY GIÁ VÀNG SJC
    try {
      const sjcRes = await fetch('https://sjc.com.vn/gia-vang-online', { headers });
      const sjcHtml = await sjcRes.text();
      // Mở rộng bộ lọc: Lấy số từ 16x đến 19x (Ví dụ: 171.000)
      const sjcMatch = sjcHtml.match(/1[6789]\d[.,]\d{3}/);
      if (sjcMatch) gold = sjcMatch[0].replace(',', '.');
    } catch (e) { console.error("SJC Error"); }

    // 2. LẤY GIÁ BẠC DOJI
    try {
      const dojiRes = await fetch('https://giabac.doji.vn', { headers });
      const dojiHtml = await dojiRes.text();
      // FIX LỖI DOJI: Mở rộng bộ lọc lấy số từ 2.xxx đến 4.xxx
      const dojiMatch = dojiHtml.match(/[234][.,]\d{3}/);
      if (dojiMatch) silver = dojiMatch[0].replace(',', '.');
    } catch (e) { console.error("DOJI Error"); }

    // 3. LẤY GIÁ USD CHỢ ĐEN
    try {
      const usdRes = await fetch('https://tygiausd.org', { headers });
      const usdHtml = await usdRes.text();
      // Mở rộng bộ lọc lấy số từ 25.xxx đến 27.xxx
      const usdMatch = usdHtml.match(/2[567][.,]\d{3}/);
      if (usdMatch) usd = usdMatch[0].replace(',', '.');
    } catch (e) { console.error("USD Error"); }

  } catch (error) {
    console.error("Lỗi API tổng");
  }

  res.status(200).json({ gold, silver, usd });
}
