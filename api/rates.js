export default async function handler(req, res) {
  let gold = 'Lỗi'; 
  let silver = 'Lỗi'; 
  let usd = 'Lỗi';

  // 1. USD: API Quốc tế (Đang chạy rất mượt)
  try {
    const usdRes = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await usdRes.json();
    usd = (data.rates.VND / 1000).toFixed(3);
  } catch (e) {}

  // 2. BẠC DOJI: Proxy CodeTabs (Đang chạy rất mượt)
  try {
    const dojiRes = await fetch('https://api.codetabs.com/v1/proxy?quest=https://giabac.doji.vn');
    const dojiHtml = await dojiRes.text();
    const dojiMatches = dojiHtml.match(/[234][.,]\d{3}/g);
    if (dojiMatches && dojiMatches.length >= 2) {
      silver = dojiMatches[1].replace(',', '.');
    } else if (dojiMatches) {
      silver = dojiMatches[0].replace(',', '.');
    }
  } catch (e) {}

  // 3. VÀNG SJC (TẦNG 1): Dùng VnExpress
  try {
    const vneRes = await fetch('https://vnexpress.net/microservice/sheet/type/gold_sjc');
    const vneHtml = await vneRes.text();
    // ĐÃ FIX LỖI: Dạy máy quét nhận diện cả số 8x.xxx và 17x.xxx, 18x.xxx
    const goldMatches = vneHtml.match(/(?:1\d{2}|[789]\d)[.,]\d{3}/g);
    if (goldMatches && goldMatches.length >= 2) {
      gold = goldMatches[1].replace(',', '.'); 
    } else if (goldMatches) {
      gold = goldMatches[0].replace(',', '.');
    }
  } catch (e) {}

  // 3. VÀNG SJC (TẦNG 2 - BỌC HẬU): Nếu VnExpress sập, tự động vòng qua SJC.com.vn
  if (gold === 'Lỗi') {
    try {
      const sjcRes = await fetch('https://api.codetabs.com/v1/proxy?quest=https://sjc.com.vn/gia-vang-online');
      const sjcHtml = await sjcRes.text();
      const startIdx = sjcHtml.indexOf('1L, 10L, 1KG');
      if (startIdx !== -1) {
        const block = sjcHtml.substring(startIdx, startIdx + 300);
        const sjcMatches = block.match(/(?:1\d{2}|[789]\d)[.,]\d{3}/g);
        if (sjcMatches && sjcMatches.length >= 2) {
          gold = sjcMatches[1].replace(',', '.');
        }
      }
    } catch (e) {}
  }

  res.status(200).json({ gold, silver, usd });
}
