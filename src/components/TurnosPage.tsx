import React from 'react';
import { LayoutGrid, Clock, Navigation, Plus, Smartphone, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from './utils';

export function TurnosPage() {
  const {
    user,
    loading,
    formErrors,
    editingShift, setEditingShift,
    totalKm, setTotalKm,
    shiftPlatforms, setShiftPlatforms,
    setActiveTab,
    handleSaveShift
  } = useApp();

  return (
    <div className="space-y-8 pb-24 lg:pb-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
          <LayoutGrid className="w-6 h-6 text-emerald-500" />
          {editingShift ? 'Editar Turno' : 'Encerrar Novo Turno'}
        </h2>
        
        <form onSubmit={handleSaveShift} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" /> Data
              </label>
              <input 
                name="date" 
                type="date" 
                required 
                defaultValue={editingShift?.date || new Date().toISOString().split('T')[0]} 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Turno</label>
              <select name="shift_type" defaultValue={editingShift?.shift_type || 'Dia'} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                <option value="Dia">Dia</option>
                <option value="Noite">Noite</option>
                <option value="Madrugada">Madrugada</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-slate-400" /> KM Rodados (Total)
              </label>
              <input 
                type="text" 
                inputMode="decimal"
                value={totalKm} 
                onChange={(e) => setTotalKm(e.target.value)} 
                placeholder="Ex: 120.5" 
                className={cn(
                  "w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold",
                  formErrors.totalKm ? "border-rose-500 ring-rose-500/10" : "border-slate-200 dark:border-slate-700"
                )}
              />
              {formErrors.totalKm && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.totalKm}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> Ganhos por Plataforma
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shiftPlatforms.map((platform, index) => (
                <div key={platform.name} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{platform.name}</span>
                    <div className={cn(
                      "p-1.5 rounded-lg",
                      parseFloat(platform.earnings || '0') > 0 ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                    )}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Ganhos (Bruto)</p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
                        <input 
                          type="text" 
                          inputMode="decimal"
                          value={platform.earnings} 
                          onChange={(e) => {
                            const newPlatforms = [...shiftPlatforms];
                            newPlatforms[index].earnings = e.target.value;
                            setShiftPlatforms(newPlatforms);
                          }}
                          placeholder="0,00" 
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase text-center">Gorjetas</p>
                        <input 
                          type="text" 
                          inputMode="decimal"
                          value={platform.tips} 
                          onChange={(e) => {
                            const newPlatforms = [...shiftPlatforms];
                            newPlatforms[index].tips = e.target.value;
                            setShiftPlatforms(newPlatforms);
                          }}
                          placeholder="0,00"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase text-center">Viagens</p>
                        <input 
                          type="text" 
                          inputMode="numeric"
                          value={platform.rides_count} 
                          onChange={(e) => {
                            const newPlatforms = [...shiftPlatforms];
                            newPlatforms[index].rides_count = e.target.value;
                            setShiftPlatforms(newPlatforms);
                          }}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {formErrors.platforms && <p className="text-[10px] font-bold text-rose-500 text-center">{formErrors.platforms}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Veículo Utilizado</label>
              <input name="vehicle_name" type="text" defaultValue={editingShift?.vehicle_name || user?.vehicle_model || ''} placeholder="Ex: Onix Plus" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Motorista</label>
              <input name="driver_name" type="text" defaultValue={editingShift?.driver_name || user?.name || ''} placeholder="Ex: João Silva" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LayoutGrid className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {editingShift ? 'Salvar Alterações' : 'Encerrar Turno'}
                </>
              )}
            </button>
            <button 
              type="button" 
              onClick={() => {
                setEditingShift(null);
                setTotalKm('');
                setShiftPlatforms([
                  { name: 'Uber', earnings: '', tips: '', rides_count: '' },
                  { name: '99Pop', earnings: '', tips: '', rides_count: '' },
                  { name: 'InDriver', earnings: '', tips: '', rides_count: '' },
                  { name: 'Particular', earnings: '', tips: '', rides_count: '' }
                ]);
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
