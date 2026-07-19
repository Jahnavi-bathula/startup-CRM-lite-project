import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Lazy-load page view chunks dynamically so that Vite compiles separate JS bundles.
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Leads = lazy(() => import('../pages/Leads'));
const Tasks = lazy(() => import('../pages/Tasks'));
const Analytics = lazy(() => import('../pages/Analytics'));
const Profile = lazy(() => import('../pages/Profile'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const NotFound = lazy(() => import('../pages/NotFound'));

/**
 * RouteLoader fallback component.
 * Rendered by Suspense while React is fetching the asynchronous JS chunk for a lazy page.
 */
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh] w-full py-12">
    {/* Animated spinning loader ring */}
    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

/**
 * AppRoutes Component
 * Sets up the routing tree configuration using React Router.
 * The entire Routes group is wrapped inside Suspense to support lazy loading animations.
 */
export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        
        {/* Public Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Dashboard/App Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Path "/" renders the root Dashboard view */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Path "/leads" renders the Lead Directory view */}
          <Route path="/leads" element={<Leads />} />
          
          {/* Path "/tasks" renders the Tasks Page */}
          <Route path="/tasks" element={<Tasks />} />
          
          {/* Path "/analytics" renders the Analytics view */}
          <Route path="/analytics" element={<Analytics />} />

          {/* Path "/profile" renders the Profile Page */}
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        {/* Catch-all path "*" acts as a fallback for any undefined routes, serving the 404 page */}
        <Route path="*" element={<NotFound />} />
        
      </Routes>
    </Suspense>
  );
}
