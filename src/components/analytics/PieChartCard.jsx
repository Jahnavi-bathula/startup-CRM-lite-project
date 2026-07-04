import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip } from 'recharts';

/**
 * Custom Active Shape Sector renderer for PieChart.
 * Expands the hovered wedge to make it visually pop.
 */
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

/**
 * Custom Tooltip for the Pie Chart.
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950/95 dark:bg-zinc-950/95 border border-slate-850 dark:border-zinc-850 p-3 rounded-xl shadow-xl text-white text-xs">
        <p className="font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
          {data.name}
        </p>
        <div className="mt-1.5 space-y-0.5 text-slate-300 font-medium font-mono">
          <p>{data.value} Leads</p>
          <p>{data.percentage}% Share</p>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Doughnut status distribution chart.
 * 
 * @param {Object} props
 * @param {Array} props.data - Status aggregate segments array
 */
export default function PieChartCard({ data }) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  const totalLeads = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full">
      {/* Title */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-50">Lead Status Distribution</h3>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500">Pipeline segment representation shares</p>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-400 dark:text-zinc-500 text-xs">
          No data available for the current period
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
          {/* Chart Container */}
          <div className="relative w-44 h-44 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={78}
                  paddingAngle={2.5}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label (Total count) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-2xl font-black text-slate-900 dark:text-zinc-50 leading-none tracking-tight">
                {totalLeads}
              </span>
              <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mt-1">
                Total Leads
              </span>
            </div>
          </div>

          {/* Legends Layout */}
          <div className="flex-1 w-full space-y-2">
            {data.map((item, idx) => (
              <div 
                key={idx} 
                className={`flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-colors duration-150 ${
                  activeIndex === idx ? 'bg-slate-50 dark:bg-zinc-800/40' : ''
                }`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(-1)}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-slate-900 dark:text-zinc-100">{item.value}</span>
                  <span className="text-slate-400 dark:text-zinc-500 text-[10px]">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
