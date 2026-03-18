/**
 * useStats — Custom Hook
 * 
 * Centraliza todos os cálculos de estatísticas do dashboard:
 * - calculateStatsForPeriod: Agregação local de shifts/fuel/maintenance/expenses
 * - Per-card period states (periodGanhos, periodLucro, etc.)
 * - latestDayEarnings: Ganho bruto do último dia com registro
 * - smartInsight: Comparação de rentabilidade por plataforma
 * - monthlyChartData: Dados para o gráfico de barras mensal
 * - platformData: Distribuição de ganhos por plataforma (gráfico de pizza)
 */
import { useState, useMemo } from 'react';
import { parseLocalDate } from '../components/utils';

export function useStats(
  shifts: any[],
  fuelLogs: any[],
  maintenanceLogs: any[],
  fixedExpenses: any[]
) {
  const [dashboardPeriod, setDashboardPeriod] = useState('mes_atual');
  const [periodGanhos, setPeriodGanhos] = useState('mes_atual');
  const [periodLucro, setPeriodLucro] = useState('mes_atual');
  const [periodTotalKm, setPeriodTotalKm] = useState('mes_atual');
  const [periodRentabilidade, setPeriodRentabilidade] = useState('mes_atual');
  const [periodRHoraLivre, setPeriodRHoraLivre] = useState('mes_atual');
  const [periodVelMedia, setPeriodVelMedia] = useState('mes_atual');
  const [periodMediaLivre, setPeriodMediaLivre] = useState('mes_atual');
  const [periodCustoComb, setPeriodCustoComb] = useState('mes_atual');

  const calculateStatsForPeriod = (period: string) => {
    const now = new Date();
    let startDate = new Date(0);
    let endDate = new Date('2099-12-31');

    if (period === 'hoje') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (period === 'semana_atual') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'mes_atual') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (period === 'mes_anterior') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (period === 'ano_atual') {
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

    const totalEarnings = filteredShifts.reduce((sum, s) => sum + (Number(s.earnings) || 0), 0);
    const totalFuel = filteredFuel.reduce((sum, f) => sum + (Number(f.total_value) || 0), 0);
    const totalMaintenance = filteredMaintenance.reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
    const totalFixed = filteredFixed.reduce((sum, e) => sum + (Number(e.value) || 0), 0);
    const totalExpenses = totalFuel + totalMaintenance + totalFixed;

    let totalKm = filteredShifts.reduce((sum, s) => sum + (Number(s.km) || 0), 0);
    if (filteredFuel.length > 1) {
      const odos = filteredFuel.map(f => Number(f.odometer) || 0).filter(o => o > 0);
      if (odos.length > 1) totalKm = Math.max(...odos) - Math.min(...odos);
    }

    let totalHours = 0;
    const uniqueDays = new Set<string>();
    filteredShifts.forEach(shift => {
      if (shift?.date) uniqueDays.add(shift.date);
      if (shift.start_time && shift.end_time) {
        const [startH, startM] = shift.start_time.split(':').map(Number);
        const [endH, endM] = shift.end_time.split(':').map(Number);
        if (!isNaN(startH) && !isNaN(endH)) {
          let diff = (endH + endM / 60) - (startH + startM / 60);
          if (diff < 0) diff += 24;
          totalHours += diff;
        }
      }
    });

    const netProfit = totalEarnings - totalExpenses;
    const profitability = totalKm > 0 ? totalEarnings / totalKm : 0;
    const netProfitPerHour = totalHours > 0 ? netProfit / totalHours : 0;
    const avgVelocity = totalHours > 0 ? totalKm / totalHours : 0;
    const workingDays = uniqueDays.size;
    const avgProfitPerDay = workingDays > 0 ? netProfit / workingDays : 0;

    return { totalEarnings, totalKm, totalExpenses, netProfit, profitability, totalFuel, totalMaintenance, totalFixed, totalHours, netProfitPerHour, avgVelocity, workingDays, avgProfitPerDay };
  };

  const dashboardStats = useMemo(() => calculateStatsForPeriod(dashboardPeriod), [shifts, fuelLogs, maintenanceLogs, fixedExpenses, dashboardPeriod]);
  const statsGanhos = useMemo(() => calculateStatsForPeriod(periodGanhos), [shifts, fuelLogs, maintenanceLogs, fixedExpenses, periodGanhos]);
  const statsLucro = useMemo(() => calculateStatsForPeriod(periodLucro), [shifts, fuelLogs, maintenanceLogs, fixedExpenses, periodLucro]);
  const statsTotalKm = useMemo(() => calculateStatsForPeriod(periodTotalKm), [shifts, fuelLogs, maintenanceLogs, fixedExpenses, periodTotalKm]);
  const statsRentabilidade = useMemo(() => calculateStatsForPeriod(periodRentabilidade), [shifts, fuelLogs, maintenanceLogs, fixedExpenses, periodRentabilidade]);
  const statsRHoraLivre = useMemo(() => calculateStatsForPeriod(periodRHoraLivre), [shifts, fuelLogs, maintenanceLogs, fixedExpenses, periodRHoraLivre]);
  const statsVelMedia = useMemo(() => calculateStatsForPeriod(periodVelMedia), [shifts, fuelLogs, maintenanceLogs, fixedExpenses, periodVelMedia]);
  const statsMediaLivre = useMemo(() => calculateStatsForPeriod(periodMediaLivre), [shifts, fuelLogs, maintenanceLogs, fixedExpenses, periodMediaLivre]);
  const statsCustoComb = useMemo(() => calculateStatsForPeriod(periodCustoComb), [shifts, fuelLogs, maintenanceLogs, fixedExpenses, periodCustoComb]);

  const latestDayEarnings = useMemo(() => {
    if (!shifts?.length) return { dateStr: '--/--', total: 0 };
    const sortedDates = [...new Set(shifts.map(s => s.date).filter(Boolean))].sort((a, b) => (b as string).localeCompare(a as string));
    const latestDate = sortedDates[0];
    const total = shifts.filter(s => s.date === latestDate).reduce((sum, s) => sum + (s.earnings || 0), 0);
    try {
      const dateStr = parseLocalDate(latestDate as string).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      return { dateStr, total };
    } catch { return { dateStr: String(latestDate), total }; }
  }, [shifts]);

  const smartInsight = useMemo(() => {
    if (!shifts?.length) return null;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentShifts = shifts.filter(s => s?.date && parseLocalDate(s.date) >= thirtyDaysAgo);
    if (!recentShifts.length) return null;

    const platformStats: { [k: string]: { earnings: number; km: number } } = {};
    const grouped: Record<string, any[]> = {};
    recentShifts.forEach(s => {
      const key = `${s.date}_${s.shift_type}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    });
    Object.values(grouped).forEach(group => {
      const totE = group.reduce((s, x) => s + x.earnings, 0);
      const totK = group.reduce((s, x) => s + x.km, 0);
      group.forEach(s => {
        if (!platformStats[s.platform]) platformStats[s.platform] = { earnings: 0, km: 0 };
        platformStats[s.platform].earnings += s.earnings;
        platformStats[s.platform].km += totE > 0 ? (s.earnings / totE) * totK : 0;
      });
    });

    let bestPlatform = '', bestRate = 0, worstPlatform = '', worstRate = Infinity;
    Object.entries(platformStats).forEach(([platform, stats]) => {
      if (stats.km > 0) {
        const rate = stats.earnings / stats.km;
        if (rate > bestRate) { bestRate = rate; bestPlatform = platform; }
        if (rate < worstRate) { worstRate = rate; worstPlatform = platform; }
      }
    });

    if (bestPlatform && worstPlatform && bestPlatform !== worstPlatform) {
      return { message: `A ${bestPlatform} está pagando R$ ${bestRate.toFixed(2)}/km vs R$ ${worstRate.toFixed(2)}/km na ${worstPlatform}. Priorize a ${bestPlatform}!`, type: 'success' };
    }
    return null;
  }, [shifts]);

  const monthlyChartData = useMemo(() => {
    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({ month: d.toLocaleString('pt-BR', { month: 'short' }), monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, earnings: 0, expenses: 0, fuel: 0, maintenance: 0 });
    }
    (shifts || []).forEach(s => { if (s?.date) { const m = last6Months.find(x => x.monthKey === s.date.substring(0, 7)); if (m) m.earnings += s.earnings || 0; } });
    (fuelLogs || []).forEach(f => { if (f?.date) { const m = last6Months.find(x => x.monthKey === f.date.substring(0, 7)); if (m) { m.fuel += f.total_value || 0; m.expenses += f.total_value || 0; } } });
    (maintenanceLogs || []).forEach(x => { if (x?.date) { const m = last6Months.find(y => y.monthKey === x.date.substring(0, 7)); if (m) { m.maintenance += x.cost || 0; m.expenses += x.cost || 0; } } });
    return last6Months;
  }, [shifts, fuelLogs, maintenanceLogs]);

  const platformData = useMemo(() => {
    const totals: { [k: string]: number } = {};
    (shifts || []).forEach(s => { if (s?.platform) totals[s.platform] = (totals[s.platform] || 0) + (s.earnings || 0); });
    const colors = ['#000000', '#FFD100', '#10b981', '#64748b', '#8b5cf6', '#f59e0b', '#ef4444'];
    return Object.entries(totals).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] })).filter(p => p.value > 0).sort((a, b) => b.value - a.value);
  }, [shifts]);

  return {
    // Periods
    dashboardPeriod, setDashboardPeriod,
    periodGanhos, setPeriodGanhos,
    periodLucro, setPeriodLucro,
    periodTotalKm, setPeriodTotalKm,
    periodRentabilidade, setPeriodRentabilidade,
    periodRHoraLivre, setPeriodRHoraLivre,
    periodVelMedia, setPeriodVelMedia,
    periodMediaLivre, setPeriodMediaLivre,
    periodCustoComb, setPeriodCustoComb,
    // Computed
    dashboardStats,
    statsGanhos, statsLucro, statsTotalKm, statsRentabilidade,
    statsRHoraLivre, statsVelMedia, statsMediaLivre, statsCustoComb,
    latestDayEarnings,
    smartInsight,
    monthlyChartData,
    platformData,
    calculateStatsForPeriod,
  };
}
