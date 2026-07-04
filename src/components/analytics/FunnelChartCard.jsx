import React from 'react';
import { FunnelChart, Funnel, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { STATUS_COLORS } from '../../constants/analyticsColors';

/**
 * Custom Tooltip for the Funnel Chart.
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950/95 dark:bg-zinc-950/95 border border-slate-850 dark:border-zinc-850 p-3 rounded-xl shadow-xl text-white text-xs">
        <p className="font-bold flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          {data.name}
        </p>
        <div className="mt-1.5 space-y-0.5 text-slate-300 font-medium font-mono">
          <p>Leads reached: {data.value}</p>
          <p>Stage Conversion: {data.conversionRate}%</p>
          {data.dropOffRate > 0 && <p>Stage Drop-off: {data.dropOffRate}%</p>}
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Sales Funnel chart representing pipeline dropoffs.
 * 
 * @param {Object} props
 * @param {Array} props.data - Funnel stage aggregates
 */
export default function FunnelChartCard({ data }) {
  // Inject colours
  const funnelData = data.map(item => ({
    ...item,
    color: STATUS_COLORS[item.name] || '#64748B'
  }));

  const maxVal = data.length > 0 ? data[0].value : 0;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full">
      {/* Title */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-50">Sales Pipeline Funnel</h3>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500">Cumulative conversion & drop-off metrics per milestone</p>
      </div>

      {maxVal === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-400 dark:text-zinc-500 text-xs">
          No data available for the current period
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-4">
          {/* Chart Wrapper */}
          <div className="w-full md:w-1/2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip content={<CustomTooltip />} />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive
                >
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>

          {/* Metrics List panel */}
          <div className="w-full md:w-1/2 space-y-2.5">
            {funnelData.map((item, idx) => {
              // Calculate percentage of first stage (New)
              const pctOfFirst = maxVal > 0 ? Math.round((item.value / maxVal) * 100) : 0;
              
              return (
                <div key={idx} className="flex flex-col gap-1.5 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-850 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-all duration-150">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-bold text-slate-700 dark:text-zinc-300">{item.name}</span>
                    </div>
                    <span className="font-bold font-mono text-slate-900 dark:text-zinc-50">{item.value}</span>
                  </div>
                  
                  {/* Progress Indicator and Labels */}
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pctOfFirst}%`, backgroundColor: item.color }} />
                    </div>
                    <div className="flex items-center gap-1.5 font-mono min-w-[110px] justify-end">
                      <span className="text-green-600 dark:text-green-400 font-bold">{item.conversionRate}% conv</span>
                      {idx > 0 && (
                        <>
                          <span className="text-slate-300 dark:text-zinc-700">|</span>
                          <span className="text-red-500 dark:text-red-400 font-bold">{item.dropOffRate}% drop</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
