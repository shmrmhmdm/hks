import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2, FileSpreadsheet, ExternalLink, Code, Copy, Check } from 'lucide-react';

export default function SyncSheetModal({ onClose, totalLoaded, onReSync, lastSyncTime }) {
  const [sheetUrl, setSheetUrl] = useState(
    localStorage.getItem('hks_sheet_url') || 
    'https://docs.google.com/spreadsheets/d/169BwWoLG_uqZLtdLrNUYX38xpQrNY3Z5/export?format=csv'
  );
  const [webhookUrl, setWebhookUrl] = useState(
    localStorage.getItem('hks_webhook_url') || 
    'https://script.google.com/macros/s/AKfycbxToQaJKY739ByNJNwgxk0QcDIkLHNnN0LOT3TIR-CkvJfZGLkyuc-4k1NwrB501fM/exec'
  );
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncSuccess(false);
    try {
      localStorage.setItem('hks_sheet_url', sheetUrl);
      localStorage.setItem('hks_webhook_url', webhookUrl);
      await onReSync(sheetUrl);
      setSyncSuccess(true);
    } catch (err) {
      alert('ഡാറ്റ സിങ്ക് ചെയ്യുന്നതിൽ തടസ്സം നേരിട്ടു: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const appsScriptCode = `function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Collection") || ss.insertSheet("Collection");
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", "Date", "Time", "HKS Member Name", "HKS Member Mobile",
        "Ward", "Customer Number", "Customer Name", "Customer Type",
        "Door Number", "Building Name", "Status", "Amount (₹)",
        "Waste Status", "Payment Mode", "Remarks / Reason", "Customer Phone", "QR Code"
      ]);
      sheet.getRange(1, 1, 1, 18).setFontWeight("bold").setBackground("#dcfce7");
      sheet.setFrozenRows(1);
    }
    
    var data = JSON.parse(e.postData.contents);
    var now = new Date();
    var dateStr = Utilities.formatDate(now, "Asia/Kolkata", "dd/MM/yyyy");
    var timeStr = Utilities.formatDate(now, "Asia/Kolkata", "hh:mm:ss a");
    var targetCustId = String(data.customerId || "").trim();

    var lastRow = sheet.getLastRow();
    var existingRowIndex = -1;

    if (lastRow > 1 && targetCustId) {
      var rangeValues = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
      for (var i = 0; i < rangeValues.length; i++) {
        if (String(rangeValues[i][6]).trim() === targetCustId) {
          existingRowIndex = i + 2;
          break;
        }
      }
    }

    if (data.action === "DELETE") {
      if (existingRowIndex > 0) sheet.deleteRow(existingRowIndex);
      return ContentService.createTextOutput(JSON.stringify({status: "success", action: "deleted"})).setMimeType(ContentService.MimeType.JSON);
    }

    var rowData = [
      now, data.dateString || dateStr, timeStr,
      data.collectorName || "", data.collectorMob || "", data.ward || "",
      data.customerId || "", data.customerName || "", data.customerType || "",
      data.door || "", data.building || "", data.status || (data.amount > 0 ? "PAID" : "UNPAID"),
      data.amount || 0, data.wasteStatus || "", data.payMode || "",
      data.remarks || "", data.phone || "", data.qr || ""
    ];

    if (existingRowIndex > 0) {
      sheet.getRange(existingRowIndex, 1, 1, 18).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">ഗൂഗിൾ ഷീറ്റ് കണക്ഷൻ & സിങ്ക്</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Google Sheet Backend Settings</p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700, fontSize: '0.92rem' }}>
            <FileSpreadsheet size={20} />
            കസ്റ്റമർ ഡാറ്റാബേസ് നില
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#14532d', display: 'flex', justifyContent: 'space-between' }}>
            <span>ആകെ കസ്റ്റമർമാർ:</span>
            <strong>{totalLoaded.toLocaleString()} പേർ</strong>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
            അവസാനം സിങ്ക് ചെയ്തത്: {lastSyncTime || 'ഇപ്പോൾ ലഭ്യമായത്'}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">1. Google Apps Script Webhook URL (ലൈവ് സേവിംഗിന്)</label>
          <input
            type="text"
            className="form-input"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
          />
          <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
            ആപ്പിൽ കളക്ഷൻ രേഖപ്പെടുത്തുമ്പോൾ തത്സമയം <strong>Collection</strong> ഷീറ്റിലേക്ക് വരാൻ ഈ URL നൽകുക.
          </small>
        </div>

        <div className="form-group">
          <label className="form-label">2. ഗൂഗിൾ ഷീറ്റ് CSV URL (കസ്റ്റമർ ലിസ്റ്റ് അപ്‌ഡേറ്റിന്)</label>
          <input
            type="text"
            className="form-input"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="Google Sheet CSV export link"
          />
        </div>

        {syncSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontSize: '0.88rem', fontWeight: 700, marginBottom: '12px' }}>
            <CheckCircle2 size={18} /> ക്രമീകരണങ്ങൾ വിജയകരമായി സേവ് ചെയ്തു!
          </div>
        )}

        <button
          type="button"
          className="btn-collect"
          style={{ width: '100%', marginBottom: '14px' }}
          disabled={syncing}
          onClick={handleSyncNow}
        >
          <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'സിങ്ക് ചെയ്യുന്നു...' : 'സേവ് & സിങ്ക് ചെയ്യുക (Save & Sync)'}
        </button>

        <button
          type="button"
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            color: '#0284c7',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          onClick={() => setShowGuide(!showGuide)}
        >
          <Code size={16} /> Apps Script Webhook എങ്ങനെ സെറ്റ് ചെയ്യാം?
        </button>

        {showGuide && (
          <div style={{ marginTop: '12px', background: '#0f172a', color: '#e2e8f0', padding: '14px', borderRadius: '10px', fontSize: '0.8rem' }}>
            <div style={{ fontWeight: 700, color: '#4ade80', marginBottom: '8px' }}>
              ചെയ്യേണ്ട 3 ലളിതമായ ഘട്ടങ്ങൾ:
            </div>
            <ol style={{ paddingLeft: '16px', lineHeight: '1.6', marginBottom: '12px' }}>
              <li>ഗൂഗിൾ ഷീറ്റിൽ <strong>Extensions &gt; Apps Script</strong> തുറക്കുക.</li>
              <li>താഴെയുള്ള കോഡ് കോപ്പി ചെയ്ത് അവിടെ പേസ്റ്റ് ചെയ്യുക.</li>
              <li>മുകളിലെ <strong>Deploy &gt; New deployment &gt; Web app</strong> നൽകി Who has access: <strong>Anyone</strong> ആക്കി Deploy ചെയ്യുക. ലഭിക്കുന്ന URL മുകളിലെ ബോക്സിൽ പേസ്റ്റ് ചെയ്യുക.</li>
            </ol>
            <button
              type="button"
              onClick={copyCode}
              style={{
                background: '#15803d',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'കോഡ് കോപ്പി ചെയ്തു!' : 'Apps Script കോഡ് കോപ്പി ചെയ്യുക'}
            </button>
            <pre style={{ overflowX: 'auto', background: '#1e293b', padding: '10px', borderRadius: '6px', fontSize: '0.72rem' }}>
              {appsScriptCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
