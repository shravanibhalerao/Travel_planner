import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from "../../assets/travel.jpg";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
const [unreadCount, setUnreadCount] = useState(0);
useEffect(() => {
  fetch("http://localhost:8082/api/bookings/my", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => res.json())
    .then(data => {
      const unread = data.filter(b => b.status === "CONFIRMED").length;
      setUnreadCount(unread);
    });
}, []);
  return (
    <>
      <style>
        {`
        .navbar {
          background: #fff;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin: 0;
          padding: 0;
        }

        .navbar-brand {
          color: #1b1b1b !important;
          font-weight: 700;
          margin-left: 30px;
        }
.nav-link svg {
  display: block;
  margin-bottom: 4px;
}

.bi-train-front,
.bi-bus-front {
  transform: translateY(1px);
}
        .navbar .container-fluid {
          padding-left: 0 !important;
          padding-right: 0 !important;
          margin: 0;
        }

        .navbar-brand:hover {
          color: #000 !important;
        }

        .nav-link {
          color: #5f4444 !important;
          font-weight: 500;
          transition: all 0.3s ease;
          padding: 0.5rem 1.5rem !important;
        }

        .nav-link:hover {
          color: #2a4060 !important;
          transform: translateY(-2px);
        }

        .navbar-nav {
          margin-right: 20px;
        }

        .navbar-collapse {
          padding-left: 0;
          padding-right: 0;
        }

        .gradient-btn {
          background: linear-gradient(135deg, #384166 0%, #3a4872 100%);
          border: none;
        }

        .gradient-btn:hover {
          background: linear-gradient(135deg, #2f3556 0%, #313d63 100%);
          color: white;
        }

        .custom-btn {
          padding: 10px 5px;
          font-size: 14px;
        }

        @media (max-width: 991px) {
          .navbar-nav {
            text-align: center;
            margin-right: 0;
          }
        }
          .ap-badge {
  position: absolute;
  top: 4px;
  right: 13px;
  background: #dc3545;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 6px;
  border-radius: 50px;
  min-width: 18px;
  text-align: center;
  line-height: 1;
  box-shadow: 0 0 0 2px white;
}
  .ap-badge {
  animation: pop 0.25s ease;
}

@keyframes pop {
  0% { transform: scale(0.6); }
  100% { transform: scale(1); }
}
        `}
      </style>

      <nav className="navbar navbar-expand-lg navbar-light py-2">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img src={logo} alt="Logo" className="me-2" style={{ height: "50px", width: "120px" }} />
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto">

              <li className="nav-item">
                <Link className="nav-link d-flex flex-column align-items-center" to="/flights">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-airplane-fill mb-1" viewBox="0 0 16 16">
                    <path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151C9.861 1.73 10 2.431 10 3v3.691l5.17 2.585a1.5 1.5 0 0 1 .83 1.342V12a.5.5 0 0 1-.582.493l-5.507-.918-.375 2.253 1.318 1.318A.5.5 0 0 1 10.5 16h-5a.5.5 0 0 1-.354-.854l1.319-1.318-.376-2.253-5.507.918A.5.5 0 0 1 0 12v-1.382a1.5 1.5 0 0 1 .83-1.342L6 6.691V3c0-.568.14-1.271.428-1.849" />
                  </svg>
                  <span>Flights</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link d-flex flex-column align-items-center" to="/hotels">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-buildings mb-1" viewBox="0 0 16 16">
                    <path d="M14.763.075A.5.5 0 0 1 15 .5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .342-.474L6 7.64V4.5a.5.5 0 0 1 .276-.447l8-4a.5.5 0 0 1 .487.022M6 8.694 1 10.36V15h5zM7 15h2v-1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15h2V1.309l-7 3.5z" />
                    <path d="M2 11h1v1H2zm2 0h1v1H4zm-2 2h1v1H2zm2 0h1v1H4zm4-4h1v1H8zm2 0h1v1h-1zm-2 2h1v1H8zm2 0h1v1h-1zm2-2h1v1h-1zm0 2h1v1h-1zM8 7h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zM8 5h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zm0-2h1v1h-1z" />
                  </svg>
                  <span>Hotels</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link d-flex flex-column align-items-center" to="/packages">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-box mb-1" viewBox="0 0 16 16">
                    <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464z" />
                  </svg>
                  <span>Packages</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link d-flex flex-column align-items-center" to="/trains">
                  <svg
  xmlns="http://www.w3.org/2000/svg"
  width="18"
  height="18"
  fill="currentColor"
  className="bi bi-train-front mb-1"
  viewBox="0 0 16 16"
>  <path d="M5.621 1.485c1.815-.454 2.943-.454 4.758 0 .784.196 1.743.673 2.527 1.119.688.39 1.094 1.148 1.094 1.979V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V4.583c0-.831.406-1.588 1.094-1.98.784-.445 1.744-.922 2.527-1.118m5-.97C8.647.02 7.353.02 5.38.515c-.924.23-1.982.766-2.78 1.22C1.566 2.322 1 3.432 1 4.582V13.5A2.5 2.5 0 0 0 3.5 16h9a2.5 2.5 0 0 0 2.5-2.5V4.583c0-1.15-.565-2.26-1.6-2.849-.797-.453-1.855-.988-2.779-1.22ZM5 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0m0 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0m7 1a1 1 0 1 0-1-1 1 1 0 1 0-2 0 1 1 0 0 0 2 0 1 1 0 0 0 1 1M4.5 5a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h3V5zm4 0v3h3a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5zM3 5.5A1.5 1.5 0 0 1 4.5 4h7A1.5 1.5 0 0 1 13 5.5v2A1.5 1.5 0 0 1 11.5 9h-7A1.5 1.5 0 0 1 3 7.5zM6.5 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1z"/>
</svg>
                  <span>Trains</span>
                </Link>
              </li>

<li className="nav-item">
  <Link className="nav-link d-flex flex-column align-items-center" to="/bus">
  <svg
  xmlns="http://www.w3.org/2000/svg"
  width="18"
  height="18"
  fill="currentColor"
  className="bi bi-bus-front mb-1"
  viewBox="0 0 16 16"
>
  <path d="M16 7a1 1 0 0 1-1 1v3.5c0 .818-.393 1.544-1 2v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5V14H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2a2.5 2.5 0 0 1-1-2V8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1V2.64C1 1.452 1.845.408 3.064.268A44 44 0 0 1 8 0c2.1 0 3.792.136 4.936.268C14.155.408 15 1.452 15 2.64V4a1 1 0 0 1 1 1zM3.552 3.22A43 43 0 0 1 8 3c1.837 0 3.353.107 4.448.22a.5.5 0 0 0 .104-.994A44 44 0 0 0 8 2c-1.876 0-3.426.109-4.552.226a.5.5 0 1 0 .104.994M8 4c-1.876 0-3.426.109-4.552.226A.5.5 0 0 0 3 4.723v3.554a.5.5 0 0 0 .448.497C4.574 8.891 6.124 9 8 9s3.426-.109 4.552-.226A.5.5 0 0 0 13 8.277V4.723a.5.5 0 0 0-.448-.497A44 44 0 0 0 8 4m-3 7a1 1 0 1 0-2 0 1 1 0 0 0 2 0m8 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m-7 0a1 1 0 0 0 1 1h2a1 1 0 1 0 0-2H7a1 1 0 0 0-1 1"/>

    </svg>
    <span>Buses</span>
  </Link>
</li>

              <li className="nav-item">
                <Link className="nav-link d-flex flex-column align-items-center" to="/cabs">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
                    <circle cx="7" cy="17" r="2"></circle>
                    <path d="M9 17h6"></path>
                    <circle cx="17" cy="17" r="2"></circle>
                  </svg>
                  <span>Cabs</span>
                </Link>
              </li>

            </ul>

            {/* ── Right side icons + login/logout ── */}
            <ul className="navbar-nav ms-auto align-items-center">

              {/* Bell icon — only show when logged in */}
              {user && (
                <li className="nav-item position-relative">
  <Link className="nav-link position-relative" to="/alert">

    {/* 🔴 Badge */}
    {unreadCount > 0 && (
      <span className="ap-badge">
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    )}

    {/* 🔔 Bell Icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="currentColor"
      className="bi bi-bell-fill"
      viewBox="0 0 16 16"
    >
      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901"/>
    </svg>

  </Link>
</li>
              )}

              {/* Profile icon — only show when logged in */}
              {user && (
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    {/* ✅ Fixed: className instead of class, fill-rule → fillRule */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                      <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                      <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                    </svg>
                  </Link>
                </li>
              )}

              {/* Login OR Logout button */}
              {user ? (
                <li className="nav-item">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </li>
              ) : (
                <li className="nav-item">
                  <Link
                    to="/login"
                    className="d-inline-flex gradient-btn align-items-center gap-2 rounded-pill px-3 py-2 text-white offer-pill text-decoration-none"
                  >
                    Login
                  </Link>
                </li>
              )}

            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;