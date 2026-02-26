import React, { useState, useEffect } from 'react';

const API = 'http://localhost:8082';

// ── Helpers ──────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color, sub }) => (
  <div style={{
    background: 'white', borderRadius: '12px', padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'flex-start', gap: '16px'
  }}>
    <div style={{ width: 48, height: 48, borderRadius: '12px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: color, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
    </div>
  </div>
);

// ── Modal ─────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
    <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  </div>
);

// ── Form Field ────────────────────────────────────────────────────────────────
const Field = ({ label, name, value, onChange, type = 'text', placeholder }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none', color: '#0f172a' }} />
  </div>
);

// ── Table ─────────────────────────────────────────────────────────────────────
const Table = ({ cols, rows, onEdit, onDelete, renderCell }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ background: '#f8fafc' }}>
          {cols.map(c => <th key={c.key} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{c.label}</th>)}
          <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#64748b', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr><td colSpan={cols.length + 1} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No records found</td></tr>
        )}
        {rows.map((row, i) => (
          <tr key={row.id || i} style={{ borderBottom: '1px solid #f1f5f9' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}>
            {cols.map(c => (
              <td key={c.key} style={{ padding: '12px 16px', color: '#374151', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {renderCell ? renderCell(c.key, row[c.key], row) : row[c.key] ?? '—'}
              </td>
            ))}
            <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
              {onEdit && <button onClick={() => onEdit(row)} style={{ marginRight: 8, padding: '5px 12px', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Edit</button>}
              {onDelete && <button onClick={() => onDelete(row)} style={{ padding: '5px 12px', background: '#fff1f2', color: '#e11d48', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Delete</button>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// OVERVIEW PAGE
// ══════════════════════════════════════════════════════════════════════════════
const OverviewPage = () => {
  const [stats, setStats] = useState({ bookings: 0, users: 0, hotels: 0, cabs: 0, revenue: 0 });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    // Fetch all bookings for stats
    fetch(`${API}/api/bookings/all`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          const revenue = data.reduce((s, b) => s + (b.totalAmount || 0), 0);
          setStats(prev => ({ ...prev, bookings: data.length, revenue }));
          setRecentBookings(data.slice(-8).reverse());
        }
      }).catch(() => {});

    fetch(`${API}/api/hotels`, { headers: authHeaders() }).then(r => r.ok ? r.json() : []).then(d => setStats(prev => ({ ...prev, hotels: Array.isArray(d) ? d.length : 0 }))).catch(() => {});
    fetch(`${API}/api/cabs`, { headers: authHeaders() }).then(r => r.ok ? r.json() : []).then(d => setStats(prev => ({ ...prev, cabs: Array.isArray(d) ? d.length : 0 }))).catch(() => {});
  }, []);

  const typeColor = { FLIGHT: '#6366f1', BUS: '#f59e0b', HOTEL: '#10b981', CAB: '#3b82f6', PACKAGE: '#ec4899' };

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Dashboard Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Bookings" value={stats.bookings} icon="🎟️" color="#6366f1" />
        <StatCard label="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon="💰" color="#10b981" />
        <StatCard label="Hotels Listed" value={stats.hotels} icon="🏨" color="#f59e0b" />
        <StatCard label="Cabs Listed" value={stats.cabs} icon="🚗" color="#3b82f6" />
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Recent Bookings</h3>
        </div>
        <Table
          cols={[
            { key: 'ticketId', label: 'Ticket ID' },
            { key: 'bookingType', label: 'Type' },
            { key: 'passengerName', label: 'Passenger' },
            { key: 'passengerEmail', label: 'Email' },
            { key: 'totalAmount', label: 'Amount' },
            { key: 'status', label: 'Status' },
          ]}
          rows={recentBookings}
          renderCell={(key, val) => {
            if (key === 'bookingType') return <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: (typeColor[val] || '#94a3b8') + '20', color: typeColor[val] || '#94a3b8' }}>{val}</span>;
            if (key === 'totalAmount') return `₹${(val || 0).toLocaleString()}`;
            if (key === 'status') return <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#dcfce7', color: '#16a34a' }}>{val || 'CONFIRMED'}</span>;
            return val ?? '—';
          }}
        />
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// BOOKINGS PAGE
// ══════════════════════════════════════════════════════════════════════════════
const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetch(`${API}/api/bookings/all`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(d => setBookings(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const types = ['ALL', 'FLIGHT', 'BUS', 'HOTEL', 'CAB', 'PACKAGE'];
  const typeColor = { FLIGHT: '#6366f1', BUS: '#f59e0b', HOTEL: '#10b981', CAB: '#3b82f6', PACKAGE: '#ec4899' };

  const filtered = bookings.filter(b => {
    const matchType = filter === 'ALL' || b.bookingType === filter;
    const matchSearch = !search || [b.ticketId, b.passengerName, b.passengerEmail].join(' ').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Bookings</h2>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ticket, name, email..."
          style={{ padding: '9px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, width: 260, outline: 'none' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding: '8px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: filter === t ? '#003580' : '#f1f5f9', color: filter === t ? 'white' : '#64748b'
            }}>{t}</button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#64748b' }}>{filtered.length} records</span>
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <Table
          cols={[
            { key: 'ticketId', label: 'Ticket ID' },
            { key: 'bookingType', label: 'Type' },
            { key: 'passengerName', label: 'Passenger' },
            { key: 'passengerEmail', label: 'Email' },
            { key: 'passengerPhone', label: 'Phone' },
            { key: 'source', label: 'From' },
            { key: 'destination', label: 'To' },
            { key: 'travelDate', label: 'Date' },
            { key: 'passengers', label: 'Pax' },
            { key: 'totalAmount', label: 'Amount' },
            { key: 'status', label: 'Status' },
          ]}
          rows={filtered}
          renderCell={(key, val) => {
            if (key === 'bookingType') return <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: (typeColor[val] || '#94a3b8') + '20', color: typeColor[val] || '#94a3b8' }}>{val}</span>;
            if (key === 'totalAmount') return `₹${(val || 0).toLocaleString()}`;
            if (key === 'status') return <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#dcfce7', color: '#16a34a' }}>{val || 'CONFIRMED'}</span>;
            return val ?? '—';
          }}
        />
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CABS PAGE
// ══════════════════════════════════════════════════════════════════════════════
const CabsPage = () => {
  const [cabs, setCabs] = useState([]);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  const load = () => fetch(`${API}/api/cabs`, { headers: authHeaders() }).then(r => r.ok ? r.json() : []).then(d => setCabs(Array.isArray(d) ? d : [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const openAdd = () => { setForm({ name: '', cabType: '', operator: '', departureCity: '', arrivalCity: '', departure: '', arrival: '', duration: '', distance: '', price: '', originalPrice: '', rating: '', availability: '', totalSeats: '', amenities: '', image: '', category: '' }); setModal('add'); };
  const openEdit = row => { setForm({ ...row }); setModal('edit'); };

  const save = async () => {
    setLoading(true);
    const isEdit = modal === 'edit';
    const url = isEdit ? `${API}/api/cabs/${form.id}` : `${API}/api/cabs`;
    const method = isEdit ? 'PUT' : 'POST';
    await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(form) }).catch(() => {});
    setLoading(false); setModal(null); load();
  };

  const del = async row => {
    if (!window.confirm(`Delete cab "${row.name}"?`)) return;
    await fetch(`${API}/api/cabs/${row.id}`, { method: 'DELETE', headers: authHeaders() }).catch(() => {});
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Cabs Management</h2>
        <button onClick={openAdd} style={{ padding: '10px 20px', background: '#003580', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>+ Add Cab</button>
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <Table
          cols={[
            { key: 'name', label: 'Name' }, { key: 'cabType', label: 'Type' },
            { key: 'operator', label: 'Operator' }, { key: 'departureCity', label: 'From' },
            { key: 'arrivalCity', label: 'To' }, { key: 'price', label: 'Price' },
            { key: 'availability', label: 'Available' }, { key: 'rating', label: 'Rating' },
          ]}
          rows={cabs}
          onEdit={openEdit} onDelete={del}
          renderCell={(key, val) => {
            if (key === 'price') return `₹${(val || 0).toLocaleString()}`;
            if (key === 'rating') return `⭐ ${val}`;
            return val ?? '—';
          }}
        />
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add New Cab' : 'Edit Cab'} onClose={() => setModal(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Name" name="name" value={form.name || ''} onChange={handleChange} placeholder="Swift Dzire" />
            <Field label="Cab Type" name="cabType" value={form.cabType || ''} onChange={handleChange} placeholder="Sedan / SUV" />
            <Field label="Operator" name="operator" value={form.operator || ''} onChange={handleChange} placeholder="OlaCabs" />
            <Field label="Category" name="category" value={form.category || ''} onChange={handleChange} placeholder="economy / premium" />
            <Field label="Departure City" name="departureCity" value={form.departureCity || ''} onChange={handleChange} placeholder="Mumbai" />
            <Field label="Arrival City" name="arrivalCity" value={form.arrivalCity || ''} onChange={handleChange} placeholder="Pune" />
            <Field label="Departure Time" name="departure" value={form.departure || ''} onChange={handleChange} placeholder="08:00" />
            <Field label="Arrival Time" name="arrival" value={form.arrival || ''} onChange={handleChange} placeholder="12:30" />
            <Field label="Duration" name="duration" value={form.duration || ''} onChange={handleChange} placeholder="4h 30m" />
            <Field label="Distance" name="distance" value={form.distance || ''} onChange={handleChange} placeholder="150 km" />
            <Field label="Price (₹)" name="price" value={form.price || ''} onChange={handleChange} type="number" placeholder="1200" />
            <Field label="Original Price (₹)" name="originalPrice" value={form.originalPrice || ''} onChange={handleChange} type="number" placeholder="1500" />
            <Field label="Rating" name="rating" value={form.rating || ''} onChange={handleChange} type="number" placeholder="4.5" />
            <Field label="Availability" name="availability" value={form.availability || ''} onChange={handleChange} type="number" placeholder="10" />
            <Field label="Total Seats" name="totalSeats" value={form.totalSeats || ''} onChange={handleChange} type="number" placeholder="4" />
            <Field label="Seats Layout" name="seatsLayout" value={form.seatsLayout || ''} onChange={handleChange} placeholder="2+2" />
          </div>
          <Field label="Amenities (comma separated)" name="amenities" value={form.amenities || ''} onChange={handleChange} placeholder="AC, Music, Water Bottle" />
          <Field label="Image URL" name="image" value={form.image || ''} onChange={handleChange} placeholder="https://..." />
          <Field label="Driver Name" name="driver" value={form.driver || ''} onChange={handleChange} placeholder="Ramesh Kumar" />
          <Field label="Driver Rating" name="driverRating" value={form.driverRating || ''} onChange={handleChange} placeholder="4.8" />
          <button onClick={save} disabled={loading} style={{ width: '100%', padding: 14, background: '#003580', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 8 }}>
            {loading ? 'Saving...' : modal === 'add' ? 'Add Cab' : 'Save Changes'}
          </button>
        </Modal>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// HOTELS PAGE
// ══════════════════════════════════════════════════════════════════════════════
const HotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  const load = () => fetch(`${API}/api/hotels`, { headers: authHeaders() }).then(r => r.ok ? r.json() : []).then(d => setHotels(Array.isArray(d) ? d : [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const openAdd = () => { setForm({ name: '', location: '', country: '', stars: '', type: '', price: '', originalPrice: '', rating: '', reviews: '', taxes: '', amenities: '', image: '', fullDescription: '' }); setModal('add'); };
  const openEdit = row => { setForm({ ...row }); setModal('edit'); };

  const save = async () => {
    setLoading(true);
    const isEdit = modal === 'edit';
    await fetch(`${API}/api/hotels${isEdit ? '/' + form.id : ''}`, { method: isEdit ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(form) }).catch(() => {});
    setLoading(false); setModal(null); load();
  };

  const del = async row => {
    if (!window.confirm(`Delete hotel "${row.name}"?`)) return;
    await fetch(`${API}/api/hotels/${row.id}`, { method: 'DELETE', headers: authHeaders() }).catch(() => {});
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Hotels Management</h2>
        <button onClick={openAdd} style={{ padding: '10px 20px', background: '#003580', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>+ Add Hotel</button>
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <Table
          cols={[
            { key: 'name', label: 'Name' }, { key: 'location', label: 'Location' },
            { key: 'country', label: 'Country' }, { key: 'stars', label: 'Stars' },
            { key: 'type', label: 'Type' }, { key: 'price', label: 'Price/Night' },
            { key: 'rating', label: 'Rating' }, { key: 'reviews', label: 'Reviews' },
          ]}
          rows={hotels}
          onEdit={openEdit} onDelete={del}
          renderCell={(key, val) => {
            if (key === 'price') return `₹${(val || 0).toLocaleString()}`;
            if (key === 'stars') return '⭐'.repeat(parseInt(val) || 0);
            if (key === 'rating') return `${val} / 5`;
            return val ?? '—';
          }}
        />
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add New Hotel' : 'Edit Hotel'} onClose={() => setModal(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Hotel Name" name="name" value={form.name || ''} onChange={handleChange} placeholder="Taj Mahal Palace" />
            <Field label="Type" name="type" value={form.type || ''} onChange={handleChange} placeholder="luxury / budget / resort" />
            <Field label="Location" name="location" value={form.location || ''} onChange={handleChange} placeholder="Mumbai" />
            <Field label="Country" name="country" value={form.country || ''} onChange={handleChange} placeholder="India" />
            <Field label="Area" name="area" value={form.area || ''} onChange={handleChange} placeholder="Colaba" />
            <Field label="Stars" name="stars" value={form.stars || ''} onChange={handleChange} placeholder="5" />
            <Field label="Price/Night (₹)" name="price" value={form.price || ''} onChange={handleChange} type="number" placeholder="20000" />
            <Field label="Original Price (₹)" name="originalPrice" value={form.originalPrice || ''} onChange={handleChange} type="number" placeholder="25000" />
            <Field label="Taxes (₹)" name="taxes" value={form.taxes || ''} onChange={handleChange} type="number" placeholder="3000" />
            <Field label="Rating" name="rating" value={form.rating || ''} onChange={handleChange} type="number" placeholder="4.8" />
            <Field label="Reviews Count" name="reviews" value={form.reviews || ''} onChange={handleChange} type="number" placeholder="2500" />
          </div>
          <Field label="Amenities (comma separated)" name="amenities" value={form.amenities || ''} onChange={handleChange} placeholder="Pool, Spa, WiFi, Gym" />
          <Field label="Image URL" name="image" value={form.image || ''} onChange={handleChange} placeholder="https://..." />
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Full Description</label>
            <textarea name="fullDescription" value={form.fullDescription || ''} onChange={handleChange} rows={3}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }} />
          </div>
          <button onClick={save} disabled={loading} style={{ width: '100%', padding: 14, background: '#003580', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            {loading ? 'Saving...' : modal === 'add' ? 'Add Hotel' : 'Save Changes'}
          </button>
        </Modal>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PACKAGES PAGE
// ══════════════════════════════════════════════════════════════════════════════
const PackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  const load = () => fetch(`${API}/api/packages`, { headers: authHeaders() }).then(r => r.ok ? r.json() : []).then(d => setPackages(Array.isArray(d) ? d : [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const openAdd = () => setForm({ name: '', location: '', category: '', duration: '', travelers: '', price: '', originalPrice: '', rating: '', reviews: '', bestSeason: '', highlights: '', inclusions: '', exclusions: '', image: '', fullDescription: '' });
  const openEdit = row => { setForm({ ...row }); setModal('edit'); };

  const save = async () => {
    setLoading(true);
    const isEdit = modal === 'edit';
    await fetch(`${API}/api/packages${isEdit ? '/' + form.id : ''}`, { method: isEdit ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(form) }).catch(() => {});
    setLoading(false); setModal(null); load();
  };

  const del = async row => {
    if (!window.confirm(`Delete package "${row.name}"?`)) return;
    await fetch(`${API}/api/packages/${row.id}`, { method: 'DELETE', headers: authHeaders() }).catch(() => {});
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Holiday Packages</h2>
        <button onClick={() => { openAdd(); setModal('add'); }} style={{ padding: '10px 20px', background: '#003580', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>+ Add Package</button>
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <Table
          cols={[
            { key: 'name', label: 'Package Name' }, { key: 'location', label: 'Destination' },
            { key: 'category', label: 'Category' }, { key: 'duration', label: 'Duration' },
            { key: 'price', label: 'Price/Person' }, { key: 'rating', label: 'Rating' },
          ]}
          rows={packages}
          onEdit={openEdit} onDelete={del}
          renderCell={(key, val) => {
            if (key === 'price') return `₹${(val || 0).toLocaleString()}`;
            if (key === 'rating') return `⭐ ${val}`;
            return val ?? '—';
          }}
        />
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Package' : 'Edit Package'} onClose={() => setModal(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Package Name" name="name" value={form.name || ''} onChange={handleChange} placeholder="Goa Beach Getaway" />
            <Field label="Category" name="category" value={form.category || ''} onChange={handleChange} placeholder="Luxury / Adventure" />
            <Field label="Location" name="location" value={form.location || ''} onChange={handleChange} placeholder="Goa, India" />
            <Field label="Duration" name="duration" value={form.duration || ''} onChange={handleChange} placeholder="5 Days / 4 Nights" />
            <Field label="Travelers" name="travelers" value={form.travelers || ''} onChange={handleChange} placeholder="2 Adults" />
            <Field label="Best Season" name="bestSeason" value={form.bestSeason || ''} onChange={handleChange} placeholder="Oct - Mar" />
            <Field label="Price/Person (₹)" name="price" value={form.price || ''} onChange={handleChange} type="number" placeholder="25000" />
            <Field label="Original Price (₹)" name="originalPrice" value={form.originalPrice || ''} onChange={handleChange} type="number" placeholder="30000" />
            <Field label="Rating" name="rating" value={form.rating || ''} onChange={handleChange} type="number" placeholder="4.7" />
            <Field label="Reviews" name="reviews" value={form.reviews || ''} onChange={handleChange} type="number" placeholder="1200" />
          </div>
          <Field label="Highlights (comma separated)" name="highlights" value={form.highlights || ''} onChange={handleChange} placeholder="Beach, Sunset Cruise, Water Sports" />
          <Field label="Inclusions (comma separated)" name="inclusions" value={form.inclusions || ''} onChange={handleChange} placeholder="Hotel, Breakfast, Airport Transfer" />
          <Field label="Exclusions (comma separated)" name="exclusions" value={form.exclusions || ''} onChange={handleChange} placeholder="Flights, Visa, Personal Expenses" />
          <Field label="Image URL" name="image" value={form.image || ''} onChange={handleChange} placeholder="https://..." />
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Full Description</label>
            <textarea name="fullDescription" value={form.fullDescription || ''} onChange={handleChange} rows={3}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }} />
          </div>
          <button onClick={save} disabled={loading} style={{ width: '100%', padding: 14, background: '#003580', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            {loading ? 'Saving...' : modal === 'add' ? 'Add Package' : 'Save Changes'}
          </button>
        </Modal>
      )}
    </div>
  );
};
// ══════════════════════════════════════════════════════════════════════════════
// CONTACTS PAGE
// ══════════════════════════════════════════════════════════════════════════════
const ContactsPage = () => {
  const [messages, setMessages] = useState([]);

  const load = () => {
    fetch(`${API}/api/contact`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(d => setMessages(Array.isArray(d) ? d : []))
      .catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const markRead = async (row) => {
    await fetch(`${API}/api/contact/${row.id}/read`, {
      method: 'PATCH',
      headers: authHeaders()
    }).catch(() => {});
    load();
  };

  const del = async (row) => {
    if (!window.confirm("Delete this message?")) return;
    await fetch(`${API}/api/contact/${row.id}`, {
      method: 'DELETE',
      headers: authHeaders()
    }).catch(() => {});
    load();
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
        Contact Messages
      </h2>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <Table
          cols={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'subject', label: 'Subject' },
            { key: 'message', label: 'Message' },
            { key: 'createdAt', label: 'Date' },
            { key: 'read', label: 'Status' },
          ]}
          rows={messages}
          onDelete={del}
          renderCell={(key, val, row) => {
            if (key === 'message') {
              return <span title={val}>{val?.slice(0, 40)}...</span>;
            }

            if (key === 'createdAt') {
              return new Date(val).toLocaleString();
            }

            if (key === 'read') {
              return (
                <button
                  onClick={() => !row.read && markRead(row)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    border: 'none',
                    cursor: row.read ? 'default' : 'pointer',
                    background: row.read ? '#dcfce7' : '#fef3c7',
                    color: row.read ? '#16a34a' : '#b45309'
                  }}
                >
                  {row.read ? 'Read' : 'Mark as Read'}
                </button>
              );
            }

            return val ?? '—';
          }}
        />
      </div>
    </div>
  );
};
// ══════════════════════════════════════════════════════════════════════════════
// USERS PAGE
// ══════════════════════════════════════════════════════════════════════════════
const UsersPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/auth/users`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(d => setUsers(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Users</h2>
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <Table
          cols={[
            { key: 'id', label: 'ID' },
            { key: 'firstName', label: 'First Name' },
            { key: 'lastName', label: 'Last Name' },
            { key: 'email', label: 'Email' },
          ]}
          rows={users}
          renderCell={(key, val) => val ?? '—'}
        />
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
const navItems = [
  { id: 'overview',  label: 'Overview',         icon: 'bi bi-speedometer2' },
  { id: 'bookings',  label: 'Bookings',         icon: 'bi bi-ticket-perforated' },
  { id: 'cabs',      label: 'Cabs',             icon: 'bi bi-car-front' },
  { id: 'hotels',    label: 'Hotels',           icon: 'bi bi-building' },
  { id: 'packages',  label: 'Holiday Packages', icon: 'bi bi-umbrella-beach' },
  { id: 'users',     label: 'Users',            icon: 'bi bi-people' },
  { id: 'contacts',  label: 'Contact Messages', icon: 'bi bi-envelope' },
];

export default function AdminDashboard() {
  const [page, setPage] = useState('overview');

  const pageMap = {
    overview: <OverviewPage />,
    bookings: <BookingsPage />,
    cabs:     <CabsPage />,
    hotels:   <HotelsPage />,
    packages: <PackagesPage />,
    users:    <UsersPage />,
    contacts: <ContactsPage />,
  };
<nav style={{ padding: '16px 12px', flex: 1 }}>
  {navItems.map(item => (
    <button
      key={item.id}
      onClick={() => setPage(item.id)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        marginBottom: 4,
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        background: page === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
        color: page === item.id ? 'white' : 'rgba(255,255,255,0.65)',
        fontSize: 14,
        fontWeight: page === item.id ? 600 : 400,
        textAlign: 'left',
      }}
    >
      <i className={item.icon} style={{ fontSize: 18 }}></i>   ✅ HERE
      {item.label}
    </button>
  ))}
</nav>
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside style={{ width: 240, background: '#003580', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}> TravelPlaner</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Panel</div>
        </div>

        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', marginBottom: 4, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: page === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
              color: page === item.id ? 'white' : 'rgba(255,255,255,0.65)',
              fontSize: 14, fontWeight: page === item.id ? 600 : 400, textAlign: 'left',
              transition: 'all 0.15s'
            }}
              onMouseEnter={e => { if (page !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { if (page !== item.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <i className={item.icon} style={{ fontSize: 18 }}></i>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '32px 32px', overflowY: 'auto' }}>
        {pageMap[page]}
      </main>
    </div>
  );
}