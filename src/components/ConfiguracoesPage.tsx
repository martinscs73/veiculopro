import React from 'react';
import { 
  User, 
  Car, 
  Bell, 
  Shield, 
  Crown, 
  TrendingUp, 
  Loader2, 
  Plus, 
  X, 
  ChevronRight, 
  CheckCircle2, 
  Download, 
  Sparkles, 
  Database 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from './utils';

export function ConfiguracoesPage() {
  const {
    user, setUser,
    loading,
    settingsTab, setSettingsTab,
    serviceTypes,
    fixedExpenseTypes,
    notificationsEnabled, setNotificationsEnabled,
    setIsPasswordModalOpen,
    isPro,
    vehicleDepreciation,
    handleUpdateProfile,
    handleAddServiceType,
    handleDeleteServiceType,
    handleAddFixedExpenseType,
    handleDeleteFixedExpenseType,
    handleExportPDF,
    handleAIConsultancy,
    handleExportRawData
  } = useApp();

  return (
    <div className="space-y-8 pb-24 lg:pb-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="w-full lg:w-64 space-y-2">
          {[
            { id: 'profile', label: 'Meu Perfil', icon: User },
            { id: 'categories', label: 'Categorias', icon: LayoutList },
            { id: 'notifications', label: 'Notificações', icon: Bell },
            { id: 'security', label: 'Segurança', icon: Shield },
            { id: 'subscription', label: 'Assinatura', icon: Crown },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSettingsTab(tab.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                settingsTab === tab.id 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 max-w-4xl">
          {settingsTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-6 h-6 text-emerald-500" />
                  Informações Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Nome Completo</label>
                    <input 
                      type="text" 
                      value={user?.name || ''} 
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">E-mail</label>
                    <input 
                      type="email" 
                      value={user?.email || ''} 
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 cursor-not-allowed text-sm" 
                    />
                    <p className="text-[10px] text-slate-400 italic">O e-mail não pode ser alterado por segurança.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase font-black text-emerald-600 dark:text-emerald-400">Meta Mensal de Lucro Líquido (R$)</label>
                    <input 
                      type="number" 
                      value={user?.monthly_goal || ''} 
                      onChange={(e) => setUser({ ...user, monthly_goal: parseFloat(e.target.value) || 0 })}
                      placeholder="Ex: 4000"
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-black text-lg" 
                    />
                    <p className="text-[10px] text-slate-400">Sua meta é usada para calcular a barra de progresso no Dashboard.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Car className="w-6 h-6 text-emerald-500" />
                  Veículo Padrão
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Modelo do Veículo</label>
                    <input 
                      type="text" 
                      value={user?.vehicle_model || ''} 
                      onChange={(e) => setUser({ ...user, vehicle_model: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Placa</label>
                    <input 
                      type="text" 
                      value={user?.vehicle_plate || ''} 
                      onChange={(e) => setUser({ ...user, vehicle_plate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Tipo de Veículo</label>
                    <select 
                      value={user?.vehicle_type || 'Carro'} 
                      onChange={(e) => setUser({ ...user, vehicle_type: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    >
                      <option value="Carro">Carro</option>
                      <option value="Moto">Moto</option>
                      <option value="Caminhão">Caminhão</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Combustível Principal</label>
                    <select 
                      value={user?.fuel_type || 'Gasolina'} 
                      onChange={(e) => setUser({ ...user, fuel_type: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    >
                      <option value="Gasolina">Gasolina</option>
                      <option value="Etanol">Etanol</option>
                      <option value="GNV">GNV</option>
                      <option value="Diesel">Diesel</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Odômetro Atual (Painel do Carro)</label>
                    <input 
                      type="number" 
                      value={user?.vehicle_odometer ?? 0} 
                      onChange={(e) => setUser({ ...user, vehicle_odometer: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold" 
                    />
                    <p className="text-[10px] text-amber-500 dark:text-amber-400 mt-1 leading-tight">
                      <span className="font-bold">Nota:</span> Como você também usa o carro fora do trabalho, os KMs do "Encerrar Turno" não batem sozinhos. Sempre atualize este campo copiando o número que está no painel do carro para que a Manutenção avise na hora certa.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Odômetro na Data de Compra</label>
                    <input 
                      type="number" 
                      value={user?.initial_odometer ?? 0} 
                      onChange={(e) => setUser({ ...user, initial_odometer: parseFloat(e.target.value) || 0 })}
                      placeholder="KM do veículo quando foi comprado"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                    />
                    <p className="text-[10px] text-slate-400">Usado como KM base para cálculo de depreciação e manutenções.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Preço de Compra (R$)</label>
                    <input 
                      type="number" 
                      value={user?.purchase_price || ''} 
                      onChange={(e) => setUser({ ...user, purchase_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="Ex: 45000"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5 font-bold">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Data de Compra</label>
                    <input 
                      type="date" 
                      value={user?.purchase_date || ''} 
                      onChange={(e) => setUser({ ...user, purchase_date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold" 
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-slate-400" />
                        Cálculo Automático de Depreciação
                      </h3>
                    </div>
                    {vehicleDepreciation?.valorPago > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valor Pago:</span>
                            <span className="font-black text-slate-900 dark:text-white text-lg">R$ {vehicleDepreciation.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valor Atual Estimado:</span>
                            <span className="font-black text-slate-900 dark:text-white text-lg">R$ {vehicleDepreciation.valorAtualEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                           <div className="absolute right-0 top-0 p-2 opacity-5 translate-x-1/2 -translate-y-1/2">
                             <TrendingUp className="w-24 h-24 text-rose-500" />
                           </div>
                           <p className="text-[10px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-[0.2em] mb-2">Desgaste Estimado / Mês</p>
                           <p className="text-3xl font-black text-rose-600 dark:text-rose-400 leading-none">R$ {vehicleDepreciation.depreciacaoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                           <p className="text-[10px] text-slate-400 font-bold mt-2 italic px-4 text-center">Este valor abate seu lucro real silenciosamente através do tempo e uso.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center py-6 bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <Car className="w-10 h-10 text-slate-200 dark:text-slate-800 mb-3" />
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">Preencha o <strong className="text-slate-700 dark:text-slate-200">Preço de Compra</strong> e <strong className="text-slate-700 dark:text-slate-200">Data</strong> acima para ativar o cálculo de depreciação inteligente.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                    Salvar Todas as Configurações
                  </button>
                </div>
              </div>
            </div>
          )}

          {settingsTab === 'categories' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <LayoutList className="w-6 h-6 text-emerald-500" />
                    Customização de Tipos
                  </h3>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Tipos de Manutenção</p>
                    <div className="flex flex-wrap gap-3">
                      {serviceTypes.map(type => (
                        <div key={type.id} className="group flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all">
                          {type.name}
                          {!type.is_default && (
                            <button 
                              onClick={() => handleDeleteServiceType(type.id)} 
                              className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all ml-1"
                              title="Excluir tipo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const name = prompt('Novo Tipo de Manutenção:');
                          if (name) handleAddServiceType(name);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded-xl text-sm font-black hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all"
                      >
                        <Plus className="w-4 h-4" /> Adicionar Novo
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Tipos de Despesas Fixas</p>
                    <div className="flex flex-wrap gap-3">
                      {fixedExpenseTypes.map(type => (
                        <div key={type.id} className="group flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all">
                          {type.name}
                          {!type.is_default && (
                            <button 
                              onClick={() => handleDeleteFixedExpenseType(type.id)} 
                              className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all ml-1"
                              title="Excluir tipo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const name = prompt('Novo Tipo de Despesa Fixa:');
                          if (name) handleAddFixedExpenseType(name);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded-xl text-sm font-black hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all"
                      >
                        <Plus className="w-4 h-4" /> Adicionar Novo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {settingsTab === 'notifications' && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-6 h-6 text-emerald-500" />
                Preferências de Notificação
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Alertas de Manutenção Inteligente</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lembretes proativos baseados no seu odômetro e tempo</p>
                  </div>
                  <button 
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-all shadow-inner",
                      notificationsEnabled ? "bg-emerald-600 shadow-emerald-700/50" : "bg-slate-300 dark:bg-slate-700"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md",
                      notificationsEnabled ? "right-1" : "left-1"
                    )}></div>
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 opacity-50 grayscale">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Alertas de Preço de Combustível</p>
                      <span className="text-[9px] font-black bg-slate-200 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded uppercase">Breve</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Notificar quando postos na sua região baixarem o preço</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-not-allowed">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {settingsTab === 'security' && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-emerald-500" />
                Segurança da Conta
              </h3>
              <div className="space-y-4">
                <button 
                  onClick={() => setIsPasswordModalOpen(true)} 
                  className="w-full text-left p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-200 dark:hover:border-emerald-500/20 transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-600 text-slate-400 group-hover:text-emerald-500">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Alterar Senha de Acesso</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Segurança adicional para sua conta VeiculoPro</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="w-full text-left p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 opacity-60 flex items-center justify-between shadow-sm grayscale">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-600 text-slate-400">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Autenticação Biométrica</p>
                        <span className="text-[9px] font-black bg-rose-50 dark:bg-rose-900/30 text-rose-500 px-1.5 py-0.5 rounded uppercase">Inativo</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Usar FaceID ou Digital para entrar no app</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {settingsTab === 'subscription' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-8 overflow-hidden relative group">
                {/* Visual Accent */}
                <div className={cn(
                  "absolute -right-20 -top-20 w-64 h-64 blur-3xl opacity-10 transition-opacity duration-1000",
                  isPro ? "bg-emerald-500 opacity-20" : "bg-slate-400"
                )}></div>

                <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10 text-center sm:text-left">
                  <div className={cn(
                    "w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl transition-transform duration-500 group-hover:scale-110",
                    isPro 
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-emerald-200 dark:shadow-none" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 shadow-slate-100 dark:shadow-none"
                  )}>
                    <Crown className="w-10 h-10" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {isPro ? 'Experiência VeiculoPro Ativa' : 'Explore o VeiculoPro'}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      {isPro 
                        ? 'Você desbloqueou o potencial máximo da sua gestão.' 
                        : 'A ferramenta definitiva para motoristas profissionais.'}
                    </p>
                  </div>
                </div>
                
                {!isPro ? (
                  <div className="space-y-8 relative z-10 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { title: 'Exportação', desc: 'PDFs e Planilhas Ilimitadas', icon: Download, color: 'text-blue-500' },
                        { title: 'Gestão IA', desc: 'Consultoria e Insights Avançados', icon: Sparkles, color: 'text-purple-500' },
                        { title: 'Backup', desc: 'Dados seguros na nuvem', icon: Database, color: 'text-amber-500' },
                      ].map((feature) => (
                        <div key={feature.title} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group/item hover:border-emerald-200 transition-all">
                          <feature.icon className={cn("w-6 h-6 mb-3 transition-transform group-hover/item:scale-110", feature.color)} />
                          <p className="text-xs font-black text-slate-900 dark:text-white uppercase mb-1">{feature.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">{feature.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-emerald-600 p-8 rounded-2xl overflow-hidden relative group/btn cursor-pointer active:scale-[0.99] transition-all shadow-xl shadow-emerald-200 dark:shadow-none"
                         onClick={() => setUser({ ...user, subscription_plan: 'pro' })}>
                       <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 bg-[length:200%_100%] animate-shimmer opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                       <div className="relative z-10 flex flex-col items-center">
                         <span className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-2">Acesso Imediato</span>
                         <span className="text-xl font-black text-white">Assinar VeiculoPro</span>
                         <span className="text-xs font-bold text-emerald-100 mt-1 opacity-80">R$ 19,90 / mês</span>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 relative z-10 pt-4">
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Sua Assinatura</p>
                        <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded uppercase">Renovação Mensal</span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 pr-12 leading-relaxed">Sua assinatura está ativa e você tem acesso total. Seus dados estão sendo salvos com prioridade e criptografia avançada.</p>
                      <button 
                         onClick={() => setUser({ ...user, subscription_plan: 'free' })}
                         className="mt-6 text-[10px] font-black text-rose-500 uppercase hover:underline tracking-widest"
                      >
                         Cancelar Assinatura do Plano Pro
                      </button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Ferramentas de Poder Pró</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <button onClick={handleExportPDF} className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-lg transition-all flex items-center gap-4 group/item text-left">
                          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover/item:scale-110 transition-transform">
                            <Download className="w-6 h-6" />
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900 dark:text-white uppercase">Relatório PDF</p>
                             <p className="text-[10px] text-slate-400 font-medium">Exportação Completa</p>
                          </div>
                        </button>
                        <button onClick={handleAIConsultancy} className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-lg transition-all flex items-center gap-4 group/item text-left">
                          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover/item:scale-110 transition-transform">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900 dark:text-white uppercase">Consultoria IA</p>
                             <p className="text-[10px] text-slate-400 font-medium">Análise e Melhorias</p>
                          </div>
                        </button>
                        <button onClick={handleExportRawData} className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-amber-200 dark:hover:border-amber-800 hover:shadow-lg transition-all flex items-center gap-4 group/item text-left">
                          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover/item:scale-110 transition-transform">
                            <Database className="w-6 h-6" />
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900 dark:text-white uppercase">Dados Brutos</p>
                             <p className="text-[10px] text-slate-400 font-medium">JSON ou Excel</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Fixed missing LayoutList icon import (it's actually 'LayoutList' in lucide)
const LayoutList = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-list"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><path d="M14 4h7"/><path d="M14 9h7"/><path d="M14 15h7"/><path d="M14 20h7"/></svg>
);

const Lock = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

const Fingerprint = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-fingerprint"><path d="M2 12a10 10 0 0 1 18-6"/><path d="M7 12a5 5 0 0 1 5-5"/><path d="M12 20a8 8 0 0 0 8-8"/><path d="M12 15a3 3 0 0 1 3-3"/><path d="M17 12a5 5 0 0 1-5 5"/><path d="M22 12a10 10 0 0 1-20 0"/></svg>
);
