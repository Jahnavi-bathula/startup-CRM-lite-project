import React from 'react';
import { Users, Target, Briefcase, Award, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
 * Renders six key metric summary cards, reporting growth status vs the preceding period.
 * 
 * @param {Object} props
 * @param {Object} props.kpis - KPI object containing current value and percentage change
 */
export default function StatsCards({ kpis }) {
  if (!kpis) return null;

  const cardConfig = [
    {
      title: 'Total Leads',
      value: kpis.totalLeads.value.toLocaleString(),
      change: kpis.totalLeads.change,
      icon: Users,
      color: 'blue',
      description: 'Leads created this period',
      lowerIsBetter: false
    },
    {
      title: 'Conversion Rate',
      value: `${kpis.conversionRate.value}%`,
      change: kpis.conversionRate.change,
      icon: Target,
      color: 'emerald',
      description: 'Ratio of won deals',
      lowerIsBetter: false,
      isPercentagePoints: true
    },
    {
      title: 'Pipeline Value',
      value: formatINR(kpis.pipelineValue.value),
      change: kpis.pipelineValue.change,
      icon: Briefcase,
      color: 'amber',
      description: 'Sum of active opportunities',
      lowerIsBetter: false
    },
    {
      title: 'Won Revenue',
      value: formatINR(kpis.wonRevenue.value),
      change: kpis.wonRevenue.change,
      icon: Award,
      color: 'green',
      description: 'Sum of won deal values',
      lowerIsBetter: false
    },
    {
      title: 'Avg. Sales Cycle',
      value: `${kpis.averageSalesCycle.value} Days`,
      change: kpis.averageSalesCycle.change,
      icon: Clock,
      color: 'violet',
      description: 'Mean lead to won duration',
      lowerIsBetter: true,
      isDaysDifference: true
    },
    {
      title: 'Lost Rate',
      value: `${kpis.lostRate.value}%`,
      change: kpis.lostRate.change,
      icon: AlertTriangle,
      color: 'rose',
      description: 'Ratio of lost deals',
      lowerIsBetter: true,
      isPercentagePoints: true
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cardConfig.map(card => {
        const Icon = card.icon;
        const hasChange = card.change !== undefined && card.change !== 0;
        
        // Define if trend is positive or negative
        const isBetter = card.lowerIsBetter ? card.change < 0 : card.change > 0;
        const trendColor = isBetter 
          ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40' 
          : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40';

        // Format change string
        let changeText = '0%';
        if (hasChange) {
          const sign = card.change > 0 ? '+' : '';
          if (card.isPercentagePoints) {
            changeText = `${sign}${card.change} pp`;
          } else if (card.isDaysDifference) {
            changeText = `${sign}${card.change} days`;
          } else {
            changeText = `${sign}${card.change}%`;
          }
        }

        // Color maps
        const colorClasses = {
          blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
          emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
          green: 'bg-green-500/10 text-green-600 dark:text-green-400',
          violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
          rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
        };

        return (
          <div key={card.title} className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            {/* Header: Title and Icon */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{card.title}</span>
              <div className={`p-2 rounded-xl ${colorClasses[card.color]}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Value */}
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-zinc-50 tracking-tight font-sans">
                {card.value}
              </h3>
              
              {/* Trend Footer */}
              <div className="flex items-center gap-1.5 mt-2.5">
                {hasChange ? (
                  <>
                    <span className={`flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${trendColor}`}>
                      {isBetter ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {changeText}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-medium">vs prev period</span>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">{card.description}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
