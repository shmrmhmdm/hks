import React, { useState } from 'react';
import { X, Check, Trash2, IndianRupee, Ban, UserCheck, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CollectionModal({ customer, existingPayment, currentUser, onClose, onSave, onDelete }) {
  const isHouse = customer.type?.toLowerCase() === 'house';
  const monthlyRate = isHouse ? 50 : 100;
  
  // Status: 'PAID' or 'UNPAID'
  const [status, setStatus] = useState(existingPayment ? (existingPayment.status || (existingPayment.amount > 0 ? 'PAID' : 'UNPAID')) : 'PAID');
  
  // 1. പെൻഡിംഗ് തുക ഈ മാസം വരെ
  const [pendingAmount, setPendingAmount] = useState(
    existingPayment?.pendingAmount !== undefined 
      ? existingPayment.pendingAmount 
      : (existingPayment?.amount || monthlyRate)
  );

  // 2. ഈ മാസം കിട്ടിയ തുക
  const [amount, setAmount] = useState(
    existingPayment ? existingPayment.amount : monthlyRate
  );

  const [wasteStatus, setWasteStatus] = useState(existingPayment?.wasteStatus || 'collected'); // collected | not_given
  const [payMode, setPayMode] = useState(existingPayment?.payMode || 'cash'); // cash | upi
  const [unpaidReason, setUnpaidReason] = useState(existingPayment?.unpaidReason || 'വീട് പൂട്ടിയിരിക്കുന്നു');
  const [remarks, setRemarks] = useState(existingPayment?.remarks || '');

  // Calculate balance
  const balancePending = Math.max(0, (Number(pendingAmount) || 0) - (status === 'PAID' ? (Number(amount) || 0) : 0));

  const handleSave = (e) => {
    e.preventDefault();

    const finalReceivedAmount = status === 'PAID' ? Number(amount) : 0;
    const finalPendingAmount = Number(pendingAmount) || 0;

    if (status === 'PAID' && finalReceivedAmount <= 0) {
      alert('ഈ മാസം കിട്ടിയ തുക നൽകുക');
      return;
    }

    if (status === 'PAID') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }

    onSave({
      customerId: customer.id,
      customerName: customer.name,
      ward: customer.ward,
      customerType: customer.type,
      door: customer.door,
      building: customer.building,
      qr: customer.qr,
      phone: customer.phone,
      status: status,
      pendingAmount: finalPendingAmount,
      amount: finalReceivedAmount,
      balanceAmount: balancePending,
      wasteStatus: status === 'PAID' ? wasteStatus : 'none',
      payMode: status === 'PAID' ? payMode : 'none',
      unpaidReason: status === 'UNPAID' ? unpaidReason : '',
      collectorName: currentUser?.name || 'അംഗം',
      collectorMob: currentUser?.mob || '',
      remarks: status === 'UNPAID' ? `${unpaidReason} ${remarks ? '(' + remarks + ')' : ''}` : remarks,
      timestamp: existingPayment ? existingPayment.timestamp : new Date().toISOString(),
      dateString: new Date().toLocaleDateString('en-GB')
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">കളക്ഷൻ വിവരങ്ങൾ രേഖപ്പെടുത്തുക</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {customer.name} (വാർഡ് {customer.ward})
            </p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {currentUser && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#334155',
            marginBottom: '14px'
          }}>
            <UserCheck size={16} color="#15803d" />
            <span>രേഖപ്പെടുത്തുന്ന അംഗം: <strong>{currentUser.name}</strong> ({currentUser.mob})</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* Main Status Toggle: Paid vs Unpaid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <button
              type="button"
              className={`amount-btn ${status === 'PAID' ? 'active' : ''}`}
              style={{
                borderColor: status === 'PAID' ? '#15803d' : '#e2e8f0',
                background: status === 'PAID' ? '#dcfce7' : '#ffffff',
                color: status === 'PAID' ? '#14532d' : '#475569'
              }}
              onClick={() => {
                setStatus('PAID');
                if (amount === 0) setAmount(pendingAmount || monthlyRate);
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🟢</span>
              പൈസ തന്നു (Paid)
              <small>ഫീസ് ലഭിച്ചു</small>
            </button>

            <button
              type="button"
              className={`amount-btn ${status === 'UNPAID' ? 'active' : ''}`}
              style={{
                borderColor: status === 'UNPAID' ? '#ef4444' : '#e2e8f0',
                background: status === 'UNPAID' ? '#fee2e2' : '#ffffff',
                color: status === 'UNPAID' ? '#991b1b' : '#475569'
              }}
              onClick={() => {
                setStatus('UNPAID');
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🔴</span>
              പൈസ തന്നില്ല (Unpaid)
              <small>പൂട്ടിയിട്ടു / ആളില്ല / വിസമ്മതിച്ചു</small>
            </button>
          </div>

          {/* 1. പെൻഡിംഗ് തുക ഈ മാസം വരെ */}
          <div className="form-group" style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 800, color: '#334155' }}>📅 പെൻഡിംഗ് തുക ഈ മാസം വരെ:</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({isHouse ? 'പ്രതിമാസം ₹50' : 'പ്രതിമാസം ₹100'})</span>
            </label>
            <input
              type="number"
              className="form-input"
              value={pendingAmount}
              onChange={(e) => setPendingAmount(Number(e.target.value))}
              placeholder="പെൻഡിംഗ് തുക (₹)"
              style={{ fontSize: '1.05rem', fontWeight: 700, padding: '12px' }}
            />
          </div>

          {status === 'PAID' ? (
            <>
              {/* 2. ഈ മാസം കിട്ടിയ തുക */}
              <div className="form-group" style={{ background: '#f0fdf4', padding: '14px', borderRadius: '12px', border: '1.5px solid #86efac', marginBottom: '14px' }}>
                <label className="form-label" style={{ color: '#15803d', fontWeight: 800, marginBottom: '8px' }}>
                  💵 ഈ മാസം കിട്ടിയ തുക:
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="ലഭിച്ച തുക നൽകുക (₹)"
                  style={{ borderColor: '#22c55e', fontWeight: 800, fontSize: '1.15rem', color: '#15803d', padding: '12px' }}
                  autoFocus
                />

                {/* Balance indicator */}
                {balancePending > 0 && (
                  <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#b45309', background: '#fef3c7', padding: '8px 12px', borderRadius: '8px', fontWeight: 700 }}>
                    ⚠️ ബാക്കി പെൻഡിംഗ് തുക: ₹{balancePending} (അടുത്ത തവണ നൽകണം)
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">വേസ്റ്റ് ശേഖരണ നില</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    className={`amount-btn ${wasteStatus === 'collected' ? 'active' : ''}`}
                    style={{ padding: '12px', fontSize: '0.9rem' }}
                    onClick={() => setWasteStatus('collected')}
                  >
                    ♻️ വേസ്റ്റ് നൽകി
                  </button>
                  <button
                    type="button"
                    className={`amount-btn ${wasteStatus === 'not_given' ? 'active' : ''}`}
                    style={{ padding: '12px', fontSize: '0.9rem' }}
                    onClick={() => setWasteStatus('not_given')}
                  >
                    🚫 വേസ്റ്റ് നൽകിയില്ല
                    <small>(ഫീസ് നൽകി)</small>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">പേയ്മെന്റ് രീതി</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    className={`amount-btn ${payMode === 'cash' ? 'active' : ''}`}
                    style={{ padding: '12px', fontSize: '0.9rem' }}
                    onClick={() => setPayMode('cash')}
                  >
                    💵 ക്യാഷ് (Cash)
                  </button>
                  <button
                    type="button"
                    className={`amount-btn ${payMode === 'upi' ? 'active' : ''}`}
                    style={{ padding: '12px', fontSize: '0.9rem' }}
                    onClick={() => setPayMode('upi')}
                  >
                    📱 GPay / UPI
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="form-group">
              <label className="form-label">പണം ലഭിക്കാതിരിക്കാനുള്ള കാരണം (Reason)</label>
              <select
                className="filter-select"
                value={unpaidReason}
                onChange={(e) => setUnpaidReason(e.target.value)}
                style={{ padding: '12px', fontSize: '0.92rem', marginBottom: '8px' }}
              >
                <option value="വീട് പൂട്ടിയിരിക്കുന്നു">🔒 വീട് / സ്ഥാപനം പൂട്ടിയിരിക്കുന്നു (Door Locked)</option>
                <option value="ആളില്ല / പിന്നീട് വരാൻ പറഞ്ഞു">👤 ആളില്ല / പിന്നീട് വരാൻ പറഞ്ഞു (Not Available)</option>
                <option value="പണം നൽകാൻ വിസമ്മതിച്ചു">❌ പണം നൽകാൻ വിസമ്മതിച്ചു (Refused to Pay)</option>
                <option value="അടുത്ത തവണ ഒന്നിച്ചു നൽകാമെന്ന് പറഞ്ഞു">💸 അടുത്ത തവണ ഒന്നിച്ചു നൽകാമെന്ന് പറഞ്ഞു</option>
                <option value="താമസക്കാരില്ല / ഒഴിഞ്ഞുകിടക്കുന്നു">🏚️ ഒഴിഞ്ഞുകിടക്കുന്നു (Vacant)</option>
                <option value="മറ്റുള്ളവ">✍️ മറ്റുള്ളവ (Remarks എഴുതുക)</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">കൂടുതൽ കുറിപ്പുകൾ / Remarks (Optional)</label>
            <input
              type="text"
              className="form-input"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="മറ്റ് വിവരങ്ങൾ ഉണ്ടെങ്കിൽ ഇവിടെ എഴുതാം"
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            {existingPayment && (
              <button
                type="button"
                className="btn-action-icon"
                style={{ width: '48px', height: '48px', color: '#ef4444', borderColor: '#fecaca' }}
                title="ഈ എൻട്രി ഒഴിവാക്കുക"
                onClick={() => {
                  if (confirm('ഈ എൻട്രി ഒഴിവാക്കണോ?')) {
                    onDelete(customer.id);
                  }
                }}
              >
                <Trash2 size={20} />
              </button>
            )}
            <button
              type="submit"
              className="btn-collect"
              style={{
                padding: '14px',
                fontSize: '1rem',
                background: status === 'PAID' ? '#15803d' : '#dc2626'
              }}
            >
              <Check size={20} />
              {status === 'PAID' ? `₹${amount} ലഭിച്ചു എന്ന് സേവ് ചെയ്യുക` : 'പണം തന്നില്ല എന്ന് സേവ് ചെയ്യുക'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
