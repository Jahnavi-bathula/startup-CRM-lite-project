import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_DEFAULTS } from '../../constants/analyticsColors';

/**
 * Formats currency values in Indian layout (Lakh/Crore separators).
 */
const formatINR = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Custom Tooltip for the Revenue Area Chart.
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 dark:bg-zinc-950/95 border border-slate-850 dark:border-zinc-850 p-2.5 rounded-xl shadow-xl text-white text-xs">
        <p className="font-bold text-slate-300">{label} Revenue</p>
        <p className="font-extrabold text-green-400 mt-1 font-mono text-sm">
          {formatINR(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * RevenueChartCard Component
 * Displays closed-won revenue trends by month with an area gradient fill.
 * 
 * @param {Object} props
 * @param {Array} props.data - Monthly won values [{ name, value }]
 */
export default function RevenueChartCard({ data }) {
  const hasData = data && data.some(item => item.value > 0);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col justify-between">
      {/* Title */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-50">Revenue Analytics</h3>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500">Won deal value trends over the last 6 months</p>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-56 text-slate-400 dark:text-zinc-500 text-xs">
          No won revenue records found for the last 6 months
        </div>
      ) : (
        <div className="h-56 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_DEFAULTS.success} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={CHART_DEFAULTS.success} stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} className="dark:stroke-zinc-800/50" />
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
              />
              <YAxis 
                tickFormatter={(tick) => {
                  if (tick >= 100000) return `₹${(tick / 100000).toFixed(1)}L`;
                  if (tick >= 1000) return `₹${(tick / 1000).toFixed(0)}k`;
                  return `₹${tick}`;
                }}
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={CHART_DEFAULTS.success} 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
