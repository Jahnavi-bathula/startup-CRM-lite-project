import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

/**
 * Login Page Component
 * Renders a premium, accessible login form styled with glassmorphic cards,
 * responsive layouts, dynamic input focus highlights, and button loading shimmers.
 */
export default function Login() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    try {
      setErrorMsg('');
      await login(formData.email.trim(), formData.password);
      // On success, redirect to dashboard
      navigate('/');
    } catch (err) {
      // The toast notification handles showing server error messages
      setErrorMsg(err.response?.data?.message || 'Login failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4 sm:p-6 transition-colors duration-200">
      
      {/* Background Decorative Blur Rings */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      {/* Main Login Card Container */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xl shadow-slate-100 dark:shadow-black/20 p-6 sm:p-8 transition-all duration-200">
        
        {/* AeroCorp Branding Header */}
        <header className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30 mb-4 select-none animate-bounce">
            A
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5">Sign in to your AeroCorp CRM command hub.</p>
        </header>

        {/* Local validation error state display */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-650 dark:text-red-400 text-xs font-semibold leading-relaxed animate-shake">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          
          {/* Email Address Field */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-zinc-500 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-650 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-zinc-500 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-650 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Submit Action CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/70 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed transform active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

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
