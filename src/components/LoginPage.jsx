import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Phone, LogIn, Check, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LoginPage({ onLogin, totalCustomers }) {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('./data/hks_members.json')
      .then(res => res.json())
      .then(data => {
        setMembers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load HKS members:', err);
        setLoading(false);
      });
  }, []);

  const filteredMembers = members.filter(m => {
    const q = search.toLowerCase().trim();
    return m.name.toLowerCase().includes(q) || m.mob.includes(q);
  });

  const handleSelectMember = (member) => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
    onLogin(member);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #14532d 0%, #166534 220px, #f8fafc 220px, #f8fafc 100%)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Top Banner */}
      <div style={{
        maxWidth: '520px',
        width: '100%',
        color: 'white',
        textAlign: 'center',
        padding: '24px 10px 20px 10px'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(8px)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          margin: '0 auto 12px auto',
          border: '1.5px solid rgba(255, 255, 255, 0.3)'
        }}>
          🌱
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          ഹരിതമിത്രം
        </h1>
        <p style={{ fontSize: '0.92rem', opacity: 0.95, fontWeight: 500 }}>
          പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത് • ഹരിതകർമസേന
        </p>
      </div>

      {/* Main Login Card */}
      <div style={{
        maxWidth: '520px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        padding: '22px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#dcfce7',
            color: '#15803d',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 800,
            marginBottom: '8px'
          }}>
            <UserCheck size={14} /> HKS LOGIN
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            അംഗം ലോഗിൻ ചെയ്യുക
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '2px' }}>
            കളക്ഷൻ രേഖപ്പെടുത്തുന്നതിന് താഴെ നിന്നും നിങ്ങളുടെ പേര് തിരഞ്ഞെടുക്കുക
          </p>
        </div>

        {/* Search member */}
        <div className="search-input-wrapper" style={{ marginBottom: '16px' }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="നിങ്ങളുടെ പേരോ ഫോൺ നമ്പറോ തിരയുക..."
            style={{ padding: '12px 14px 12px 42px', fontSize: '0.95rem' }}
            autoFocus
          />
        </div>

        <div style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '10px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>ഹരിതകർമസേനാംഗങ്ങൾ ({filteredMembers.length})</span>
          <span>ടാപ്പ് ചെയ്ത് ലോഗിൻ ചെയ്യാം</span>
        </div>

        {/* Members List */}
        <div style={{
          maxHeight: '380px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingRight: '4px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              അംഗങ്ങളുടെ പട്ടിക ലോഡ് ചെയ്യുന്നു...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              '{search}' എന്ന പേരിൽ അംഗങ്ങളെ കണ്ടെത്തിയില്ല.
            </div>
          ) : (
            filteredMembers.map((m) => (
              <div
                key={m.mob}
                onClick={() => handleSelectMember(m)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  background: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#15803d';
                  e.currentTarget.style.background = '#f0fdf4';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                    {m.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Phone size={12} color="#15803d" /> {m.mob}
                  </div>
                </div>
                <button
                  type="button"
                  style={{
                    background: '#15803d',
                    color: 'white',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(21, 128, 61, 0.2)'
                  }}
                >
                  <LogIn size={14} /> ലോഗിൻ
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ color: '#94a3b8', fontSize: '0.78rem', textAlign: 'center' }}>
        പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത് ഹരിതകർമസേന കളക്ഷൻ പോർട്ടൽ
      </div>
    </div>
  );
}
