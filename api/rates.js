export default async function handler(req, res) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  };

  let gold = 'Lỗi'; 
  let silver = 'Lỗi'; 
  let usd = 'Lỗi';

  try {
    // 1. USD: Dùng API Quốc Tế Mở (Tỷ giá thực tế toàn cầu - Không bao giờ sập)
    try {
      const usdRes = await fetch('https://open.er-api.com/v6/latest/USD');
      if (usdRes.ok) {
        const data = await usdRes.json();
        const vnd = data.rates.VND; // Lấy ra số thực, vd: 25450.5
        // Định dạng thành 25.450
        usd = (vnd / 1000).toFixed(3);
      }
    } catch (e) { console.error("USD Error"); }

    // 2. VÀNG SJC: Bắn tỉa đúng dòng "1L, 10L, 1KG"
    try {
      const sjcRes = await fetch('https://sjc.com.vn/gia-vang-online', { headers });
      if (sjcRes.ok) {
        const sjcHtml = await sjcRes.text();
        // Tìm đúng vị trí chữ 1L, 10L
        const startIdx = sjcHtml.indexOf('1L, 10L, 1KG');
        if (startIdx !== -1) {
          // Chỉ cắt 300 ký tự ngay sau chữ đó để quét số
          const block = sjcHtml.substring(startIdx, startIdx + 300);
          const sjcMatches = block.match(/1[6789]\d[.,]\d{3}/g);
          if (sjcMatches && sjcMatches.length >= 2) {
            gold = sjcMatches[1].replace(',', '.'); // Số thứ 2 là Bán Ra
          }
        }
      }
    } catch (e) { console.error("SJC Error"); }

    // 3. BẠC DOJI: Bắn tỉa đúng dòng "99.9 - 1 LƯỢNG"
    try {
      const dojiRes = await fetch('https://giabac.doji.vn', { headers });
      if (dojiRes.ok) {
        const dojiHtml = await dojiRes.text();
        // Tìm đúng vị trí chữ Bạc 1 Lượng
        const startIdx = dojiHtml.indexOf('99.9 - 1 LƯỢNG');
        if (startIdx !== -1) {
          const block = dojiHtml.substring(startIdx, startIdx + 300);
          const dojiMatches = block.match(/[2345][.,]\d{3}/g);
          if (dojiMatches && dojiMatches.length >= 2) {
            silver = dojiMatches[1].replace(',', '.'); // Số thứ 2 là Bán Ra
          }
        }
      }
    } catch (e) { console.error("DOJI Error"); }

  } catch (error) {
    console.error("Lỗi API tổng");
  }

  res.status(200).json({ gold, silver, usd });
}
