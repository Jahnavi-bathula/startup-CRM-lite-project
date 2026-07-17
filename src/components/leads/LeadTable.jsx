import React from 'react';
import { Pencil, Trash2, Mail, Calendar, Sparkles } from 'lucide-react';
import StatusBadge from './StatusBadge';

/**
 * LeadTable Component
 * Renders a clean data table for listing lead parameters on larger screens.
 */
function LeadTable({ leads, onEdit, onDelete, onSelectLead }) {
  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl shadow-sm">
      <table className="w-full text-left text-xs border-collapse">
        {/* Table Headers */}
        <thead>
          <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 bg-slate-50/50 dark:bg-zinc-900/30">
            <th className="p-4 font-semibold">Lead Details</th>
            <th className="p-4 font-semibold">Company</th>
            <th className="p-4 font-semibold">AI Score</th>
            <th className="p-4 font-semibold">Priority</th>
            <th className="p-4 font-semibold">Status</th>
            <th className="p-4 font-semibold hidden lg:table-cell">Email Address</th>
            <th className="p-4 font-semibold text-center hidden lg:table-cell">Lead Source</th>
            <th className="p-4 font-semibold text-center">Actions</th>
          </tr>
        </thead>
        
        {/* Table Rows */}
        <tbody>
          {leads.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center p-12 text-slate-400 dark:text-zinc-500">
                No leads recorded in this section.
              </td>
            </tr>
          ) : (
            leads.map((lead) => {
              const initials = lead.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <tr 
                  key={lead.id || lead._id} 
                  className="border-b border-slate-100 dark:border-zinc-805/40 hover:bg-slate-50/40 dark:hover:bg-zinc-900/20 transition-colors"
                >
                  {/* Lead Name & Avatar */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-slate-700 dark:text-zinc-300 text-[10px] select-none shrink-0">
                        {initials}
                      </div>
                      <button
                        onClick={() => onSelectLead(lead)}
                        className="font-semibold text-slate-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline text-left cursor-pointer focus:outline-none"
                      >
                        {lead.name}
                      </button>
                    </div>
                  </td>

                  {/* Company name */}
                  <td className="p-4 text-slate-500 dark:text-zinc-400 font-medium">{lead.company}</td>

                  {/* AI Score */}
                  <td className="p-4">
                    <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-zinc-200">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      <span>{lead.leadScore || 30}</span>
                    </div>
                  </td>

                  {/* Priority Badge */}
                  <td className="p-4">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      lead.priority === 'High' 
                        ? 'badge-priority-high' 
                        : lead.priority === 'Low'
                          ? 'badge-priority-low'
                          : 'badge-priority-medium'
                    }`}>
                      {lead.priority || 'Medium'}
                    </span>
                  </td>

                  {/* Status badge */}
                  <td className="p-4">
                    <StatusBadge status={lead.status || lead.stage} />
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

                  {/* Actions Column */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* Edit Row button */}
                      <button 
                        onClick={() => onEdit(lead)}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Edit lead details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Row button */}
                      <button 
                        onClick={() => onDelete(lead.id || lead._id)}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Delete lead details"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
