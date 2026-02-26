import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/';

  const [formData, setFormData]         = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]             = useState({});
  const [submitted, setSubmitted]       = useState(false);
  const [loading, setLoading]           = useState(false);
  const [apiError, setApiError]         = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError)     setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');

    try {
      const response = await fetch('https://travel-planner-cf8s.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);                // ✅ real JWT token
        localStorage.setItem('user', JSON.stringify(data.data));  // ✅ user info
        login(data.data);
        setSubmitted(true);

        setTimeout(() => {
          if (data.data?.role === 'ADMIN') {
            localStorage.setItem('isAdmin', 'true');
            navigate('/admin', { replace: true });
          } else {
            localStorage.removeItem('isAdmin');
            navigate(from, { replace: true });
          }
        }, 1500);

      } else {
        setApiError(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { width: 100%; }
        body { overflow-y: auto; }

        .login-container {
          position: relative;
          top: 0; left: 0;
          width: 100%;
          min-height: 100vh;
          background:
            linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),
            url("https://t4.ftcdn.net/jpg/03/24/93/13/360_F_324931309_YBPIHI2SGw676Zkhf1yVTTzOs8C34p3S.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1;
          margin-top: -40px;
        }
        .login-wrapper { width: 100%; max-width: 500px; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.7; }
        }

        .login-card { animation: slideUp 0.6s ease-out; }

        .login-form .form-control:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102,126,234,0.25);
        }
        .login-form .form-control {
          border-radius: 8px; border: 2px solid #e9ecef;
          padding: 12px 16px; font-size: 0.95rem; transition: all 0.3s ease;
        }
        .login-form .form-control:hover { border-color: #667eea; }

        .password-toggle {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%); cursor: pointer;
          color: #667eea; background: none; border: none; padding: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .password-toggle:hover { color: #764ba2; }
        .password-wrapper { position: relative; }

        .btn-login {
          background: linear-gradient(135deg, #384166 0%, #3a4872 100%);
          border: none; border-radius: 8px; padding: 12px 24px;
          font-weight: 600; font-size: 1rem; transition: all 0.3s ease;
          margin-top: 8px; color: white;
        }
        .btn-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(102,126,234,0.4); color: white;
        }
        .btn-login:active  { transform: translateY(0); }
        .btn-login:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .invalid-feedback { display: block; font-size: 0.85rem; margin-top: 4px; color: #dc3545; }
        .success-message  { animation: pulse 0.6s ease-in-out; }

        .api-error {
          display: block; padding: 12px; margin-bottom: 15px;
          background-color: #f8d7da; border: 1px solid #f5c6cb;
          border-radius: 4px; color: #721c24; font-size: 0.9rem;
        }

        .redirect-hint {
          font-size: 0.8rem;
          color: #6c757d;
          text-align: center;
          margin-top: 12px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 6px;
        }
      `}</style>

      <div className="login-container">
        <div className="login-wrapper">
          <div className="card shadow-lg border-0 login-card" style={{ borderRadius: '12px' }}>
            <div className="card-body p-5 login-form">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-dark mb-2">Welcome Back</h2>
                <p className="text-muted mb-0">Sign in to your account</p>
              </div>

              {from !== '/' && (
                <div className="redirect-hint">
                  🔐 Login to continue to <strong>{from}</strong>
                </div>
              )}

              {submitted ? (
                <div className="alert alert-success success-message mt-3" role="alert">
                  <div className="text-center">
                    <h5 className="mb-2">✓ Login Successful!</h5>
                    <p className="mb-0 small">
                      Redirecting to <strong>{from === '/' ? 'home' : from}</strong>...
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="mt-3">
                  {apiError && <div className="api-error">{apiError}</div>}

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-500 text-dark">Email Address</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email" name="email" placeholder="you@example.com"
                      value={formData.email} onChange={handleChange} disabled={loading}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-500 text-dark">Password</label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        id="password" name="password" placeholder="Enter your password"
                        value={formData.password} onChange={handleChange} disabled={loading}
                      />
                      <button type="button" className="password-toggle"
                        onClick={() => setShowPassword(p => !p)} disabled={loading}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>
                  </div>

                  <div className="mb-4 text-end">
                    <a href="#" className="text-decoration-none text-primary fw-500">Forgot Password?</a>
                  </div>

                  <button type="submit" className="btn btn-login w-100" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </button>

                  <div className="text-center mt-4">
                    <p className="text-muted mb-0">
                      Don't have an account?{' '}
                      <a href="/register" className="text-decoration-none text-primary fw-600">Register</a>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}