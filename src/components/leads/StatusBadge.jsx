import { memo } from 'react'; // Import memo hook

// Status mapping for background, text, and border styling to avoid dynamic Tailwind compiles (static, outside scope)
const STYLES_MAP = {
  'New': {
    bg: 'bg-slate-100 dark:bg-zinc-800',
    text: 'text-slate-650 dark:text-zinc-400',
    border: 'border-slate-200 dark:border-zinc-700',
    dot: 'bg-slate-400 dark:bg-zinc-500'
  },
  'Contacted': {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-900/30',
    dot: 'bg-blue-500 dark:bg-blue-400'
  },
  'Meeting Scheduled': {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-900/30',
    dot: 'bg-amber-500 dark:bg-amber-400'
  },
  'Proposal Sent': {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-100 dark:border-purple-900/30',
    dot: 'bg-purple-500 dark:bg-purple-400'
  },
  'Won': {
    bg: 'bg-green-50 dark:bg-green-950/20',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-100 dark:border-green-900/30',
    dot: 'bg-green-500 dark:bg-green-400'
  },
  'Lost': {
    bg: 'bg-red-50 dark:bg-red-950/20',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-100 dark:border-red-900/30',
    dot: 'bg-red-500 dark:bg-red-400'
  }
};

/**
 * StatusBadge Component
 * Renders a pill-shaped semantic color badge based on the lead's status/stage.
 * Adheres to accessibility contrast rules and light/dark theme specifications.
 */
function StatusBadge({ status }) {
  // Select styles based on status string (fallback to 'New' if mismatch)
  const activeStyle = STYLES_MAP[status] || STYLES_MAP['New'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-xs font-semibold select-none ${activeStyle.bg} ${activeStyle.text} ${activeStyle.border}`}>
      {/* Small bullet indicator dot */}
      <span className={`w-1.5 h-1.5 rounded-full ${activeStyle.dot}`} />
      {status}
    </span>
  );
}

export default memo(StatusBadge);

