export default async function handler(req, res) {
  let gold = 'Lỗi'; 
  let silver = 'Lỗi'; 
  let usd = 'Lỗi';

  // Dùng proxy trung chuyển ẩn danh
  const fetchHTML = async (url) => {
    try {
      const response = await fetch(`https://api.codetabs.com/v1/proxy?quest=${url}`);
      if (!response.ok) return '';
      return await response.text();
    } catch (e) { return ''; }
  };

  try {
    // 1. VÀNG SJC (Lách qua đường hầm XML chính thức, xuyên thủng mọi Cloudflare)
    try {
      const sjcXml = await fetchHTML('https://sjc.com.vn/xml/tygiavang.xml');
      // Dò tìm trực tiếp thông số giá bán ra (sell="171.000" hoặc sell="85.000")
      const sjcMatch = sjcXml.match(/sell="(\d{2,3}[.,]\d{3})"/);
      if (sjcMatch) {
        gold = sjcMatch[1].replace(',', '.');
      }
    } catch (e) {}

    // 2. BẠC DOJI (KHÓA MỤC TIÊU ĐÚNG DÒNG "1 LƯỢNG" - Không lấy số rác 5.9k nữa)
    try {
      const dojiHtml = await fetchHTML('https://giabac.doji.vn');
      const idx = dojiHtml.indexOf('99.9 - 1 LƯỢNG'); // Bắt buộc phải tìm thấy dòng này
      if (idx !== -1) {
        const block = dojiHtml.substring(idx, idx + 200); // Khoanh vùng 200 ký tự xung quanh
        const dojiMatches = block.match(/[234][.,]\d{3}/g);
        if (dojiMatches && dojiMatches.length >= 2) {
          silver = dojiMatches[1].replace(',', '.'); // Lấy số thứ 2 (Bán ra)
        } else if (dojiMatches) {
          silver = dojiMatches[0].replace(',', '.');
        }
      }
    } catch (e) {}

    // 3. USD CHỢ ĐEN (Đổi nguồn sang "chogia.vn", bỏ qua "webgia.com" vì bảo mật quá gắt)
    try {
      const usdHtml = await fetchHTML('https://chogia.vn/ty-gia-ngoai-te/usd-cho-den/');
      const usdMatches = usdHtml.match(/2[5678][.,]\d{3}/g); // Tìm đầu 25, 26, 27
      if (usdMatches && usdMatches.length >= 2) {
        usd = usdMatches[1].replace(',', '.'); // Lấy số thứ 2 (Bán ra)
      } else if (usdMatches) {
        usd = usdMatches[0].replace(',', '.');
      }
    } catch (e) {}

  } catch (error) {
    console.error("Lỗi API tổng");
  }

  res.status(200).json({ gold, silver, usd });
}
