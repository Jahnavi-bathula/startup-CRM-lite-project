import React, { useState, useMemo, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { LayoutGrid, Table as TableIcon, Plus, Download } from 'lucide-react';

// Import Context Hooks
import { useLeads } from '../context/LeadContext';

// Import child components
import LeadForm from '../components/leads/LeadForm';
import LeadCard from '../components/leads/LeadCard';
import LeadTable from '../components/leads/LeadTable';
import LeadDetailsDrawer from '../components/leads/LeadDetailsDrawer';

// Import common filters & components
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';

// Export Utils
import { exportToCSV } from '../utils/exportUtils';

export default function Leads() {
  const { leads, addLead, updateLead, deleteLead } = useLeads();

  // UI state toggles
  const [viewMode, setViewMode] = useState('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Drawer states
  const [detailLead, setDetailLead] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // --- Action Callback Handlers ---
  const handleOpenCreateModal = useCallback(() => {
    setSelectedLead(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedLead(null);
  }, []);

  const handleSelectLead = useCallback((lead) => {
    setDetailLead(lead);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setDetailLead(null);
  }, []);

  const handleDeleteLead = useCallback((id) => {
    const targetLead = leads.find((l) => l.id === id || l._id === id);
    deleteLead(id);
    
    toast.error(`Deleted lead "${targetLead?.name || 'Lead'}"`, {
      style: {
        background: '#EF4444',
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: '13px'
      },
      iconTheme: {
        primary: '#FFFFFF',
        secondary: '#EF4444'
      }
    });
  }, [leads, deleteLead]);

  const handleFormSubmit = useCallback((formData) => {
    const mappedData = {
      ...formData,
      status: formData.stage
    };

    const targetId = selectedLead ? (selectedLead.id || selectedLead._id) : null;

    if (selectedLead) {
      updateLead(targetId, mappedData);
      toast.success(`Successfully updated lead "${formData.name}"`, {
        style: {
          background: '#22C55E',
          color: '#FFFFFF',
          fontWeight: '600',
          fontSize: '13px'
        }
      });
    } else {
      addLead(mappedData);
      toast.success(`Successfully added lead "${formData.name}"`, {
        style: {
          background: '#22C55E',
          color: '#FFFFFF',
          fontWeight: '600',
          fontSize: '13px'
        }
      });
    }

    setIsModalOpen(false);
  }, [selectedLead, addLead, updateLead]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setActiveFilter('All');
  }, []);

  // Filter Leads
  const filteredLeads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return leads
      .filter(lead => activeFilter === 'All' || lead.status === activeFilter)
      .filter(lead =>
        !query ||
        lead.name.toLowerCase().includes(query) ||
        lead.company.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query)
      );
  }, [leads, activeFilter, searchQuery]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-zinc-950 overflow-hidden transition-colors duration-200">
      
      {/* Toast Notification */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header controls */}
      <header className="p-6 md:p-8 flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight">Leads Directory</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Manage and track your active sales pipeline leads.</p>
        </div>

        {/* Action Button CTAs */}
        <div className="flex items-center gap-3">
          {/* CSV Export */}
          <button
            onClick={() => exportToCSV(leads, 'leads_directory')}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-semibold text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer min-h-[40px]"
            title="Export leads list to CSV file"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Layout switches (visible only on Tablet) */}
          <div className="hidden md:flex lg:hidden items-center border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700'}`}
              title="Table Layout View"
            >
              <TableIcon className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-md transition-colors cursor-pointer ${viewMode === 'card' ? 'bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700'}`}
              title="Card Grid Layout View"
            >
              <LayoutGrid className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Add New Lead button */}
          <button 
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs rounded-lg shadow-md shadow-blue-500/10 transition-all cursor-pointer min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </header>

      {/* Directory content section */}
      <section className="flex-1 overflow-hidden px-6 md:px-8 pb-6 md:pb-8 flex flex-col min-h-0">
        
        {/* Search & Filter row */}
        <div className="mb-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <div className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 shrink-0">
              Showing {filteredLeads.length} of {leads.length} leads
            </div>
          </div>

          <FilterBar 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter} 
            leads={leads} 
          />
        </div>

        {/* Dynamic Layout Panel */}
        <div className="flex-1 overflow-y-auto">
          {filteredLeads.length === 0 ? (
            <EmptyState 
              totalLeadsCount={leads.length} 
              onClearFilters={handleClearFilters} 
            />
          ) : (
            <>
              {/* 1. Mobile Render: Card grid layout only */}
              <div className="block md:hidden">
                <div className="grid grid-cols-1 gap-4">
                  {filteredLeads.map((lead) => (
                    <LeadCard 
                      key={lead.id || lead._id} 
                      lead={lead} 
                      onEdit={handleOpenEditModal} 
                      onDelete={handleDeleteLead}
                      onSelectLead={handleSelectLead}
                    />
                  ))}
                </div>
              </div>

              {/* 2. Tablet Render: Hybrid layout */}
              <div className="hidden md:block lg:hidden">
                {viewMode === 'table' ? (
                  <LeadTable 
                    leads={filteredLeads} 
                    onEdit={handleOpenEditModal} 
                    onDelete={handleDeleteLead} 
                    onSelectLead={handleSelectLead}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    {filteredLeads.map((lead) => (
                      <LeadCard 
                        key={lead.id || lead._id} 
                        lead={lead} 
                        onEdit={handleOpenEditModal} 
                        onDelete={handleDeleteLead} 
                        onSelectLead={handleSelectLead}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Desktop Render: Full table layout */}
              <div className="hidden lg:block">
                <LeadTable 
                  leads={filteredLeads} 
                  onEdit={handleOpenEditModal} 
                  onDelete={handleDeleteLead} 
                  onSelectLead={handleSelectLead}
                />
              </div>
            </>
          )}
        </div>

      </section>

      {/* --- ADD / EDIT OVERLAY DIALOG MODAL --- */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={selectedLead ? 'Edit Lead Profile' : 'Add New Lead'}
      >
        <LeadForm 
          initialData={selectedLead} 
          onSubmit={handleFormSubmit} 
          onCancel={handleCloseModal} 
        />
      </Modal>

      {/* Sliding Lead Details Drawer Overlay */}
      <LeadDetailsDrawer
        lead={detailLead}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onUpdateLead={updateLead}
      />

    </div>
  );
}
