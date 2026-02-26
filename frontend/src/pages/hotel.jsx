import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Calendar, Users, Search, Heart, X } from 'lucide-react';
import BookingModal from '../components/common/BookingModal';
import RazorpayMockModal from '../components/common/Razorpaymockmodal.jsx';
import Footer from '../components/common/Footer.jsx';
import xyzs from '../assets/icons.jpg';

const API = 'http://localhost:8082';

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

export default function HotelsPage() {
  const navigate = useNavigate();

  const [destination, setDestination]   = useState('');
  const [checkIn, setCheckIn]           = useState('');
  const [checkOut, setCheckOut]         = useState('');
  const [rooms, setRooms]               = useState('1');
  const [hotels, setHotels]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [searched, setSearched]         = useState(false);
  const [selectedSort, setSelectedSort] = useState('popularity');
  const [favorites, setFavorites]       = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [priceRange, setPriceRange]     = useState({ min: 0, max: 100000 });
  const [selectedHotel, setSelectedHotel] = useState(null);

  // Booking state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingHotel, setBookingHotel]         = useState(null);
  const [bookingForm, setBookingForm]           = useState({ passengerName: '', passengerEmail: '', passengerPhone: '', passengers: '1' });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingTicket, setBookingTicket]   = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError]     = useState('');

  // ── Auto-load all hotels on mount ─────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/api/hotels`)
      .then(res => res.json())
      .then(data => {
        setHotels(data.slice(0, 5));
        setSearched(true);
      })
      .catch(() => {});
  }, []);

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    setLoading(true);
    try {
      const url = destination.trim()
        ? `${API}/api/hotels/search?destination=${encodeURIComponent(destination)}`
        : `${API}/api/hotels`;
      const res  = await fetch(url);
      const data = await res.json();
      setHotels(data);
    } catch (err) { console.error(err); setHotels([]); }
    setSearched(true);
    setLoading(false);
  };

  // ── Filter + sort ─────────────────────────────────────────────────────────
  const filteredHotels = useMemo(() => {
    let r = [...hotels];
    if (selectedFilters.luxury)  r = r.filter(h => h.stars === '5');
    if (selectedFilters.budget)  r = r.filter(h => h.type === 'budget');
    if (selectedFilters.resort)  r = r.filter(h => h.type === 'resort');
    r = r.filter(h => h.price >= priceRange.min && h.price <= priceRange.max);
    if (selectedSort === 'priceLow')   r.sort((a,b) => a.price - b.price);
    else if (selectedSort === 'priceHigh') r.sort((a,b) => b.price - a.price);
    else if (selectedSort === 'rating')    r.sort((a,b) => b.rating - a.rating);
    else r.sort((a,b) => b.reviews - a.reviews);
    return r;
  }, [hotels, selectedFilters, priceRange, selectedSort]);

  // ── STEP 1: Open passenger details form ───────────────────────────────────
  const handleBookNow = (e, hotel) => {
    if (e) e.stopPropagation();

    const token = localStorage.getItem('token');
    console.log('Token in localStorage:', token); // Debug: remove in production

    if (!isLoggedIn()) {
      alert('Please login first to book a hotel.');
      navigate('/login');
      return;
    }

    const user = getUser();
    setBookingHotel(hotel);
    setBookingForm({ passengerName: user?.name || '', passengerEmail: user?.email || '', passengerPhone: user?.phone || '', passengers: rooms });
    setBookingSuccess(false); setBookingTicket(null); setBookingError('');
    setSelectedHotel(null);
    setShowBookingModal(true);
  };

  // ── STEP 2: Validate → open payment modal ────────────────────────────────
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
          bookingType: 'HOTEL', hotelId: bookingHotel.id,
          passengerName: bookingForm.passengerName, passengerEmail: bookingForm.passengerEmail,
          passengerPhone: bookingForm.passengerPhone, passengers: parseInt(bookingForm.passengers),
          source: bookingHotel.location, destination: bookingHotel.name,
          travelDate: checkIn, returnDate: checkOut,
          totalAmount: bookingHotel.price * parseInt(bookingForm.passengers),
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
  }, [bookingHotel, bookingForm, checkIn, checkOut, navigate]);

  const handlePaymentClose = useCallback(() => { setShowPaymentModal(false); setShowBookingModal(true); }, []);

  const getAmenities = h => {
    if (!h.amenities) return [];
    return typeof h.amenities === 'string' ? h.amenities.split(',').map(a => a.trim()) : h.amenities;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{ background: 'linear-gradient(135deg,#ffffff 0%,#f8f9fb 100%)', borderBottom: '1px solid #e8ecf1', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '1.5rem', borderBottom: '1px solid #e8ecf1', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: 'clamp(18px,5vw,28px)', fontWeight: 'bold', color: '#003580' }}>
            <img src={xyzs} alt="Hotel Booking Logo" style={{ width: '72px', height: '72px', objectFit: 'contain' }} /> Hotel Booking
          </div>
        </div>

        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', alignItems: 'end' }}>
            {[
              { label: 'City or Country', ph: 'Goa, Paris...', val: destination, set: setDestination, icon: <MapPin size={16} color="#94a3b8" /> },
              { label: 'Check In',      type: 'date',  ph: 'DD/MM/YYYY',   val: checkIn,      set: setCheckIn,      icon: <Calendar size={16} color="#94a3b8" /> },
              { label: 'Check Out',      type: 'date',  ph: 'DD/MM/YYYY',   val: checkOut,     set: setCheckOut,     icon: <Calendar size={16} color="#94a3b8" /> }
            ].map(f => (
              <div key={f.label}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase' }}>{f.label}</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '0.75rem', top: '0.65rem', pointerEvents: 'none' }}>{f.icon}</div>
                  <input
  type={f.type || "text"}
  placeholder={f.type === "date" ? undefined : f.ph}
  value={f.val}
  onChange={e => f.set(e.target.value)}
  min={
    f.label === "Check In"
      ? new Date().toISOString().split("T")[0]
      : f.label === "Check Out"
      ? checkIn
      : undefined
  }
  style={{
    width: '100%',
    paddingLeft: '2.5rem',
    paddingRight: '0.75rem',
    paddingTop: '0.6rem',
    paddingBottom: '0.6rem',
    border: '1px solid #cbd5e1',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    boxSizing: 'border-box'
  }}
/> </div>
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Rooms</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '0.75rem', top: '0.65rem', pointerEvents: 'none' }}><Users size={16} color="#94a3b8" /></div>
                <select value={rooms} onChange={e => setRooms(e.target.value)}
                  style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '0.75rem', paddingTop: '0.6rem', paddingBottom: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.875rem', boxSizing: 'border-box', background: 'white' }}>
                  <option>1</option><option>2</option><option>3</option>
                </select>
              </div>
            </div>
            <button onClick={handleSearch} style={{ backgroundColor: '#003580', color: 'white', fontWeight: 600, padding: '0.6rem 1.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.875rem', height: 'fit-content' }}>
              <Search size={18} /> SEARCH
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(1rem,5vw,2rem) 1.5rem' }}>
        {searched && (
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: 'clamp(1.5rem,5vw,2rem)', fontWeight: 700, color: '#0f172a' }}>{filteredHotels.length} Hotels Found</h1>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px,250px) 1fr', gap: '2rem' }}>
          {/* Sidebar */}
          <aside>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase' }}>Hotel Type</h3>
              {[{ id: 'luxury', label: 'Luxury 5 Star' }, { id: 'resort', label: 'Resort' }, { id: 'budget', label: 'Budget' }].map(f => (
                <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
                  <input type="checkbox" checked={selectedFilters[f.id] || false}
                    onChange={() => setSelectedFilters(p => ({ ...p, [f.id]: !p[f.id] }))}
                    style={{ width: '1.1rem', height: '1.1rem', accentColor: '#003580' }} />
                  <span style={{ fontSize: '0.875rem' }}>{f.label}</span>
                </label>
              ))}
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase' }}>Price Range</h3>
              {[
                { id: 'p1', label: 'Budget (₹0-5K)',       min: 0,     max: 5000 },
                { id: 'p2', label: 'Mid-Range (₹5K-15K)',  min: 5000,  max: 15000 },
                { id: 'p3', label: 'Luxury (₹15K+)',        min: 15000, max: 100000 }
              ].map(p => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
                  <input type="radio" name="price" checked={priceRange.min === p.min && priceRange.max === p.max}
                    onChange={() => setPriceRange({ min: p.min, max: p.max })}
                    style={{ width: '1.1rem', height: '1.1rem', accentColor: '#003580' }} />
                  <span style={{ fontSize: '0.875rem' }}>{p.label}</span>
                </label>
              ))}
            </div>
          </aside>

          {/* Hotel list */}
          <section>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[{ id: 'popularity', label: 'Popular' }, { id: 'priceLow', label: 'Price ↑' }, { id: 'priceHigh', label: 'Price ↓' }, { id: 'rating', label: 'Rating' }].map(o => (
                <button key={o.id} onClick={() => setSelectedSort(o.id)} style={{ padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: selectedSort === o.id ? '#003580' : '#e2e8f0', color: selectedSort === o.id ? 'white' : '#475569' }}>{o.label}</button>
              ))}
            </div>

            {loading && (
              <div>
                <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
                {[1,2,3].map(i => (
                  <div key={i} style={{ height: '180px', borderRadius: '8px', marginBottom: '15px', background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                ))}
              </div>
            )}

            {!loading && searched && filteredHotels.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '8px' }}>
                <Search size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
                <p>No hotels found. Try different search terms.</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredHotels.map(hotel => (
                <div key={hotel.id} onClick={() => setSelectedHotel(hotel)} style={{ display: 'grid', gridTemplateColumns: 'minmax(150px,220px) 1fr 170px', background: 'white', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
                >
                  <div style={{ position: 'relative', overflow: 'hidden', height: '180px' }}>
                    {hotel.image && <img src={hotel.image} alt={hotel.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    <button onClick={e => { e.stopPropagation(); setFavorites(p => ({ ...p, [hotel.id]: !p[hotel.id] })); }} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'white', border: 'none', borderRadius: '50%', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Heart size={22} fill={favorites[hotel.id] ? '#ef4444' : 'none'} color={favorites[hotel.id] ? '#ef4444' : '#64748b'} />
                    </button>
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>{hotel.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                      <MapPin size={14} />{hotel.location}
                    </p>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {getAmenities(hotel).slice(0, 3).map((a, i) => (
                        <span key={i} style={{ fontSize: '0.65rem', backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.4rem', borderRadius: '0.2rem' }}>{a}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                        <Star size={14} fill="#fbbf24" color="#fbbf24" />
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{hotel.rating}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({hotel.reviews})</span>
                      </div>
                      {hotel.originalPrice && <div style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through' }}>₹{hotel.originalPrice.toLocaleString()}</div>}
                      <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>₹{hotel.price.toLocaleString()}</p>
                      <p style={{ fontSize: '11px', color: '#666' }}>per night</p>
                    </div>
                    <button onClick={e => handleBookNow(e, hotel)} style={{ marginTop: '0.5rem', padding: '8px 12px', background: '#003580', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>Book Now</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* ── Hotel Detail Modal ──────────────────────────────────────────────── */}
      {selectedHotel && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', overflowY: 'auto' }}
          onClick={() => setSelectedHotel(null)}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '0.75rem', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setSelectedHotel(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#1f2937', border: '2px solid white', borderRadius: '50%', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
              <X size={26} color="white" strokeWidth={3} />
            </button>
            {selectedHotel.image && <img src={selectedHotel.image} alt={selectedHotel.name} style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '0.75rem 0.75rem 0 0' }} />}
            <div style={{ padding: '2rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>{selectedHotel.name}</h1>
              <p style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <MapPin size={18} />{selectedHotel.location}, {selectedHotel.country}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[...Array(5)].map((_,i) => <Star key={i} size={20} fill={i < Math.round(selectedHotel.rating) ? '#fbbf24' : '#e5e7eb'} color={i < Math.round(selectedHotel.rating) ? '#fbbf24' : '#d1d5db'} />)}
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedHotel.rating} / 5</span>
                <span style={{ color: '#64748b' }}>({selectedHotel.reviews?.toLocaleString()} reviews)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Price per Night</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 700 }}>₹{selectedHotel.price?.toLocaleString()}</p>
                  {selectedHotel.taxes > 0 && <p style={{ fontSize: '0.875rem', color: '#64748b' }}>+ ₹{selectedHotel.taxes?.toLocaleString()} taxes</p>}
                </div>
                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Amenities</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {getAmenities(selectedHotel).map((a,i) => (
                      <span key={i} style={{ fontSize: '0.85rem', backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.4rem 0.8rem', borderRadius: '2rem' }}>✓ {a}</span>
                    ))}
                  </div>
                </div>
              </div>
              {selectedHotel.fullDescription && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>About this hotel</h3>
                  <p style={{ color: '#475569', lineHeight: 1.6 }}>{selectedHotel.fullDescription}</p>
                </div>
              )}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={e => handleBookNow(e, selectedHotel)} style={{ flex: 1, padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Book Now</button>
                <button onClick={() => setFavorites(p => ({ ...p, [selectedHotel.id]: !p[selectedHotel.id] }))} style={{ flex: 1, padding: '1rem', background: 'white', color: '#3b82f6', border: '2px solid #3b82f6', borderRadius: '0.5rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Add to Wishlist</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Booking Details Modal ── */}
      <BookingModal
        show={showBookingModal} onClose={() => setShowBookingModal(false)}
        item={bookingHotel} itemLabel={bookingHotel ? `${bookingHotel.name} • ${bookingHotel.location}` : ''}
        pricePerUnit={bookingHotel?.price || 0} unitLabel="per night"
        form={bookingForm} setForm={setBookingForm}
        onSubmit={handleBookingSubmit}
        loading={bookingLoading} error={bookingError} success={bookingSuccess} ticket={bookingTicket}
        searchParams={{ source: bookingHotel?.location, destination: bookingHotel?.name, travelDate: checkIn }}
      />

      {/* ── Razorpay Payment Modal ── */}
      <RazorpayMockModal
        show={showPaymentModal} onClose={handlePaymentClose}
        amount={bookingHotel ? bookingHotel.price * parseInt(bookingForm.passengers || 1) : 0}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <Footer />
    </div>
  );
}