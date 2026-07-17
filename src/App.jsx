import React, { useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LeadProvider } from './context/LeadContext';
import { TaskProvider } from './context/TaskContext';
import { MeetingProvider } from './context/MeetingContext';
import { NotificationProvider } from './context/NotificationContext';
import Sidebar from './components/common/Sidebar';
import AppRoutes from './routes';
import { Menu } from 'lucide-react';
import './App.css';

/**
 * AppContent Component
 * Renders the layout conditionally based on routing path to handle login/register full-screen layout.
 */
function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Check if current path belongs to an authentication page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <main className="w-screen h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 font-sans transition-colors duration-200">
        <AppRoutes />
      </main>
    );
  }

  return (
    <div className="flex flex-col md:flex-row w-screen h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 font-sans transition-colors duration-200">
      
      {/* Mobile-only Top Header */}
      <header className="flex md:hidden items-center justify-between h-14 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 shrink-0 z-30">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu trigger */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Branding Icon & Text */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
              A
            </div>
            <span className="font-semibold text-sm text-slate-900 dark:text-zinc-50 leading-tight">AeroCorp Inc.</span>
          </div>
        </div>
      </header>

      {/* Persistent Sidebar / Bottom Nav Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main scrollable viewport container for active page routes */}
      <main className="flex-1 flex flex-col h-full overflow-hidden pb-16 md:pb-0">
        <AppRoutes />
      </main>
    </div>
  );
}

/**
 * Main Application Component
 * Wraps the routing tree and layouts inside State Providers and Browser Router context.
 */
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <LeadProvider>
            <TaskProvider>
              <MeetingProvider>
                <NotificationProvider>
                  <AppContent />
                </NotificationProvider>
              </MeetingProvider>
            </TaskProvider>
          </LeadProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
