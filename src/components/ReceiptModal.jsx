import React from 'react';
import { X, Share2, Printer, CheckCircle, IndianRupee } from 'lucide-react';

export default function ReceiptModal({ payment, customer, onClose }) {
  if (!payment || !customer) return null;

  const dateFormatted = new Date(payment.timestamp).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const pendingAmount = payment.pendingAmount || payment.amount || 0;
  const receivedAmount = payment.amount || 0;
  const balanceAmount = payment.balanceAmount !== undefined ? payment.balanceAmount : Math.max(0, pendingAmount - receivedAmount);

  const handleShareWhatsApp = () => {
    const text = `🌿 *ഹരിതകർമസേന - പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത്* 🌿\n` +
      `--------------------------------\n` +
      `*ഡിജിറ്റൽ രസീത് (User Fee Receipt)*\n` +
      `തീയതി: ${dateFormatted}\n` +
      `കസ്റ്റമർ: ${customer.name}\n` +
      `വാർഡ്: ${customer.ward} | ഡോർ നമ്പർ: ${customer.door || '—'}\n` +
      `കസ്റ്റമർ നമ്പർ: ${customer.id}\n` +
      `QR കോഡ്: ${customer.qr || '—'}\n` +
      `ഇനം: ${customer.type === 'House' ? 'വീട്' : 'സ്ഥാപനം'}\n` +
      `--------------------------------\n` +
      `📅 *പെൻഡിംഗ് തുക (ഈ മാസം വരെ):* ₹${pendingAmount}\n` +
      `💵 *ഈ മാസം കിട്ടിയ തുക:* ₹${receivedAmount} (${payment.payMode === 'upi' ? 'UPI' : 'Cash'})\n` +
      (balanceAmount > 0 ? `⚠️ *ബാക്കി പെൻഡിംഗ് തുക:* ₹${balanceAmount}\n` : `✅ *പെൻഡിംഗ് ഇല്ല (പൂർണ്ണം)*\n`) +
      `♻️ ശേഖരണ നില: ${payment.wasteStatus === 'collected' ? 'വേസ്റ്റ് സ്വീകരിച്ചു' : 'ഫീസ് അടച്ചു'}\n` +
      `അംഗം: ${payment.collectorName || 'ഹരിതകർമസേന'}\n` +
      `--------------------------------\n` +
      `മാലിന്യമുക്തം നവകേരളം 🌱`;

    const phoneNum = customer.phone ? customer.phone.replace(/[^0-9]/g, '') : '';
    const url = phoneNum && phoneNum.length === 10
      ? `https://api.whatsapp.com/send?phone=91${phoneNum}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">ഡിജിറ്റൽ രസീത്</h3>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{
          background: '#f8fafc',
          border: '2px dashed #cbd5e1',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '1.4rem' }}>🌱</div>
          <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#15803d', margin: '4px 0' }}>
            ഹരിതകർമസേന - പുതുപ്പാടി GP
          </h4>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '12px' }}>
            അജൈവ മാലിന്യ ശേഖരണ യൂസർ ഫീ രസീത്
          </p>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            marginBottom: '14px',
            textAlign: 'left',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>കസ്റ്റമർ:</span>
              <strong style={{ color: '#0f172a' }}>{customer.name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>വാർഡ് & ഡോർ No:</span>
              <strong>വാർഡ് {customer.ward} | No. {customer.door || '—'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>QR കോഡ്:</span>
              <strong style={{ fontFamily: 'monospace', color: '#0284c7' }}>{customer.qr}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>തീയതി & സമയം:</span>
              <span>{dateFormatted}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>പെൻഡിംഗ് തുക (ഈ മാസം വരെ):</span>
              <span style={{ fontWeight: 700 }}>₹{pendingAmount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>പേയ്മെന്റ് രീതി:</span>
              <span>{payment.payMode === 'upi' ? 'Online / UPI' : 'Cash'}</span>
            </div>
            {balanceAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b45309', fontWeight: 700 }}>
                <span>ബാക്കി പെൻഡിംഗ് തുക:</span>
                <span>₹{balanceAmount}</span>
              </div>
            )}
          </div>

          <div style={{
            background: '#dcfce7',
            padding: '12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700 }}>ഈ മാസം കിട്ടിയ തുക</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#14532d' }}>
                ₹{receivedAmount}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#15803d', fontWeight: 700, fontSize: '0.85rem' }}>
              <CheckCircle size={18} /> ലഭിച്ചു
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-whatsapp" onClick={handleShareWhatsApp}>
            <Share2 size={18} /> വാട്സാപ്പിൽ അയക്കുക
          </button>
          <button
            className="btn-action-icon"
            style={{ width: '48px', height: '48px' }}
            title="പ്രിന്റ് ചെയ്യുക"
            onClick={handlePrint}
          >
            <Printer size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
