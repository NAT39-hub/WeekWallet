export default async function handler(req, res) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  };

  // KHÔNG DÙNG SỐ FAKE NỮA. Để là '0' để anh Tú tự kiểm chứng!
  let gold = '0'; 
  let silver = '0'; 
  let usd = '0';

  try {
    // 1. LẤY GIÁ VÀNG SJC (Đổi nguồn sang webgia cho dễ thở)
    try {
      const sjcRes = await fetch('https://webgia.com/gia-vang/sjc/', { headers });
      const sjcHtml = await sjcRes.text();
      // Quét tìm số định dạng 8x.xxx hoặc 17x.xxx
      const sjcMatch = sjcHtml.match(/1?[789]\d[.,]\d{3}/);
      if (sjcMatch) gold = sjcMatch[0].replace(',', '.');
    } catch (e) { console.error("SJC Error"); }

    // 2. LẤY GIÁ BẠC DOJI (Vẫn nguồn cũ, bắt mọi đầu số)
    try {
      const dojiRes = await fetch('https://giabac.doji.vn', { headers });
      const dojiHtml = await dojiRes.text();
      const dojiMatch = dojiHtml.match(/[2345][.,]\d{3}/);
      if (dojiMatch) silver = dojiMatch[0].replace(',', '.');
    } catch (e) { console.error("DOJI Error"); }

    // 3. LẤY GIÁ USD CHỢ ĐEN
    try {
      const usdRes = await fetch('https://webgia.com/ty-gia/usd-cho-den/', { headers });
      const usdHtml = await usdRes.text();
      const usdMatch = usdHtml.match(/2[567][.,]\d{3}/);
      if (usdMatch) usd = usdMatch[0].replace(',', '.');
    } catch (e) { console.error("USD Error"); }

  } catch (error) {
    console.error("Lỗi API tổng");
  }

  res.status(200).json({ gold, silver, usd });
}
