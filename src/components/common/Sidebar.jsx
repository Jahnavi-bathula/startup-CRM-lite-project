import { memo } from 'react'; // Import memo hook
import { NavLink } from 'react-router-dom'; // Import NavLink from react-router-dom to build navigation links with active state handling
import { LayoutDashboard, Users, BarChart3, Search, X, LogOut } from 'lucide-react'; // Import Lucide icons for visual indicators in the navigation
import DarkModeToggle from './DarkModeToggle';
import { useAuth } from '../../context/AuthContext';


/**
 * Sidebar Navigation Component
 * Renders a persistent left-side navigation panel for desktop/tablet screens,
 * a bottom nav bar on mobile, and a sliding drawer when opened via mobile hamburger.
 */
function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  // Compute initials for avatar badge
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U';

  const handleAvatarClick = () => {
    // If sidebar is collapsed (Tablet view: screen width >= 768px and < 1024px)
    if (window.innerWidth >= 768 && window.innerWidth < 1024) {
      if (window.confirm('Do you want to log out of your AeroCorp account?')) {
        logout();
      }
    }
  };

  // Navigation links definition array containing paths, labels, and rendering icons
  const navItems = [
    { 
      path: '/', 
      label: 'Dashboard', 
      subLabel: 'Overview & Metrics',
      icon: LayoutDashboard 
    },
    { 
      path: '/leads', 
      label: 'Leads', 
      subLabel: 'Manage Prospects',
      icon: Users 
    },
    { 
      path: '/analytics', 
      label: 'Analytics', 
      subLabel: 'Charts & Reports',
      icon: BarChart3 
    }
  ];

  return (
    <>
      {/* -------------------------------------------------------------
          1. PERSISTENT LEFT SIDEBAR (Tablet & Desktop: md+)
         ------------------------------------------------------------- */}
      <aside className="hidden md:flex md:w-20 lg:w-64 h-screen bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 flex-col p-3 lg:p-4 shrink-0 transition-all duration-200 z-20">
        
        {/* Workspace / Branding Header */}
        <div className="flex items-center gap-3 px-1 lg:px-2 py-3 mb-6 justify-center lg:justify-start">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20 shrink-0 select-none">
            A
          </div>
          <div className="hidden lg:flex flex-col min-w-0">
            <span className="font-semibold text-sm text-slate-900 dark:text-zinc-50 leading-tight truncate">AeroCorp Inc.</span>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">Scale Subscription</span>
          </div>
        </div>

        {/* Global search trigger simulation (Desktop only: hidden on tablet) */}
        <button 
          onClick={() => alert('Search Bar Activated! Press CMD+K anytime.')} 
          className="hidden lg:flex items-center justify-between w-full px-3 py-2 mb-4 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/80 rounded-lg text-slate-400 dark:text-zinc-500 text-xs transition-colors hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            Search...
          </span>
          <kbd className="font-mono text-[9px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-1.5 py-0.5 rounded shadow-sm text-slate-400 dark:text-zinc-500">⌘K</kbd>
        </button>

        {/* Tablet Search Icon trigger (Visible only on Tablet) */}
        <button 
          onClick={() => alert('Search Bar Activated! Press CMD+K anytime.')} 
          className="lg:hidden flex items-center justify-center w-10 h-10 mb-4 mx-auto bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/80 rounded-lg text-slate-400 dark:text-zinc-500 transition-colors hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer"
          title="Search"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Navigation menu list */}
        <nav className="flex-1 flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex flex-col lg:flex-row items-center lg:items-start gap-1 lg:gap-3 py-2.5 px-1 lg:px-3 rounded-lg text-center lg:text-left transition-all duration-150 cursor-pointer
                  ${isActive 
                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold shadow-sm shadow-blue-500/5' 
                    : 'text-slate-650 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900/50 hover:text-slate-950 dark:hover:text-zinc-100'
                  }
                `}
              >
                <Icon className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] lg:text-sm font-medium leading-none lg:leading-normal">{item.label}</span>
                  <span className="hidden lg:block text-[10px] text-slate-400 dark:text-zinc-500 font-normal mt-0.5">{item.subLabel}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Appearance Settings Row */}
        <div className="border-t border-slate-100 dark:border-zinc-900 py-3 flex items-center justify-center lg:justify-between shrink-0">
          <span className="hidden lg:inline text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Appearance</span>
          <DarkModeToggle />
        </div>

        {/* User profile footer element */}
        <div className="border-t border-slate-100 dark:border-zinc-900 pt-4 flex items-center justify-between shrink-0 min-w-0 w-full">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleAvatarClick}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs select-none shrink-0 cursor-pointer focus:outline-none hover:opacity-90 active:scale-95 transition-all"
              title={user?.name ? `${user.name} (Click to log out on tablet)` : 'User'}
            >
              {initials}
            </button>
            <div className="hidden lg:flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate leading-tight">{user?.name || 'User'}</span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{user?.email || ''}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="hidden lg:block p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
            title="Log Out"
            aria-label="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* -------------------------------------------------------------
          2. MOBILE DRAWER NAVIGATION SIDEBAR (Mobile: <md)
         ------------------------------------------------------------- */}
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-all duration-300 z-50 md:hidden
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      
      {/* Drawer content panel */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 z-50 flex flex-col p-4 transition-transform duration-300 ease-out transform md:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Drawer Header with close button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
              A
            </div>
            <span className="font-semibold text-sm text-slate-900 dark:text-zinc-50 leading-tight">AeroCorp Inc.</span>
          </div>
          
          <button 
            onClick={onClose}
            className="w-11 h-11 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer focus:outline-none"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global search trigger simulation */}
        <button 
          onClick={() => { onClose(); alert('Search Bar Activated! Press CMD+K anytime.'); }} 
          className="flex items-center justify-between w-full px-3 py-2.5 mb-4 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/80 rounded-lg text-slate-400 dark:text-zinc-500 text-xs cursor-pointer focus:outline-none"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            Search...
          </span>
          <kbd className="font-mono text-[9px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-1.5 py-0.5 rounded shadow-sm text-slate-400 dark:text-zinc-500">⌘K</kbd>
        </button>

        {/* Navigation list */}
        <nav className="flex-1 flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer
                  ${isActive 
                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold shadow-sm shadow-blue-500/5' 
                    : 'text-slate-655 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900/50 hover:text-slate-950'
                  }
                `}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Appearance Row */}
        <div className="border-t border-slate-100 dark:border-zinc-900 py-4 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Appearance</span>
          <DarkModeToggle />
        </div>

        {/* User Footer */}
        <div className="border-t border-slate-100 dark:border-zinc-900 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs select-none shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate leading-tight">{user?.name || 'User'}</span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{user?.email || ''}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
            title="Log Out"
            aria-label="Log Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </aside>

      {/* -------------------------------------------------------------
          3. MOBILE BOTTOM NAVIGATION BAR (Mobile: <md)
         ------------------------------------------------------------- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-around z-40 px-2 shadow-lg transition-colors duration-250">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center justify-center w-20 h-full text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-all duration-150 cursor-pointer
                ${isActive ? 'text-blue-600 dark:text-blue-400 font-semibold scale-105' : ''}
              `}
              title={item.label}
              aria-label={item.label}
            >
              <div className="relative p-1">
                <Icon className="w-6 h-6" />
              </div>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}

export default memo(Sidebar);
