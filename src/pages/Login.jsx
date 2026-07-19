import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import toast from 'react-hot-toast';
import authService from '../services/authService';

/**
 * Login Page Component
 * Refactored to coordinate modular subcomponents (LoginForm, GoogleLoginButton),
 * handle email validation, remember me cookies, and redirect active session users.
 */
export default function Login() {
  const { login, loginWithGoogle, token, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [localLoading, setLocalLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // 1. Redirect authenticated users to the dashboard page if a session token is active
  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  /**
   * Submits email and password credentials for standard JWT authentication.
   */
  const handleFormSubmit = async (email, password) => {
    setLocalLoading(true);
    setGeneralError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Extract the specific error message from the backend response
      const backendMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.message;
      // Map backend messages to user-friendly display text
      const displayMessage = backendMessage || 'Login failed. Please verify credentials.';
      setGeneralError(displayMessage);
    } finally {
      setLocalLoading(false);
    }
  };


  /**
   * Invoked upon successful Google OAuth authentication.
   * Sends the ID token to the backend for verification and profile mapping.
   */
  const handleGoogleSuccess = async (idToken) => {
    setGoogleLoading(true);
    setGeneralError('');
    try {
      await loginWithGoogle(idToken);
      navigate('/');
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Google Login failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  /**
   * Handles Google client token request failures.
   */
  const handleGoogleFailure = (err) => {
    console.error('Google Sign-In error:', err);
    toast.error('Google authentication failed. Please try again.');
  };

  /**
   * Requests a password reset link for the provided email.
   */
  const handleForgotPassword = async (email) => {
    if (!email) {
      toast.error('Please enter your email address in the Email input field first.');
      return;
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    const toastId = toast.loading('Sending password reset link...');
    try {
      const response = await authService.forgotPassword(email);
      toast.success(response.message || 'If that email exists, we sent a password reset link.', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request reset. Please try again.', { id: toastId });
    }
  };

  const isFormLoading = authLoading || localLoading || googleLoading;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4 sm:p-6 transition-colors duration-200">
      
      {/* Background Decorative Blur Rings */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      {/* Main Login Card Container */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xl shadow-slate-100 dark:shadow-black/20 p-6 sm:p-8 transition-all duration-200">
        
        {/* AeroCRM Branding Header */}
        <header className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30 mb-4 select-none animate-bounce">
            A
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-55 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5">Sign in to your AeroCRM command hub.</p>
        </header>

        {/* Local validation error state display */}
        {generalError && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-650 dark:text-red-400 text-xs font-semibold leading-relaxed animate-shake">
            {generalError}
          </div>
        )}

        {/* Reusable Login Form */}
        <LoginForm
          onSubmit={handleFormSubmit}
          isLoading={isFormLoading}
          onForgotPassword={handleForgotPassword}
        />

        {/* Divider with "OR" */}
        <div className="relative my-6 text-center select-none">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-150 dark:border-zinc-800"></div>
          </div>
          <span className="relative px-3 bg-white dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 text-xxs uppercase font-black tracking-widest">
            OR
          </span>
        </div>

        {/* Reusable Google Sign-In Button */}
        <GoogleLoginButton
          onSuccess={handleGoogleSuccess}
          onFailure={handleGoogleFailure}
          isLoading={googleLoading}
        />

        {/* Footer redirection link */}
        <footer className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800/80 text-center">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-blue-650 dark:text-blue-400 font-bold hover:underline"
            >
              Sign up now
            </Link>
          </p>
        </footer>

      </div>
    </div>
  );
}
