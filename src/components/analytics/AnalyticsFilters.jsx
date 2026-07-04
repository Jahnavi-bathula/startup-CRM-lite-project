import React from 'react';
import { Calendar } from 'lucide-react';

/**
 * AnalyticsFilters Component
 * Provides preset buttons and custom range inputs for date filtering.
 * Uses a clean interactive card design.
 * 
 * @param {Object} props
 * @param {string} props.dateFilter - Active filter name
 * @param {Function} props.setDateFilter - Selector updater
 * @param {Object} props.customRange - Start and End custom date strings
 * @param {Function} props.setCustomRange - Range update trigger
 */
export default function AnalyticsFilters({ dateFilter, setDateFilter, customRange, setCustomRange }) {
  const presets = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year', 'Custom Range'];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-150">
      {/* Title / Description info */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-50">Filter Performance Data</h2>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">Select reporting period to compute dynamic metrics</p>
        </div>
      </div>

      {/* Preset Controls & Custom range inputs */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap bg-slate-100 dark:bg-zinc-950 p-1 border border-slate-200/60 dark:border-zinc-800/60 rounded-xl">
          {presets.map(preset => {
            const isActive = dateFilter === preset;
            return (
              <button
                key={preset}
                onClick={() => setDateFilter(preset)}
                className={`text-xs font-semibold px-3.5 py-2.5 md:px-3 md:py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                {preset}
              </button>
            );
          })}
        </div>

        {/* Custom Range Date Pickers */}
        {dateFilter === 'Custom Range' && (
          <div className="flex items-center gap-2 mt-2 md:mt-0 bg-slate-50 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200/60 dark:border-zinc-800/60 animate-fadeIn">
            <input
              type="date"
              value={customRange.startDate}
              onChange={(e) => setCustomRange(e.target.value, customRange.endDate)}
              className="text-xs md:text-[11px] font-medium bg-transparent border-0 outline-none text-slate-700 dark:text-zinc-300 px-3 py-2.5 md:px-2 md:py-1 focus:ring-0 cursor-pointer"
              placeholder="Start Date"
            />
            <span className="text-slate-400 font-bold text-xs">-</span>
            <input
              type="date"
              value={customRange.endDate}
              onChange={(e) => setCustomRange(customRange.startDate, e.target.value)}
              className="text-xs md:text-[11px] font-medium bg-transparent border-0 outline-none text-slate-700 dark:text-zinc-300 px-3 py-2.5 md:px-2 md:py-1 focus:ring-0 cursor-pointer"
              placeholder="End Date"
            />
          </div>
        )}
      </div>
    </div>
  );
}
