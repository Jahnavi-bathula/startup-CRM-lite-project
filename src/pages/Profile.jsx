import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLeads } from '../context/LeadContext';
import { useTasks } from '../context/TaskContext';
import { useMeetings } from '../context/MeetingContext';
import { useTheme } from '../context/ThemeContext';
import DarkModeToggle from '../components/common/DarkModeToggle';
import { User, Shield, LayoutGrid, CheckCircle2, DollarSign, Activity, FileText } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { leads } = useLeads();
  const { tasks } = useTasks();
  const { meetings } = useMeetings();
  const { isDarkMode, toggleTheme } = useTheme();

  // Load Dashboard Preferences from localStorage
  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = localStorage.getItem('crm-dashboard-prefs');
      return stored ? JSON.parse(stored) : {
        showRevenuePrediction: true,
        showTopLeads: true,
        showAgenda: true,
        showSourceChart: true,
        showGrowthMetrics: true
      };
    } catch {
      return {
        showRevenuePrediction: true,
        showTopLeads: true,
        showAgenda: true,
        showSourceChart: true,
        showGrowthMetrics: true
      };
    }
  });

  // Save Preferences
  useEffect(() => {
    localStorage.setItem('crm-dashboard-prefs', JSON.stringify(preferences));
  }, [preferences]);

  const handleTogglePref = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Compute Metrics
  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.status === 'Won').length;
  const lostLeads = leads.filter(l => l.status === 'Lost').length;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  const activePipeline = leads
    .filter(l => l.status !== 'Won' && l.status !== 'Lost')
    .reduce((sum, l) => sum + (l.value || 0), 0);
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const totalMeetings = meetings.length;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950 p-6 md:p-8 transition-colors duration-200">
      {/* Page Header */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight">User Profile & Settings</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Configure your sales hub and preferences.</p>
        </div>
        <DarkModeToggle />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
        {/* Left Column: User Details Card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-panel border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col items-center text-center shadow-xl">
            {/* Large Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg mb-4">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2) : 'U'}
            </div>
            
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-55">{user?.name || 'Administrator'}</h2>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mb-2">{user?.email || 'admin@aerocrm.com'}</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
              <Shield className="w-3.5 h-3.5" />
              Sales Director
            </span>

            {/* Separator */}
            <div className="w-full h-px bg-slate-200/50 dark:border-zinc-800/50 my-6"></div>

            {/* Quick Meta */}
            <div className="w-full flex flex-col gap-3 text-left text-xs text-slate-500 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Account ID</span>
                <span className="font-mono text-slate-700 dark:text-zinc-300">{user?.id || '60c72b2f9b1d8a'}</span>
              </div>
              <div className="flex justify-between">
                <span>Domain</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-300">AeroCRM</span>
              </div>
              <div className="flex justify-between">
                <span>Access Level</span>
                <span className="text-green-500 dark:text-green-400 font-semibold">Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details, Preferences & Stats */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Performance Statistics Grid */}
          <div className="glass-panel border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-200 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              Activity Statistics
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50/50 dark:bg-zinc-900/30 border border-slate-200/40 dark:border-zinc-800/40 rounded-xl">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold">Total Leads</span>
                <div className="text-xl font-bold text-slate-900 dark:text-zinc-50 mt-1">{totalLeads}</div>
                <span className="text-[9px] text-slate-400">{wonLeads} won · {lostLeads} lost</span>
              </div>

              <div className="p-4 bg-slate-50/50 dark:bg-zinc-900/30 border border-slate-200/40 dark:border-zinc-800/40 rounded-xl">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold">Conversion</span>
                <div className="text-xl font-bold text-slate-900 dark:text-zinc-50 mt-1">{conversionRate}%</div>
                <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-green-500 h-1" style={{ width: `${conversionRate}%` }}></div>
                </div>
              </div>

              <div className="p-4 bg-slate-50/50 dark:bg-zinc-900/30 border border-slate-200/40 dark:border-zinc-800/40 rounded-xl">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold">Active Value</span>
                <div className="text-xl font-bold text-slate-900 dark:text-zinc-50 mt-1">${activePipeline.toLocaleString()}</div>
                <span className="text-[9px] text-slate-400">weighted deal volume</span>
              </div>

              <div className="p-4 bg-slate-50/50 dark:bg-zinc-900/30 border border-slate-200/40 dark:border-zinc-800/40 rounded-xl">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold">Tasks & Meets</span>
                <div className="text-xl font-bold text-slate-900 dark:text-zinc-50 mt-1">{completedTasks + totalMeetings}</div>
                <span className="text-[9px] text-slate-400">{completedTasks} tasks · {totalMeetings} schedules</span>
              </div>
            </div>
          </div>

          {/* Preferences Widget Toggles */}
          <div className="glass-panel border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-200 mb-4 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-purple-500" />
              Dashboard Preferences
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mb-6">Choose which analytics modules to show on your sales metrics command hub.</p>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-zinc-900">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Revenue Prediction Card</span>
                  <span className="text-[10px] text-slate-400">Forecast sales deal closures using lead values and probabilities.</span>
                </div>
                <button
                  onClick={() => handleTogglePref('showRevenuePrediction')}
                  className={`w-9 h-5 rounded-full transition-colors relative focus:outline-none ${preferences.showRevenuePrediction ? 'bg-blue-600' : 'bg-slate-300 dark:bg-zinc-800'}`}
                >
                  <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 left-0.75 transition-transform ${preferences.showRevenuePrediction ? 'translate-x-4' : 'translate-x-0'}`}></span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-zinc-900">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Top Priority Leads List</span>
                  <span className="text-[10px] text-slate-400">Renders lists of High Priority leads matching AI scores &ge; 75.</span>
                </div>
                <button
                  onClick={() => handleTogglePref('showTopLeads')}
                  className={`w-9 h-5 rounded-full transition-colors relative focus:outline-none ${preferences.showTopLeads ? 'bg-blue-600' : 'bg-slate-300 dark:bg-zinc-800'}`}
                >
                  <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 left-0.75 transition-transform ${preferences.showTopLeads ? 'translate-x-4' : 'translate-x-0'}`}></span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-zinc-900">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Today's Agenda (Tasks & Meetings)</span>
                  <span className="text-[10px] text-slate-400">Show upcoming meetings and overdue task reminders.</span>
                </div>
                <button
                  onClick={() => handleTogglePref('showAgenda')}
                  className={`w-9 h-5 rounded-full transition-colors relative focus:outline-none ${preferences.showAgenda ? 'bg-blue-600' : 'bg-slate-300 dark:bg-zinc-800'}`}
                >
                  <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 left-0.75 transition-transform ${preferences.showAgenda ? 'translate-x-4' : 'translate-x-0'}`}></span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-zinc-900">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Lead Source Distribution Chart</span>
                  <span className="text-[10px] text-slate-400">Recharts visual distribution mapping lead sources.</span>
                </div>
                <button
                  onClick={() => handleTogglePref('showSourceChart')}
                  className={`w-9 h-5 rounded-full transition-colors relative focus:outline-none ${preferences.showSourceChart ? 'bg-blue-600' : 'bg-slate-300 dark:bg-zinc-800'}`}
                >
                  <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 left-0.75 transition-transform ${preferences.showSourceChart ? 'translate-x-4' : 'translate-x-0'}`}></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
