import React, { useMemo } from 'react'; // Import React library and useMemo hook

// Stage categories definition matching mock data schema (static, declared outside component scope)
const STAGES = [
  { key: 'New', label: 'New', colorBg: 'bg-blue-500', colorText: 'text-blue-500' },
  { key: 'Contacted', label: 'Contacted', colorBg: 'bg-amber-500', colorText: 'text-amber-500' },
  { key: 'Qualified', label: 'Qualified', colorBg: 'bg-purple-500', colorText: 'text-purple-500' },
  { key: 'Closed-Won', label: 'Won', colorBg: 'bg-green-500', colorText: 'text-green-500' },
  { key: 'Closed-Lost', label: 'Lost', colorBg: 'bg-red-500', colorText: 'text-red-500' }
];

/**
 * PipelineOverview Component
 * Takes an array of leads, calculates the volume per status stage, and renders a single horizontal segmented bar chart.
 * Highlights proportions visually using semantic colors.
 * 
 * @param {Object} props - Component properties
 * @param {Array<Object>} props.leads - The array of lead records from the global CRM state
 * @returns {React.ReactElement} The visual horizontal bar card
 */
function PipelineOverview({ leads }) {
  const total = leads.length || 1; // Prevent division-by-zero errors

  // Calculate counts and percentages for each stage (useMemo optimization)
  const stageStats = useMemo(() => {
    return STAGES.map(stage => {
      const count = leads.filter(l => (l.stage === stage.key || l.status === stage.key)).length;
      const percentage = Math.round((count / total) * 100);
      return {
        ...stage,
        count,
        percentage
      };
    });
  }, [leads, total]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-6 rounded-xl shadow-sm">
      
      {/* Title Header Section */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">Pipeline Distribution</h3>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">Visual stage counts and proportions</p>
      </div>

      {/* Segments Progress Bar Container */}
      <div className="h-6 w-full bg-slate-100 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800/60 rounded-lg overflow-hidden flex mb-6">
        {leads.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-zinc-600 text-xs font-semibold">
            No pipeline leads recorded
          </div>
        ) : (
          stageStats.map((stat) => {
            if (stat.count === 0) return null; // Skip rendering segments with zero value
            return (
              <div 
                key={stat.key}
                className={`${stat.colorBg} h-full transition-all duration-500 ease-out`}
                style={{ width: `${stat.percentage}%` }}
                title={`${stat.label}: ${stat.count} leads (${stat.percentage}%)`}
              />
            );
          })
        )}
      </div>

      {/* Color Coded Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stageStats.map(stat => (
          <div key={stat.key} className="flex flex-col border border-slate-100 dark:border-zinc-800/40 p-2.5 rounded-lg bg-slate-50/50 dark:bg-zinc-900/30">
            {/* Color dot and name */}
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${stat.colorBg}`} />
              <span className="font-semibold text-slate-800 dark:text-zinc-200">{stat.label}</span>
            </div>
            {/* Values and percentage */}
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-sm font-bold text-slate-950 dark:text-zinc-50 leading-tight">{stat.count}</span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">({stat.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default React.memo(PipelineOverview);
