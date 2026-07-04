import { memo } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * DarkModeToggle Component
 * Renders a sliding theme toggle switch with sun and moon icons.
 * Features a smooth transform animation when toggled.
 */
function DarkModeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {/* Visual toggle switch */}
      <button
        onClick={toggleTheme}
        className="relative flex items-center justify-between w-14 h-8 bg-slate-100 dark:bg-zinc-800 rounded-full p-1 cursor-pointer transition-all duration-300 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-650 focus:outline-none"
        aria-label="Toggle visual theme"
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {/* Underlay icons */}
        <Sun className="w-3.5 h-3.5 text-amber-500 ml-1 select-none" />
        <Moon className="w-3.5 h-3.5 text-indigo-400 mr-1 select-none" />

        {/* Sliding toggle knob */}
        <span
          className={`absolute top-0.5 left-0.5 w-6.5 h-6.5 bg-white dark:bg-zinc-950 border border-slate-200/40 dark:border-zinc-800 rounded-full shadow flex items-center justify-center transition-transform duration-300 ease-out transform ${
            isDarkMode ? 'translate-x-[24px]' : 'translate-x-0'
          }`}
        >
          {isDarkMode ? (
            <Moon className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
          )}
        </span>
      </button>
      
      {/* Current mode text indicator */}
      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider select-none hidden sm:inline">
        {isDarkMode ? 'Dark' : 'Light'}
      </span>
    </div>
  );
}

export default memo(DarkModeToggle);

