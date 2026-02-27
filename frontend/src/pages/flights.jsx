import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, AlertCircle } from 'lucide-react';
import BookingModal from '../components/common/BookingModal';
import RazorpayMockModal from '../components/common/Razorpaymockmodal.jsx';
import Footer from '../components/common/Footer.jsx';
import xyz from '../assets/xyz.jpg';

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

const FlightBookingPage = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useState({
    tripType: 'oneway',
    from: '',
    to: '',
    departure: '2026-02-10',
    return: '',
    passengers: 1,
    class: 'economy',
  });

  const [flights, setFlights]               = useState([]);
  const [loading, setLoading]               = useState(false);
  const [showResults, setShowResults]       = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedSort, setSelectedSort]     = useState('cheapest');
  const [favorites, setFavorites]           = useState({});
  const [appliedFilters, setAppliedFilters] = useState({
    nonStop: false, refundable: false, priceRange: [0, 20000],timeOfDay: []
  });
const getTimeCategory = (time) => {
  if (!time) return null;

  const hour = parseInt(time.split(':')[0]);

  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};
  const today = new Date();
  const dates = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i); return d;
  }), []); // eslint-disable-line
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const formatDate = useCallback(d =>
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), []);

  // ── Booking state ─────────────────────────────────────────────────────────
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingFlight, setBookingFlight]       = useState(null);
  const [bookingForm, setBookingForm]           = useState({
    passengerName: '', passengerEmail: '', passengerPhone: '', passengers: '1'
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingTicket, setBookingTicket]   = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError]     = useState('');

  // ── Core fetch ────────────────────────────────────────────────────────────
  const fetchFlights = useCallback(async (from, to) => {
  if (!from || !to) return;

  setLoading(true);
  try {
    const res = await fetch(
      `${API}/api/flights/search?source=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`
    );

    if (!res.ok) {
      console.log("Search failed:", res.status);
      return;
    }

    const data = await res.json();
    setFlights(data);
    setShowResults(true);

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}, []);
 useEffect(() => {
  if (searchParams.from && searchParams.to) {
    fetchFlights(searchParams.from, searchParams.to);
  }
}, []);
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    fetchFlights(searchParams.from, searchParams.to);
  }, [fetchFlights, searchParams.from, searchParams.to]);

  // ── Filter + sort ─────────────────────────────────────────────────────────
  const sortedFlights = useMemo(() => {
    const filtered = flights.filter(f => {
      if (appliedFilters.nonStop && f.stops > 0) return false;
      if (appliedFilters.refundable && !f.refundable) return false;
      if (f.price < appliedFilters.priceRange[0] || f.price > appliedFilters.priceRange[1]) return false;
      if (appliedFilters.timeOfDay.length > 0) {
      const category = getTimeCategory(f.departureTime);
      if (!appliedFilters.timeOfDay.includes(category)) return false;
    }
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (selectedSort === 'cheapest') return a.price - b.price;
      if (selectedSort === 'fastest')  return (a.durationMinutes || 0) - (b.durationMinutes || 0);
      return 0;
    });
  }, [flights, appliedFilters, selectedSort]);

  const priceStats = useMemo(() => ({
    cheapest: flights.length ? Math.min(...flights.map(f => f.price)) : 0,
    fastest:  flights.length ? Math.min(...flights.map(f => f.durationMinutes || 999)) : 0
  }), [flights]);

  const toggleFavorite = useCallback((flightId) => {
    setFavorites(prev => ({ ...prev, [flightId]: !prev[flightId] }));
  }, []);

  // ── STEP 1: Open passenger details form ───────────────────────────────────
  const handleBookNow = useCallback((e, flight) => {
    e.stopPropagation();

    const token = localStorage.getItem('token');
    console.log('Token in localStorage:', token); // Debug: remove in production

    if (!isLoggedIn()) {
      alert('Please login first to book a flight.');
      navigate('/login');
      return;
    }

    const user = getUser();
    setBookingFlight(flight);
    setBookingForm({
      passengerName:  user?.name  || '',
      passengerEmail: user?.email || '',
      passengerPhone: user?.phone || '',
      passengers: '1'
    });
    setBookingSuccess(false);
    setBookingTicket(null);
    setBookingError('');
    setSelectedFlight(null);
    setShowBookingModal(true);
  }, [navigate]);

  // ── STEP 2: Validate form → open payment modal ────────────────────────────
  const handleBookingSubmit = useCallback(() => {
    if (!bookingForm.passengerName || !bookingForm.passengerEmail || !bookingForm.passengerPhone) {
      setBookingError('Please fill in all passenger details.');
      return;
    }
    setBookingError('');
    setShowBookingModal(false);
    setShowPaymentModal(true);
  }, [bookingForm]);

  // ── STEP 3: Payment success → confirm booking in backend ──────────────────
  const handlePaymentSuccess = useCallback(async () => {
    setShowPaymentModal(false);
    setBookingLoading(true);
    setBookingError('');
    try {
      const token = localStorage.getItem('token');

      if (!isLoggedIn()) {
        throw new Error('Session expired. Please login again.');
      }

      const res = await fetch(`${API}/api/bookings/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          bookingType:    'FLIGHT',
          flightId:       bookingFlight.id,
          passengerName:  bookingForm.passengerName,
          passengerEmail: bookingForm.passengerEmail,
          passengerPhone: bookingForm.passengerPhone,
          passengers:     parseInt(bookingForm.passengers),
          source:         searchParams.from,
          destination:    searchParams.to,
          travelDate:     searchParams.departure,
          cabinClass:     searchParams.class,
          totalAmount:    bookingFlight.price * parseInt(bookingForm.passengers),
          paymentStatus:  'PAID',
        })
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expired. Please login again.');
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Booking failed');
      }

      const ticket = await res.json();
      setBookingTicket(ticket);
      setBookingSuccess(true);
      setShowBookingModal(true);
    } catch (err) {
      setBookingError(err.message || 'Booking confirmation failed. Please contact support.');
      if (err.message.includes('Session expired')) {
        setTimeout(() => { setShowBookingModal(false); navigate('/login'); }, 2000);
      } else {
        setShowBookingModal(true);
      }
    } finally {
      setBookingLoading(false);
    }
  }, [bookingFlight, bookingForm, searchParams, navigate]);

  const handlePaymentClose = useCallback(() => {
    setShowPaymentModal(false);
    setShowBookingModal(true);
  }, []);

  return (
    <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%)', borderBottom: '1px solid #e8ecf1', padding: '16px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '28px', fontWeight: 'bold', color: '#003580', marginBottom: '20px' }}>
            <img src={xyz} alt="Flight Booking Logo" style={{ width: '62px', height: '62px', objectFit: 'contain' }} />
            Flight Booking
          </div>

          <form onSubmit={handleSearch} style={{ background: 'white', borderRadius: '8px', padding: '20px', display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr 1fr 1fr auto', gap: '15px', alignItems: 'end', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['oneway','roundtrip','multicity'].map(t => (
                <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '13px' }}>
                  <input type="radio" name="tripType" value={t} checked={searchParams.tripType === t}
                    onChange={e => setSearchParams(prev => ({ ...prev, tripType: e.target.value }))} />
                  {t === 'oneway' ? 'One Way' : t === 'roundtrip' ? 'Round Trip' : 'Multi City'}
                </label>
              ))}
            </div>

            {[
              { label: 'FROM',   key: 'from',      type: 'text' },
              { label: 'TO',     key: 'to',        type: 'text' },
              { label: 'DEPART', key: 'departure', type: 'date' }
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '5px' }}>{f.label}</label>
                <input type={f.type} value={searchParams[f.key]}
                  onChange={e => setSearchParams(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
            ))}

            {searchParams.tripType === 'roundtrip' && (
              <div>
                <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '5px' }}>RETURN</label>
                <input type="date" value={searchParams.return}
                  onChange={e => setSearchParams(prev => ({ ...prev, return: e.target.value }))}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
            )}

            <div>
              <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '5px' }}>PASSENGER & CLASS</label>
              <select value={`${searchParams.passengers}-${searchParams.class}`}
                onChange={e => { const [p, c] = e.target.value.split('-'); setSearchParams(prev => ({ ...prev, passengers: parseInt(p), class: c })); }}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}>
                <option value="1-economy">1 Adult, Economy</option>
                <option value="1-premium">1 Adult, Premium</option>
                <option value="2-economy">2 Adults, Economy</option>
                <option value="2-business">2 Adults, Business</option>
              </select>
            </div>

            <button type="submit" disabled={loading} style={{ padding: '12px 30px', background: loading ? '#7a9bca' : '#003580', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px' }}>
              {loading ? 'SEARCHING...' : 'SEARCH'}
            </button>
          </form>
        </div>
      </header>

      {/* ── Results ────────────────────────────────────────────────────────── */}
      {showResults && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 20px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' }}>
          <aside style={{ background: 'white', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Applied Filters</h3>
            {[
              { key: 'nonStop',    label: 'Non Stop',         price: priceStats.cheapest > 0 ? `₹${priceStats.cheapest.toLocaleString()}` : '' },
              { key: 'refundable', label: 'Refundable Fares', price: '' }
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                  <input type="checkbox" checked={appliedFilters[f.key]}
                    onChange={e => setAppliedFilters(prev => ({ ...prev, [f.key]: e.target.checked }))} />
                  <span>{f.label}</span>
                  {f.price && <span style={{ marginLeft: 'auto', color: '#666', fontSize: '13px' }}>{f.price}</span>}
                </label>
              </div>
            ))}
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginTop: '20px', marginBottom: '12px' }}>Price Range</h4>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="range" min="0" max="20000" value={appliedFilters.priceRange[1]}
                onChange={e => setAppliedFilters(prev => ({ ...prev, priceRange: [0, parseInt(e.target.value)] }))}
                style={{ flex: 1 }} />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>₹{appliedFilters.priceRange[1].toLocaleString()}</span>
            </div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginTop: '20px', marginBottom: '12px' }}>
  Departure Time
</h4>

{[
  { key: 'morning', label: 'Morning (5AM - 12PM)' },
  { key: 'afternoon', label: 'Afternoon (12PM - 5PM)' },
  { key: 'evening', label: 'Evening (5PM - 9PM)' },
  { key: 'night', label: 'Night (9PM - 5AM)' }
].map(t => (
  <div key={t.key} style={{ marginBottom: '10px' }}>
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
      <input
        type="checkbox"
        checked={appliedFilters.timeOfDay.includes(t.key)}
        onChange={(e) => {
          setAppliedFilters(prev => ({
            ...prev,
            timeOfDay: e.target.checked
              ? [...prev.timeOfDay, t.key]
              : prev.timeOfDay.filter(x => x !== t.key)
          }));
        }}
      />
      {t.label}
    </label>
  </div>
))}
          </aside>

          <main>
            

              
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#666' }}>Sort by:</span>
              {[
                { value: 'cheapest',  label: 'CHEAPEST',      sub: priceStats.cheapest > 0 ? `₹${priceStats.cheapest.toLocaleString()}` : '—' },
                { value: 'fastest',   label: 'FASTEST',        sub: `${priceStats.fastest || '—'} min` },
                { value: 'preferred', label: 'YOU MAY PREFER', sub: '—' }
              ].map(o => (
                <button key={o.value} onClick={() => setSelectedSort(o.value)} style={{ padding: '12px 20px', border: selectedSort === o.value ? '2px solid #003580' : '1px solid #ddd', background: selectedSort === o.value ? '#f0f7ff' : 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: selectedSort === o.value ? '#003580' : '#666', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div>{o.label}</div>
                  <div style={{ fontSize: '11px', fontWeight: '400', marginTop: '4px', opacity: '.7' }}>{o.sub}</div>
                </button>
              ))}
            </div>

            {loading && (
              <div>
                <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
                {[1,2,3].map(i => (
                  <div key={i} style={{ height: '130px', borderRadius: '8px', marginBottom: '15px', background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                ))}
              </div>
            )}

            {!loading && sortedFlights.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '8px' }}>
                <AlertCircle size={48} style={{ margin: '0 auto 15px', color: '#999' }} />
                <p style={{ fontSize: '16px', color: '#666' }}>No flights found. Try different cities or dates.</p>
              </div>
            )}

            {!loading && sortedFlights.map(flight => (
              <FlightCard
                key={flight.id}
                flight={flight}
                isSelected={selectedFlight?.id === flight.id}
                isFavorite={!!favorites[flight.id]}
                onSelect={setSelectedFlight}
                onFavorite={toggleFavorite}
                onBookNow={handleBookNow}
              />
            ))}
          </main>
        </div>
      )}

      {/* ── Booking Modal ── */}
      <BookingModal
        show={showBookingModal} onClose={() => setShowBookingModal(false)}
        item={bookingFlight}
        itemLabel={bookingFlight ? `${bookingFlight.airline} ${bookingFlight.flightCode} • ${bookingFlight.departureTime} → ${bookingFlight.arrivalTime}` : ''}
        pricePerUnit={bookingFlight?.price || 0} unitLabel="per seat"
        form={bookingForm} setForm={setBookingForm}
        onSubmit={handleBookingSubmit}
        loading={bookingLoading} error={bookingError} success={bookingSuccess} ticket={bookingTicket}
        searchParams={{ source: searchParams.from, destination: searchParams.to, travelDate: searchParams.departure }}
      />

      {/* ── Razorpay Payment Modal ── */}
      <RazorpayMockModal
        show={showPaymentModal} onClose={handlePaymentClose}
        amount={bookingFlight ? bookingFlight.price * parseInt(bookingForm.passengers || 1) : 0}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <Footer />
    </div>
  );
};

// ── Memoized FlightCard ───────────────────────────────────────────────────────
const FlightCard = React.memo(({ flight, isSelected, isFavorite, onSelect, onFavorite, onBookNow }) => (
  <div onClick={() => onSelect(flight)} style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '15px', cursor: 'pointer', border: isSelected ? '2px solid #003580' : '1px solid #e8ecf1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s' }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'}
  >
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 1fr', gap: '30px', alignItems: 'center' }}>
      <div>
        <div style={{ width: '70px', height: '70px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', overflow: 'hidden' }}>
          {flight.logoUrl
            ? <img src={flight.logoUrl} alt={flight.airline} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '5px' }} />
            : <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#666' }}>{flight.airline?.substring(0,2).toUpperCase()}</span>
          }
        </div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', wordWrap: 'break-word', maxWidth: '80px' }}>{flight.airline}</div>
        <div style={{ fontSize: '11px', color: '#999', marginTop: '3px' }}>{flight.flightCode}</div>
      </div>
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '20px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#333' }}>{flight.departureTime}</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{flight.departureAirport || flight.departureCity}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>{flight.duration}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '6px' }}>
              <div style={{ height: '2px', width: '30px', background: '#ddd' }} />
              <span style={{ fontSize: '14px' }}>✈️</span>
              <div style={{ height: '2px', width: '30px', background: '#ddd' }} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: flight.stops === 0 ? '#28a745' : '#ff6b6b' }}>{flight.stopInfo}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#333' }}>{flight.arrivalTime}</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{flight.arrivalAirport || flight.arrivalCity}</div>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        {flight.originalPrice && <div style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through', marginBottom: '4px' }}>₹{flight.originalPrice.toLocaleString()}</div>}
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#003580', marginBottom: '4px' }}>₹{flight.price.toLocaleString()}</div>
        <div style={{ fontSize: '11px', color: '#999', marginBottom: '12px' }}>/adult</div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={e => { e.stopPropagation(); onFavorite(flight.id); }} style={{ width: '38px', height: '38px', border: '1px solid #ddd', borderRadius: '50%', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={16} fill={isFavorite ? '#ff6b6b' : 'none'} color={isFavorite ? '#ff6b6b' : '#999'} />
          </button>
          <button onClick={e => onBookNow(e, flight)} style={{ padding: '10px 16px', background: '#003580', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
            BOOK NOW
          </button>
        </div>
      </div>
    </div>
    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ fontSize: '11px', color: '#666' }}>
        {flight.refundable && <span style={{ color: '#28a745', fontWeight: '600' }}>✓ Refundable</span>}
      </div>
      <div style={{ fontSize: '11px', color: '#003580', cursor: 'pointer', fontWeight: '600' }}>🔒 Lock this price →</div>
    </div>
  </div>
));

export default FlightBookingPage;