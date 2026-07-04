import React from 'react';

/**
 * Shimmering loading skeleton grid that exactly mirrors the Advanced Analytics Dashboard layout.
 * Provides a smooth transitional loading experience for users.
 */
export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Date Filter Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl">
        <div className="h-4 w-48 bg-slate-200 dark:bg-zinc-800 rounded"></div>
        <div className="h-8 w-64 bg-slate-200 dark:bg-zinc-800 rounded-lg"></div>
      </div>

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-5 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm space-y-3">
            <div className="h-3 w-16 bg-slate-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-6 w-24 bg-slate-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-3 w-12 bg-slate-200 dark:bg-zinc-800 rounded"></div>
          </div>
        ))}
      </div>

      {/* Row 1: Pie Chart & Funnel Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-6 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 w-36 bg-slate-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-3 w-16 bg-slate-200 dark:bg-zinc-800 rounded"></div>
            </div>
            <div className="flex justify-center items-center py-6 h-60">
              <div className="w-40 h-40 rounded-full border-12 border-slate-200 dark:border-zinc-800 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-950"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Bar Chart & Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-6 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm space-y-4">
            <div className="h-4 w-40 bg-slate-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-56 bg-slate-100 dark:bg-zinc-950/60 rounded-xl relative overflow-hidden flex items-end justify-between p-4">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="w-10 bg-slate-200 dark:bg-zinc-800 rounded-t" style={{ height: `${20 + j * 12}%` }}></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Row 3: Revenue Area Chart & Lead Source Horizontal Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-6 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm space-y-4">
            <div className="h-4 w-40 bg-slate-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-56 bg-slate-100 dark:bg-zinc-950/60 rounded-xl flex flex-col justify-between p-4 space-y-3">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-6 w-full bg-slate-200 dark:bg-zinc-800 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Row 4: Heatmap & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-6 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm space-y-4">
            <div className="h-4 w-32 bg-slate-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-32 bg-slate-100 dark:bg-zinc-950/60 rounded-xl p-4 flex flex-wrap gap-1.5">
              {[...Array(30)].map((_, j) => (
                <div key={j} className="w-5 h-5 bg-slate-200 dark:bg-zinc-800 rounded-sm"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
