import React from 'react';
import { cn } from './utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

export const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: SidebarItemProps) => (
  <button
    onClick={onClick}
    title={collapsed ? label : ""}
    className={cn(
      "w-full flex items-center rounded-xl transition-all duration-200 group",
      collapsed ? "justify-center p-3" : "gap-3 px-4 py-3",
      active 
        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
        : "text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
    )}
  >
    <Icon className={cn("w-5 h-5 shrink-0", active ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400")} />
    {!collapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
  </button>
);
