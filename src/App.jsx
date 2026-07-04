import React, { useState } from 'react'; // Import React library and state hooks
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter to initialize HTML5 history-based client-side routing
import { ThemeProvider } from './context/ThemeContext'; // Import ThemeProvider to distribute light/dark mode styles
import { LeadProvider } from './context/LeadContext'; // Import LeadProvider to distribute shared CRM lead dataset
import Sidebar from './components/common/Sidebar'; // Import persistent Sidebar component containing navigation NavLinks
import AppRoutes from './routes'; // Import routing tree mapping routes to lazy page chunks
import { Menu } from 'lucide-react'; // Import Menu icon for the hamburger button
import './App.css'; // Import custom styles and configurations (resets and scrollbars)

/**
 * Main Application Component
 * Wraps the routing tree and layouts inside State Providers and Browser Router context.
 */
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // Wrap with ThemeProvider so that children can toggle standard theme classes
    <ThemeProvider>
      {/* Wrap with LeadProvider so that children share the same CRM database array */}
      <LeadProvider>
        {/* Wrap with BrowserRouter to enable React Router DOM navigation contexts */}
        <BrowserRouter>
          {/* Main page layout structure. Uses viewport boundaries and flexible layouts */}
          <div className="flex flex-col md:flex-row w-screen h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 font-sans transition-colors duration-200">
            
            {/* Mobile-only Top Header Header */}
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
              {/* Dynamic router component displaying active page component */}
              <AppRoutes />
            </main>
          </div>
        </BrowserRouter>
      </LeadProvider>
    </ThemeProvider>
  );
}

export default App; // Export App to be rendered in index.html index loader main.jsx

