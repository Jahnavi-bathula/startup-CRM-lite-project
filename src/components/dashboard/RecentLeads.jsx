import React, { useMemo } from 'react'; // Import React and useMemo hook

/**
 * RecentLeads Component
 * Renders a clean table containing the latest 5 lead records in the system.
 * Rows show lead profile details, company, stage status tags, and date added.
 * 
 * @param {Object} props - Component properties
 * @param {Array<Object>} props.leads - The array of lead objects from global CRM state
 * @returns {React.ReactElement} The table listing card
 */
function RecentLeads({ leads }) {
  // Sort leads by added date descending and extract the first 5 opportunities
  const latestLeads = useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [leads]);

  /**
   * Helper function to render a status badge with matching color classes
   * @param {string} stage - The pipeline stage key name
   * @returns {React.ReactElement} The styled tag element
   */
  const renderStatusBadge = (stage) => {
    let badgeClass = 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400';
    let display = stage;

    if (stage === 'Closed-Won') {
      badgeClass = 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400';
      display = 'Won';
    } else if (stage === 'Closed-Lost') {
      badgeClass = 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400';
      display = 'Lost';
    } else if (stage === 'Contacted') {
      badgeClass = 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400';
    } else if (stage === 'Qualified') {
      badgeClass = 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${badgeClass}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {display}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-hidden flex flex-col">
      
      {/* Card Header Panel */}
      <div className="p-5 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">Recent Leads</h3>
        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Latest Activity</span>
      </div>

      {/* Leads Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-zinc-800/80 text-slate-400 dark:text-zinc-500 bg-slate-50/50 dark:bg-zinc-900/30">
              <th className="p-4 font-semibold">Lead Details</th>
              <th className="p-4 font-semibold">Company</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Added Date</th>
            </tr>
          </thead>
          <tbody>
            {latestLeads.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-8 text-slate-400 dark:text-zinc-500">No leads registered.</td>
              </tr>
            ) : (
              latestLeads.map(lead => (
                <tr key={lead.id} className="border-b border-slate-50 dark:border-zinc-800/40 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                  {/* Lead Info with dynamic avatar */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-slate-600 dark:text-zinc-400">
                        {lead.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100">{lead.name}</span>
                    </div>
                  </td>
                  {/* Company */}
                  <td className="p-4 text-slate-500 dark:text-zinc-400 font-medium">{lead.company}</td>
                  {/* Status badge */}
                  <td className="p-4">{renderStatusBadge(lead.stage)}</td>
                  {/* Date */}
                  <td className="p-4 text-right text-slate-400 dark:text-zinc-500 font-medium">{lead.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default React.memo(RecentLeads);
