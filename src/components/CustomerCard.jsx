import React from 'react';
import { Home, Store, Phone, CheckCircle, IndianRupee, MapPin, ReceiptText, XCircle, Trash2, Edit3, AlertCircle } from 'lucide-react';

export default function CustomerCard({ customer, onCollect, onDelete, todayPayment, onShowReceipt }) {
  const isHouse = customer.type?.toLowerCase() === 'house';
  const defaultRate = isHouse ? 50 : 100;
  
  const isPaid = todayPayment && (todayPayment.status === 'PAID' || todayPayment.amount > 0);
  const isUnpaid = todayPayment && (todayPayment.status === 'UNPAID' || todayPayment.amount === 0);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`'${customer.name}' എന്ന കസ്റ്റമറുടെ ഇന്നത്തെ എൻട്രി ഒഴിവാക്കണോ?`)) {
      onDelete(customer.id);
    }
  };

  return (
    <div className={`customer-card ${isPaid ? 'paid-today' : isUnpaid ? 'unpaid-today' : ''}`}
         style={{
           borderLeft: isPaid ? '5px solid #10b981' : isUnpaid ? '5px solid #ef4444' : undefined,
           background: isUnpaid ? 'linear-gradient(to right, #fef2f2, #ffffff)' : undefined
         }}>
      <div className="card-top">
        <div>
          <h3 className="customer-name">{customer.name || 'പേര് ലഭ്യമല്ല'}</h3>
          <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
            {customer.building ? customer.building : ''}
          </div>
        </div>
        <div className="badges-group">
          <span className="badge badge-ward">വാർഡ് {customer.ward}</span>
          <span className={`badge ${isHouse ? 'badge-house' : 'badge-shop'}`}>
            {isHouse ? '🏠 വീട് (₹50)' : `🏢 ${customer.type || 'സ്ഥാപനം'} (₹100)`}
          </span>
          {isPaid && (
            <span className="badge badge-paid">
              <CheckCircle size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '2px' }} />
              കിട്ടിയത്: ₹{todayPayment.amount}
            </span>
          )}
          {isPaid && todayPayment.balanceAmount > 0 && (
            <span className="badge" style={{ background: '#fef3c7', color: '#b45309' }}>
              ബാക്കി: ₹{todayPayment.balanceAmount}
            </span>
          )}
          {isUnpaid && (
            <span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>
              <XCircle size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '2px' }} />
              {todayPayment.unpaidReason || 'പണം തന്നില്ല'}
            </span>
          )}
        </div>
      </div>

      <div className="customer-meta-grid">
        <div className="meta-item">
          <span className="meta-label">ഡോർ നമ്പർ (Door No)</span>
          <span className="meta-value">{customer.door || '—'}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">കസ്റ്റമർ നമ്പർ</span>
          <span className="meta-value" style={{ fontFamily: 'monospace' }}>{customer.id}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">QR കോഡ്</span>
          <span className="meta-value" style={{ color: '#0369a1', fontFamily: 'monospace' }}>
            {customer.qr || 'ലഭ്യമല്ല'}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">മൊബൈൽ നമ്പർ</span>
          <span className="meta-value">
            {customer.phone ? (
              <a 
                href={`tel:${customer.phone.replace(/[^0-9]/g, '')}`} 
                style={{ color: '#15803d', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <Phone size={13} /> {customer.phone}
              </a>
            ) : '—'}
          </span>
        </div>
      </div>

      {customer.address && (
        <div className="address-box">
          <MapPin size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '3px', color: '#94a3b8' }} />
          {customer.address}
        </div>
      )}

      {todayPayment && (
        <div style={{
          fontSize: '0.78rem',
          color: '#64748b',
          marginBottom: '10px',
          background: '#ffffff',
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>രേഖപ്പെടുത്തിയത്: <strong>{todayPayment.collectorName}</strong></span>
          <span>{todayPayment.payMode === 'upi' ? '📱 UPI' : todayPayment.payMode === 'cash' ? '💵 Cash' : ''}</span>
        </div>
      )}

      <div className="card-actions">
        {todayPayment ? (
          <>
            {isPaid && (
              <button 
                className="btn-collect paid"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                onClick={() => onShowReceipt(todayPayment, customer)}
              >
                <ReceiptText size={16} /> രസീത്
              </button>
            )}
            <button 
              className="btn-collect"
              style={{
                background: '#0284c7',
                padding: '8px 12px',
                fontSize: '0.85rem'
              }}
              onClick={() => onCollect(customer)}
            >
              <Edit3 size={15} /> തിരുത്തുക (Edit)
            </button>
            <button 
              className="btn-action-icon"
              style={{ color: '#ef4444', borderColor: '#fca5a5' }}
              title="എൻട്രി ഡിലീറ്റ് ചെയ്യുക"
              onClick={handleDelete}
            >
              <Trash2 size={16} />
            </button>
          </>
        ) : (
          <button 
            className="btn-collect"
            onClick={() => onCollect(customer)}
          >
            <IndianRupee size={18} />
            സ്റ്റാറ്റസ് രേഖപ്പെടുത്തുക (₹{defaultRate})
          </button>
        )}
      </div>
    </div>
  );
}
