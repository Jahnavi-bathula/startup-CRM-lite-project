import React from 'react'; // Import React library to create the functional component
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'; // Import trend indicators for visual growth/decline cues

/**
 * StatsCard Component
 * Displays a single high-level metric card with an icon, value, and growth trend percentage.
 * Designed for responsiveness and theme alignment.
 * 
 * @param {Object} props - Component properties
 * @param {string} props.title - The label header of the metric (e.g., "Total Revenue")
 * @param {string|number} props.value - The main numeric metric value (e.g., "$45,200")
 * @param {React.ComponentType} props.icon - A Lucide Icon component class to display as visual indicator
 * @param {number} props.change - Percentage change compared to previous cycle (can be positive, negative, or zero)
 * @param {'primary'|'success'|'warning'|'danger'} props.color - The semantic theme color category mapping
 * @returns {React.ReactElement} The styled stats card element
 */
function StatsCard({ title, value, icon: Icon, change, color }) {
  // Determine if the trend change is positive or negative
  const isPositive = change >= 0;

  // Semantic color classes definition lookup map to avoid dynamic tailwind compilation issues
  const colorMap = {
    primary: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/30'
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-950/20',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-100 dark:border-green-900/30'
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/30'
    },
    danger: {
      bg: 'bg-red-50 dark:bg-red-950/20',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-100 dark:border-red-900/30'
    }
  };

  // Select color styles based on the color prop (fallback to primary if missing)
  const currentStyles = colorMap[color] || colorMap.primary;

  return (
    <div className={`p-6 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[120px]`}>
      
      {/* Card Header Row */}
      <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-semibold">
        <span className="truncate">{title}</span>
        {/* Render the dynamic Icon component inside a styled circle */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentStyles.bg} ${currentStyles.text}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Card Value and Trend Details Row */}
      <div className="flex items-end justify-between mt-4">
        <div className="flex flex-col">
          {/* Main numeric display */}
          <span className="text-2xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight">{value}</span>
          
          {/* Percentage trend change vs last month */}
          <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold">
            {isPositive ? (
              <span className="flex items-center gap-0.5 text-green-600 dark:text-green-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {change}%
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {Math.abs(change)}%
              </span>
            )}
            <span className="text-slate-400 dark:text-zinc-500">vs last month</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default React.memo(StatsCard);
