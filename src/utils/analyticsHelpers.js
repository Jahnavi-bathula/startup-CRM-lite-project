import { STATUS_COLORS } from '../constants/analyticsColors';

/**
 * Normalizes stage/status names to unified shorter strings.
 * Handles historical and custom database naming variations.
 * 
 * @param {string} status - Raw status/stage name
 * @returns {string} Normalized status
 */
export const normalizeStatus = (status) => {
  if (!status) return 'New';
  const s = status.trim();
  if (s === 'Closed-Won' || s === 'Won') return 'Won';
  if (s === 'Closed-Lost' || s === 'Lost') return 'Lost';
  if (s === 'Meeting Scheduled' || s === 'Meeting') return 'Meeting';
  if (s === 'Proposal Sent' || s === 'Proposal') return 'Proposal';
  return s;
};

/**
 * Checks if a status is considered active (part of the open sales pipeline).
 * 
 * @param {string} status - Raw or normalized status
 * @returns {boolean} True if active, false if Won/Lost
 */
export const isActiveStatus = (status) => {
  const norm = normalizeStatus(status);
  return norm !== 'Won' && norm !== 'Lost';
};

/**
 * Groups leads by status/stage and calculates totals/percentages.
 * 
 * @param {Array} leads - Leads database array
 * @returns {Array} List of grouped status objects for PieChart
 */
export function getStatusDistribution(leads) {
  if (!Array.isArray(leads) || leads.length === 0) return [];
  
  const counts = {};
  leads.forEach(lead => {
    const norm = normalizeStatus(lead.status || lead.stage);
    counts[norm] = (counts[norm] || 0) + 1;
  });

  const total = leads.length;
  
  return Object.keys(counts).map(status => {
    const count = counts[status];
    const percentage = Math.round((count / total) * 100);
    return {
      name: status,
      value: count,
      percentage,
      color: STATUS_COLORS[status] || '#64748B'
    };
  }).sort((a, b) => b.value - a.value);
}

/**
 * Aggregates lead counts over the last 6 months.
 * 
 * @param {Array} leads - Leads database array
 * @returns {Array} Monthly data for BarChart
 */
export function getMonthlyLeads(leads) {
  if (!Array.isArray(leads)) return [];

  // Generate last 6 months labels
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthName = d.toLocaleString('en-US', { month: 'short' });
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyData.push({
      name: monthName,
      value: 0,
      yearMonth
    });
  }

  leads.forEach(lead => {
    if (!lead.createdAt) return;
    const date = new Date(lead.createdAt);
    if (isNaN(date.getTime())) return;
    
    const leadYM = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const matchedMonth = monthlyData.find(m => m.yearMonth === leadYM);
    if (matchedMonth) {
      matchedMonth.value += 1;
    }
  });

  return monthlyData.map(({ name, value }) => ({ name, value }));
}

/**
 * Calculates conversion win rates by month for the last 6 months.
 * 
 * @param {Array} leads - Leads database array
 * @returns {Array} Monthly data for LineChart
 */
export function getConversionByMonth(leads) {
  if (!Array.isArray(leads)) return [];

  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthName = d.toLocaleString('en-US', { month: 'short' });
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyData.push({
      name: monthName,
      total: 0,
      won: 0,
      yearMonth
    });
  }

  leads.forEach(lead => {
    if (!lead.createdAt) return;
    const date = new Date(lead.createdAt);
    if (isNaN(date.getTime())) return;

    const leadYM = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const matchedMonth = monthlyData.find(m => m.yearMonth === leadYM);
    if (matchedMonth) {
      matchedMonth.total += 1;
      if (normalizeStatus(lead.status) === 'Won') {
        matchedMonth.won += 1;
      }
    }
  });

  return monthlyData.map(({ name, total, won }) => ({
    name,
    value: total > 0 ? Math.round((won / total) * 100) : 0
  }));
}

/**
 * Calculates cumulative closed won revenue by month for the last 6 months.
 * 
 * @param {Array} leads - Leads database array
 * @returns {Array} Monthly revenue data for AreaChart
 */
export function getRevenueByMonth(leads) {
  if (!Array.isArray(leads)) return [];

  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthName = d.toLocaleString('en-US', { month: 'short' });
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyData.push({
      name: monthName,
      value: 0,
      yearMonth
    });
  }

  leads.forEach(lead => {
    if (normalizeStatus(lead.status) !== 'Won') return;
    
    // Group won revenue by wonAt date (or fallback to createdAt)
    const rawDate = lead.wonAt || lead.createdAt;
    if (!rawDate) return;
    const date = new Date(rawDate);
    if (isNaN(date.getTime())) return;

    const leadYM = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const matchedMonth = monthlyData.find(m => m.yearMonth === leadYM);
    if (matchedMonth) {
      matchedMonth.value += (Number(lead.value) || 0);
    }
  });

  return monthlyData.map(({ name, value }) => ({ name, value }));
}

