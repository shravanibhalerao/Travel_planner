import React, { useState, useEffect, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import Footer from "../components/common/Footer.jsx";

// ─── STOMP/WebSocket endpoint ─────────────────────────────────────────────────
const WS_URL = 'https://travel-planner-cf8s.onrender.com/ws';
const API    = 'https://travel-planner-cf8s.onrender.com';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ type, color, size = 22 }) => {
  const s = { width: size, height: size };
  const icons = {
    check: (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={s}>
        <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    warning: (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={s}>
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    cross: (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={s}>
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
    bell: (
      <svg viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    wifi: (
      <svg viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}>
        <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
      </svg>
    ),
    flight:  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>,
    hotel:   <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    bus:     <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="7" cy="19" r="1"/><circle cx="17" cy="19" r="1"/></svg>,
    package: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
    speaker: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
  };
  return icons[type] || null;
};

// ─── Category config ──────────────────────────────────────────────────────────
const catConfig = {
  FLIGHT:  { label: 'Flight',          icon: 'flight',  accent: '#3b82f6', bg: '#eff6ff' },
  HOTEL:   { label: 'Hotel',           icon: 'hotel',   accent: '#8b5cf6', bg: '#f5f3ff' },
  BUS:     { label: 'Bus',             icon: 'bus',     accent: '#f59e0b', bg: '#fffbeb' },
  CAB:     { label: 'Cab',             icon: 'bus',     accent: '#6366f1', bg: '#eef2ff' },
  TRAIN:   { label: 'Train',           icon: 'bus',     accent: '#14b8a6', bg: '#f0fdfa' },
  PACKAGE: { label: 'Holiday Package', icon: 'package', accent: '#10b981', bg: '#ecfdf5' },
  SYSTEM:  { label: 'System',          icon: 'speaker', accent: '#ec4899', bg: '#fdf2f8' },
};

const alertTypeConfig = {
  BOOKING_CONFIRMED: { icon: 'check',   color: '#10b981', label: 'Confirmed' },
  BOOKING_CANCELLED: { icon: 'cross',   color: '#ef4444', label: 'Cancelled' },
  BOOKING_PENDING:   { icon: 'warning', color: '#f59e0b', label: 'Pending'   },
  ADMIN_BROADCAST:   { icon: 'speaker', color: '#ec4899', label: 'Notice'    },
  SYSTEM:            { icon: 'warning', color: '#6366f1', label: 'System'    },
};

function getConfigs(alert) {
  const cc = catConfig[alert.category] || catConfig.SYSTEM;
  const ac = alertTypeConfig[alert.alertType] || alertTypeConfig.SYSTEM;
  return { cc, ac };
}

function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

// ─── Toast notification ───────────────────────────────────────────────────────
const Toast = ({ alert, onDismiss }) => {
  const { cc, ac } = getConfigs(alert);
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: 'white', borderRadius: 14, padding: '14px 18px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: `2px solid ${cc.accent}`,
      display: 'flex', gap: 12, alignItems: 'flex-start', maxWidth: 360,
      animation: 'toastIn .3s cubic-bezier(.175,.885,.32,1.275)',
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: cc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon type={cc.icon} color={cc.accent} size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 3 }}>{alert.title}</div>
        <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{alert.message}</div>
      </div>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>✕</button>
    </div>
  );
};

