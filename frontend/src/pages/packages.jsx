import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Clock, Users, Heart, X, CheckCircle2, XCircle, AlertCircle, WifiOff } from 'lucide-react';
import RazorpayMockModal from '../components/common/Razorpaymockmodal.jsx';
import Footer from '../components/common/Footer.jsx';
import xyza from '../assets/holiday.png';

const API = 'https://travel-planner-cf8s.onrender.com';

const inputStyle = {
  width: '100%', padding: '12px', border: '1px solid #ddd',
  borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box',
};

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

const HolidayPackagesPage = () => {
  const navigate = useNavigate();

  const [destination, setDestination]       = useState('');
  const [departureDate, setDepartureDate]   = useState('');
  const [duration, setDuration]             = useState('7');
  const [travelers, setTravelers]           = useState('2');
  const [packages, setPackages]             = useState([]);
  const [loading, setLoading]               = useState(false);
  const [searched, setSearched]             = useState(false);
  const [fetchError, setFetchError]         = useState('');
  const [selectedSort, setSelectedSort]     = useState('popularity');
  const [favorites, setFavorites]           = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [priceRange, setPriceRange]         = useState({ min: 0, max: 500000 });
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Booking state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingPkg, setBookingPkg]             = useState(null);
  const [bookingForm, setBookingForm]           = useState({
    passengerName: '', passengerEmail: '', passengerPhone: '', passengers: '2',
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingTicket, setBookingTicket]   = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError]     = useState('');

  // ── Fetch packages ───────────────────────────────────────────────────────
  const fetchPackages = useCallback(async (dest) => {
    setLoading(true);
    setFetchError('');
    try {
      const url = dest && dest.trim()
        ? `${API}/api/packages/search?destination=${encodeURIComponent(dest)}`
        : `${API}/api/packages`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server error: ${res.status} ${res.statusText}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.content || []);
      setPackages(list);
      if (list.length === 0) setFetchError('No packages found. Try a different destination.');
    } catch (err) {
      console.error('Packages fetch error:', err);
      setPackages([]);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setFetchError('Cannot connect to server. Please make sure the backend is running on port 8082.');
      } else {
        setFetchError(`Failed to load packages: ${err.message}`);
      }
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  useEffect(() => {
    fetch(`${API}/api/packages`)
      .then(res => res.json())
      .then(data => {
        const mixedFive = data
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);
        setPackages(mixedFive);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPackages(destination);
  };

  const getList = str =>
    typeof str === 'string' ? str.split(',').map(s => s.trim()) : (str || []);

  const filtered = [...packages].filter(p => {
    if (selectedFilters.luxury    && p.category !== 'Luxury')   return false;
    if (selectedFilters.budget    && p.price > 50000)            return false;
    if (selectedFilters.adventure && p.category !== 'Adventure') return false;
    if (selectedFilters.family    && p.type !== 'family')        return false;
    return p.price >= priceRange.min && p.price <= priceRange.max;
  }).sort((a, b) => {
    if (selectedSort === 'price')  return a.price - b.price;
    if (selectedSort === 'rating') return b.rating - a.rating;
    return (b.reviews || 0) - (a.reviews || 0);
  });

  const discountPct = p =>
    p.originalPrice && p.originalPrice > p.price
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;

  // ── STEP 1: Open booking form ────────────────────────────────────────────
  const handleBookNow = (e, pkg) => {
    if (e) e.stopPropagation();

    const token = localStorage.getItem('token');
    console.log('Token in localStorage:', token); // Debug: remove in production

    if (!isLoggedIn()) {
      alert('Please login first to book a package.');
      navigate('/login');
      return;
    }

    const user = getUser();
    setBookingPkg(pkg);
    setBookingForm({
      passengerName:  user?.name  || '',
      passengerEmail: user?.email || '',
      passengerPhone: user?.phone || '',
      passengers: travelers,
    });
    setBookingSuccess(false);
    setBookingTicket(null);
    setBookingError('');
    setSelectedPackage(null);
    setShowBookingModal(true);
  };

  // ── STEP 2: Validate → open payment ─────────────────────────────────────
  const handleBookingSubmit = useCallback(() => {
    if (!bookingForm.passengerName.trim())  { setBookingError('Please enter your full name.'); return; }
    if (!bookingForm.passengerEmail.trim()) { setBookingError('Please enter your email address.'); return; }
    if (!bookingForm.passengerPhone.trim()) { setBookingError('Please enter your phone number.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingForm.passengerEmail)) { setBookingError('Please enter a valid email.'); return; }
    setBookingError('');
    setShowBookingModal(false);
    setShowPaymentModal(true);
  }, [bookingForm]);

  // ── STEP 3: Payment success → confirm in backend ─────────────────────────
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          bookingType:    'PACKAGE',
          packageId:      bookingPkg.id,
          passengerName:  bookingForm.passengerName,
          passengerEmail: bookingForm.passengerEmail,
          passengerPhone: bookingForm.passengerPhone,
          passengers:     parseInt(bookingForm.passengers),
          destination:    bookingPkg.location,
          travelDate:     departureDate,
          totalAmount:    bookingPkg.price * parseInt(bookingForm.passengers),
          paymentStatus:  'PAID',
        }),
      });

      if (res.status === 401) {
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
      if (err.message.includes('Session expired')) {
        setTimeout(() => { setShowBookingModal(false); navigate('/login'); }, 2000);
      } else {
        setShowBookingModal(true);
      }
    } finally {
      setBookingLoading(false);
    }
  }, [bookingPkg, bookingForm, departureDate, navigate]);

  const handlePaymentClose = useCallback(() => {
    setShowPaymentModal(false);
    setShowBookingModal(true);
  }, []);

  return (
    <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header style={{ background: 'linear-gradient(135deg,#ffffff,#f8f9fb)', borderBottom: '1px solid #e8ecf1', padding: '16px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '28px', fontWeight: 'bold', color: '#003580', marginBottom: '20px' }}>
            <img src={xyza} alt="Holiday Packages Logo" style={{ width: '62px', height: '62px', objectFit: 'contain' }} /> Holiday Packages
          </div>
          <form onSubmit={handleSearch} style={{ background: 'white', borderRadius: '8px', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto', gap: '15px', alignItems: 'end', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '5px' }}>DESTINATION</label>
              <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '5px' }}>DEPARTURE</label>
              <input type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '5px' }}>DURATION</label>
              <select value={duration} onChange={e => setDuration(e.target.value)} style={inputStyle}>
                <option value="3">3 Days</option><option value="5">5 Days</option>
                <option value="7">7 Days</option><option value="10">10 Days</option><option value="14">14 Days</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '5px' }}>TRAVELERS</label>
              <select value={travelers} onChange={e => setTravelers(e.target.value)} style={inputStyle}>
                <option value="1">1 Person</option><option value="2">2 People</option>
                <option value="4">4 People</option><option value="6">6 People</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '5px' }}>BUDGET</label>
              <select onChange={e => { const [mn, mx] = e.target.value.split('-'); setPriceRange({ min: parseInt(mn), max: parseInt(mx) }); }} style={inputStyle}>
                <option value="0-500000">All Budgets</option>
                <option value="0-30000">₹0 - ₹30K</option>
                <option value="30000-50000">₹30K - ₹50K</option>
                <option value="50000-100000">₹50K - ₹1L</option>
                <option value="100000-500000">₹1L+</option>
              </select>
            </div>
            <button type="submit" disabled={loading} style={{ padding: '12px 30px', background: loading ? '#7a9bca' : '#003580', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px' }}>
              {loading ? 'SEARCHING...' : 'SEARCH'}
            </button>
          </form>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 20px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' }}>
        <aside style={{ background: 'white', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Filters</h3>
          {[{ id: 'luxury', label: 'Luxury' }, { id: 'budget', label: 'Budget Friendly' }, { id: 'adventure', label: 'Adventure' }, { id: 'family', label: 'Family' }].map(f => (
            <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '10px', fontSize: '13px' }}>
              <input type="checkbox" checked={selectedFilters[f.id] || false}
                onChange={() => setSelectedFilters(p => ({ ...p, [f.id]: !p[f.id] }))} />
              {f.label}
            </label>
          ))}
        </aside>

        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
              {loading ? 'Searching...' : searched ? `${filtered.length} Packages Found` : 'Search for packages'}
            </h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#666' }}>Sort by:</span>
              <select value={selectedSort} onChange={e => setSelectedSort(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>
                <option value="popularity">Popularity</option>
                <option value="price">Price (Low to High)</option>
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

          {loading && (
            <div>
              <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: '300px', borderRadius: '8px', marginBottom: '20px', background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              ))}
            </div>
          )}

          {!loading && searched && filtered.length === 0 && !fetchError && (
            <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '8px' }}>
              <AlertCircle size={48} style={{ margin: '0 auto 15px', color: '#999' }} />
              <p>No packages found. Try different search terms.</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '20px' }}>
            {!loading && filtered.map(pkg => (
              <div key={pkg.id} onClick={() => setSelectedPackage(pkg)} style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e8ecf1', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                  {pkg.image && <img src={pkg.image} alt={pkg.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    onError={e => { e.target.style.display = 'none'; }} />}
                  {discountPct(pkg) > 0 && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#ff4757', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>-{discountPct(pkg)}%</div>
                  )}
                  {pkg.category && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.95)', padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', color: '#003580' }}>{pkg.category}</div>
                  )}
                  <button onClick={e => { e.stopPropagation(); setFavorites(p => ({ ...p, [pkg.id]: !p[pkg.id] })); }}
                    style={{ position: 'absolute', bottom: '15px', right: '15px', width: '44px', height: '44px', background: 'white', border: '2px solid #ff4757', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Heart size={22} fill={favorites[pkg.id] ? '#ff4757' : 'none'} color="#ff4757" />
                  </button>
                </div>
                <div style={{ padding: '15px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>{pkg.name}</h3>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666', marginBottom: '10px' }}><MapPin size={14} />{pkg.location}</p>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', background: '#f5f5f5', padding: '4px 8px', borderRadius: '3px', color: '#666' }}>
                      <Clock size={12} />{pkg.duration?.split(' / ')[0] || pkg.duration}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', background: '#f5f5f5', padding: '4px 8px', borderRadius: '3px', color: '#666' }}>
                      <Users size={12} />{pkg.travelers}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < Math.floor(pkg.rating) ? '#fbbf24' : '#e5e7eb'} color={i < Math.floor(pkg.rating) ? '#fbbf24' : '#d1d5db'} />)}
                    <span style={{ fontSize: '12px', color: '#666' }}>{pkg.rating} ({pkg.reviews})</span>
                  </div>
                  <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      {pkg.originalPrice && <span style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through', display: 'block' }}>₹{pkg.originalPrice.toLocaleString()}</span>}
                      <span style={{ fontSize: '18px', fontWeight: '700', color: '#003580' }}>₹{pkg.price?.toLocaleString()}</span>
                      <p style={{ fontSize: '10px', color: '#666' }}>per person</p>
                    </div>
                    <button onClick={e => handleBookNow(e, pkg)} style={{ padding: '8px 16px', background: '#003580', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>Book Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* ── Package Detail Modal ─────────────────────────────────────────────── */}
      {selectedPackage && (
        <div onClick={() => setSelectedPackage(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '8px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setSelectedPackage(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'white', border: '1px solid #ddd', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}><X size={20} /></button>
            {selectedPackage.image && <img src={selectedPackage.image} alt={selectedPackage.name} style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }} onError={e => { e.target.style.display = 'none'; }} />}
            <div style={{ padding: '25px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '10px' }}>{selectedPackage.name}</h2>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <span style={{ fontSize: '13px', background: '#003580', color: 'white', padding: '6px 12px', borderRadius: '4px', fontWeight: '600' }}>{selectedPackage.duration}</span>
                {selectedPackage.bestSeason && <span style={{ fontSize: '13px', background: '#f0f0f0', color: '#666', padding: '6px 12px', borderRadius: '4px' }}>{selectedPackage.bestSeason}</span>}
                <span style={{ fontSize: '13px', background: '#f0f0f0', color: '#666', padding: '6px 12px', borderRadius: '4px' }}>{selectedPackage.location}</span>
              </div>
              {selectedPackage.fullDescription && <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', marginBottom: '20px' }}>{selectedPackage.fullDescription}</p>}
              {selectedPackage.highlights && (
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f7fa', borderRadius: '4px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>Package Highlights</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {getList(selectedPackage.highlights).map((h, i) => (
                      <span key={i} style={{ fontSize: '12px', background: 'white', padding: '6px 12px', borderRadius: '20px', color: '#003580', fontWeight: '600' }}>⭐ {h}</span>
                    ))}
                  </div>
                </div>
              )}
              {(selectedPackage.inclusions || selectedPackage.exclusions) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                  {selectedPackage.inclusions && (
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#28a745', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} /> Inclusions</h4>
                      <ul style={{ fontSize: '12px', color: '#666', lineHeight: '1.8', paddingLeft: '0', listStyle: 'none' }}>
                        {getList(selectedPackage.inclusions).map((inc, i) => <li key={i} style={{ marginBottom: '6px' }}>✓ {inc}</li>)}
                      </ul>
                    </div>
                  )}
                  {selectedPackage.exclusions && (
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#ff4757', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><XCircle size={18} /> Exclusions</h4>
                      <ul style={{ fontSize: '12px', color: '#999', lineHeight: '1.8', paddingLeft: '0', listStyle: 'none' }}>
                        {getList(selectedPackage.exclusions).map((exc, i) => <li key={i} style={{ marginBottom: '6px' }}>✗ {exc}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              <div style={{ padding: '20px', background: '#f0f7ff', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Total Price Per Person</p>
                  {selectedPackage.originalPrice && <span style={{ fontSize: '14px', color: '#999', textDecoration: 'line-through', display: 'block' }}>₹{selectedPackage.originalPrice.toLocaleString()}</span>}
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#003580' }}>₹{selectedPackage.price?.toLocaleString()}</span>
                </div>
                <button onClick={e => handleBookNow(e, selectedPackage)} style={{ padding: '12px 30px', background: '#003580', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>BOOK NOW</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 1: Booking Modal ─────────────────────────────────────────────── */}
      {showBookingModal && bookingPkg && (
        <div onClick={() => !bookingSuccess && !bookingLoading && setShowBookingModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px', overflowY: 'auto' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '12px', maxWidth: '520px', width: '100%', padding: '35px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            {!bookingSuccess ? (
              <>
                <button onClick={() => setShowBookingModal(false)} disabled={bookingLoading}
                  style={{ position: 'absolute', top: '15px', right: '15px', background: 'white', border: '1px solid #ddd', borderRadius: '50%', width: '36px', height: '36px', cursor: bookingLoading ? 'not-allowed' : 'pointer', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '5px' }}>Traveler Details</h2>
                <p style={{ color: '#666', fontSize: '13px', marginBottom: '25px' }}>{bookingPkg.name} • {bookingPkg.location}</p>
                {bookingError && (
                  <div style={{ background: '#fff0f0', border: '1px solid #ffcdd2', borderRadius: '6px', padding: '12px', marginBottom: '20px', color: '#c62828', fontSize: '13px' }}>{bookingError}</div>
                )}
                {bookingLoading && (
                  <div style={{ background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '12px', marginBottom: '20px', color: '#1e40af', fontSize: '13px', textAlign: 'center' }}>Confirming your booking...</div>
                )}
                <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
                  {[
                    { label: 'FULL NAME *',        key: 'passengerName',  type: 'text',  placeholder: 'Enter full name' },
                    { label: 'EMAIL ADDRESS *',     key: 'passengerEmail', type: 'email', placeholder: 'Confirmation will be emailed here' },
                    { label: 'PHONE NUMBER *',      key: 'passengerPhone', type: 'tel',   placeholder: 'Enter phone number' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ fontSize: '12px', color: '#666', fontWeight: '600', display: 'block', marginBottom: '6px' }}>{field.label}</label>
                      <input type={field.type} value={bookingForm[field.key]} placeholder={field.placeholder}
                        onChange={e => setBookingForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                        style={{ ...inputStyle, borderRadius: '6px' }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: '12px', color: '#666', fontWeight: '600', display: 'block', marginBottom: '6px' }}>NUMBER OF TRAVELERS</label>
                    <select value={bookingForm.passengers} onChange={e => setBookingForm(prev => ({ ...prev, passengers: e.target.value }))}
                      style={{ ...inputStyle, borderRadius: '6px' }}>
                      {[1, 2, 4, 6].map(n => <option key={n} value={n}>{n} Person{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ background: '#f5f7fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                    <span>₹{bookingPkg.price?.toLocaleString()} × {bookingForm.passengers} person(s)</span>
                    <span>₹{(bookingPkg.price * parseInt(bookingForm.passengers)).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '16px', color: '#003580', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                    <span>Total Amount</span>
                    <span>₹{(bookingPkg.price * parseInt(bookingForm.passengers)).toLocaleString()}</span>
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
                <p style={{ color: '#666', marginBottom: '25px' }}>Confirmation sent to <strong>{bookingForm.passengerEmail}</strong></p>
                {bookingTicket && (
                  <div style={{ background: '#f5f7fa', borderRadius: '10px', padding: '20px', textAlign: 'left', marginBottom: '25px', border: '2px dashed #003580' }}>
                    <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                      <span style={{ fontSize: '13px', color: '#003580', fontWeight: '700', background: '#e8f0fe', padding: '5px 15px', borderRadius: '20px' }}>
                        🎟 BOOKING: {bookingTicket.ticketId || bookingTicket.id}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                      {[
                        ['Traveler',     bookingForm.passengerName],
                        ['Travelers',    bookingForm.passengers],
                        ['Package',      bookingPkg.name],
                        ['Destination',  bookingPkg.location],
                        ['Departure',    departureDate || '—'],
                        ['Duration',     bookingPkg.duration],
                        ['Status',       'CONFIRMED ✅'],
                        ['Amount Paid',  `₹${(bookingPkg.price * parseInt(bookingForm.passengers)).toLocaleString()}`],
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
                    View My Bookings
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

      {/* ── STEP 2: Razorpay Payment Modal ─────────────────────────────────────── */}
      <RazorpayMockModal
        show={showPaymentModal}
        onClose={handlePaymentClose}
        amount={bookingPkg ? bookingPkg.price * parseInt(bookingForm.passengers || 1) : 0}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <Footer />
    </div>
  );
};

export default HolidayPackagesPage;