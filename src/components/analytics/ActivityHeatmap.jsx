import React, { useState } from 'react';
import { CalendarRange } from 'lucide-react';

/**
 * Custom Heatmap Block component with hover status tooltip.
 */
function HeatmapBlock({ day }) {
  const [hovered, setHovered] = useState(false);

  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-slate-100 dark:bg-zinc-800 border-slate-200/40';
    if (count === 1) return 'bg-green-100 dark:bg-green-950 border-green-200/10 text-green-700';
    if (count === 2) return 'bg-green-200 dark:bg-green-800 border-green-300/10 text-green-800';
    if (count === 3) return 'bg-green-300 dark:bg-green-600 border-green-400/10 text-green-900';
    return 'bg-green-500 dark:bg-green-400 border-green-600/10 text-white';
  };

  const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div 
      className="relative flex-shrink-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Grid cell square */}
      <div 
        className={`w-5 h-5 rounded-md border ${getHeatmapColor(day.count)} transition-all duration-150 shadow-sm cursor-pointer hover:scale-105 hover:ring-2 hover:ring-blue-500/20`}
      />

      {/* Popover Hover Tooltip */}
      {hovered && (
        <div className="absolute z-30 bottom-7 left-1/2 -translate-x-1/2 w-48 bg-slate-950/95 dark:bg-zinc-950/95 border border-slate-850 dark:border-zinc-850 p-3 rounded-xl shadow-2xl text-white text-xs text-left animate-fadeIn pointer-events-none">
          <p className="font-bold text-slate-300 border-b border-slate-800 pb-1 mb-1">{formattedDate}</p>
          <div className="space-y-0.5 font-medium">
            <p className="text-[11px] font-extrabold text-green-400">Total Actions: {day.count}</p>
            <div className="text-[10px] text-slate-400 font-mono space-y-0.5 mt-1">
              <p>&bull; Created Leads: {day.details.created}</p>
              <p>&bull; Meetings Booked: {day.details.meetings}</p>
              <p>&bull; Contacts Logged: {day.details.calls}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ActivityHeatmap Component
 * Displays the 30-day activity contribution calendar.
 * 
 * @param {Object} props
 * @param {Array} props.data - Daily activity aggregates [{ date, count, details }]
 */
export default function ActivityHeatmap({ data }) {
  const hasData = data && data.length > 0;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-50">Team Activity Heatmap</h3>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500">Daily breakdown of leads created, meetings, and contact logs (last 30 days)</p>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-32 text-slate-400 dark:text-zinc-500 text-xs">
          No activities logged in the last 30 days
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {/* Scrollable grid wrapper to handle mobile widths gracefully */}
          <div className="overflow-x-auto pb-2 flex items-center justify-start sm:justify-center">
            <div className="grid grid-flow-col grid-rows-5 gap-2 p-1 min-w-[280px]">
              {data.map((day, idx) => (
                <HeatmapBlock key={day.date || idx} day={day} />
              ))}
            </div>
          </div>

          {/* Color Scale Legend footer */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-bold border-t border-slate-100 dark:border-zinc-850 pt-3">
            <span className="flex items-center gap-1.5">
              <CalendarRange className="w-3.5 h-3.5" />
              Calendar view
            </span>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-400 mr-1">Less</span>
              <div className="w-3 h-3 rounded bg-slate-100 dark:bg-zinc-800" />
              <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-950" />
              <div className="w-3 h-3 rounded bg-green-200 dark:bg-green-800" />
              <div className="w-3 h-3 rounded bg-green-300 dark:bg-green-600" />
              <div className="w-3 h-3 rounded bg-green-500 dark:bg-green-400" />
              <span className="font-semibold text-slate-400 ml-1">More</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
