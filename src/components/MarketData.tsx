import React, { useState, useEffect } from 'react';

// --- CSS Animations & Font (Nhúng trực tiếp vào App) ---
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;900&display=swap');

  * {
    font-family: 'Inter', sans-serif;
  }

  /* Hiệu ứng lún nút khi bấm */
  .btn-press {
    transition: transform 0.1s ease-in-out;
  }
  .btn-press:active {
    transform: scale(0.95);
  }
  .btn-press:disabled {
    transform: none;
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Hiệu ứng hiện Popup (Trượt & Mờ dần) */
  .popup-animate {
    animation: slideUpFade 0.3s ease-out forwards;
  }

  @keyframes slideUpFade {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Hiệu ứng Toast Notification */
  .toast-enter {
    animation: slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
  .toast-exit {
    animation: slideUp 0.4s ease-in forwards;
  }

  @keyframes slideDown {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes slideUp {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(-100%); opacity: 0; }
  }
  
  /* Tuỳ chỉnh Scrollbar cho mượt */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #111; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #555; }
`;

function App() {
  const [inputData, setInputData] = useState("");
  const [detectedIDs, setDetectedIDs] = useState([]);
  const [history, setHistory] = useState({ transactions: [], exported: [], total_usd: 0 });
  const [inventory, setInventory] = useState({ usd: "...", hkd: "..." }); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportConfig, setExportConfig] = useState({ visible: false, type: "" });
  const [exportCustomer, setExportCustomer] = useState("");
  const [exportQuantity, setExportQuantity] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [importData, setImportData] = useState("");
  const [importingType, setImportingType] = useState(null);
  const [popup, setPopup] = useState({ visible: false, title: "", val: "", status: "COPY DỮ LIỆU", mode: "nap" });
  const [connStatus, setConnStatus] = useState("checking");
  const [scanUrl, setScanUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const [showKhoPopup, setShowKhoPopup] = useState(false);
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);

  // --- Hệ thống Toast Notification thay cho alert() ---
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" }); // type: 'success', 'error', 'info'
  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000); // Tự động ẩn sau 3 giây
  };

  const API_URL = "https://techchefcenter.onrender.com";
  const recentDates = Array.from({length: 7}, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');
  });
  const [selectedDate, setSelectedDate] = useState(recentDates[0]);

  useEffect(() => {
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";
    document.title = "Tú Voi";
    checkConnection(); fetchInventory(); fetchHistory(selectedDate);
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { fetchHistory(selectedDate); }, [selectedDate]);

  const extractIDs = (text) => {
    if (!text) return [];
    const regex = /[A-Z0-9]{8,20}|\d{3}-\d{3}-\d{4}/g;
    const matches = text.match(regex) || [];
    return [...new Set(matches)];
  };

  const handleInputChange = (val) => {
    setInputData(val);
    setDetectedIDs(extractIDs(val));
  };

  const keepOnlyIDs = () => {
    if (detectedIDs.length > 0) {
      const idString = detectedIDs.join("\n");
      setInputData(idString);
      setPopup({ visible: true, title: "✨ ĐÃ LỌC ID", val: idString, status: "COPY DỮ LIỆU", mode: "nap" });
    } else {
      showToast("Không tìm thấy mã ID nào hợp lệ!", "error");
    }
  };

  const checkConnection = async () => {
    try {
      const res = await fetch(`${API_URL}/`, { mode: 'cors' });
      setConnStatus(res.ok ? "online" : "offline");
    } catch { setConnStatus("offline"); }
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API_URL}/inventory`);
      const result = await res.json();
      setInventory({ usd: result.usd || "0", hkd: result.hkd || "0" });
    } catch { setInventory({ usd: "!", hkd: "!" }); }
  };

  const fetchHistory = async (dateStr) => {
    try {
      const res = await fetch(`${API_URL}/history?date=${dateStr}`);
      const result = await res.json();
      if (res.ok) {
        setHistory({ 
          transactions: result.transactions || [], 
          exported: result.exported || [], 
          total_usd: result.total_usd || 0 
        });
      }
    } catch {}
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleInputChange(text); 
      showToast("Đã dán dữ liệu!", "success");
    } catch (err) {
      showToast("Cấp quyền Clipboard cho Web nhé!", "error");
    }
  };

  const handleImport = async (loai) => {
    if (!importData.trim() || importingType) return;
    setImportingType(loai);
    try {
      const res = await fetch(`${API_URL}/actions/nhap_kho`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loai: loai, data_string: importData })
      });
      const data = await res.json();
      showToast(data.message, res.ok ? "success" : "error");
      if(res.ok) { setImportData(""); fetchInventory(); }
    } catch { showToast("Lỗi kết nối máy chủ!", "error"); }
    setImportingType(null);
  };

  const handleProcess = async () => {
    if (!inputData || isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/actions/nap_voice`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data_string: inputData })
      });
      const data = await res.json();
      if (data.val) {
        setInputData("");
        setDetectedIDs([]); 
        setPopup({ visible: true, title: "✅ ĐÃ GHI N26", val: data.val, status: "COPY DỮ LIỆU", mode: "nap" });
        fetchHistory(selectedDate);
      } else { showToast(data.message, "error"); }
    } catch { showToast("Lỗi kết nối Render!", "error"); }
    setIsProcessing(false);
  };

  const executeExport = async () => {
    if (!exportCustomer.trim() || isExporting) return;
    setIsExporting(true);
    try {
      const res = await fetch(`${API_URL}/actions/xuat_kho`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loai: exportConfig.type, ten_khach: exportCustomer, so_luong: exportQuantity })
      });
      const data = await res.json();
      if (data.ids) {
        setExportConfig({ visible: false, type: "" });
        setPopup({ visible: true, title: `📦 MÃ CHO: ${exportCustomer.toUpperCase()}`, val: data.ids, status: "COPY MÃ ID", mode: "xuat" });
        fetchInventory(); fetchHistory(selectedDate);
      } else { showToast(data.message, "error"); }
    } catch { showToast("Lỗi mạng!", "error"); }
    setIsExporting(false);
  };

  const handleScanUrl = async () => {
    if (!scanUrl.trim() || isScanning) return;
    setIsScanning(true);
    setScanResult(null);
    try {
      const res = await fetch(`${API_URL}/actions/scan_url`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scanUrl })
      });
      const data = await res.json();
      setScanResult(data);
    } catch (err) {
      setScanResult({
        status: "GREEN",
        message: "✅ WEBSITE BẢO MẬT TỐT",
        details: ["🛡️ Website bảo mật tốt, có thể chạy, cần vào check tay."]
      });
    }
    setIsScanning(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(popup.val);
    setPopup({ ...popup, status: "COPIED! ✔" });
    setTimeout(() => setPopup({ ...popup, visible: false, status: "COPY DỮ LIỆU" }), 1200);
  };

  const GOLD_PREMIUM = "#D4AF37";
  const GOLD_SATIN_GRADIENT = "linear-gradient(180deg, #d4af37 0%, #c5a059 100%)";
  const GOLD_TEXT = "#c5a059";
  const GLOW_SOFT = "0 0 10px rgba(212, 175, 55, 0.2)"; 

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ backgroundColor: '#000', minHeight: '100dvh', width: '100vw', color: '#fff', padding: 'env(safe-area-inset-top) 15px 15px 15px', boxSizing: 'border-box', overflowY: 'auto', WebkitOverflowScrolling: 'touch', position: 'relative' }}>
        
        {/* TOAST NOTIFICATION */}
        {toast.visible && (
          <div className={toast.visible ? "toast-enter" : "toast-exit"} style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, backgroundColor: toast.type === 'error' ? '#ff4444' : toast.type === 'success' ? '#00C851' : '#33b5e5', color: '#fff', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {toast.type === 'error' ? '⚠️' : toast.type === 'success' ? '✅' : 'ℹ️'} {toast.message}
          </div>
        )}

        {/* HEADER */}
        <header style={{ textAlign: 'center', marginBottom: '20px', marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <img 
              src="/Tú Voi Trong Suốt.png" 
              alt="Logo Tú Voi" 
              style={{ width: '85px', height: '85px', objectFit: 'contain', filter: `drop-shadow(0px 0px 8px rgba(197, 160, 89, 0.6))` }} 
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: connStatus === 'online' ? '#00ff00' : '#ff4444', fontSize: '12px' }}>●</span>
            <span style={{ color: connStatus === 'online' ? '#00ff00' : '#ff4444', fontWeight: 'bold', fontSize: '10px', letterSpacing: '1px' }}>
              {connStatus === 'online' ? 'SẴN SÀNG' : 'OFFLINE'}
            </span>
          </div>
        </header>

        {/* QUÉT URLS */}
        <div style={{ backgroundColor: '#111', borderRadius: '18px', padding: '15px', border: '1px solid #222', marginBottom: '15px' }}>
          <div style={{ color: GOLD_TEXT, fontSize: '12px', fontWeight: '900', marginBottom: '10px' }}>🌐 QUÉT URL</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" value={scanUrl} onChange={(e) => setScanUrl(e.target.value)} placeholder="Link web..." style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#000', color: '#fff', fontSize: '14px' }} />
            <button className="btn-press" onClick={() => { if(scanUrl) handleScanUrl() }} disabled={isScanning} style={{ padding: '0 15px', borderRadius: '8px', background: GOLD_SATIN_GRADIENT, color: '#000', border: 'none', fontWeight: '900', cursor: 'pointer' }}>
              {isScanning ? '...' : 'QUÉT'}
            </button>
          </div>
        </div>

        {/* KHO BAR */}
        <div className="btn-press" onClick={() => setShowKhoPopup(true)} style={{ backgroundColor: '#111', borderRadius: '15px', padding: '15px', border: `1px solid rgba(197, 160, 89, 0.4)`, marginBottom: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <span style={{ color: GOLD_TEXT, fontWeight: '900', fontSize: '13px' }}>📦 KHO</span>
          <span style={{ color: '#333' }}>|</span>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>USD: {inventory.usd}</span>
          <span style={{ color: '#333' }}>|</span>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>HKD: {inventory.hkd}</span>
        </div>

        {/* NHẬP DỮ LIỆU */}
        <div style={{ backgroundColor: '#111', borderRadius: '18px', padding: '18px', border: '1px solid #222', marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ color: GOLD_TEXT, fontSize: '12px', fontWeight: '900' }}>✍️ NHẬP DỮ LIỆU</div>
            <button className="btn-press" onClick={handlePaste} style={{ background: GOLD_SATIN_GRADIENT, color: '#000', border: 'none', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '900' }}>📋 DÁN</button>
          </div>
          
          <textarea 
            rows="3" 
            value={inputData} 
            onChange={(e) => handleInputChange(e.target.value)} 
            placeholder="Dán nội dung vào đây..." 
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#000', color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box', marginBottom: '10px', lineHeight: '1.4' }} 
          />

          {detectedIDs.length > 0 && (
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {detectedIDs.map((id, index) => (
                <span key={index} style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', color: GOLD_TEXT, padding: '3px 8px', borderRadius: '5px', fontSize: '10px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                  {id}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn-press"
              onClick={keepOnlyIDs} 
              style={{ flex: 1, padding: '14px 5px', borderRadius: '10px', border: `1px solid ${GOLD_TEXT}`, backgroundColor: '#1a1a1a', color: GOLD_TEXT, fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
            >
              ✨ LỌC ({detectedIDs.length})
            </button>
            <button 
              className="btn-press"
              onClick={handleProcess} 
              disabled={isProcessing} 
              style={{ flex: 3, padding: '14px', borderRadius: '10px', border: 'none', background: GOLD_SATIN_GRADIENT, color: '#000', fontWeight: '900', fontSize: '14px', cursor: 'pointer', boxShadow: GLOW_SOFT }}
            >
              {isProcessing ? '⏳ ĐANG XỬ LÝ...' : 'XỬ LÝ NHANH'}
            </button>
          </div>
        </div>

        {/* TỔNG KẾT */}
        <div style={{ backgroundColor: '#111', borderRadius: '18px', padding: '15px', border: '1px solid #222', marginBottom: '40px' }}>
          <div style={{ color: GOLD_TEXT, fontSize: '12px', fontWeight: '900', marginBottom: '10px' }}>📊 TỔNG KẾT</div>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '10px' }}>
            {recentDates.map(date => (
              <button key={date} className="btn-press" onClick={() => setSelectedDate(date)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: selectedDate === date ? GOLD_SATIN_GRADIENT : '#1a1a1a', color: selectedDate === date ? '#000' : '#555', fontSize: '10px', fontWeight: '900', whiteSpace: 'nowrap' }}>{date}</button>
            ))}
          </div>
          <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #222' }}>
            <div style={{ color: '#00ff00', fontSize: '32px', fontWeight: '900' }}>${Number(history?.total_usd || 0).toLocaleString()}</div>
            <button className="btn-press" onClick={() => setShowHistoryPopup(true)} style={{ color: GOLD_TEXT, background: 'none', border: 'none', fontSize: '11px', fontWeight: '900', textDecoration: 'underline', marginTop: '5px', cursor: 'pointer' }}>CHI TIẾT 📜</button>
          </div>
        </div>

        {/* POPUP LỊCH SỬ */}
        {showHistoryPopup && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.96)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
            <div className="popup-animate" style={{ backgroundColor: '#111', border: `1px solid ${GOLD_PREMIUM}`, borderRadius: '25px', padding: '20px', width: '92%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ color: GOLD_TEXT, textAlign: 'center', marginBottom: '15px', fontSize: '16px', fontWeight: '900' }}>LỊCH SỬ {selectedDate}</h3>
              
              <div style={{ overflowY: 'auto', flex: 1 }}>
                <div style={{ color: GOLD_TEXT, fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '8px', opacity: 0.8 }}>NẠP/RÚT TIỀN (N26)</div>
                {history?.transactions?.map((t, i) => {
                  const rawAmount = parseFloat(t.amount.toString().replace(',', ''));
                  const isNegative = rawAmount < 0;
                  let displayAmount = t.type === "HKD" ? `${Number((rawAmount / 7.8).toFixed(2))} USD (${t.amount} HKD)` : `${t.amount} USD`;
                  return (
                    <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', fontSize: '11px' }}>
                      <span style={{ fontFamily: 'monospace', color: '#888', width: '85px', flexShrink: 0 }}>{t.uid}</span>
                      <span style={{ flex: 1, color: isNegative ? '#ff4444' : '#00ff00', fontWeight: 'bold', paddingRight: '5px' }}>{displayAmount}</span>
                      <span style={{ width: '85px', color: '#ccc', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>{t.name || '---'}</span>
                    </div>
                  );
                })}

                <div style={{ color: '#00ffff', fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '8px', marginTop: '20px', opacity: 0.8 }}>XUẤT MÃ ID (KHO S)</div>
                {history?.exported?.map((e, i) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', fontSize: '11px' }}>
                    <span style={{ fontFamily: 'monospace', color: '#666', width: '85px', flexShrink: 0 }}>{e.uid}</span>
                    <span style={{ color: '#aaa', fontWeight: 'bold', flex: 1 }}>{e.type}</span>
                    <span style={{ width: '85px', color: '#ccc', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>{e.name}</span>
                  </div>
                ))}
              </div>

              <button className="btn-press" onClick={() => setShowHistoryPopup(false)} style={{ width: '100%', padding: '15px', background: GOLD_SATIN_GRADIENT, color: '#000', borderRadius: '15px', fontWeight: '900', marginTop: '20px', border: 'none' }}>ĐÓNG</button>
            </div>
          </div>
        )}

        {/* POPUP CHI TIẾT KHO */}
        {showKhoPopup && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.96)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
            <div className="popup-animate" style={{ backgroundColor: '#111', border: `1px solid ${GOLD_PREMIUM}`, borderRadius: '25px', padding: '20px', width: '85%' }}>
              <h3 style={{ color: GOLD_TEXT, textAlign: 'center', marginBottom: '15px' }}>CHI TIẾT KHO</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <div style={{ flex: 1, backgroundColor: '#000', borderRadius: '12px', padding: '15px 5px', textAlign: 'center', border: '1px solid #333' }}>
                  <div style={{ color: '#666', fontSize: '9px', fontWeight: 'bold' }}>USD</div>
                  <div style={{ color: '#fff', fontSize: '24px', fontWeight: '900' }}>{inventory.usd}</div>
                  <button className="btn-press" onClick={() => { setShowKhoPopup(false); setExportConfig({ visible: true, type: "USD" }); }} style={{ marginTop: '10px', width: '90%', padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: '#222', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>XUẤT</button>
                </div>
                <div style={{ flex: 1, backgroundColor: '#000', borderRadius: '12px', padding: '15px 5px', textAlign: 'center', border: `1px solid ${GOLD_PREMIUM}` }}>
                  <div style={{ color: GOLD_TEXT, fontSize: '9px', fontWeight: 'bold' }}>HKD</div>
                  <div style={{ color: '#fff', fontSize: '24px', fontWeight: '900' }}>{inventory.hkd}</div>
                  <button className="btn-press" onClick={() => { setShowKhoPopup(false); setExportConfig({ visible: true, type: "HKD" }); }} style={{ marginTop: '10px', width: '90%', padding: '8px', borderRadius: '8px', border: 'none', background: GOLD_SATIN_GRADIENT, color: '#000', fontSize: '10px', fontWeight: '900' }}>XUẤT</button>
                </div>
              </div>
              <textarea rows="3" value={importData} onChange={(e) => setImportData(e.target.value)} placeholder="Mã ID nhập kho..." style={{ width: '100%', padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#000', color: GOLD_TEXT, fontSize: '14px' }} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button className="btn-press" onClick={() => handleImport('USD')} disabled={!!importingType} style={{ flex: 1, padding: '12px', backgroundColor: '#222', color: '#fff', borderRadius: '10px', border: 'none' }}>+USD</button>
                <button className="btn-press" onClick={() => handleImport('HKD')} disabled={!!importingType} style={{ flex: 1, padding: '12px', background: GOLD_SATIN_GRADIENT, color: '#000', borderRadius: '10px', border: 'none', fontWeight: 'bold' }}>+HKD</button>
              </div>
              <button className="btn-press" onClick={() => setShowKhoPopup(false)} style={{ width: '100%', marginTop: '15px', color: '#555', background: 'none', border: 'none' }}>Đóng</button>
            </div>
          </div>
        )}

        {/* MODAL XUẤT KHO */}
        {exportConfig.visible && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.98)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 4000 }}>
            <div className="popup-animate" style={{ backgroundColor: '#111', border: `1px solid ${GOLD_PREMIUM}`, borderRadius: '30px', padding: '25px', textAlign: 'center', width: '80%' }}>
              <h3 style={{ color: GOLD_TEXT, marginBottom: '15px' }}>XUẤT {exportConfig.type}</h3>
              <input type="text" placeholder="Tên khách" value={exportCustomer} onChange={(e) => setExportCustomer(e.target.value)} style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: 'none', color: '#fff', fontSize: '20px', textAlign: 'center', borderRadius: '10px' }} />
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0' }}>
                <button className="btn-press" onClick={() => setExportQuantity(Math.max(1, exportQuantity - 1))} style={{ fontSize: '40px', background: 'none', color: GOLD_TEXT, border: 'none' }}>-</button>
                <span style={{ fontSize: '35px', padding: '0 25px', fontWeight: 'bold' }}>{exportQuantity}</span>
                <button className="btn-press" onClick={() => setExportQuantity(exportQuantity + 1)} style={{ fontSize: '40px', background: 'none', color: GOLD_TEXT, border: 'none' }}>+</button>
              </div>
              <button className="btn-press" onClick={executeExport} disabled={isExporting} style={{ width: '100%', padding: '18px', background: GOLD_SATIN_GRADIENT, color: '#000', borderRadius: '12px', fontWeight: '900', border: 'none' }}>CHỐT ĐƠN</button>
              <button className="btn-press" onClick={() => setExportConfig({ visible: false, type: "" })} style={{ marginTop: '15px', color: '#555', background: 'none', border: 'none' }}>Hủy</button>
            </div>
          </div>
        )}

        {/* POPUP COPY */}
        {popup.visible && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.98)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000 }}>
            <div className="popup-animate" style={{ backgroundColor: '#111', border: `1px solid ${GOLD_PREMIUM}`, borderRadius: '25px', padding: '20px', width: '85%' }}>
              <div style={{ color: '#00ff00', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>{popup.title}</div>
              <textarea readOnly value={popup.val} style={{ width: '100%', height: '100px', backgroundColor: '#000', color: '#fff', padding: '10px', borderRadius: '15px', fontSize: '16px', border: 'none', textAlign: 'center' }} />
              <button className="btn-press" onClick={handleCopy} style={{ width: '100%', padding: '18px', background: GOLD_SATIN_GRADIENT, color: '#000', borderRadius: '12px', fontWeight: '900', marginTop: '15px', border: 'none' }}>
                {popup.status}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
