import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Plus } from 'lucide-react';

/**
 * Empty state component rendered when no lead records exist in the database.
 * Prompts the user to create their first lead with a visually premium dashboard card.
 */
export default function EmptyAnalyticsState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center">
      {/* Icon Area with premium glow and animation */}
      <div className="relative mb-6 p-4 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 animate-pulse">
        <BarChart3 className="w-12 h-12" />
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-200 dark:border-blue-800 animate-spin" style={{ animationDuration: '15s' }}></div>
      </div>
      
      {/* Text Hierarchy */}
      <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight">
        No analytics available yet
      </h3>
      <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-sm leading-relaxed">
        Add your first lead to start tracking pipeline health, conversions, revenue, and growth performance.
      </p>

      {/* Action Button */}
      <Link
        to="/leads"
        className="mt-8 flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-xl shadow-sm hover:shadow transition-all duration-150 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Add Lead</span>
      </Link>
    </div>
  );
}
