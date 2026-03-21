export default async function handler(req, res) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  };

  let gold = '0'; 
  let silver = '0'; 
  let usd = '0';

  try {
    // 1. BẠC DOJI (Lấy chính xác cột Bán Ra)
    try {
      const dojiRes = await fetch('https://giabac.doji.vn', { headers });
      const dojiHtml = await dojiRes.text();
      // Quét gom tất cả các số đầu 2,3,4
      const dojiMatches = dojiHtml.match(/[234][.,]\d{3}/g);
      if (dojiMatches && dojiMatches.length >= 2) {
        silver = dojiMatches[1].replace(',', '.'); // [1] là lấy con số thứ 2 (Bán Ra)
      } else if (dojiMatches) {
        silver = dojiMatches[0].replace(',', '.');
      }
    } catch (e) { console.error("DOJI Error"); }

    // 2. VÀNG SJC (Khóa mục tiêu chuẩn xác hơn)
    try {
      const sjcRes = await fetch('https://webgia.com/gia-vang/sjc/', { headers });
      const sjcHtml = await sjcRes.text();
      // Gom tất cả số từ 80.xxx đến 199.xxx, phớt lờ mấy số rác 70k
      const sjcMatches = sjcHtml.match(/1[6789]\d[.,]\d{3}|[89]\d[.,]\d{3}/g);
      if (sjcMatches && sjcMatches.length >= 2) {
        gold = sjcMatches[1].replace(',', '.'); // Lấy số thứ 2 (Bán Ra)
      } else if (sjcMatches) {
        gold = sjcMatches[0].replace(',', '.');
      }
    } catch (e) { console.error("SJC Error"); }

    // 3. USD CHỢ ĐEN (Bắt rộng hơn để không trượt)
    try {
      const usdRes = await fetch('https://webgia.com/ty-gia/usd-cho-den/', { headers });
      const usdHtml = await usdRes.text();
      // Bắt các định dạng: 25.123, 26,123, hoặc 27.xxx
      const usdMatches = usdHtml.match(/2[567][.,]\d{3}/g);
      if (usdMatches && usdMatches.length >= 2) {
        usd = usdMatches[1].replace(',', '.'); // Lấy số thứ 2 (Bán Ra)
      } else if (usdMatches) {
        usd = usdMatches[0].replace(',', '.');
      }
    } catch (e) { console.error("USD Error"); }

  } catch (error) {
    console.error("Lỗi API tổng");
  }

  res.status(200).json({ gold, silver, usd });
}
