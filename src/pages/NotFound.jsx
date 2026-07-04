import React from 'react'; // Import React to build the component
import { Link } from 'react-router-dom'; // Import Link from react-router-dom to navigate internally without page reloads
import { AlertCircle, ArrowLeft } from 'lucide-react'; // Import Lucide icons for UI feedback and navigation arrows

/**
 * NotFound Component
 * Fallback page rendered when a user navigates to an undefined path.
 */
export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-zinc-950 min-h-screen transition-colors duration-200">
      {/* 404 Visual Icon Container */}
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-6 shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>

      {/* Error Typography Hierarchy */}
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight mb-2">404 - Page Not Found</h1>
      <p className="text-slate-500 dark:text-zinc-400 text-sm max-w-sm text-center mb-8">
        The route you are trying to access does not exist or has been moved to a different workspace section.
      </p>

      {/* Back to Safety CTA Button */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-medium text-sm rounded-lg shadow-md shadow-blue-500/10 transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  );
}
