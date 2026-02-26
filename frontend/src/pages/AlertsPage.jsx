// ══════════════════════════════════════════════════════════════════════════════
// AlertsPage.jsx  — drop this into your AdminDashboard navItems and pageMap
// ══════════════════════════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';

const API = 'http://localhost:8082';
const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

// ─── Reuse Table and Modal from AdminDashboard or copy them here ──────────────

const categoryColors = {
  FLIGHT:  '#3b82f6',
  HOTEL:   '#8b5cf6',
  BUS:     '#f59e0b',
  CAB:     '#6366f1',
  TRAIN:   '#14b8a6',
  PACKAGE: '#10b981',
  SYSTEM:  '#ec4899',
};

const alertTypeColors = {
  BOOKING_CONFIRMED: '#10b981',
  BOOKING_CANCELLED: '#ef4444',
  BOOKING_PENDING:   '#f59e0b',
  ADMIN_BROADCAST:   '#ec4899',
  SYSTEM:            '#6366f1',
};

const Modal = ({ title, onClose, children }) => (
  <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
    <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>✕</button>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  </div>
);

const Field = ({ label, name, value, onChange, type = 'text', placeholder, as }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
    {as === 'select' ? (
      <select name={name} value={value} onChange={onChange}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none', color: '#0f172a', background: 'white' }}>
        {placeholder && <option value="">{placeholder}</option>}
        {['FLIGHT','HOTEL','BUS','CAB','TRAIN','PACKAGE','SYSTEM'].map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    ) : as === 'textarea' ? (
      <textarea name={name} value={value} onChange={onChange} rows={3} placeholder={placeholder}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none', color: '#0f172a', resize: 'vertical' }} />
    ) : (
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none', color: '#0f172a' }} />
    )}
  </div>
);

// ─── AlertsPage Component ─────────────────────────────────────────────────────
const AlertsPage = () => {
  const [alerts, setAlerts]   = useState([]);
  const [modal, setModal]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm]       = useState({
    userId:   '',       // blank = broadcast to everyone
    title:    '',
    message:  '',
    category: 'SYSTEM',
  });

  const load = () => {
    setLoading(true);
    fetch(`${API}/api/alerts/all`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(d => setAlerts(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const send = async () => {
    if (!form.title.trim() || !form.message.trim()) return alert('Title and message are required.');
    setSending(true);
    const body = {
      userId:   form.userId.trim() ? parseInt(form.userId.trim()) : null,
      title:    form.title.trim(),
      message:  form.message.trim(),
      category: form.category,
    };
    await fetch(`${API}/api/alerts/admin`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).catch(() => {});
    setSending(false);
    setModal(false);
    setForm({ userId: '', title: '', message: '', category: 'SYSTEM' });
    setSuccess(body.userId ? `Alert sent to user #${body.userId}` : 'Alert broadcast to all users ✓');
    setTimeout(() => setSuccess(''), 4000);
    load();
  };

  const del = async (id) => {
    if (!window.confirm('Delete this alert?')) return;
    await fetch(`${API}/api/alerts/${id}`, { method: 'DELETE', headers: authHeaders() });
    load();
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalBroadcast = alerts.filter(a => a.userId == null).length;
  const totalTargeted  = alerts.filter(a => a.userId != null).length;
  const totalUnread    = alerts.filter(a => !a.read).length;

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Alerts Management</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Create and broadcast real-time notifications to users</p>
        </div>
        <button onClick={() => setModal(true)} style={{ padding: '10px 20px', background: '#003580', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          🔔 Send Alert
        </button>
      </div>

      {/* ── Success banner ── */}
      {success && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 10, color: '#059669', fontWeight: 600, fontSize: 14 }}>
          ✅ {success}
        </div>
      )}

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Alerts',    value: alerts.length,  icon: '🔔', color: '#6366f1' },
          { label: 'Broadcast',       value: totalBroadcast, icon: '📡', color: '#ec4899' },
          { label: 'Targeted',        value: totalTargeted,  icon: '🎯', color: '#3b82f6' },
          { label: 'Unread',          value: totalUnread,    icon: '📭', color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: '18px 20px', border: '1px solid #f1f5f9', display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 15 }}>All Alerts</span>
          <span style={{ fontSize: 12, color: '#64748b' }}>{alerts.length} records</span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['ID','Target','Type','Title','Category','Read','Sent At','Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alerts.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No alerts yet</td></tr>
                )}
                {alerts.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '11px 16px', color: '#374151', fontFamily: 'monospace', fontSize: 12 }}>{a.id}</td>
                    <td style={{ padding: '11px 16px' }}>
                      {a.userId ? (
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#eff6ff', color: '#2563eb' }}>User #{a.userId}</span>
                      ) : (
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#fdf2f8', color: '#ec4899' }}>Everyone</span>
                      )}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: (alertTypeColors[a.alertType] || '#94a3b8') + '20', color: alertTypeColors[a.alertType] || '#94a3b8' }}>
                        {a.alertType}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px', color: '#0f172a', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: (categoryColors[a.category] || '#94a3b8') + '20', color: categoryColors[a.category] || '#94a3b8' }}>
                        {a.category}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ fontSize: 12, color: a.read ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{a.read ? '✓ Read' : '● Unread'}</span>
                    </td>
                    <td style={{ padding: '11px 16px', color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {a.createdAt ? new Date(a.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                    </td>
                    <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
                      <button onClick={() => del(a.id)} style={{ padding: '5px 12px', background: '#fff1f2', color: '#e11d48', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <Modal title="Send Alert to Users" onClose={() => setModal(false)}>
          <div style={{ marginBottom: 16, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, fontSize: 13, color: '#1e40af' }}>
            💡 Leave <strong>User ID</strong> blank to broadcast to <strong>all users</strong>.
          </div>

          <Field label="Target User ID (optional — blank = broadcast)"
                 name="userId" value={form.userId} onChange={handleChange}
                 type="number" placeholder="e.g. 42 (or leave blank for everyone)" />
          <Field label="Alert Title"
                 name="title" value={form.title} onChange={handleChange}
                 placeholder="e.g. Special Offer on Flights!" />
          <Field label="Message"
                 name="message" value={form.message} onChange={handleChange}
                 as="textarea"
                 placeholder="Write the full alert message here…" />
          <Field label="Category"
                 name="category" value={form.category} onChange={handleChange}
                 as="select" placeholder="Select category" />

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button onClick={() => setModal(false)} style={{ flex: 1, padding: 13, background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
              Cancel
            </button>
            <button onClick={send} disabled={sending} style={{ flex: 2, padding: 13, background: '#003580', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
              {sending ? 'Sending…' : form.userId.trim() ? '🎯 Send to User' : '📡 Broadcast to All'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AlertsPage;


// ────────────────────────────────────────────────────────────────────────────
// In AdminDashboard.jsx, add this to navItems:
//   { id: 'alerts', label: 'Alerts', icon: '🔔' },
//
// And in pageMap:
//   alerts: <AlertsPage />,
//
// And import at top:
//   import AlertsPage from './AlertsPage';
// ────────────────────────────────────────────────────────────────────────────