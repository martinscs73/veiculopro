import React, { Suspense, lazy } from 'react';
import { Download, DollarSign, TrendingUp, Navigation, Fuel } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn, parseLocalDate } from './utils';
import { StatCard } from './StatCard';
import { ChartSkeleton } from './Skeleton';

const DistributionPieChart = lazy(() => import('./Charts').then(m => ({ default: m.DistributionPieChart })));

export function RelatoriosPage() {
  const {
    reportPeriod, setReportPeriod,
    reportPlatform, setReportPlatform,
    reportVehicle, setReportVehicle,
    reportDriver, setReportDriver,
    reportFuelType, setReportFuelType,
    reportVehicleType, setReportVehicleType,
    reportCategory, setReportCategory,
    shifts, fuelLogs, maintenanceLogs, fixedExpenses,
    vehicleDepreciation,
    handleExportPDF
  } = useApp();

  const now = new Date();
  const startOfPeriod = new Date();
  if (reportPeriod === 'week') startOfPeriod.setDate(now.getDate() - 7);
  else if (reportPeriod === 'month') startOfPeriod.setMonth(now.getMonth() - 1);
  else if (reportPeriod === 'year') startOfPeriod.setFullYear(now.getFullYear() - 1);

  const filterByReportParams = (item: any) => {
    const itemDate = parseLocalDate(item.date);
    if (itemDate < startOfPeriod) return false;
    if (reportPlatform !== 'all' && reportPlatform !== '' && item.platform && item.platform.toLowerCase() !== reportPlatform.toLowerCase()) return false;
    if (reportVehicle !== 'all' && reportVehicle !== '' && item.vehicle_name && item.vehicle_name.toLowerCase() !== reportVehicle.toLowerCase()) return false;
    if (reportDriver !== 'all' && reportDriver !== '' && item.driver_name && item.driver_name.toLowerCase() !== reportDriver.toLowerCase()) return false;
    
    // Fuel Type filtering
    if (reportFuelType !== 'all' && reportFuelType !== '' && item.fuel_type && item.fuel_type.toLowerCase() !== reportFuelType.toLowerCase()) return false;

    // Vehicle Type filtering
    if (reportVehicleType !== 'all' && reportVehicleType !== '' && item.vehicle_type && item.vehicle_type.toLowerCase() !== reportVehicleType.toLowerCase()) return false;

    // Category filtering
    if (reportCategory !== 'all' && reportCategory !== '') {
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

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'];

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
          {vehicleDepreciation?.valorPago > 0 ? (
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">R$ {(reportKm * vehicleDepreciation.taxaPorKm).toFixed(2)}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">Cálculo: R$ {vehicleDepreciation.taxaPorKm.toFixed(3)}/km</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Configure o valor do veículo para calcular.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Manutenção por Categoria</h3>
            <div className="h-[300px] w-full">
              {maintenanceChartData.length > 0 ? (
                <Suspense fallback={<ChartSkeleton />}>
                  <DistributionPieChart data={maintenanceChartData} />
                </Suspense>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm italic border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  Nenhuma manutenção no período.
                </div>
              )}
            </div>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {maintenanceChartData.map((item, index) => (
                <div key={item.name} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase truncate">{item.name}</span>
                  </div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">R$ {(item.value as number).toFixed(0)}</p>
                </div>
              ))}
            </div>
         </div>
         
         <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
             <Fuel className="w-5 h-5 text-emerald-500" />
             Consumo de Combustível
           </h3>
           <div className="space-y-6">
             {Object.entries(filteredFuel.reduce((acc: any, f) => {
               const v = f.vehicle_name || 'Desconhecido';
               if (!acc[v]) acc[v] = { total: 0, liters: 0, count: 0 };
               acc[v].total += f.total_value;
               acc[v].liters += f.liters;
               acc[v].count += 1;
               return acc;
             }, {})).map(([vehicle, data]: [string, any]) => (
               <div key={vehicle} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                 <p className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex justify-between">
                   {vehicle}
                   <span className="text-[10px] text-slate-400 font-normal uppercase">{data.count} registros</span>
                 </p>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase">Investimento</p>
                     <p className="text-sm font-black text-rose-600 dark:text-rose-400">R$ {data.total.toFixed(2)}</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase">Volume</p>
                     <p className="text-sm font-black text-blue-600 dark:text-blue-400">{data.liters.toFixed(1)} L</p>
                   </div>
                 </div>
               </div>
             ))}
             {filteredFuel.length === 0 && (
               <p className="text-sm text-slate-400 italic text-center py-8">Sem dados de combustível para este filtro.</p>
             )}
           </div>
         </div>
      </div>
    </div>
  );
}
