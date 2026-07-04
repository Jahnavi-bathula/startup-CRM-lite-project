import React from 'react';
import { Sparkles, HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * Formats values into Indian Rupee format.
 */
const formatINR = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * ForecastCard Component
 * Displays the predicted sales revenue for next month, along with confidence score and trends.
 * 
 * @param {Object} props
 * @param {Object} props.forecastData - Forecast properties { forecast, confidence, trend }
 */
export default function ForecastCard({ forecastData }) {
  if (!forecastData) return null;

  const { forecast, confidence, trend } = forecastData;
  const isPositive = trend >= 0;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Visual background ambient gradient to give it a premium "predictive AI" vibe */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-50">Revenue Forecast</h3>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">Predictive intelligence using 6-month historical averages</p>
          </div>
        </div>
      </div>

      {/* Forecast Output */}
      <div className="my-2">
        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
          Predicted Revenue Next Month
        </span>
        <span className="text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight block mt-1">
          {formatINR(forecast)}
        </span>
        
        {/* Trend Indicator */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
            isPositive 
              ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40' 
              : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40'
          }`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {isPositive ? '+' : ''}{trend}% Growth Trend
          </span>
        </div>
      </div>

      {/* Confidence Score Bar */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-850">
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider mb-2">
          <span className="flex items-center gap-1">
            Confidence Score 
            <HelpCircle className="w-3 h-3 text-slate-400 dark:text-zinc-500 cursor-help" title="Based on deal volume predictability and pipeline cover" />
          </span>
          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-extrabold">{confidence}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-zinc-850 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}
