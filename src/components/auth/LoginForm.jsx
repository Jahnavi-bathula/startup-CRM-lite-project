import React, { useState, useEffect } from 'react';
import { Mail, Loader2, ArrowRight } from 'lucide-react';
import PasswordInputField from './PasswordInputField';

/**
 * LoginForm Component
 * Renders the email, password, remember me, and forgot password controls.
 * Integrates email formatting and non-empty validations.
 * 
 * @param {Object} props - Component properties
 * @param {Function} props.onSubmit - Function calling standard Auth login API
 * @param {boolean} props.isLoading - Sign in loading status state
 * @param {Function} props.onForgotPassword - Callback when Forgot Password is clicked
 * @returns {React.ReactElement} The Login Form Component
 */
export default function LoginForm({ onSubmit, isLoading, onForgotPassword }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Restore email on mount if 'Remember Me' was checked previously
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('crm-remember-email');
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Email format validation check
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      setErrorMsg('Email address is required.');
      return;
    }
    if (!emailPattern.test(formData.email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // Password validation check
    if (!formData.password) {
      setErrorMsg('Password is required.');
      return;
    }

    // Save/delete remembered email
    if (rememberMe) {
      localStorage.setItem('crm-remember-email', formData.email.trim());
    } else {
      localStorage.removeItem('crm-remember-email');
    }

    setErrorMsg('');
    onSubmit(formData.email.trim(), formData.password);
  };

  return (
    <div className="w-full">
      {/* Local validation error state display */}
      {errorMsg && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold leading-relaxed animate-shake">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-5" noValidate>
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

        {/* Password Input Field (Reusable Component) */}
        <PasswordInputField
          id="login-password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />

        {/* Remember Me & Forgot Password Links */}
        <div className="flex items-center justify-between text-xs select-none">
          <label className="flex items-center gap-2 font-semibold text-slate-650 dark:text-zinc-450 hover:text-slate-800 dark:hover:text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-zinc-800 text-blue-650 focus:ring-blue-500/20 transition-all cursor-pointer"
            />
            Remember Me
          </label>
          
          <button
            type="button"
            onClick={() => onForgotPassword(formData.email)}
            className="text-blue-650 dark:text-blue-400 font-bold hover:underline cursor-pointer focus:outline-none"
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit Action Button */}
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
    </div>
  );
}
