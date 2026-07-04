import React from 'react'; // Import React library to create the functional component
import { Plus, Users, Download } from 'lucide-react'; // Import Lucide icons for visual actions

/**
 * QuickActions Component
 * Provides action shortcut buttons for standard workspace workflows.
 * 
 * @param {Object} props - Component properties
 * @param {Function} props.onAddNewLead - Callback function triggered when "Add New Lead" is clicked
 * @param {Function} props.onViewAllLeads - Callback function triggered when "View All Leads" is clicked
 * @param {Function} props.onExportData - Callback function triggered when "Export Data" is clicked
 * @returns {React.ReactElement} The styled actions panel card
 */
function QuickActions({ onAddNewLead, onViewAllLeads, onExportData }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-6 rounded-xl shadow-sm">
      
      {/* Title Header Section */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">Quick Workspace Actions</h3>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">Fast-track administrative functions</p>
      </div>

      {/* Actions Button Grid */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Add New Lead CTA */}
        <button 
          onClick={onAddNewLead}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs rounded-lg shadow-md shadow-blue-500/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Lead
        </button>

        {/* View All Leads Link */}
        <button 
          onClick={onViewAllLeads}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800/50 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-xs rounded-lg transition-all cursor-pointer"
        >
          <Users className="w-4 h-4 text-slate-500" />
          View All Leads
        </button>

        {/* Export Data Action */}
        <button 
          onClick={onExportData}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800/50 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-xs rounded-lg transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Data
        </button>
      </div>

    </div>
  );
}

export default React.memo(QuickActions);
