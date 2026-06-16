import { useState } from 'react';
import { CheckSquare, Sparkles, Download, Trash2, Settings, Cloud, CloudOff, Menu, X, Sliders, Calendar, BookOpen, Brain, FolderOpen, LayoutGrid, CalendarDays } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';

export const Header = () => {
  const {
    focoActive,
    setFocoActive,
    setActiveTab,
    activeTab,
    aiEngine,
    localLLMState,
    setPomodoroRunning,
    showToast,
    setShowAIDownloadModal,
    syncStatus
  } = useBujo();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'indice', label: 'Índice', icon: Sliders },
    { id: 'daily_log', label: 'Daily Log', icon: CheckSquare },
    { id: 'weekly_log', label: 'Weekly Log', icon: LayoutGrid },
    { id: 'monthly_log', label: 'Monthly Log', icon: CalendarDays },
    { id: 'daily_spread', label: 'Spread Diário', icon: Calendar },
    { id: 'future_log', label: 'Future Log', icon: BookOpen },
    { id: 'brain_dump', label: 'Despejo de Mente', icon: Brain },
    { id: 'collections', label: 'Coleções', icon: FolderOpen },
    { id: 'dream_board', label: 'Quadro dos Sonhos', icon: Sparkles },
    { id: 'someday_maybe', label: 'Algum Dia', icon: Cloud },
  ];

  const triggerPWAInstall = () => {
    showToast('Para instalar: toque nos 3 pontinhos do navegador e selecione "Instalar aplicativo" ou "Adicionar à tela de início".');
  };

  return (
    <>
      <header className="relative z-20 px-4 md:px-6 py-4 border-b border-zinc-200/50 dark:border-white/10 backdrop-blur-md no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Hamburger Menu & Logo */}
          <div className="flex items-center gap-3">
            {!focoActive && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 rounded-lg border border-zinc-200/40 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:text-white md:hidden cursor-pointer bg-zinc-200/20 dark:bg-white/5"
                title="Abrir Menu"
              >
                <Menu className="w-4.5 h-4.5" />
              </button>
            )}

            <div 
              onClick={() => { if (!focoActive) setActiveTab('indice'); }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="p-1.5 rounded-full bg-bujo-highlight/10 border border-bujo-highlight/20 text-bujo-highlight">
                <CheckSquare className="w-5 h-5 group-hover:rotate-12 transition-transform duration-350" />
              </div>
              <span className="font-semibold text-lg tracking-tight">BuJo Focus</span>
            </div>
          </div>

        {/* Nav Controls */}
        <div className="flex items-center gap-2">
          {!focoActive && (
            <>
              {/* Cloud Sync Status Badge */}
              <div 
                className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-full border transition-all ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-600/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-600/20'
                    : syncStatus === 'syncing'
                    ? 'bg-amber-600/10 text-amber-500 border-amber-500/20 hover:bg-amber-600/20 animate-pulse'
                    : syncStatus === 'error'
                    ? 'bg-red-600/10 text-red-500 border-red-500/20 hover:bg-red-600/20'
                    : 'bg-zinc-200/40 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border-zinc-200/40 dark:border-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                }`}
                title={
                  syncStatus === 'synced'
                    ? 'Dados salvos na nuvem (Supabase)'
                    : syncStatus === 'syncing'
                    ? 'Sincronizando dados com o Supabase...'
                    : syncStatus === 'error'
                    ? 'Erro ao sincronizar com o Supabase'
                    : 'Modo Offline: Salvo localmente no navegador'
                }
              >
                {syncStatus === 'synced' ? (
                  <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                ) : syncStatus === 'offline' ? (
                  <CloudOff className="w-3.5 h-3.5 text-zinc-400" />
                ) : (
                  <Cloud className={`w-3.5 h-3.5 ${syncStatus === 'error' ? 'text-red-500' : 'text-amber-500'}`} />
                )}
                <span className="hidden md:inline">
                  {syncStatus === 'synced' ? 'Nuvem' : syncStatus === 'syncing' ? 'Sincronizando' : syncStatus === 'error' ? 'Erro Sync' : 'Offline'}
                </span>
              </div>

              {/* AI Status Badge Button */}
              <button
                id="tutorial-ai-badge"
                onClick={() => {
                  if (aiEngine === 'local') {
                    setShowAIDownloadModal(true);
                  } else {
                    setActiveTab('settings');
                    setTimeout(() => {
                      const el = document.getElementById('local-llm-activation-center');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 150);
                  }
                }}
                className={`flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-1.5 rounded-full border transition-all ${
                  aiEngine === 'local_llm'
                    ? localLLMState === 'ready'
                      ? 'bg-emerald-600/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-600/20'
                      : localLLMState === 'loading'
                      ? 'bg-amber-600/10 text-amber-500 border-amber-500/20 hover:bg-amber-600/20 animate-pulse'
                      : 'bg-zinc-200/40 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border-zinc-200/40 dark:border-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                    : 'bg-zinc-200/40 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border-zinc-200/40 dark:border-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                }`}
                title={
                  aiEngine === 'local_llm'
                    ? `IA no Browser: ${localLLMState === 'ready' ? 'Pronto' : localLLMState === 'loading' ? 'Carregando' : 'Não Carregado'}`
                    : 'Motor Simples de Regras Ativo'
                }
              >
                <Sparkles className={`w-3.5 h-3.5 ${aiEngine === 'local_llm' && localLLMState === 'ready' ? 'text-emerald-500 fill-emerald-500/10' : 'text-zinc-400'}`} />
                <span className="hidden sm:inline">
                  {aiEngine === 'local_llm'
                    ? localLLMState === 'ready'
                      ? 'IA Local: Pronta'
                      : localLLMState === 'loading'
                      ? 'Carregando IA...'
                      : 'Ativar IA Avançada'
                    : 'Motor IA Simples'}
                </span>
              </button>

              {/* Install PWA Button */}
              <button
                id="tutorial-install-pwa"
                onClick={triggerPWAInstall}
                className="flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-1.5 rounded-full bg-zinc-200/40 dark:bg-white/5 border border-zinc-200/40 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/10 hover:text-bujo-text transition-all"
                title="Instalar como Aplicativo PWA"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Instalar App</span>
              </button>

              {/* Lixeira Button */}
              <button
                onClick={() => setActiveTab('trash')}
                className="flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-1.5 rounded-full bg-zinc-200/40 dark:bg-white/5 border border-zinc-200/40 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/10 hover:text-bujo-text transition-all cursor-pointer"
                title="Ir para a Lixeira"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lixeira</span>
              </button>

              {/* Settings/Configurações Button */}
              <button
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-1.5 rounded-full bg-zinc-200/40 dark:bg-white/5 border border-zinc-200/40 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/10 hover:text-bujo-text transition-all cursor-pointer"
                title="Ajustes / Configurações"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ajustes</span>
              </button>
            </>
          )}

          {/* Toggle Focus Mode Button */}
          <button
            onClick={() => {
              if (!focoActive) {
                // When entering focus, start ticking pomodoro
                setPomodoroRunning(true);
                setFocoActive(true);
                showToast('🎯 Modo Foco Ativado! Hora de trabalhar.');
              } else {
                setFocoActive(false);
                setPomodoroRunning(false);
                showToast('⚖️ Voltando ao Dashboard do Bullet Journal.');
              }
            }}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all shadow-sm ${
              focoActive
                ? 'bg-bujo-highlight text-white hover:opacity-95'
                : 'bg-bujo-accent text-white hover:opacity-95'
            }`}
          >
            {focoActive ? 'Sair do Foco' : 'Iniciar Foco ⚡'}
          </button>
        </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex no-print md:hidden">
          {/* Backdrop blur overlay */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer Panel Container */}
          <div className="relative flex w-full max-w-xs flex-col bg-zinc-950 border-r border-white/10 p-5 shadow-3xl overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-full bg-bujo-highlight/10 text-bujo-highlight">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-white font-mono">Menu BuJo Focus</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1.5">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-medium transition-all text-left cursor-pointer ${
                      isActive 
                        ? 'bg-bujo-highlight text-white font-bold shadow-lg shadow-bujo-highlight/15' 
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};
