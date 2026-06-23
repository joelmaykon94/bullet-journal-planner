import { useState } from 'react';
import { ChevronRight, Sparkles, LogOut, Database, User, ShieldAlert, Zap, Download, Upload, FileText, Trash2, Bell } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';
import { useAuth } from '../../../context/AuthContext';
import { requestNotificationPermission, sendNotification } from '../../../utils/notificationUtils';

export const SettingsTab = () => {
  const {
    settings,
    setSettings,
    setShowTutorial,
    askConfirmation,
    showToast,
    syncStatus,
    handleRetrySync,
    exportFullDataJSON,
    importFullDataJSON,
    exportTasksToCSV,
    handleClearAllData
  } = useBujo();

  const { user, signOut, clearConfig, setOfflineMode } = useAuth();

  const [activeCompanionId, setActiveCompanionId] = useState(() => {
    return localStorage.getItem('bujo_persona_archetype') || 'zari';
  });

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importFullDataJSON(file);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-zinc-200/50 dark:border-white/10 pb-4">
        <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest">CONFIGURAÇÃO PESSOAL</span>
        <h3 className="text-3xl font-light">
          Ajustes — <span className="italic font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Personalização</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="p-6 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 space-y-6">
          
          {/* Font selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Opção de Fonte Legível (TDAH / Dislexia)</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSettings(prev => ({ ...prev, font: 'sans' }))}
                className={`p-2.5 rounded-xl border text-xs font-semibold ${
                  settings.font === 'sans' ? 'bg-bujo-highlight text-white border-bujo-highlight' : 'bg-zinc-200/30 dark:bg-white/5 border-zinc-200/40 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                }`}
              >
                Sans-serif
              </button>
              <button
                onClick={() => setSettings(prev => ({ ...prev, font: 'dyslexic' }))}
                className={`p-2.5 rounded-xl border text-xs font-semibold ${
                  settings.font === 'dyslexic' ? 'bg-bujo-highlight text-white border-bujo-highlight' : 'bg-zinc-200/30 dark:bg-white/5 border-zinc-200/40 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                }`}
                style={{ fontFamily: 'Lexend' }}
              >
                Dyslexie Friendly
              </button>
              <button
                onClick={() => setSettings(prev => ({ ...prev, font: 'mono' }))}
                className={`p-2.5 rounded-xl border text-xs font-semibold ${
                  settings.font === 'mono' ? 'bg-bujo-highlight text-white border-bujo-highlight' : 'bg-zinc-200/30 dark:bg-white/5 border-zinc-200/40 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                }`}
              >
                Monoespaçada
              </button>
            </div>
            <p className="text-[10px] text-zinc-550 leading-relaxed pl-0.5">
              Fontes personalizadas auxiliam na diminuição do cansaço visual e aumentam a velocidade de leitura para mentes neurodivergentes.
            </p>
          </div>

          {/* Color palette selector */}
          <div className="space-y-3.5">
            <label className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">Esquema de Cores de Hiperfoco</label>
            
            {/* Hashira Theme Premium Card */}
            <button
              onClick={() => {
                setSettings(prev => ({ ...prev, highlightColor: '#EF4444', accentColor: '#3B82F6' }));
                showToast('Tema Sincronia Hashira ativado! 🔥🌊');
              }}
              className={`w-full p-4 rounded-3xl border text-left flex items-center justify-between gap-4 transition-all bg-gradient-to-r from-red-950/20 via-[#0A0514] to-blue-950/20 ${
                settings.highlightColor === '#EF4444' && settings.accentColor === '#3B82F6'
                  ? 'border-red-500/50 shadow-lg shadow-red-500/5 ring-1 ring-red-500/20'
                  : 'border-zinc-200/40 dark:border-white/10 hover:border-red-500/30'
              }`}
            >
              <div className="space-y-1 flex-1">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block font-mono">🎨 TEMA HASHIRA ATIVO</span>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  🔥 Sincronia Hashira (Demon Slayer) 🌊
                </h4>
                <p className="text-[9.5px] text-zinc-450 leading-relaxed">
                  Lâminas do caçador: Vermelho Fogo (Rengoku) e Azul Ondas (Giyu). Ativa fundo dinâmico de Sakura e cortes no escuro.
                </p>
              </div>
              <div className="flex gap-1.5 bg-zinc-950/50 p-2 rounded-2xl border border-white/5 shrink-0">
                <span className="w-6 h-6 rounded-full bg-[#EF4444] shadow-md shadow-red-500/20 flex items-center justify-center text-[10px]" title="Chamas">🔥</span>
                <span className="w-6 h-6 rounded-full bg-[#3B82F6] shadow-md shadow-blue-500/20 flex items-center justify-center text-[10px]" title="Água">🌊</span>
              </div>
            </button>

            <div className="grid grid-cols-2 gap-3">
              {/* Ocre & Verde Sálvia */}
              <button
                onClick={() => setSettings(prev => ({ ...prev, highlightColor: '#E08E45', accentColor: '#4A7C6C' }))}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between items-start gap-3 transition-all ${
                  settings.highlightColor === '#E08E45' 
                    ? 'border-bujo-highlight/85 bg-bujo-highlight/10 shadow-sm' 
                    : 'bg-zinc-200/30 dark:bg-white/5 border-zinc-200/40 dark:border-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: '#E08E45' }}></span>
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: '#4A7C6C' }}></span>
                </div>
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-bujo-text block">Terracota & Sálvia</span>
                  <span className="text-[9px] text-zinc-550 block">Paleta Aconchegante</span>
                </div>
              </button>

              {/* Classic Dark */}
              <button
                onClick={() => setSettings(prev => ({ ...prev, highlightColor: '#E11D48', accentColor: '#2563EB' }))}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between items-start gap-3 transition-all ${
                  settings.highlightColor === '#E11D48' 
                    ? 'border-bujo-highlight/85 bg-bujo-highlight/10 shadow-sm' 
                    : 'bg-zinc-200/30 dark:bg-white/5 border-zinc-200/40 dark:border-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: '#E11D48' }}></span>
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: '#2563EB' }}></span>
                </div>
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-bujo-text block">Neon Dark</span>
                  <span className="text-[9px] text-zinc-550 block">Foco de Alta Energia</span>
                </div>
              </button>

              {/* Minimalist Silver */}
              <button
                onClick={() => setSettings(prev => ({ ...prev, highlightColor: '#A1A1AA', accentColor: '#71717A' }))}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between items-start gap-3 transition-all ${
                  settings.highlightColor === '#A1A1AA' 
                    ? 'border-bujo-highlight/85 bg-bujo-highlight/10 shadow-sm' 
                    : 'bg-zinc-200/30 dark:bg-white/5 border-zinc-200/40 dark:border-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: '#A1A1AA' }}></span>
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: '#71717A' }}></span>
                </div>
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-bujo-text block">Monocromático</span>
                  <span className="text-[9px] text-zinc-550 block">Baixa Estimulação Visual</span>
                </div>
              </button>

              {/* Lavender Fields */}
              <button
                onClick={() => setSettings(prev => ({ ...prev, highlightColor: '#8B5CF6', accentColor: '#EC4899' }))}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between items-start gap-3 transition-all ${
                  settings.highlightColor === '#8B5CF6' 
                    ? 'border-bujo-highlight/85 bg-bujo-highlight/10 shadow-sm' 
                    : 'bg-zinc-200/30 dark:bg-white/5 border-zinc-200/40 dark:border-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: '#8B5CF6' }}></span>
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: '#EC4899' }}></span>
                </div>
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-bujo-text block">Lavanda & Rosa</span>
                  <span className="text-[9px] text-zinc-550 block">Calmante Antiestresse</span>
                </div>
              </button>
            </div>
          </div>

          {/* Demon Slayer Companion Selector */}
          <div className="space-y-3.5 pt-4 border-t border-zinc-200/30 dark:border-white/5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <label className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">Selecione seu Guia de Foco Hashira</label>
            </div>
            <p className="text-[9.5px] text-zinc-450 leading-relaxed">
              O BuJo Focus vem com guias inspirados no anime Demon Slayer: Kimetsu No Yaiba. Cada personagem reage à sua carga mental de forma diferente e dá orientações interativas com IA!
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'zari', name: 'Nezuko 🌸', role: 'Oni Aliada', icon: '🌸', color: 'border-pink-500/25 bg-pink-500/5 hover:bg-pink-500/10 text-pink-300' },
                { id: 'lily', name: 'Shinobu 🦋', role: 'Hashira Inseto', icon: '🦋', color: 'border-purple-500/25 bg-purple-500/5 hover:bg-purple-500/10 text-purple-300' },
                { id: 'eddy', name: 'Rengoku 🔥', role: 'Hashira Chamas', icon: '🔥', color: 'border-red-500/25 bg-red-500/5 hover:bg-red-500/10 text-red-300' },
                { id: 'oscar', name: 'Giyu 🌊', role: 'Hashira Água', icon: '🌊', color: 'border-blue-500/25 bg-blue-500/5 hover:bg-blue-500/10 text-blue-300' }
              ].map(arch => (
                <button
                  key={arch.id}
                  onClick={() => {
                    localStorage.setItem('bujo_persona_archetype', arch.id);
                    localStorage.setItem('bujo_persona_name', arch.name);
                    setActiveCompanionId(arch.id);
                    showToast(`Guia alterado para ${arch.name}! Verifique no Índice. ✨`);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    activeCompanionId === arch.id 
                      ? 'border-bujo-highlight bg-bujo-highlight/15 shadow-md ring-1 ring-bujo-highlight/20 scale-[1.02]' 
                      : `${arch.color}`
                  }`}
                >
                  <span className="text-2xl shrink-0">{arch.icon}</span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate text-white">{arch.name}</span>
                    <span className="text-[8.5px] opacity-60 block truncate">{arch.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-200/30 dark:border-white/5 flex flex-col sm:flex-row gap-3 justify-between">
            <button
              onClick={() => {
                askConfirmation({
                  title: 'Apagar Banco de Dados Local?',
                  message: 'Deseja realmente apagar todos os seus registros do Bullet Journal local? Todos os dados salvos neste navegador serão limpos permanentemente. Esta ação NÃO pode ser desfeita.',
                  confirmText: 'Apagar Tudo',
                  cancelText: 'Cancelar',
                  isDanger: true,
                  onConfirm: () => {
                    localStorage.clear();
                    window.location.reload();
                  }
                });
              }}
              className="px-4 py-2 text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all cursor-pointer border border-red-500/25"
            >
              Apagar Banco de Dados Local
            </button>

            <button
              onClick={() => setShowTutorial(true)}
              className="px-4 py-2 text-xs font-bold bg-zinc-200/40 dark:bg-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/20 text-bujo-text rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Ver Tutorial de Onboarding
            </button>
          </div>
        </div>

        {/* ADHD Energy Rhythm Configuration */}
        <div className="p-6 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-bujo-highlight uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Zap className="w-4 h-4 animate-pulse" />
              Configuração do Ritmo Energético TDAH
            </span>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Personalize suas flutuações circadianas e de dopamina para melhorar seu foco e evitar fadiga mental.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 text-left">
              <span className="text-[9.5px] font-bold text-zinc-450 uppercase block font-mono">🌅 Início do Dia</span>
              <input
                type="time"
                value={settings.dayStart || '06:00'}
                onChange={e => setSettings(prev => ({ ...prev, dayStart: e.target.value }))}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 font-mono font-bold text-white focus:outline-none focus:border-bujo-highlight"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <span className="text-[9.5px] font-bold text-zinc-450 uppercase block font-mono">🛌 Fim do Dia (Dormir)</span>
              <input
                type="time"
                value={settings.dayEnd || '23:00'}
                onChange={e => setSettings(prev => ({ ...prev, dayEnd: e.target.value }))}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 font-mono font-bold text-white focus:outline-none focus:border-bujo-highlight"
              />
            </div>
            
            <div className="space-y-1.5 text-left col-span-2">
              <span className="text-[9.5px] font-bold text-zinc-450 uppercase block font-mono">⚡ Pico de Foco (Alta Energia)</span>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={settings.energyPeakStart || '09:30'}
                  onChange={e => setSettings(prev => ({ ...prev, energyPeakStart: e.target.value }))}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 font-mono font-bold text-white focus:outline-none focus:border-bujo-highlight"
                />
                <span className="text-zinc-500 font-mono font-bold">até</span>
                <input
                  type="time"
                  value={settings.energyPeakEnd || '12:30'}
                  onChange={e => setSettings(prev => ({ ...prev, energyPeakEnd: e.target.value }))}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 font-mono font-bold text-white focus:outline-none focus:border-bujo-highlight"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left col-span-2">
              <span className="text-[9.5px] font-bold text-zinc-450 uppercase block font-mono">💤 Vale de Descanso & Crash</span>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={settings.restStart || '13:30'}
                  onChange={e => setSettings(prev => ({ ...prev, restStart: e.target.value }))}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 font-mono font-bold text-white focus:outline-none focus:border-bujo-highlight"
                />
                <span className="text-zinc-500 font-mono font-bold">até</span>
                <input
                  type="time"
                  value={settings.restEnd || '16:00'}
                  onChange={e => setSettings(prev => ({ ...prev, restEnd: e.target.value }))}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 font-mono font-bold text-white focus:outline-none focus:border-bujo-highlight"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left col-span-2">
              <span className="text-[9.5px] font-bold text-zinc-450 uppercase block font-mono">🌅 Segundo Fôlego</span>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={settings.secondWindStart || '16:30'}
                  onChange={e => setSettings(prev => ({ ...prev, secondWindStart: e.target.value }))}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 font-mono font-bold text-white focus:outline-none focus:border-bujo-highlight"
                />
                <span className="text-zinc-500 font-mono font-bold">até</span>
                <input
                  type="time"
                  value={settings.secondWindEnd || '20:00'}
                  onChange={e => setSettings(prev => ({ ...prev, secondWindEnd: e.target.value }))}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 font-mono font-bold text-white focus:outline-none focus:border-bujo-highlight"
                />
              </div>
            </div>
          </div>
          <div className="text-[9px] text-zinc-550 dark:text-zinc-500 leading-relaxed italic border-t border-zinc-200/10 dark:border-white/5 pt-2 font-mono">
            * Suas alterações serão refletidas em tempo real no gráfico de ritmo biológico no Índice.
          </div>
        </div>

        {/* Browser Notifications Configuration */}
        <div className="p-6 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-bujo-highlight uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Bell className="w-4 h-4" />
              Notificações do Sistema
            </span>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Ative as notificações para receber alertas 5 minutos antes do início e do término planejado de suas tarefas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-200/30 dark:bg-white/[0.02] border border-zinc-350 dark:border-white/5">
            <div className="space-y-1">
              <span className="text-xs font-bold text-bujo-text block">Status das Notificações</span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {Notification.permission === 'granted' 
                  ? '✅ Autorizado pelo navegador' 
                  : Notification.permission === 'denied' 
                  ? '❌ Bloqueado pelo navegador' 
                  : '⚠️ Aguardando autorização'}
              </span>
            </div>
            
            <button
              onClick={async () => {
                const granted = await requestNotificationPermission();
                if (granted) {
                  sendNotification('🔔 Teste de Notificação', {
                    body: 'Seu sistema de alertas do BuJo Focus está funcionando corretamente!',
                  });
                  showToast('Notificações ativadas com sucesso! 🔔');
                } else {
                  showToast('As notificações foram negadas ou não são suportadas.');
                }
              }}
              className="px-4 py-2 text-xs font-bold bg-bujo-highlight hover:opacity-95 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-bujo-highlight/10 w-full sm:w-auto text-center"
            >
              {Notification.permission === 'granted' ? 'Testar Notificação' : 'Ativar Notificações'}
            </button>
          </div>
          
          <p className="text-[9px] text-zinc-550 dark:text-zinc-500 leading-relaxed italic font-mono">
            * O tempo padrão de execução de uma tarefa é de 25 minutos caso você não defina um tempo específico ao criá-la.
          </p>
        </div>
      </div>

      {/* Supabase sync card */}
      <div className="p-6 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 space-y-4">
        <span className="text-xs font-bold text-bujo-highlight uppercase tracking-wider flex items-center gap-1.5">
          <Database className="w-4 h-4" />
          Sincronização & Segurança da Conta
        </span>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-200/30 dark:bg-white/[0.02] border border-zinc-350 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-bujo-accent/10 border border-bujo-accent/20 text-bujo-accent">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Usuário Logado</span>
              <span className="text-sm font-semibold text-bujo-text font-sans">{user?.email || 'Nenhum (Modo Offline Local)'}</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-2 h-2 rounded-full ${
                  user && syncStatus === 'synced' ? 'bg-emerald-500' :
                  user && syncStatus === 'syncing' ? 'bg-amber-500 animate-pulse' :
                  user && syncStatus === 'error' ? 'bg-red-500' : 'bg-zinc-400'
                }`} />
                <span className="text-[10.5px] text-zinc-400 font-mono">
                  {user && syncStatus === 'synced' ? 'Backup na nuvem ativo e sincronizado ☁️' :
                   user && syncStatus === 'syncing' ? 'Sincronizando dados com nuvem...' :
                   user && syncStatus === 'error' ? 'Erro ao conectar à nuvem' : 'Modo offline (salvando localmente)'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            {!user ? (
              <button
                onClick={() => {
                  setOfflineMode(false);
                  window.location.reload();
                }}
                className="px-4 py-2 text-xs font-bold bg-bujo-highlight hover:opacity-95 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-bujo-highlight/10 flex-1 sm:flex-initial"
              >
                Conectar Supabase (Login)
              </button>
            ) : (
              <>
                {syncStatus === 'error' && (
                  <button
                    onClick={handleRetrySync}
                    className="px-4 py-2 text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 border border-amber-500/30 rounded-xl transition-all cursor-pointer flex-1 sm:flex-initial"
                  >
                    Re-tentar Sincronização
                  </button>
                )}
                <button
                  onClick={() => {
                    askConfirmation({
                      title: 'Sair da Conta?',
                      message: 'Tem certeza de que deseja desconectar e sair do aplicativo? Você precisará realizar o login novamente para sincronizar seus dados.',
                      confirmText: 'Sair da Conta',
                      cancelText: 'Cancelar',
                      isDanger: true,
                      onConfirm: async () => {
                        const { error } = await signOut();
                        if (error) {
                          showToast(`Erro ao deslogar: ${error.message}`);
                        } else {
                          window.location.reload();
                        }
                      }
                    });
                  }}
                  className="px-4 py-2 text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all cursor-pointer border border-red-500/25 flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair da Conta
                </button>
              </>
            )}
          </div>
        </div>
        {syncStatus === 'error' && (
          <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-bujo-text space-y-3 mt-4">
            <div className="font-bold text-red-500 flex items-center gap-1.5 uppercase tracking-wide">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              Sincronização Falhou (Banco Desconfigurado)
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
              Este erro normalmente significa que a tabela <code className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-white/5 border border-zinc-350 dark:border-white/10 text-bujo-highlight font-mono text-[10.5px]">bujo_user_data</code> ou as permissões de acesso (Row Level Security) não foram criadas no seu projeto do Supabase. Para corrigir, copie o script SQL abaixo, acesse o painel do Supabase, clique em <strong>SQL Editor</strong>, cole o código e clique em <strong>Run</strong>:
            </p>
            <div className="relative">
              <pre className="p-4 bg-zinc-950 text-zinc-300 rounded-xl overflow-x-auto text-[10px] font-mono leading-normal select-all border border-zinc-200/10">
{`create table if not exists public.bujo_user_data (
  user_id uuid references auth.users not null primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bujo_user_data enable row level security;

drop policy if exists "Users can manage their own data" on public.bujo_user_data;

create policy "Users can manage their own data"
  on public.bujo_user_data
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);`}
              </pre>
            </div>
            <p className="text-[10px] text-zinc-500 font-sans">
              Dica: Após rodar o script no Supabase, clique no botão <strong>Re-tentar Sincronização</strong> acima.
            </p>
          </div>
        )}
      </div>

      {/* Data Management Section */}
      <div className="p-6 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 space-y-4">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Database className="w-4 h-4 text-bujo-highlight" />
          Gerenciamento de Dados
        </span>
        <p className="text-[11px] text-zinc-500 leading-relaxed max-w-2xl">
          Controle total sobre seus dados. Você pode exportar backups completos para segurança, importar dados de outros dispositivos ou exportar suas tarefas para planilhas (CSV).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={exportFullDataJSON}
            className="p-4 rounded-2xl bg-zinc-200/30 dark:bg-white/5 border border-zinc-200/40 dark:border-white/10 flex flex-col items-center gap-2 hover:bg-zinc-200/50 dark:hover:bg-white/10 transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-bujo-highlight/10 text-bujo-highlight group-hover:scale-110 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-bujo-text block">Exportar JSON</span>
              <span className="text-[9px] text-zinc-500">Backup Completo</span>
            </div>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-2xl bg-zinc-200/30 dark:bg-white/5 border border-zinc-200/40 dark:border-white/10 flex flex-col items-center gap-2 hover:bg-zinc-200/50 dark:hover:bg-white/10 transition-all cursor-pointer group">
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            <div className="p-2 rounded-xl bg-bujo-accent/10 text-bujo-accent group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-bujo-text block">Importar JSON</span>
              <span className="text-[9px] text-zinc-500">Restaurar Dados</span>
            </div>
          </label>

          {/* Export CSV */}
          <button
            onClick={exportTasksToCSV}
            className="p-4 rounded-2xl bg-zinc-200/30 dark:bg-white/5 border border-zinc-200/40 dark:border-white/10 flex flex-col items-center gap-2 hover:bg-zinc-200/50 dark:hover:bg-white/10 transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-bujo-text block">Exportar CSV</span>
              <span className="text-[9px] text-zinc-500">Para Planilhas</span>
            </div>
          </button>

          {/* Clear All */}
          <button
            onClick={handleClearAllData}
            className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex flex-col items-center gap-2 hover:bg-red-500/10 transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-red-500 block">LIMPAR TUDO</span>
              <span className="text-[9px] text-red-500/70">Ação Irreversível</span>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
};
