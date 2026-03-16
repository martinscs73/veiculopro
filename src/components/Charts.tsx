import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

interface BarChartData {
  month?: string;
  earnings?: number;
  expenses?: number;
  [key: string]: any;
}

interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

export const ComparisonBarChart = ({ data }: { data: BarChartData[] }) => (
  <ResponsiveContainer width="100%" height="100%" minHeight={256}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
      <Tooltip 
        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
        formatter={(value: number) => `R$ ${value.toFixed(2)}`}
      />
      <Bar dataKey="earnings" fill="#10b981" radius={[4, 4, 0, 0]} name="Ganhos" />
      <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Gastos" />
    </BarChart>
  </ResponsiveContainer>
);

export const DistributionPieChart = ({ data, innerRadius = 60, outerRadius = 80 }: { data: PieChartData[], innerRadius?: number, outerRadius?: number }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        paddingAngle={5}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color || ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
        ))}
      </Pie>
      <Tooltip 
        formatter={(value: number) => `R$ ${value.toFixed(2)}`}
        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
);

export const MaintenanceBarChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="100%" minHeight={256}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
      <Tooltip 
        contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }}
        itemStyle={{ color: '#fff' }}
      />
      <Bar dataKey="cost" fill="#10b981" radius={[4, 4, 0, 0]} name="Custo (R$)" />
    </BarChart>
  </ResponsiveContainer>
);

export const ChartSkeleton = () => (
  <div className="w-full h-full bg-slate-50/50 dark:bg-slate-800/50 animate-pulse rounded-2xl flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700">
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-8 border-2 border-slate-200 dark:border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carregando Gráfico...</span>
    </div>
  </div>
);
