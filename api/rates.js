export default async function handler(req, res) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  };

  // Mặc định là Lỗi, quét thành công mới đổi số
  let gold = 'Lỗi'; 
  let silver = 'Lỗi'; 
  let usd = 'Lỗi';

  try {
    // 1. DOJI
    try {
      const dojiRes = await fetch('https://giabac.doji.vn', { headers });
      if (dojiRes.ok) {
        const dojiHtml = await dojiRes.text();
        const dojiMatches = dojiHtml.match(/[2345][.,]\d{3}/g);
        if (dojiMatches && dojiMatches.length >= 2) {
          silver = dojiMatches[1].replace(',', '.'); 
        }
      }
    } catch (e) { console.error("DOJI Fetch Error"); }

    // 2. SJC (webgia)
    try {
      const sjcRes = await fetch('https://webgia.com/gia-vang/sjc/', { headers });
      if (sjcRes.ok) {
        const sjcHtml = await sjcRes.text();
        const sjcMatches = sjcHtml.match(/1?[789]\d[.,]\d{3}|[89]\d[.,]\d{3}/g);
        if (sjcMatches && sjcMatches.length >= 2) {
          gold = sjcMatches[1].replace(',', '.');
        }
      }
    } catch (e) { console.error("SJC Fetch Error"); }

    // 3. USD (webgia)
    try {
      const usdRes = await fetch('https://webgia.com/ty-gia/usd-cho-den/', { headers });
      if (usdRes.ok) {
        const usdHtml = await usdRes.text();
        const usdMatches = usdHtml.match(/2[567][.,]\d{3}/g);
        if (usdMatches && usdMatches.length >= 2) {
          usd = usdMatches[1].replace(',', '.');
        }
      }
    } catch (e) { console.error("USD Fetch Error"); }

  } catch (error) {
    console.error("Lỗi API tổng");
  }

  res.status(200).json({ gold, silver, usd });
}
