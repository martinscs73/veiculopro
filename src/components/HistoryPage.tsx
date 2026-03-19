import React, { Suspense } from 'react';
import { Edit3, Trash2, Smartphone, Database } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DateFilter } from './DateFilter';
import { Pagination } from './Pagination';
import { TableSkeleton, ChartSkeleton } from './Skeleton';
import { parseLocalDate, groupShiftsByDate } from './utils';

const DistributionPieChart = React.lazy(() =>
  import('./Charts').then(m => ({ default: m.DistributionPieChart }))
);

export function HistoryPage() {
  const {
    activeTab,
    filterStartDate, setFilterStartDate, filterEndDate, setFilterEndDate,
    shifts, historyShifts, shiftsPage, setShiftsPage, shiftsCount,
    historyFuel, fuelPage, setFuelPage, fuelCount,
    historyMaintenance, maintenancePage, setMaintenancePage, maintenanceCount,
    historyExpenses, expensesPage, setExpensesPage, expensesCount,
    fetchingHistory, ITEMS_PER_PAGE, isMounted,
    setEditingShift, setTotalKm, setShiftPlatforms, setActiveTab,
    setEditingFuel, setFuelPrice, setFuelLiters,
    setEditingMaintenance, setEditingFixedExpense,
    handleDeleteShiftGroup, handleDeleteFuel, handleDeleteMaintenance,
    handleDeleteFixedExpense,
  } = useApp();

  const clearDates = () => { setFilterStartDate(''); setFilterEndDate(''); };

  const DateFilterBar = () => (
    <DateFilter
      startDate={filterStartDate}
      endDate={filterEndDate}
      onStartChange={setFilterStartDate}
      onEndChange={setFilterEndDate}
      onClear={clearDates}
    />
  );

  // ── history_turnos ──────────────────────────────────────────────────────
  if (activeTab === 'history_turnos') {
    const displayShifts = groupShiftsByDate(historyShifts);
    return (
      <div className="space-y-6 pb-24 lg:pb-8">
        <DateFilterBar />
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Histórico de Turnos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data / Turno</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plataformas</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Horário</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">KM Total</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ganhos</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {fetchingHistory ? (
                  <tr><td colSpan={6} className="py-8"><TableSkeleton rows={5} cols={6} /></td></tr>
                ) : (
                  displayShifts.map((item: any) => (
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
                      <td className="py-4 text-sm text-slate-600 dark:text-slate-400">{item.start_time} - {item.end_time || '--:--'}</td>
                      <td className="py-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">{item.totalKm} km</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">R$ {(item.totalKm > 0 ? item.totalEarnings / item.totalKm : 0).toFixed(2)}/km</p>
                      </td>
                      <td className="py-4 text-sm font-bold text-slate-900 dark:text-white">R$ {(item.totalEarnings || 0).toFixed(2)}</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => {
                            const groupShifts = shifts.filter(s => s.date === item.date && s.shift_type === item.shift_type);
                            setEditingShift(item);
                            setTotalKm(item.totalKm.toString());
                            setShiftPlatforms([
                              { name: 'Uber', earnings: groupShifts.find(s => s.platform === 'Uber')?.earnings.toString() || '', tips: groupShifts.find(s => s.platform === 'Uber')?.tips?.toString() || '', rides_count: groupShifts.find(s => s.platform === 'Uber')?.rides_count?.toString() || '' },
                              { name: '99Pop', earnings: groupShifts.find(s => s.platform === '99Pop')?.earnings.toString() || '', tips: groupShifts.find(s => s.platform === '99Pop')?.tips?.toString() || '', rides_count: groupShifts.find(s => s.platform === '99Pop')?.rides_count?.toString() || '' },
                              { name: 'InDriver', earnings: groupShifts.find(s => s.platform === 'InDriver')?.earnings.toString() || '', tips: groupShifts.find(s => s.platform === 'InDriver')?.tips?.toString() || '', rides_count: groupShifts.find(s => s.platform === 'InDriver')?.rides_count?.toString() || '' },
                              { name: 'Particular', earnings: groupShifts.find(s => s.platform === 'Particular')?.earnings.toString() || '', tips: groupShifts.find(s => s.platform === 'Particular')?.tips?.toString() || '', rides_count: groupShifts.find(s => s.platform === 'Particular')?.rides_count?.toString() || '' },
                            ]);
                            setActiveTab('turnos');
                          }}
                          className="p-2 text-slate-400 hover:text-emerald-500 transition-colors" title="Editar turno"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteShiftGroup(item.date, item.shift_type)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Excluir turno">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
                {displayShifts.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-500 italic">Nenhum registro encontrado nesta página.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={shiftsPage} totalCount={shiftsCount} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setShiftsPage} />
        </div>
      </div>
    );
  }

  // ── history_abastecimentos ───────────────────────────────────────────────
  if (activeTab === 'history_abastecimentos') {
    return (
      <div className="space-y-6 pb-24 lg:pb-8">
        <DateFilterBar />
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6">Histórico de Abastecimentos</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Combustível</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Odômetro</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Litros / Preço</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {fetchingHistory ? (
                  <tr><td colSpan={6} className="py-8"><TableSkeleton rows={5} cols={6} /></td></tr>
                ) : (
                  historyFuel.map((item: any) => (
                    <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 text-sm font-bold text-slate-900 dark:text-white">{parseLocalDate(item.date).toLocaleDateString('pt-BR')}</td>
                      <td className="py-4 text-sm text-slate-600 dark:text-slate-400">{item.fuel_type}</td>
                      <td className="py-4 text-sm text-slate-600 dark:text-slate-400">{item.odometer} km</td>
                      <td className="py-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">{item.liters} L</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">R$ {(item.price_per_liter || 0).toFixed(2)}/L</p>
                      </td>
                      <td className="py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">R$ {(item.total_value || 0).toFixed(2)}</td>
                      <td className="py-4 text-right flex justify-end gap-2">
                        <button onClick={() => { setEditingFuel(item); setFuelPrice(item.price_per_liter.toString()); setFuelLiters(item.liters.toString()); setActiveTab('abastecimentos'); }} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors" title="Editar">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteFuel(item.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
                {historyFuel.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-500 italic">Nenhum registro encontrado nesta página.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={fuelPage} totalCount={fuelCount} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setFuelPage} />
        </div>
      </div>
    );
  }

  // ── history_manutencao ───────────────────────────────────────────────────
  if (activeTab === 'history_manutencao') {
    const maintenanceByType = historyMaintenance.reduce((acc: any, m) => {
      const cat = m.category || 'Outros';
      acc[cat] = (acc[cat] || 0) + m.cost;
      return acc;
    }, {});
    const maintenanceChartData = Object.entries(maintenanceByType).map(([name, value]) => ({ name, value }));

    return (
      <div className="space-y-6 pb-24 lg:pb-8">
        <DateFilterBar />
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6">Distribuição de Custos</h3>
          <div className="h-64 w-full" style={{ minHeight: '256px' }}>
            {isMounted && maintenanceChartData.length > 0 && (
              <Suspense fallback={<ChartSkeleton />}>
                <DistributionPieChart data={maintenanceChartData} />
              </Suspense>
            )}
            {isMounted && maintenanceChartData.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Database className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm italic">Nenhum dado para exibir no gráfico</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6">Histórico de Manutenção</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Veículo / Tipo</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Serviço</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Custo</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {fetchingHistory ? (
                  <tr><td colSpan={5} className="py-8"><TableSkeleton rows={5} cols={5} /></td></tr>
                ) : (
                  historyMaintenance.map((item: any) => (
                    <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 text-sm font-bold text-slate-900 dark:text-white">{parseLocalDate(item.date).toLocaleDateString('pt-BR')}</td>
                      <td className="py-4">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{item.vehicle_name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">{item.category}</p>
                      </td>
                      <td className="py-4 text-sm text-slate-600 dark:text-slate-400">{item.service_type}</td>
                      <td className="py-4 text-sm font-bold text-rose-500">R$ {(item.cost || 0).toFixed(2)}</td>
                      <td className="py-4 text-right flex justify-end gap-2">
                        <button onClick={() => { setEditingMaintenance(item); setActiveTab('manutencao'); }} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors" title="Editar">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteMaintenance(item.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
                {historyMaintenance.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-500 italic">Nenhum registro encontrado nesta página.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={maintenancePage} totalCount={maintenanceCount} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setMaintenancePage} />
        </div>
      </div>
    );
  }

  // ── history_despesas ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <DateFilterBar />
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6">Histórico de Despesas Fixas</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoria / Nome</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Valor</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {fetchingHistory ? (
                <tr><td colSpan={4} className="py-8"><TableSkeleton rows={5} cols={4} /></td></tr>
              ) : (
                historyExpenses.map((expense: any) => (
                  <tr key={expense.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 text-sm font-bold text-slate-900 dark:text-white">{parseLocalDate(expense.date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-4">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{expense.expense_type}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">{expense.category}</p>
                    </td>
                    <td className="py-4 text-sm font-bold text-rose-500">R$ {(expense.value || 0).toFixed(2)}</td>
                    <td className="py-4 text-right flex justify-end gap-2">
                      <button onClick={() => { setEditingFixedExpense(expense); setActiveTab('despesas'); }} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors" title="Editar">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteFixedExpense(expense.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {historyExpenses.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-slate-500 italic">Nenhum registro encontrado nesta página.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={expensesPage} totalCount={expensesCount} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setExpensesPage} />
      </div>
    </div>
  );
}
