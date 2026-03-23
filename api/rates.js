export default async function handler(req, res) {
  let gold = 'Lỗi'; 
  let silver = 'Lỗi'; 
  let usd = 'Lỗi';

  // 1. USD: API Tỷ giá thế giới (Bao sống vĩnh viễn)
  try {
    const usdRes = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await usdRes.json();
    usd = (data.rates.VND / 1000).toFixed(3); // Chuyển thành định dạng 25.xxx
  } catch (e) {}

  // 2. VÀNG SJC: Lấy từ API ngầm của VnExpress (Web lớn không chặn Vercel)
  try {
    const vneRes = await fetch('https://vnexpress.net/microservice/sheet/type/gold_sjc');
    const vneHtml = await vneRes.text();
    // Giá vàng SJC thực tế dao động ở mức 8x.xxx (80 mấy triệu). Mình quét số này!
    const goldMatches = vneHtml.match(/[789]\d\.\d{3}/g);
    if (goldMatches && goldMatches.length >= 2) {
      gold = goldMatches[1]; // Số thứ 2 luôn là giá Bán Ra trên VnExpress
    } else if (goldMatches) {
      gold = goldMatches[0];
    }
  } catch (e) {}

  // 3. BẠC DOJI: Lách luật bằng Proxy CodeTabs (Xịn hơn AllOrigins)
  try {
    const dojiRes = await fetch('https://api.codetabs.com/v1/proxy?quest=https://giabac.doji.vn');
    const dojiHtml = await dojiRes.text();
    // Bạc DOJI bán ra đang ở mức 2.xxx hoặc 3.xxx
    const dojiMatches = dojiHtml.match(/[234][.,]\d{3}/g);
    if (dojiMatches && dojiMatches.length >= 2) {
      silver = dojiMatches[1].replace(',', '.'); // Lấy số thứ 2
    } else if (dojiMatches) {
      silver = dojiMatches[0].replace(',', '.');
    }
  } catch (e) {}

  res.status(200).json({ gold, silver, usd });
}
