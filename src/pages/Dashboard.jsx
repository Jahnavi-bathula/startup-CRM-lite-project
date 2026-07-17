import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Users, 
  Target, 
  Calendar, 
  CheckSquare, 
  TrendingUp, 
  Activity, 
  Sparkles, 
  ArrowUpRight, 
  Plus, 
  FileText,
  Clock
} from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { useTasks } from '../context/TaskContext';
import { useMeetings } from '../context/MeetingContext';
import DarkModeToggle from '../components/common/DarkModeToggle';
import StatsCard from '../components/dashboard/StatsCard';
import { exportToPDF } from '../utils/exportUtils';

// Recharts components
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { leads, isLoading: leadsLoading } = useLeads();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { meetings, isLoading: meetingsLoading } = useMeetings();

  // Load Dashboard Preferences from localStorage
  const [preferences, setPreferences] = useState({
    showRevenuePrediction: true,
    showTopLeads: true,
    showAgenda: true,
    showSourceChart: true,
    showGrowthMetrics: true
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('crm-dashboard-prefs');
      if (stored) setPreferences(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 1. --- CALCULATIONS & STATS ---
  const stats = useMemo(() => {
    const now = new Date();
    
    // Status mappings
    const active = leads.filter(l => l.status !== 'Won' && l.status !== 'Lost');
    const won = leads.filter(l => l.status === 'Won');
    
    // Weekly / Monthly growth
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfThisWeek = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfLastWeek = new Date(startOfThisWeek.getTime() - 7 * 24 * 60 * 60 * 1000);

    const thisWeekLeads = leads.filter(l => new Date(l.createdAt) >= startOfThisWeek).length;
    const lastWeekLeads = leads.filter(l => {
      const date = new Date(l.createdAt);
      return date >= startOfLastWeek && date < startOfThisWeek;
    }).length;

    const weeklyGrowth = lastWeekLeads > 0 
      ? Math.round(((thisWeekLeads - lastWeekLeads) / lastWeekLeads) * 100) 
      : thisWeekLeads * 100;

    // Conversion rate
    const conversion = leads.length ? Math.round((won.length / leads.length) * 100) : 0;
    
    // Total pipelines
    const pipeline = active.reduce((acc, curr) => acc + (curr.value || 0), 0);

    // Revenue Prediction weighted formula: Won value + 0.5 * Proposal Sent + 0.25 * Meeting Scheduled
    const proposalValue = leads.filter(l => l.status === 'Proposal Sent').reduce((acc, curr) => acc + (curr.value || 0), 0);
    const meetingValue = leads.filter(l => l.status === 'Meeting Scheduled').reduce((acc, curr) => acc + (curr.value || 0), 0);
    const wonValue = won.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const predictedRevenue = wonValue + (0.5 * proposalValue) + (0.25 * meetingValue);

    // Pending items count
    const pendingTasksCount = tasks.filter(t => t.status === 'Pending').length;
    const upcomingMeetingsCount = meetings.filter(m => new Date(m.date) >= startOfToday).length;

    // High Priority Leads (top 5 sorted by AI Score)
    const topLeads = leads
      .filter(l => l.priority === 'High' && l.status !== 'Won' && l.status !== 'Lost')
      .sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0))
      .slice(0, 5);

    // Recently added leads
    const recentLeads = [...leads]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Today's Tasks
    const todayEnd = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);
    const todayTasks = tasks.filter(t => {
      const deadline = new Date(t.deadline);
      return t.status === 'Pending' && deadline <= todayEnd;
    });

    // Upcoming meetings (next 3 days)
    const threeDaysLater = new Date(startOfToday.getTime() + 3 * 24 * 60 * 60 * 1000);
    const soonMeetings = meetings
      .filter(m => {
        const d = new Date(m.date);
        return d >= startOfToday && d <= threeDaysLater;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 4);

    // Feed logs across all leads
    const feedLogs = leads
      .flatMap(l => (l.activities || []).map(act => ({
        ...act,
        leadName: l.name,
        leadId: l._id || l.id,
        company: l.company
      })))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    return {
      activeCount: active.length,
      pipelineValue: pipeline,
      conversionRate: conversion,
      predictedRevenue,
      pendingTasksCount,
      upcomingMeetingsCount,
      weeklyGrowth,
      topLeads,
      recentLeads,
      todayTasks,
      soonMeetings,
      feedLogs
    };
  }, [leads, tasks, meetings]);

  // Chart Data: Source Breakdown
  const sourceChartData = useMemo(() => {
    const counts = {};
    leads.forEach(l => {
      const src = l.source || 'Website';
      counts[src] = (counts[src] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [leads]);

  // Chart Data: Weekly Lead growth simulation (last 6 weeks)
  const growthChartData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekNum = `W${i + 1}`;
      const count = leads.filter(l => {
        const createTime = new Date(l.createdAt);
        const start = new Date(d.getTime() - 7 * 24 * 60 * 60 * 1000);
        return createTime >= start && createTime <= d;
      }).length;
      data.push({ name: weekNum, leads: count });
    }
    return data;
  }, [leads]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

  const handleExportPDF = () => {
    const kpis = {
      totalPipeline: stats.pipelineValue,
      conversionRate: stats.conversionRate,
      activeLeadsCount: stats.activeCount,
      wonCount: leads.filter(l => l.status === 'Won').length
    };
    exportToPDF(leads, kpis, 'AeroCorp Sales Hub Report');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950 p-6 md:p-8 transition-colors duration-200">
      
      {/* Welcome Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
            AeroCorp Hub <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Premium MERN analytics and pipeline coordination engine.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            <FileText className="w-4 h-4" />
            PDF Report
          </button>
          
          <button
            onClick={() => navigate('/leads')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-500/10 transition-colors flex items-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            New Lead
          </button>
        </div>
      </header>

      {/* 2. --- STATS CARDS BLOCK --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard 
          title="Weighted Pipeline" 
          value={`$${stats.pipelineValue.toLocaleString()}`} 
          icon={DollarSign} 
          change={stats.weeklyGrowth} 
          color="primary" 
        />
        <StatsCard 
          title="Active Accounts" 
          value={stats.activeCount} 
          icon={Users} 
          change={4} 
          color="warning" 
        />
        <StatsCard 
          title="Won Conversion Rate" 
          value={`${stats.conversionRate}%`} 
          icon={Target} 
          change={2} 
          color="success" 
        />
        <StatsCard 
          title="Action Items" 
          value={stats.pendingTasksCount + stats.upcomingMeetingsCount} 
          icon={CheckSquare} 
          change={-5} 
          color="danger" 
        />
      </section>

      {/* 3. --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Revenue Prediction Card (Toggleable preference) */}
          {preferences.showRevenuePrediction && (
            <div className="glass-panel border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 relative overflow-hidden shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Background gradient blur */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl"></div>
              
              <div className="flex flex-col gap-1.5 relative z-10">
                <span className="text-[10px] text-blue-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Forecasting
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-50">Revenue Prediction</h3>
                <p className="text-xs text-slate-400 leading-snug max-w-sm">Weighted projection using conversion ratios, meeting stages, and pending pipeline value.</p>
              </div>

              <div className="flex flex-col text-right relative z-10">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Closure</span>
                <div className="text-3xl font-black text-slate-900 dark:text-zinc-50 mt-1">
                  ${Math.round(stats.predictedRevenue).toLocaleString()}
                </div>
                <span className="text-[10px] text-green-500 font-bold flex items-center justify-end gap-0.5 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +12.4% vs last cycle
                </span>
              </div>
            </div>
          )}

          {/* Growth Trend AreaChart */}
          <div className="glass-panel border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-150">Weekly Lead Growth</h3>
                <span className="text-[10px] text-slate-400">Total new accounts captured per week.</span>
              </div>
              <span className="text-[11px] font-bold text-blue-500 flex items-center gap-0.5 bg-blue-500/5 px-2.5 py-1 rounded-full border border-blue-500/10">
                Weekly Trend
              </span>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Priority Leads Widget */}
          {preferences.showTopLeads && (
            <div className="glass-panel border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-150 flex items-center gap-1.5">
                    Top High-Priority Leads
                  </h3>
                  <span className="text-[10px] text-slate-400">High-scoring prospects sorted by AI ranking.</span>
                </div>
                <button
                  onClick={() => navigate('/leads')}
                  className="text-[10px] font-bold text-blue-500 hover:underline cursor-pointer"
                >
                  View Directory
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                {stats.topLeads.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No high-priority leads detected. Add or update leads to calculate scores.
                  </div>
                ) : (
                  stats.topLeads.map((lead) => (
                    <div
                      key={lead._id || lead.id}
                      className="p-3 bg-slate-50/40 dark:bg-zinc-900/20 border border-slate-200/50 dark:border-zinc-800/60 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-xs">
                          {lead.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-slate-800 dark:text-zinc-100 truncate">{lead.name}</span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{lead.company}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Score Indicator */}
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] text-slate-400 uppercase font-bold">AI Score</span>
                          <span className="text-xs font-extrabold text-blue-500">{lead.leadScore || 85}/100</span>
                        </div>
                        
                        {/* Badge */}
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full">
                          High
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Column */}
        <div className="flex flex-col gap-6">
          
          {/* Today's Agenda: Tasks and Meetings */}
          {preferences.showAgenda && (
            <div className="glass-panel border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
              
              {/* Upcoming Meetings sub-section */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-150 flex items-center gap-2 mb-3">
                  <Calendar className="w-4.5 h-4.5 text-blue-500" />
                  Upcoming Meetings
                </h3>
                
                <div className="flex flex-col gap-2.5">
                  {stats.soonMeetings.length === 0 ? (
                    <div className="text-[11px] text-slate-400 py-3 text-center">
                      No meetings booked this week.
                    </div>
                  ) : (
                    stats.soonMeetings.map((meet) => {
                      const missed = new Date(meet.date) < new Date();
                      return (
                        <div key={meet._id || meet.id} className={`p-2.5 rounded-lg border flex flex-col gap-1 ${
                          missed ? 'bg-red-500/5 border-red-500/20 text-red-400' : 'bg-slate-50/50 dark:bg-zinc-900/30 border-slate-100 dark:border-zinc-900'
                        }`}>
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-tight">{meet.title}</span>
                            {missed && (
                              <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-red-500/20 text-red-500 rounded border border-red-500/30">MISSED</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(meet.date).toLocaleDateString()} at {meet.time}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Today's Tasks */}
              <div className="border-t border-slate-100 dark:border-zinc-900 pt-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-150 flex items-center gap-2 mb-3">
                  <CheckSquare className="w-4.5 h-4.5 text-purple-500" />
                  Pending Today
                </h3>
                
                <div className="flex flex-col gap-2.5">
                  {stats.todayTasks.length === 0 ? (
                    <div className="text-[11px] text-slate-400 py-3 text-center">
                      All tasks completed for today!
                    </div>
                  ) : (
                    stats.todayTasks.map((t) => (
                      <div key={t._id || t.id} className="p-2.5 bg-slate-50/50 dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-900 rounded-lg flex justify-between items-center gap-2">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">{t.title}</span>
                          <span className="text-[9px] text-red-500">Overdue</span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 badge-priority-high rounded">
                          {t.priority}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Lead Source Breakdown Chart */}
          {preferences.showSourceChart && (
            <div className="glass-panel border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-150 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
                Performing Sources
              </h3>
              
              <div className="h-44 w-full">
                {sourceChartData.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">No lead data.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {sourceChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {/* Recent Activity Timeline Feed */}
          <div className="glass-panel border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-150 mb-4 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-amber-500" />
              Recent Logs
            </h3>

            <div className="flex flex-col gap-3.5 max-h-[320px] overflow-y-auto pr-1">
              {stats.feedLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No activity logs.
                </div>
              ) : (
                stats.feedLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2.5 text-xs text-slate-500 dark:text-zinc-400">
                    {/* Tiny visual icon status line */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>
                      <div className="w-px flex-1 bg-slate-200 dark:bg-zinc-800/80 my-1"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="leading-snug text-[11px]">
                        <strong className="text-slate-800 dark:text-zinc-200">{log.leadName}</strong> ({log.company}) &mdash; {log.note || `${log.type} status registered.`}
                      </p>
                      <span className="text-[9px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
