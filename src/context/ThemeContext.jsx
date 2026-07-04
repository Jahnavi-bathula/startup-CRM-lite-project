import { createContext, useContext, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

// Create Theme Context with a default value of undefined
const ThemeContext = createContext(undefined);

/**
 * ThemeProvider Component
 * Manages the application's visual theme state using a boolean.
 * Persists the preference in localStorage and synchronizes with the document element.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child nodes to wrap
 * @returns {React.ReactElement} The Theme Provider wrapper
 */
export function ThemeProvider({ children }) {
  // Initialize dark mode state using useLocalStorage hook, fallback to false
  const [isDarkMode, setIsDarkMode] = useLocalStorage('startup-crm-theme', false);

  // Synchronize 'dark' class on HTML document element whenever theme switches
  useEffect(() => {
    const rootElement = document.documentElement;
    if (isDarkMode) {
      rootElement.classList.add('dark');
    } else {
      rootElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  /**
   * Toggles the theme between light and dark modes.
   * 
   * @returns {void}
   */
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme Hook
 * Helper to easily consume the theme settings context.
 * Throws an error if used outside a ThemeProvider.
 * 
 * @returns {{ isDarkMode: boolean, toggleTheme: Function }} The theme status and toggler function
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { ThemeContext };
