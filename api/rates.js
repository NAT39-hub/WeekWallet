// File: api/rates.js
// Đây là Backend Serverless của Vercel, chạy ngầm trên máy chủ để vượt tường lửa

export default async function handler(req, res) {
  // Giả danh trình duyệt thật (Chrome trên Windows) để không bị Cloudflare đá ra
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
  };

  // Giá trị dự phòng (Fallback) nếu web nguồn sập
  let gold = '171.000'; // Cập nhật theo hình mới nhất của anh Tú
  let silver = '3.090'; 
  let usd = '27.200';

  try {
    // 1. LẤY GIÁ VÀNG SJC
    try {
      const sjcRes = await fetch('https://sjc.com.vn/gia-vang-online', { headers });
      const sjcHtml = await sjcRes.text();
      // Tìm số định dạng 171,000 hoặc 171.000
      const sjcMatch = sjcHtml.match(/1[789]\d[.,]\d{3}/);
      if (sjcMatch) gold = sjcMatch[0].replace(',', '.');
    } catch (e) { console.error("SJC Error"); }

    // 2. LẤY GIÁ BẠC DOJI
    try {
      const dojiRes = await fetch('https://giabac.doji.vn', { headers });
      const dojiHtml = await dojiRes.text();
      const dojiMatch = dojiHtml.match(/[34][.,]\d{3}/);
      if (dojiMatch) silver = dojiMatch[0].replace(',', '.');
    } catch (e) { console.error("DOJI Error"); }

    // 3. LẤY GIÁ USD CHỢ ĐEN
    try {
      const usdRes = await fetch('https://tygiausd.org', { headers });
      const usdHtml = await usdRes.text();
      const usdMatch = usdHtml.match(/2[567][.,]\d{3}/);
      if (usdMatch) usd = usdMatch[0].replace(',', '.');
    } catch (e) { console.error("USD Error"); }

  } catch (error) {
    console.error("Lỗi tổng API");
  }

  // Trả dữ liệu sạch sẽ về cho Frontend
  res.status(200).json({ gold, silver, usd });
}
