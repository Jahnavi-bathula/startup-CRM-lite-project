import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Loader2, UserPlus } from 'lucide-react';

/**
 * Register Page Component
 * Renders a premium, accessible account creation form styled with glassmorphic cards,
 * dynamic validation errors, input icons, and button loading spinners.
 */
export default function Register() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const validateForm = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
      setErrorMsg('All fields are required.');
      return false;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setErrorMsg('');
      await register(formData.name.trim(), formData.email.trim(), formData.password);
      // On success, redirect to dashboard
      navigate('/');
    } catch (err) {
      const backendMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.message;
      setErrorMsg(backendMessage || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4 sm:p-6 transition-colors duration-200">
      
      {/* Background Decorative Blur Rings */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      {/* Main Register Card Container */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xl shadow-slate-100 dark:shadow-black/20 p-6 sm:p-8 transition-all duration-200">
        
        {/* AeroCRM Branding Header */}
        <header className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30 mb-4 select-none animate-bounce">
            A
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">Create Account</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5">Get started with AeroCRM for free.</p>
        </header>

        {/* Local validation error state display */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-650 dark:text-red-400 text-xs font-semibold leading-relaxed animate-shake">
            {errorMsg}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          
          {/* Full Name Field */}
          <div className="space-y-1.5">
            <label htmlFor="reg-name" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-zinc-500 pointer-events-none">
                <User className="w-4 h-4" />
              </span>
              <input
                id="reg-name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-650 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Email Address Field */}
          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-zinc-500 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="reg-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-650 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label htmlFor="reg-password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-zinc-500 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="reg-password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-650 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <label htmlFor="reg-confirm-password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-zinc-500 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="reg-confirm-password"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-650 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Submit Action CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/70 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed transform active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                Create Account
                <UserPlus className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer redirection link */}
        <footer className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800/80 text-center">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-650 dark:text-blue-400 font-bold hover:underline"
            >
              Sign in instead
            </Link>
          </p>
        </footer>

      </div>
    </div>
  );
}
