import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

/**
 * PasswordInputField Component
 * A reusable password input field with a toggle to show/hide the password.
 * 
 * @param {Object} props - Component properties
 * @param {string} props.id - HTML element id
 * @param {string} props.name - Form element name
 * @param {string} props.value - Controlled input value
 * @param {Function} props.onChange - Input change callback
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.label - Field label
 * @param {boolean} props.required - Indicates if input is required
 * @returns {React.ReactElement} The Password Input Component
 */
export default function PasswordInputField({
  id = 'password',
  name = 'password',
  value,
  onChange,
  placeholder = '••••••••',
  label = 'Password',
  required = true
}) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = (e) => {
    e.preventDefault();
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          {label}
        </label>
      </div>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-zinc-500 pointer-events-none">
          <Lock className="w-4 h-4" />
        </span>
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-650 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200"
        />
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-450 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-350 focus:outline-none cursor-pointer"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
