import React, { Suspense, lazy, useMemo } from 'react';
import { useApp } from './context/AppContext';
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
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { api } from './services/api';
import { cn, parseLocalDate, groupShiftsByDate } from './components/utils';
import { StatCard } from './components/StatCard';
import { SidebarItem } from './components/SidebarItem';
import { DateFilter } from './components/DateFilter';
import { Pagination } from './components/Pagination';
import { Skeleton, TableSkeleton, ChartSkeleton, type SkeletonProps } from './components/Skeleton';
import { Eye, EyeOff } from 'lucide-react';
import { HistoryPage } from './components/HistoryPage';
import { PeriodSelector } from './components/PeriodSelector';
import { DashboardPage } from './components/DashboardPage';
import { TurnosPage } from './components/TurnosPage';
import { AbastecimentosPage } from './components/AbastecimentosPage';
import { ManutencaoPage } from './components/ManutencaoPage';
import { DespesasPage } from './components/DespesasPage';
import { RelatoriosPage } from './components/RelatoriosPage';
import { ConfiguracoesPage } from './components/ConfiguracoesPage';
import { FormError } from './components/FormError';

const ComparisonBarChart = lazy(() => import('./components/Charts').then(m => ({ default: m.ComparisonBarChart })));
const DistributionPieChart = lazy(() => import('./components/Charts').then(m => ({ default: m.DistributionPieChart })));
const MaintenanceBarChart = lazy(() => import('./components/Charts').then(m => ({ default: m.MaintenanceBarChart })));

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

// Shared logic and types are now in src/components/

// Components
// Component definitions moved to src/components/

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

// SidebarItem moved to src/components/SidebarItem.tsx

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


