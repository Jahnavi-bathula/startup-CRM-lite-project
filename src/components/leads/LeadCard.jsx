import React from 'react'; // Import React library to create the functional component
import { Pencil, Trash2, Mail, Phone, Calendar, Tag } from 'lucide-react'; // Import Lucide icons for cards structure
import StatusBadge from './StatusBadge'; // Import visual status badges component

/**
 * LeadCard Component
 * Displays a single lead's parameters inside an elevated card.
 * Includes visual details (avatar, name, company, status, phone, email) and action triggers (edit/delete).
 * Optimized for grid/column listing layouts.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.lead - The lead data object containing parameters (id, name, company, email, phone, stage, source, date)
 * @param {Function} props.onEdit - Callback function triggered when the edit button (pencil) is clicked
 * @param {Function} props.onDelete - Callback function triggered when the delete button (trash) is clicked
 * @returns {React.ReactElement} The styled lead card element
 */
function LeadCard({ lead, onEdit, onDelete }) {
  // Generate user avatar initials
  const initials = lead.name
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl p-5 shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all duration-200 flex flex-col justify-between h-full">
      
      {/* Card Header Profile Row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {/* Circular initials badge */}
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-slate-700 dark:text-zinc-300 text-xs shrink-0 select-none">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-900 dark:text-zinc-50 truncate leading-tight text-sm">{lead.name}</span>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">{lead.company}</span>
          </div>
        </div>
        
        {/* Render visual status badge */}
        <div className="shrink-0">
          <StatusBadge status={lead.status || lead.stage} />
        </div>
      </div>

      {/* Card Body Contact Row */}
      <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-zinc-800/60 pt-4 mb-4 text-slate-600 dark:text-zinc-400 text-xs">
        
        {/* Email contact link */}
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <a 
            href={`mailto:${lead.email}`} 
            className="hover:text-blue-600 dark:hover:text-blue-400 truncate hover:underline"
            title={`Mail to ${lead.email}`}
          >
            {lead.email}
          </a>
        </div>

        {/* Phone contact link */}
        {lead.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <a 
              href={`tel:${lead.phone}`} 
              className="hover:text-blue-600 dark:hover:text-blue-400 truncate hover:underline"
              title={`Call ${lead.phone}`}
            >
              {lead.phone}
            </a>
          </div>
        )}

        {/* Lead Source */}
        {lead.source && (
          <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-zinc-500">
            <Tag className="w-3.5 h-3.5 shrink-0" />
            <span>Source: {lead.source}</span>
          </div>
        )}
      </div>

      {/* Card Footer Action Row */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800/60 pt-3 text-[10px] text-slate-400 dark:text-zinc-500">
        
        {/* Date tracker */}
        <span className="flex items-center gap-1 font-medium">
          <Calendar className="w-3 h-3" />
          {lead.date || 'Just now'}
        </span>

        {/* Edit and Delete action CTAs */}
        <div className="flex items-center gap-2">
          {/* Pencil Edit button */}
          <button 
            onClick={() => onEdit(lead)}
            className="w-11 h-11 md:w-7 md:h-7 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer focus:outline-none"
            title="Edit lead attributes"
            aria-label={`Edit ${lead.name}`}
          >
            <Pencil className="w-5 h-5 md:w-3.5 md:h-3.5" />
          </button>
          
          {/* Trash Delete button */}
          <button 
            onClick={() => onDelete(lead.id)}
            className="w-11 h-11 md:w-7 md:h-7 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Delete lead from pipeline"
            aria-label={`Delete ${lead.name}`}
          >
            <Trash2 className="w-5 h-5 md:w-3.5 md:h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}

export default React.memo(LeadCard);
