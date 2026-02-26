import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, AlertCircle } from 'lucide-react';
import BookingModal from '../components/common/BookingModal';
import RazorpayMockModal from '../components/common/Razorpaymockmodal.jsx';
import Footer from '../components/common/Footer.jsx';
import asgs from '../assets/cab.avif';

const API = 'https://travel-planner-cf8s.onrender.com';

// ── Auth helpers ─────────────────────────────────────────────────────────────
const isLoggedIn = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  console.log("Token:", token);
  console.log("User:", user);

  return !!token && !!user;
};

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
};

const CabBookingPage = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useState({
    source: 'Mumbai', destination: 'Pune', departDate: '2026-02-13', passengers: '1'
  });

  const [cabs, setCabs]                   = useState([]);
  const [loading, setLoading]             = useState(false);
  const [searched, setSearched]           = useState(false);
  const [selectedSort, setSelectedSort]   = useState('cheapest');
  const [favorites, setFavorites]         = useState({});
  const [selectedFilters, setSelectedFilters] = useState({ economy: false, sedan: false, suv: false, premium: false });
  const [priceRange, setPriceRange]       = useState({ min: 0, max: 5000 });
  const [selectedCab, setSelectedCab]     = useState(null);

  // Booking state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingCab, setBookingCab]             = useState(null);
  const [bookingForm, setBookingForm]           = useState({ passengerName: '', passengerEmail: '', passengerPhone: '', passengers: '1' });
  const [bookingSuccess, setBookingSuccess]     = useState(false);
  const [bookingTicket, setBookingTicket]       = useState(null);
  const [bookingLoading, setBookingLoading]     = useState(false);
  const [bookingError, setBookingError]         = useState('');

  // ── Auto-load on mount ────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/api/cabs/search?source=${encodeURIComponent(searchParams.source)}&destination=${encodeURIComponent(searchParams.destination)}`)
      .then(r => r.json())
      .then(data => { setCabs(data); setSearched(true); })
      .catch(() => {});
  }, []); // eslint-disable-line

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/api/cabs/search?source=${encodeURIComponent(searchParams.source)}&destination=${encodeURIComponent(searchParams.destination)}`
      );
      if (!res.ok) throw new Error('Search failed');
      setCabs(await res.json());
    } catch (err) { console.error(err); setCabs([]); }
    setSearched(true);
    setLoading(false);
  };

  const filtered = cabs.filter(c => {
    const anyChecked = Object.values(selectedFilters).some(Boolean);
    if (anyChecked) {
      const match = (selectedFilters.economy && c.category === 'economy') ||
                    (selectedFilters.sedan   && c.category === 'sedan')   ||
                    (selectedFilters.suv     && c.category === 'suv')     ||
                    (selectedFilters.premium && c.category === 'premium');
      if (!match) return false;
    }
    return c.price >= priceRange.min && c.price <= priceRange.max;
  }).sort((a, b) => {
    if (selectedSort === 'cheapest') return a.price - b.price;
    if (selectedSort === 'rating')   return b.rating - a.rating;
    return 0;
  });

  const getAmenities = c => typeof c.amenities === 'string' ? c.amenities.split(',').map(a => a.trim()) : (c.amenities || []);
  const discountPct  = c => c.originalPrice && c.originalPrice > c.price ? Math.round(((c.originalPrice - c.price) / c.originalPrice) * 100) : 0;

  // ── STEP 1: Open booking form ─────────────────────────────────────────────
  const handleBookNow = (e, cab) => {
    if (e) e.stopPropagation();

    const token = localStorage.getItem('token');
    console.log('Token in localStorage:', token); // Debug: remove in production

    if (!isLoggedIn()) {
      alert('Please login first to book a cab.');
      navigate('/login');
      return;
    }

    const user = getUser();
    setBookingCab(cab);
    setBookingForm({ passengerName: user?.name || '', passengerEmail: user?.email || '', passengerPhone: user?.phone || '', passengers: searchParams.passengers });
    setBookingSuccess(false); setBookingTicket(null); setBookingError('');
    setSelectedCab(null);
    setShowBookingModal(true);
  };

  // ── STEP 2: Validate → open payment ──────────────────────────────────────
  const handleBookingSubmit = useCallback(() => {
    if (!bookingForm.passengerName || !bookingForm.passengerEmail || !bookingForm.passengerPhone) {
      setBookingError('Please fill in all details.'); return;
    }
    setBookingError('');
    setShowBookingModal(false);
    setShowPaymentModal(true);
  }, [bookingForm]);

  // ── STEP 3: Payment success → confirm in backend ──────────────────────────
  const handlePaymentSuccess = useCallback(async () => {
    setShowPaymentModal(false);
    setBookingLoading(true); setBookingError('');
    try {
      const token = localStorage.getItem('token');

      if (!isLoggedIn()) {
        throw new Error('Session expired. Please login again.');
      }

      const res = await fetch(`${API}/api/bookings/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          bookingType: 'CAB', cabId: bookingCab.id,
          passengerName: bookingForm.passengerName, passengerEmail: bookingForm.passengerEmail,
          passengerPhone: bookingForm.passengerPhone, passengers: parseInt(bookingForm.passengers),
          source: searchParams.source, destination: searchParams.destination,
          travelDate: searchParams.departDate,
          totalAmount: bookingCab.price * parseInt(bookingForm.passengers),
          paymentStatus: 'PAID',
        })
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expired. Please login again.');
      }

      if (!res.ok) throw new Error('Booking failed');
      setBookingTicket(await res.json()); setBookingSuccess(true);
      setShowBookingModal(true);
    } catch (err) {
      setBookingError(err.message || 'Booking failed. Please try again.');
      if (err.message.includes('Session expired')) {
        setTimeout(() => { setShowBookingModal(false); navigate('/login'); }, 2000);
      } else {
        setShowBookingModal(true);
      }
    }
    setBookingLoading(false);
  }, [bookingCab, bookingForm, searchParams, navigate]);

  const handlePaymentClose = useCallback(() => { setShowPaymentModal(false); setShowBookingModal(true); }, []);

  return (
    <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{ background: 'linear-gradient(135deg,#ffffff,#f8f9fb)', borderBottom: '1px solid #e8ecf1', padding: '16px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '28px', fontWeight: 'bold', color: '#003580', marginBottom: '20px' }}>
            <img src={asgs} alt="Cab Rides Logo" style={{ width: '82px', height: '82px', objectFit: 'contain' }} /> Cab Rides
          </div>
          <form onSubmit={handleSearch} style={{ background: 'white', borderRadius: '8px', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '15px', alignItems: 'end', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            {[
              { label: 'FROM', name: 'source',      type: 'text', ph: 'Departure city' },
              { label: 'TO',   name: 'destination', type: 'text', ph: 'Arrival city' },
              { label: 'DATE', name: 'departDate',  type: 'date', ph: '' }
            ].map(f => (
              <div key={f.name}>
                <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '5px' }}>{f.label}</label>
                <input type={f.type} name={f.name} value={searchParams[f.name]} placeholder={f.ph}
                  onChange={e => setSearchParams({ ...searchParams, [f.name]: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '5px' }}>PASSENGERS</label>
              <select name="passengers" value={searchParams.passengers}
                onChange={e => setSearchParams({ ...searchParams, passengers: e.target.value })}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Passenger{n>1?'s':''}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} style={{ padding: '12px 30px', background: loading ? '#7a9bca' : '#003580', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px' }}>
              {loading ? 'SEARCHING...' : 'SEARCH'}
            </button>
          </form>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 20px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' }}>
        <aside style={{ background: 'white', padding: '20px', borderRadius: '8px', height: 'fit-content', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Filters</h3>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>Cab Type</h4>
          {[{ id: 'economy', label: 'Economy' }, { id: 'sedan', label: 'Sedan' }, { id: 'suv', label: 'SUV' }, { id: 'premium', label: 'Premium' }].map(f => (
            <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '10px', fontSize: '13px' }}>
              <input type="checkbox" checked={selectedFilters[f.id]} onChange={() => setSelectedFilters(p => ({ ...p, [f.id]: !p[f.id] }))} />
              {f.label}
            </label>
          ))}
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>Price Range</h4>
            <input type="range" min="0" max="5000" step="100" value={priceRange.max}
              onChange={e => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
              style={{ width: '100%', cursor: 'pointer' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
              <span>₹0</span><span>₹{priceRange.max.toLocaleString()}</span>
            </div>
          </div>
        </aside>

        <main>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '5px' }}>
                {searched ? `${filtered.length} Cabs Found` : 'Loading cabs...'}
              </h2>
              {searched && <p style={{ color: '#666', fontSize: '13px' }}>{searchParams.source} → {searchParams.destination}</p>}
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#666' }}>Sort by:</span>
              <select value={selectedSort} onChange={e => setSelectedSort(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>
                <option value="cheapest">Price (Low to High)</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          {loading && (
            <div>
              <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: '160px', borderRadius: '8px', marginBottom: '15px', background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              ))}
            </div>
          )}

          {!loading && searched && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '8px' }}>
              <AlertCircle size={48} style={{ margin: '0 auto 15px', color: '#999' }} />
              <p>No cabs found. Try different search criteria.</p>
            </div>
          )}

          <div style={{ display: 'grid', gap: '20px' }}>
            {!loading && filtered.map(cab => (
              <div key={cab.id} onClick={() => setSelectedCab(cab)} style={{
                background: 'white', borderRadius: '8px', border: '1px solid #e8ecf1', cursor: 'pointer',
                display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '20px', padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.3s'
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ position: 'relative', width: '180px', height: '120px', borderRadius: '8px', overflow: 'hidden', background: '#f5f5f5' }}>
                  {cab.image && <img src={cab.image} alt={cab.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  {discountPct(cab) > 0 && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#ff6b6b', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>-{discountPct(cab)}%</div>
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>{cab.name}</h3>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>{cab.cabType} • {cab.totalSeats} Seats • {cab.operator}</div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '12px' }}>
                    <div><div style={{ fontSize: '18px', fontWeight: '700', color: '#003580' }}>{cab.departure}</div><div style={{ fontSize: '11px', color: '#999' }}>{cab.departureCity}</div></div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{cab.duration}</div>
                      <div style={{ borderTop: '1px solid #ddd', margin: '4px 0' }}></div>
                      <div style={{ fontSize: '10px', color: '#999' }}>{cab.distance}</div>
                    </div>
                    <div><div style={{ fontSize: '18px', fontWeight: '700', color: '#003580' }}>{cab.arrival}</div><div style={{ fontSize: '11px', color: '#999' }}>{cab.arrivalCity}</div></div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {getAmenities(cab).slice(0,3).map((a,i) => (
                      <span key={i} style={{ fontSize: '11px', background: '#f0f0f0', color: '#666', padding: '4px 8px', borderRadius: '12px' }}>{a}</span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: '150px' }}>
                  <div>
                    {cab.originalPrice && cab.originalPrice > cab.price && (
                      <div style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through', marginBottom: '4px' }}>₹{cab.originalPrice.toLocaleString()}</div>
                    )}
                    <div style={{ fontSize: '22px', fontWeight: '700', color: '#003580' }}>₹{cab.price.toLocaleString()}</div>
                    <div style={{ fontSize: '10px', color: '#666' }}>per seat</div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={e => { e.stopPropagation(); setFavorites(p => ({ ...p, [cab.id]: !p[cab.id] })); }}
                      style={{ width: '40px', height: '40px', border: '1px solid #ddd', borderRadius: '50%', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Heart size={18} fill={favorites[cab.id] ? '#ff6b6b' : 'none'} color={favorites[cab.id] ? '#ff6b6b' : '#999'} />
                    </button>
                    <button onClick={e => handleBookNow(e, cab)} style={{ flex: 1, padding: '10px', background: '#003580', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* ── Cab Detail Modal ────────────────────────────────────────────────── */}
      {selectedCab && (
        <div onClick={() => setSelectedCab(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '8px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setSelectedCab(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'white', border: '1px solid #ddd', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>✕</button>
            <div style={{ padding: '30px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '15px' }}>{selectedCab.name}</h2>
              <div style={{ background: '#f5f7fa', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '30px', alignItems: 'center' }}>
                  <div><div style={{ fontSize: '28px', fontWeight: '700', color: '#003580' }}>{selectedCab.departure}</div><div style={{ fontSize: '12px', color: '#666' }}>{selectedCab.departureCity}</div></div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{selectedCab.duration}</div>
                    <div style={{ borderTop: '2px solid #003580', margin: '0 20px' }}></div>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>{selectedCab.distance}</div>
                  </div>
                  <div><div style={{ fontSize: '28px', fontWeight: '700', color: '#003580' }}>{selectedCab.arrival}</div><div style={{ fontSize: '12px', color: '#666' }}>{selectedCab.arrivalCity}</div></div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '25px' }}>
                {getAmenities(selectedCab).map((a,i) => (
                  <span key={i} style={{ fontSize: '12px', background: '#003580', color: 'white', padding: '6px 12px', borderRadius: '20px' }}>{a}</span>
                ))}
              </div>
              <button onClick={e => handleBookNow(e, selectedCab)} style={{ width: '100%', padding: '15px', background: '#003580', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>
                PROCEED TO BOOKING
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 1: Booking Details Modal ── */}
      <BookingModal
        show={showBookingModal} onClose={() => setShowBookingModal(false)}
        item={bookingCab} itemLabel={bookingCab ? `${bookingCab.name} • ${bookingCab.departureCity} → ${bookingCab.arrivalCity}` : ''}
        pricePerUnit={bookingCab?.price || 0} unitLabel="per seat"
        form={bookingForm} setForm={setBookingForm}
        onSubmit={handleBookingSubmit}
        loading={bookingLoading} error={bookingError} success={bookingSuccess} ticket={bookingTicket}
        searchParams={{ source: searchParams.source, destination: searchParams.destination, travelDate: searchParams.departDate }}
      />

      {/* ── STEP 2: Razorpay Payment Modal ── */}
      <RazorpayMockModal
        show={showPaymentModal} onClose={handlePaymentClose}
        amount={bookingCab ? bookingCab.price * parseInt(bookingForm.passengers || 1) : 0}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <Footer />
    </div>
  );
};

export default CabBookingPage;