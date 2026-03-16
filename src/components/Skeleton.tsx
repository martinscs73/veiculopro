import React from 'react';
import { cn } from './utils';

export interface SkeletonProps {
  className?: string;
  count?: number;
  [key: string]: any;
}

export const Skeleton = ({ className, count = 1, ...props }: SkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i}
          className={cn(
            "animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md",
            className
          )}
          {...props}
        />
      ))}
    </>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => {
  return (
    <div className="w-full space-y-4">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-4 border-b border-slate-100 dark:border-slate-800">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton = () => (
  <div className="w-full h-full bg-slate-50/50 dark:bg-slate-800/50 animate-pulse rounded-2xl flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 min-h-[200px]">
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-8 border-2 border-slate-200 dark:border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carregando Gráfico...</span>
    </div>
  </div>
);
