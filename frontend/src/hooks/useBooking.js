import { useState } from 'react';

const API = 'https://travel-planner-cf8s.onrender.com';

export function useBooking() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingItem, setBookingItem]           = useState(null);
  const [bookingForm, setBookingForm]           = useState({
    passengerName: '', passengerEmail: '', passengerPhone: '', passengers: '1'
  });
  const [bookingSuccess, setBookingSuccess]     = useState(false);
  const [bookingTicket, setBookingTicket]       = useState(null);
  const [bookingLoading, setBookingLoading]     = useState(false);
  const [bookingError, setBookingError]         = useState('');

  // ── Auth helpers ──────────────────────────────────────────────────────────
  const isLoggedIn   = () => !!localStorage.getItem('token');
  const getUser      = () => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  };

  // ── Open booking modal ────────────────────────────────────────────────────
  const openBooking = (item, e) => {
    if (e) e.stopPropagation();
    if (!isLoggedIn()) {
      alert('Please login first to book.');
      window.location.href = '/login';
      return;
    }
    const user = getUser();
    setBookingItem(item);
    setBookingForm({
      passengerName:  user?.name  || '',
      passengerEmail: user?.email || '',
      passengerPhone: user?.phone || '',
      passengers: '1'
    });
    setBookingSuccess(false);
    setBookingTicket(null);
    setBookingError('');
    setShowBookingModal(true);
  };

  const closeBooking = () => setShowBookingModal(false);

  // ── Submit booking ────────────────────────────────────────────────────────
  const submitBooking = async (payload) => {
    if (!bookingForm.passengerName || !bookingForm.passengerEmail || !bookingForm.passengerPhone) {
      setBookingError('Please fill in all passenger details.');
      return;
    }
    setBookingLoading(true);
    setBookingError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/bookings/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...payload,
          passengerName:  bookingForm.passengerName,
          passengerEmail: bookingForm.passengerEmail,
          passengerPhone: bookingForm.passengerPhone,
          passengers:     parseInt(bookingForm.passengers)
        })
      });
      if (!res.ok) throw new Error('Booking failed');
      const ticket = await res.json();
      setBookingTicket(ticket);
      setBookingSuccess(true);
    } catch (err) {
      setBookingError('Booking failed. Please try again.');
      console.error(err);
    }
    setBookingLoading(false);
  };

  return {
    showBookingModal, bookingItem, bookingForm, setBookingForm,
    bookingSuccess, bookingTicket, bookingLoading, bookingError,
    openBooking, closeBooking, submitBooking, setShowBookingModal
  };
}










