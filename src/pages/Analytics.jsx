import React from 'react';
import useAnalytics from '../hooks/useAnalytics';
import AnalyticsFilters from '../components/analytics/AnalyticsFilters';
import StatsCards from '../components/analytics/StatsCards';
import PieChartCard from '../components/analytics/PieChartCard';
import FunnelChartCard from '../components/analytics/FunnelChartCard';
import BarChartCard from '../components/analytics/BarChartCard';
import LineChartCard from '../components/analytics/LineChartCard';
import RevenueChartCard from '../components/analytics/RevenueChartCard';
import LeadSourceChart from '../components/analytics/LeadSourceChart';
import SalesVelocityCard from '../components/analytics/SalesVelocityCard';
import ForecastCard from '../components/analytics/ForecastCard';
import ActivityHeatmap from '../components/analytics/ActivityHeatmap';
import TopPerformersCard from '../components/analytics/TopPerformersCard';
import EmptyAnalyticsState from '../components/analytics/EmptyAnalyticsState';
import LoadingSkeleton from '../components/analytics/LoadingSkeleton';

/**
 * Analytics Page Component
 * Serves as the page orchestrator for the Advanced Analytics Dashboard module.
 * Consumes the useAnalytics hook and maps performance states to dynamic visual cards.
 */
export default function Analytics() {
  const {
    totalLeadsCount,
    dateFilter,
    customRange,
    isLoading,
    metrics,
    setDateFilter,
    setCustomRange
  } = useAnalytics();

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950 p-6 md:p-8 transition-colors duration-200">
      
      {/* Page Header Area */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Track sales performance, conversions, pipeline velocity, and growth trends.
          </p>
        </div>
      </header>

      {/* Render Empty State if no lead records exist at all */}
      {totalLeadsCount === 0 ? (
        <EmptyAnalyticsState />
      ) : (
        <div className="space-y-6">
          {/* Header Date Preset/Custom Selectors */}
          <AnalyticsFilters
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            customRange={customRange}
            setCustomRange={setCustomRange}
          />

          {/* Dynamic skeleton overlay during calculations updates */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <div className="space-y-6 animate-fadeIn">
              {/* Row 1: 6 KPI Cards Grid */}
              <StatsCards kpis={metrics.kpis} />

              {/* Rows 2-6: Two-column grid for desktop/tablet, stacked for mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Row 2: Status Distribution Doughnut & Pipeline Funnel */}
                <PieChartCard data={metrics.statusDistribution} />
                <FunnelChartCard data={metrics.funnelData} />

                {/* Row 3: Monthly Leads Trend & Monthly Conversion Rate */}
                <BarChartCard data={metrics.monthlyLeads} />
                <LineChartCard data={metrics.conversionTrend} />

                {/* Row 4: Won Revenue Trend Area & Horizontal Lead Sourcing */}
                <RevenueChartCard data={metrics.revenueTrend} />
                <LeadSourceChart data={metrics.sourceStats} />

                {/* Row 5: Contribution Heatmap & Leaderboard Top Performers */}
                <ActivityHeatmap data={metrics.activityHeatmap} />
                <TopPerformersCard data={metrics.topPerformers} />

                {/* Row 6: Revenue Forecasting & Sales Velocity speed card */}
                <ForecastCard forecastData={metrics.forecast} />
                <SalesVelocityCard velocity={metrics.salesVelocity} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
