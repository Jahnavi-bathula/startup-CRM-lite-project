import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { SOURCE_COLORS } from '../../constants/analyticsColors';

/**
 * Custom Tooltip for the Lead Source Chart.
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950/95 dark:bg-zinc-950/95 border border-slate-850 dark:border-zinc-850 p-2.5 rounded-xl shadow-xl text-white text-xs">
        <p className="font-bold text-slate-300">{data.name}</p>
        <p className="font-extrabold mt-1 font-mono text-sm" style={{ color: data.color || '#3B82F6' }}>
          {data.value} Leads
        </p>
      </div>
    );
  }
  return null;
};

/**
 * LeadSourceChart Component
 * Displays lead sources sorted descending using a horizontal bar layout.
 * 
 * @param {Object} props
 * @param {Array} props.data - Lead source counts [{ name, value }]
 */
export default function LeadSourceChart({ data }) {
  const hasData = data && data.length > 0 && data.some(item => item.value > 0);

  // Sort descending and inject colors
  const sortedData = React.useMemo(() => {
    if (!data) return [];
    return [...data]
      .sort((a, b) => b.value - a.value)
      .map(item => ({
        ...item,
        color: SOURCE_COLORS[item.name] || SOURCE_COLORS.Other
      }));
  }, [data]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col justify-between">
      {/* Title */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-50">Lead Source Analytics</h3>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500">Distribution of leads across marketing/sales channels</p>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-56 text-slate-400 dark:text-zinc-500 text-xs">
          No lead source statistics found
        </div>
      ) : (
        <div className="h-56 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={sortedData}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} className="dark:stroke-zinc-800/50" />
              <XAxis 
                type="number"
                tickLine={false} 
                axisLine={false} 
                allowDecimals={false}
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
              />
              <YAxis 
                type="category"
                dataKey="name" 
                tickLine={false} 
                axisLine={false} 
                width={75}
                tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
                className="dark:fill-zinc-400"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.02)', radius: 4 }} />
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]} 
                maxBarSize={16}
                animationDuration={1200}
              >
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
