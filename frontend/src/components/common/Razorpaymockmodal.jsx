import React, { useState } from 'react';
import upiLogo from "../../assets/upiLogo.jpg";
import gpayLogo from "../../assets/Gpay.png";
import phonepeLogo from "../../assets/phonepe.png";
import paytmLogo from "../../assets/paytm.png";

const CARD_TYPES = {
  visa: { label: 'VISA', color: '#1a1f71', logo: '💳' },
  mastercard: { label: 'Mastercard', color: '#eb001b', logo: '💳' },
  upi: { label: 'UPI', color: '#5f259f', logo: '📱' },
  netbanking: { label: 'Net Banking', color: '#003580', logo: '🏦' },
};

const RazorpayMockModal = ({ show, onClose, amount, onPaymentSuccess }) => {
  const [activeTab, setActiveTab] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry]         = useState('');
  const [cvv, setCvv]               = useState('');
  const [cardName, setCardName]     = useState('');
  const [upiId, setUpiId]           = useState('');
  const [bank, setBank]             = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError]           = useState('');
  const [step, setStep]             = useState('pay'); // 'pay' | 'otp'
  const [otp, setOtp]               = useState('');

  if (!show) return null;

  // ── Format helpers ────────────────────────────────────────────────────────
  const fmtCard   = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExpiry = v => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0,2)}/${d.slice(2)}` : d;
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    if (activeTab === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) return 'Enter a valid 16-digit card number';
      if (expiry.length < 5)  return 'Enter a valid expiry date';
      if (cvv.length < 3)     return 'Enter a valid CVV';
      if (!cardName.trim())   return 'Enter cardholder name';
    }
    if (activeTab === 'upi') {
      if (!upiId.includes('@')) return 'Enter a valid UPI ID (e.g. name@upi)';
    }
    if (activeTab === 'netbanking') {
      if (!bank) return 'Please select a bank';
    }
    return '';
  };

  const handlePay = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    if (activeTab === 'card') {
      // Simulate OTP step for card
      setStep('otp');
    } else {
      processPayment();
    }
  };

  const handleOtp = () => {
    if (otp.length < 4) { setError('Enter a valid OTP'); return; }
    processPayment();
  };

  const processPayment = () => {
    setProcessing(true);
    setError('');
    setTimeout(() => {
      setProcessing(false);
      onPaymentSuccess();
    }, 2000); // Simulate network delay
  };

  const tabStyle = (tab) => ({
    padding: '10px 16px',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid #528ff0' : '2px solid transparent',
    background: 'transparent',
    color: activeTab === tab ? '#528ff0' : '#666',
    fontWeight: activeTab === tab ? '600' : '400',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s',
  });

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border 0.2s',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)'
    }}>
      <div style={{
        background: 'white', borderRadius: '12px', width: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}>

        {/* ── Razorpay Header ── */}
        <div style={{
          background: 'linear-gradient(135deg, #003580 0%, #003580 100%)',
          padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '4px' }}>Paying to</div>
            <div style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>✈ TravelPlanner</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '4px' }}>Amount</div>
            <div style={{ color: 'white', fontSize: '22px', fontWeight: '700' }}>
              ₹{amount?.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Razorpay branding bar */}
        <div style={{
          background: '#f8f9ff', padding: '8px 24px', display: 'flex',
          alignItems: 'center', gap: '6px', borderBottom: '1px solid #eee'
        }}>
          <span style={{ fontSize: '11px', color: '#888' }}>Secured by</span>
          <span style={{ fontWeight: '800', fontSize: '13px', color: '#003580', letterSpacing: '-0.5px' }}>razorpay</span>
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#28a745' }}>🔒 100% Secure</span>
        </div>

        {step === 'otp' ? (
          /* ── OTP Step ── */
          <div style={{ padding: '28px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>📱</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Enter OTP</div>
              <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.5' }}>
                We've sent a 6-digit OTP to your registered mobile number ending in <strong>••••XX</strong>
              </div>
            </div>
            <input
              type="text"
              placeholder="Enter OTP"
              maxLength={6}
              value={otp}
              onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
              style={{ ...inputStyle, textAlign: 'center', letterSpacing: '8px', fontSize: '20px', fontWeight: '700' }}
            />
            {error && <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>{error}</div>}
            <div style={{ fontSize: '12px', color: '#888', textAlign: 'center', marginTop: '10px' }}>
              Didn't receive? <span style={{ color: '#003580', cursor: 'pointer', fontWeight: '600' }}>Resend OTP</span>
            </div>
            <button
              onClick={handleOtp}
              disabled={processing}
              style={{
                width: '100%', marginTop: '20px', padding: '14px',
                background: processing ? '#a0b8e8' : 'linear-gradient(135deg, #003580, #003580)',
                color: 'white', border: 'none', borderRadius: '8px',
                fontWeight: '700', fontSize: '15px', cursor: processing ? 'not-allowed' : 'pointer'
              }}
            >
              {processing ? '⏳ Processing Payment...' : 'Verify & Pay'}
            </button>
          </div>
        ) : (
          /* ── Payment Step ── */
          <div style={{ padding: '0 0 24px' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #eee', padding: '0 24px' }}>
              {[
                { id: 'card', label: '💳 Card' },
                { id: 'upi',  label: '📱 UPI' },
                { id: 'netbanking', label: '🏦 Net Banking' },
              ].map(t => (
                <button key={t.id} onClick={() => { setActiveTab(t.id); setError(''); }} style={tabStyle(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '20px 24px 0' }}>

              {/* ── Card Tab ── */}
              {activeTab === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '6px' }}>CARD NUMBER</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={e => { setCardNumber(fmtCard(e.target.value)); setError(''); }}
                        style={inputStyle}
                      />
                      <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>💳</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '6px' }}>EXPIRY DATE</label>
                      <input
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={e => { setExpiry(fmtExpiry(e.target.value)); setError(''); }}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '6px' }}>CVV</label>
                      <input
                        placeholder="•••"
                        type="password"
                        maxLength={4}
                        value={cvv}
                        onChange={e => { setCvv(e.target.value.replace(/\D/g, '')); setError(''); }}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '6px' }}>NAME ON CARD</label>
                    <input
                      placeholder="John Doe"
                      value={cardName}
                      onChange={e => { setCardName(e.target.value); setError(''); }}
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              {/* ── UPI Tab ── */}
              {activeTab === 'upi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '8px' }}>
                    {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                      <div key={app} onClick={() => setUpiId(`yourname@${app.toLowerCase()}`)} style={{
                        padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px',
                        cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#333',
                        textAlign: 'center', transition: 'all 0.15s',
                        background: upiId.includes(app.toLowerCase()) ? '#f0f7ff' : 'white',
                        borderColor: upiId.includes(app.toLowerCase()) ? '#528ff0' : '#ddd',
                      }}>
                        <div style={{ marginBottom: '6px' }}>
  <img
    src={
      app === "GPay"
        ? gpayLogo
        : app === "PhonePe"
        ? phonepeLogo
        : app === "Paytm"
        ? paytmLogo
        : upiLogo
    }
    alt={app}
    style={{
      width: "40px",
      height: "40px",
      objectFit: "contain"
    }}
  />
</div>
                        {app}
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', color: '#aaa', fontSize: '12px' }}>— or enter UPI ID —</div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '6px' }}>YOUR UPI ID</label>
                    <input
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={e => { setUpiId(e.target.value); setError(''); }}
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              {/* ── Net Banking Tab ── */}
              {activeTab === 'netbanking' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '8px' }}>
                    {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'].map(b => (
                      <div key={b} onClick={() => { setBank(b); setError(''); }} style={{
                        padding: '12px', border: '1px solid #ddd', borderRadius: '8px',
                        cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#333',
                        textAlign: 'center', transition: 'all 0.15s',
                        background: bank === b ? '#f0f7ff' : 'white',
                        borderColor: bank === b ? '#528ff0' : '#ddd',
                      }}>
                        🏦 {b}
                      </div>
                    ))}
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '6px' }}>OR SELECT OTHER BANK</label>
                    <select value={bank} onChange={e => { setBank(e.target.value); setError(''); }} style={inputStyle}>
                      <option value="">-- Select Bank --</option>
                      <option>Bank of Baroda</option>
                      <option>Canara Bank</option>
                      <option>Union Bank</option>
                      <option>Indian Bank</option>
                      <option>Yes Bank</option>
                      <option>IDFC First Bank</option>
                    </select>
                  </div>
                </div>
              )}

              {error && (
                <div style={{
                  marginTop: '12px', padding: '10px 14px', background: '#fff5f5',
                  border: '1px solid #ffcccc', borderRadius: '6px',
                  color: '#e74c3c', fontSize: '13px'
                }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={processing}
                style={{
                  width: '100%', marginTop: '20px', padding: '14px',
                  background: processing ? '#a0b8e8' : 'linear-gradient(135deg, #003580, #003580)',
                  color: 'white', border: 'none', borderRadius: '8px',
                  fontWeight: '700', fontSize: '15px', cursor: processing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(82,143,240,0.4)', transition: 'all 0.2s'
                }}
              >
                {processing ? '⏳ Processing...' : `Pay ₹${amount?.toLocaleString('en-IN')}`}
              </button>

              <div style={{ textAlign: 'center', marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: '#aaa' }}>🔒 256-bit SSL Secured</span>
                <span style={{ color: '#ddd' }}>|</span>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RazorpayMockModal;