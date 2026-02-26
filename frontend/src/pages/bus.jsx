import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, AlertCircle, CheckCircle2, WifiOff } from 'lucide-react';
import RazorpayMockModal from '../components/common/Razorpaymockmodal.jsx';
import Footer from '../components/common/Footer.jsx';
import asg from '../assets/bus.webp';

const API = 'https://travel-planner-cf8s.onrender.com';

// ── Auth helpers ─────────────────────────────────────────────────────────────
const isLoggedIn = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  console.log("Token:", token);
  console.log("User:", user);

  return !!token && !!user;
};

const getLoggedInUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

// ── Component ────────────────────────────────────────────────────────────────
const BusBookingPage = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useState({
    source: 'New Delhi',
    destination: 'Bengaluru',
    departDate: '2026-02-10',
    busType: 'all',
  });

  const [filteredBuses, setFilteredBuses]           = useState([]);
  const [favorites, setFavorites]                   = useState({});
  const [selectedSort, setSelectedSort]             = useState('cheapest');
  const [selectedFilters, setSelectedFilters]       = useState({ ac: true, nonAc: false, sleeper: false, seater: true });
  const [priceRange, setPriceRange]                 = useState({ min: 0, max: 5000 });
  const [selectedBus, setSelectedBus]               = useState(null);
  const [loading, setLoading]                       = useState(false);
  const [fetchError, setFetchError]                 = useState('');
  const [searchResultsCount, setSearchResultsCount] = useState(0);

  // Booking state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingBus, setBookingBus]             = useState(null);
  const [bookingForm, setBookingForm]           = useState({
    passengerName: '', passengerEmail: '', passengerPhone: '', passengers: '1',
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingTicket, setBookingTicket]   = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError]     = useState('');

  const inputStyle = {
    width: '100%', padding: '12px', border: '1px solid #ddd',
    borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box',
  };

  // ── Fetch buses ─────────────────────────────────────────────────────────────
  const fetchBuses = useCallback(async (source, destination) => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch(
        `${API}/api/buses/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`
      );
      if (!res.ok) throw new Error(`Server error: ${res.status} ${res.statusText}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.content || []);
      setFilteredBuses(list);
      setSearchResultsCount(list.length);
      if (list.length === 0) setFetchError('No buses found for this route. Try different cities.');
    } catch (err) {
      console.error('Bus fetch error:', err);
      setFilteredBuses([]);
      setSearchResultsCount(0);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setFetchError('Cannot connect to server. Please make sure the backend is running on port 8082.');
      } else {
        setFetchError(`Failed to load buses: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuses(searchParams.source, searchParams.destination);
  }, []); // eslint-disable-line

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBuses(searchParams.source, searchParams.destination);
  };

  const toggleFavorite = (id) => setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleFilter   = (filter) => setSelectedFilters(prev => ({ ...prev, [filter]: !prev[filter] }));

  const discountPercent = (bus) => {
    if (!bus.originalPrice || bus.originalPrice <= bus.price) return 0;
    return Math.round(((bus.originalPrice - bus.price) / bus.originalPrice) * 100);
  };

  const getAmenitiesArray = (bus) => {
    if (Array.isArray(bus.amenitiesList)) return bus.amenitiesList;
    if (typeof bus.amenities === 'string' && bus.amenities.trim())
      return bus.amenities.split(',').map(a => a.trim());
    return [];
  };

  // ── STEP 1: Auth check → open booking form ──────────────────────────────────
  const handleBookNowClick = (e, bus) => {
    e.stopPropagation();

    // ✅ Proper login check with JWT expiry validation
    const token = localStorage.getItem('token');
    console.log('Token in localStorage:', token); // Debug: remove in production

    if (!isLoggedIn()) {
      alert('Please login first to book a ticket.');
      navigate('/login');
      return;
    }

    const user = getLoggedInUser();
    setBookingBus(bus);
    setBookingForm({
      passengerName:  user?.name  || '',
      passengerEmail: user?.email || '',
      passengerPhone: user?.phone || '',
      passengers: '1',
    });
    setBookingSuccess(false);
    setBookingTicket(null);
    setBookingError('');
    setSelectedBus(null);
    setShowBookingModal(true);
  };

  // ── STEP 2: Validate form → open payment ────────────────────────────────────
  const handleBookingSubmit = useCallback(() => {
    if (!bookingForm.passengerName.trim()) { setBookingError('Please enter your full name.'); return; }
    if (!bookingForm.passengerEmail.trim()) { setBookingError('Please enter your email address.'); return; }
    if (!bookingForm.passengerPhone.trim()) { setBookingError('Please enter your phone number.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingForm.passengerEmail)) { setBookingError('Please enter a valid email address.'); return; }
    setBookingError('');
    setShowBookingModal(false);
    setShowPaymentModal(true);
  }, [bookingForm]);

  // ── STEP 3: Payment success → confirm booking in backend ────────────────────
  const handlePaymentSuccess = useCallback(async () => {
    setShowPaymentModal(false);
    setBookingLoading(true);
    setBookingError('');
    try {
      const token = localStorage.getItem('token');

      // Guard: if token expired between modal open and payment
      if (!isLoggedIn()) {
        throw new Error('Session expired. Please login again.');
      }

      const res = await fetch(`${API}/api/bookings/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingType:    'BUS',
          busId:          bookingBus.id,
          passengerName:  bookingForm.passengerName,
          passengerEmail: bookingForm.passengerEmail,
          passengerPhone: bookingForm.passengerPhone,
          passengers:     parseInt(bookingForm.passengers),
          travelDate:     searchParams.departDate,
          source:         searchParams.source,
          destination:    searchParams.destination,
          totalAmount:    bookingBus.price * parseInt(bookingForm.passengers),
          paymentStatus:  'PAID',
        }),
      });

      if (res.status === 401) {
        // Token rejected by backend → send user to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expired. Please login again.');
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || `Booking failed (${res.status})`);
      }

      const ticket = await res.json();
      setBookingTicket(ticket);
      setBookingSuccess(true);
      setShowBookingModal(true);
    } catch (err) {
      console.error('Booking error:', err);
      setBookingError(err.message || 'Booking failed. Please try again.');

      // If session expired, redirect to login after showing the error briefly
      if (err.message.includes('Session expired')) {
        setTimeout(() => {
          setShowBookingModal(false);
          navigate('/login');
        }, 2000);
      } else {
        setShowBookingModal(true);
      }
    } finally {
      setBookingLoading(false);
    }
  }, [bookingBus, bookingForm, searchParams, navigate]);

  const handlePaymentClose = useCallback(() => {
    setShowPaymentModal(false);
    setShowBookingModal(true);
  }, []);

  return (
    <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{ background: 'linear-gradient(135deg,#ffffff 0%,#f8f9fb 100%)', borderBottom: '1px solid #e8ecf1', padding: '16px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#003580', marginBottom: '20px' }}>
            <div style={{ width: '50px', height: '50px', backgroundColor: '#003580', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={asg} alt="Bus Logo" style={{ width: '62px', height: '62px', objectFit: 'contain' }} />
            </div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#003580' }}>Bus Tickets</h1>
          </div>

          <form onSubmit={handleSearch} style={{ background: 'white', borderRadius: '8px', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '15px', alignItems: 'end', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            {[
              { label: 'FROM',   name: 'source',      type: 'text', placeholder: 'Departure city' },
              { label: 'TO',     name: 'destination', type: 'text', placeholder: 'Arrival city' },
              { label: 'DATE', name: 'departDate',  type: 'date', placeholder: '' },
            ].map(field => (
              <div key={field.name}>
                <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '5px' }}>{field.label}</label>
                <input type={field.type} name={field.name} value={searchParams[field.name]}
                  onChange={handleSearchChange} placeholder={field.placeholder} style={inputStyle} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '5px' }}>BUS TYPE</label>
              <select name="busType" value={searchParams.busType} onChange={handleSearchChange} style={inputStyle}>
                <option value="all">All Types</option>
                <option value="ac-seater">AC Seater</option>
                <option value="ac-sleeper">AC Sleeper</option>
                <option value="non-ac-seater">Non-AC Seater</option>
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

        {/* Sidebar */}
        <aside style={{ background: 'white', padding: '20px', borderRadius: '8px', height: 'fit-content', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Filters</h3>
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>Bus Type</h4>
            {[{ id: 'ac', label: 'AC' }, { id: 'nonAc', label: 'Non-AC' }, { id: 'sleeper', label: 'Sleeper' }, { id: 'seater', label: 'Seater' }].map(f => (
              <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '10px', fontSize: '13px' }}>
                <input type="checkbox" checked={selectedFilters[f.id] || false} onChange={() => toggleFilter(f.id)} style={{ cursor: 'pointer' }} />
                {f.label}
              </label>
            ))}
          </div>
          <div style={{ marginBottom: '25px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>Price Range</h4>
            <input type="range" min="0" max="5000" step="100" value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
              style={{ width: '100%', cursor: 'pointer' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
              <span>₹{priceRange.min.toLocaleString()}</span>
              <span>₹{priceRange.max.toLocaleString()}</span>
            </div>
          </div>
          <div style={{ paddingTop: '20px', borderTop: '1px solid #eee' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>Departure</h4>
            {['Early Morning (6AM-9AM)', 'Morning (9AM-12PM)', 'Afternoon (12PM-6PM)', 'Evening (6PM-12AM)', 'Night (12AM-6AM)'].map((t, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '10px', fontSize: '13px' }}>
                <input type="checkbox" style={{ cursor: 'pointer' }} />{t}
              </label>
            ))}
          </div>
        </aside>

        {/* Results */}
        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', background: 'white', padding: '20px', borderRadius: '8px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '5px' }}>
                {loading ? 'Searching...' : `${searchResultsCount} Buses Found`}
              </h2>
              <p style={{ color: '#666', fontSize: '13px' }}>
                {searchParams.source} → {searchParams.destination}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Sort by:</span>
              <select value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>
                <option value="cheapest">Price (Low to High)</option>
                <option value="fastest">Duration</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          {/* Error Banner */}
          {fetchError && !loading && (
            <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <WifiOff size={20} color="#856404" />
              <p style={{ margin: 0, color: '#856404', fontSize: '14px' }}>{fetchError}</p>
            </div>
          )}

          <div style={{ display: 'grid', gap: '20px' }}>
            {loading ? (
              <div>
                <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: '160px', borderRadius: '8px', marginBottom: '15px', background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                ))}
              </div>
            ) : filteredBuses.length > 0 ? filteredBuses.map(bus => (
              <div key={bus.id} onClick={() => setSelectedBus(bus)}
                style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e8ecf1', transition: 'all 0.3s', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: bus.image ? 'auto 1fr auto' : '1fr auto', gap: '20px', padding: '20px' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {bus.image && (
                  <div style={{ position: 'relative', width: '180px', height: '120px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={bus.image} alt={bus.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }} />
                    {discountPercent(bus) > 0 && (
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#ff6b6b', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>-{discountPercent(bus)}%</div>
                    )}
                  </div>
                )}
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>{bus.name}</h3>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                    {bus.busType}{bus.seatsLayout && ` • ${bus.seatsLayout} Seating`}{bus.totalSeats && ` • ${bus.totalSeats} Seats`}
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#003580' }}>{bus.departureTime}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>{bus.departureCity}</div>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{bus.duration}</div>
                      <div style={{ borderTop: '1px solid #ddd', width: '100%', margin: '4px 0' }}></div>
                      <div style={{ fontSize: '10px', color: '#999' }}>{bus.distance}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#003580' }}>{bus.arrivalTime}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>{bus.arrivalCity}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {getAmenitiesArray(bus).slice(0, 3).map((a, i) => (
                      <span key={i} style={{ fontSize: '11px', background: '#f0f0f0', color: '#666', padding: '4px 8px', borderRadius: '12px' }}>{a}</span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: '150px' }}>
                  <div>
                    {bus.originalPrice && bus.originalPrice > bus.price && (
                      <div style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through', marginBottom: '4px' }}>₹{bus.originalPrice.toLocaleString()}</div>
                    )}
                    <div style={{ fontSize: '22px', fontWeight: '700', color: '#003580' }}>₹{bus.price?.toLocaleString()}</div>
                    <div style={{ fontSize: '10px', color: '#666' }}>per person</div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(bus.id); }}
                      style={{ width: '40px', height: '40px', border: '1px solid #ddd', borderRadius: '50%', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Heart size={18} fill={favorites[bus.id] ? '#ff6b6b' : 'none'} color={favorites[bus.id] ? '#ff6b6b' : '#999'} />
                    </button>
                    <button onClick={(e) => handleBookNowClick(e, bus)}
                      style={{ flex: 1, padding: '10px', background: '#003580', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            )) : !loading && !fetchError ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666', background: 'white', borderRadius: '8px' }}>
                <AlertCircle size={48} style={{ margin: '0 auto 15px', color: '#999' }} />
                <p style={{ fontSize: '16px' }}>No buses found. Try different search criteria.</p>
              </div>
            ) : null}
          </div>
        </main>
      </div>

      {/* ── Bus Detail Modal ──────────────────────────────────────────────────── */}
      {selectedBus && (
        <div onClick={() => setSelectedBus(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '8px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setSelectedBus(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'white', border: '1px solid #ddd', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>✕</button>
            <div style={{ padding: '30px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', marginBottom: '15px' }}>{selectedBus.name}</h2>
              <div style={{ background: '#f5f7fa', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '30px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#003580' }}>{selectedBus.departureTime}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{selectedBus.departureCity}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{selectedBus.duration}</div>
                    <div style={{ borderTop: '2px solid #003580', margin: '0 20px' }}></div>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>{selectedBus.distance}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#003580' }}>{selectedBus.arrivalTime}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{selectedBus.arrivalCity}</div>
                  </div>
                </div>
              </div>
              {getAmenitiesArray(selectedBus).length > 0 && (
                <div style={{ marginBottom: '25px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>Amenities</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {getAmenitiesArray(selectedBus).map((a, i) => (
                      <span key={i} style={{ fontSize: '12px', background: '#003580', color: 'white', padding: '6px 12px', borderRadius: '20px' }}>{a}</span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#003580', marginBottom: '15px' }}>
                ₹{selectedBus.price?.toLocaleString()} <span style={{ fontSize: '13px', color: '#666', fontWeight: '400' }}>per person</span>
              </div>
              <button onClick={(e) => handleBookNowClick(e, selectedBus)} style={{ width: '100%', padding: '15px', background: '#003580', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>
                PROCEED TO BOOKING
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Booking Modal ─────────────────────────────────────────────────────── */}
      {showBookingModal && bookingBus && (
        <div onClick={() => !bookingSuccess && !bookingLoading && setShowBookingModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px', overflowY: 'auto' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '12px', maxWidth: '520px', width: '100%', padding: '35px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            {!bookingSuccess ? (
              <>
                <button onClick={() => setShowBookingModal(false)} disabled={bookingLoading}
                  style={{ position: 'absolute', top: '15px', right: '15px', background: 'white', border: '1px solid #ddd', borderRadius: '50%', width: '36px', height: '36px', cursor: bookingLoading ? 'not-allowed' : 'pointer', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '5px' }}>Passenger Details</h2>
                <p style={{ color: '#666', fontSize: '13px', marginBottom: '25px' }}>{bookingBus.name} • {bookingBus.departureTime} → {bookingBus.arrivalTime}</p>
                {bookingError && (
                  <div style={{ background: '#fff0f0', border: '1px solid #ffcdd2', borderRadius: '6px', padding: '12px', marginBottom: '20px', color: '#c62828', fontSize: '13px' }}>{bookingError}</div>
                )}
                {bookingLoading && (
                  <div style={{ background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '12px', marginBottom: '20px', color: '#1e40af', fontSize: '13px', textAlign: 'center' }}>Confirming your booking...</div>
                )}
                <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
                  {[
                    { label: 'FULL NAME *',       key: 'passengerName',  type: 'text',  placeholder: 'Enter full name' },
                    { label: 'EMAIL ADDRESS *',    key: 'passengerEmail', type: 'email', placeholder: 'Ticket will be emailed here' },
                    { label: 'PHONE NUMBER *',     key: 'passengerPhone', type: 'tel',   placeholder: 'Enter phone number' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ fontSize: '12px', color: '#666', fontWeight: '600', display: 'block', marginBottom: '6px' }}>{field.label}</label>
                      <input type={field.type} value={bookingForm[field.key]} placeholder={field.placeholder}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                        style={{ ...inputStyle, borderRadius: '6px' }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: '12px', color: '#666', fontWeight: '600', display: 'block', marginBottom: '6px' }}>NUMBER OF PASSENGERS</label>
                    <select value={bookingForm.passengers} onChange={(e) => setBookingForm(prev => ({ ...prev, passengers: e.target.value }))}
                      style={{ ...inputStyle, borderRadius: '6px' }}>
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ background: '#f5f7fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                    <span>₹{bookingBus.price?.toLocaleString()} × {bookingForm.passengers} passenger(s)</span>
                    <span>₹{(bookingBus.price * parseInt(bookingForm.passengers)).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '16px', color: '#003580', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                    <span>Total Amount</span>
                    <span>₹{(bookingBus.price * parseInt(bookingForm.passengers)).toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={handleBookingSubmit} disabled={bookingLoading}
                  style={{ width: '100%', padding: '15px', background: bookingLoading ? '#7a9bca' : '#003580', color: 'white', border: 'none', borderRadius: '6px', cursor: bookingLoading ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '15px' }}>
                  Proceed to Payment →
                </button>
                <p style={{ textAlign: 'center', fontSize: '11px', color: '#999', marginTop: '10px' }}>You'll be taken to secure payment next</p>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <CheckCircle2 size={64} color="#22c55e" style={{ margin: '0 auto 20px' }} />
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Booking Confirmed! 🎉</h2>
                <p style={{ color: '#666', marginBottom: '25px' }}>Ticket sent to <strong>{bookingForm.passengerEmail}</strong></p>
                {bookingTicket && (
                  <div style={{ background: '#f5f7fa', borderRadius: '10px', padding: '20px', textAlign: 'left', marginBottom: '25px', border: '2px dashed #003580' }}>
                    <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                      <span style={{ fontSize: '13px', color: '#003580', fontWeight: '700', background: '#e8f0fe', padding: '5px 15px', borderRadius: '20px' }}>
                        🎟 TICKET: {bookingTicket.ticketId || bookingTicket.id}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                      {[
                        ['Passenger',    bookingForm.passengerName],
                        ['Passengers',   bookingForm.passengers],
                        ['From',         searchParams.source],
                        ['To',           searchParams.destination],
                        ['Departure',    bookingBus.departureTime],
                        ['Date',         searchParams.departDate],
                        ['Bus',          bookingBus.name],
                        ['Status',       'CONFIRMED ✅'],
                        ['Amount Paid',  `₹${(bookingBus.price * parseInt(bookingForm.passengers)).toLocaleString()}`],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <span style={{ color: '#666', display: 'block', marginBottom: '2px' }}>{label}</span>
                          <strong style={{ color: label === 'Amount Paid' || label === 'Status' ? '#003580' : '#0f172a' }}>{val}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => { setShowBookingModal(false); navigate('/profile'); }}
                    style={{ flex: 1, padding: '12px', background: '#003580', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                    View My Tickets
                  </button>
                  <button onClick={() => setShowBookingModal(false)}
                    style={{ flex: 1, padding: '12px', background: 'white', color: '#003580', border: '1px solid #003580', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Razorpay Payment Modal ────────────────────────────────────────────── */}
      <RazorpayMockModal
        show={showPaymentModal}
        onClose={handlePaymentClose}
        amount={bookingBus ? bookingBus.price * parseInt(bookingForm.passengers || 1) : 0}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <Footer />
    </div>
  );
};

export default BusBookingPage;