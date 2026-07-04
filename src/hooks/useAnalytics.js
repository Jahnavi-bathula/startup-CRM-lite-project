import { useState, useMemo, useCallback } from 'react';
import { useLeads } from '../context/LeadContext';
import * as helpers from '../utils/analyticsHelpers';

/**
 * Custom React hook that handles date filtering, memoizes metrics calculation,
 * and tracks comparison data for previous periods.
 * 
 * Supports: 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year', 'Custom Range'.
 */
export default function useAnalytics() {
  const { leads = [] } = useLeads();
  const [dateFilter, setDateFilter] = useState('Last 30 Days');
  const [customRange, setCustomRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Determine current and previous date bounds
  const dateBounds = useMemo(() => {
    const today = new Date();
    // Normalize to end of today
    today.setHours(23, 59, 59, 999);
    
    let currentStart = new Date();
    let currentEnd = new Date(today);
    let previousStart = new Date();
    let previousEnd = new Date();

    switch (dateFilter) {
      case 'Last 7 Days':
        currentStart.setDate(today.getDate() - 6);
        currentStart.setHours(0, 0, 0, 0);
        
        previousStart.setDate(currentStart.getDate() - 7);
        previousStart.setHours(0, 0, 0, 0);
        previousEnd.setDate(currentStart.getDate() - 1);
        previousEnd.setHours(23, 59, 59, 999);
        break;

      case 'Last 30 Days':
        currentStart.setDate(today.getDate() - 29);
        currentStart.setHours(0, 0, 0, 0);
        
        previousStart.setDate(currentStart.getDate() - 30);
        previousStart.setHours(0, 0, 0, 0);
        previousEnd.setDate(currentStart.getDate() - 1);
        previousEnd.setHours(23, 59, 59, 999);
        break;

      case 'Last 90 Days':
        currentStart.setDate(today.getDate() - 89);
        currentStart.setHours(0, 0, 0, 0);
        
        previousStart.setDate(currentStart.getDate() - 90);
        previousStart.setHours(0, 0, 0, 0);
        previousEnd.setDate(currentStart.getDate() - 1);
        previousEnd.setHours(23, 59, 59, 999);
        break;

      case 'This Year':
        currentStart = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
        
        previousStart = new Date(today.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
        previousEnd = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        break;

      case 'Custom Range': {
        if (customRange.startDate) {
          currentStart = new Date(customRange.startDate);
          currentStart.setHours(0, 0, 0, 0);
        } else {
          currentStart.setDate(today.getDate() - 29); // fallback to 30 days
          currentStart.setHours(0, 0, 0, 0);
        }
        
        if (customRange.endDate) {
          currentEnd = new Date(customRange.endDate);
          currentEnd.setHours(23, 59, 59, 999);
        }

        // Calculate previous period of equivalent length
        const diffMs = currentEnd.getTime() - currentStart.getTime();
        const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        
        previousStart = new Date(currentStart);
        previousStart.setDate(currentStart.getDate() - diffDays);
        previousStart.setHours(0, 0, 0, 0);
        
        previousEnd = new Date(currentStart);
        previousEnd.setDate(currentStart.getDate() - 1);
        previousEnd.setHours(23, 59, 59, 999);
        break;
      }

      default:
        // default to last 30 days
        currentStart.setDate(today.getDate() - 29);
        currentStart.setHours(0, 0, 0, 0);
        
        previousStart.setDate(currentStart.getDate() - 30);
        previousStart.setHours(0, 0, 0, 0);
        previousEnd.setDate(currentStart.getDate() - 1);
        previousEnd.setHours(23, 59, 59, 999);
        break;
    }

    return {
      currentStart,
      currentEnd,
      previousStart,
      previousEnd
    };
  }, [dateFilter, customRange]);

  // Filter leads based on bounds
  const filteredLeads = useMemo(() => {
    const { currentStart, currentEnd } = dateBounds;
    return leads.filter(lead => {
      if (!lead.createdAt) return false;
      const date = new Date(lead.createdAt);
      if (isNaN(date.getTime())) return false;
      return date >= currentStart && date <= currentEnd;
    });
  }, [leads, dateBounds]);

  const previousLeads = useMemo(() => {
    const { previousStart, previousEnd } = dateBounds;
    return leads.filter(lead => {
      if (!lead.createdAt) return false;
      const date = new Date(lead.createdAt);
      if (isNaN(date.getTime())) return false;
      return date >= previousStart && date <= previousEnd;
    });
  }, [leads, dateBounds]);

  // Memoized KPI computations
  const metrics = useMemo(() => {
    // Current period metrics
    const currentLeadsCount = filteredLeads.length;
    const currentWonLeadsCount = filteredLeads.filter(l => helpers.normalizeStatus(l.status) === 'Won').length;
    const currentConversionRate = currentLeadsCount > 0 ? Math.round((currentWonLeadsCount / currentLeadsCount) * 100) : 0;
    const currentPipelineVal = helpers.getPipelineValue(filteredLeads);
    const currentWonRev = helpers.getWonRevenue(filteredLeads);
    const currentSalesCycle = helpers.getAverageSalesCycle(filteredLeads);
    const currentLostRate = helpers.getLostRate(filteredLeads);

    // Previous period metrics for growth calculation
    const prevLeadsCount = previousLeads.length;
    const prevWonLeadsCount = previousLeads.filter(l => helpers.normalizeStatus(l.status) === 'Won').length;
    const prevConversionRate = prevLeadsCount > 0 ? Math.round((prevWonLeadsCount / prevLeadsCount) * 100) : 0;
    const prevPipelineVal = helpers.getPipelineValue(previousLeads);
    const prevWonRev = helpers.getWonRevenue(previousLeads);
    const prevSalesCycle = helpers.getAverageSalesCycle(previousLeads);
    const prevLostRate = helpers.getLostRate(previousLeads);

    // Helper for percentage change
    const calculatePctChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      kpis: {
        totalLeads: {
          value: currentLeadsCount,
          change: calculatePctChange(currentLeadsCount, prevLeadsCount)
        },
        conversionRate: {
          value: currentConversionRate,
          change: currentConversionRate - prevConversionRate // rate changes are points
        },
        pipelineValue: {
          value: currentPipelineVal,
          change: calculatePctChange(currentPipelineVal, prevPipelineVal)
        },
        wonRevenue: {
          value: currentWonRev,
          change: calculatePctChange(currentWonRev, prevWonRev)
        },
        averageSalesCycle: {
          value: currentSalesCycle,
          change: prevSalesCycle > 0 ? currentSalesCycle - prevSalesCycle : 0 // days difference
        },
        lostRate: {
          value: currentLostRate,
          change: currentLostRate - prevLostRate // points difference
        }
      },
      // Pie chart status distribution uses filtered leads
      statusDistribution: helpers.getStatusDistribution(filteredLeads),
      
      // Monthly charts represent the overall data for trend completeness
      monthlyLeads: helpers.getMonthlyLeads(leads),
      conversionTrend: helpers.getConversionByMonth(leads),
      revenueTrend: helpers.getRevenueByMonth(leads),
      
      // Sourcing, funnel, leaders, velocity, heatmaps use filtered leads
      sourceStats: helpers.getLeadSourceStats(filteredLeads),
      funnelData: helpers.getFunnelData(filteredLeads),
      salesVelocity: {
        current: helpers.getSalesVelocity(filteredLeads),
        previous: helpers.getSalesVelocity(previousLeads),
        change: calculatePctChange(helpers.getSalesVelocity(filteredLeads), helpers.getSalesVelocity(previousLeads))
      },
      forecast: helpers.getForecastRevenue(filteredLeads),
      topPerformers: helpers.getTopPerformers(filteredLeads),
      activityHeatmap: helpers.getActivityHeatmapData(filteredLeads)
    };
  }, [leads, filteredLeads, previousLeads]);

  const triggerFilterChange = useCallback((filter) => {
    setIsLoading(true);
    setDateFilter(filter);
    // Simulate slight loading to show shimmering animation effect
    setTimeout(() => {
      setIsLoading(false);
    }, 450);
  }, []);

  const triggerCustomRangeChange = useCallback((start, end) => {
    setIsLoading(true);
    setCustomRange({ startDate: start, endDate: end });
    setTimeout(() => {
      setIsLoading(false);
    }, 450);
  }, []);

  return {
    leads: filteredLeads,
    totalLeadsCount: leads.length,
    dateFilter,
    customRange,
    isLoading,
    metrics,
    setDateFilter: triggerFilterChange,
    setCustomRange: triggerCustomRangeChange
  };
}
