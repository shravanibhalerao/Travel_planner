import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Calendar, Clock,
  Ticket, LogOut, Edit2, CheckCircle, XCircle,
  Bus, ChevronRight, AlertCircle
} from 'lucide-react';
import Footer from '../components/common/Footer.jsx';

export default function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'profile'
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelMessage, setCancelMessage] = useState('');

  // ─── Load user from localStorage on mount ───
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(stored));
  }, [navigate]);

  // ─── Fetch bookings from backend ───
  useEffect(() => {
    if (!user) return;
    fetchMyTickets();
  }, [user]);

  const fetchMyTickets = async () => {
    setLoadingBookings(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://travel-planner-cf8s.onrender.com/api/bookings/my-tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setBookings([]);
    }
    setLoadingBookings(false);
  };

  // ─── Cancel booking ───
  const handleCancel = async (ticketId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(ticketId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://travel-planner-cf8s.onrender.com/api/bookings/cancel/${ticketId}`,
        { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Cancel failed');
      setCancelMessage('Booking cancelled successfully.');
      fetchMyTickets(); // refresh list
    } catch (err) {
      setCancelMessage('Failed to cancel. Please try again.');
    }
    setCancellingId(null);
    setTimeout(() => setCancelMessage(''), 3000);
  };

  // ─── Logout ───
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');

        .profile-page {
          font-family: 'Nunito', sans-serif;
          background: #f5f7fa;
          min-height: 100vh;
        }

        /* ── Hero banner ── */
        .profile-hero {
          background: linear-gradient(135deg, #003580 0%, #0057b8 100%);
          padding: 40px 0 80px;
          position: relative;
          overflow: hidden;
        }
        .profile-hero::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0; right: 0;
          height: 50px;
          background: #f5f7fa;
          border-radius: 50% 50% 0 0 / 20px 20px 0 0;
        }
        .hero-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .avatar-circle {
          width: 90px; height: 90px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          border: 3px solid rgba(255,255,255,0.5);
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; font-weight: 800; color: white;
          flex-shrink: 0;
          backdrop-filter: blur(8px);
        }
        .hero-info h1 {
          color: white; font-size: 26px; font-weight: 800; margin: 0 0 4px;
        }
        .hero-info p {
          color: rgba(255,255,255,0.75); font-size: 14px; margin: 0;
        }
        .hero-actions {
          margin-left: auto;
          display: flex;
          gap: 10px;
        }
        .btn-outline-white {
          padding: 8px 18px;
          border: 2px solid rgba(255,255,255,0.6);
          border-radius: 8px;
          color: white;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          transition: all 0.2s;
          font-family: 'Nunito', sans-serif;
        }
        .btn-outline-white:hover {
          background: rgba(255,255,255,0.15);
        }
        .btn-logout {
          padding: 8px 18px;
          border: none;
          border-radius: 8px;
          background: rgba(255,80,80,0.25);
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          transition: all 0.2s;
          font-family: 'Nunito', sans-serif;
        }
        .btn-logout:hover { background: rgba(255,80,80,0.45); }

        /* ── Stats row ── */
        .stats-row {
          max-width: 1100px;
          margin: -30px auto 30px;
          padding: 0 24px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          position: relative;
          z-index: 10;
        }
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px 24px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          display: flex; align-items: center; gap: 16px;
        }
        .stat-icon {
          width: 48px; height: 48px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .stat-icon.blue  { background: #e8f0fe; color: #003580; }
        .stat-icon.green { background: #e8f8f0; color: #1a8c4e; }
        .stat-icon.red   { background: #fef0f0; color: #c0392b; }
        .stat-label { font-size: 12px; color: #888; font-weight: 600; text-transform: uppercase; }
        .stat-value { font-size: 24px; font-weight: 800; color: #0f172a; }

        /* ── Tabs ── */
        .tabs-container {
          max-width: 1100px;
          margin: 0 auto 24px;
          padding: 0 24px;
        }
        .tabs {
          display: flex;
          gap: 4px;
          background: white;
          border-radius: 10px;
          padding: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          width: fit-content;
        }
        .tab-btn {
          padding: 10px 24px;
          border: none;
          border-radius: 8px;
          background: transparent;
          font-size: 14px;
          font-weight: 600;
          color: #888;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Nunito', sans-serif;
          display: flex; align-items: center; gap: 8px;
        }
        .tab-btn.active {
          background: #003580;
          color: white;
          box-shadow: 0 2px 8px rgba(0,53,128,0.3);
        }
        .tab-btn:hover:not(.active) { color: #003580; background: #f0f4ff; }

        /* ── Main content ── */
        .main-content {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px 40px;
        }

        /* ── Booking card ── */
        .booking-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid #e8ecf1;
          transition: all 0.2s;
        }
        .booking-card:hover {
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        .booking-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .ticket-badge {
          background: #e8f0fe;
          color: #003580;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
          letter-spacing: 0.5px;
        }
        .status-badge {
          font-size: 12px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
        }
        .status-badge.confirmed {
          background: #e8f8f0;
          color: #1a8c4e;
        }
        .status-badge.cancelled {
          background: #fef0f0;
          color: #c0392b;
        }
        .route-display {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }
        .city-name {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
        }
        .city-label {
          font-size: 11px;
          color: #999;
          font-weight: 600;
          text-transform: uppercase;
        }
        .route-arrow {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #003580;
        }
        .route-line {
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg, #003580, #0057b8);
          border-radius: 2px;
        }
        .booking-meta {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 16px;
          padding: 16px;
          background: #f8faff;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        .meta-item label {
          font-size: 11px;
          color: #999;
          font-weight: 600;
          text-transform: uppercase;
          display: block;
          margin-bottom: 4px;
        }
        .meta-item span {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }
        .booking-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .total-amount {
          font-size: 20px;
          font-weight: 800;
          color: #003580;
        }
        .total-label {
          font-size: 11px;
          color: #999;
          font-weight: 600;
          text-transform: uppercase;
        }
        .btn-cancel {
          padding: 8px 20px;
          border: 2px solid #e74c3c;
          border-radius: 8px;
          color: #e74c3c;
          background: transparent;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Nunito', sans-serif;
        }
        .btn-cancel:hover {
          background: #e74c3c;
          color: white;
        }
        .btn-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ── Empty state ── */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .empty-icon {
          width: 80px; height: 80px;
          background: #f0f4ff;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          color: #003580;
        }

        /* ── Profile details tab ── */
        .profile-card {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .profile-field {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .profile-field:last-child { border-bottom: none; }
        .field-icon {
          width: 42px; height: 42px;
          background: #f0f4ff;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: #003580;
          flex-shrink: 0;
        }
        .field-label {
          font-size: 11px;
          color: #999;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .field-value {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }

        /* ── Toast ── */
        .toast-msg {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: #0f172a;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          z-index: 9999;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          animation: fadeInUp 0.3s ease;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }

        @media (max-width: 640px) {
          .stats-row { grid-template-columns: 1fr; }
          .hero-actions { display: none; }
          .hero-inner { flex-wrap: wrap; }
        }
      `}</style>

      <div className="profile-page">

        {/* ── Hero ── */}
        <div className="profile-hero">
          <div className="hero-inner">
            <div className="avatar-circle">
              {user.firstName?.charAt(0).toUpperCase()}{user.lastName?.charAt(0).toUpperCase()}
            </div>
            <div className="hero-info">
              <h1>{user.firstName} {user.lastName}</h1>
              <p>{user.email}</p>
            </div>
            <div className="hero-actions">
              <button className="btn-outline-white" onClick={() => setActiveTab('profile')}>
                <Edit2 size={14} /> Edit Profile
              </button>
              <button className="btn-logout" onClick={handleLogout}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon blue"><Ticket size={22} /></div>
            <div>
              <div className="stat-label">Total Bookings</div>
              <div className="stat-value">{bookings.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><CheckCircle size={22} /></div>
            <div>
              <div className="stat-label">Confirmed</div>
              <div className="stat-value">{confirmedBookings.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red"><XCircle size={22} /></div>
            <div>
              <div className="stat-label">Cancelled</div>
              <div className="stat-value">{cancelledBookings.length}</div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}>
              <Ticket size={15} /> My Tickets
            </button>
            <button
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}>
              <User size={15} /> Profile Info
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="main-content">

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <>
              {loadingBookings ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
                  <p style={{ fontSize: '16px' }}>Loading your tickets...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Bus size={36} /></div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                    No bookings yet
                  </h3>
                  <p style={{ color: '#888', marginBottom: '24px' }}>
                    You haven't booked any buses yet. Start your journey!
                  </p>
                  <button
                    onClick={() => navigate('/bus-booking')}
                    style={{
                      padding: '12px 28px', background: '#003580', color: 'white',
                      border: 'none', borderRadius: '8px', fontSize: '14px',
                      fontWeight: '700', cursor: 'pointer', fontFamily: 'Nunito, sans-serif'
                    }}>
                    Search Buses
                  </button>
                </div>
              ) : (
                bookings.map(booking => (
                  <div key={booking.id} className="booking-card">

                    {/* Header */}
                    <div className="booking-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span className="ticket-badge">🎟 {booking.ticketId}</span>
                        <span className={`status-badge ${booking.status === 'CONFIRMED' ? 'confirmed' : 'cancelled'}`}>
                          {booking.status === 'CONFIRMED' ? '✓ Confirmed' : '✕ Cancelled'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#999', fontWeight: '600' }}>
                        Booked on {booking.bookedAt ? new Date(booking.bookedAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        }) : '—'}
                      </div>
                    </div>

                    {/* Route */}
                    <div className="route-display">
                      <div>
                        <div className="city-name">{booking.source?.split(',')[0]}</div>
                        <div className="city-label">Departure</div>
                      </div>
                      <div className="route-arrow">
                        <div className="route-line"></div>
                        <ChevronRight size={18} />
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="city-name">{booking.destination?.split(',')[0]}</div>
                        <div className="city-label">Arrival</div>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="booking-meta">
                      <div className="meta-item">
                        <label>Bus</label>
                        <span>{booking.busName}</span>
                      </div>
                      <div className="meta-item">
                        <label>Type</label>
                        <span>{booking.busType}</span>
                      </div>
                      <div className="meta-item">
                        <label>Travel Date</label>
                        <span>{booking.travelDate}</span>
                      </div>
                      <div className="meta-item">
                        <label>Departure</label>
                        <span>{booking.departureTime}</span>
                      </div>
                      <div className="meta-item">
                        <label>Arrival</label>
                        <span>{booking.arrivalTime}</span>
                      </div>
                      <div className="meta-item">
                        <label>Passengers</label>
                        <span>{booking.passengers}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="booking-footer">
                      <div>
                        <div className="total-label">Total Paid</div>
                        <div className="total-amount">₹{booking.totalAmount?.toLocaleString()}</div>
                      </div>
                      {booking.status === 'CONFIRMED' && (
                        <button
                          className="btn-cancel"
                          disabled={cancellingId === booking.ticketId}
                          onClick={() => handleCancel(booking.ticketId)}>
                          {cancellingId === booking.ticketId ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="profile-card">
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                Personal Information
              </h3>
              <p style={{ color: '#888', fontSize: '13px', marginBottom: '24px' }}>
                Your account details saved with TravelPlanner.
              </p>

              {[
                { icon: <User size={18} />, label: 'First Name', value: user.firstName },
                { icon: <User size={18} />, label: 'Last Name', value: user.lastName },
                { icon: <Mail size={18} />, label: 'Email Address', value: user.email },
                { icon: <Ticket size={18} />, label: 'User ID', value: `#${user.id}` },
              ].map((field, i) => (
                <div key={i} className="profile-field">
                  <div className="field-icon">{field.icon}</div>
                  <div>
                    <div className="field-label">{field.label}</div>
                    <div className="field-value">{field.value || '—'}</div>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '28px', padding: '16px', background: '#f8faff', borderRadius: '8px', border: '1px solid #e8f0fe' }}>
                <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                  <strong>🔒 Password</strong> — To change your password, please contact support or use the Forgot Password option on the login page.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Toast */}
        {cancelMessage && (
          <div className="toast-msg">{cancelMessage}</div>
        )}

        <Footer />
      </div>
    </>
  );
}