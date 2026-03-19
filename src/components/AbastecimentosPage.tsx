import React from 'react';
import { Fuel, Clock, Navigation, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from './utils';
import { FormError } from './FormError';

export function AbastecimentosPage() {
  const {
    user,
    loading,
    formErrors,
    editingFuel, setEditingFuel,
    fuelPrice, setFuelPrice,
    fuelLiters, setFuelLiters,
    fuelTotal,
    setActiveTab,
    handleSaveFuel
  } = useApp();

  return (
    <div className="space-y-8 pb-24 lg:pb-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Fuel className="w-48 h-48 text-emerald-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3 relative z-10">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
            <Fuel className="w-6 h-6 text-emerald-500" />
          </div>
          {editingFuel ? 'Editar Abastecimento' : 'Novo Abastecimento'}
        </h2>
        
        <form onSubmit={handleSaveFuel} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" /> Data
              </label>
              <input name="date" type="date" required defaultValue={editingFuel?.date || new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-slate-400" /> Odômetro Atual
              </label>
              <input name="odometer" type="number" step="1" required defaultValue={editingFuel?.odometer || user?.vehicle_odometer || ''} placeholder="KM atual no painel" className={cn("w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold", formErrors.odometer ? "border-rose-500" : "border-slate-200 dark:border-slate-700")} />
              <FormError message={formErrors.odometer} />
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Detalhes do Combustível</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo</label>
                <select name="fuel_type" defaultValue={editingFuel?.fuel_type || 'Gasolina Comum'} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                  <option value="Gasolina Comum">Gasolina Comum</option>
                  <option value="Gasolina Aditivada">Gasolina Aditivada</option>
                  <option value="Etanol">Etanol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="GNV">GNV</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Preço p/ Litro (R$)</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  value={fuelPrice} 
                  onChange={(e) => setFuelPrice(e.target.value)} 
                  placeholder="0,00" 
                  className={cn("w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold", formErrors.fuelPrice ? "border-rose-500" : "border-slate-200 dark:border-slate-700")}
                />
                <FormError message={formErrors.fuelPrice} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Quantidade (Litros)</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  value={fuelLiters} 
                  onChange={(e) => setFuelLiters(e.target.value)} 
                  placeholder="0,00" 
                  className={cn("w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold", formErrors.fuelLiters ? "border-rose-500" : "border-slate-200 dark:border-slate-700")}
                />
                <FormError message={formErrors.fuelLiters} />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-600">
                  <span className="text-xs font-black text-slate-400 dark:text-slate-500">R$</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Valor Total Calculado</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">R$ {fuelTotal}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Tanque Cheio?</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input name="is_full_tank" type="checkbox" defaultChecked={editingFuel?.is_full_tank === 1} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Veículo</label>
              <input name="vehicle_name" type="text" defaultValue={editingFuel?.vehicle_name || user?.vehicle_model || ''} placeholder="Ex: Onix Plus" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Motorista</label>
              <input name="driver_name" type="text" defaultValue={editingFuel?.driver_name || user?.name || ''} placeholder="Ex: João Silva" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <Fuel className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {editingFuel ? 'Atualizar Abastecimento' : 'Salvar Abastecimento'}
            </button>
            <button 
              type="button" 
              onClick={() => {
                setEditingFuel(null);
                setFuelPrice('');
                setFuelLiters('');
                setActiveTab('dashboard');
              }}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold py-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" /> Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
