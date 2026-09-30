import React, { useState } from 'react';
import { X, Share2, Copy, Check } from 'lucide-react';

export default function WhatsAppReportModal({ payments, onClose, selectedWard }) {
  const [copied, setCopied] = useState(false);
  const [reportWard, setReportWard] = useState(selectedWard || 'all');
  const [presidentPhone, setPresidentPhone] = useState(localStorage.getItem('hks_pres_phone') || '');

  const todayStr = new Date().toLocaleDateString('en-GB');

  // Filter payments for today and selected ward
  const filteredPayments = payments.filter(p => {
    const matchDate = p.dateString === todayStr;
    const matchWard = reportWard === 'all' || String(p.ward) === String(reportWard);
    return matchDate && matchWard;
  });

  const totalAmount = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const housePayments = filteredPayments.filter(p => p.customerType?.toLowerCase() === 'house');
  const shopPayments = filteredPayments.filter(p => p.customerType?.toLowerCase() !== 'house');
  
  const houseTotal = housePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const shopTotal = shopPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const cashTotal = filteredPayments.filter(p => p.payMode === 'cash').reduce((sum, p) => sum + p.amount, 0);
  const upiTotal = filteredPayments.filter(p => p.payMode === 'upi').reduce((sum, p) => sum + p.amount, 0);

  const wasteGivenCount = filteredPayments.filter(p => p.wasteStatus === 'collected').length;
  const wasteNotGivenCount = filteredPayments.filter(p => p.wasteStatus === 'not_given').length;

  const wardTitle = reportWard === 'all' ? 'എല്ലാ വാർഡുകളും' : `വാർഡ് ${reportWard}`;

  const message = `🌿 *ഹരിതകർമസേന - പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത്* 🌿\n` +
    `📊 *ദൈനംദിന കളക്ഷൻ റിപ്പോർട്ട്*\n` +
    `--------------------------------\n` +
    `📅 തീയതി: ${todayStr}\n` +
    `📍 വാർഡ്: *${wardTitle}*\n\n` +
    `💰 *ആകെ ലഭിച്ച തുക: ₹${totalAmount}*\n` +
    `🏠 വീടുകൾ (${housePayments.length} എണ്ണം): ₹${houseTotal}\n` +
    `🏢 സ്ഥാപനങ്ങൾ (${shopPayments.length} എണ്ണം): ₹${shopTotal}\n\n` +
    `📌 *ശേഖരണ നില:*\n` +
    `♻️ വേസ്റ്റ് നൽകിയവർ: ${wasteGivenCount}\n` +
    `🚫 വേസ്റ്റ് നൽകാത്തവർ (ഫീസ് മാത്രം): ${wasteNotGivenCount}\n\n` +
    `💳 *പേയ്‌മെന്റ് രീതി:*\n` +
    `💵 ക്യാഷ്: ₹${cashTotal}\n` +
    `📱 UPI / GPay: ₹${upiTotal}\n` +
    `--------------------------------\n` +
    `ഹരിതകർമസേന പുതുപ്പാടി`;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    if (presidentPhone) {
      localStorage.setItem('hks_pres_phone', presidentPhone);
    }
    const cleanPhone = presidentPhone.replace(/[^0-9]/g, '');
    const url = cleanPhone.length === 10
      ? `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">വാട്സാപ്പ് ഡെയ്‌ലി റിപ്പോർട്ട്</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>പ്രസിഡന്റിന് / വാർഡ് മെമ്പർക്ക് അയക്കാം</p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">വാർഡ് തിരഞ്ഞെടുക്കുക</label>
          <select 
            className="filter-select" 
            value={reportWard} 
            onChange={(e) => setReportWard(e.target.value)}
          >
            <option value="all">എല്ലാ വാർഡുകളും (All Wards)</option>
            {Array.from({ length: 21 }, (_, i) => (
              <option key={i + 1} value={i + 1}>വാർഡ് {i + 1}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">പ്രസിഡന്റിന്റെ / മെമ്പറുടെ ഫോൺ നമ്പർ (ഓപ്ഷണൽ)</label>
          <input
            type="tel"
            className="form-input"
            value={presidentPhone}
            onChange={(e) => setPresidentPhone(e.target.value)}
            placeholder="10 അക്ക മൊബൈൽ നമ്പർ"
          />
        </div>

        <div className="whatsapp-box">
          {message}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            type="button" 
            className="btn-header" 
            style={{ flex: 1, background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '12px', justifyContent: 'center' }}
            onClick={handleCopy}
          >
            {copied ? <Check size={18} color="#15803d" /> : <Copy size={18} />}
            {copied ? 'കോപ്പി ചെയ്തു!' : 'കോപ്പി ചെയ്യുക'}
          </button>
          <button 
            type="button" 
            className="btn-whatsapp" 
            style={{ flex: 2 }}
            onClick={handleShare}
          >
            <Share2 size={18} /> വാട്സാപ്പിൽ അയക്കുക
          </button>
        </div>
      </div>
    </div>
  );
}
