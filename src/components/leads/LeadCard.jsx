import React from 'react';
import { Pencil, Trash2, Mail, Phone, Calendar, Tag, Sparkles } from 'lucide-react';
import StatusBadge from './StatusBadge';

/**
 * LeadCard Component
 * Displays a single lead's parameters inside an elevated glassmorphic card.
 */
function LeadCard({ lead, onEdit, onDelete, onSelectLead }) {
  const initials = lead.name
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl p-5 shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all duration-200 flex flex-col justify-between h-full relative overflow-hidden">
      
      {/* Decorative glow overlay */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none"></div>

      {/* Card Header Profile Row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-slate-700 dark:text-zinc-300 text-xs shrink-0 select-none">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <button
              onClick={() => onSelectLead(lead)}
              className="font-bold text-slate-900 dark:text-zinc-50 hover:text-blue-500 hover:underline text-left cursor-pointer focus:outline-none truncate text-sm"
            >
              {lead.name}
            </button>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">{lead.company}</span>
          </div>
        </div>
        
        <div className="shrink-0">
          <StatusBadge status={lead.status || lead.stage} />
        </div>
      </div>

      {/* Scoring information row */}
      <div className="flex justify-between items-center bg-slate-50/40 dark:bg-zinc-900/20 border border-slate-100 dark:border-zinc-800 rounded-lg p-2 mb-3 text-[11px]">
        <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-zinc-300">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          Score: {lead.leadScore || 30}
        </span>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
          lead.priority === 'High' 
            ? 'badge-priority-high' 
            : lead.priority === 'Low'
              ? 'badge-priority-low'
              : 'badge-priority-medium'
        }`}>
          {lead.priority || 'Medium'}
        </span>
      </div>

      {/* Card Body Contact Row */}
      <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-zinc-800/60 pt-3 mb-4 text-slate-600 dark:text-zinc-400 text-xs">
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <a 
            href={`mailto:${lead.email}`} 
            className="hover:text-blue-600 dark:hover:text-blue-400 truncate hover:underline"
          >
            {lead.email}
          </a>
        </div>

        {lead.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <a 
              href={`tel:${lead.phone}`} 
              className="hover:text-blue-600 dark:hover:text-blue-400 truncate hover:underline"
            >
              {lead.phone}
            </a>
          </div>
        )}
      </div>

      {/* Card Footer Action Row */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800/60 pt-3 text-[10px] text-slate-400 dark:text-zinc-500">
        <span className="flex items-center gap-1 font-medium">
          <Calendar className="w-3 h-3" />
          {lead.date || 'Just now'}
        </span>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onEdit(lead)}
            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Edit lead attributes"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          
          <button 
            onClick={() => onDelete(lead.id || lead._id)}
            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Delete lead from pipeline"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}

export default React.memo(LeadCard);
