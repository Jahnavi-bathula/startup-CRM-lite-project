import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import toast from 'react-hot-toast';

// Create Auth Context with default undefined
const AuthContext = createContext(undefined);

/**
 * AuthProvider Component
 * Manages user authentication state, token storage, and session restoration on startup.
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child elements
 * @returns {React.ReactElement} The Auth Context Provider
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('crm-token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // On component mount, check for the presence of a token and restore user profile session
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('crm-token');
      if (storedToken) {
        try {
          // getProfile returns the unwrapped Axios response.data: { success, message, data: user }
          const responseData = await authService.getProfile();
          setUser(responseData.data);
          setToken(storedToken);
        } catch (error) {
          console.error('Session restoration failed:', error);
          // Token is likely invalid or expired, clean up
          localStorage.removeItem('crm-token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  /**
   * Login user with email and password credentials.
   */
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      // login returns unwrapped response.data: { success, message, data: { token, user } }
      const responseData = await authService.login(email, password);
      const { token: receivedToken, user: receivedUser } = responseData.data;

      localStorage.setItem('crm-token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);

      toast.success(responseData.message || 'Login successful!');
      return responseData.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMsg, {
        style: {
          background: '#EF4444',
          color: '#FFFFFF',
          fontWeight: '600'
        }
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register a new user and login.
   */
  const register = useCallback(async (name, email, password) => {
    setIsLoading(true);
    try {
      // register returns unwrapped response.data: { success, message, data: { token, user } }
      const responseData = await authService.register(name, email, password);
      const { token: receivedToken, user: receivedUser } = responseData.data;

      localStorage.setItem('crm-token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);

      toast.success(responseData.message || 'Registration successful!');
      return responseData.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed. Try again.';
      toast.error(errorMsg, {
        style: {
          background: '#EF4444',
          color: '#FFFFFF',
          fontWeight: '600'
        }
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Log out active user session.
   * Clears state contexts and redirects the client to the login page.
   */
  const logout = useCallback(() => {
    authService.logout(); // Removes token from localStorage
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  }, [navigate]);

  // Memoize context attributes to avoid redundant re-renders
  const contextValue = useMemo(() => ({
    user,
    token,
    isLoading,
    login,
    register,
    logout
  }), [user, token, isLoading, login, register, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Custom Hook
 * Hook interface accessing authentication details.
 * 
 * @returns {Object} Authentication state variables and functions
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
