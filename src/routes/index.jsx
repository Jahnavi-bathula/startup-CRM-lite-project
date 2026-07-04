import React, { lazy, Suspense } from 'react'; // Import React, lazy loading utility, and Suspense placeholder component
import { Routes, Route } from 'react-router-dom'; // Import router components to map path routes to pages

// Lazy-load page view chunks dynamically so that Vite compiles separate JS bundles.
// These chunks are only fetched from the server when the user accesses the respective route, reducing initial load size.
const Dashboard = lazy(() => import('../pages/Dashboard')); // Dynamic import for root Dashboard page
const Leads = lazy(() => import('../pages/Leads')); // Dynamic import for Leads directory page
const Analytics = lazy(() => import('../pages/Analytics')); // Dynamic import for Analytics page
const NotFound = lazy(() => import('../pages/NotFound')); // Dynamic import for fallback 404 page

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
 * Sets up the routing tree configuration using React Router v6.
 * The entire Routes group is wrapped inside Suspense to support lazy loading animations.
 */
export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* Path "/" renders the root Dashboard view */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Path "/leads" renders the Lead Directory view */}
        <Route path="/leads" element={<Leads />} />
        
        {/* Path "/analytics" renders the Analytics view */}
        <Route path="/analytics" element={<Analytics />} />
        
        {/* Catch-all path "*" acts as a fallback for any undefined routes, serving the 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
