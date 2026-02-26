import 'bootstrap/dist/css/bootstrap.min.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/common/Navbar.jsx'

import Home from './pages/home.jsx'
import FlightPage from './pages/flights.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import HotelsPage from './pages/hotel.jsx'
import TravelPackages from './pages/packages.jsx'
import TrainsPage from './pages/trains.jsx'
import BusBookingPage from './pages/bus.jsx'
import CabBookingPage from './pages/cabs.jsx'
import AlertPage from './pages/alert.jsx'
import ProfilePage from './pages/Profile.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

import AdminGuard from './components/common/AdminGuard'
import ProtectedRoute from './components/common/Protectedroute.jsx'

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar />}

      <div
        className="container-fluid"
        style={{ paddingTop: isAdmin ? '0' : '120px' }}
      >
        <Routes>

          {/* ───────── PUBLIC ROUTES ───────── */}

          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Travel pages are PUBLIC (important) */}
          <Route path="/flights" element={<FlightPage />} />
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/trains" element={<TrainsPage />} />
          <Route path="/packages" element={<TravelPackages />} />
          <Route path="/bus" element={<BusBookingPage />} />
          <Route path="/cabs" element={<CabBookingPage />} />
          <Route path="/alert" element={<AlertPage />} />

          {/* ───────── PROTECTED ROUTES ───────── */}

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* ───────── ADMIN ROUTE ───────── */}

          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            }
          />

          {/* ───────── 404 PAGE ───────── */}

          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </div>
    </>
  )
}

function NotFoundPage() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100">
      <h1 style={{ fontSize: '5rem', color: '#dc2626' }}>404</h1>
      <h2>Page Not Found</h2>
    </div>
  )
}

export default App