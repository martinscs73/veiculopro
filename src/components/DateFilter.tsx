import React from 'react';
import { Calendar, X } from 'lucide-react';

interface DateFilterProps {
  startDate: string;
  endDate: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onClear: () => void;
}

export const DateFilter = ({ startDate, endDate, onStartChange, onEndChange, onClear }: DateFilterProps) => (
  <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
    <div className="space-y-1.5 flex-1 min-w-[150px]">
      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Data Inicial</label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="date" 
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
        />
      </div>
    </div>
    <div className="space-y-1.5 flex-1 min-w-[150px]">
      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Data Final</label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="date" 
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
        />
      </div>
    </div>
    <button 
      onClick={onClear}
      className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-rose-500 transition-colors flex items-center gap-2 mb-0.5"
    >
      <X className="w-4 h-4" />
      Limpar
    </button>
  </div>
);
