export default async function handler(req, res) {
  let gold = 'Lỗi'; 
  let silver = 'Lỗi'; 
  let usd = 'Lỗi';

  // SÚNG ĐẠI LIÊN PROXY: Chống Cloudflare khóa mõm
  const fetchHTML = async (targetUrl) => {
    const proxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
      `https://api.codetabs.com/v1/proxy?quest=${targetUrl}`
    ];
    for (let p of proxies) {
      try {
        const r = await fetch(p);
        if (r.ok) {
          const text = await r.text();
          // Lọc bỏ các trang rác nếu đụng trúng tường lửa Cloudflare
          if (!text.includes('Just a moment') && !text.includes('Cloudflare')) {
            return text;
          }
        }
      } catch(e) {}
    }
    return '';
  };

  try {
    // 1. VÀNG SJC: Xài API JSON thô của VN (Miễn nhiễm 100% với Cloudflare)
    try {
      const tygiaRes = await fetch('https://tygia.com/json.php?ran=1&rate=0&gold=1&bank=VIETCOM&date=now');
      const tygiaText = await tygiaRes.text();
      // Tìm chuẩn xác giá bán ra của SJC trong chuỗi JSON
      const sjcMatch = tygiaText.match(/"company":"SJC".*?"sell":"([\d.,]+)"/i);
      if (sjcMatch) {
        gold = sjcMatch[1].replace(',', '.');
      } else {
         // Phương án B: Đọc XML ngầm của web SJC
         const sjcXml = await fetchHTML('https://sjc.com.vn/xml/tygiavang.xml');
         const xmlMatch = sjcXml.match(/sell="(\d{2,3}[.,]\d{3})"/);
         if (xmlMatch) gold = xmlMatch[1].replace(',', '.');
      }
    } catch (e) {}

    // 2. BẠC DOJI: Dùng proxy băng chuyền và Khóa đúng dòng "1 LƯỢNG"
    try {
      const dojiHtml = await fetchHTML('https://giabac.doji.vn');
      const idx = dojiHtml.indexOf('99.9 - 1 LƯỢNG');
      if (idx !== -1) {
        const block = dojiHtml.substring(idx, idx + 200);
        const dojiMatches = block.match(/[2345][.,]\d{3}/g);
        if (dojiMatches && dojiMatches.length >= 2) {
          silver = dojiMatches[1].replace(',', '.');
        }
      }
    } catch (e) {}

    // 3. USD CHỢ ĐEN: Trở về Webgia để lấy đúng giá chợ đen
    try {
      const usdHtml = await fetchHTML('https://webgia.com/ty-gia/usd-cho-den/');
      const usdMatches = usdHtml.match(/2[5678][.,]\d{3}/g);
      if (usdMatches && usdMatches.length >= 2) {
        usd = usdMatches[1].replace(',', '.');
      }
    } catch (e) {}

  } catch (error) {}

  res.status(200).json({ gold, silver, usd });
}
