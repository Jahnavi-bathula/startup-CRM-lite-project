import React from 'react';
import { Zap, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

/**
 * Formats values into Indian Rupee format.
 */
const formatINR = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * SalesVelocityCard Component
 * Displays the daily sales velocity and shows comparisons.
 * 
 * @param {Object} props
 * @param {Object} props.velocity - Sales velocity aggregates { current, previous, change }
 */
export default function SalesVelocityCard({ velocity }) {
  if (!velocity) return null;

  const hasChange = velocity.change !== undefined && velocity.change !== 0;
  const isBetter = velocity.change > 0;
  
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-50">Sales Velocity</h3>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">Speed of pipeline generation per day</p>
          </div>
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="my-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">
            {formatINR(velocity.current)}
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">/day</span>
        </div>

        {/* Change comparison status */}
        <div className="flex items-center gap-1.5 mt-2">
          {hasChange ? (
            <>
              <span className={`flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                isBetter 
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40' 
                  : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40'
              }`}>
                {isBetter ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {isBetter ? '+' : ''}{velocity.change}%
              </span>
              <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-medium">vs previous period</span>
            </>
          ) : (
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Stable relative to preceding period</span>
          )}
        </div>
      </div>

      {/* Educational Formula Explanation Footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-850 space-y-2">
        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wide">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Formula Breakdown</span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-normal italic">
          (Opportunities &times; Win Rate &times; Avg Deal Size) &divide; Sales Cycle Length
        </p>
      </div>
    </div>
  );
}