// ─── Main AlertPage ───────────────────────────────────────────────────────────
const AlertPage = () => {
  const [alerts, setAlerts]       = useState([]);
  const [filter, setFilter]       = useState('ALL');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [expanded, setExpanded]   = useState(null);
  const [wsStatus, setWsStatus]   = useState('connecting'); // connecting | connected | error
  const [toast, setToast]         = useState(null);
  const stompRef                  = useRef(null);

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // ── Fetch existing alerts via REST ──────────────────────────────────────────
  useEffect(() => {
    if (!token) { setError('Please log in to view your alerts.'); setLoading(false); return; }

    fetch(`${API}/api/alerts/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error('Failed to fetch alerts'); return r.json(); })
      .then(data => {
        setAlerts(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Connect WebSocket ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setWsStatus('connected');

        // 1. Subscribe to personal alerts
        client.subscribe('/user/queue/alerts', (msg) => {
          const newAlert = JSON.parse(msg.body);
          handleIncomingAlert(newAlert);
        });

        // 2. Subscribe to broadcast alerts for everyone
        client.subscribe('/topic/alerts', (msg) => {
          const newAlert = JSON.parse(msg.body);
          handleIncomingAlert(newAlert);
        });
      },
      onDisconnect: () => setWsStatus('connecting'),
      onStompError:  () => setWsStatus('error'),
    });

    client.activate();
    stompRef.current = client;

    return () => { client.deactivate(); };
  }, [token]);

  const handleIncomingAlert = useCallback((newAlert) => {
    setAlerts(prev => {
      // Avoid duplicates
      if (prev.find(a => a.id === newAlert.id)) return prev;
      return [newAlert, ...prev];
    });
    setToast(newAlert);

    // Browser notification (if permission granted)
    if (Notification.permission === 'granted') {
      new Notification(newAlert.title, { body: newAlert.message, icon: '/favicon.ico' });
    }
  }, []);

  // ── Request browser notification permission ─────────────────────────────────
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // ── Mark all read ───────────────────────────────────────────────────────────
  const markAllRead = () => {
    if (!token) return;
    fetch(`${API}/api/alerts/mark-read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => setAlerts(prev => prev.map(a => ({ ...a, read: true }))));
  };

  // ── Filter logic ────────────────────────────────────────────────────────────
  const filterOptions = [
    { value: 'ALL',       label: 'All' },
    { value: 'FLIGHT',    label: 'Flights' },
    { value: 'HOTEL',     label: 'Hotels' },
    { value: 'BUS',       label: 'Bus' },
    { value: 'PACKAGE',   label: 'Packages' },
    { value: 'SYSTEM',    label: 'System' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PENDING',   label: 'Pending' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const filtered = alerts.filter(a => {
    if (filter === 'ALL') return true;
    if (filter === 'CONFIRMED') return a.alertType === 'BOOKING_CONFIRMED';
    if (filter === 'PENDING')   return a.alertType === 'BOOKING_PENDING';
    if (filter === 'CANCELLED') return a.alertType === 'BOOKING_CANCELLED';
    return a.category === filter;
  });

  const unreadCount = alerts.filter(a => !a.read).length;

  const counts = {
    CONFIRMED: alerts.filter(a => a.alertType === 'BOOKING_CONFIRMED').length,
    PENDING:   alerts.filter(a => a.alertType === 'BOOKING_PENDING').length,
    CANCELLED: alerts.filter(a => a.alertType === 'BOOKING_CANCELLED').length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ap-root { min-height: 100vh; background: #f8faff; font-family: 'Sora', sans-serif; color: #1e293b;  z-index: 1;
    margin-top: -40px; }

        .ap-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%);
          padding: 48px 24px 36px; text-align: center; position: relative; overflow: hidden;
        }
        .ap-hero::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 70% 50%, rgba(99,102,241,.25) 0%, transparent 65%);
          pointer-events: none;
        }
        .ap-hero-icon {
          display: inline-flex; align-items: center; justify-content: center;
          width: 64px; height: 64px; border-radius: 18px;
          background: rgba(255,255,255,.12); backdrop-filter: blur(8px);
          color: white; margin-bottom: 16px; box-shadow: 0 4px 24px rgba(0,0,0,.3);
          position: relative;
        }
        .ap-badge {
  position: absolute;
  top: 4px;
  right: 13px;
  background: #dc3545;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 6px;
  border-radius: 50px;
  min-width: 18px;
  text-align: center;
  line-height: 1;
  box-shadow: 0 0 0 2px white;
}
  .ap-badge {
  animation: pop 0.25s ease;
}

@keyframes pop {
  0% { transform: scale(0.6); }
  100% { transform: scale(1); }
}
        .ap-hero h1 { color: white; font-size: clamp(1.5rem, 4vw, 2.2rem); font-weight: 700; letter-spacing: -0.02em; }
        .ap-hero p  { color: rgba(255,255,255,.65); font-size: 0.95rem; margin-top: 6px; }
