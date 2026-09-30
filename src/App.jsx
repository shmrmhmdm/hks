import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  X, 
  RefreshCw, 
  Share2, 
  Building, 
  Home, 
  Store, 
  CheckCircle, 
  XCircle,
  Clock, 
  UserCheck,
  User,
  LogOut,
  IndianRupee,
  Phone
} from 'lucide-react';
import CustomerCard from './components/CustomerCard';
import CollectionModal from './components/CollectionModal';
import WhatsAppReportModal from './components/WhatsAppReportModal';
import SyncSheetModal from './components/SyncSheetModal';
import ReceiptModal from './components/ReceiptModal';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import initialCustomers from './data/customers.json';

export default function App() {
  const [customers, setCustomers] = useState(() => {
    try {
      const cached = localStorage.getItem('hks_cached_customers');
      return cached ? JSON.parse(cached) : (initialCustomers || []);
    } catch {
      return initialCustomers || [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // all | paid | unpaid | pending
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'today'

  // User / HKS Member login state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hks_logged_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Modals state
  const [collectingCustomer, setCollectingCustomer] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null); // { payment, customer }
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(localStorage.getItem('hks_last_sync') || '');

  // Payments storage in localStorage
  const [payments, setPayments] = useState(() => {
    try {
      const saved = localStorage.getItem('hks_payments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const todayStr = new Date().toLocaleDateString('en-GB');

  // Save payments to local storage
  useEffect(() => {
    localStorage.setItem('hks_payments', JSON.stringify(payments));
  }, [payments]);

  // Load customer dataset
  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const cached = localStorage.getItem('hks_cached_customers');
      if (cached) {
        setCustomers(JSON.parse(cached));
        setLoading(false);
      }

      const res = await fetch('./data/customers.json');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
        localStorage.setItem('hks_cached_customers', JSON.stringify(data));
        setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }));
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('hks_logged_user', JSON.stringify(user));
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('hks_logged_user');
  };

  const handleReSyncFromSheet = async (customUrl) => {
    try {
      const url = customUrl || 'https://docs.google.com/spreadsheets/d/169BwWoLG_uqZLtdLrNUYX38xpQrNY3Z5/export?format=csv';
      const res = await fetch(url);
      const text = await res.text();
      
      const lines = text.split('\n');
      const parsed = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',');
        if (parts.length >= 8) {
          const c_num = parts[1]?.replace(/"/g, '').trim();
          const c_name = parts[2]?.replace(/"/g, '').trim();
          const c_phone = parts[3]?.replace(/"/g, '').trim();
          const c_qr = parts[4]?.replace(/"/g, '').trim();
          const c_bldg = parts[5]?.replace(/"/g, '').trim();
          const c_door = parts[6]?.replace(/"/g, '').trim();
          const c_type = parts[8]?.replace(/"/g, '').trim() || 'House';
          const c_ward = parts[9]?.replace(/"/g, '').trim();

          if (c_name || c_num || c_qr) {
            parsed.push({
              id: c_num,
              name: c_name,
              phone: c_phone,
              qr: c_qr,
              building: c_bldg,
              door: c_door,
              address: '',
              type: c_type,
              ward: c_ward,
              rate: c_type.toLowerCase() === 'house' ? 50 : 100
            });
          }
        }
      }

      if (parsed.length > 0) {
        setCustomers(parsed);
        localStorage.setItem('hks_cached_customers', JSON.stringify(parsed));
      }
      const syncStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
      setLastSyncTime(syncStr);
      localStorage.setItem('hks_last_sync', syncStr);
    } catch (err) {
      console.error('Sync failed:', err);
      throw err;
    }
  };

  // Today's payments calculation
  const todayPayments = useMemo(() => {
    return payments.filter(p => p.dateString === todayStr);
  }, [payments, todayStr]);

  const todayPaidList = useMemo(() => {
    return todayPayments.filter(p => p.status === 'PAID' || p.amount > 0);
  }, [todayPayments]);

  const todayUnpaidList = useMemo(() => {
    return todayPayments.filter(p => p.status === 'UNPAID' || p.amount === 0);
  }, [todayPayments]);

  const todayTotalAmount = useMemo(() => {
    return todayPaidList.reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [todayPaidList]);

  // Fast search & filter memoization
  const filteredCustomers = useMemo(() => {
    if (!customers || customers.length === 0) return [];

    const q = searchQuery.trim().toLowerCase();
    const isTodayTab = activeTab === 'today';

    return customers.filter(c => {
      // Ward filter
      if (selectedWard !== 'all' && String(c.ward) !== String(selectedWard)) {
        return false;
      }

      // Customer type filter
      if (selectedType === 'house' && c.type?.toLowerCase() !== 'house') return false;
      if (selectedType === 'shop' && c.type?.toLowerCase() === 'house') return false;

      // Status filter
      const payment = todayPayments.find(p => p.customerId === c.id);
      const isPaid = payment && (payment.status === 'PAID' || payment.amount > 0);
      const isUnpaid = payment && (payment.status === 'UNPAID' || payment.amount === 0);

      if (isTodayTab && !payment) return false;
      if (selectedStatus === 'paid' && !isPaid) return false;
      if (selectedStatus === 'unpaid' && !isUnpaid) return false;
      if (selectedStatus === 'pending' && payment) return false;

      // Search query matching
      if (!q) {
        return true;
      }

      const matchName = c.name && c.name.toLowerCase().includes(q);
      const matchBuilding = c.building && c.building.toLowerCase().includes(q);
      const matchDoor = c.door && c.door.toLowerCase().includes(q);
      const matchPhone = c.phone && c.phone.includes(q);
      const matchQr = c.qr && c.qr.toLowerCase().includes(q);
      const matchId = c.id && c.id.toLowerCase().includes(q);
      const matchAddress = c.address && c.address.toLowerCase().includes(q);

      return matchName || matchBuilding || matchDoor || matchPhone || matchQr || matchId || matchAddress;
    });
  }, [customers, searchQuery, selectedWard, selectedType, selectedStatus, todayPayments, activeTab]);

  const handleSavePayment = (paymentData) => {
    // Add/Update to local state
    setPayments(prev => {
      const filtered = prev.filter(p => !(p.customerId === paymentData.customerId && p.dateString === paymentData.dateString));
      return [paymentData, ...filtered];
    });

    // POST directly to Google Apps Script Webhook (Collection sheet in Google Sheets)
    const webhookUrl = localStorage.getItem('hks_webhook_url') || 'https://script.google.com/macros/s/AKfycbxToQaJKY739ByNJNwgxk0QcDIkLHNnN0LOT3TIR-CkvJfZGLkyuc-4k1NwrB501fM/exec';
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE',
          ...paymentData
        })
      }).then(() => {
        console.log('Successfully saved to Google Sheet Collection webhook');
      }).catch(err => {
        console.log('Webhook POST error:', err);
      });
    }

    setCollectingCustomer(null);
  };

  const handleDeletePayment = (customerId) => {
    setPayments(prev => prev.filter(p => !(p.customerId === customerId && p.dateString === todayStr)));
    
    // Send delete action to Google Apps Script Webhook
    const webhookUrl = localStorage.getItem('hks_webhook_url') || 'https://script.google.com/macros/s/AKfycbxToQaJKY739ByNJNwgxk0QcDIkLHNnN0LOT3TIR-CkvJfZGLkyuc-4k1NwrB501fM/exec';
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE',
          customerId: customerId,
          dateString: todayStr
        })
      }).then(() => {
        console.log('Successfully deleted row from Google Sheet');
      }).catch(err => {
        console.log('Webhook Delete error:', err);
      });
    }

    setCollectingCustomer(null);
  };

  const startCollect = (customer) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    setCollectingCustomer(customer);
  };

  // If not logged in, show the Login Page first
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} totalCustomers={customers.length} />;
  }

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">🌱</div>
            <div>
              <h1 className="brand-title">ഹരിതമിത്രം</h1>
              <p className="brand-subtitle">പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത് • HKS</p>
            </div>
          </div>
          <div className="header-actions">
            {currentUser ? (
              <button 
                className="btn-header" 
                onClick={() => setShowLoginModal(true)}
                style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid #86efac' }}
              >
                <UserCheck size={14} color="#86efac" />
                <span>{currentUser.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button 
                className="btn-header" 
                onClick={() => setShowLoginModal(true)}
                style={{ background: '#f59e0b', color: '#1f2937', fontWeight: 800 }}
              >
                <User size={14} />
                <span>ലോഗിൻ</span>
              </button>
            )}

            <button className="btn-header" onClick={() => setShowSyncModal(true)} title="ഗൂഗിൾ ഷീറ്റ് കണക്ഷൻ">
              <RefreshCw size={14} />
              <span>ഷീറ്റ്</span>
            </button>
            <button className="btn-header" onClick={() => setShowWhatsAppModal(true)} title="വാട്സാപ്പ് റിപ്പോർട്ട്">
              <Share2 size={14} />
              <span>റിപ്പോർട്ട്</span>
            </button>
          </div>
        </div>
      </header>

      {/* Logged in member indicator bar */}
      <div style={{
        background: currentUser ? '#f0fdf4' : '#fffbeb',
        borderBottom: '1px solid #e2e8f0',
        padding: '6px 16px',
        fontSize: '0.82rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: currentUser ? '#166534' : '#b45309', fontWeight: 600 }}>
          {currentUser ? (
            <>
              <UserCheck size={15} />
              <span>അംഗം: <strong>{currentUser.name}</strong> ({currentUser.mob})</span>
            </>
          ) : (
            <>
              <span>⚠️ കളക്ഷൻ രേഖപ്പെടുത്താൻ ലോഗിൻ ചെയ്യുക</span>
            </>
          )}
        </div>
        {currentUser && (
          <button 
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
          >
            <LogOut size={12} /> മാറുക
          </button>
        )}
      </div>

      <main className="main-container">
        {/* Navigation Tabs */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <Search size={16} />
            <span>തിരയുക (Search)</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => setActiveTab('today')}
          >
            <CheckCircle size={16} />
            <span>ഇന്നത്തെ എൻട്രികൾ</span>
            {todayPayments.length > 0 && (
              <span className="badge-count">{todayPayments.length}</span>
            )}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Building size={16} />
            <span>ഡാഷ്‌ബോർഡ് (Dashboard)</span>
          </button>
        </div>

        {activeTab === 'dashboard' ? (
          <Dashboard payments={payments} />
        ) : (
          <>
            {/* Search & Filter Box */}
            <div className="search-box-card">
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="പേര്, വീട്ടുപേര്, ഡോർ No, ഫോൺ, QR കോഡ്..."
                  autoFocus
                />
                {searchQuery && (
                  <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="filter-row">
                <div className="filter-group">
                  <label className="filter-label">വാർഡ് (Ward)</label>
                  <select 
                    className="filter-select"
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                  >
                    <option value="all">എല്ലാ വാർഡുകളും</option>
                    {Array.from({ length: 21 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>വാർഡ് {i + 1}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">ഇനം (Type)</label>
                  <select 
                    className="filter-select"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="all">എല്ലാം (All)</option>
                    <option value="house">🏠 വീടുകൾ (₹50)</option>
                    <option value="shop">🏢 കടകൾ / സ്ഥാപനങ്ങൾ (₹100)</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">സ്റ്റാറ്റസ്</label>
                  <select 
                    className="filter-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">എല്ലാം</option>
                    <option value="paid">🟢 പൈസ തന്നവർ ({todayPaidList.length})</option>
                    <option value="unpaid">🔴 പൈസ തരാത്തവർ ({todayUnpaidList.length})</option>
                    <option value="pending">⚪ സന്ദർശിക്കാത്തവർ</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stats Ribbon */}
            <div className="stats-ribbon" style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
              <div>
                ഫലം: <span className="highlight-count">{filteredCustomers.length.toLocaleString()}</span> എണ്ണം
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: '#15803d', fontWeight: 800 }}>
                  🟢 ₹{todayTotalAmount.toLocaleString()} ({todayPaidList.length} പേർ)
                </span>
                {todayUnpaidList.length > 0 && (
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>
                    🔴 {todayUnpaidList.length} തന്നില്ല
                  </span>
                )}
              </div>
            </div>

            {/* Customer List */}
            {loading ? (
              <div className="empty-state">
                <div className="empty-icon">⏳</div>
                <h4>കസ്റ്റമർ വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു...</h4>
                <p style={{ fontSize: '0.85rem' }}>10,240+ റെക്കോർഡുകൾ തയ്യാറാകുന്നു</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h4>കസ്റ്റമർമാരെ കണ്ടെത്തിയില്ല</h4>
                <p style={{ fontSize: '0.85rem' }}>
                  '{searchQuery}' എന്ന പേരോ വിവരങ്ങളോ ലിസ്റ്റിൽ ഇല്ല. വാർഡ് മാറ്റി നോക്കുകയോ സ്പെല്ലിംഗ് പരിശോധിക്കുകയോ ചെയ്യുക.
                </p>
              </div>
            ) : (
              <div className="customer-list">
                {filteredCustomers.slice(0, 100).map((customer) => {
                  const payment = todayPayments.find(p => p.customerId === customer.id);
                  return (
                    <CustomerCard
                      key={customer.id || customer.qr || Math.random()}
                      customer={customer}
                      todayPayment={payment}
                      onCollect={startCollect}
                      onDelete={handleDeletePayment}
                      onShowReceipt={(pay, cust) => setViewingReceipt({ payment: pay, customer: cust })}
                    />
                  );
                })}
                {filteredCustomers.length > 100 && (
                  <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '0.85rem' }}>
                    ആദ്യത്തെ 100 ഫലങ്ങൾ കാണിക്കുന്നു. കൂടുതൽ കൃത്യമായി കണ്ടെത്താൻ പേരോ ഡോർ നമ്പറോ സെർച്ച് ചെയ്യുക.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          currentUser={currentUser}
          onLogin={handleLogin}
          onClose={() => setShowLoginModal(false)}
          canClose={Boolean(currentUser)}
        />
      )}

      {/* Collection Modal */}
      {collectingCustomer && (
        <CollectionModal
          customer={collectingCustomer}
          existingPayment={todayPayments.find(p => p.customerId === collectingCustomer.id)}
          currentUser={currentUser}
          onClose={() => setCollectingCustomer(null)}
          onSave={handleSavePayment}
          onDelete={handleDeletePayment}
        />
      )}

      {/* Receipt Modal */}
      {viewingReceipt && (
        <ReceiptModal
          payment={viewingReceipt.payment}
          customer={viewingReceipt.customer}
          onClose={() => setViewingReceipt(null)}
        />
      )}

      {/* WhatsApp Report Modal */}
      {showWhatsAppModal && (
        <WhatsAppReportModal
          payments={payments}
          selectedWard={selectedWard}
          onClose={() => setShowWhatsAppModal(false)}
        />
      )}

      {/* Sync Sheet Modal */}
      {showSyncModal && (
        <SyncSheetModal
          totalLoaded={customers.length}
          lastSyncTime={lastSyncTime}
          onReSync={handleReSyncFromSheet}
          onClose={() => setShowSyncModal(false)}
        />
      )}
    </div>
  );
}
