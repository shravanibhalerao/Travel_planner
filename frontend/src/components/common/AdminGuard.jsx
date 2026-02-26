import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminGuard({ children }) {
  const token   = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const user    = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  })();

  if (!token || !isAdmin || user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }
  return children;
}