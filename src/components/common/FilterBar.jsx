import React, { useMemo } from 'react';
import { STATUS_OPTIONS } from '../../constants';

/**
 * FilterBar Component
 * Renders a row of category pills to filter leads by their pipeline status.
 * Highlights the active filter and calculates lead counts for each state.
 * 
 * @param {Object} props - Component properties
 * @param {string} props.activeFilter - The active status filter selection key (e.g. 'All', 'New')
 * @param {Function} props.onFilterChange - Callback invoked when a user clicks a status filter button
 * @param {Array<Object>} props.leads - The complete unfiltered leads array to calculate tally counts
 * @returns {React.ReactElement} The horizontal filter bar layout
 */
function FilterBar({ activeFilter, onFilterChange, leads }) {
  // Ordered array of status keys and display names mapping the CRM specifications
  const filters = useMemo(() => [
    { key: 'All', label: 'All' },
    ...STATUS_OPTIONS.map(status => ({ key: status, label: status }))
  ], []);

  /**
   * Helper to calculate the lead volume inside a status segment
   * Handles properties mapping (supports either 'status' or 'stage' key names)
   * @param {string} key - The status category filter key
   * @returns {number} The count of leads matching the status
   */
  const getFilterCount = (key) => {
    if (key === 'All') return leads.length; // Return complete total for the All filter
    return leads.filter(lead => {
      const currentStatus = lead.status || lead.stage; // Check both status or stage keys
      return currentStatus === key;
    }).length;
  };

  return (
    <div 
      className="flex gap-2 overflow-x-auto pb-2 shrink-0 select-none scrollbar-none"
      role="tablist"
      aria-label="Filter leads by stage"
    >
      {filters.map((filter) => {
        const isActive = activeFilter === filter.key; // Flag indicating if item is selected
        const count = getFilterCount(filter.key); // Calculate dynamic lead count

        return (
          <button
            key={filter.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onFilterChange(filter.key)}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 border
              ${isActive
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/10'
                : 'bg-white hover:bg-slate-50 border-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800/50 dark:border-zinc-800 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }
            `}
          >
            <span>{filter.label} <span className={isActive ? 'text-blue-100' : 'text-slate-400 dark:text-zinc-500'}>({count})</span></span>
          </button>
        );
      })}
    </div>
  );
}

export default React.memo(FilterBar);
