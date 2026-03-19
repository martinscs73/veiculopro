/**
 * AppContext — React Context
 * 
 * Provides all global application state to the component tree without prop drilling.
 * Consumers use the useApp() hook to access state and actions.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAppData } from '../hooks/useAppData';
import { useStats } from '../hooks/useStats';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import { api } from '../services/api';

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  handleRegister: (e: React.FormEvent) => Promise<void>;
  handleGoogleLogin: () => Promise<void>;
  handleLogout: () => void;
  authMode: 'login' | 'register';
  setAuthMode: (m: 'login' | 'register') => void;
  authForm: { email: string; password: string; name: string };
  setAuthForm: (f: any) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean) => void;
  isMounted: boolean;
  isBottomNavVisible: boolean;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (v: boolean) => void;
  filterStartDate: string;
  setFilterStartDate: (v: string) => void;
  filterEndDate: string;
  setFilterEndDate: (v: string) => void;

  // Data (from useAppData)
  user: any;
  setUser: (u: any) => void;
  shifts: any[];
  fuelLogs: any[];
  maintenanceLogs: any[];
  serviceTypes: any[];
  fixedExpenses: any[];
  fixedExpenseTypes: any[];
  stats: any;
  loading: boolean;
  setLoading: (v: boolean) => void;
  fetchData: () => Promise<void>;
  shiftsPage: number;
  setShiftsPage: (n: number) => void;
  shiftsCount: number;
  historyShifts: any[];
  fuelPage: number;
  setFuelPage: (n: number) => void;
  fuelCount: number;
  historyFuel: any[];
  maintenancePage: number;
  setMaintenancePage: (n: number) => void;
  maintenanceCount: number;
  historyMaintenance: any[];
  expensesPage: number;
  setExpensesPage: (n: number) => void;
  expensesCount: number;
  historyExpenses: any[];
  fetchingHistory: boolean;
  ITEMS_PER_PAGE: number;

  // Stats (from useStats)
  dashboardPeriod: string;
  setDashboardPeriod: (v: string) => void;
  dashboardStats: any;
  periodGanhos: string; setPeriodGanhos: (v: string) => void;
  periodLucro: string; setPeriodLucro: (v: string) => void;
  periodTotalKm: string; setPeriodTotalKm: (v: string) => void;
  periodRentabilidade: string; setPeriodRentabilidade: (v: string) => void;
  periodRHoraLivre: string; setPeriodRHoraLivre: (v: string) => void;
  periodVelMedia: string; setPeriodVelMedia: (v: string) => void;
  periodMediaLivre: string; setPeriodMediaLivre: (v: string) => void;
  periodCustoComb: string; setPeriodCustoComb: (v: string) => void;
  statsGanhos: any; statsLucro: any; statsTotalKm: any; statsRentabilidade: any;
  statsRHoraLivre: any; statsVelMedia: any; statsMediaLivre: any; statsCustoComb: any;
  latestDayEarnings: { dateStr: string; total: number };
  smartInsight: { message: string; type: string } | null;
  monthlyChartData: any[];
  platformData: any[];

  // Toast & Confirm
  toast: { message: string; type: string } | null;
  showToast: (message: string, type?: any) => void;
  clearToast: () => void;
  confirmModal: any;
  confirmAction: (opts: any) => void;
  dismissConfirm: () => void;

  // Form state
  formErrors: Record<string, string>;
  setFormErrors: (e: Record<string, string>) => void;
  editingShift: any;
  setEditingShift: (v: any) => void;
  editingMaintenance: any;
  setEditingMaintenance: (v: any) => void;
  editingFuel: any;
  setEditingFuel: (v: any) => void;
  editingFixedExpense: any;
  setEditingFixedExpense: (v: any) => void;
  selectedServiceItems: { name: string; cost: string }[];
  setSelectedServiceItems: (v: any) => void;
  serviceSearch: string;
  setServiceSearch: (v: string) => void;
  totalKm: string;
  setTotalKm: (v: string) => void;
  shiftPlatforms: any[];
  setShiftPlatforms: (v: any) => void;
  fuelPrice: string;
  setFuelPrice: (v: string) => void;
  fuelLiters: string;
  setFuelLiters: (v: string) => void;
  fuelTotal: string;

  // UI
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  isPasswordModalOpen: boolean;
  setIsPasswordModalOpen: (v: boolean) => void;
  passwordForm: any;
  setPasswordForm: (v: any) => void;
  settingsTab: string;
  setSettingsTab: (v: string) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (v: boolean) => void;
  isAIModalOpen: boolean;
  setIsAIModalOpen: (v: boolean) => void;
  aiAnalysisResult: any;
  setAiAnalysisResult: (v: any) => void;
  isHealthCollapsed: boolean;
  setIsHealthCollapsed: (v: boolean) => void;
  showInsight: boolean;
  setShowInsight: (v: boolean) => void;
  isServiceModalOpen: boolean;
  setIsServiceModalOpen: (v: boolean) => void;
  isPro: boolean;

  // Action handlers (available to all pages via context)
  handleDeleteShiftGroup: (date: string, shiftType: string) => void;
  handleDeleteFuel: (id: number) => void;
  handleDeleteMaintenance: (id: number) => void;
  handleDeleteFixedExpense: (id: number) => void;
  handleAddServiceType: (name: string) => Promise<void>;
  handleDeleteServiceType: (id: number) => void;
  handleAddFixedExpenseType: (name: string) => Promise<void>;
  handleDeleteFixedExpenseType: (id: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [settingsTab, setSettingsTab] = useState('profile');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [isHealthCollapsed, setIsHealthCollapsed] = useState(false);
  const [showInsight, setShowInsight] = useState(true);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [editingShift, setEditingShift] = useState<any>(null);
  const [editingMaintenance, setEditingMaintenance] = useState<any>(null);
  const [editingFuel, setEditingFuel] = useState<any>(null);
  const [editingFixedExpense, setEditingFixedExpense] = useState<any>(null);
  const [selectedServiceItems, setSelectedServiceItems] = useState<{ name: string; cost: string }[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [totalKm, setTotalKm] = useState('');
  const [shiftPlatforms, setShiftPlatforms] = useState([
    { name: 'Uber', earnings: '', tips: '', rides_count: '' },
    { name: '99Pop', earnings: '', tips: '', rides_count: '' },
    { name: 'InDriver', earnings: '', tips: '', rides_count: '' },
    { name: 'Particular', earnings: '', tips: '', rides_count: '' },
  ]);
  const [fuelPrice, setFuelPrice] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');

  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    const valid = ['dashboard', 'history_turnos', 'history_abastecimentos', 'history_manutencao', 'history_despesas', 'configuracoes'];
    return valid.includes(hash) ? hash : 'dashboard';
  });

  const { showToast, clearToast, toast } = useToast();
  const { confirmModal, confirmAction, dismissConfirm } = useConfirm((msg) => showToast(msg, 'error'));

  const appData = useAppData(isAuthenticated, activeTab, filterStartDate, filterEndDate);
  const statsHook = useStats(appData.shifts, appData.fuelLogs, appData.maintenanceLogs, appData.fixedExpenses, appData.user);

  const isPro = appData.user?.subscription_plan === 'pro';

  const fuelTotal = (() => {
    const price = parseFloat(fuelPrice);
    const liters = parseFloat(fuelLiters);
    if (isNaN(price) || isNaN(liters)) return '0.00';
    return (price * liters).toFixed(2);
  })();

  // Dark mode sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => { setIsMounted(true); }, []);

  // URL Hash Routing sync
  useEffect(() => { window.location.hash = activeTab; }, [activeTab]);
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const valid = ['dashboard', 'history_turnos', 'history_abastecimentos', 'history_manutencao', 'history_despesas', 'configuracoes'];
      if (valid.includes(hash) && hash !== activeTab) setActiveTab(hash);
    };
    window.addEventListener('popstate', handleHashChange);
    return () => window.removeEventListener('popstate', handleHashChange);
  }, [activeTab]);

  // Online/offline events
  useEffect(() => {
    const handleOnline = () => showToast('Conexão restabelecida!', 'success');
    const handleOffline = () => showToast('Você está offline.', 'warning');
    const handleAuthExpired = () => { setIsAuthenticated(false); appData.setUser(null); showToast('Sessão expirada. Faça login novamente.', 'error'); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); window.removeEventListener('auth:expired', handleAuthExpired); };
  }, []);

  // Google OAuth message listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.onrender.com') && !origin.includes('localhost')) return;
      if (event.data?.type === 'AUTH_SUCCESS') {
        localStorage.setItem('token', event.data.token);
        setIsAuthenticated(true);
        if (event.data.user) appData.setUser(event.data.user);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Auth handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token, user } = await api.auth.login(authForm);
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      appData.setUser(user);
      showToast('Bem-vindo de volta!');
    } catch (error: any) { showToast(error.message, 'error'); }
  };

  const handleGoogleLogin = async () => {
    try {
      const { url } = await api.auth.getGoogleAuthUrl();
      window.open(url, 'google_login', 'width=600,height=700');
    } catch (error: any) { showToast('Erro ao iniciar login com Google: ' + error.message, 'error'); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.auth.register(authForm);
      showToast('Conta criada! Entrando...');
      const { token, user } = await api.auth.login({ email: authForm.email, password: authForm.password });
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      appData.setUser(user);
    } catch (error: any) { showToast(error.message, 'error'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    appData.setUser(null);
    window.location.reload();
  };

  // ── CRUD action handlers ──────────────────────────────────────────────────
  const handleDeleteShiftGroup = (date: string, shiftType: string) =>
    confirmAction({ title: 'Excluir Turno', message: 'Excluir turno e todos os registros?', confirmLabel: 'Excluir', variant: 'danger',
      onConfirm: async () => { await api.shifts.deleteGroup(date, shiftType); showToast('Turno excluído!'); appData.fetchData(); } });

  const handleDeleteFuel = (id: number) =>
    confirmAction({ title: 'Excluir Abastecimento', message: 'Deseja excluir este registro?', confirmLabel: 'Excluir', variant: 'danger',
      onConfirm: async () => { await api.fuel.delete(id); showToast('Abastecimento excluído!'); appData.fetchData(); } });

  const handleDeleteMaintenance = (id: number) =>
    confirmAction({ title: 'Excluir Manutenção', message: 'Deseja excluir este registro?', confirmLabel: 'Excluir', variant: 'danger',
      onConfirm: async () => { await api.maintenance.delete(id); showToast('Manutenção excluída!'); appData.fetchData(); } });

  const handleDeleteFixedExpense = (id: number) =>
    confirmAction({ title: 'Excluir Despesa', message: 'Excluir este registro?', confirmLabel: 'Excluir', variant: 'danger',
      onConfirm: async () => { await api.fixedExpenses.delete(id); showToast('Despesa excluída!'); appData.fetchData(); } });

  const handleAddServiceType = async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    try { await api.serviceTypes.create({ name }); showToast('Tipo adicionado'); appData.fetchData(); }
    catch (error: any) { showToast(error.message, 'error'); } finally { setLoading(false); }
  };

  const handleDeleteServiceType = (id: number) =>
    confirmAction({ title: 'Excluir Tipo', message: 'Excluir este tipo de serviço?', confirmLabel: 'Excluir', variant: 'danger',
      onConfirm: async () => { await api.serviceTypes.delete(id); showToast('Tipo excluído'); appData.fetchData(); } });

  const handleAddFixedExpenseType = async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    try { await api.fixedExpenseTypes.create({ name }); showToast('Tipo adicionado!'); appData.fetchData(); }
    catch (error: any) { showToast(error.message, 'error'); } finally { setLoading(false); }
  };

  const handleDeleteFixedExpenseType = (id: number) =>
    confirmAction({ title: 'Excluir Tipo', message: 'Excluir este tipo de despesa?', confirmLabel: 'Excluir', variant: 'danger',
      onConfirm: async () => { await api.fixedExpenseTypes.delete(id); showToast('Tipo excluído!'); appData.fetchData(); } });

  const value: AppContextType = {
    isAuthenticated, setIsAuthenticated,
    handleLogin, handleRegister, handleGoogleLogin, handleLogout,
    authMode, setAuthMode, authForm, setAuthForm, showPassword, setShowPassword,
    activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen,
    isSidebarCollapsed, setIsSidebarCollapsed, isMounted,
    isBottomNavVisible, isQuickAddOpen, setIsQuickAddOpen,
    filterStartDate, setFilterStartDate, filterEndDate, setFilterEndDate,
    ...appData,
    loading: loading || appData.loading,
    setLoading,
    ...statsHook,
    toast, showToast, clearToast,
    confirmModal, confirmAction, dismissConfirm,
    formErrors, setFormErrors,
    editingShift, setEditingShift,
    editingMaintenance, setEditingMaintenance,
    editingFuel, setEditingFuel,
    editingFixedExpense, setEditingFixedExpense,
    selectedServiceItems, setSelectedServiceItems,
    serviceSearch, setServiceSearch,
    totalKm, setTotalKm,
    shiftPlatforms, setShiftPlatforms,
    fuelPrice, setFuelPrice, fuelLiters, setFuelLiters, fuelTotal,
    darkMode, setDarkMode, notificationsEnabled, setNotificationsEnabled,
    isPasswordModalOpen, setIsPasswordModalOpen, passwordForm, setPasswordForm,
    settingsTab, setSettingsTab,
    isExportModalOpen, setIsExportModalOpen,
    isAIModalOpen, setIsAIModalOpen, aiAnalysisResult, setAiAnalysisResult,
    isHealthCollapsed, setIsHealthCollapsed, showInsight, setShowInsight,
    isServiceModalOpen, setIsServiceModalOpen,
    isPro,
    handleDeleteShiftGroup, handleDeleteFuel, handleDeleteMaintenance, handleDeleteFixedExpense,
    handleAddServiceType, handleDeleteServiceType, handleAddFixedExpenseType, handleDeleteFixedExpenseType,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
