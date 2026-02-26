import { useTravelData } from './context/TravelDataContext';
import { useState } from 'react';

export default function CabBooking() {
  const { cabs, loading, error, searchCabs, bookCab } = useTravelData();
  const [params, setParams] = useState({
    source: 'Mumbai',
    destination: 'Pune',
    date: '2026-02-13',
    passengers: '1'
  });
  const [selectedCab, setSelectedCab] = useState(null);
  const [bookingStatus, setBookingStatus] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      await searchCabs(params);
    } catch (err) {
      setBookingStatus(`Error: ${err.message}`);
    }
  };

  const handleBook = async (cab) => {
    try {
      setBookingStatus('Booking...');
      const result = await bookCab(cab.id, {
        passengers: parseInt(params.passengers),
        date: params.date,
        source: params.source,
        destination: params.destination,
        userName: 'Guest User',
        userPhone: '9876543210',
        userEmail: 'user@example.com'
      });
      
      setBookingStatus(`✅ Success! Booking ID: ${result.bookingId}`);
      setSelectedCab(null);
    } catch (err) {
      setBookingStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Book Your Cab</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="From"
          value={params.source}
          onChange={(e) => setParams({ ...params, source: e.target.value })}
        />
        <input
          type="text"
          placeholder="To"
          value={params.destination}
          onChange={(e) => setParams({ ...params, destination: e.target.value })}
        />
        <input
          type="date"
          value={params.date}
          onChange={(e) => setParams({ ...params, date: e.target.value })}
        />
        <select
          value={params.passengers}
          onChange={(e) => setParams({ ...params, passengers: e.target.value })}
        >
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Error Display */}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {bookingStatus && <div style={{ color: bookingStatus.includes('✅') ? 'green' : 'red' }}>
        {bookingStatus}
      </div>}

      {/* Cab List */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {cabs.map(cab => (
          <div key={cab.id} style={{
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: selectedCab?.id === cab.id ? '#f0f0f0' : 'white'
          }}>
            <h3>{cab.name}</h3>
            <p>{cab.departure} → {cab.arrival} ({cab.duration})</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
              ₹{cab.price}
            </p>
            <p>⭐ {cab.rating} ({cab.reviews} reviews)</p>
            <button onClick={() => handleBook(cab)} style={{
              padding: '10px 20px',
              backgroundColor: '#003580',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}