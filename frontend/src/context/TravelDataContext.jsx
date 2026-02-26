import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const TravelDataContext = createContext();

// Custom hook to use the context
export const useTravelData = () => {
  const context = useContext(TravelDataContext);
  if (!context) {
    throw new Error('useTravelData must be used within TravelDataProvider');
  }
  return context;
};

// Provider component
export const TravelDataProvider = ({ children }) => {
  const [cabs, setCabs] = useState([]);
  const [buses, setBuses] = useState([]);
  const [trains, setTrains] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API Configuration
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const API_TOKEN = localStorage.getItem('authToken') || '';

  // Common fetch options with authorization
  const getFetchOptions = () => ({
    headers: {
      'Content-Type': 'application/json',
      ...(API_TOKEN && { 'Authorization': `Bearer ${API_TOKEN}` })
    }
  });

  // ===================== CABS =====================

  const searchCabs = async (searchParams) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(searchParams).toString();
      const response = await fetch(`${API_BASE_URL}/cabs/search?${query}`, getFetchOptions());

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setCabs(data.cabs || []);
      return data.cabs;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch cabs';
      setError(errorMessage);
      console.error('Error searching cabs:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCabDetails = async (cabId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/cabs/${cabId}`, getFetchOptions());

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.cab;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch cab details';
      setError(errorMessage);
      console.error('Error fetching cab details:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bookCab = async (cabId, bookingDetails) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/cabs`, {
        method: 'POST',
        ...getFetchOptions(),
        body: JSON.stringify({
          cabId,
          ...bookingDetails,
          bookingType: 'cab',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Booking failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to book cab';
      setError(errorMessage);
      console.error('Error booking cab:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===================== BUSES =====================

  const searchBuses = async (searchParams) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(searchParams).toString();
      const response = await fetch(`${API_BASE_URL}/buses/search?${query}`, getFetchOptions());

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setBuses(data.buses || []);
      return data.buses;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch buses';
      setError(errorMessage);
      console.error('Error searching buses:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBusDetails = async (busId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/buses/${busId}`, getFetchOptions());

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.bus;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch bus details';
      setError(errorMessage);
      console.error('Error fetching bus details:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bookBus = async (busId, bookingDetails) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/buses`, {
        method: 'POST',
        ...getFetchOptions(),
        body: JSON.stringify({
          busId,
          ...bookingDetails,
          bookingType: 'bus',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Booking failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to book bus';
      setError(errorMessage);
      console.error('Error booking bus:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===================== TRAINS =====================

  const searchTrains = async (searchParams) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(searchParams).toString();
      const response = await fetch(`${API_BASE_URL}/trains/search?${query}`, getFetchOptions());

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setTrains(data.trains || []);
      return data.trains;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch trains';
      setError(errorMessage);
      console.error('Error searching trains:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTrainDetails = async (trainId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/trains/${trainId}`, getFetchOptions());

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.train;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch train details';
      setError(errorMessage);
      console.error('Error fetching train details:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bookTrain = async (trainId, bookingDetails) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/trains`, {
        method: 'POST',
        ...getFetchOptions(),
        body: JSON.stringify({
          trainId,
          ...bookingDetails,
          bookingType: 'train',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Booking failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to book train';
      setError(errorMessage);
      console.error('Error booking train:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===================== PACKAGES =====================

  const searchPackages = async (searchParams) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(searchParams).toString();
      const response = await fetch(`${API_BASE_URL}/packages/search?${query}`, getFetchOptions());

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setPackages(data.packages || []);
      return data.packages;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch packages';
      setError(errorMessage);
      console.error('Error searching packages:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPackageDetails = async (packageId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/packages/${packageId}`, getFetchOptions());

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.package;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch package details';
      setError(errorMessage);
      console.error('Error fetching package details:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bookPackage = async (packageId, bookingDetails) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/packages`, {
        method: 'POST',
        ...getFetchOptions(),
        body: JSON.stringify({
          packageId,
          ...bookingDetails,
          bookingType: 'package',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Booking failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to book package';
      setError(errorMessage);
      console.error('Error booking package:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===================== BOOKINGS =====================

  const getUserBookings = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}`, getFetchOptions());

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.bookings;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch bookings';
      setError(errorMessage);
      console.error('Error fetching bookings:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        ...getFetchOptions()
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to cancel booking';
      setError(errorMessage);
      console.error('Error canceling booking:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===================== CONTEXT VALUE =====================

  const value = {
    // State
    cabs,
    buses,
    trains,
    packages,
    loading,
    error,

    // Cab methods
    searchCabs,
    getCabDetails,
    bookCab,

    // Bus methods
    searchBuses,
    getBusDetails,
    bookBus,

    // Train methods
    searchTrains,
    getTrainDetails,
    bookTrain,

    // Package methods
    searchPackages,
    getPackageDetails,
    bookPackage,

    // Booking methods
    getUserBookings,
    cancelBooking,

    // Helper
    setError
  };

  return (
    <TravelDataContext.Provider value={value}>
      {children}
    </TravelDataContext.Provider>
  );
};

export default TravelDataContext;