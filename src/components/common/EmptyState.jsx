import { Inbox, FilterX } from 'lucide-react'; // Import Lucide icons for empty status visual feedback

/**
 * EmptyState Component
 * Displays helpful, clean instructions when a list is empty.
 * Shows a different visual layout depending on whether the system is empty vs when filters return no matches.
 * 
 * @param {Object} props - Component properties
 * @param {number} props.totalLeadsCount - Total number of leads in the system before filters are applied
 * @param {Function} props.onClearFilters - Callback triggered to clear both search text and filter stage states
 * @returns {React.ReactElement} The empty state visual container
 */
export default function EmptyState({ totalLeadsCount, onClearFilters }) {
  // Flag indicating if the database itself is empty
  const isDatabaseEmpty = totalLeadsCount === 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl shadow-sm min-h-[320px] transition-colors duration-200">
      
      {/* Visual Icon Box */}
      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-250/20 dark:border-zinc-800/30 flex items-center justify-center text-slate-400 dark:text-zinc-500 mb-5 shadow-inner">
        {isDatabaseEmpty ? (
          <Inbox className="w-6 h-6 animate-pulse" />
        ) : (
          <FilterX className="w-6 h-6" />
        )}
      </div>

      {/* Message Header */}
      <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-50 mb-1">
        {isDatabaseEmpty ? 'No leads in pipeline' : 'No leads found'}
      </h3>

      {/* Message Subtext */}
      <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs text-center leading-relaxed mb-6">
        {isDatabaseEmpty 
          ? "Your pipeline is currently empty. Get started by adding a new lead to track deal phases." 
          : "Try modifying or clearing your search and filter settings to locate the desired leads."
        }
      </p>

      {/* Action Button CTA (Rendered only if there are leads in the system but filtered out) */}
      {!isDatabaseEmpty && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-300 transition-colors shadow-sm cursor-pointer"
        >
          Reset Filters
        </button>
      )}

    </div>
  );
}
