import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_DEFAULTS } from '../../constants/analyticsColors';

/**
 * Custom Tooltip for the Leads Trend Bar Chart.
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 dark:bg-zinc-950/95 border border-slate-850 dark:border-zinc-850 p-2.5 rounded-xl shadow-xl text-white text-xs">
        <p className="font-bold text-slate-300">{label}</p>
        <p className="font-extrabold text-blue-400 mt-1 font-mono text-sm">{payload[0].value} Leads</p>
      </div>
    );
  }
  return null;
};

/**
 * BarChartCard Component
 * Displays lead generation trends for the last 6 months.
 * 
 * @param {Object} props
 * @param {Array} props.data - Monthly aggregates list [{ name, value }]
 */
export default function BarChartCard({ data }) {
  const hasData = data && data.some(item => item.value > 0);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col justify-between">
      {/* Title */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-50">Monthly Leads Trend</h3>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500">Lead generation velocity over the last 6 months</p>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-56 text-slate-400 dark:text-zinc-500 text-xs">
          No data available for the last 6 months
        </div>
      ) : (
        <div className="h-56 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} className="dark:stroke-zinc-800/50" />
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
              />
              <YAxis 
                allowDecimals={false}
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)', radius: 4 }} />
              <Bar 
                dataKey="value" 
                fill={CHART_DEFAULTS.primary} 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
