import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Phone, LogIn, Check, ShieldCheck, X } from 'lucide-react';

export default function LoginModal({ currentUser, onLogin, onClose, canClose }) {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetch('./data/hks_members.json')
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(err => console.error('Failed to load HKS members:', err));
  }, []);

  const filteredMembers = members.filter(m => {
    const q = search.toLowerCase().trim();
    return m.name.toLowerCase().includes(q) || m.mob.includes(q);
  });

  const handleConfirmLogin = (member) => {
    onLogin(member);
    if (onClose) onClose();
  };

  return (
    <div className="modal-overlay" onClick={canClose ? onClose : undefined}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserCheck size={22} />
            </div>
            <div>
              <h3 className="modal-title">ഹരിതകർമസേന ലോഗിൻ</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                കളക്ഷൻ രേഖപ്പെടുത്താൻ നിങ്ങളുടെ പേര് തിരഞ്ഞെടുക്കുക
              </p>
            </div>
          </div>
          {canClose && (
            <button className="btn-close" onClick={onClose}>
              <X size={18} />
            </button>
          )}
        </div>

        {currentUser && (
          <div style={{
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700 }}>നിലവിൽ ലോഗിൻ ചെയ്തത്:</span>
              <div style={{ fontWeight: 800, color: '#14532d', fontSize: '1.05rem' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>📱 {currentUser.mob}</div>
            </div>
            <span className="badge badge-paid">Active</span>
          </div>
        )}

        <div className="search-input-wrapper" style={{ marginBottom: '12px' }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="പേരോ ഫോൺ നമ്പറോ തിരയുക..."
            style={{ padding: '10px 12px 10px 38px', fontSize: '0.92rem' }}
            autoFocus
          />
        </div>

        <div style={{
          maxHeight: '320px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingRight: '4px'
        }}>
          {filteredMembers.map((m) => {
            const isCurrent = currentUser?.mob === m.mob;
            return (
              <div
                key={m.mob}
                onClick={() => handleConfirmLogin(m)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: isCurrent ? '2px solid #15803d' : '1px solid #e2e8f0',
                  background: isCurrent ? '#f0fdf4' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#15803d'}
                onMouseLeave={(e) => {
                  if (!isCurrent) e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                    {m.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={12} /> {m.mob}
                  </div>
                </div>
                <button
                  type="button"
                  style={{
                    background: isCurrent ? '#15803d' : '#f1f5f9',
                    color: isCurrent ? 'white' : '#15803d',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {isCurrent ? <Check size={14} /> : <LogIn size={14} />}
                  {isCurrent ? 'തിരഞ്ഞെടുത്തു' : 'ലോഗിൻ'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
