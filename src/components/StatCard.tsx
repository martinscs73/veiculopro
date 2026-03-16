import React from 'react';
import { cn } from './utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  color: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const StatCard = ({ title, value, icon: Icon, trend, color, subtitle, actions }: StatCardProps) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-full">
    <div>
      <div className="flex justify-between items-start">
        <div className={cn("p-2 rounded-xl", color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className={cn("text-xs font-medium px-2 py-1 rounded-full", 
            trend > 0 ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400")}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
      </div>
    </div>
    {(subtitle || actions) && (
      <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-50 dark:border-slate-800/50">
        {subtitle && <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider leading-normal">{subtitle}</p>}
        {actions && (
          <div className="flex items-center justify-start gap-1">
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-100 dark:border-slate-700">
              {actions}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);
