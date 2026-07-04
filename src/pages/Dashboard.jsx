import React, { useMemo, useCallback } from 'react'; // Import React, useMemo, and useCallback hooks
import { useNavigate } from 'react-router-dom'; // Import useNavigate to direct actions between routes
import { DollarSign, Users, Target, PiggyBank } from 'lucide-react'; // Import Lucide icons for stats representation
import { useLeads } from '../context/LeadContext'; // Import lead hook to access CRM leads
import DarkModeToggle from '../components/common/DarkModeToggle';

// Import sub-components
import StatsCard from '../components/dashboard/StatsCard'; // Import custom StatsCard
import PipelineOverview from '../components/dashboard/PipelineOverview'; // Import custom PipelineOverview segment bar
import RecentLeads from '../components/dashboard/RecentLeads'; // Import custom RecentLeads table
import QuickActions from '../components/dashboard/QuickActions'; // Import custom QuickActions panel

// Currency Formatter Utility (Extracted outside the component to avoid recreation on every render)
const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(val);
};

/**
 * Dashboard Page Component
 * Serves as the main workspace landing page.
 * Aggregates analytical cards, pipeline bar ratios, latest opportunities, and quick action macros.
 */
export default function Dashboard() {
  const navigate = useNavigate(); // Initialize useNavigate helper
  const { leads } = useLeads(); // Hook into the global CRM leads database

  // --- Calculations for Metric Totals (useMemo optimization) ---
  const { activeLeads, totalPipeline, conversionRate, avgDealSize } = useMemo(() => {
    const active = leads.filter(l => {
      const status = l.status || l.stage;
      return status !== 'Won' && status !== 'Lost' && status !== 'Closed-Won' && status !== 'Closed-Lost';
    });
    
    const won = leads.filter(l => {
      const status = l.status || l.stage;
      return status === 'Won' || status === 'Closed-Won';
    });
    
    const pipeline = active.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const conversion = leads.length ? Math.round((won.length / leads.length) * 100) : 0;
    const avgDeal = active.length ? Math.round(pipeline / active.length) : 0;

    return {
      activeLeads: active,
      totalPipeline: pipeline,
      conversionRate: conversion,
      avgDealSize: avgDeal
    };
  }, [leads]);

  // --- Action Callback Handlers (useCallback optimization) ---
  const handleAddNewLead = useCallback(() => {
    // Navigates to leads directory page to open creation flow
    navigate('/leads');
  }, [navigate]);

  const handleViewAllLeads = useCallback(() => {
    // Navigates directly to /leads directory
    navigate('/leads');
  }, [navigate]);

  const handleExportData = useCallback(() => {
    // Formulate tabular lead JSON and trigger simulated browser export
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(leads, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', 'crm_leads_export.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [leads]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950 p-6 md:p-8 transition-colors duration-200">
      
      {/* Page Layout Welcome Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight">CRM Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Welcome to your sales metrics command hub.</p>
        </div>

        {/* Unified theme toggle */}
        <DarkModeToggle />
      </header>

      {/* Metrics Section (1 column on mobile, 2 on tablet, 4 on desktop) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard 
          title="Total Pipeline" 
          value={formatCurrency(totalPipeline)} 
          icon={DollarSign} 
          change={12.4} 
          color="primary" 
        />
        <StatsCard 
          title="Active Leads" 
          value={activeLeads.length} 
          icon={Users} 
          change={4.2} 
          color="warning" 
        />
        <StatsCard 
          title="Conversion Rate" 
          value={`${conversionRate}%`} 
          icon={Target} 
          change={-0.8} 
          color="success" 
        />
        <StatsCard 
          title="Avg. Deal Size" 
          value={formatCurrency(avgDealSize)} 
          icon={PiggyBank} 
          change={8.9} 
          color="danger" 
        />
      </section>

      {/* Main Grid Section (2 columns on Desktop, stacked full-width on mobile/tablet) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Recent Leads */}
        <div>
          <RecentLeads leads={leads} />
        </div>

        {/* Right Column: Pipeline Overview + Quick Actions (stacked vertically) */}
        <div className="flex flex-col gap-6">
          <PipelineOverview leads={leads} />
          <QuickActions 
            onAddNewLead={handleAddNewLead} 
            onViewAllLeads={handleViewAllLeads} 
            onExportData={handleExportData} 
          />
        </div>

      </section>
      
    </div>
  );
}
