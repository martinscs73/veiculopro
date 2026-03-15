import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Fuel, 
  Wrench, 
  BarChart3, 
  Settings, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Navigation, 
  Car, 
  Bell, 
  ChevronRight, 
  ChevronLeft,
  Download,
  Upload,
  FileJson,
  Crown,
  LogOut,
  Menu,
  X,
  History,
  Receipt,
  Clock,
  Smartphone,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  User,
  ShieldCheck,
  Trash2,
  Edit3,
  Sparkles,
  Database,
  Calendar,
  Wind,
  ShieldAlert,
  Zap,
  Loader2,
  Check,
  Wallet
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api } from './services/api';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MOCK_EXPENSES_CHART = [
  { month: 'Set', fuel: 850, maintenance: 200, profit: 3200 },
  { month: 'Out', fuel: 920, maintenance: 0, profit: 3500 },
  { month: 'Nov', fuel: 880, maintenance: 450, profit: 3100 },
  { month: 'Dez', fuel: 1100, maintenance: 150, profit: 4200 },
  { month: 'Jan', fuel: 950, maintenance: 0, profit: 3800 },
  { month: 'Fev', fuel: 1050, maintenance: 300, profit: 4050 },
];

const VEHICLE_INFO = {
  model: 'Chevrolet Onix Plus',
  plate: 'ABC-1234',
  odometer: 125400,
  avgConsumption: 12.8,
  costPerKm: 0.42
};

const parseLocalDate = (dateString: string) => {
  if (!dateString || typeof dateString !== 'string') return new Date();
  const parts = dateString.split('-');
  if (parts.length !== 3) return new Date();
  const [year, month, day] = parts.map(Number);
  return new Date(year, month - 1, day);
};

// Components
const StatCard = ({ title, value, icon: Icon, trend, color, subtitle }: any) => (
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
    {subtitle && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 uppercase font-bold tracking-wider">{subtitle}</p>}
  </div>
);

const LoadingOverlay = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[110] flex items-center justify-center"
  >
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-emerald-100 dark:border-emerald-900 rounded-full animate-spin border-t-emerald-600 dark:border-t-emerald-500"></div>
        <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-emerald-500 animate-pulse" />
      </div>
      <p className="text-sm font-bold text-slate-600 dark:text-slate-300 animate-pulse">Processando...</p>
    </div>
  </motion.div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: any) => (
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

const Toast = ({ message, type, onClose }: any) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const styles = {
    success: "bg-emerald-600 text-white shadow-emerald-200/50",
    error: "bg-rose-600 text-white shadow-rose-200/50",
    warning: "bg-amber-500 text-white shadow-amber-200/50",
    info: "bg-blue-600 text-white shadow-blue-200/50"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={cn(
        "fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px] max-w-[90vw] border border-white/10 backdrop-blur-md",
        styles[type as keyof typeof styles] || styles.info
      )}
    >
      <div className="shrink-0">
        {icons[type as keyof typeof icons] || icons.info}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold leading-tight">{message}</p>
      </div>
      <button 
        onClick={onClose} 
        className="p-1.5 hover:bg-white/20 rounded-xl transition-all active:scale-90"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

const FormError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <motion.p 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-wider"
    >
      {message}
    </motion.p>
  );
};

