import React, { useState, useMemo } from 'react';
import { 
  Users, 
  IndianRupee, 
  Building2, 
  Home, 
  Store, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Share2, 
  Phone, 
  ChevronRight, 
  ChevronDown,
  TrendingUp,
  Award,
  Filter
} from 'lucide-react';

export default function Dashboard({ payments, hksMembers }) {
  const todayStr = new Date().toLocaleDateString('en-GB');
  const [selectedDateFilter, setSelectedDateFilter] = useState('today'); // 'today' | 'all' | 'custom'
  const [customDate, setCustomDate] = useState(todayStr);
  const [expandedMember, setExpandedMember] = useState(null);
  const [searchMember, setSearchMember] = useState('');

  // Filter payments by date
  const filteredPayments = useMemo(() => {
    if (selectedDateFilter === 'today') {
      return payments.filter(p => p.dateString === todayStr);
    } else if (selectedDateFilter === 'all') {
      return payments;
    } else {
      return payments.filter(p => p.dateString === customDate);
    }
  }, [payments, selectedDateFilter, customDate, todayStr]);

  // Overall Statistics
  const totalAmount = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [filteredPayments]);

  const paidList = useMemo(() => {
    return filteredPayments.filter(p => p.status === 'PAID' || p.amount > 0);
  }, [filteredPayments]);

  const unpaidList = useMemo(() => {
    return filteredPayments.filter(p => p.status === 'UNPAID' || p.amount === 0);
  }, [filteredPayments]);

  const houseTotal = useMemo(() => {
    return paidList.filter(p => p.customerType?.toLowerCase() === 'house').reduce((sum, p) => sum + p.amount, 0);
  }, [paidList]);

  const shopTotal = useMemo(() => {
    return paidList.filter(p => p.customerType?.toLowerCase() !== 'house').reduce((sum, p) => sum + p.amount, 0);
  }, [paidList]);

  // Group by Collector
  const collectorStats = useMemo(() => {
    const statsMap = {};

    filteredPayments.forEach(p => {
      const collectorName = p.collectorName || 'അംഗം';
      const collectorMob = p.collectorMob || '';
      const key = `${collectorName}_${collectorMob}`;

      if (!statsMap[key]) {
        statsMap[key] = {
          name: collectorName,
          mob: collectorMob,
          totalAmount: 0,
          paidCount: 0,
          unpaidCount: 0,
          houseCount: 0,
          shopCount: 0,
          cashAmount: 0,
          upiAmount: 0,
          entries: []
        };
      }

      statsMap[key].entries.push(p);

      if (p.status === 'PAID' || p.amount > 0) {
        statsMap[key].totalAmount += (p.amount || 0);
        statsMap[key].paidCount += 1;
        if (p.customerType?.toLowerCase() === 'house') {
          statsMap[key].houseCount += 1;
        } else {
          statsMap[key].shopCount += 1;
        }

        if (p.payMode === 'upi') {
          statsMap[key].upiAmount += p.amount;
        } else {
          statsMap[key].cashAmount += p.amount;
        }
      } else {
        statsMap[key].unpaidCount += 1;
      }
    });

    return Object.values(statsMap).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredPayments]);

  // Filter collectors by search
  const visibleCollectors = useMemo(() => {
    if (!searchMember.trim()) return collectorStats;
    const q = searchMember.toLowerCase().trim();
    return collectorStats.filter(c => c.name.toLowerCase().includes(q) || c.mob.includes(q));
  }, [collectorStats, searchMember]);

  // Generate individual WhatsApp report for a member
  const handleShareMemberReport = (c) => {
    const dateText = selectedDateFilter === 'today' ? `തീയതി: ${todayStr}` : 'ആകെ കളക്ഷൻ';
    const text = `🌿 *ഹരിതകർമസേന - പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത്* 🌿\n` +
      `👤 *അംഗത്തിന്റെ കളക്ഷൻ റിപ്പോർട്ട്*\n` +
      `--------------------------------\n` +
      `അംഗം: *${c.name}* (${c.mob})\n` +
      `${dateText}\n\n` +
      `💰 *ആകെ പിരിഞ്ഞ തുക: ₹${c.totalAmount}*\n` +
      `🏠 വീടുകൾ: ${c.houseCount} എണ്ണം\n` +
      `🏢 കടകൾ/സ്ഥാപനങ്ങൾ: ${c.shopCount} എണ്ണം\n` +
      `✅ ആകെ പണം നൽകിയവർ: ${c.paidCount} പേർ\n` +
      (c.unpaidCount > 0 ? `🔴 പണം ലഭിക്കാത്തവർ: ${c.unpaidCount} പേർ\n` : '') +
      `💵 ക്യാഷ്: ₹${c.cashAmount} | 📱 UPI: ₹${c.upiAmount}\n` +
      `--------------------------------\n` +
      `ഹരിതകർമസേന പുതുപ്പാടി 🌱`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Date Filter Bar */}
      <div style={{
        background: '#ffffff',
        padding: '12px 16px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
          <TrendingUp size={20} color="#15803d" />
          <span>കളക്ഷൻ ഡാഷ്‌ബോർഡ്</span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className={`amount-btn ${selectedDateFilter === 'today' ? 'active' : ''}`}
            style={{ padding: '6px 12px', fontSize: '0.82rem', borderRadius: '20px' }}
            onClick={() => setSelectedDateFilter('today')}
          >
            ഇന്ന് ({todayStr})
          </button>
          <button
            type="button"
            className={`amount-btn ${selectedDateFilter === 'all' ? 'active' : ''}`}
            style={{ padding: '6px 12px', fontSize: '0.82rem', borderRadius: '20px' }}
            onClick={() => setSelectedDateFilter('all')}
          >
            ആകെ കളക്ഷൻ (All)
          </button>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {/* Total Amount Card */}
        <div style={{
          background: 'linear-gradient(135deg, #14532d 0%, #15803d 100%)',
          color: 'white',
          padding: '16px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)'
        }}>
          <span style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 600 }}>ആകെ ലഭിച്ച തുക</span>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, margin: '4px 0' }}>
            ₹{totalAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>
            {paidList.length} കസ്റ്റമർമാരിൽ നിന്ന്
          </div>
        </div>

        {/* Active Members Card */}
        <div style={{
          background: '#ffffff',
          padding: '16px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>ഫീൽഡിലുള്ള അംഗങ്ങൾ</span>
            <Users size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            {collectorStats.length} <small style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>പേർ</small>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>
            ഇന്ന് എൻട്രി ചെയ്തവർ
          </div>
        </div>

        {/* Houses vs Shops Card */}
        <div style={{
          background: '#ffffff',
          padding: '16px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>വീടുകൾ vs കടകൾ</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.9rem' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#15803d' }}>₹{houseTotal.toLocaleString()}</div>
              <small style={{ fontSize: '0.72rem', color: '#64748b' }}>🏠 വീടുകൾ ({paidList.filter(p => p.customerType?.toLowerCase() === 'house').length})</small>
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#b45309' }}>₹{shopTotal.toLocaleString()}</div>
              <small style={{ fontSize: '0.72rem', color: '#64748b' }}>🏢 കടകൾ ({paidList.filter(p => p.customerType?.toLowerCase() !== 'house').length})</small>
            </div>
          </div>
        </div>

        {/* Unpaid Count Card */}
        <div style={{
          background: '#ffffff',
          padding: '16px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>പണം തരാത്തവർ</span>
            <XCircle size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#dc2626', margin: '4px 0' }}>
            {unpaidList.length} <small style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>വീടുകൾ</small>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>
            പൂട്ടിയിട്ടത് / ആളില്ലാത്തത്
          </div>
        </div>
      </div>

      {/* Member-wise Collection List */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '18px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              👥 ഓരോരുത്തർക്കും കിട്ടിയ തുക (Member-wise Collection)
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              ഹരിതകർമസേനാംഗങ്ങളുടെ കളക്ഷൻ നില
            </p>
          </div>
          <input
            type="text"
            className="form-input"
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
            placeholder="അംഗത്തിന്റെ പേര് തിരയുക..."
            style={{ width: '220px', padding: '8px 12px', fontSize: '0.85rem' }}
          />
        </div>

        {visibleCollectors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
            ഈ തീയതിയിൽ ആരും കളക്ഷൻ എൻട്രി രേഖപ്പെടുത്തിയിട്ടില്ല.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {visibleCollectors.map((c, index) => {
              const isExpanded = expandedMember === `${c.name}_${c.mob}`;
              return (
                <div
                  key={`${c.name}_${c.mob}`}
                  style={{
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '14px',
                    background: index === 0 ? '#f0fdf4' : '#ffffff',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div
                    onClick={() => setExpandedMember(isExpanded ? null : `${c.name}_${c.mob}`)}
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: index === 0 ? '#15803d' : '#e2e8f0',
                        color: index === 0 ? 'white' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem'
                      }}>
                        {index === 0 ? <Award size={18} /> : index + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                          {c.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} color="#15803d" /> {c.mob || 'ഫോൺ ലഭ്യമല്ല'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>
                          ₹{c.totalAmount.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {c.paidCount} പേർ • {c.houseCount} വീട്, {c.shopCount} കട
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareMemberReport(c);
                        }}
                        style={{
                          background: '#25d366',
                          color: 'white',
                          border: 'none',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.78rem',
                          fontWeight: 700
                        }}
                        title="ഈ അംഗത്തിന്റെ റിപ്പോർട്ട് വാട്സാപ്പിൽ അയക്കുക"
                      >
                        <Share2 size={13} /> റിപ്പോർട്ട്
                      </button>

                      {isExpanded ? <ChevronDown size={18} color="#94a3b8" /> : <ChevronRight size={18} color="#94a3b8" />}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div style={{
                      borderTop: '1px solid #e2e8f0',
                      padding: '14px 16px',
                      background: '#f8fafc',
                      fontSize: '0.85rem'
                    }}>
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <div>💵 ക്യാഷ്: <strong>₹{c.cashAmount}</strong></div>
                        <div>📱 GPay/UPI: <strong>₹{c.upiAmount}</strong></div>
                        {c.unpaidCount > 0 && (
                          <div style={{ color: '#dc2626' }}>🔴 പണം നൽകാത്തവർ: <strong>{c.unpaidCount} പേർ</strong></div>
                        )}
                      </div>

                      <div style={{ fontWeight: 700, color: '#475569', marginBottom: '8px', fontSize: '0.8rem' }}>
                        രേഖപ്പെടുത്തിയ കസ്റ്റമർമാർ ({c.entries.length} പേർ):
                      </div>

                      <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {c.entries.map((entry, i) => (
                          <div
                            key={i}
                            style={{
                              background: 'white',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.82rem'
                            }}
                          >
                            <div>
                              <strong>{entry.customerName}</strong> (വാർഡ് {entry.ward} - No. {entry.door || '—'})
                              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                {entry.status === 'PAID' ? `♻️ ${entry.wasteStatus === 'collected' ? 'വേസ്റ്റ് നൽകി' : 'ഫീസ് മാത്രം'}` : `🔴 ${entry.unpaidReason || 'തന്നില്ല'}`}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <strong style={{ color: entry.amount > 0 ? '#15803d' : '#dc2626' }}>
                                {entry.amount > 0 ? `₹${entry.amount}` : 'തന്നില്ല'}
                              </strong>
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{entry.payMode}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
