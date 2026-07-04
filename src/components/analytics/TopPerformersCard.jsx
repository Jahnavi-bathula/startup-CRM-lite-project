import React from 'react';
import { Trophy, Award, Medal } from 'lucide-react';

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
 * TopPerformersCard Component
 * Displays a ranked leaderboard of deal owners by closed won revenue.
 * 
 * @param {Object} props
 * @param {Array} props.data - Performers stats [{ name, value }]
 */
export default function TopPerformersCard({ data }) {
  const hasData = data && data.length > 0 && data.some(item => item.value > 0);

  // Maximum value for comparative progress bar lengths
  const maxRevenue = hasData ? data[0].value : 1;

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold border border-amber-200">
            <Trophy className="w-3.5 h-3.5" />
          </div>
        );
      case 2:
        return (
          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 font-bold border border-slate-200">
            <Medal className="w-3.5 h-3.5" />
          </div>
        );
      case 3:
        return (
          <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold border border-orange-200">
            <Award className="w-3.5 h-3.5" />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-zinc-900 flex items-center justify-center text-slate-400 dark:text-zinc-500 font-bold border border-slate-100">
            {rank}
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-50">Top Performers</h3>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500">Sales representatives ranked by Closed Won deal value</p>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-44 text-slate-400 dark:text-zinc-500 text-xs">
          No won deals recorded for leaderboard calculation
        </div>
      ) : (
        <div className="space-y-4 my-2">
          {data.slice(0, 5).map((performer, idx) => {
            const rank = idx + 1;
            const pctOfTop = Math.round((performer.value / maxRevenue) * 100);
            const initials = performer.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2);

            return (
              <div key={performer.name} className="flex items-center gap-3">
                {/* Rank indicator */}
                <div className="flex-shrink-0 w-8 flex items-center justify-center">
                  {getRankBadge(rank)}
                </div>

                {/* Rep Avatar */}
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-zinc-400 flex-shrink-0">
                  {initials}
                </div>

                {/* Performer Details & comparative bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800 dark:text-zinc-200 truncate">{performer.name}</span>
                    <span className="font-mono font-bold text-green-600 dark:text-green-400">{formatINR(performer.value)}</span>
                  </div>
                  
                  {/* Progress slide indicator */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        rank === 1 
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500' 
                          : rank === 2 
                            ? 'bg-slate-400 dark:bg-zinc-500' 
                            : rank === 3 
                              ? 'bg-orange-400' 
                              : 'bg-blue-500'
                      }`}
                      style={{ width: `${pctOfTop}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
