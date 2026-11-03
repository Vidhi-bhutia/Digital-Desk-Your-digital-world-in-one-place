import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading Digital Desk..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.emailVerifiedAt && location.pathname !== '/profile') return <Navigate to={`/verify-email?email=${encodeURIComponent(user?.email || '')}`} replace />;

  return children;
};

export default ProtectedRoute;
