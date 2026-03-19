import React, { Suspense, lazy } from 'react';
import { 
  Crown, 
  Settings, 
  ChevronRight, 
  Plus, 
  Check, 
  TrendingUp, 
  X, 
  Wallet, 
  DollarSign, 
  Navigation, 
  Clock, 
  Wind, 
  Fuel, 
  Smartphone, 
  Edit3, 
  Trash2,
  Droplets
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { cn, parseLocalDate, groupShiftsByDate } from './utils';
import { StatCard } from './StatCard';
import { PeriodSelector } from './PeriodSelector';
import { ChartSkeleton, TableSkeleton } from './Skeleton';
import { api } from '../services/api';

const ComparisonBarChart = lazy(() => import('./Charts').then(m => ({ default: m.ComparisonBarChart })));
const DistributionPieChart = lazy(() => import('./Charts').then(m => ({ default: m.DistributionPieChart })));

export function DashboardPage() {
  const {
    dashboardPeriod, setDashboardPeriod,
    dashboardStats,
    user,
    setActiveTab, setSettingsTab,
    isHealthCollapsed, setIsHealthCollapsed,
    maintenanceAlerts,
    setEditingMaintenance,
    showToast, fetchData,
    showInsight, setShowInsight,
    smartInsight,
    statsGanhos, periodGanhos, setPeriodGanhos,
    latestDayEarnings,
    statsLucro, periodLucro, setPeriodLucro,
    statsRentabilidade, periodRentabilidade, setPeriodRentabilidade,
    statsTotalKm, periodTotalKm, setPeriodTotalKm,
    statsRHoraLivre, periodRHoraLivre, setPeriodRHoraLivre,
    statsVelMedia, periodVelMedia, setPeriodVelMedia,
    statsMediaLivre, periodMediaLivre, setPeriodMediaLivre,
    statsCustoComb, periodCustoComb, setPeriodCustoComb,
    isMounted, monthlyChartData,
    platformData,
    fuelEfficiencyData,
    fetchingHistory,
    historyShifts,
    shifts,
    setEditingShift, setTotalKm, setShiftPlatforms,
    handleDeleteShiftGroup
  } = useApp();

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

      {/* Metas / Relatório Mensal Rápido */}
      {dashboardPeriod === 'mes_atual' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-6 group relative overflow-hidden">
          <div className="absolute -right-16 -top-16 opacity-5 group-hover:opacity-10 transition-opacity">
            <Crown className="w-64 h-64 text-emerald-500" />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                  <Crown className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Seu Progresso de Metas</h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                Atingir suas metas financeiras é crucial. Baseado no seu lucro líquido, acompanhe sua meta mensal.
                <br/>
                <button 
                  onClick={() => { setActiveTab('configuracoes'); setSettingsTab('profile'); }}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline mt-1 inline-flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" /> Configurar Meta
                </button>
              </p>
            </div>
            
            <div className="w-full sm:w-1/2 mt-4 sm:mt-0">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    R$ {(dashboardStats?.netProfit || 0).toFixed(0)}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400"> / R$ {(user?.monthly_goal || 4000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Meta)</span>
                </div>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.min(100, ((dashboardStats?.netProfit || 0) / (user?.monthly_goal || 4000)) * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    (dashboardStats?.netProfit || 0) >= (user?.monthly_goal || 4000) ? "bg-emerald-500" : "bg-gradient-to-r from-emerald-400 to-emerald-600"
                  )}
                  style={{ width: `${Math.max(0, Math.min(100, ((dashboardStats?.netProfit || 0) / (user?.monthly_goal || 4000)) * 100))}%` }}
                />
              </div>
              {((dashboardStats?.netProfit || 0) < (user?.monthly_goal || 4000)) && (
                <p className="text-xs text-slate-400 mt-2 text-right">
                  Faltam <strong className="text-slate-700 dark:text-slate-300">R$ {((user?.monthly_goal || 4000) - (dashboardStats?.netProfit || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> para bater a meta.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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
              {maintenanceAlerts.map((alert: any, index: number) => (
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
                      {alert.icon === 'oil' ? <Droplets className="w-4 h-4" /> : (typeof alert.icon === 'function' ? <alert.icon className="w-4 h-4" /> : null)}
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
          value={`R$ ${(statsGanhos?.totalEarnings || 0).toFixed(2)}`} 
          icon={Wallet} 
          color="bg-emerald-600"
          subtitle={periodGanhos === 'hoje' ? `Acumulado do Dia (${latestDayEarnings.dateStr})` : periodGanhos === 'semana_atual' ? 'Esta Semana' : 'Este Mês'}
          actions={<PeriodSelector currentPeriod={periodGanhos} onChange={setPeriodGanhos} />}
        />
        <StatCard 
          title="Lucro Real" 
          value={`R$ ${(statsLucro?.netProfit || 0).toFixed(2)}`} 
          icon={DollarSign} 
          color="bg-emerald-400"
          subtitle="Líquido (Ganhos - Gastos)"
          actions={<PeriodSelector currentPeriod={periodLucro} onChange={setPeriodLucro} />}
        />
        <StatCard 
          title="Rentabilidade" 
          value={`R$ ${(statsRentabilidade?.profitability || 0).toFixed(2)}/km`} 
          icon={TrendingUp} 
          color="bg-blue-500"
          subtitle="Média por KM rodado"
          actions={<PeriodSelector currentPeriod={periodRentabilidade} onChange={setPeriodRentabilidade} />}
        />
        <StatCard 
          title="Total KM" 
          value={`${(statsTotalKm?.totalKm || 0).toFixed(0)} km`} 
          icon={Navigation} 
          color="bg-indigo-500"
          subtitle="Distância Total"
          actions={<PeriodSelector currentPeriod={periodTotalKm} onChange={setPeriodTotalKm} />}
        />
        <StatCard 
          title="R$/Hora Livre" 
          value={`R$ ${(statsRHoraLivre?.netProfitPerHour || 0).toFixed(2)}`} 
          icon={Clock} 
          color="bg-purple-500"
          subtitle={`${(statsRHoraLivre?.totalHours || 0).toFixed(1)}h Trabalhadas`}
          actions={<PeriodSelector currentPeriod={periodRHoraLivre} onChange={setPeriodRHoraLivre} />}
        />
        <StatCard 
          title="Velocidade Média" 
          value={`${(statsVelMedia?.avgVelocity || 0).toFixed(1)} km/h`} 
          icon={Wind} 
          color="bg-orange-500"
          subtitle="Operacional c/ Cliente"
          actions={<PeriodSelector currentPeriod={periodVelMedia} onChange={setPeriodVelMedia} />}
        />
        <StatCard 
          title="Média Livre/Dia" 
          value={`R$ ${(statsMediaLivre?.avgProfitPerDay || 0).toFixed(2)}`} 
          icon={TrendingUp} 
          color="bg-teal-500"
          subtitle={`Baseado em ${statsMediaLivre?.workingDays || 0} dias ativos`}
          actions={<PeriodSelector currentPeriod={periodMediaLivre} onChange={setPeriodMediaLivre} />}
        />
        <StatCard 
          title="Custo Combust./KM" 
          value={`R$ ${((statsCustoComb?.totalFuel || 0) / (statsCustoComb?.totalKm || 1)).toFixed(2)}`} 
          icon={Fuel} 
          color="bg-amber-500"
          subtitle="Média Geral"
          actions={<PeriodSelector currentPeriod={periodCustoComb} onChange={setPeriodCustoComb} />}
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
            {isMounted && (
              <Suspense fallback={<ChartSkeleton />}>
                <ComparisonBarChart data={monthlyChartData} />
              </Suspense>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6">Ganhos por App</h3>
            <div className="h-[200px] w-full">
              <Suspense fallback={<ChartSkeleton />}>
                <DistributionPieChart data={platformData} />
              </Suspense>
            </div>
            <div className="space-y-3 mt-4">
              {platformData.map((item: any) => (
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
              {fuelEfficiencyData.map((d: any) => (
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
              <tr className="text-left border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data / Turno</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plataformas</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">KM Total</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ganhos</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Acões</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {fetchingHistory ? (
                <tr>
                  <td colSpan={5} className="py-8">
                    <TableSkeleton rows={5} cols={5} />
                  </td>
                </tr>
              ) : (
                groupShiftsByDate(historyShifts).map((item: any) => (
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
                  <td className="py-4 text-sm text-slate-600 dark:text-slate-400">{item.totalKm} km</td>
                  <td className="py-4 text-sm font-bold text-slate-900 dark:text-white">R$ {item.totalEarnings.toFixed(2)}</td>
                  <td className="py-4 text-right">
                    <button 
                      onClick={() => {
                        const groupShifts = shifts.filter((s: any) => s.date === item.date && s.shift_type === item.shift_type);
                        setEditingShift(item);
                        setTotalKm(item.totalKm.toString());
                        setShiftPlatforms([
                          { 
                            name: 'Uber', 
                            earnings: groupShifts.find((s: any) => s.platform === 'Uber')?.earnings.toString() || '',
                            tips: groupShifts.find((s: any) => s.platform === 'Uber')?.tips?.toString() || '',
                            rides_count: groupShifts.find((s: any) => s.platform === 'Uber')?.rides_count?.toString() || ''
                          },
                          { 
                            name: '99Pop', 
                            earnings: groupShifts.find((s: any) => s.platform === '99Pop')?.earnings.toString() || '',
                            tips: groupShifts.find((s: any) => s.platform === '99Pop')?.tips?.toString() || '',
                            rides_count: groupShifts.find((s: any) => s.platform === '99Pop')?.rides_count?.toString() || ''
                          },
                          { 
                            name: 'InDriver', 
                            earnings: groupShifts.find((s: any) => s.platform === 'InDriver')?.earnings.toString() || '',
                            tips: groupShifts.find((s: any) => s.platform === 'InDriver')?.tips?.toString() || '',
                            rides_count: groupShifts.find((s: any) => s.platform === 'InDriver')?.rides_count?.toString() || ''
                          },
                          { 
                            name: 'Particular', 
                            earnings: groupShifts.find((s: any) => s.platform === 'Particular')?.earnings.toString() || '',
                            tips: groupShifts.find((s: any) => s.platform === 'Particular')?.tips?.toString() || '',
                            rides_count: groupShifts.find((s: any) => s.platform === 'Particular')?.rides_count?.toString() || ''
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
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
