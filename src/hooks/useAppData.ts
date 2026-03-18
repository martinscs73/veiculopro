/**
 * useAppData — Custom Hook
 * 
 * Responsável por toda a busca, armazenamento e sincronização de dados
 * com o backend (turnos, abastecimentos, manutenções, despesas, perfil).
 * 
 * Extrai lógica que antes vivia diretamente no App.tsx.
 */
import { useState, useEffect } from 'react';
import { api } from '../services/api';

const ITEMS_PER_PAGE = 10;

export function useAppData(isAuthenticated: boolean, activeTab: string, filterStartDate: string, filterEndDate: string) {
  // Core data
  const [user, setUser] = useState<any>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<any[]>([]);
  const [fixedExpenseTypes, setFixedExpenseTypes] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Paginated history states
  const [shiftsPage, setShiftsPage] = useState(1);
  const [shiftsCount, setShiftsCount] = useState(0);
  const [historyShifts, setHistoryShifts] = useState<any[]>([]);

  const [fuelPage, setFuelPage] = useState(1);
  const [fuelCount, setFuelCount] = useState(0);
  const [historyFuel, setHistoryFuel] = useState<any[]>([]);

  const [maintenancePage, setMaintenancePage] = useState(1);
  const [maintenanceCount, setMaintenanceCount] = useState(0);
  const [historyMaintenance, setHistoryMaintenance] = useState<any[]>([]);

  const [expensesPage, setExpensesPage] = useState(1);
  const [expensesCount, setExpensesCount] = useState(0);
  const [historyExpenses, setHistoryExpenses] = useState<any[]>([]);

  const [fetchingHistory, setFetchingHistory] = useState(false);

  // Fetch all dashboard data
  const fetchData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const filters = { start: filterStartDate, end: filterEndDate };
      const [
        profile, shiftsData, fuelData, maintenanceData, statsData,
        serviceTypesData, fixedExpensesData, fixedExpenseTypesData
      ] = await Promise.all([
        api.auth.getProfile(),
        api.shifts.list(filters),
        api.fuel.list(filters),
        api.maintenance.list(filters),
        api.stats.get(filters),
        api.serviceTypes.list(),
        api.fixedExpenses.list(filters),
        api.fixedExpenseTypes.list()
      ]);

      const storedGoal = localStorage.getItem('@VeiculoPro:monthly_goal');
      if (storedGoal) profile.monthly_goal = parseFloat(storedGoal);

      setUser(profile);
      setShifts(shiftsData.data || (Array.isArray(shiftsData) ? shiftsData : []));
      setShiftsCount(shiftsData.count !== undefined ? shiftsData.count : (Array.isArray(shiftsData) ? shiftsData.length : 0));
      setFuelLogs(fuelData.data || (Array.isArray(fuelData) ? fuelData : []));
      setFuelCount(fuelData.count !== undefined ? fuelData.count : (Array.isArray(fuelData) ? fuelData.length : 0));
      setMaintenanceLogs(maintenanceData.data || (Array.isArray(maintenanceData) ? maintenanceData : []));
      setMaintenanceCount(maintenanceData.count !== undefined ? maintenanceData.count : (Array.isArray(maintenanceData) ? maintenanceData.length : 0));
      setFixedExpenses(fixedExpensesData.data || (Array.isArray(fixedExpensesData) ? fixedExpensesData : []));
      setExpensesCount(fixedExpensesData.count !== undefined ? fixedExpensesData.count : (Array.isArray(fixedExpensesData) ? fixedExpensesData.length : 0));
      setServiceTypes(serviceTypesData);
      setFixedExpenseTypes(fixedExpenseTypesData);
      setStats(statsData);
    } catch (error: any) {
      throw error; // let App handle auth errors
    } finally {
      setLoading(false);
    }
  };

  // History fetch helpers
  const fetchHistoryShifts = async (p: number) => {
    setFetchingHistory(true);
    try {
      const { data, count } = await api.shifts.list({ page: p, limit: ITEMS_PER_PAGE, start: filterStartDate, end: filterEndDate });
      setHistoryShifts(data || []);
      setShiftsCount(typeof count === 'number' ? count : 0);
    } catch (e) { console.error(e); }
    finally { setFetchingHistory(false); }
  };

  const fetchHistoryFuel = async (p: number) => {
    setFetchingHistory(true);
    try {
      const { data, count } = await api.fuel.list({ page: p, limit: ITEMS_PER_PAGE, start: filterStartDate, end: filterEndDate });
      setHistoryFuel(data || []);
      setFuelCount(typeof count === 'number' ? count : 0);
    } catch (e) { console.error(e); }
    finally { setFetchingHistory(false); }
  };

  const fetchHistoryMaintenance = async (p: number) => {
    setFetchingHistory(true);
    try {
      const { data, count } = await api.maintenance.list({ page: p, limit: ITEMS_PER_PAGE, start: filterStartDate, end: filterEndDate });
      setHistoryMaintenance(data || []);
      setMaintenanceCount(typeof count === 'number' ? count : 0);
    } catch (e) { console.error(e); }
    finally { setFetchingHistory(false); }
  };

  const fetchHistoryExpenses = async (p: number) => {
    setFetchingHistory(true);
    try {
      const { data, count } = await api.fixedExpenses.list({ page: p, limit: ITEMS_PER_PAGE, start: filterStartDate, end: filterEndDate });
      setHistoryExpenses(data || []);
      setExpensesCount(typeof count === 'number' ? count : 0);
    } catch (e) { console.error(e); }
    finally { setFetchingHistory(false); }
  };

  // Side effects — trigger fetches based on active tab and page
  useEffect(() => { if (isAuthenticated && activeTab === 'dashboard') fetchData(); }, [activeTab, isAuthenticated, filterStartDate, filterEndDate]);
  useEffect(() => { if (isAuthenticated && activeTab === 'history_turnos') fetchHistoryShifts(shiftsPage); }, [shiftsPage, activeTab, isAuthenticated, filterStartDate, filterEndDate]);
  useEffect(() => { if (isAuthenticated && activeTab === 'history_abastecimentos') fetchHistoryFuel(fuelPage); }, [fuelPage, activeTab, isAuthenticated, filterStartDate, filterEndDate]);
  useEffect(() => { if (isAuthenticated && activeTab === 'history_manutencao') fetchHistoryMaintenance(maintenancePage); }, [maintenancePage, activeTab, isAuthenticated]);
  useEffect(() => { if (isAuthenticated && activeTab === 'history_despesas') fetchHistoryExpenses(expensesPage); }, [expensesPage, activeTab, isAuthenticated]);
  useEffect(() => { fetchData(); }, [isAuthenticated]);

  return {
    // Data
    user, setUser,
    shifts, setShifts,
    fuelLogs, setFuelLogs,
    maintenanceLogs, setMaintenanceLogs,
    serviceTypes, setServiceTypes,
    fixedExpenses, setFixedExpenses,
    fixedExpenseTypes, setFixedExpenseTypes,
    stats, setStats,
    loading,
    fetchData,
    // Paginated history
    shiftsPage, setShiftsPage, shiftsCount, historyShifts,
    fuelPage, setFuelPage, fuelCount, historyFuel,
    maintenancePage, setMaintenancePage, maintenanceCount, historyMaintenance,
    expensesPage, setExpensesPage, expensesCount, historyExpenses,
    fetchingHistory,
    ITEMS_PER_PAGE,
  };
}
