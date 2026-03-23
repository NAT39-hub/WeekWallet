export default async function handler(req, res) {
  let gold = 'Lỗi'; 
  let silver = 'Lỗi'; 
  let usd = 'Lỗi';

  // Vũ khí tối thượng: Hàm dùng Proxy CodeTabs lách mọi tường lửa Cloudflare
  const fetchHTML = async (url) => {
    try {
      const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${url}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) return '';
      return await response.text();
    } catch (e) {
      return '';
    }
  };

  try {
    // 1. USD CHỢ ĐEN (Webgia) - Trả lại đúng ý anh Tú!
    try {
      const usdHtml = await fetchHTML('https://webgia.com/ty-gia/usd-cho-den/');
      // Quét các số tỷ giá chợ đen (VD: 25.120, 26.500, 27.200)
      const usdMatches = usdHtml.match(/2[5678][.,]\d{3}/g);
      if (usdMatches && usdMatches.length >= 2) {
        usd = usdMatches[1].replace(',', '.'); // Lấy số thứ 2 (Bán Ra)
      } else if (usdMatches) {
        usd = usdMatches[0].replace(',', '.');
      }
    } catch (e) {}

    // 2. BẠC DOJI (Giữ nguyên vì đã chạy quá mượt)
    try {
      const dojiHtml = await fetchHTML('https://giabac.doji.vn');
      const dojiMatches = dojiHtml.match(/[2345][.,]\d{3}/g);
      if (dojiMatches && dojiMatches.length >= 2) {
        silver = dojiMatches[1].replace(',', '.');
      } else if (dojiMatches) {
        silver = dojiMatches[0].replace(',', '.');
      }
    } catch (e) {}

    // 3. VÀNG SJC (Web chính chủ) - Trị tận gốc số hàng triệu
    try {
      const sjcHtml = await fetchHTML('https://sjc.com.vn/gia-vang-online');
      const idx = sjcHtml.indexOf('1L, 10L'); // Tìm đúng dòng 1 Lượng
      if (idx !== -1) {
        const block = sjcHtml.substring(idx, idx + 300);
        // SJC ghi là 171,000,000. Lệnh này sẽ chẻ lấy đúng "171,000" ở khúc đầu!
        const sjcMatches = block.match(/1[6789]\d[.,]\d{3}/g);
        if (sjcMatches && sjcMatches.length >= 2) {
          gold = sjcMatches[1].replace(',', '.'); // Ép thành 171.000
        } else if (sjcMatches) {
          gold = sjcMatches[0].replace(',', '.');
        }
      }
    } catch (e) {}

  } catch (error) {
    console.error("Lỗi API tổng");
  }

  res.status(200).json({ gold, silver, usd });
}
