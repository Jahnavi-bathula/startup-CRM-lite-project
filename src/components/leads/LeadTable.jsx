import React from 'react'; // Import React to create the component
import { Pencil, Trash2, Mail, Calendar } from 'lucide-react'; // Import Lucide icons
import StatusBadge from './StatusBadge'; // Import visual status badges

/**
 * LeadTable Component
 * Renders a clean data table for listing lead parameters on larger screens.
 * Includes column fields for Name, Company, Status, Email, Source, Date Added, and Actions.
 * 
 * @param {Object} props - Component properties
 * @param {Array<Object>} props.leads - The array of leads data records from the parent view state
 * @param {Function} props.onEdit - Callback function triggered when editing a lead row
 * @param {Function} props.onDelete - Callback function triggered when deleting a lead row
 * @returns {React.ReactElement} The styled table component
 */
function LeadTable({ leads, onEdit, onDelete }) {
  

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl shadow-sm">
      <table className="w-full text-left text-xs border-collapse">
        {/* Table Headers */}
        <thead>
          <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 bg-slate-50/50 dark:bg-zinc-900/30">
            <th className="p-4 font-semibold">Lead Details</th>
            <th className="p-4 font-semibold">Company</th>
            <th className="p-4 font-semibold">Status</th>
            <th className="p-4 font-semibold hidden lg:table-cell">Email Address</th>
            <th className="p-4 font-semibold text-center hidden lg:table-cell">Lead Source</th>
            <th className="p-4 font-semibold hidden lg:table-cell">Added Date</th>
            <th className="p-4 font-semibold text-center">Actions</th>
          </tr>
        </thead>
        
        {/* Table Rows */}
        <tbody>
          {leads.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center p-12 text-slate-400 dark:text-zinc-505">
                No leads recorded in this section.
              </td>
            </tr>
          ) : (
            leads.map((lead) => {
              // Generate user initials for the row avatar
              const initials = lead.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <tr 
                  key={lead.id} 
                  className="border-b border-slate-100 dark:border-zinc-805/40 hover:bg-slate-50/40 dark:hover:bg-zinc-900/20 transition-colors"
                >
                  {/* Lead Name & Avatar */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-slate-700 dark:text-zinc-300 text-[10px] select-none">
                        {initials}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100">{lead.name}</span>
                    </div>
                  </td>

                  {/* Company name */}
                  <td className="p-4 text-slate-500 dark:text-zinc-400 font-medium">{lead.company}</td>

                  {/* Status badge */}
                  <td className="p-4">
                    <StatusBadge status={lead.stage} />
                  </td>

                  {/* Email address link (Desktop only) */}
                  <td className="p-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a 
                        href={`mailto:${lead.email}`} 
                        className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-medium text-slate-650 dark:text-zinc-300"
                      >
                        {lead.email}
                      </a>
                    </div>
                  </td>

                  {/* Source identifier (Desktop only) */}
                  <td className="p-4 text-center hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-850 px-2 py-0.5 rounded">
                      {lead.source || 'Website'}
                    </span>
                  </td>

                  {/* Added Date (Desktop only) */}
                  <td className="p-4 text-slate-400 dark:text-zinc-550 font-medium hidden lg:table-cell">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-350" />
                      {lead.date || 'Just now'}
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* Edit Row button */}
                      <button 
                        onClick={() => onEdit(lead)}
                        className="w-9 h-9 lg:w-7 lg:h-7 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Edit lead details"
                        aria-label={`Edit ${lead.name}`}
                      >
                        <Pencil className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                      </button>

                      {/* Delete Row button */}
                      <button 
                        onClick={() => onDelete(lead.id)}
                        className="w-9 h-9 lg:w-7 lg:h-7 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Delete lead details"
                        aria-label={`Delete ${lead.name}`}
                      >
                        <Trash2 className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default React.memo(LeadTable);
