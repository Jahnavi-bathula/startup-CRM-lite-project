import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * RouteLoader fallback component.
 * Rendered by ProtectedRoute while session validation is in progress.
 */
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh] w-full py-12">
    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

/**
 * ProtectedRoute Component
 * Redirects unauthenticated users to the Login page.
 */
export default function ProtectedRoute() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
