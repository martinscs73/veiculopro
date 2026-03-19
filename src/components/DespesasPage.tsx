import React, { Suspense, lazy } from 'react';
import { Receipt, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from './utils';
import { FormError } from './FormError';
import { ChartSkeleton } from './Skeleton';

const DistributionPieChart = lazy(() => import('./Charts').then(m => ({ default: m.DistributionPieChart })));

export function DespesasPage() {
  const {
    user,
    formErrors,
    fixedExpenses,
    fixedExpenseTypes,
    editingFixedExpense, setEditingFixedExpense,
    handleSaveFixedExpense,
    handleAddFixedExpenseType
  } = useApp();

  const expenseDistribution = (fixedExpenses || []).reduce((acc: any, e) => {
    if (!e) return acc;
    const cat = e.category || 'Outros';
    acc[cat] = (acc[cat] || 0) + (e.value || 0);
    return acc;
  }, {});
  
  const expenseChartData = Object.entries(expenseDistribution).map(([name, value]) => ({ name, value }));
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'];

  return (
    <div className="space-y-8 pb-24 lg:pb-8 max-w-4xl mx-auto">
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
                <input name="vehicle_name" type="text" defaultValue={editingFixedExpense?.vehicle_name || user?.vehicle_model || ''} placeholder="Ex: Onix Plus" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Motorista</label>
                <input name="driver_name" type="text" defaultValue={editingFixedExpense?.driver_name || user?.name || ''} placeholder="Ex: João Silva" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
                <input 
                  name="date" 
                  type="date" 
                  defaultValue={editingFixedExpense?.date || new Date().toISOString().split('T')[0]} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
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
                    "w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all",
                    formErrors.value ? "border-rose-500 ring-rose-500/10" : "border-slate-200 dark:border-slate-700"
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
                    "flex-1 px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all",
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
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
              <Suspense fallback={<ChartSkeleton />}>
                <DistributionPieChart data={expenseChartData} />
              </Suspense>
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
