import { useState, useEffect, memo } from 'react'; // Import hooks and memo
import { Search, X } from 'lucide-react'; // Import Search and Clear icons from Lucide

/**
 * SearchBar Component
 * Renders a controlled search input with a magnifying glass icon, a clear button,
 * and a 300ms debounce buffer to optimize performance during database queries.
 * 
 * @param {Object} props - Component properties
 * @param {string} props.value - The active search string value from the parent state
 * @param {Function} props.onChange - Callback triggered when search text changes (debounced by 300ms)
 * @returns {React.ReactElement} The styled search bar input field
 */
function SearchBar({ value, onChange }) {
  // Local state to track text input immediately (ensures zero typing lag)
  const [localValue, setLocalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  // Sync local input value if the parent overrides it (e.g. when filters are cleared)
  if (value !== prevValue) {
    setPrevValue(value);
    setLocalValue(value);
  }

  // Debounce effect: waits 300ms of user typing inactivity before firing the onChange callback
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      // Avoid firing redundant events if value is already in sync
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);

    // Cleanup timer if localValue or value changes before the 300ms window expires
    return () => clearTimeout(debounceTimer);
  }, [localValue, onChange, value]);

  /**
   * Action: Reset search input immediately
   */
  const handleClear = () => {
    setLocalValue('');
    onChange(''); // Instantly alert the parent page of the clear action
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Magnifying Glass Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
        <Search className="h-4 w-4" />
      </div>

      {/* Controlled Input Element */}
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        aria-label="Search leads by name, company, or email"
        placeholder="Search by name, company, or email..."
        className="w-full pl-9 pr-9 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-150 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
      />

      {/* Clear Button (appears only when there is text in the search input) */}
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650 dark:hover:text-zinc-250 cursor-pointer"
          title="Clear search text"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default memo(SearchBar);
