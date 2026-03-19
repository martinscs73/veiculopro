import React from 'react';
import { Settings, Clock, Navigation, Plus, Check, X, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from './utils';
import { FormError } from './FormError';

export function ManutencaoPage() {
  const {
    user,
    loading,
    formErrors,
    editingMaintenance, setEditingMaintenance,
    selectedServiceItems, setSelectedServiceItems,
    serviceSearch, setServiceSearch,
    serviceTypes,
    isServiceModalOpen, setIsServiceModalOpen,
    setActiveTab,
    handleSaveMaintenance,
    handleAddServiceType,
    handleDeleteServiceType
  } = useApp();

  return (
    <div className="space-y-8 pb-24 lg:pb-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
          <Settings className="w-6 h-6 text-emerald-500" />
          {editingMaintenance ? 'Editar Manutenção' : 'Nova Manutenção'}
        </h2>
        
        <form onSubmit={handleSaveMaintenance} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Veículo</label>
              <input name="vehicle_name" type="text" defaultValue={editingMaintenance?.vehicle_name || user?.vehicle_model || ''} placeholder="Ex: Onix Plus" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Motorista</label>
              <input name="driver_name" type="text" defaultValue={editingMaintenance?.driver_name || user?.name || ''} placeholder="Ex: João Silva" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" /> Data
              </label>
              <input name="date" type="date" required defaultValue={editingMaintenance?.date || new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-slate-400" /> Odômetro Atual
              </label>
              <input 
                name="odometer" 
                type="number" 
                step="1" 
                required 
                defaultValue={editingMaintenance?.odometer || user?.vehicle_odometer || ''} 
                placeholder="KM atual no painel" 
                className={cn(
                  "w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold",
                  formErrors.odometer ? "border-rose-500 ring-rose-500/10" : "border-slate-200 dark:border-slate-700"
                )}
              />
              <FormError message={formErrors.odometer} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Serviço(s) Realizado(s)</label>
            <div className="relative">
              <div 
                onClick={() => setIsServiceModalOpen(!isServiceModalOpen)}
                className={cn(
                  "w-full min-h-[52px] px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer flex flex-wrap gap-2 items-center",
                  formErrors.service_type ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                )}
              >
                {selectedServiceItems.length > 0 ? (
                  selectedServiceItems.map(item => (
                    <span key={item.name} className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-500/30">
                      {item.name}
                      <X 
                        className="w-3 h-3 hover:text-rose-500 cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedServiceItems(prev => prev.filter(s => s.name !== item.name));
                        }}
                      />
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">Selecione um ou mais serviços...</span>
                )}
              </div>
              
              {isServiceModalOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center gap-3 mb-4 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar serviço..." 
                      className="bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white w-full"
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        const name = prompt('Nome do novo tipo de serviço:');
                        if (name) handleAddServiceType(name);
                      }}
                      className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {serviceTypes
                      .filter(type => type.name.toLowerCase().includes(serviceSearch.toLowerCase()))
                      .map(type => {
                        const isSelected = selectedServiceItems.find(s => s.name === type.name);
                        return (
                          <div 
                            key={type.id} 
                            className={cn(
                              "flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl transition-all border gap-3",
                              isSelected ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30" : "bg-white dark:bg-slate-900 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className={cn(
                                  "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer",
                                  isSelected ? "bg-emerald-500 border-emerald-500" : "border-slate-300 dark:border-slate-600"
                                )}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedServiceItems(prev => prev.filter(s => s.name !== type.name));
                                  } else {
                                    setSelectedServiceItems(prev => [...prev, { name: type.name, cost: '' }]);
                                  }
                                }}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <span 
                                className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer truncate"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedServiceItems(prev => prev.filter(s => s.name !== type.name));
                                  } else {
                                    setSelectedServiceItems(prev => [...prev, { name: type.name, cost: '' }]);
                                  }
                                }}
                              >
                                {type.name}
                              </span>
                            </div>
                            {isSelected && (
                              <input 
                                type="number" 
                                step="0.01"
                                placeholder="Valor (R$)" 
                                value={isSelected.cost}
                                onChange={(e) => {
                                  const newCost = e.target.value;
                                  setSelectedServiceItems(prev => prev.map(s => s.name === type.name ? { ...s, cost: newCost } : s));
                                }}
                                className="w-full sm:w-28 px-2 py-1.5 text-sm bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/50 rounded text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                              />
                            )}
                          </div>
                        );
                    })}
                    {serviceTypes.length === 0 && (
                      <p className="p-3 text-center text-sm text-slate-500">Nenhum serviço disponível.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <FormError message={formErrors.service_type} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Categoria</label>
            <select 
              name="category" 
              defaultValue={editingMaintenance?.category || 'Outros'}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Pneus">Pneus</option>
              <option value="Motor">Motor</option>
              <option value="Freios">Freios</option>
              <option value="Suspensão">Suspensão</option>
              <option value="Elétrica">Elétrica</option>
              <option value="Óleo/Filtros">Óleo/Filtros</option>
              <option value="Estética">Estética</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Descrição / Oficina</label>
            <input 
              name="description" 
              type="text" 
              defaultValue={editingMaintenance?.description || ''} 
              placeholder="Ex: Troca de óleo 5W30 - Oficina do João" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Custo Total (R$)</label>
              {selectedServiceItems.length > 0 ? (
                <input 
                  type="text" 
                  value={selectedServiceItems.reduce((acc, curr) => acc + (parseFloat(curr.cost || '0')), 0).toFixed(2)}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-bold text-rose-600 dark:text-rose-400 opacity-80 cursor-not-allowed"
                />
              ) : (
                <input 
                  name="cost" 
                  type="number" 
                  step="0.01" 
                  defaultValue={editingMaintenance?.cost || ''} 
                  placeholder="Ex: 350.00" 
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-rose-600 dark:text-rose-400",
                    formErrors.cost ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                  )}
                />
              )}
              <FormError message={formErrors.cost} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Anexo (Recibo)</label>
              <button type="button" className="w-full px-4 py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-xs flex items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-500 transition-all">
                <Plus className="w-4 h-4" /> Upload Foto
              </button>
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            {editingMaintenance && (
              <button 
                type="button" 
                onClick={() => {
                  setEditingMaintenance(null);
                  setSelectedServiceItems([]);
                  setIsServiceModalOpen(false);
                }}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold py-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancelar
              </button>
            )}
            <button type="submit" className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all active:scale-[0.98]">
              {editingMaintenance ? 'Atualizar Manutenção' : 'Salvar Manutenção'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
