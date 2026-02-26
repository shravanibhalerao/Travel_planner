/*
================================================================================
GUIDE: HOW TO ADD EXTERNAL DATA FOR CABS, BUSES, TRAINS & PACKAGES
================================================================================

There are multiple ways to fetch and manage external data in your React travel app.
Let's explore each method with examples.
*/

// ============================================================================
// METHOD 1: USING API CALLS WITH FETCH (Most Common)
// ============================================================================

import React, { useState, useEffect } from 'react';

// Example: CabBookingPage with External API Data
const CabBookingPageWithAPI = () => {
  const [cabs, setCabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCabs();
  }, []);

  // Fetch cabs from your backend API
  const fetchCabs = async () => {
    setLoading(true);
    try {
      // Replace this URL with your actual API endpoint
      const response = await fetch('https://your-api.com/api/cabs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization if needed
          'Authorization': 'Bearer YOUR_API_TOKEN'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cabs');
      }

      const data = await response.json();
      setCabs(data.cabs); // Assuming API returns { cabs: [...] }
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cabs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search cabs with filters
  const searchCabs = async (searchParams) => {
    setLoading(true);
    try {
      const queryString = new URLSearchParams(searchParams).toString();
      const response = await fetch(
        `https://your-api.com/api/cabs/search?${queryString}`,
        {
          headers: {
            'Authorization': 'Bearer YOUR_API_TOKEN'
          }
        }
      );

      const data = await response.json();
      setCabs(data.cabs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Book a cab
  const bookCab = async (cabId, bookingDetails) => {
    try {
      const response = await fetch('https://your-api.com/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_TOKEN'
        },
        body: JSON.stringify({
          cabId,
          ...bookingDetails
        })
      });

      const data = await response.json();
      return data.bookingId;
    } catch (err) {
      console.error('Booking failed:', err);
      throw err;
    }
  };

  if (loading) return <div>Loading cabs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Your component JSX */}
      {cabs.map(cab => (
        <div key={cab.id}>{cab.name}</div>
      ))}
    </div>
  );
};


// ============================================================================
// METHOD 2: USING AXIOS (Better Error Handling)
// ============================================================================

import axios from 'axios';

