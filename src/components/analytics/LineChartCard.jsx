import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_DEFAULTS } from '../../constants/analyticsColors';

/**
 * Custom Tooltip for the Conversion Trend Chart.
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 dark:bg-zinc-950/95 border border-slate-850 dark:border-zinc-850 p-2.5 rounded-xl shadow-xl text-white text-xs">
        <p className="font-bold text-slate-300">{label}</p>
        <p className="font-extrabold text-emerald-400 mt-1 font-mono text-sm">
          {payload[0].value}% Conversion
        </p>
      </div>
    );
  }
  return null;
};

/**
 * LineChartCard Component
 * Displays the monthly conversion rate (Won / Total) for the last 6 months.
 * 
 * @param {Object} props
 * @param {Array} props.data - Monthly rates [{ name, value }]
 */
export default function LineChartCard({ data }) {
  const hasData = data && data.some(item => item.value > 0);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col justify-between">
      {/* Title */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-50">Monthly Conversion Trend</h3>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500">Ratio of won leads versus total leads per month</p>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-56 text-slate-400 dark:text-zinc-500 text-xs">
          No data available for the last 6 months
        </div>
      ) : (
        <div className="h-56 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} className="dark:stroke-zinc-800/50" />
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
              />
              <YAxis 
                domain={[0, 100]}
                tickFormatter={(tick) => `${tick}%`}
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={CHART_DEFAULTS.success} 
                strokeWidth={2.5}
                dot={{ r: 4, stroke: CHART_DEFAULTS.success, strokeWidth: 1, fill: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: CHART_DEFAULTS.success }}
                animationDuration={1200}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