const DateFilter = ({ startDate, endDate, onStartChange, onEndChange, onClear }: any) => (
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

const filterDataByDate = (data: any[], startDate: string, endDate: string) => {
  if (!startDate && !endDate) return data;
  return data.filter(item => {
    const itemDate = item.date;
    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;
    return true;
  });
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isPro = user?.subscription_plan === 'pro';

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) return;
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        localStorage.setItem('token', event.data.token);
        setIsAuthenticated(true);
        setUser(event.data.user);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Data state
  const [shifts, setShifts] = useState<any[]>([]);
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<any[]>([]);
  const [fixedExpenseTypes, setFixedExpenseTypes] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [dashboardPeriod, setDashboardPeriod] = useState('mes_atual');
  
  const dashboardStats = useMemo(() => {
    const now = new Date();
    let startDate = new Date(0);
    let endDate = new Date('2099-12-31');

    if (dashboardPeriod === 'hoje') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (dashboardPeriod === 'semana_atual') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (dashboardPeriod === 'mes_atual') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (dashboardPeriod === 'mes_anterior') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (dashboardPeriod === 'ano_atual') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    }

    const filterByDate = (item: any) => {
      if (!item) return false;
      const itemDate = parseLocalDate(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    };

    const filteredShifts = (shifts || []).filter(filterByDate);
    const filteredFuel = (fuelLogs || []).filter(filterByDate);
    const filteredMaintenance = (maintenanceLogs || []).filter(filterByDate);
    const filteredFixed = (fixedExpenses || []).filter(filterByDate);

    const totalEarnings = filteredShifts.reduce((sum, s) => sum + (s.earnings || 0), 0);
    const totalFuel = filteredFuel.reduce((sum, f) => sum + (f.total_value || 0), 0);
    const totalMaintenance = filteredMaintenance.reduce((sum, m) => sum + (m.cost || 0), 0);
    const totalFixed = filteredFixed.reduce((sum, e) => sum + (e.value || 0), 0);
    const totalExpenses = totalFuel + totalMaintenance + totalFixed;
    
    // Odometer logic
    let totalKm = filteredShifts.reduce((sum, s) => sum + (s.km || 0), 0);
    if (filteredFuel.length > 1) {
      const odos = filteredFuel.map(f => f.odometer).filter(o => o > 0);
      if (odos.length > 1) {
        const minOdo = Math.min(...odos);
        const maxOdo = Math.max(...odos);
        totalKm = maxOdo - minOdo;
      }
    }

    const netProfit = totalEarnings - totalExpenses;
    const profitability = totalKm > 0 ? (totalEarnings / totalKm) : 0;

    return {
      totalEarnings,
      totalKm,
      totalExpenses,
      netProfit,
      profitability,
      totalFuel,
      totalMaintenance,
      totalFixed
    };
  }, [shifts, fuelLogs, maintenanceLogs, fixedExpenses, dashboardPeriod]);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editingShift, setEditingShift] = useState<any>(null);
  const [editingMaintenance, setEditingMaintenance] = useState<any>(null);
  const [editingFixedExpense, setEditingFixedExpense] = useState<any>(null);
  const [editingFuel, setEditingFuel] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel?: () => void;
    isLoading?: boolean;
  } | null>(null);

  const confirmAction = (options: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => Promise<void> | void;
  }) => {
    setConfirmModal({
      isOpen: true,
      ...options,
      onConfirm: async () => {
        setConfirmModal(prev => prev ? { ...prev, isLoading: true } : null);
        try {
          await options.onConfirm();
        } catch (error) {
          console.error('Action failed:', error);
          const errorMessage = (error as any).details 
            ? `${error.message}: ${(error as any).details}${ (error as any).how_to_fix || ''}`
            : (error.message || 'Erro ao realizar operação');
          showToast(errorMessage, 'error');
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Smart Insight Logic
  const smartInsight = useMemo(() => {
    if (!shifts || shifts.length === 0) return null;
    
    // Filter last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentShifts = shifts.filter(s => s && s.date && parseLocalDate(s.date) >= thirtyDaysAgo);
    
    if (recentShifts.length === 0) return null;

    const platformStats: { [key: string]: { earnings: number, km: number } } = {};
    
    // Group shifts by date and shift_type to distribute KM proportionally
    const shiftsGrouped: Record<string, any[]> = {};
    recentShifts.forEach(s => {
      const key = `${s.date}_${s.shift_type}`;
      if (!shiftsGrouped[key]) shiftsGrouped[key] = [];
      shiftsGrouped[key].push(s);
    });

    Object.values(shiftsGrouped).forEach(group => {
      const totalEarnings = group.reduce((sum, s) => sum + s.earnings, 0);
      const totalKm = group.reduce((sum, s) => sum + s.km, 0);
      
      group.forEach(s => {
        if (!platformStats[s.platform]) platformStats[s.platform] = { earnings: 0, km: 0 };
        platformStats[s.platform].earnings += s.earnings;
        
        // Distribute KM proportionally based on earnings
        const proportionalKm = totalEarnings > 0 ? (s.earnings / totalEarnings) * totalKm : 0;
        platformStats[s.platform].km += proportionalKm;
      });
    });

    let bestPlatform = '';
    let bestRate = 0;
    let worstPlatform = '';
    let worstRate = Infinity;

    Object.entries(platformStats).forEach(([platform, stats]) => {
      if (stats.km > 0) {
        const rate = stats.earnings / stats.km;
        if (rate > bestRate) {
          bestRate = rate;
          bestPlatform = platform;
        }
        if (rate < worstRate) {
          worstRate = rate;
          worstPlatform = platform;
        }
      }
    });

    if (bestPlatform && worstPlatform && bestPlatform !== worstPlatform) {
      return {
        message: `A ${bestPlatform} está pagando R$ ${bestRate.toFixed(2)}/km vs R$ ${worstRate.toFixed(2)}/km na ${worstPlatform} nos últimos 30 dias. Priorize a ${bestPlatform}!`,
        type: 'success'
      };
    }
    
    return null;
  }, [shifts]);


  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });

  // UI State
  const [isHealthCollapsed, setIsHealthCollapsed] = useState(false);
  const [showInsight, setShowInsight] = useState(true);
  
  // Fuel calculation state
  const [fuelPrice, setFuelPrice] = useState<string>('');
  const [fuelLiters, setFuelLiters] = useState<string>('');

  const fuelTotal = useMemo(() => {
    const price = parseFloat(fuelPrice);
    const liters = parseFloat(fuelLiters);
    if (isNaN(price) || isNaN(liters)) return '0.00';
    return (price * liters).toFixed(2);
  }, [fuelPrice, fuelLiters]);

  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const [reportPeriod, setReportPeriod] = useState('month');
  const [reportPlatform, setReportPlatform] = useState('all');
  const [reportVehicle, setReportVehicle] = useState('all');
  const [reportDriver, setReportDriver] = useState('all');
  const [reportCategory, setReportCategory] = useState('all');
  const [reportFuelType, setReportFuelType] = useState('all');
  const [reportVehicleType, setReportVehicleType] = useState('all');

  // Date filters for history
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Settings state
  const [settingsTab, setSettingsTab] = useState('profile');
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

  const [totalKm, setTotalKm] = useState('');
  const [shiftPlatforms, setShiftPlatforms] = useState([
    { name: 'Uber', earnings: '', tips: '', rides_count: '' },
    { name: '99Pop', earnings: '', tips: '', rides_count: '' },
    { name: 'InDriver', earnings: '', tips: '', rides_count: '' },
    { name: 'Particular', earnings: '', tips: '', rides_count: '' },
  ]);

  const groupedShifts = useMemo(() => {
    const groups: { [key: string]: any } = {};
    
    (shifts || []).forEach(shift => {
      if (!shift || !shift.date) return;
      const key = `${shift.date}-${shift.shift_type}`;
      if (!groups[key]) {
        groups[key] = {
          ...shift,
          platforms: [shift.platform].filter(Boolean),
          totalEarnings: shift.earnings || 0,
          totalKm: shift.km || 0
        };
      } else {
        if (shift.platform) groups[key].platforms.push(shift.platform);
        groups[key].totalEarnings += shift.earnings || 0;
        groups[key].totalKm += shift.km || 0;
      }
    });

    return Object.values(groups).sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime());
  }, [shifts]);

  const monthlyChartData = useMemo(() => {
    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        month: d.toLocaleString('pt-BR', { month: 'short' }),
        monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        earnings: 0,
        expenses: 0,
        fuel: 0,
        maintenance: 0
      });
    }

    (shifts || []).forEach(s => {
      if (!s || !s.date) return;
      const key = s.date.substring(0, 7);
      const monthData = last6Months.find(m => m.monthKey === key);
      if (monthData) {
        monthData.earnings += s.earnings || 0;
      }
    });

    (fuelLogs || []).forEach(f => {
      if (!f || !f.date) return;
      const key = f.date.substring(0, 7);
      const monthData = last6Months.find(m => m.monthKey === key);
      if (monthData) {
        monthData.fuel += f.total_value || 0;
        monthData.expenses += f.total_value || 0;
      }
    });

    (maintenanceLogs || []).forEach(m => {
      if (!m || !m.date) return;
      const key = m.date.substring(0, 7);
      const monthData = last6Months.find(m => m.monthKey === key);
      if (monthData) {
        monthData.maintenance += m.cost || 0;
        monthData.expenses += m.cost || 0;
      }
    });

    return last6Months;
  }, [shifts, fuelLogs, maintenanceLogs]);

  const platformData = useMemo(() => {
    const totals: { [key: string]: number } = {};
    
    (shifts || []).forEach(s => {
      if (s && s.platform) {
        totals[s.platform] = (totals[s.platform] || 0) + (s.earnings || 0);
      }
    });

    const colors = ['#000000', '#FFD100', '#10b981', '#64748b', '#8b5cf6', '#f59e0b', '#ef4444'];

    return Object.entries(totals)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }))
      .filter(p => p.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [shifts]);

  const maintenanceAlerts = useMemo(() => {
    if (!user || !maintenanceLogs) return [];
    const alerts: { type: 'warning' | 'info' | 'error' | 'success', title: string, titleClean: string, serviceKey: string, message: string, icon: any, progress: number }[] = [];
    const currentOdometer = Number(user.vehicle_odometer) || 0;
    const initialOdometer = Number(user.initial_odometer) || currentOdometer;

    const checkService = (keywords: string[], interval: number, title: string, icon: any, serviceKey: string) => {
      const logs = (maintenanceLogs || []).filter(m =>
        m && m.service_type && keywords.some(k => m.service_type.toLowerCase().includes(k.toLowerCase()))
      );

      const lastServiceKm = logs.length > 0 ? Math.max(...logs.map(m => Number(m.odometer) || 0)) : initialOdometer;

      const nextServiceKm = lastServiceKm + interval;
      const kmDrivenSinceLast = currentOdometer - lastServiceKm;
      const kmRemaining = nextServiceKm - currentOdometer;
      const progress = Math.min(100, Math.max(0, (kmDrivenSinceLast / interval) * 100));

      if (kmRemaining <= 0) {
        alerts.push({
          type: 'error',
          title: `VENCIDO: ${title}`,
          titleClean: title,
          serviceKey,
          message: `Passou ${Math.abs(kmRemaining).toLocaleString()}km do prazo. Agende agora!`,
          icon,
          progress: 100
        });
      } else if (kmRemaining <= interval * 0.1) {
        alerts.push({
          type: 'warning',
          title: `Próximo: ${title}`,
          titleClean: title,
          serviceKey,
          message: `Faltam ${kmRemaining.toLocaleString()}km.`,
          icon,
          progress
        });
      } else {
        alerts.push({
          type: 'info',
          title: title,
          titleClean: title,
          serviceKey,
          message: `Em dia. Próxima em ${kmRemaining.toLocaleString()}km.`,
          icon,
          progress
        });
      }
    };

    // Intervalos padrão por tipo de veículo
    const isGNV = (user.fuel_type || '').toLowerCase().includes('gnv');
    const isDiesel = (user.fuel_type || '').toLowerCase().includes('diesel');
    const oilInterval = isDiesel ? 7500 : isGNV ? 8000 : 10000;

    checkService(['óleo', 'oleo'], oilInterval, 'Troca de Óleo', Fuel, 'Troca de Óleo');
    checkService(['pneu', 'rodízio', 'rodizio'], 10000, 'Rodízio de Pneus', Wrench, 'Rodízio de Pneus');
    checkService(['filtro de ar', 'filtro ar'], 15000, 'Filtro de Ar', Wind, 'Filtro de Ar');
    checkService(['freio', 'pastilha'], 30000, 'Pastilhas de Freio', ShieldAlert, 'Pastilhas de Freio');
    checkService(['vela'], 40000, 'Velas de Ignição', Zap, 'Velas de Ignição');
    checkService(['correia', 'dentada'], 60000, 'Correia Dentada', Settings, 'Correia Dentada');

    return alerts;
  }, [user, maintenanceLogs]);

  const fuelEfficiencyData = useMemo(() => {
    const vehiclesData: { [key: string]: any[] } = {};
    
    // Group fuel logs by vehicle
    fuelLogs.forEach(f => {
      const v = f.vehicle_name || 'Desconhecido';
      if (!vehiclesData[v]) vehiclesData[v] = [];
      vehiclesData[v].push(f);
    });

    const results = Object.entries(vehiclesData).map(([vehicle, logs]) => {
      // Sort logs by odometer ascending
      const sortedLogs = [...logs].sort((a, b) => (a.odometer || 0) - (b.odometer || 0));
      
      let totalKm = 0;
      let totalLiters = 0;
      let efficiencies: number[] = [];
      
      let lastFullOdo = -1;
      let litersSinceLastFull = 0;

      for (let i = 0; i < sortedLogs.length; i++) {
        const log = sortedLogs[i];
        
        if (log.is_full_tank) {
          if (lastFullOdo !== -1 && log.odometer > lastFullOdo) {
            const kmDriven = log.odometer - lastFullOdo;
            const currentLiters = litersSinceLastFull + log.liters;
            
            const efficiency = kmDriven / currentLiters;
            efficiencies.push(efficiency);
            
            totalKm += kmDriven;
            totalLiters += currentLiters;
          }
          // Reset for next full tank cycle
          lastFullOdo = log.odometer;
          litersSinceLastFull = 0;
        } else {
          // Accumulate liters from partial fill-ups
          litersSinceLastFull += log.liters;
        }
      }

      const avg = totalLiters > 0 ? totalKm / totalLiters : 0;
      const best = efficiencies.length > 0 ? Math.max(...efficiencies) : 0;

      return {
        vehicle,
        avg: avg.toFixed(2),
        best: best.toFixed(2)
      };
    }).filter(d => parseFloat(d.avg) > 0);

    return results;
  }, [fuelLogs]);

  const vehicleDepreciation = useMemo(() => {
    const profile = user || {};
    const valorPago = profile.purchase_price || 0;

    if (!valorPago) {
      return { valorPago: 0, valorAtualEstimado: 0, depreciacaoMensal: 0, mesesDePosse: 0 };
    }

    // Calcula tempo de posse a partir da data de compra (não do ano de fabricação)
    let mesesDePosse = 0;
    if (profile.purchase_date) {
      const [y, m, d] = profile.purchase_date.split('-').map(Number);
      const dataCompra = new Date(y, m - 1, d);
      const hoje = new Date();
      mesesDePosse = (hoje.getFullYear() - dataCompra.getFullYear()) * 12
        + (hoje.getMonth() - dataCompra.getMonth());
      if (mesesDePosse < 0) mesesDePosse = 0;
    }

    const anosDePosse = mesesDePosse / 12;

    // Taxa de 15% a.a. composta aplicada sobre o VALOR PAGO desde a data de compra
    const valorAtualEstimado = valorPago * Math.pow(0.85, anosDePosse);
    // Depreciação mensal = 15% ao ano sobre o valor atual (não sobre o preço original)
    const depreciacaoMensal = (valorAtualEstimado * 0.15) / 12;

    return {
      valorPago,
      valorAtualEstimado,
      depreciacaoMensal,
      mesesDePosse
    };
  }, [user]);

  // Fetch data
  const fetchData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [profile, shiftsData, fuelData, maintenanceData, statsData, serviceTypesData, fixedExpensesData, fixedExpenseTypesData] = await Promise.all([
        api.auth.getProfile(),
        api.shifts.list(),
        api.fuel.list(),
        api.maintenance.list(),
        api.stats.get(),
        api.serviceTypes.list(),
        api.fixedExpenses.list(),
        api.fixedExpenseTypes.list()
      ]);
      setUser(profile);
      setShifts(shiftsData);
      setFuelLogs(fuelData);
      setMaintenanceLogs(maintenanceData);
      setServiceTypes(serviceTypesData);
      setFixedExpenses(fixedExpensesData);
      setFixedExpenseTypes(fixedExpenseTypesData);
      setStats(statsData);
      setDarkMode(!!profile.dark_mode);
      setNotificationsEnabled(!!profile.notifications_enabled);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      
      const isAuthError = 
        error.message?.includes('401') || 
        error.message?.includes('403') || 
        error.message?.toLowerCase().includes('unauthorized') || 
        error.message?.toLowerCase().includes('forbidden') ||
        error.message?.toLowerCase().includes('token') ||
        error.message?.toLowerCase().includes('user not found');

      if (isAuthError) {
        showToast('Sessão expirada. Por favor, faça login novamente.', 'warning');
        handleLogout();
      } else {
        showToast('Erro de conexão: ' + error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const handleOnline = () => showToast('Conexão restabelecida!', 'success');
    const handleOffline = () => showToast('Você está offline. Verifique sua conexão.', 'warning');
    const handleAuthExpired = () => {
      setIsAuthenticated(false);
      setUser(null);
      showToast('Sua sessão expirou. Faça login novamente.', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && confirmModal && !confirmModal.isLoading) {
        if (confirmModal.onCancel) confirmModal.onCancel();
        setConfirmModal(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [confirmModal]);



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token, user } = await api.auth.login(authForm);
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setUser(user);
      showToast('Bem-vindo de volta!');
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { url } = await api.auth.getGoogleAuthUrl();
      window.open(url, 'google_login', 'width=600,height=700');
    } catch (error: any) {
      showToast('Erro ao iniciar login com Google: ' + error.message, 'error');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.auth.register(authForm);
      setAuthMode('login');
      showToast('Conta criada com sucesso! Faça login.');
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    window.location.reload(); // Force reload to clear all states
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setFilterStartDate('');
    setFilterEndDate('');
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleSaveShift = async (e: any) => {
    e.preventDefault();
    setFormErrors({});
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    setLoading(true);
    try {
      const activePlatforms = shiftPlatforms.filter(p => parseFloat(p.earnings.replace(',', '.')) > 0);
      const kmValue = parseFloat(totalKm.replace(',', '.'));
      const errors: any = {};

      if (isNaN(kmValue) || kmValue <= 0) {
        errors.totalKm = 'O KM total do turno deve ser um número positivo e maior que zero.';
      }
      
      if (activePlatforms.length === 0) {
        errors.platforms = 'Informe os ganhos em pelo menos uma plataforma.';
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      if (editingShift) {
        await api.shifts.deleteGroup(editingShift.date, editingShift.shift_type);
      }

      await Promise.all(activePlatforms.map((p, index) => 
        api.shifts.create({
          date: data.date,
          shift_type: data.shift_type,
          platform: p.name,
          km: index === 0 ? kmValue : 0,
          start_time: data.start_time,
          end_time: data.end_time,
          earnings: parseFloat(p.earnings.replace(',', '.')),
          tips: parseFloat(p.tips?.replace(',', '.') || '0'),
          rides_count: parseInt(p.rides_count || '0'),
          vehicle_name: data.vehicle_name as string,
          driver_name: data.driver_name as string
        })
      ));

      // Update user odometer automatically (only on CREATE, not on edit)
      if (!editingShift && user) {
        await api.auth.updateProfile({
          ...user,
          vehicle_odometer: (user.vehicle_odometer || 0) + kmValue
        });
      }

      setTotalKm('');
      setShiftPlatforms([
        { name: 'Uber', earnings: '', tips: '', rides_count: '' },
        { name: '99Pop', earnings: '', tips: '', rides_count: '' },
        { name: 'InDriver', earnings: '', tips: '', rides_count: '' },
        { name: 'Particular', earnings: '', tips: '', rides_count: '' },
      ]);
      setEditingShift(null);
      
      showToast(editingShift ? 'Turno atualizado com sucesso!' : 'Turno salvo com sucesso!');
      fetchData();
      setActiveTab('dashboard');
    } catch (error: any) {
      if (error.status === 422 && error.details) {
        const fieldErrors: any = {};
        error.details.forEach((detail: any) => {
          fieldErrors[detail.field] = detail.message;
        });
        setFormErrors(fieldErrors);
        showToast('Verifique os campos destacados', 'error');
      } else {
        showToast(error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFuel = async (e: any) => {
    e.preventDefault();
    setFormErrors({});
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    setLoading(true);
    try {
      const errors: any = {};
      const odometer = parseFloat(data.odometer as string);
      const price = parseFloat(fuelPrice);
      const liters = parseFloat(fuelLiters);

      if (isNaN(odometer) || odometer <= 0) errors.odometer = 'Informe o odômetro atual.';
      if (isNaN(price) || price <= 0) errors.fuelPrice = 'Informe o preço por litro.';
      if (isNaN(liters) || liters <= 0) errors.fuelLiters = 'Informe a quantidade de litros.';

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      if (editingFuel) {
        await api.fuel.update(editingFuel.id, {
          date: data.date,
          odometer,
          fuel_type: data.fuel_type,
          price_per_liter: price,
          liters,
          total_value: parseFloat(fuelTotal),
          vehicle_name: data.vehicle_name as string,
          driver_name: data.driver_name as string,
          is_full_tank: data.is_full_tank === 'on' ? 1 : 0
        });
        setEditingFuel(null);
      } else {
        await api.fuel.create({
          date: data.date,
          odometer,
          fuel_type: data.fuel_type,
          price_per_liter: price,
          liters,
          total_value: parseFloat(fuelTotal),
          vehicle_name: data.vehicle_name as string,
          driver_name: data.driver_name as string,
          is_full_tank: data.is_full_tank === 'on' ? 1 : 0
        });
      }

      // Update user odometer if higher
      if (user && odometer > (user.vehicle_odometer || 0)) {
        await api.auth.updateProfile({
          ...user,
          vehicle_odometer: odometer
        });
      }
      
      showToast(editingFuel ? 'Abastecimento atualizado!' : 'Abastecimento registrado com sucesso!');
      fetchData();
      setActiveTab('dashboard');
    } catch (error: any) {
      if (error.status === 422 && error.details) {
        const fieldErrors: any = {};
        error.details.forEach((detail: any) => {
          fieldErrors[detail.field] = detail.message;
        });
        setFormErrors(fieldErrors);
        showToast('Verifique os campos destacados', 'error');
      } else {
        showToast(error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFuel = async (id: number) => {
    confirmAction({
      title: 'Excluir Abastecimento',
      message: 'Tem certeza que deseja excluir este registro de abastecimento?',
      confirmLabel: 'Excluir',
      variant: 'danger',
      onConfirm: async () => {
        await api.fuel.delete(id);
        showToast('Abastecimento excluído com sucesso!');
        fetchData();
      }
    });
  };

  const handleSaveMaintenance = async (e: any) => {
    e.preventDefault();
    setFormErrors({});
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    setLoading(true);
    try {
      const errors: any = {};
      const odometer = parseFloat(data.odometer as string);
      const cost = parseFloat(data.cost as string);

      if (isNaN(odometer) || odometer <= 0) errors.odometer = 'Informe o odômetro.';
      if (isNaN(cost) || cost < 0) errors.cost = 'Informe o custo total.';
      if (!data.service_type) errors.service_type = 'Selecione o tipo de serviço.';

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      if (editingMaintenance && editingMaintenance.id) {
        await api.maintenance.update(editingMaintenance.id, {
          date: data.date,
          odometer,
          service_type: data.service_type as string,
          category: data.category as string,
          description: data.description as string,
          cost,
          attachment_url: editingMaintenance.attachment_url || '',
          vehicle_name: data.vehicle_name as string,
          driver_name: data.driver_name as string
        });
        setEditingMaintenance(null);
      } else {
        await api.maintenance.create({
          date: data.date,
          odometer,
          service_type: data.service_type as string,
          category: data.category as string,
          description: data.description as string,
          cost,
          attachment_url: '',
          vehicle_name: data.vehicle_name as string,
          driver_name: data.driver_name as string
        });
      }

      // Update user odometer if higher
      if (user && odometer > (user.vehicle_odometer || 0)) {
        await api.auth.updateProfile({
          ...user,
          vehicle_odometer: odometer
        });
      }
      
      showToast(editingMaintenance ? 'Manutenção atualizada!' : 'Manutenção registrada!');
      fetchData();
      setActiveTab('dashboard');
    } catch (error: any) {
      if (error.status === 422 && error.details) {
        const fieldErrors: any = {};
        error.details.forEach((detail: any) => {
          fieldErrors[detail.field] = detail.message;
        });
        setFormErrors(fieldErrors);
        showToast('Verifique os campos destacados', 'error');
      } else {
        showToast(error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      showToast('As novas senhas não coincidem', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showToast('A nova senha deve ter no mínimo 8 caracteres', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await api.auth.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      showToast('Senha alterada com sucesso!', 'success');
      setIsPasswordModalOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await api.auth.updateProfile({
        ...user,
        dark_mode: darkMode ? 1 : 0,
        notifications_enabled: notificationsEnabled ? 1 : 0
      });
      showToast('Configurações atualizadas com sucesso!');
    } catch (error: any) {
      if (error.status === 422 && error.details?.length) {
        const firstError = error.details[0];
        showToast(`Campo inválido: ${firstError.field} — ${firstError.message}`, 'error');
      } else {
        showToast(error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSyncGooglePhoto = async () => {
    if (user?.photo_url) {
      try {
        await api.auth.updateProfile({ ...user, photo_url: user.photo_url });
        await fetchData();
        showToast('Foto sincronizada!');
      } catch (error: any) {
        showToast('Erro ao sincronizar foto: ' + error.message, 'error');
      }
    } else {
      showToast('Nenhuma foto encontrada na conta Google.', 'error');
    }
  };

  const handleExportPDF = (
    exportType: 'summary' | 'full' | 'shifts_only' | 'maintenance_only' | 'fuel_only' | 'expenses_only' = 'full',
    customData?: {
      shifts?: any[];
      fuel?: any[];
      maintenance?: any[];
      fixedExpenses?: any[];
      earnings?: number;
      expenses?: number;
      km?: number;
      title?: string;
      vehicleName?: string;
      driverName?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor = { r: 16, g: 185, b: 129 }; // Emerald-600

    // Determine data source: use customData if provided, otherwise use current state
    const dataToUse = {
      shifts: customData?.shifts ?? shifts,
      fuel: customData?.fuel ?? fuelLogs,
      maintenance: customData?.maintenance ?? maintenanceLogs,
      fixedExpenses: customData?.fixedExpenses ?? fixedExpenses,
      earnings: customData?.earnings ?? stats?.totalEarnings ?? 0,
      expenses: customData?.expenses ?? stats?.totalExpenses ?? 0,
      km: customData?.km ?? stats?.totalKm ?? 0,
      title: customData?.title || 'Relatório VeiculoPro',
      vehicleName: customData?.vehicleName || user?.vehicle_model || 'Veículo Desconhecido',
      driverName: customData?.driverName || user?.name || 'Motorista Desconhecido',
      startDate: customData?.startDate || filterStartDate || '',
      endDate: customData?.endDate || filterEndDate || '',
    };

    // Calculate derived values
    const profit = dataToUse.earnings - dataToUse.expenses;
    const rentability = dataToUse.km > 0 ? dataToUse.earnings / dataToUse.km : 0;

    // --- Header ---
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('VeiculoPro', 15, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(dataToUse.title, 15, 30);
    doc.text(`Veículo: ${dataToUse.vehicleName}`, 15, 36);
    doc.text(`Motorista: ${dataToUse.driverName}`, 15, 42);

    const dateRange = `${dataToUse.startDate ? parseLocalDate(dataToUse.startDate).toLocaleDateString('pt-BR') : 'Início'} a ${dataToUse.endDate ? parseLocalDate(dataToUse.endDate).toLocaleDateString('pt-BR') : 'Fim'}`;
    doc.text(`Período: ${dateRange}`, pageWidth - 15, 30, { align: 'right' });
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 15, 36, { align: 'right' });

    let y = 50; // Initial Y position after header

    // --- Check if there's any data to export ---
    const hasData = (exportType === 'shifts_only' && dataToUse.shifts.length > 0) ||
                    (exportType === 'fuel_only' && dataToUse.fuel.length > 0) ||
                    (exportType === 'maintenance_only' && dataToUse.maintenance.length > 0) ||
                    (exportType === 'expenses_only' && dataToUse.fixedExpenses.length > 0) ||
                    (exportType === 'summary' && (dataToUse.earnings > 0 || dataToUse.expenses > 0 || dataToUse.km > 0)) ||
                    (exportType === 'full' && (
                      dataToUse.shifts.length > 0 ||
                      dataToUse.fuel.length > 0 ||
                      dataToUse.maintenance.length > 0 ||
                      dataToUse.fixedExpenses.length > 0 ||
                      dataToUse.earnings > 0 || dataToUse.expenses > 0 || dataToUse.km > 0
                    ));

    if (!hasData) {
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Nenhum dado encontrado para o período selecionado.', 15, y + 10);
      doc.save(`veiculopro_relatorio_${dataToUse.title.replace(/[^a-zA-Z0-9]/g, '_')}_vazio_${new Date().toISOString().split('T')[0]}.pdf`);
      showToast('Nenhum dado encontrado para exportar.');
      return;
    }

    // --- Summary Section ---
    if (exportType === 'summary' || exportType === 'full') {
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo Financeiro', 15, y + 10);

      const summaryData = [
        ['Ganhos Brutos', `R$ ${dataToUse.earnings.toFixed(2)}`],
        ['Total Gastos', `R$ ${dataToUse.expenses.toFixed(2)}`],
        ['Lucro Líquido', `R$ ${profit.toFixed(2)}`],
        ['KM Rodados', `${dataToUse.km.toFixed(0)} km`],
        ['Rentabilidade', `R$ ${rentability.toFixed(2)}/km`]
      ];

      autoTable(doc, {
        startY: y + 15,
        head: [['Métrica', 'Valor']],
        body: summaryData,
        theme: 'plain',
        styles: {
          fontStyle: 'bold',
          textColor: [15, 23, 42], // Slate-900
          fontSize: 12,
          cellPadding: { top: 8, right: 10, bottom: 8, left: 10 },
        },
        headStyles: {
          fillColor: [241, 245, 249], // Slate-50
          textColor: [51, 65, 85], // Slate-700
          fontSize: 10,
          fontStyle: 'normal',
          halign: 'left',
        },
        bodyStyles: {
          halign: 'left',
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto', halign: 'right' },
        },
      });
      y = (doc as any).lastAutoTable.finalY + 15;
    }

    // --- Shifts Table ---
    if (exportType === 'shifts_only' || exportType === 'full') {
      if (dataToUse.shifts.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Histórico de Turnos', 15, y + 10);

        const shiftsData = dataToUse.shifts.map(s => [
          parseLocalDate(s.date).toLocaleDateString('pt-BR'),
          s.platform,
          s.shift_type,
          `${s.km} km`,
          `R$ ${s.earnings.toFixed(2)}`,
          s.start_time ? `${s.start_time} - ${s.end_time}` : '-',
          s.driver_name || '-',
          s.vehicle_name || '-',
        ]);

        autoTable(doc, {
          startY: y + 15,
          head: [['Data', 'Plataforma', 'Turno', 'KM', 'Ganhos', 'Horário', 'Motorista', 'Veículo']],
          body: shiftsData,
          theme: 'striped',
          styles: {
            fontSize: 9,
            cellPadding: { top: 5, right: 8, bottom: 5, left: 8 },
          },
          headStyles: {
            fillColor: [primaryColor.r, primaryColor.g, primaryColor.b],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center',
          },
          bodyStyles: {
            halign: 'center',
          },
          columnStyles: {
            0: { halign: 'left' }, // Data
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 25 }, // KM
            4: { cellWidth: 30, halign: 'right' }, // Ganhos
            5: { cellWidth: 40 }, // Horário
            6: { cellWidth: 'auto' }, // Motorista
            7: { cellWidth: 'auto' }, // Veículo
          },
        });
        y = (doc as any).lastAutoTable.finalY + 15;
      }
    }

    // --- Fuel Logs Table ---
    if (exportType === 'fuel_only' || exportType === 'full') {
      if (dataToUse.fuel.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Histórico de Abastecimentos', 15, y + 10);

        const fuelData = dataToUse.fuel.map(f => [
          parseLocalDate(f.date).toLocaleDateString('pt-BR'),
          f.fuel_type,
          `${f.odometer} km`,
          `${f.liters} L`,
          `R$ ${f.price_per_liter.toFixed(2)}/L`,
          `R$ ${f.total_value.toFixed(2)}`,
          f.driver_name || '-',
          f.vehicle_name || '-',
        ]);

        autoTable(doc, {
          startY: y + 15,
          head: [['Data', 'Combustível', 'Odômetro', 'Litros', 'Preço/L', 'Total', 'Motorista', 'Veículo']],
          body: fuelData,
          theme: 'striped',
          styles: { fontSize: 9, cellPadding: 5 },
          headStyles: {
            fillColor: [primaryColor.r, primaryColor.g, primaryColor.b],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center',
          },
          bodyStyles: { halign: 'center' },
          columnStyles: {
            0: { halign: 'left' },
            5: { halign: 'right' },
          },
        });
        y = (doc as any).lastAutoTable.finalY + 15;
      }
    }

    // --- Maintenance Logs Table ---
    if (exportType === 'maintenance_only' || exportType === 'full') {
      if (dataToUse.maintenance.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Histórico de Manutenção', 15, y + 10);

        const maintenanceData = dataToUse.maintenance.map(m => [
          parseLocalDate(m.date).toLocaleDateString('pt-BR'),
          m.service_type,
          m.category,
          m.description || '-',
          `${m.odometer} km`,
          `R$ ${m.cost.toFixed(2)}`,
          m.driver_name || '-',
          m.vehicle_name || '-',
        ]);

        autoTable(doc, {
          startY: y + 15,
          head: [['Data', 'Serviço', 'Categoria', 'Descrição', 'Odômetro', 'Custo', 'Motorista', 'Veículo']],
          body: maintenanceData,
          theme: 'plain',
          styles: { fontSize: 9, cellPadding: 5 },
          headStyles: {
            fillColor: [primaryColor.r, primaryColor.g, primaryColor.b],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center',
          },
          bodyStyles: { halign: 'left' },
          columnStyles: {
            0: { halign: 'left' },
            5: { halign: 'right' },
          },
        });
        y = (doc as any).lastAutoTable.finalY + 15;
      }
    }

    // --- Fixed Expenses Table ---
    if (exportType === 'expenses_only' || exportType === 'full') {
      if (dataToUse.fixedExpenses.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Despesas Fixas e Variáveis', 15, y + 10);

        const expensesData = dataToUse.fixedExpenses.map(e => [
          parseLocalDate(e.date).toLocaleDateString('pt-BR'),
          e.expense_type,
          e.category,
          e.description || '-',
          `R$ ${e.value.toFixed(2)}`,
          e.driver_name || '-',
          e.vehicle_name || '-',
        ]);

        autoTable(doc, {
          startY: y + 15,
          head: [['Data', 'Despesa', 'Categoria', 'Descrição', 'Valor', 'Motorista', 'Veículo']],
          body: expensesData,
          theme: 'striped',
          styles: { fontSize: 9, cellPadding: 5 },
          headStyles: {
            fillColor: [primaryColor.r, primaryColor.g, primaryColor.b],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center',
          },
          bodyStyles: { halign: 'left' },
          columnStyles: {
            0: { halign: 'left' },
            4: { halign: 'right' },
          },
        });
      }
    }

    doc.save(`veiculopro_relatorio_${dataToUse.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('Relatório PDF gerado com sucesso!');
  };

  const handleExportRawData = () => {
    setIsExportModalOpen(true);
  };

  const processExport = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      // Export CSV
      const headers = ['Data', 'Turno', 'Plataforma', 'Hora Inicio', 'Hora Fim', 'KM', 'Ganhos', 'Veiculo', 'Motorista'];
      const csvContent = [
        headers.join(','),
        ...shifts.map(s => [
          s.date, 
          s.shift_type, 
          s.platform, 
          s.start_time, 
          s.end_time, 
          s.km.toString().replace('.', ','), 
          s.earnings.toString().replace('.', ','),
          `"${s.vehicle_name || ''}"`,
          `"${s.driver_name || ''}"`
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `veiculopro_turnos_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Exportação CSV concluída!');
    } else if (format === 'json') {
      // Export JSON
      const data = {
        user,
        shifts,
        fuelLogs,
        maintenanceLogs,
        fixedExpenses,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `veiculopro_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Backup JSON completo realizado!');
    }
    setIsExportModalOpen(false);
  };

  const handleAIConsultancy = async () => {
    setLoading(true);
    try {
      const analysis = await api.ai.getAnalysis();
      
      // Artificial delay for UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAiAnalysisResult(analysis);
      setIsAIModalOpen(true);
    } catch (error: any) {
      showToast('Erro ao gerar consultoria: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShiftGroup = async (date: string, shiftType: string) => {
    confirmAction({
      title: 'Excluir Turno',
      message: 'Tem certeza que deseja excluir este turno e todos os seus registros?',
      confirmLabel: 'Excluir',
      variant: 'danger',
      onConfirm: async () => {
        await api.shifts.deleteGroup(date, shiftType);
        showToast('Turno excluído com sucesso!');
        fetchData();
      }
    });
  };

  const handleDeleteMaintenance = async (id: number) => {
    confirmAction({
      title: 'Excluir Manutenção',
      message: 'Tem certeza que deseja excluir este registro de manutenção?',
      confirmLabel: 'Excluir',
      variant: 'danger',
      onConfirm: async () => {
        await api.maintenance.delete(id);
        showToast('Registro de manutenção excluído!');
        fetchData();
      }
    });
  };

  const handleAddServiceType = async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await api.serviceTypes.create({ name });
      showToast('Tipo de serviço adicionado');
      fetchData();
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteServiceType = async (id: number) => {
    confirmAction({
      title: 'Excluir Tipo de Serviço',
      message: 'Tem certeza que deseja excluir este tipo de serviço?',
      confirmLabel: 'Excluir',
      variant: 'danger',
      onConfirm: async () => {
        await api.serviceTypes.delete(id);
        showToast('Tipo de serviço excluído');
        fetchData();
      }
    });
  };

  const handleSaveFixedExpense = async (e: any) => {
    e.preventDefault();
    setFormErrors({});
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    setLoading(true);
    try {
      const errors: any = {};
      const value = parseFloat(data.value as string);

      if (isNaN(value) || value <= 0) errors.value = 'Informe o valor da despesa.';
      if (!data.expense_type) errors.expense_type = 'Selecione o tipo de despesa.';

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      if (editingFixedExpense) {
        await api.fixedExpenses.update(editingFixedExpense.id, {
          date: data.date as string,
          expense_type: data.expense_type as string,
          category: data.category as string || 'Outros',
          value,
          description: data.description as string,
          vehicle_name: data.vehicle_name as string,
          driver_name: data.driver_name as string
        });
        setEditingFixedExpense(null);
      } else {
        await api.fixedExpenses.create({
          date: data.date as string,
          expense_type: data.expense_type as string,
          category: data.category as string || 'Outros',
          value,
          description: data.description as string,
          vehicle_name: data.vehicle_name as string,
          driver_name: data.driver_name as string
        });
      }
      
      showToast(editingFixedExpense ? 'Despesa atualizada!' : 'Despesa registrada!');
      fetchData();
      setActiveTab('dashboard');
    } catch (error: any) {
      if (error.status === 422 && error.details) {
        const fieldErrors: any = {};
        error.details.forEach((detail: any) => {
          fieldErrors[detail.field] = detail.message;
        });
        setFormErrors(fieldErrors);
        showToast('Verifique os campos destacados', 'error');
      } else {
        showToast(error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFixedExpense = async (id: number) => {
    confirmAction({
      title: 'Excluir Despesa Fixa',
      message: 'Tem certeza que deseja excluir este registro de despesa fixa?',
      confirmLabel: 'Excluir',
      variant: 'danger',
      onConfirm: async () => {
        await api.fixedExpenses.delete(id);
        showToast('Despesa fixa excluída!');
        fetchData();
      }
    });
  };

  const handleAddFixedExpenseType = async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await api.fixedExpenseTypes.create({ name });
      showToast('Tipo de despesa adicionado!');
      fetchData();
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFixedExpenseType = async (id: number) => {
    confirmAction({
      title: 'Excluir Tipo de Despesa',
      message: 'Tem certeza que deseja excluir este tipo de despesa fixa?',
      confirmLabel: 'Excluir',
      variant: 'danger',
      onConfirm: async () => {
        await api.fixedExpenseTypes.delete(id);
        showToast('Tipo de despesa excluído!');
        fetchData();
      }
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 mb-4">
              <Car className="text-white w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Veiculo<span className="text-emerald-600">Pro</span></h1>
            <p className="text-slate-400 text-sm mt-1">{authMode === 'login' ? 'Bem-vindo de volta, motorista!' : 'Crie sua conta gratuita'}</p>
          </div>

          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {authMode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Nome</label>
                <input 
                  type="text" 
                  required
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="Seu nome"
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">E-mail</label>
              <input 
                type="email" 
                required
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Senha</label>
              <input 
                type="password" 
                required
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all mt-4">
              {authMode === 'login' ? 'Entrar' : 'Criar Conta'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-bold">Ou continue com</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-sm font-medium text-emerald-600 hover:underline"
            >
              {authMode === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre aqui'}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {toast && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => setToast(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 pb-24 lg:pb-8">
            {/* Dashboard Period Selector */}
            <div className="flex justify-end mb-4">
              <select 
                value={dashboardPeriod}
                onChange={(e) => setDashboardPeriod(e.target.value)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="hoje">Hoje</option>
                <option value="semana_atual">Esta Semana</option>
                <option value="mes_atual">Este Mês</option>
                <option value="mes_anterior">Mês Anterior</option>
                <option value="ano_atual">Este Ano</option>
                <option value="todos">Todo o Período</option>
              </select>
            </div>

            {/* Maintenance Status Grid */}
            <div className="space-y-3 mb-6">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsHealthCollapsed(!isHealthCollapsed)}
              >
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Saúde do Veículo</h3>
                <div className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  {isHealthCollapsed ? <ChevronRight className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />}
                </div>
              </div>
              
              <AnimatePresence>
                {!isHealthCollapsed && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-hidden"
                  >
                    {maintenanceAlerts.map((alert, index) => (
                      <div key={`alert-${index}`} className={cn(
                        "p-4 rounded-2xl border flex flex-col gap-3 transition-all",
                        alert.type === 'error'
                          ? "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 shadow-sm animate-pulse-subtle"
                          : alert.type === 'warning' 
                            ? "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20" 
                            : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
                      )}>
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-2 rounded-xl text-white shrink-0",
                            alert.type === 'error' ? "bg-rose-500" : alert.type === 'warning' ? "bg-amber-500" : "bg-emerald-500"
                          )}>
                            <alert.icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className={cn(
                                "text-sm font-bold truncate pr-2",
                                alert.type === 'error' ? "text-rose-900 dark:text-rose-300" : alert.type === 'warning' ? "text-amber-900 dark:text-amber-300" : "text-slate-700 dark:text-slate-200"
                              )}>{alert.titleClean}</h4>
                              {alert.type === 'error' && <span className="text-[10px] font-black bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded uppercase">Vencido</span>}
                              {alert.type === 'warning' && <span className="text-[10px] font-black bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded uppercase">Próximo</span>}
                            </div>
                            <p className={cn(
                              "text-[10px] font-medium mt-0.5 leading-tight",
                              alert.type === 'error' ? "text-rose-700 dark:text-rose-400" : alert.type === 'warning' ? "text-amber-700 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"
                            )}>{alert.message}</p>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              alert.type === 'error' ? "bg-rose-500" : alert.type === 'warning' ? "bg-amber-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${alert.progress}%` }}
                          />
                        </div>

                        {/* Action Buttons — only for error/warning */}
                        {(alert.type === 'error' || alert.type === 'warning') && (
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => {
                                setActiveTab('manutencao');
                                // Pre-preenche os dados no formulário através do estado de edição (sem ID para ser um novo registro)
                                setEditingMaintenance({ 
                                  service_type: alert.serviceKey,
                                  date: new Date().toISOString().slice(0, 10),
                                  odometer: user?.vehicle_odometer || 0,
                                  vehicle_name: user?.vehicle_model || '',
                                  driver_name: user?.name || ''
                                });
                              }}
                              className={cn(
                                "flex-1 text-[11px] font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1",
                                alert.type === 'error'
                                  ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-500/30"
                                  : "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-500/30"
                              )}
                            >
                              <Plus className="w-3 h-3" /> Registrar
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await api.maintenance.create({
                                    date: new Date().toISOString().slice(0, 10),
                                    odometer: user?.vehicle_odometer || 0,
                                    service_type: alert.serviceKey,
                                    cost: 0,
                                    description: 'Marcado como feito pelo painel de saúde',
                                    vehicle_name: user?.vehicle_model || '',
                                  });
                                  showToast(`${alert.titleClean} marcado como feito!`);
                                  await fetchData();
                                } catch (e: any) {
                                  showToast(e.message, 'error');
                                }
                              }}
                              className="flex-1 text-[11px] font-bold py-1.5 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Feito
                            </button>
                          </div>
                        )}
                                         </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {showInsight && smartInsight && (
              <div className={cn(
                "p-4 rounded-2xl flex items-start gap-4 mb-6 border relative",
                smartInsight.type === 'success' ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" : "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20"
              )}>
                <div className={cn(
                  "p-2 rounded-lg text-white",
                  smartInsight.type === 'success' ? "bg-emerald-500" : "bg-indigo-500"
                )}>
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className={cn(
                    "text-sm font-bold",
                    smartInsight.type === 'success' ? "text-emerald-900 dark:text-emerald-300" : "text-indigo-900 dark:text-indigo-300"
                  )}>Insight Inteligente</h4>
                  <p className={cn(
                    "text-xs mt-0.5",
                    smartInsight.type === 'success' ? "text-emerald-700 dark:text-emerald-400" : "text-indigo-700 dark:text-indigo-400"
                  )}>
                    {smartInsight.message}
                  </p>
                </div>
                <button 
                  onClick={() => setShowInsight(false)}
                  className={cn(
                    "shrink-0 hover:opacity-70 transition-opacity p-2 -mr-2 -mt-2",
                    smartInsight.type === 'success' ? "text-emerald-400 dark:text-emerald-300" : "text-indigo-400 dark:text-indigo-300"
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard 
                title="Ganhos Bruto" 
                value={`R$ ${(dashboardStats?.totalEarnings || 0).toFixed(2)}`} 
                icon={Wallet} 
                color="bg-emerald-600"
                subtitle="Valor Recebido"
              />
              <StatCard 
                title="Lucro Real" 
                value={`R$ ${(dashboardStats?.netProfit || 0).toFixed(2)}`} 
                icon={DollarSign} 
                color="bg-emerald-400"
                subtitle="Líquido (Ganhos - Gastos)"
              />
              <StatCard 
                title="Rentabilidade" 
                value={`R$ ${(dashboardStats?.profitability || 0).toFixed(2)}/km`} 
                icon={TrendingUp} 
                color="bg-blue-500"
                subtitle="Média por KM rodado"
              />
              <StatCard 
                title="Total KM" 
                value={`${(dashboardStats?.totalKm || 0).toFixed(0)} km`} 
                icon={Navigation} 
                color="bg-indigo-500"
                subtitle="Distância Total"
              />
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Depreciação</h3>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-500 text-white`}>
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  {vehicleDepreciation.valorPago > 0 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Valor Pago:</span>
                        <span className="font-medium text-slate-900 dark:text-white">R$ {vehicleDepreciation.valorPago.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Valor Atual:</span>
                        <span className="font-medium text-slate-900 dark:text-white">R$ {vehicleDepreciation.valorAtualEstimado.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-2">
                      <p className="text-xs text-slate-500 mb-2">Cadastre o valor do veículo para ver a depreciação.</p>
                      <button 
                        onClick={() => { setActiveTab('configuracoes'); setSettingsTab('vehicle'); }}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg"
                      >
                        Cadastrar valor
                      </button>
                    </div>
                  )}
                </div>
                {vehicleDepreciation.valorPago > 0 && (
                  <div className="flex justify-between items-center text-sm pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Depreciação/Mês</span>
                    <span className="font-bold text-rose-500">R$ {vehicleDepreciation.depreciacaoMensal.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <StatCard 
                title="Custo Combust./KM" 
                value={`R$ ${((dashboardStats?.totalFuel || 0) / (dashboardStats?.totalKm || 1)).toFixed(2)}`} 
                icon={Fuel} 
                color="bg-amber-500"
                subtitle="Média Geral"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Ganhos vs Gastos</h3>
                  <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Ganhos
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                      <div className="w-2 h-2 rounded-full bg-rose-500"></div> Gastos
                    </span>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyChartData}>
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
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6">Ganhos por App</h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platformData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {platformData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 mt-4">
                    {platformData.map((item) => (
                      <div key={item.name} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">R$ {item.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6 flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-emerald-500" />
                    Eficiência de Combustível
                  </h3>
                  <div className="space-y-4">
                    {fuelEfficiencyData.map((d) => (
                      <div key={d.vehicle} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">{d.vehicle}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Média</p>
                            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{d.avg} <span className="text-[10px] font-normal">km/L</span></p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Melhor</p>
                            <p className="text-sm font-black text-blue-600 dark:text-blue-400">{d.best} <span className="text-[10px] font-normal">km/L</span></p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {fuelEfficiencyData.length === 0 && (
                      <p className="text-xs text-slate-400 italic text-center py-4">Dados insuficientes para calcular eficiência.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Shifts */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Diário de Bordo (Turnos)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Data / Turno</th>
                      <th className="pb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Plataforma</th>
                      <th className="pb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Horário</th>
                      <th className="pb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">KM / Rentabilidade</th>
                      <th className="pb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ganho Total</th>
                      <th className="pb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {groupedShifts.map((item) => (
                      <tr key={`${item.date}-${item.shift_type}`} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{parseLocalDate(item.date).toLocaleDateString('pt-BR')}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">{item.shift_type}</p>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{item.platforms.join(', ')}</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-slate-600 dark:text-slate-400">{item.start_time} - {item.end_time}</td>
                        <td className="py-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400">{item.totalKm} km</p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">R$ {(item.totalEarnings / item.totalKm).toFixed(2)}/km</p>
                        </td>
                        <td className="py-4 text-sm font-bold text-slate-900 dark:text-white">R$ {item.totalEarnings.toFixed(2)}</td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => {
                              const groupShifts = shifts.filter(s => s.date === item.date && s.shift_type === item.shift_type);
                              setEditingShift(item);
                              setTotalKm(item.totalKm.toString());
                              setShiftPlatforms([
                                { 
                                  name: 'Uber', 
                                  earnings: groupShifts.find(s => s.platform === 'Uber')?.earnings.toString() || '',
                                  tips: groupShifts.find(s => s.platform === 'Uber')?.tips?.toString() || '',
                                  rides_count: groupShifts.find(s => s.platform === 'Uber')?.rides_count?.toString() || ''
                                },
                                { 
                                  name: '99Pop', 
                                  earnings: groupShifts.find(s => s.platform === '99Pop')?.earnings.toString() || '',
                                  tips: groupShifts.find(s => s.platform === '99Pop')?.tips?.toString() || '',
                                  rides_count: groupShifts.find(s => s.platform === '99Pop')?.rides_count?.toString() || ''
                                },
                                { 
                                  name: 'InDriver', 
                                  earnings: groupShifts.find(s => s.platform === 'InDriver')?.earnings.toString() || '',
                                  tips: groupShifts.find(s => s.platform === 'InDriver')?.tips?.toString() || '',
                                  rides_count: groupShifts.find(s => s.platform === 'InDriver')?.rides_count?.toString() || ''
                                },
                                { 
                                  name: 'Particular', 
                                  earnings: groupShifts.find(s => s.platform === 'Particular')?.earnings.toString() || '',
                                  tips: groupShifts.find(s => s.platform === 'Particular')?.tips?.toString() || '',
                                  rides_count: groupShifts.find(s => s.platform === 'Particular')?.rides_count?.toString() || ''
                                },
                              ]);
                              setActiveTab('turnos');
                            }}
                            className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                            title="Editar turno"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteShiftGroup(item.date, item.shift_type)}
                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Excluir turno"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'history_turnos': {
        const filteredShifts = filterDataByDate(groupedShifts, filterStartDate, filterEndDate);
        return (
          <div className="space-y-6 pb-24 lg:pb-8">
            <DateFilter 
              startDate={filterStartDate}
              endDate={filterEndDate}
              onStartChange={setFilterStartDate}
              onEndChange={setFilterEndDate}
              onClear={() => { setFilterStartDate(''); setFilterEndDate(''); }}
            />
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Histórico de Turnos</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Data / Turno</th>
                      <th className="pb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Plataforma</th>
                      <th className="pb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Horário</th>
                      <th className="pb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">KM / Rentabilidade</th>
                      <th className="pb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ganho Total</th>
                      <th className="pb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredShifts.map((item) => (
                      <tr key={`${item.date}-${item.shift_type}`} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{parseLocalDate(item.date).toLocaleDateString('pt-BR')}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">{item.shift_type}</p>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{item.platforms.join(', ')}</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-slate-600 dark:text-slate-400">{item.start_time} - {item.end_time}</td>
                        <td className="py-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400">{item.totalKm} km</p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">R$ {(item.totalEarnings / item.totalKm).toFixed(2)}/km</p>
                        </td>
                        <td className="py-4 text-sm font-bold text-slate-900 dark:text-white">R$ {item.totalEarnings.toFixed(2)}</td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => {
                              const groupShifts = shifts.filter(s => s.date === item.date && s.shift_type === item.shift_type);
                              setEditingShift(item);
                              setTotalKm(item.totalKm.toString());
                              setShiftPlatforms([
                                { 
                                  name: 'Uber', 
                                  earnings: groupShifts.find(s => s.platform === 'Uber')?.earnings.toString() || '',
                                  tips: groupShifts.find(s => s.platform === 'Uber')?.tips?.toString() || '',
                                  rides_count: groupShifts.find(s => s.platform === 'Uber')?.rides_count?.toString() || ''
                                },
                                { 
                                  name: '99Pop', 
                                  earnings: groupShifts.find(s => s.platform === '99Pop')?.earnings.toString() || '',
                                  tips: groupShifts.find(s => s.platform === '99Pop')?.tips?.toString() || '',
                                  rides_count: groupShifts.find(s => s.platform === '99Pop')?.rides_count?.toString() || ''
                                },
                                { 
                                  name: 'InDriver', 
                                  earnings: groupShifts.find(s => s.platform === 'InDriver')?.earnings.toString() || '',
                                  tips: groupShifts.find(s => s.platform === 'InDriver')?.tips?.toString() || '',
                                  rides_count: groupShifts.find(s => s.platform === 'InDriver')?.rides_count?.toString() || ''
                                },
                                { 
                                  name: 'Particular', 
                                  earnings: groupShifts.find(s => s.platform === 'Particular')?.earnings.toString() || '',
                                  tips: groupShifts.find(s => s.platform === 'Particular')?.tips?.toString() || '',
                                  rides_count: groupShifts.find(s => s.platform === 'Particular')?.rides_count?.toString() || ''
                                },
                              ]);
                              setActiveTab('turnos');
                            }}
                            className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                            title="Editar turno"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteShiftGroup(item.date, item.shift_type)}
                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Excluir turno"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }
      case 'history_abastecimentos': {
        const filteredFuel = filterDataByDate(fuelLogs, filterStartDate, filterEndDate);
        return (
          <div className="space-y-6 pb-24 lg:pb-8">
            <DateFilter 
              startDate={filterStartDate}
              endDate={filterEndDate}
              onStartChange={setFilterStartDate}
              onEndChange={setFilterEndDate}
              onClear={() => { setFilterStartDate(''); setFilterEndDate(''); }}
            />
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6">Histórico de Abastecimentos</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Data</th>
                      <th className="pb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Combustível</th>
                      <th className="pb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Odômetro</th>
                      <th className="pb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Litros / Preço</th>
                      <th className="pb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</th>
                      <th className="pb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredFuel.map((item) => (
                      <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 text-sm font-bold text-slate-900 dark:text-white">{parseLocalDate(item.date).toLocaleDateString('pt-BR')}</td>
                        <td className="py-4 text-sm text-slate-600 dark:text-slate-400">{item.fuel_type}</td>
                        <td className="py-4 text-sm text-slate-600 dark:text-slate-400">{item.odometer} km</td>
                        <td className="py-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400">{item.liters} L</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">R$ {item.price_per_liter.toFixed(2)}/L</p>
                        </td>
                        <td className="py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">R$ {item.total_value.toFixed(2)}</td>
                        <td className="py-4 text-right flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setEditingFuel(item);
                              setFuelPrice(item.price_per_liter.toString());
                              setFuelLiters(item.liters.toString());
                              setActiveTab('abastecimentos');
                            }}
                            className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                            title="Editar registro"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteFuel(item.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Excluir registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }
      case 'history_manutencao': {
        const filteredMaintenance = filterDataByDate(maintenanceLogs, filterStartDate, filterEndDate);
        const maintenanceByType = filteredMaintenance.reduce((acc: any, m) => {
          const cat = m.category || 'Outros';
          acc[cat] = (acc[cat] || 0) + m.cost;
          return acc;
        }, {});
        const maintenanceChartData = Object.entries(maintenanceByType).map(([name, value]) => ({ name, value }));

        return (
          <div className="space-y-6 pb-24 lg:pb-8">
            <DateFilter 
              startDate={filterStartDate}
              endDate={filterEndDate}
              onStartChange={setFilterStartDate}
              onEndChange={setFilterEndDate}
              onClear={() => { setFilterStartDate(''); setFilterEndDate(''); }}
            />
            
            {filteredMaintenance.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6">Distribuição de Custos</h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={maintenanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Custo']}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6">Histórico de Manutenção</h3>
              <div className="space-y-4">
                {filteredMaintenance.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                        <Wrench className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.service_type}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.description} • {item.odometer} km</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">R$ {item.cost.toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">{parseLocalDate(item.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingMaintenance(item);
                          setActiveTab('manutencao');
                        }}
                        className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                        title="Editar registro"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMaintenance(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Excluir registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredMaintenance.length === 0 && (
                  <div className="text-center py-12">
                    <Wrench className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 dark:text-slate-500 font-medium">Nenhuma manutenção encontrada no período.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }
      case 'history_despesas': {
        const filteredExpenses = filterDataByDate(fixedExpenses, filterStartDate, filterEndDate);
        return (
          <div className="space-y-6 pb-24 lg:pb-8">
            <DateFilter 
              startDate={filterStartDate}
              endDate={filterEndDate}
              onStartChange={setFilterStartDate}
              onEndChange={setFilterEndDate}
              onClear={() => { setFilterStartDate(''); setFilterEndDate(''); }}
            />
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Histórico de Despesas Fixas</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-4">Data</th>
                      <th className="px-6 py-4">Tipo</th>
                      <th className="px-6 py-4">Descrição</th>
                      <th className="px-6 py-4">Valor</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">{parseLocalDate(expense.date).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
                            {expense.expense_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">{expense.description || '-'}</td>
                        <td className="px-6 py-4 font-bold text-rose-600 dark:text-rose-400">R$ {expense.value.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                setEditingFixedExpense(expense);
                                setActiveTab('despesas');
                              }}
                              className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteFixedExpense(expense.id)}
                              className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredExpenses.length === 0 && (
                  <div className="text-center py-12">
                    <Receipt className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 dark:text-slate-500 font-medium">Nenhuma despesa encontrada no período.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }
      case 'turnos':
        return (
          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mb-24 lg:mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <Clock className="w-6 h-6 text-emerald-500" />
              {editingShift ? 'Editar Turno' : 'Encerrar Turno'}
            </h2>
            <form key={editingShift ? `${editingShift.date}-${editingShift.shift_type}` : 'new'} onSubmit={handleSaveShift} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Veículo</label>
                  <input name="vehicle_name" type="text" defaultValue={editingShift?.vehicle_name || user?.vehicle_model || ''} placeholder="Ex: Onix Plus" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Motorista</label>
                  <input name="driver_name" type="text" defaultValue={editingShift?.driver_name || user?.name || ''} placeholder="Ex: João Silva" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
                  <input name="date" type="date" defaultValue={editingShift?.date || new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Turno</label>
                  <select name="shift_type" defaultValue={editingShift?.shift_type || 'Turno 1'} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="Turno 1">Turno 1 (Manhã)</option>
                    <option value="Turno 2">Turno 2 (Tarde)</option>
                    <option value="Turno 3">Turno 3 (Noite)</option>
                    <option value="Turno 4">Turno 4 (Madrugada)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hora Início</label>
                  <input name="start_time" type="time" defaultValue={editingShift?.start_time || "06:00"} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hora Fim</label>
                  <input name="end_time" type="time" defaultValue={editingShift?.end_time || "18:00"} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">KM Total do Turno</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  value={totalKm}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9,.]/g, '').replace('.', ',');
                    setTotalKm(val);
                  }}
                  placeholder="Ex: 150,50"
                  className={cn(
                    "w-full px-4 py-4 rounded-2xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-xl font-black",
                    formErrors.totalKm ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                  )}
                />
                <FormError message={formErrors.totalKm} />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Ganhos por Plataforma</label>
                <FormError message={formErrors.platforms} />
                
                {/* Add Platform Section */}
                <div className="grid grid-cols-2 lg:flex gap-3 items-end">
                  <div className="col-span-2 lg:col-span-1 lg:flex-1 space-y-2">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Plataforma</label>
                    <select 
                      id="platform-select"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="Uber">Uber</option>
                      <option value="99Pop">99Pop</option>
                      <option value="InDriver">InDriver</option>
                      <option value="Particular">Particular</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  <div className="space-y-2 lg:flex-1">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Valor (R$)</label>
                    <input 
                      id="platform-value"
                      type="text" 
                      inputMode="decimal"
                      placeholder="0,00"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2 lg:flex-1">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Corridas</label>
                    <input 
                      id="platform-rides"
                      type="number" 
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 space-y-2 lg:flex-1">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Gorjeta (R$)</label>
                    <input 
                      id="platform-tips"
                      type="text" 
                      inputMode="decimal"
                      placeholder="0,00"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const select = document.getElementById('platform-select') as HTMLSelectElement;
                          const input = document.getElementById('platform-value') as HTMLInputElement;
                          const ridesInput = document.getElementById('platform-rides') as HTMLInputElement;
                          const tipsInput = document.getElementById('platform-tips') as HTMLInputElement;
                          const name = select.value;
                          const earnings = input.value;
                          const rides_count = ridesInput.value;
                          const tips = tipsInput.value;
                          
                          if (!earnings) return;

                          const existingIndex = shiftPlatforms.findIndex(p => p.name === name);
                          if (existingIndex >= 0) {
                            const newPlatforms = [...shiftPlatforms];
                            newPlatforms[existingIndex].earnings = earnings;
                            newPlatforms[existingIndex].rides_count = rides_count;
                            newPlatforms[existingIndex].tips = tips;
                            setShiftPlatforms(newPlatforms);
                          } else {
                            setShiftPlatforms([...shiftPlatforms, { name, earnings, rides_count, tips }]);
                          }
                          input.value = '';
                          ridesInput.value = '';
                          tipsInput.value = '';
                          input.focus();
                        }
                      }}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      const select = document.getElementById('platform-select') as HTMLSelectElement;
                      const input = document.getElementById('platform-value') as HTMLInputElement;
                      const ridesInput = document.getElementById('platform-rides') as HTMLInputElement;
                      const tipsInput = document.getElementById('platform-tips') as HTMLInputElement;
                      const name = select.value;
                      const earnings = input.value;
                      const rides_count = ridesInput.value;
                      const tips = tipsInput.value;
                      
                      if (!earnings) return;

                      const existingIndex = shiftPlatforms.findIndex(p => p.name === name);
                      if (existingIndex >= 0) {
                        const newPlatforms = [...shiftPlatforms];
                        newPlatforms[existingIndex].earnings = earnings;
                        newPlatforms[existingIndex].rides_count = rides_count;
                        newPlatforms[existingIndex].tips = tips;
                        setShiftPlatforms(newPlatforms);
                      } else {
                        setShiftPlatforms([...shiftPlatforms, { name, earnings, rides_count, tips }]);
                      }
                      input.value = '';
                      ridesInput.value = '';
                      tipsInput.value = '';
                      input.focus();
                    }}
                    className="col-span-2 lg:col-span-1 w-full lg:w-auto px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold shadow-lg shadow-emerald-200 dark:shadow-none whitespace-nowrap"
                  >
                    Adicionar
                  </button>
                </div>

                {/* List of Added Platforms */}
                <div className="grid gap-3 mt-4">
                  {shiftPlatforms.filter(p => p.earnings && parseFloat(p.earnings.replace(',', '.')) > 0).map((platform, index) => (
                      <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            platform.name === 'Uber' ? "bg-black" : 
                            platform.name === '99Pop' ? "bg-yellow-400" :
                            platform.name === 'InDriver' ? "bg-emerald-500" : "bg-slate-400"
                          )} />
                          <div>
                            <p className="font-bold text-slate-700 dark:text-slate-300">{platform.name}</p>
                            <div className="flex gap-3 mt-1">
                              {platform.rides_count && (
                                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                                  {platform.rides_count} Corridas
                                </span>
                              )}
                              {platform.tips && parseFloat(platform.tips.replace(',', '.')) > 0 && (
                                <span className="text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold">
                                  R$ {platform.tips} Gorjeta
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-slate-900 dark:text-white">R$ {platform.earnings}</span>
                          <button 
                            type="button"
                            onClick={() => {
                              const newPlatforms = shiftPlatforms.filter(p => p.name !== platform.name);
                              setShiftPlatforms(newPlatforms);
                            }}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                  ))}
                  {shiftPlatforms.filter(p => p.earnings && parseFloat(p.earnings.replace(',', '.')) > 0).length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                      <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum ganho adicionado ainda.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">KM Turno</p>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    {totalKm || '0'} <span className="text-sm font-bold opacity-60">km</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Total Ganhos</p>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    <span className="text-sm font-bold opacity-60">R$</span> {shiftPlatforms.reduce((acc, p) => acc + (parseFloat(p.earnings.replace(',', '.')) || 0), 0).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setTotalKm('');
                    setShiftPlatforms([
                      { name: 'Uber', earnings: '', tips: '', rides_count: '' },
                      { name: '99Pop', earnings: '', tips: '', rides_count: '' },
                      { name: 'InDriver', earnings: '', tips: '', rides_count: '' },
                      { name: 'Particular', earnings: '', tips: '', rides_count: '' },
                    ]);
                    setEditingShift(null);
                  }}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold py-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {editingShift ? 'Cancelar' : 'Limpar'}
                </button>
                <button type="submit" className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all active:scale-[0.98]">
                  {editingShift ? 'Atualizar Turno' : 'Salvar Turno'}
                </button>
              </div>
            </form>
          </div>
        );
      case 'abastecimentos':
        return (
          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mb-24 lg:mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <Fuel className="w-6 h-6 text-emerald-500" />
              {editingFuel ? 'Editar Abastecimento' : 'Novo Abastecimento'}
            </h2>
            <form key={editingFuel?.id || 'new'} onSubmit={handleSaveFuel} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Veículo</label>
                  <input name="vehicle_name" type="text" defaultValue={editingFuel?.vehicle_name || user?.vehicle_model || ''} placeholder="Ex: Onix Plus" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Motorista</label>
                  <input name="driver_name" type="text" defaultValue={editingFuel?.driver_name || user?.name || ''} placeholder="Ex: João Silva" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
                  <input name="date" type="date" defaultValue={editingFuel?.date || new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Odômetro (km)</label>
                  <input 
                    name="odometer" 
                    type="number" 
                    defaultValue={editingFuel?.odometer || ''}
                    placeholder="125.400" 
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none",
                      formErrors.odometer ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                    )}
                  />
                  <FormError message={formErrors.odometer} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Combustível</label>
                  <select name="fuel_type" defaultValue={editingFuel?.fuel_type || 'Gasolina'} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option>Gasolina</option>
                    <option>Etanol</option>
                    <option>Diesel</option>
                    <option>GNV</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-8">
                  <input 
                    type="checkbox" 
                    name="is_full_tank" 
                    id="is_full_tank"
                    defaultChecked={editingFuel ? editingFuel.is_full_tank === 1 : true}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                  />
                  <label htmlFor="is_full_tank" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Tanque Cheio?</label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Preço por Litro (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="5.49" 
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none",
                      formErrors.fuelPrice ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                    )}
                  />
                  <FormError message={formErrors.fuelPrice} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Quantidade (Litros)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    placeholder="40.0" 
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none",
                      formErrors.fuelLiters ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                    )}
                  />
                  <FormError message={formErrors.fuelLiters} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Valor Total (R$)</label>
                  <input 
                    type="text" 
                    value={`R$ ${fuelTotal}`}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-emerald-700 dark:text-emerald-400" 
                    readOnly 
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                {editingFuel && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingFuel(null);
                      setFuelPrice('');
                      setFuelLiters('');
                    }}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold py-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancelar
                  </button>
                )}
                <button type="submit" className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all active:scale-[0.98]">
                  {editingFuel ? 'Atualizar Abastecimento' : 'Salvar Registro'}
                </button>
              </div>
            </form>
          </div>
        );
      case 'manutencao':
        return (
          <div className="space-y-8 pb-24 lg:pb-8">
            <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <Wrench className="w-6 h-6 text-emerald-500" />
                {editingMaintenance?.id ? 'Editar Manutenção' : 'Nova Manutenção'}
              </h2>
              <form key={editingMaintenance?.id || 'new'} onSubmit={handleSaveMaintenance} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Veículo</label>
                    <input name="vehicle_name" type="text" defaultValue={editingMaintenance?.vehicle_name || user?.vehicle_model || ''} placeholder="Ex: Onix Plus" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Motorista</label>
                    <input name="driver_name" type="text" defaultValue={editingMaintenance?.driver_name || user?.name || ''} placeholder="Ex: João Silva" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
                    <input 
                      name="date" 
                      type="date" 
                      defaultValue={editingMaintenance?.date || new Date().toISOString().split('T')[0]} 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Odômetro (km)</label>
                    <input 
                      name="odometer" 
                      type="number" 
                      defaultValue={editingMaintenance?.odometer || ''} 
                      placeholder="Ex: 125.400" 
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none",
                        formErrors.odometer ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                      )}
                    />
                    <FormError message={formErrors.odometer} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Serviço</label>
                    <div className="flex gap-2">
                      <select 
                        name="service_type" 
                        defaultValue={editingMaintenance?.service_type || ''}
                        className={cn(
                          "flex-1 px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none",
                          formErrors.service_type ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                        )}
                      >
                        <option value="">Selecione um serviço</option>
                        {serviceTypes.map(type => (
                          <option key={type.id} value={type.name}>{type.name}</option>
                        ))}
                      </select>
                      <button 
                        type="button"
                        onClick={() => {
                          const name = prompt('Novo Tipo de Serviço:');
                          if (name) handleAddServiceType(name);
                        }}
                        className="px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all"
                        title="Adicionar novo tipo"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <FormError message={formErrors.service_type} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Categoria</label>
                    <select 
                      name="category" 
                      defaultValue={editingMaintenance?.category || 'Outros'}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="Pneus">Pneus</option>
                      <option value="Motor">Motor</option>
                      <option value="Freios">Freios</option>
                      <option value="Suspensão">Suspensão</option>
                      <option value="Elétrica">Elétrica</option>
                      <option value="Óleo/Filtros">Óleo/Filtros</option>
                      <option value="Estética">Estética</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Descrição / Oficina</label>
                  <input 
                    name="description" 
                    type="text" 
                    defaultValue={editingMaintenance?.description || ''} 
                    placeholder="Ex: Troca de óleo 5W30 - Oficina do João" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Custo Total (R$)</label>
                    <input 
                      name="cost" 
                      type="number" 
                      step="0.01" 
                      defaultValue={editingMaintenance?.cost || ''} 
                      placeholder="Ex: 350.00" 
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-rose-600 dark:text-rose-400",
                        formErrors.cost ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                      )}
                    />
                    <FormError message={formErrors.cost} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Anexo (Recibo)</label>
                    <button type="button" className="w-full px-4 py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-xs flex items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-500 transition-all">
                      <Plus className="w-4 h-4" /> Upload Foto
                    </button>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  {editingMaintenance && (
                    <button 
                      type="button" 
                      onClick={() => setEditingMaintenance(null)}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold py-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                      Cancelar
                    </button>
                  )}
                  <button type="submit" className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all active:scale-[0.98]">
                    {editingMaintenance ? 'Atualizar Manutenção' : 'Salvar Manutenção'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      case 'despesas': {
        const expenseDistribution = (fixedExpenses || []).reduce((acc: any, e) => {
          if (!e) return acc;
          const cat = e.category || 'Outros';
          acc[cat] = (acc[cat] || 0) + (e.value || 0);
          return acc;
        }, {});
        const expenseChartData = Object.entries(expenseDistribution).map(([name, value]) => ({ name, value }));
        const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'];

        return (
          <div className="space-y-8 pb-24 lg:pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                  <Receipt className="w-6 h-6 text-emerald-500" />
                  {editingFixedExpense ? 'Editar Despesa Fixa' : 'Nova Despesa Fixa'}
                </h2>
                <form key={editingFixedExpense?.id || 'new'} onSubmit={handleSaveFixedExpense} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Veículo</label>
                      <input name="vehicle_name" type="text" defaultValue={editingFixedExpense?.vehicle_name || user?.vehicle_model || ''} placeholder="Ex: Onix Plus" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Motorista</label>
                      <input name="driver_name" type="text" defaultValue={editingFixedExpense?.driver_name || user?.name || ''} placeholder="Ex: João Silva" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
                      <input 
                        name="date" 
                        type="date" 
                        defaultValue={editingFixedExpense?.date || new Date().toISOString().split('T')[0]} 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Valor (R$)</label>
                      <input 
                        name="value" 
                        type="number" 
                        step="0.01"
                        defaultValue={editingFixedExpense?.value || ''} 
                        placeholder="Ex: 1200.00" 
                        className={cn(
                          "w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none",
                          formErrors.value ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                        )}
                      />
                      <FormError message={formErrors.value} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Despesa</label>
                    <div className="flex gap-2">
                      <select 
                        name="expense_type" 
                        defaultValue={editingFixedExpense?.expense_type || ''}
                        className={cn(
                          "flex-1 px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none",
                          formErrors.expense_type ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                        )}
                      >
                        <option value="">Selecione uma despesa</option>
                        {fixedExpenseTypes.map(type => (
                          <option key={type.id} value={type.name}>{type.name}</option>
                        ))}
                      </select>
                      <button 
                        type="button"
                        onClick={() => {
                          const name = prompt('Novo Tipo de Despesa Fixa:');
                          if (name) handleAddFixedExpenseType(name);
                        }}
                        className="px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all"
                        title="Adicionar novo tipo"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <FormError message={formErrors.expense_type} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Categoria</label>
                    <select 
                      name="category" 
                      defaultValue={editingFixedExpense?.category || 'Outros'}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="Pedágios">Pedágios</option>
                      <option value="Limpeza">Limpeza</option>
                      <option value="Multas">Multas</option>
                      <option value="Seguro">Seguro</option>
                      <option value="Impostos">Impostos</option>
                      <option value="Internet">Internet</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Descrição (Opcional)</label>
                    <input 
                      name="description" 
                      type="text" 
                      defaultValue={editingFixedExpense?.description || ''} 
                      placeholder="Ex: Parcela 12/48" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                    />
                  </div>
                  <div className="pt-4 flex gap-3">
                    {editingFixedExpense && (
                      <button 
                        type="button" 
                        onClick={() => setEditingFixedExpense(null)}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold py-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                      >
                        Cancelar
                      </button>
                    )}
                    <button type="submit" className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all active:scale-[0.98]">
                      {editingFixedExpense ? 'Atualizar Despesa' : 'Salvar Despesa'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Distribuição de Despesas</h3>
                <div className="h-[300px] w-full">
                  {expenseChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {expenseChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                        />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                      Nenhuma despesa registrada.
                    </div>
                  )}
                </div>
                <div className="mt-8 space-y-4">
                  {expenseChartData.map((item, index) => (
                    <div key={item.name} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">R$ {(item.value as number).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }
      case 'relatorios': {
        const now = new Date();
        const startOfPeriod = new Date();
        if (reportPeriod === 'week') startOfPeriod.setDate(now.getDate() - 7);
        else if (reportPeriod === 'month') startOfPeriod.setMonth(now.getMonth() - 1);
        else if (reportPeriod === 'year') startOfPeriod.setFullYear(now.getFullYear() - 1);

        const filterByReportParams = (item: any) => {
          const itemDate = parseLocalDate(item.date);
          if (itemDate < startOfPeriod) return false;
          if (reportPlatform !== 'all' && item.platform && item.platform.toLowerCase() !== reportPlatform.toLowerCase()) return false;
          if (reportVehicle !== 'all' && item.vehicle_name && item.vehicle_name.toLowerCase() !== reportVehicle.toLowerCase()) return false;
          if (reportDriver !== 'all' && item.driver_name && item.driver_name.toLowerCase() !== reportDriver.toLowerCase()) return false;
          
          // Fuel Type filtering
          if (reportFuelType !== 'all' && item.fuel_type && item.fuel_type.toLowerCase() !== reportFuelType.toLowerCase()) return false;

          // Vehicle Type filtering
          // Note: This assumes vehicle_type is stored in the item or we can look it up
          // For now let's assume it's in the item if it's a vehicle-related record
          if (reportVehicleType !== 'all' && item.vehicle_type && item.vehicle_type.toLowerCase() !== reportVehicleType.toLowerCase()) return false;

          // Category filtering
          if (reportCategory !== 'all') {
            const category = item.category || item.expense_type || item.service_type;
            if (category && category.toLowerCase() !== reportCategory.toLowerCase()) return false;
          }
          
          return true;
        };

        const filteredShifts = shifts.filter(filterByReportParams);
        const filteredFuel = fuelLogs.filter(filterByReportParams);
        const filteredMaintenance = maintenanceLogs.filter(filterByReportParams);
        const filteredFixedExpenses = fixedExpenses.filter(filterByReportParams);

        const reportEarnings = filteredShifts.reduce((acc, s) => acc + s.earnings, 0);
        const reportKm = filteredShifts.reduce((acc, s) => acc + s.km, 0);
        const reportFuel = filteredFuel.reduce((acc, f) => acc + f.total_value, 0);
        const reportMaintenance = filteredMaintenance.reduce((acc, m) => acc + m.cost, 0);
        const reportFixed = filteredFixedExpenses.reduce((acc, e) => acc + e.value, 0);
        const reportExpenses = reportFuel + reportMaintenance + reportFixed;
        const reportProfit = reportEarnings - reportExpenses;
        const reportRentability = reportKm > 0 ? (reportEarnings / reportKm) : 0;

        // Maintenance breakdown
        const maintenanceByType = filteredMaintenance.reduce((acc: any, m) => {
          const cat = m.category || 'Outros';
          acc[cat] = (acc[cat] || 0) + m.cost;
          return acc;
        }, {});
        const maintenanceChartData = Object.entries(maintenanceByType).map(([name, value]) => ({ name, value }));

        // Fuel analysis
        const fuelByVehicle = filteredFuel.reduce((acc: any, f) => {
          const v = f.vehicle_name || 'Desconhecido';
          if (!acc[v]) acc[v] = { total: 0, liters: 0, count: 0 };
          acc[v].total += f.total_value;
          acc[v].liters += f.liters;
          acc[v].count += 1;
          return acc;
        }, {});

        // Unique values for filters
        const vehicles = Array.from(new Set([
          ...shifts.map(s => s.vehicle_name),
          ...fuelLogs.map(f => f.vehicle_name),
          ...maintenanceLogs.map(m => m.vehicle_name),
          ...fixedExpenses.map(e => e.vehicle_name)
        ])).filter(Boolean);

        const drivers = Array.from(new Set([
          ...shifts.map(s => s.driver_name),
          ...fuelLogs.map(f => f.driver_name),
          ...maintenanceLogs.map(m => m.driver_name),
          ...fixedExpenses.map(e => e.driver_name)
        ])).filter(Boolean);

        const categories = Array.from(new Set([
          ...maintenanceLogs.map(m => m.category),
          ...fixedExpenses.map(e => e.expense_type)
        ])).filter(Boolean);

        const fuelTypes = Array.from(new Set([
          ...fuelLogs.map(f => f.fuel_type)
        ])).filter(Boolean);

        const vehicleTypes = Array.from(new Set([
          ...shifts.map(s => s.vehicle_type),
          ...fuelLogs.map(f => f.vehicle_type),
          ...maintenanceLogs.map(m => m.vehicle_type),
          ...fixedExpenses.map(e => e.vehicle_type)
        ])).filter(Boolean);

        return (
          <div className="space-y-8 pb-24 lg:pb-8">
            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex flex-wrap gap-4 items-end justify-between">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Período</label>
                    <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                      {[
                        { id: 'week', label: 'Semana' },
                        { id: 'month', label: 'Mês' },
                        { id: 'year', label: 'Ano' }
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setReportPeriod(p.id as any)}
                          className={cn(
                            "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                            reportPeriod === p.id 
                              ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                          )}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Plataforma</label>
                    <select 
                      value={reportPlatform}
                      onChange={(e) => setReportPlatform(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">Todas</option>
                      <option value="uber">Uber</option>
                      <option value="99pop">99Pop</option>
                      <option value="particular">Particular</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={() => handleExportPDF('full', {
                    shifts: filteredShifts,
                    fuel: filteredFuel,
                    maintenance: filteredMaintenance,
                    fixedExpenses: filteredFixedExpenses,
                    earnings: reportEarnings,
                    expenses: reportExpenses,
                    km: reportKm,
                    title: `Relatório Filtrado - ${reportPeriod === 'week' ? 'Semana' : reportPeriod === 'month' ? 'Mês' : 'Ano'}`
                  })}
                  className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                >
                  <Download className="w-4 h-4" /> Exportar PDF
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Veículo</label>
                  <select 
                    value={reportVehicle}
                    onChange={(e) => setReportVehicle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Todos os Veículos</option>
                    {vehicles.map(v => <option key={v} value={v.toLowerCase()}>{v}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Motorista</label>
                  <select 
                    value={reportDriver}
                    onChange={(e) => setReportDriver(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Todos os Motoristas</option>
                    {drivers.map(d => <option key={d} value={d.toLowerCase()}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Categoria</label>
                  <select 
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Todas as Categorias</option>
                    {categories.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Combustível</label>
                  <select 
                    value={reportFuelType}
                    onChange={(e) => setReportFuelType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Todos os Tipos</option>
                    {fuelTypes.map(f => <option key={f} value={f.toLowerCase()}>{f}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tipo Veículo</label>
                  <select 
                    value={reportVehicleType}
                    onChange={(e) => setReportVehicleType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Todos os Tipos</option>
                    {vehicleTypes.map(vt => <option key={vt} value={vt.toLowerCase()}>{vt}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <StatCard 
                title="Ganhos Brutos" 
                value={`R$ ${reportEarnings.toFixed(2)}`} 
                icon={DollarSign} 
                color="bg-emerald-500"
                subtitle={reportPeriod === 'month' ? 'Este Mês' : reportPeriod === 'week' ? 'Esta Semana' : 'Este Ano'}
              />
              <StatCard 
                title="Total Gastos" 
                value={`R$ ${reportExpenses.toFixed(2)}`} 
                icon={TrendingUp} 
                color="bg-rose-500"
                subtitle="Combustível + Manutenção"
              />
              <StatCard 
                title="Lucro Líquido" 
                value={`R$ ${reportProfit.toFixed(2)}`} 
                icon={TrendingUp} 
                color="bg-indigo-500"
                subtitle={`Margem de ${reportEarnings > 0 ? ((reportProfit / reportEarnings) * 100).toFixed(0) : 0}%`}
              />
              <StatCard 
                title="Rentabilidade" 
                value={`R$ ${reportRentability.toFixed(2)}/km`} 
                icon={Navigation} 
                color="bg-blue-500"
                subtitle="Média do Período"
              />
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Depreciação</h3>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-500 text-white`}>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                {vehicleDepreciation.valorPago > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Valor Pago:</span>
                      <span className="font-medium text-slate-900 dark:text-white">R$ {vehicleDepreciation.valorPago.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Valor Atual:</span>
                      <span className="font-medium text-slate-900 dark:text-white">R$ {vehicleDepreciation.valorAtualEstimado.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Depreciação/mês:</span>
                      <span className="font-bold text-red-500">R$ {vehicleDepreciation.depreciacaoMensal.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-sm text-slate-500 mb-3">Cadastre o valor do veículo para ver a depreciação.</p>
                    <button 
                      onClick={() => { setActiveTab('configuracoes'); setSettingsTab('vehicle'); }}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                      Cadastrar valor
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6">Ganhos vs Gastos</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Ganhos', value: reportEarnings, fill: '#10b981' },
                      { name: 'Combustível', value: reportFuel, fill: '#f43f5e' },
                      { name: 'Manutenção', value: reportMaintenance, fill: '#f59e0b' },
                      { name: 'Fixas', value: reportFixed, fill: '#6366f1' }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                          color: darkMode ? '#f8fafc' : '#0f172a'
                        }}
                        formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6">Manutenção por Categoria</h3>
                <div className="h-[300px] w-full">
                  {maintenanceChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={maintenanceChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {maintenanceChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#6366f1', '#8b5cf6'][index % 6]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                            color: darkMode ? '#f8fafc' : '#0f172a'
                          }}
                          formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Custo']}
                        />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                      Nenhuma manutenção registrada no período.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fuel Analysis Section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6 flex items-center gap-2">
                <Fuel className="w-5 h-5 text-emerald-500" />
                Análise de Combustível por Veículo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(fuelByVehicle).map(([vehicle, data]: [string, any]) => {
                  const vehicleShifts = filteredShifts.filter(s => s.vehicle_name?.toLowerCase() === vehicle.toLowerCase());
                  const vehicleFuel = filteredFuel.filter(f => f.vehicle_name?.toLowerCase() === vehicle.toLowerCase());
                  
                  // Sort logs by odometer ascending for accurate calculation
                  const sortedFuel = [...vehicleFuel].sort((a, b) => (a.odometer || 0) - (b.odometer || 0));
                  
                  let calcKm = 0;
                  let calcLiters = 0;
                  let lastFullOdo = -1;
                  let litersSinceLastFull = 0;

                  for (let i = 0; i < sortedFuel.length; i++) {
                    const log = sortedFuel[i];
                    if (log.is_full_tank) {
                      if (lastFullOdo !== -1 && log.odometer > lastFullOdo) {
                        calcKm += (log.odometer - lastFullOdo);
                        calcLiters += (litersSinceLastFull + log.liters);
                      }
                      lastFullOdo = log.odometer;
                      litersSinceLastFull = 0;
                    } else {
                      litersSinceLastFull += log.liters;
                    }
                  }

                  // Fallback to global odometer range if no full tank pairs found
                  let vehicleKm = vehicleShifts.reduce((acc, s) => acc + s.km, 0);
                  if (sortedFuel.length >= 2) {
                    const minOdo = sortedFuel[0].odometer;
                    const maxOdo = sortedFuel[sortedFuel.length - 1].odometer;
                    if (maxOdo > minOdo) vehicleKm = maxOdo - minOdo;
                  }

                  const costPerKm = vehicleKm > 0 ? (data.total / vehicleKm) : 0;
                  const avgConsumption = calcLiters > 0 ? (calcKm / calcLiters) : (data.liters > 0 && vehicleKm > 0 ? (vehicleKm / data.liters) : 0);

                  return (
                    <div key={vehicle} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-900 dark:text-white">{vehicle}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data.count} Abast.</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custo/KM</p>
                          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">R$ {costPerKm.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consumo Médio</p>
                          <p className="text-lg font-black text-blue-600 dark:text-blue-400">{avgConsumption.toFixed(1)} <span className="text-xs">km/L</span></p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between text-xs">
                        <span className="text-slate-500">Total Gasto:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">R$ {data.total.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
                {Object.keys(fuelByVehicle).length === 0 && (
                  <div className="col-span-full py-8 text-center text-slate-400 text-sm italic">
                    Nenhum dado de combustível disponível para análise.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }
      case 'configuracoes':
        return (
          <div className="space-y-8 pb-24 lg:pb-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Settings className="w-6 h-6 text-emerald-500" />
              Configurações
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Navigation Tabs (Vertical) */}
              <div className="space-y-1">
                {[
                  { id: 'profile', label: 'Meu Perfil', icon: User },
                  { id: 'vehicle', label: 'Veículo', icon: Car },
                  { id: 'categories', label: 'Categorias', icon: Receipt },
                  { id: 'subscription', label: 'Assinatura', icon: Crown },
                  { id: 'notifications', label: 'Notificações', icon: Bell },
                  { id: 'security', label: 'Segurança', icon: ShieldCheck },

                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSettingsTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      settingsTab === item.id 
                        ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" 
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Settings Content */}
              <div className="md:col-span-2 space-y-6">
                {settingsTab === 'profile' && (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {user?.photo_url ? (
                          <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{user?.name}</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{user?.email}</p>
                      </div>
                      <button 
                        onClick={handleSyncGooglePhoto}
                        className="ml-auto text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                      >
                        Sincronizar Foto Google
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Nome Completo</label>
                        <input 
                          type="text" 
                          value={user?.name || ''} 
                          onChange={(e) => setUser({ ...user, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Telefone</label>
                        <input 
                          type="text" 
                          value={user?.phone || ''} 
                          onChange={(e) => setUser({ ...user, phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">Modo Escuro</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">Economize bateria em telas OLED</p>
                          </div>
                          <button 
                            onClick={() => setDarkMode(!darkMode)}
                            className={cn(
                              "w-10 h-5 rounded-full relative transition-all",
                              darkMode ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                              darkMode ? "right-1" : "left-1"
                            )}></div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'vehicle' && (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-slate-900 dark:text-white">Dados do Veículo</h3>
                      <button className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">Trocar Veículo</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Modelo</label>
                        <input 
                          type="text" 
                          value={user?.vehicle_model || ''} 
                          onChange={(e) => setUser({ ...user, vehicle_model: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Placa</label>
                        <input 
                          type="text" 
                          value={user?.vehicle_plate || ''} 
                          onChange={(e) => setUser({ ...user, vehicle_plate: e.target.value.toUpperCase() })}
                          placeholder="ABC1D23"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Ano</label>
                        <input 
                          type="number" 
                          min="1990"
                          max="2030"
                          value={user?.vehicle_year ? Number(user.vehicle_year) : ''} 
                          onChange={(e) => setUser({ ...user, vehicle_year: e.target.value ? parseInt(e.target.value) : undefined })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Combustível Principal</label>
                        <select 
                          value={user?.fuel_type || ''}
                          onChange={(e) => setUser({ ...user, fuel_type: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                        >
                          <option value="">Selecione...</option>
                          <option value="Flex">Flex (Gasolina/Etanol)</option>
                          <option value="Gasolina">Gasolina</option>
                          <option value="Etanol">Etanol</option>
                          <option value="GNV">GNV</option>
                          <option value="Diesel">Diesel</option>
                        </select>
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Odômetro Atual (Painel do Carro)</label>
                        <input 
                          type="number" 
                          value={user?.vehicle_odometer ?? 0} 
                          onChange={(e) => setUser({ ...user, vehicle_odometer: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                        />
                        <p className="text-[10px] text-amber-500 dark:text-amber-400 mt-1 leading-tight">
                          <span className="font-bold">Nota:</span> Como você também usa o carro fora do trabalho, os KMs do "Encerrar Turno" não batem sozinhos. Sempre atualize este campo copiando o número que está no painel do carro para que a Manutenção avise na hora certa.
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Odômetro na Data de Compra</label>
                        <input 
                          type="number" 
                          value={user?.initial_odometer ?? 0} 
                          onChange={(e) => setUser({ ...user, initial_odometer: parseFloat(e.target.value) || 0 })}
                          placeholder="KM do veículo quando foi comprado"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                        />
                        <p className="text-[10px] text-slate-400">Usado como KM base para cálculo de depreciação e manutenções.</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Preço de Compra (R$)</label>
                        <input 
                          type="number" 
                          value={user?.purchase_price || ''} 
                          onChange={(e) => setUser({ ...user, purchase_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                          placeholder="Ex: 45000"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Data de Compra</label>
                        <input 
                          type="date" 
                          value={user?.purchase_date || ''} 
                          onChange={(e) => setUser({ ...user, purchase_date: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                        />
                      </div>
                    </div>
                    <div className="pt-4">
                      <button 
                        onClick={handleUpdateProfile}
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Salvar Configurações
                      </button>
                    </div>
                  </div>
                )}


                {settingsTab === 'categories' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                      <h3 className="font-bold text-slate-900 dark:text-white">Tipos de Manutenção</h3>
                      <div className="flex flex-wrap gap-2">
                        {serviceTypes.map(type => (
                          <div key={type.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                            {type.name}
                            {!type.is_default && (
                              <button onClick={() => handleDeleteServiceType(type.id)} className="text-rose-500 hover:text-rose-700">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const name = prompt('Novo Tipo de Manutenção:');
                            if (name) handleAddServiceType(name);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Novo
                        </button>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                      <h3 className="font-bold text-slate-900 dark:text-white">Tipos de Despesas Fixas</h3>
                      <div className="flex flex-wrap gap-2">
                        {fixedExpenseTypes.map(type => (
                          <div key={type.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                            {type.name}
                            {!type.is_default && (
                              <button onClick={() => handleDeleteFixedExpenseType(type.id)} className="text-rose-500 hover:text-rose-700">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const name = prompt('Novo Tipo de Despesa Fixa:');
                            if (name) handleAddFixedExpenseType(name);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Novo
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'notifications' && (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                    <h3 className="font-bold text-slate-900 dark:text-white">Preferências de Notificação</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">Notificações de Manutenção</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">Lembretes de troca de óleo e pneus</p>
                        </div>
                        <button 
                          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                          className={cn(
                            "w-10 h-5 rounded-full relative transition-all",
                            notificationsEnabled ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                            notificationsEnabled ? "right-1" : "left-1"
                          )}></div>
                        </button>
                      </div>
                      <div className="h-px bg-slate-50 dark:bg-slate-800"></div>
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">Alertas de Preço</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">Notificar quando o combustível baixar</p>
                        </div>
                        <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-not-allowed opacity-50">
                          <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'security' && (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                    <h3 className="font-bold text-slate-900 dark:text-white">Segurança</h3>
                    <div className="space-y-4">
                      <button onClick={() => setIsPasswordModalOpen(true)} className="w-full text-left px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-between">
                        <span className="text-sm font-medium dark:text-slate-300">Alterar Senha</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      </button>
                      <button className="w-full text-left px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-between">
                        <span className="text-sm font-medium dark:text-slate-300">Autenticação em Duas Etapas</span>
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded uppercase">Desativado</span>
                      </button>
                    </div>
                  </div>
                )}


                {settingsTab === 'subscription' && (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                        <Crown className={cn("w-6 h-6", user?.subscription_plan === 'pro' ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500")} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">
                          {user?.subscription_plan === 'pro' ? 'Plano VeiculoPro Ativo' : 'Plano Gratuito'}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {user?.subscription_plan === 'pro' ? 'Você tem acesso a todos os recursos premium' : 'Você está usando a versão básica'}
                        </p>
                      </div>
                    </div>
                    
                    {user?.subscription_plan !== 'pro' ? (
                      <div className="space-y-4">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                          <p className="text-xs text-emerald-800 dark:text-emerald-400 font-medium mb-3">Vantagens do Pro:</p>
                          <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-[10px] text-emerald-700 dark:text-emerald-500 font-bold uppercase tracking-wider">
                              <CheckCircle2 className="w-3 h-3" /> Exportação PDF Ilimitada
                            </li>
                            <li className="flex items-center gap-2 text-[10px] text-emerald-700 dark:text-emerald-500 font-bold uppercase tracking-wider">
                              <CheckCircle2 className="w-3 h-3" /> Backup Automático na Nuvem
                            </li>
                            <li className="flex items-center gap-2 text-[10px] text-emerald-700 dark:text-emerald-500 font-bold uppercase tracking-wider">
                              <CheckCircle2 className="w-3 h-3" /> Sem Anúncios
                            </li>
                          </ul>
                        </div>
                        <button 
                          onClick={() => setUser({ ...user, subscription_plan: 'pro' })}
                          className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all"
                        >
                          Assinar Agora (R$ 19,90/mês)
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Sua assinatura está ativa e será renovada automaticamente.</p>
                          <button 
                            onClick={() => setUser({ ...user, subscription_plan: 'free' })}
                            className="mt-3 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                          >
                            Cancelar Assinatura
                          </button>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Ferramentas Premium</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button 
                              onClick={handleExportPDF}
                              className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group"
                            >
                              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                <Download className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Exportar Relatório</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">PDF e Excel completo</p>
                              </div>
                            </button>

                            <button 
                              onClick={handleAIConsultancy}
                              className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group"
                            >
                              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Consultoria IA</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">Análise de ganhos e gastos</p>
                              </div>
                            </button>

                            <button 
                              onClick={handleExportRawData}
                              className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group"
                            >
                              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                                <Database className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Dados Brutos</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">CSV ou JSON</p>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}



                <div className="flex gap-4">
                  <button 
                    onClick={handleUpdateProfile}
                    className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all"
                  >
                    Salvar Alterações
                  </button>
                  <button className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-50">
      {/* Sidebar Backdrop (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-300 lg:relative lg:translate-x-0",
        !isSidebarOpen && "-translate-x-full",
        isSidebarCollapsed ? "w-20" : "w-72"
      )}>
        <div className="h-full flex flex-col p-4">
          <div className={cn("flex items-center gap-3 mb-10 px-2", isSidebarCollapsed ? "justify-center" : "")}>
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 shrink-0">
              <Car className="text-white w-6 h-6" />
            </div>
            {!isSidebarCollapsed && (
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Veiculo<span className="text-emerald-600">Pro</span></h1>
            )}
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              collapsed={isSidebarCollapsed}
              active={activeTab === 'dashboard'} 
              onClick={() => handleTabChange('dashboard')} 
            />
            <SidebarItem 
              icon={History} 
              label="Diário de Bordo" 
              collapsed={isSidebarCollapsed}
              active={activeTab === 'history_turnos'} 
              onClick={() => handleTabChange('history_turnos')} 
            />
            <SidebarItem 
              icon={Fuel} 
              label="Abastecimentos" 
              collapsed={isSidebarCollapsed}
              active={activeTab === 'history_abastecimentos'} 
              onClick={() => handleTabChange('history_abastecimentos')} 
            />
            <SidebarItem 
              icon={Wrench} 
              label="Manutenção" 
              collapsed={isSidebarCollapsed}
              active={activeTab === 'history_manutencao'} 
              onClick={() => handleTabChange('history_manutencao')} 
            />
            <SidebarItem 
              icon={Receipt} 
              label="Despesas Fixas" 
              collapsed={isSidebarCollapsed}
              active={activeTab === 'history_despesas'} 
              onClick={() => handleTabChange('history_despesas')} 
            />
            <SidebarItem 
              icon={Settings} 
              label="Configurações" 
              collapsed={isSidebarCollapsed}
              active={activeTab === 'configuracoes'} 
              onClick={() => handleTabChange('configuracoes')} 
            />
          </nav>

          {/* Pro Upgrade Card */}
          <div className="mt-auto pt-6">
            {!isSidebarCollapsed ? (
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 rounded-2xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Crown className="w-16 h-16" />
                </div>
                <h4 className="font-bold text-sm mb-1">{isPro ? 'VeiculoPro Ativo' : 'Seja VeiculoPro'}</h4>
                <p className="text-xs text-emerald-100 mb-4">
                  {isPro ? 'Você tem acesso a todas as ferramentas premium.' : 'Exportações ilimitadas, backup na nuvem e sem anúncios.'}
                </p>
                {!isPro && (
                  <button 
                    onClick={() => {
                      setActiveTab('configuracoes');
                      setSettingsTab('subscription');
                    }}
                    className="w-full bg-white text-emerald-700 text-xs font-bold py-2 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    Ver Planos
                  </button>
                )}
              </div>
            ) : (
              <button className="w-full flex items-center justify-center p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
                <Crown className="w-5 h-5" />
              </button>
            )}
            
            <button 
              onClick={handleLogout}
              className={cn("w-full flex items-center gap-3 px-4 py-3 mt-6 text-slate-400 hover:text-rose-600 transition-colors", isSidebarCollapsed ? "justify-center" : "")}
            >
              <LogOut className="w-5 h-5" />
              {!isSidebarCollapsed && <span className="font-medium">Sair</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                {activeTab === 'dashboard' ? 'Visão Geral' : 
                 activeTab === 'history_turnos' ? 'Histórico de Turnos' :
                 activeTab === 'history_abastecimentos' ? 'Histórico de Abastecimentos' :
                 activeTab === 'history_manutencao' ? 'Histórico de Manutenção' :
                 activeTab === 'history_despesas' ? 'Histórico de Despesas' :
                 activeTab}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Bem-vindo de volta, {user?.name}!</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.vehicle_model || 'Sem Veículo'}</p>
                <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider">{user?.vehicle_plate || '---'}</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <Car className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-32 lg:pb-8">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Toast Notifications */}
        <AnimatePresence>
          {toast && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => setToast(null)} 
            />
          )}
        </AnimatePresence>

        {/* Global Loading Overlay */}
        <AnimatePresence>
          {loading && <LoadingOverlay />}
        </AnimatePresence>

        {/* Quick Add Menu */}
        <AnimatePresence>
          {isQuickAddOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsQuickAddOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed right-6 bottom-24 z-50 flex flex-col items-end gap-3"
              >
                {[
                  { id: 'turnos', label: 'Novo Turno', icon: History, color: 'bg-emerald-500' },
                  { id: 'abastecimentos', label: 'Novo Abastecimento', icon: Fuel, color: 'bg-blue-500' },
                  { id: 'manutencao', label: 'Nova Manutenção', icon: Wrench, color: 'bg-orange-500' },
                  { id: 'despesas', label: 'Nova Despesa Fixa', icon: Receipt, color: 'bg-rose-500' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsQuickAddOpen(false);
                    }}
                    className="flex items-center gap-3 group"
                  >
                    <span className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.label}
                    </span>
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl transition-transform hover:scale-110 active:scale-95", item.color)}>
                      <item.icon className="w-5 h-5" />
                    </div>
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Confirm Modal */}
        <AnimatePresence>
          {confirmModal && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-[70] p-6 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex flex-col items-center text-center mb-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                    confirmModal.variant === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                    confirmModal.variant === 'info' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                  }`}>
                    {confirmModal.variant === 'warning' ? <AlertTriangle size={24} /> :
                     confirmModal.variant === 'info' ? <Info size={24} /> :
                     <Trash2 size={24} />}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {confirmModal.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {confirmModal.message}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    disabled={confirmModal.isLoading}
                    onClick={() => {
                      if (confirmModal.onCancel) confirmModal.onCancel();
                      setConfirmModal(null);
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {confirmModal.cancelLabel || 'Cancelar'}
                  </button>
                  <button
                    disabled={confirmModal.isLoading}
                    onClick={confirmModal.onConfirm}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 ${
                      confirmModal.variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600' :
                      confirmModal.variant === 'info' ? 'bg-blue-600 hover:bg-blue-700' :
                      'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {confirmModal.isLoading && <Loader2 size={16} className="animate-spin" />}
                    {confirmModal.confirmLabel || 'Confirmar'}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Change Password Modal */}
        <AnimatePresence>
          {isPasswordModalOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPasswordModalOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl z-50 overflow-hidden border border-slate-100 dark:border-slate-800"
              >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    Alterar Senha
                  </h3>
                  <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Senha Atual</label>
                    <input 
                      type="password" 
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Nova Senha</label>
                    <input 
                      type="password" 
                      required
                      minLength={8}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Confirmar Nova Senha</label>
                    <input 
                      type="password" 
                      required
                      minLength={8}
                      value={passwordForm.confirmNewPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white" 
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setIsPasswordModalOpen(false)}
                      className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-colors disabled:opacity-70 flex justify-center items-center"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div> : 'Salvar Senha'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Export Modal */}
        <AnimatePresence>
          {isExportModalOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsExportModalOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-50 p-6 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-600" />
                    Exportar Dados
                  </h3>
                  <button onClick={() => setIsExportModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => processExport('csv')}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group text-left"
                  >
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Planilha CSV</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Ideal para Excel e Google Sheets</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => processExport('json')}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all group text-left"
                  >
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Backup JSON</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Cópia completa de segurança</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* AI Analysis Modal */}
        <AnimatePresence>
          {isAIModalOpen && aiAnalysisResult && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAIModalOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-50 p-6 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-white dark:bg-slate-900 pb-2 z-10">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                      Consultoria IA
                    </h3>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                      aiAnalysisResult.status_financeiro === 'excelente' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      aiAnalysisResult.status_financeiro === 'bom' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      aiAnalysisResult.status_financeiro === 'atencao' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    )}>
                      Status: {aiAnalysisResult.status_financeiro}
                    </span>
                  </div>
                  <button onClick={() => setIsAIModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Grid de Métricas Principais */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Ganho Bruto (30d)</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">R$ {aiAnalysisResult.ganho_bruto_30d.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Lucro Líquido</p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">R$ {aiAnalysisResult.lucro_liquido_30d.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Margem</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{aiAnalysisResult.margem_lucro_percentual.toFixed(1)}%</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">R$ / KM</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">R$ {aiAnalysisResult.media_por_km.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">R$ / Hora</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">R$ {aiAnalysisResult.media_por_hora.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Variação (vs mês ant.)</p>
                      <div className="flex items-center gap-1">
                        <span className={cn(
                          "text-lg font-bold",
                          aiAnalysisResult.variacao_percentual > 0 ? "text-emerald-600 dark:text-emerald-400" : 
                          aiAnalysisResult.variacao_percentual < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-600 dark:text-slate-400"
                        )}>
                          {aiAnalysisResult.variacao_percentual > 0 ? '+' : ''}{aiAnalysisResult.variacao_percentual.toFixed(1)}%
                        </span>
                        {aiAnalysisResult.variacao_percentual > 0 && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                        {aiAnalysisResult.variacao_percentual < 0 && <TrendingUp className="w-4 h-4 text-rose-500 rotate-180" />}
                      </div>
                    </div>
                  </div>

                  {/* Melhor Plataforma */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2 mb-1">
                        <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        Sua Melhor Plataforma
                      </h4>
                      <p className="text-2xl font-black text-purple-700 dark:text-purple-400">{aiAnalysisResult.melhor_plataforma.nome}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">R$ {aiAnalysisResult.melhor_plataforma.media_por_km.toFixed(2)} / km</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{aiAnalysisResult.melhor_plataforma.percentual_do_total.toFixed(1)}% dos ganhos</p>
                    </div>
                  </div>

                  {/* Insights Personalizados */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Insights Personalizados</h4>
                    <div className="space-y-2">
                      {aiAnalysisResult.insights.map((insight: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                          <div className="shrink-0 mt-0.5">
                            {insight.type === 'crescimento' && <TrendingUp className="w-5 h-5 text-emerald-500" />}
                            {insight.type === 'atencao' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                            {insight.type === 'dica' && <Zap className="w-5 h-5 text-blue-500" />}
                            {insight.type === 'conquista' && <Crown className="w-5 h-5 text-purple-500" />}
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{insight.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Melhores Horários e Dias */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Melhor Dia
                      </h4>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][aiAnalysisResult.melhor_dia_semana.dia] || 'N/A'}
                        </span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">R$ {aiAnalysisResult.melhor_dia_semana.media_ganho.toFixed(2)} / turno</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Melhor Horário
                      </h4>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{aiAnalysisResult.melhor_horario.hora_inicio}</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">R$ {aiAnalysisResult.melhor_horario.media_por_hora.toFixed(2)} / hora</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsAIModalOpen(false)}
                    className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 dark:shadow-none hover:bg-purple-700 transition-all"
                  >
                    Entendi
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Floating Action Button (Mobile & Desktop) */}
        <button 
          onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
          className="fixed right-6 bottom-8 z-50 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl shadow-emerald-300 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <Plus className={cn("w-6 h-6 transition-transform duration-300", isQuickAddOpen && "rotate-45")} />
        </button>
      </main>
    </div>
  );
}
