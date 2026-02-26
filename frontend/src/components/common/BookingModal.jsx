// src/components/common/BookingModal.jsx
import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

const inputStyle = {
  width: '100%', padding: '12px', border: '1px solid #ddd',
  borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box',
  fontFamily: 'inherit'
};

export default function BookingModal({
  show, onClose,
  item,          // the selected flight/hotel/cab/package/bus object
  itemLabel,     // human-readable name string
  pricePerUnit,  // number
  unitLabel,     // "per seat" / "per night" / "per person"
  form, setForm,
  onSubmit,
  loading, error,
  success, ticket,
  searchParams = {}
}) {
  if (!show || !item) return null;

  const total = pricePerUnit * parseInt(form.passengers || 1);

  return (
    <div
      onClick={() => !success && onClose()}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1100, padding: '20px', overflowY: 'auto'
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white', borderRadius: '12px', maxWidth: '520px',
          width: '100%', padding: '35px', position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>

        {!success ? (
          /* ── Form ─────────────────────────────────────────────────────── */
          <>
            <button onClick={onClose} style={{
              position: 'absolute', top: '15px', right: '15px', background: 'white',
              border: '1px solid #ddd', borderRadius: '50%', width: '36px', height: '36px',
              cursor: 'pointer', fontSize: '18px', fontWeight: 'bold',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}><X size={18} /></button>

            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '5px' }}>
              Passenger Details
            </h2>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '25px' }}>
              {itemLabel}
            </p>

            {error && (
              <div style={{
                background: '#fff0f0', border: '1px solid #ffcdd2', borderRadius: '6px',
                padding: '12px', marginBottom: '20px', color: '#c62828', fontSize: '13px'
              }}>{error}</div>
            )}

            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
              {[
                { label: 'FULL NAME *',     key: 'passengerName',  type: 'text',  ph: 'Enter full name' },
                { label: 'EMAIL ADDRESS *', key: 'passengerEmail', type: 'email', ph: 'Ticket will be emailed here' },
                { label: 'PHONE NUMBER *',  key: 'passengerPhone', type: 'tel',   ph: 'Enter phone number' }
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '12px', color: '#666', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={form[f.key]}
                    placeholder={f.ph}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              ))}

              <div>
                <label style={{ fontSize: '12px', color: '#666', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  NUMBER OF PASSENGERS / ROOMS
                </label>
                <select
                  value={form.passengers}
                  onChange={e => setForm(prev => ({ ...prev, passengers: e.target.value }))}
                  style={inputStyle}>
                  {[1,2,3,4,5,6].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Person / Room' : 'People / Rooms'}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price summary */}
            <div style={{ background: '#f5f7fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                <span>₹{pricePerUnit.toLocaleString()} × {form.passengers} ({unitLabel})</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', fontWeight: '700',
                fontSize: '16px', color: '#003580', borderTop: '1px solid #ddd', paddingTop: '10px'
              }}>
                <span>Total Amount</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={onSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '15px',
                background: loading ? '#aaa' : '#003580',
                color: 'white', border: 'none', borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '700', fontSize: '15px'
              }}>
              {loading ? 'Booking...' : '✅ Confirm & Send Ticket to Email'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '11px', color: '#999', marginTop: '10px' }}>
              Ticket will be emailed to you instantly after confirmation
            </p>
          </>
        ) : (
          /* ── Success ───────────────────────────────────────────────────── */
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={64} color="#22c55e" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
              Booking Confirmed! 🎉
            </h2>
            <p style={{ color: '#666', marginBottom: '25px' }}>
              Ticket sent to <strong>{form.passengerEmail}</strong>
            </p>

            {ticket && (
              <div style={{
                background: '#f5f7fa', borderRadius: '10px', padding: '20px',
                textAlign: 'left', marginBottom: '25px', border: '2px dashed #003580'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <span style={{
                    fontSize: '13px', color: '#003580', fontWeight: '700',
                    background: '#e8f0fe', padding: '5px 15px', borderRadius: '20px'
                  }}>
                    🎟 TICKET: {ticket.ticketId || ticket.id}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                  {[
                    ['Passenger',    form.passengerName],
                    ['Passengers',   form.passengers],
                    ['From',         searchParams.source || ticket.source || '—'],
                    ['To',           searchParams.destination || ticket.destination || '—'],
                    ['Date',         searchParams.travelDate || ticket.travelDate || '—'],
                    ['Status',       ticket.status || 'CONFIRMED'],
                    ['Type',         ticket.bookingType || '—'],
                    ['Amount Paid',  `₹${(pricePerUnit * parseInt(form.passengers)).toLocaleString()}`]
                  ].map(([label, val]) => (
                    <div key={label}>
                      <span style={{ color: '#666', display: 'block', marginBottom: '2px' }}>{label}</span>
                      <strong style={{ color: label === 'Amount Paid' ? '#003580' : '#0f172a' }}>{val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { onClose(); window.location.href = '/profile'; }}
                style={{
                  flex: 1, padding: '12px', background: '#003580', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px'
                }}>
                View My Tickets
              </button>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: '12px', background: 'white', color: '#003580',
                  border: '1px solid #003580', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px'
                }}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}