.
        .ap-ws-pill {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 14px; padding: 5px 14px; border-radius: 999px;
          font-size: 0.75rem; font-weight: 600;
          backdrop-filter: blur(8px);
        }
        .ap-ws-dot { width: 7px; height: 7px; border-radius: 50%; }
        .ws-connected  { background: rgba(16,185,129,.2); color: #6ee7b7; }
        .ws-connecting { background: rgba(245,158,11,.2); color: #fcd34d; }
        .ws-error      { background: rgba(239,68,68,.2);  color: #fca5a5; }
        .ws-connected .ap-ws-dot  { background: #10b981; animation: pulse 2s infinite; }
        .ws-connecting .ap-ws-dot { background: #f59e0b; animation: pulse 1s infinite; }
        .ws-error .ap-ws-dot      { background: #ef4444; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }

        .ap-toolbar {
          max-width: 900px; margin: 20px auto 0; padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between; gap: 12; flex-wrap: wrap;
        }
        .ap-mark-read {
          padding: 7px 16px; border-radius: 999px;
          background: rgba(255,255,255,.85); border: 1.5px solid #e2e8f0;
          color: #3b82f6; font-size: 0.8rem; font-weight: 600; cursor: pointer;
          font-family: 'Sora', sans-serif; transition: all .2s;
        }
        .ap-mark-read:hover { background: #eff6ff; }

        .ap-summary {
          display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
          padding: 20px 24px 0;
        }
        .ap-pill {
          display: flex; align-items: center; gap: 6px; padding: 6px 14px;
          border-radius: 999px; font-size: 0.8rem; font-weight: 600; letter-spacing: .03em;
        }
        .ap-pill-dot { width: 8px; height: 8px; border-radius: 50%; }

        .ap-filters {
          display: flex; gap: 8px; flex-wrap: wrap;
          padding: 24px 24px 0; max-width: 900px; margin: 0 auto;
        }
        .ap-filter-btn {
          padding: 8px 18px; border-radius: 999px;
          border: 1.5px solid #e2e8f0; background: white; color: #64748b;
          cursor: pointer; font-size: 0.82rem; font-weight: 500;
          font-family: 'Sora', sans-serif; transition: all .18s ease;
        }
        .ap-filter-btn:hover  { border-color: #3b82f6; color: #3b82f6; }
        .ap-filter-btn.active { background: #1e3a8a; border-color: #1e3a8a; color: white; }

        .ap-list {
          max-width: 900px; margin: 0 auto; padding: 20px 24px 40px;
          display: flex; flex-direction: column; gap: 14px;
        }

        .ap-card {
          background: white; border-radius: 16px; border: 1.5px solid #e8eef8;
          box-shadow: 0 2px 8px rgba(0,0,0,.04); overflow: hidden;
          transition: box-shadow .2s, transform .2s; cursor: pointer;
        }
        .ap-card.unread { border-left: 4px solid #3b82f6; }
        .ap-card:hover  { box-shadow: 0 6px 20px rgba(0,0,0,.08); transform: translateY(-2px); }
        .ap-card.new-alert { animation: newCard .5s ease; }
        @keyframes newCard {
          from { background: #eff6ff; transform: translateX(-8px); }
          to   { background: white;   transform: translateX(0); }
        }

        .ap-card-top {
          display: grid; grid-template-columns: 56px 1fr auto;
          gap: 14px; align-items: center; padding: 18px 20px;
        }
        .ap-type-icon {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ap-card-body h3 { font-size: 0.97rem; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
        .ap-card-body p  { font-size: 0.82rem; color: #64748b; line-height: 1.45; }
        .ap-card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
        .ap-status-badge {
          display: flex; align-items: center; gap: 5px; padding: 4px 10px;
          border-radius: 999px; font-size: 0.74rem; font-weight: 600; white-space: nowrap;
        }
        .ap-time { font-size: 0.73rem; color: #94a3b8; font-family: 'JetBrains Mono', monospace; white-space: nowrap; }

        .ap-card-detail {
          border-top: 1px solid #f1f5f9; padding: 14px 20px; background: #fafcff;
          animation: slideDown .2s ease;
        }
        @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .ap-detail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
        .ap-detail-item label { display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: .07em; color: #94a3b8; margin-bottom: 3px; font-weight: 600; }
        .ap-detail-item span  { font-size: 0.85rem; color: #1e293b; font-weight: 500; }

        .ap-state { text-align: center; padding: 72px 24px; color: #94a3b8; }
        .ap-state h3 { font-size: 1.1rem; color: #64748b; margin-bottom: 6px; }
        .ap-state p  { font-size: 0.88rem; }

        .ap-loader { display: flex; justify-content: center; align-items: center; gap: 10px; padding: 80px 24px; color: #94a3b8; font-size: 0.9rem; }
        .ap-spinner { width: 28px; height: 28px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin .7s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }

        @keyframes toastIn { from{opacity:0;transform:translateY(20px) scale(.95)} to{opacity:1;transform:translateY(0) scale(1)} }

        @media (max-width: 520px) {
          .ap-card-top { grid-template-columns: 44px 1fr; }
          .ap-card-right { display: none; }
          .ap-hero { padding: 36px 16px 28px; }
        }
      `}</style>

      <div className="ap-root">

        {/* ── Hero ── */}
        <div className="ap-hero">
          
          <h1>Travel Alerts</h1>
          <p>Real-time booking updates, confirmations &amp; admin notifications</p>

         
        </div>

        {/* ── Toolbar ── */}
        {!loading && !error && alerts.length > 0 && (
          <div className="ap-toolbar">
            <div className="ap-summary" style={{ padding: 0, justifyContent: 'flex-start' }}>
              {[
                { key: 'CONFIRMED', color: '#10b981', bg: '#ecfdf5' },
                { key: 'PENDING',   color: '#f59e0b', bg: '#fffbeb' },
                { key: 'CANCELLED', color: '#ef4444', bg: '#fef2f2' },
              ].map(({ key, color, bg }) => counts[key] ? (
                <div className="ap-pill" key={key} style={{ background: bg, color }}>
                  <span className="ap-pill-dot" style={{ background: color }}></span>
                  {counts[key]} {key.charAt(0) + key.slice(1).toLowerCase()}
                </div>
              ) : null)}
            </div>
            {unreadCount > 0 && (
              <button className="ap-mark-read" onClick={markAllRead}>
                ✓ Mark all as read
              </button>
            )}
          </div>
        )}

        {/* ── Filters ── */}
        {!loading && !error && (
          <div className="ap-filters">
            {filterOptions.map(f => (
              <button
                key={f.value}
                className={`ap-filter-btn${filter === f.value ? ' active' : ''}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="ap-loader"><div className="ap-spinner" />Loading your alerts…</div>
        ) : error ? (
          <div className="ap-state">
            <Icon type="cross" color="#ef4444" size={40} />
            <h3 style={{ marginTop: 12 }}>Couldn't load alerts</h3>
            <p>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ap-state">
            <Icon type="bell" color="#94a3b8" size={40} />
            <h3 style={{ marginTop: 12 }}>No alerts found</h3>
            <p>{alerts.length === 0 ? "You haven't made any bookings yet." : "No alerts match this filter."}</p>
          </div>
        ) : (
          <div className="ap-list">
            {filtered.map((alert, idx) => {
              const { cc, ac } = getConfigs(alert);
              const isOpen = expanded === alert.id;
              return (
                <div
                  key={alert.id}
                  className={`ap-card${!alert.read ? ' unread' : ''}${idx === 0 ? ' new-alert' : ''}`}
                  onClick={() => setExpanded(isOpen ? null : alert.id)}
                >
                  <div className="ap-card-top">
                    <div className="ap-type-icon" style={{ background: cc.bg }}>
                      <Icon type={cc.icon} color={cc.accent} size={22} />
                    </div>
                    <div className="ap-card-body">
                      <h3>{alert.title}</h3>
                      <p>{alert.message}</p>
                    </div>
                    <div className="ap-card-right">
                      <div className="ap-status-badge" style={{ background: ac.color + '18', color: ac.color }}>
                        <Icon type={ac.icon} color={ac.color} size={14} />
                        {ac.label}
                      </div>
                      <span className="ap-time">{fmtTime(alert.createdAt)}</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="ap-card-detail">
                      <div className="ap-detail-grid">
                        {alert.ticketId && (
                          <div className="ap-detail-item">
                            <label>Ticket ID</label>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>{alert.ticketId}</span>
                          </div>
                        )}
                        <div className="ap-detail-item">
                          <label>Category</label>
                          <span>{cc.label}</span>
                        </div>
                        <div className="ap-detail-item">
                          <label>Received</label>
                          <span>{fmtTime(alert.createdAt)}</span>
                        </div>
                        <div className="ap-detail-item">
                          <label>Status</label>
                          <span style={{ color: ac.color }}>{ac.label}</span>
                        </div>
                        <div className="ap-detail-item">
                          <label>Read</label>
                          <span>{alert.read ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && <Toast alert={toast} onDismiss={() => setToast(null)} />}

      <Footer />
    </>
  );
};

export default AlertPage;