// DateFilter moved to src/components/DateFilter.tsx

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
  // ─────────────────────────────────────────────────────────────
  // All state & effects now live in AppContext + custom hooks.
  // App() is a pure rendering orchestrator.
  // ─────────────────────────────────────────────────────────────
  const {
    isAuthenticated, handleLogin, handleRegister, handleGoogleLogin, handleLogout,
    authMode, setAuthMode, authForm, setAuthForm, showPassword, setShowPassword,
    activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen,
    isSidebarCollapsed, setIsSidebarCollapsed, isMounted,
    isBottomNavVisible, isQuickAddOpen, setIsQuickAddOpen,
    filterStartDate, setFilterStartDate, filterEndDate, setFilterEndDate,
    user, setUser, shifts, fuelLogs, maintenanceLogs, serviceTypes,
    fixedExpenses, fixedExpenseTypes, stats, loading, setLoading, fetchData,
    shiftsPage, setShiftsPage, shiftsCount, historyShifts,
    fuelPage, setFuelPage, fuelCount, historyFuel,
    maintenancePage, setMaintenancePage, maintenanceCount, historyMaintenance,
    expensesPage, setExpensesPage, expensesCount, historyExpenses,
    fetchingHistory, ITEMS_PER_PAGE,
    dashboardPeriod, setDashboardPeriod, dashboardStats,
    periodGanhos, setPeriodGanhos, statsGanhos,
    periodLucro, setPeriodLucro, statsLucro,
    periodTotalKm, setPeriodTotalKm, statsTotalKm,
    periodRentabilidade, setPeriodRentabilidade, statsRentabilidade,
    periodRHoraLivre, setPeriodRHoraLivre, statsRHoraLivre,
    periodVelMedia, setPeriodVelMedia, statsVelMedia,
    periodMediaLivre, setPeriodMediaLivre, statsMediaLivre,
    periodCustoComb, setPeriodCustoComb, statsCustoComb,
    latestDayEarnings, smartInsight, monthlyChartData, platformData,
    toast, showToast, clearToast,
    confirmModal, confirmAction, dismissConfirm,
    formErrors, setFormErrors,
    editingShift, setEditingShift, editingMaintenance, setEditingMaintenance,
    editingFuel, setEditingFuel, editingFixedExpense, setEditingFixedExpense,
    selectedServiceItems, setSelectedServiceItems, serviceSearch, setServiceSearch,
    totalKm, setTotalKm, shiftPlatforms, setShiftPlatforms,
    fuelPrice, setFuelPrice, fuelLiters, setFuelLiters, fuelTotal,
    darkMode, setDarkMode, notificationsEnabled, setNotificationsEnabled,
    isPasswordModalOpen, setIsPasswordModalOpen, passwordForm, setPasswordForm,
    settingsTab, setSettingsTab, isExportModalOpen, setIsExportModalOpen,
    isAIModalOpen, setIsAIModalOpen, aiAnalysisResult, setAiAnalysisResult,
    isHealthCollapsed, setIsHealthCollapsed, showInsight, setShowInsight,
    isServiceModalOpen, setIsServiceModalOpen, isPro,
    handleDeleteShiftGroup, handleDeleteFuel, handleDeleteMaintenance, handleDeleteFixedExpense,
    handleAddServiceType, handleDeleteServiceType, handleAddFixedExpenseType, handleDeleteFixedExpenseType,
  } = useApp();

  // Backward-compat alias (alguns lugares no JSX chamam setToast(null))
  const setToast = (v: any) => { if (!v) clearToast(); };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    setFilterStartDate('');
    setFilterEndDate('');
    setEditingMaintenance(null);
    setSelectedServiceItems([]);
    setServiceSearch('');
  };

  const handleSaveShift = async (e: any) => {
    e.preventDefault(); setFormErrors({});
    const data = Object.fromEntries(new FormData(e.target).entries());
    setLoading(true);
    try {
      const activePlatforms = shiftPlatforms.filter(p => parseFloat(p.earnings.replace(',', '.')) > 0);
      const kmValue = parseFloat(totalKm.replace(',', '.'));
      const errors: any = {};
      if (isNaN(kmValue) || kmValue <= 0) errors.totalKm = 'O KM total do turno deve ser um número positivo.';
      if (!activePlatforms.length) errors.platforms = 'Informe os ganhos em pelo menos uma plataforma.';
      if (Object.keys(errors).length) { setFormErrors(errors); return; }
      if (editingShift) await api.shifts.deleteGroup(editingShift.date, editingShift.shift_type);
      await Promise.all(activePlatforms.map((p, i) => api.shifts.create({
        date: data.date, shift_type: data.shift_type, platform: p.name, km: i === 0 ? kmValue : 0,
        start_time: data.start_time, end_time: data.end_time,
        earnings: parseFloat(p.earnings.replace(',', '.')), tips: parseFloat(p.tips?.replace(',', '.') || '0'),
        rides_count: parseInt(p.rides_count || '0'), vehicle_name: data.vehicle_name as string, driver_name: data.driver_name as string
      })));
      if (!editingShift && user) await api.auth.updateProfile({ ...user, vehicle_odometer: (user.vehicle_odometer || 0) + kmValue });
      setTotalKm(''); setShiftPlatforms([{ name: 'Uber', earnings: '', tips: '', rides_count: '' }, { name: '99Pop', earnings: '', tips: '', rides_count: '' }, { name: 'InDriver', earnings: '', tips: '', rides_count: '' }, { name: 'Particular', earnings: '', tips: '', rides_count: '' }]); setEditingShift(null);
      showToast(editingShift ? 'Turno atualizado!' : 'Turno salvo!'); fetchData(); setActiveTab('dashboard');
    } catch (error: any) {
      if (error.status === 422 && error.details) { const fe: any = {}; error.details.forEach((d: any) => { fe[d.field] = d.message; }); setFormErrors(fe); showToast('Verifique os campos destacados', 'error'); }
      else showToast(error.message, 'error');
    } finally { setLoading(false); }
  };

  const handleSaveFuel = async (e: any) => {
    e.preventDefault(); setFormErrors({});
    const data = Object.fromEntries(new FormData(e.target).entries());
    setLoading(true);
    try {
      const errors: any = {};
      const odometer = parseFloat(data.odometer as string), price = parseFloat(fuelPrice), liters = parseFloat(fuelLiters);
      if (isNaN(odometer) || odometer <= 0) errors.odometer = 'Informe o odômetro.';
      if (isNaN(price) || price <= 0) errors.fuelPrice = 'Informe o preço por litro.';
      if (isNaN(liters) || liters <= 0) errors.fuelLiters = 'Informe a quantidade de litros.';
      if (Object.keys(errors).length) { setFormErrors(errors); return; }
      const payload = { date: data.date, odometer, fuel_type: data.fuel_type, price_per_liter: price, liters, total_value: parseFloat(fuelTotal), vehicle_name: data.vehicle_name as string, driver_name: data.driver_name as string, is_full_tank: data.is_full_tank === 'on' ? 1 : 0 };
      if (editingFuel) { await api.fuel.update(editingFuel.id, payload); setEditingFuel(null); } else { await api.fuel.create(payload); }
      if (user && odometer > (user.vehicle_odometer || 0)) await api.auth.updateProfile({ ...user, vehicle_odometer: odometer });
      showToast(editingFuel ? 'Abastecimento atualizado!' : 'Abastecimento registrado!'); fetchData(); setActiveTab('dashboard');
    } catch (error: any) {
      if (error.status === 422 && error.details) { const fe: any = {}; error.details.forEach((d: any) => { fe[d.field] = d.message; }); setFormErrors(fe); showToast('Verifique os campos destacados', 'error'); }
      else showToast(error.message, 'error');
    } finally { setLoading(false); }
  };


  const handleSaveMaintenance = async (e: any) => {
    e.preventDefault(); setFormErrors({});
    const data = Object.fromEntries(new FormData(e.target).entries());
    setLoading(true);
    try {
      const errors: any = {}, odometer = parseFloat(data.odometer as string);
      const isMulti = selectedServiceItems.length > 0;
      const svcType = isMulti ? selectedServiceItems.map(s => s.name).join(', ') : (data.service_type as string);
      const cost = isMulti ? selectedServiceItems.reduce((a, c) => a + parseFloat(c.cost || '0'), 0) : parseFloat(data.cost as string);
      if (isNaN(odometer) || odometer <= 0) errors.odometer = 'Informe o odômetro.';
      if (isNaN(cost) || cost < 0) errors.cost = 'Informe o custo.';
      if (!svcType) errors.service_type = 'Selecione um serviço.';
      if (Object.keys(errors).length) { setFormErrors(errors); setLoading(false); return; }
      const payload = { date: data.date, odometer, service_type: svcType, category: data.category as string, description: data.description as string, cost, attachment_url: editingMaintenance?.attachment_url || '', vehicle_name: data.vehicle_name as string, driver_name: data.driver_name as string };
      if (editingMaintenance?.id) { await api.maintenance.update(editingMaintenance.id, payload); setEditingMaintenance(null); } else { await api.maintenance.create(payload); }
      setSelectedServiceItems([]);
      if (user && odometer > (user.vehicle_odometer || 0)) await api.auth.updateProfile({ ...user, vehicle_odometer: odometer });
      showToast(editingMaintenance ? 'Manutenção atualizada!' : 'Manutenção registrada!'); fetchData(); setActiveTab('dashboard');
    } catch (error: any) {
      if (error.status === 422 && error.details) { const fe: any = {}; error.details.forEach((d: any) => { fe[d.field] = d.message; }); setFormErrors(fe); showToast('Verifique os campos destacados', 'error'); }
      else showToast(error.message, 'error');
    } finally { setLoading(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) { showToast('As senhas não coincidem', 'error'); return; }
    if (passwordForm.newPassword.length < 8) { showToast('Senha mínima: 8 caracteres', 'error'); return; }
    setLoading(true);
    try { await api.auth.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }); showToast('Senha alterada!', 'success'); setIsPasswordModalOpen(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); }
    catch (error: any) { showToast(error.message, 'error'); } finally { setLoading(false); }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { monthly_goal, ...userPayload } = user || {};
      if (monthly_goal != null) localStorage.setItem('@VeiculoPro:monthly_goal', monthly_goal.toString()); else localStorage.removeItem('@VeiculoPro:monthly_goal');
      await api.auth.updateProfile({ ...userPayload, dark_mode: darkMode ? 1 : 0, notifications_enabled: notificationsEnabled ? 1 : 0 });
      showToast('Configurações atualizadas!');
    } catch (error: any) {
      if (error.status === 422 && error.details?.length) showToast(`Campo inválido: ${error.details[0].field} — ${error.details[0].message}`, 'error');
      else showToast(error.message, 'error');
    } finally { setLoading(false); }
  };

  const handleSyncGooglePhoto = async () => {
    if (user?.photo_url) { try { await api.auth.updateProfile({ ...user, photo_url: user.photo_url }); await fetchData(); showToast('Foto sincronizada!'); } catch (error: any) { showToast('Erro: ' + error.message, 'error'); } }
    else showToast('Nenhuma foto Google encontrada.', 'error');
  };

  const handleSaveFixedExpense = async (e: any) => {
    e.preventDefault(); setFormErrors({});
    const data = Object.fromEntries(new FormData(e.target).entries());
    setLoading(true);
    try {
      const errors: any = {}, value = parseFloat(data.value as string);
      if (isNaN(value) || value <= 0) errors.value = 'Informe o valor.';
      if (!data.expense_type) errors.expense_type = 'Selecione o tipo.';
      if (Object.keys(errors).length) { setFormErrors(errors); return; }
      const payload = { date: data.date as string, expense_type: data.expense_type as string, category: (data.category as string) || 'Outros', value, description: data.description as string, vehicle_name: data.vehicle_name as string, driver_name: data.driver_name as string };
      if (editingFixedExpense) { await api.fixedExpenses.update(editingFixedExpense.id, payload); setEditingFixedExpense(null); } else { await api.fixedExpenses.create(payload); }
      showToast(editingFixedExpense ? 'Despesa atualizada!' : 'Despesa registrada!'); fetchData(); setActiveTab('dashboard');
    } catch (error: any) {
      if (error.status === 422 && error.details) { const fe: any = {}; error.details.forEach((d: any) => { fe[d.field] = d.message; }); setFormErrors(fe); showToast('Verifique os campos', 'error'); }
      else showToast(error.message, 'error');
    } finally { setLoading(false); }
  };

  // ── Report / Export filter state ──────────────────────────────────────────
  const [reportPeriod, setReportPeriod] = React.useState('mes_atual');
  const [reportPlatform, setReportPlatform] = React.useState('');
  const [reportVehicle, setReportVehicle] = React.useState('');
  const [reportDriver, setReportDriver] = React.useState('');
  const [reportFuelType, setReportFuelType] = React.useState('');
  const [reportVehicleType, setReportVehicleType] = React.useState('');
  const [reportCategory, setReportCategory] = React.useState('');

  // ── Confirm modal alias (backward compat — JSX may call setConfirmModal(null)) ──
  const setConfirmModal = (_: any) => dismissConfirm();

  // ── Fuel Efficiency Data (useMemo — was a useMemo in the original App.tsx) ──
  const fuelEfficiencyData = useMemo(() => {
    if (!fuelLogs || fuelLogs.length < 2) return [];
    const sorted = [...fuelLogs].sort((a, b) => (a.date as string) > (b.date as string) ? 1 : -1);
    const result = [];
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1], curr = sorted[i];
      if (prev.odometer && curr.odometer && curr.liters) {
        const km = curr.odometer - prev.odometer;
        if (km > 0 && km < 2000) result.push({ date: curr.date, efficiency: km / curr.liters, km });
      }
    }
    return result;
  }, [fuelLogs]);

  // ── Vehicle Depreciation (useMemo) ────────────────────────────────────────
  const vehicleDepreciation = useMemo(() => {
    if (!user?.vehicle_purchase_price || !user?.vehicle_year) return null;
    const age = new Date().getFullYear() - parseInt(user.vehicle_year);
    const depRate = 0.15;
    const currentValue = user.vehicle_purchase_price * Math.pow(1 - depRate, age);
    const annualDep = user.vehicle_purchase_price * depRate * Math.pow(1 - depRate, Math.max(0, age - 1));
    const monthlyDep = annualDep / 12;
    return { currentValue: Math.max(currentValue, user.vehicle_purchase_price * 0.1), annualDep, monthlyDep, totalDep: user.vehicle_purchase_price - Math.max(currentValue, user.vehicle_purchase_price * 0.1) };
  }, [user]);

  // ── Maintenance Alerts (useMemo) ──────────────────────────────────────────
  const maintenanceAlerts = useMemo(() => {
    if (!maintenanceLogs?.length) return [];
    const alerts: any[] = [];
    const oilChanges = maintenanceLogs.filter(m => m.service_type?.toLowerCase().includes('óleo') || m.service_type?.toLowerCase().includes('oil'));
    if (oilChanges.length) {
      const last = oilChanges.reduce((a, b) => (a.date > b.date ? a : b));
      const lastOdo = last.odometer || 0;
      const currentOdo = user?.vehicle_odometer || 0;
      if (currentOdo - lastOdo > 4500) alerts.push({ type: 'oil', message: 'Troca de óleo em breve', km: currentOdo - lastOdo });
    }
    return alerts;
  }, [maintenanceLogs, user]);

  // ── handleExportPDF ───────────────────────────────────────────────────────
  const handleExportPDF = async (
    exportType: 'summary' | 'full' | 'shifts_only' | 'maintenance_only' | 'fuel_only' | 'expenses_only' = 'full',
    customData?: any
  ) => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor = { r: 16, g: 185, b: 129 };
    const dataToUse = {
      shifts: customData?.shifts ?? shifts,
      fuel: customData?.fuel ?? fuelLogs,
      maintenance: customData?.maintenance ?? maintenanceLogs,
      fixedExpenses: customData?.fixedExpenses ?? fixedExpenses,
      earnings: customData?.earnings ?? stats?.totalEarnings ?? 0,
      expenses: customData?.expenses ?? stats?.totalExpenses ?? 0,
      km: customData?.km ?? stats?.totalKm ?? 0,
      title: customData?.title || 'Relatório VeiculoPro',
      vehicleName: customData?.vehicleName || user?.vehicle_model || 'Veículo',
      driverName: customData?.driverName || user?.name || 'Motorista',
      startDate: customData?.startDate || filterStartDate || '',
      endDate: customData?.endDate || filterEndDate || '',
    };
    const profit = dataToUse.earnings - dataToUse.expenses;
    const rentability = dataToUse.km > 0 ? (dataToUse.earnings / dataToUse.km) : 0;
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24); doc.setFont('helvetica', 'bold');
    doc.text('VeiculoPro', 15, 20);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(dataToUse.title, 15, 30);
    doc.text(`Gerado: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 15, 30, { align: 'right' });
    let y = 50;
    const addSection = (title: string, head: string[][], body: any[][]) => {
      if (!body.length) return;
      if (y > 230) { doc.addPage(); y = 20; }
      doc.setFontSize(14); doc.setTextColor(15, 23, 42); doc.setFont('helvetica', 'bold');
      doc.text(title, 15, y); y += 8;
      (autoTable as any)(doc, { head, body, startY: y, theme: 'grid', headStyles: { fillColor: [primaryColor.r, primaryColor.g, primaryColor.b], textColor: 255 }, margin: { left: 15, right: 15 } });
      y = (doc as any).lastAutoTable.finalY + 10;
    };
    if (exportType === 'full' || exportType === 'summary') {
      doc.setFontSize(12); doc.setTextColor(15, 23, 42); doc.setFont('helvetica', 'bold');
      doc.text('Resumo Financeiro', 15, y); y += 8;
      const summaryData = [['Ganhos', `R$ ${dataToUse.earnings.toFixed(2)}`], ['Despesas', `R$ ${dataToUse.expenses.toFixed(2)}`], ['Lucro', `R$ ${profit.toFixed(2)}`], ['KM', `${dataToUse.km.toFixed(0)} km`], ['R$/km', `R$ ${rentability.toFixed(2)}`]];
      (autoTable as any)(doc, { body: summaryData, startY: y, theme: 'plain', margin: { left: 15, right: 15 } });
      y = (doc as any).lastAutoTable.finalY + 10;
    }
    if (exportType !== 'summary') {
      if (exportType === 'full' || exportType === 'shifts_only') addSection('Turnos', [['Data', 'Turno', 'Plataforma', 'Ganhos', 'KM']], dataToUse.shifts.map((s: any) => [s.date, s.shift_type, s.platform, `R$ ${(s.earnings || 0).toFixed(2)}`, s.km || 0]));
      if (exportType === 'full' || exportType === 'fuel_only') addSection('Abastecimentos', [['Data', 'Litros', 'Preço/L', 'Total']], dataToUse.fuel.map((f: any) => [f.date, `${f.liters}L`, `R$ ${f.price_per_liter}`, `R$ ${f.total_value}`]));
      if (exportType === 'full' || exportType === 'maintenance_only') addSection('Manutenções', [['Data', 'Serviço', 'Custo']], dataToUse.maintenance.map((m: any) => [m.date, m.service_type, `R$ ${m.cost}`]));
      if (exportType === 'full' || exportType === 'expenses_only') addSection('Despesas Fixas', [['Data', 'Tipo', 'Valor']], dataToUse.fixedExpenses.map((e: any) => [e.date, e.expense_type, `R$ ${e.value}`]));
    }
    doc.save(`veiculopro_${exportType}_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('PDF exportado com sucesso!');
  };

  // ── handleAIConsultancy ───────────────────────────────────────────────────
  const handleAIConsultancy = async () => {
    setLoading(true);
    try {
      const analysis = await api.ai.getAnalysis();
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAiAnalysisResult(analysis);
      setIsAIModalOpen(true);
    } catch (error: any) { showToast('Erro ao gerar consultoria: ' + error.message, 'error'); }
    finally { setLoading(false); }
  };

  // ── handleExportRawData ───────────────────────────────────────────────────
  const handleExportRawData = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      const csvContent = [
        ['Data', 'Tipo', 'Plataforma', 'Ganhos', 'KM', 'Turno'].join(','),
        ...shifts.map(s => [s.date, 'turno', s.platform, s.earnings, s.km, s.shift_type].join(','))
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `veiculopro_turnos_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      showToast('Exportação CSV concluída!');
    } else {
      const data = { user, shifts, fuelLogs, maintenanceLogs, fixedExpenses, exportedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `veiculopro_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      showToast('Backup JSON realizado!');
    }
    setIsExportModalOpen(false);
  };

  // ── processExport (alias para handleExportRawData) ────────────────────────
  const processExport = handleExportRawData;


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
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Senha</label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
                    placeholder="••••••••"
                    required
                  />
                  <ShieldCheck className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
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
        return <DashboardPage />;
      case 'history_turnos':
      case 'history_abastecimentos':
      case 'history_manutencao':
      case 'history_despesas':
        return <HistoryPage />;
      case 'turnos':
        return <TurnosPage />;
      case 'abastecimentos':
        return <AbastecimentosPage />;
      case 'manutencao':
        return <ManutencaoPage />;
      case 'despesas':
        return <DespesasPage />;
      case 'relatorios':
        return <RelatoriosPage />;
      case 'configuracoes':
        return <ConfiguracoesPage />;
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
          <div className="mt-auto pt-6 hidden sm:block">
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

        {/* Quick Add Menu */}
        <AnimatePresence>
          {isQuickAddOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsQuickAddOpen(false)}
                className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="fixed right-6 bottom-24 z-50 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-2 min-w-[200px]"
              >
                <h4 className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acesso Rápido</h4>
                <button 
                  onClick={() => handleTabChange('turnos')}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-700 dark:text-slate-300 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold">Encerrar Turno</span>
                </button>
                <button 
                  onClick={() => handleTabChange('abastecimentos')}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-amber-50 dark:hover:bg-amber-500/10 text-slate-700 dark:text-slate-300 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-600">
                    <Fuel className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold">Abastecimento</span>
                </button>
                <button 
                  onClick={() => handleTabChange('manutencao')}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-300 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-600">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold">Manutenção</span>
                </button>
                <button 
                  onClick={() => handleTabChange('despesas')}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-700 dark:text-slate-300 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-rose-100 dark:bg-rose-500/20 rounded-lg flex items-center justify-center text-rose-600">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold">Despesa Fixa</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Floating Action Button */}
        <button 
          onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
          className="fixed right-6 bottom-8 z-50 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <Plus className={cn("w-6 h-6 transition-transform duration-300", isQuickAddOpen && "rotate-45")} />
        </button>
      </main>
    </div>
  );
}