const CabBookingPageWithAxios = () => {
  const [cabs, setCabs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Create axios instance with default config
  const apiClient = axios.create({
    baseURL: 'https://your-api.com/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add authorization token to all requests
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    const fetchCabs = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/cabs');
        setCabs(response.data.cabs);
      } catch (error) {
        console.error('Error fetching cabs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCabs();
  }, []);

  const searchCabs = async (filters) => {
    try {
      const response = await apiClient.get('/cabs/search', {
        params: filters
      });
      setCabs(response.data.cabs);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return <div>{/* Component JSX */}</div>;
};


// ============================================================================
// METHOD 3: USING CONTEXT API FOR GLOBAL STATE MANAGEMENT
// ============================================================================

// Create a context for travel data
import { createContext, useContext, useState, useEffect } from 'react';

const TravelDataContext = createContext();

export const TravelDataProvider = ({ children }) => {
  const [cabs, setCabs] = useState([]);
  const [buses, setBuses] = useState([]);
  const [trains, setTrains] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'https://your-api.com/api';

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [cabsRes, busesRes, trainsRes, packagesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/cabs`),
        fetch(`${API_BASE_URL}/buses`),
        fetch(`${API_BASE_URL}/trains`),
        fetch(`${API_BASE_URL}/packages`)
      ]);

      const cabsData = await cabsRes.json();
      const busesData = await busesRes.json();
      const trainsData = await trainsRes.json();
      const packagesData = await packagesRes.json();

      setCabs(cabsData.cabs);
      setBuses(busesData.buses);
      setTrains(trainsData.trains);
      setPackages(packagesData.packages);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search functions
  const searchCabs = async (searchParams) => {
    try {
      const query = new URLSearchParams(searchParams).toString();
      const response = await fetch(`${API_BASE_URL}/cabs/search?${query}`);
      const data = await response.json();
      setCabs(data.cabs);
    } catch (err) {
      setError(err.message);
    }
  };

  const searchBuses = async (searchParams) => {
    try {
      const query = new URLSearchParams(searchParams).toString();
      const response = await fetch(`${API_BASE_URL}/buses/search?${query}`);
      const data = await response.json();
      setBuses(data.buses);
    } catch (err) {
      setError(err.message);
    }
  };

  const searchTrains = async (searchParams) => {
    try {
      const query = new URLSearchParams(searchParams).toString();
      const response = await fetch(`${API_BASE_URL}/trains/search?${query}`);
      const data = await response.json();
      setTrains(data.trains);
    } catch (err) {
      setError(err.message);
    }
  };

  const searchPackages = async (searchParams) => {
    try {
      const query = new URLSearchParams(searchParams).toString();
      const response = await fetch(`${API_BASE_URL}/packages/search?${query}`);
      const data = await response.json();
      setPackages(data.packages);
    } catch (err) {
      setError(err.message);
    }
  };

  const bookCab = async (cabId, bookingDetails) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/cabs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cabId, ...bookingDetails })
      });
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const bookBus = async (busId, bookingDetails) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/buses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ busId, ...bookingDetails })
      });
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const bookTrain = async (trainId, bookingDetails) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/trains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainId, ...bookingDetails })
      });
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const bookPackage = async (packageId, bookingDetails) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId, ...bookingDetails })
      });
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <TravelDataContext.Provider
      value={{
        cabs,
        buses,
        trains,
        packages,
        loading,
        error,
        searchCabs,
        searchBuses,
        searchTrains,
        searchPackages,
        bookCab,
        bookBus,
        bookTrain,
        bookPackage
      }}
    >
      {children}
    </TravelDataContext.Provider>
  );
};

// Custom hook to use the context
export const useTravelData = () => {
  const context = useContext(TravelDataContext);
  if (!context) {
    throw new Error('useTravelData must be used within TravelDataProvider');
  }
  return context;
};


// ============================================================================
// METHOD 4: USING THE CONTEXT IN COMPONENTS
// ============================================================================

const CabBookingPageUsingContext = () => {
  const { cabs, loading, searchCabs } = useTravelData();
  const [searchParams, setSearchParams] = useState({
    source: 'Mumbai',
    destination: 'Pune',
    date: '2026-02-13',
    passengers: 1
  });

  const handleSearch = (e) => {
    e.preventDefault();
    searchCabs(searchParams);
  };

  if (loading) return <div>Loading cabs...</div>;

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchParams.source}
          onChange={(e) => setSearchParams({ ...searchParams, source: e.target.value })}
          placeholder="From"
        />
        <input
          type="text"
          value={searchParams.destination}
          onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
          placeholder="To"
        />
        <button type="submit">Search</button>
      </form>

      <div>
        {cabs.map(cab => (
          <div key={cab.id}>
            <h3>{cab.name}</h3>
            <p>₹{cab.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};


// ============================================================================
// SETUP: WRAP YOUR APP WITH THE PROVIDER
// ============================================================================

// In your main App.js or main.jsx file:
import { TravelDataProvider } from './context/TravelDataContext';

function App() {
  return (
    <TravelDataProvider>
      {/* Your app routes and components */}
      <CabBookingPageUsingContext />
    </TravelDataProvider>
  );
}


// ============================================================================
// API ENDPOINT EXAMPLES (Backend Requirements)
// ============================================================================

/*
Your backend API should have these endpoints:

CABS:
- GET    /api/cabs                          -> Get all cabs
- GET    /api/cabs/search?from=X&to=Y      -> Search cabs
- POST   /api/bookings/cabs                 -> Book a cab
- GET    /api/cabs/:id                      -> Get cab details

BUSES:
- GET    /api/buses                         -> Get all buses
- GET    /api/buses/search?from=X&to=Y     -> Search buses
- POST   /api/bookings/buses                -> Book a bus
- GET    /api/buses/:id                     -> Get bus details

TRAINS:
- GET    /api/trains                        -> Get all trains
- GET    /api/trains/search?from=X&to=Y    -> Search trains
- POST   /api/bookings/trains               -> Book a train
- GET    /api/trains/:id                    -> Get train details

PACKAGES:
- GET    /api/packages                      -> Get all packages
- GET    /api/packages/search?destination=X -> Search packages
- POST   /api/bookings/packages             -> Book a package
- GET    /api/packages/:id                  -> Get package details

EXPECTED RESPONSE FORMAT:

For Cabs:
{
  "cabs": [
    {
      "id": 1,
      "name": "Sedan - Comfort",
      "operator": "Premium Cabs Ltd",
      "cabType": "Sedan",
      "departure": "10:00",
      "departureCity": "Mumbai",
      "arrival": "13:30",
      "arrivalCity": "Pune",
      "duration": "3h 30m",
      "distance": "190 km",
      "price": 1200,
      "originalPrice": 1500,
      "rating": 4.8,
      "reviews": 2841,
      "availability": 8,
      "amenities": ["AC", "WiFi", "USB Charging"],
      "image": "url"
    }
  ]
}

For Buses:
{
  "buses": [
    {
      "id": 1,
      "name": "Express Travels",
      "operator": "Express Travels Ltd",
      "busType": "AC Seater",
      "departure": "22:00",
      "departureCity": "New Delhi",
      "arrival": "08:30",
      "arrivalCity": "Bengaluru",
      "duration": "10h 30m",
      "distance": "2160 km",
      "price": 1200,
      "originalPrice": 1500,
      "rating": 4.8,
      "reviews": 1240,
      "availability": 18,
      "amenities": ["AC", "WiFi", "USB Charging"],
      "image": "url"
    }
  ]
}

For Trains:
{
  "trains": [
    {
      "id": 1,
      "name": "Rajdhani Express",
      "trainNumber": "12345",
      "departure": "14:00",
      "departureStation": "New Delhi",
      "arrival": "06:00",
      "arrivalStation": "Bengaluru",
      "duration": "16h",
      "distance": "2560 km",
      "price": 3500,
      "originalPrice": 4500,
      "rating": 4.6,
      "reviews": 5000,
      "availability": 45,
      "classes": ["AC 1st", "AC 2nd", "AC 3rd"]
    }
  ]
}

For Packages:
{
  "packages": [
    {
      "id": 1,
      "name": "Kerala Backwaters Tour",
      "destination": "Kerala",
      "duration": "5 days",
      "price": 25000,
      "originalPrice": 35000,
      "rating": 4.9,
      "reviews": 1200,
      "image": "url",
      "includes": ["Flights", "Hotel", "Meals"]
    }
  ]
}
*/


// ============================================================================
// METHOD 5: INSTALLATION REQUIREMENTS
// ============================================================================

/*
Install required packages:

npm install axios
npm install react-router-dom

For better state management (optional):
npm install zustand
npm install redux react-redux

For handling async operations (optional):
npm install @reduxjs/toolkit
*/


// ============================================================================
// STEP-BY-STEP SETUP GUIDE
// ============================================================================

/*
1. CREATE CONTEXT FILE (src/context/TravelDataContext.js)
   - Copy the TravelDataProvider code above
   - Export useTravelData hook

2. WRAP APP WITH PROVIDER (src/main.jsx or src/index.js)
   import { TravelDataProvider } from './context/TravelDataContext';
   
   ReactDOM.render(
     <TravelDataProvider>
       <App />
     </TravelDataProvider>,
     document.getElementById('root')
   );

3. UPDATE YOUR COMPONENTS
   - Import useTravelData hook
   - Call searchCabs, searchBuses, searchTrains, searchPackages
   - Use returned data to render UI

4. SET UP BACKEND API
   - Create Node.js/Express server
   - Connect to database (MongoDB, PostgreSQL, MySQL)
   - Create endpoints as listed above
   - Return data in expected format

5. UPDATE API BASE URL
   - Change 'https://your-api.com/api' to your actual API URL
   - Add authentication tokens if needed
   - Handle CORS if needed

6. TEST
   - Use Postman/Insomnia to test API endpoints
   - Verify data format matches expected structure
   - Check frontend receives and displays data correctly
*/


// ============================================================================
// EXAMPLE: COMPLETE CAB BOOKING PAGE WITH EXTERNAL DATA
// ============================================================================

const CompleteCABBookingPageExample = () => {
  const { cabs, loading, error, searchCabs, bookCab } = useTravelData();
  const [searchParams, setSearchParams] = useState({
    source: 'Mumbai',
    destination: 'Pune',
    date: '2026-02-13',
    passengers: '1'
  });
  const [selectedCab, setSelectedCab] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    await searchCabs(searchParams);
  };

  const handleBooking = async () => {
    try {
      setBookingError(null);
      const bookingDetails = {
        passengers: parseInt(searchParams.passengers),
        date: searchParams.date,
        source: searchParams.source,
        destination: searchParams.destination,
        userName: 'John Doe',
        userPhone: '9876543210',
        userEmail: 'john@example.com'
      };
      
      const result = await bookCab(selectedCab.id, bookingDetails);
      alert(`Booking successful! Booking ID: ${result.bookingId}`);
      setSelectedCab(null);
    } catch (err) {
      setBookingError(err.message);
    }
  };

  if (loading) return <div>Loading cabs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Book Your Cab</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ marginBottom: '30px' }}>
        <input
          type="text"
          value={searchParams.source}
          onChange={(e) => setSearchParams({ ...searchParams, source: e.target.value })}
          placeholder="From"
          required
        />
        <input
          type="text"
          value={searchParams.destination}
          onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
          placeholder="To"
          required
        />
        <input
          type="date"
          value={searchParams.date}
          onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
          required
        />
        <select
          value={searchParams.passengers}
          onChange={(e) => setSearchParams({ ...searchParams, passengers: e.target.value })}
        >
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>5</option>
        </select>
        <button type="submit">Search Cabs</button>
      </form>

      {/* Cabs List */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {cabs.map(cab => (
          <div key={cab.id} style={{
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: selectedCab?.id === cab.id ? '#f0f0f0' : 'white'
          }} onClick={() => setSelectedCab(cab)}>
            <h3>{cab.name}</h3>
            <p>{cab.operator}</p>
            <p>{cab.departure} - {cab.arrival}</p>
            <p>₹{cab.price}</p>
            <p>⭐ {cab.rating} ({cab.reviews} reviews)</p>
          </div>
        ))}
      </div>

      {/* Booking Details */}
      {selectedCab && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          minWidth: '300px'
        }}>
          <h3>{selectedCab.name}</h3>
          <p>Total: ₹{selectedCab.price * parseInt(searchParams.passengers)}</p>
          {bookingError && <p style={{ color: 'red' }}>{bookingError}</p>}
          <button onClick={handleBooking} style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#003580',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Book Now
          </button>
        </div>
      )}
    </div>
  );
};

export default CompleteCABBookingPageExample;