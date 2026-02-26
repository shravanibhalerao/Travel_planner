import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const response = await fetch('https://travel-planner-cf8s.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          // Redirect to login
          window.location.href = '/login';
        }, 3000);
      } else {
        // Handle backend validation errors
        if (data.errors) {
          setErrors(data.errors);
        }
        setApiError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          html, body, #root {
            width: 100%;
          }

          body {
            overflow-y: auto;
          }

          .register-container {
             position: relative;
    top: 0;
    left: 0;
    width: 100%;
    min-height: 100vh;

    /* Background Image */
    background: 
        linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), 
        url("https://t4.ftcdn.net/jpg/03/24/93/13/360_F_324931309_YBPIHI2SGw676Zkhf1yVTTzOs8C34p3S.jpg");

    background-size: cover;          /* Makes image cover full screen */
    background-position: center;     /* Center image */
    background-repeat: no-repeat;    /* Prevent repeat */

    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 1;
    margin-top: -40px;
          }

          .register-wrapper {
            width: 100%;
            max-width: 900px;
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }

          .register-card {
            animation: slideUp 0.6s ease-out;
          }

          .register-form .form-control:focus {
            border-color: #60688e;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          }

          .register-form .form-control {
            border-radius: 8px;
            border: 2px solid #e9ecef;
            padding: 12px 16px;
            font-size: 0.95rem;
            transition: all 0.3s ease;
          }

          .register-form .form-control:hover {
            border-color: #343d67;
          }

          .register-form .form-control:disabled {
            background-color: #e9ecef;
            cursor: not-allowed;
          }

          .password-toggle {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #667eea;
            background: none;
            border: none;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .password-toggle:hover {
            color: #764ba2;
          }

          .password-toggle:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .password-wrapper {
            position: relative;
          }

          .btn-register {
            background: linear-gradient(135deg, #384166 0%, #3a4872 100%);
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.3s ease;
            margin-top: 8px;
            color: white;
          }

          .btn-register:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
            color: white;
          }

          .btn-register:active {
            transform: translateY(0);
          }

          .btn-register:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .form-check-input:checked {
            background-color: #667eea;
            border-color: #667eea;
          }

          .form-check-input:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          }

          .form-check-input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .invalid-feedback {
            display: block;
            font-size: 0.85rem;
            margin-top: 4px;
            color: #dc3545;
          }

          .success-message {
            animation: pulse 0.6s ease-in-out;
          }

          .api-error {
            display: block;
            padding: 12px;
            margin-bottom: 15px;
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
            color: #721c24;
            font-size: 0.9rem;
          }
        `}
      </style>

      <div className="register-container">
        <div className="register-wrapper">
          <div className="card shadow-lg border-0 register-card" style={{ borderRadius: '12px' }}>
            <div className="card-body p-5 register-form">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-dark mb-2">Create Account</h2>
                <p className="text-muted mb-0">Join us today and get started</p>
              </div>

              {submitted ? (
                <div className="alert alert-success success-message" role="alert">
                  <div className="text-center">
                    <h5 className="mb-2">✓ Registration Successful!</h5>
                    <p className="mb-0 small">Welcome aboard! Redirecting to login...</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {apiError && (
                    <div className="api-error">
                      {apiError}
                    </div>
                  )}

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="firstName" className="form-label fw-500 text-dark">
                        First Name
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {errors.firstName && (
                        <div className="invalid-feedback">{errors.firstName}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="lastName" className="form-label fw-500 text-dark">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {errors.lastName && (
                        <div className="invalid-feedback">{errors.lastName}</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-500 text-dark">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-500 text-dark">
                      Password
                    </label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        id="password"
                        name="password"
                        placeholder="At least 8 characters"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      {errors.password && (
                        <div className="invalid-feedback">{errors.password}</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label fw-500 text-dark">
                      Confirm Password
                    </label>
                    <div className="password-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      {errors.confirmPassword && (
                        <div className="invalid-feedback">{errors.confirmPassword}</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="agreeTerms"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <label className="form-check-label text-muted" htmlFor="agreeTerms">
                        I agree to the{' '}
                        <a href="#" className="text-decoration-none text-primary fw-500">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-decoration-none text-primary fw-500">
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                    {errors.agreeTerms && (
                      <div className="invalid-feedback d-block">{errors.agreeTerms}</div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-register w-100"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>

                  <div className="text-center mt-4">
                    <p className="text-muted mb-0">
                      Already have an account?{' '}
                      <a href="/login" className="text-decoration-none text-primary fw-600">
                        login
                      </a>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="text-center mt-4">
            
          </div>
        </div>
      </div>
    </>
  );
}