/**
 * Sums deal value of active (open pipeline) leads.
 * 
 * @param {Array} leads - Leads database array
 * @returns {number} Sum of active values
 */
export function getPipelineValue(leads) {
  if (!Array.isArray(leads)) return 0;
  return leads
    .filter(lead => isActiveStatus(lead.status || lead.stage))
    .reduce((sum, lead) => sum + (Number(lead.value) || 0), 0);
}

/**
 * Sums deal value of closed won leads.
 * 
 * @param {Array} leads - Leads database array
 * @returns {number} Sum of won values
 */
export function getWonRevenue(leads) {
  if (!Array.isArray(leads)) return 0;
  return leads
    .filter(lead => normalizeStatus(lead.status) === 'Won')
    .reduce((sum, lead) => sum + (Number(lead.value) || 0), 0);
}

/**
 * Computes the average sales cycle duration in days.
 * Calculated as the mean elapsed time between creation and conversion.
 * 
 * @param {Array} leads - Leads database array
 * @returns {number} Mean sales cycle in days
 */
export function getAverageSalesCycle(leads) {
  if (!Array.isArray(leads)) return 0;

  const wonLeads = leads.filter(lead => {
    const norm = normalizeStatus(lead.status);
    return norm === 'Won' && lead.createdAt && (lead.wonAt || lead.date);
  });

  if (wonLeads.length === 0) return 0;

  const totalDays = wonLeads.reduce((sum, lead) => {
    const start = new Date(lead.createdAt);
    const end = new Date(lead.wonAt || lead.date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return sum;
    
    const diffTime = Math.max(0, end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return sum + diffDays;
  }, 0);

  return Math.round(totalDays / wonLeads.length);
}

/**
 * Calculates lost rate percentage.
 * Formula: Lost Leads / Total Leads.
 * 
 * @param {Array} leads - Leads database array
 * @returns {number} Lost rate percentage
 */
export function getLostRate(leads) {
  if (!Array.isArray(leads) || leads.length === 0) return 0;
  const lostCount = leads.filter(lead => normalizeStatus(lead.status) === 'Lost').length;
  return Math.round((lostCount / leads.length) * 100);
}

/**
 * Aggregates counts per sourcing channel, sorted descending.
 * 
 * @param {Array} leads - Leads database array
 * @returns {Array} Array of source counts
 */
export function getLeadSourceStats(leads) {
  if (!Array.isArray(leads)) return [];

  const counts = {};
  leads.forEach(lead => {
    const source = lead.source || 'Other';
    counts[source] = (counts[source] || 0) + 1;
  });

  return Object.keys(counts).map(source => ({
    name: source,
    value: counts[source]
  })).sort((a, b) => b.value - a.value);
}

/**
 * Generates cumulative sales funnel aggregates and step conversion ratios.
 * 
 * @param {Array} leads - Leads database array
 * @returns {Array} Stage statistics
 */
export function getFunnelData(leads) {
  if (!Array.isArray(leads) || leads.length === 0) {
    return [
      { name: 'New', value: 0, conversionRate: 100, dropOffRate: 0 },
      { name: 'Contacted', value: 0, conversionRate: 0, dropOffRate: 0 },
      { name: 'Meeting', value: 0, conversionRate: 0, dropOffRate: 0 },
      { name: 'Proposal', value: 0, conversionRate: 0, dropOffRate: 0 },
      { name: 'Won', value: 0, conversionRate: 0, dropOffRate: 0 }
    ];
  }

  // Stages definition
  const stages = ['New', 'Contacted', 'Meeting', 'Proposal', 'Won'];
  const totalLeadsCount = leads.length;

  // Cumulative checks: if a lead is at a later stage, it implicitly counts for previous stages.
  const counts = {
    New: totalLeadsCount,
    Contacted: 0,
    Meeting: 0,
    Proposal: 0,
    Won: 0
  };

  leads.forEach(lead => {
    const norm = normalizeStatus(lead.status);
    
    // Contacted leads: has contactedAt date OR status is Contacted, Meeting, Proposal, Won
    if (lead.contactedAt || ['Contacted', 'Meeting', 'Proposal', 'Won'].includes(norm)) {
      counts.Contacted += 1;
    }
    // Meeting leads: has meetingAt date OR status is Meeting, Proposal, Won
    if (lead.meetingAt || ['Meeting', 'Proposal', 'Won'].includes(norm)) {
      counts.Meeting += 1;
    }
    // Proposal leads: has proposalAt date OR status is Proposal, Won
    if (lead.proposalAt || ['Proposal', 'Won'].includes(norm)) {
      counts.Proposal += 1;
    }
    // Won leads: status is Won
    if (norm === 'Won') {
      counts.Won += 1;
    }
  });

  return stages.map((stage, idx) => {
    const value = counts[stage];
    let conversionRate = 100;
    let dropOffRate = 0;

    if (idx > 0) {
      const prevValue = counts[stages[idx - 1]];
      conversionRate = prevValue > 0 ? Math.round((value / prevValue) * 100) : 0;
      dropOffRate = 100 - conversionRate;
    }

    return {
      name: stage,
      value,
      conversionRate,
      dropOffRate
    };
  });
}

/**
 * Calculates Sales Velocity.
 * Formula: (Opportunities * Win Rate * Avg Deal Size) / Avg Sales Cycle Length
 * Returns speed metric (amount of pipeline closed in Rupees per day)
 * 
 * @param {Array} leads - Leads database array
 * @returns {number} Sales velocity in Rupees per day
 */
export function getSalesVelocity(leads) {
  if (!Array.isArray(leads) || leads.length === 0) return 0;

  const opportunities = leads.length;
  const wonLeads = leads.filter(l => normalizeStatus(l.status) === 'Won');
  const winRate = opportunities > 0 ? (wonLeads.length / opportunities) : 0;
  
  const totalValue = leads.reduce((sum, l) => sum + (Number(l.value) || 0), 0);
  const avgDealSize = opportunities > 0 ? (totalValue / opportunities) : 0;
  
  const salesCycle = Math.max(1, getAverageSalesCycle(leads));

  const velocity = (opportunities * winRate * avgDealSize) / salesCycle;
  return Math.round(velocity);
}

/**
 * Generates revenue forecast for next month based on average of past months.
 * 
 * @param {Array} leads - Leads database array
 * @returns {Object} Predicted revenue, trend percentage, and confidence score
 */
export function getForecastRevenue(leads) {
  const defaultResult = { forecast: 0, confidence: 50, trend: 0 };
  if (!Array.isArray(leads) || leads.length === 0) return defaultResult;

  const monthlyRev = getRevenueByMonth(leads);
  if (monthlyRev.length === 0) return defaultResult;

  const values = monthlyRev.map(m => m.value);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const averageForecast = sum / Math.max(1, monthlyRev.length);

  // Confidence calculations based on pipeline value & deal closing variance
  const pipelineValue = getPipelineValue(leads);
  const winRate = leads.filter(l => normalizeStatus(l.status) === 'Won').length / leads.length;
  
  // Predictability score based on pipeline cover
  const pipelineWeight = averageForecast > 0 ? Math.min(1, (pipelineValue * winRate) / averageForecast) : 0.5;
  const confidence = Math.min(98, Math.max(45, Math.round(55 + (pipelineWeight * 40))));

  // Trend computation vs preceding months
  let trend = 0;
  if (values.length >= 2) {
    const lastMonth = values[values.length - 1];
    const prevMonth = values[values.length - 2];
    trend = prevMonth > 0 ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100) : 0;
  }

  return {
    forecast: Math.round(averageForecast),
    confidence,
    trend
  };
}

/**
 * Ranks Deal Owners by Closed Won revenue.
 * 
 * @param {Array} leads - Leads database array
 * @returns {Array} Leaderboard of performers
 */
export function getTopPerformers(leads) {
  if (!Array.isArray(leads)) return [];

  const repStats = {};
  leads.forEach(lead => {
    const owner = lead.owner || 'Unassigned';
    if (!repStats[owner]) {
      repStats[owner] = { name: owner, value: 0 };
    }
    if (normalizeStatus(lead.status) === 'Won') {
      repStats[owner].value += (Number(lead.value) || 0);
    }
  });

  return Object.values(repStats)
    .filter(r => r.value > 0)
    .sort((a, b) => b.value - a.value);
}

/**
 * Generates an activity log tracking daily created, contacted, or scheduling events.
 * Returns daily aggregate objects for contribution calendar.
 * 
 * @param {Array} leads - Leads database array
 * @returns {Array} Grid points
 */
export function getActivityHeatmapData(leads) {
  if (!Array.isArray(leads)) return [];

  const dailyActivities = {};
  
  // Seed last 30 days
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
    dailyActivities[dateStr] = {
      date: dateStr,
      count: 0,
      details: { created: 0, meetings: 0, calls: 0 }
    };
  }

  leads.forEach(lead => {
    // 1. Leads Created
    if (lead.createdAt) {
      const createdDate = lead.createdAt.split('T')[0];
      if (dailyActivities[createdDate]) {
        dailyActivities[createdDate].details.created += 1;
        dailyActivities[createdDate].count += 1;
      }
    }
    // 2. Meetings Scheduled
    if (lead.meetingAt) {
      const meetingDate = lead.meetingAt.split('T')[0];
      if (dailyActivities[meetingDate]) {
        dailyActivities[meetingDate].details.meetings += 1;
        dailyActivities[meetingDate].count += 1;
      }
    }
    // 3. Calls Logged
    if (lead.contactedAt) {
      const contactedDate = lead.contactedAt.split('T')[0];
      if (dailyActivities[contactedDate]) {
        dailyActivities[contactedDate].details.calls += 1;
        dailyActivities[contactedDate].count += 1;
      }
    }
  });

  return Object.values(dailyActivities);
}
