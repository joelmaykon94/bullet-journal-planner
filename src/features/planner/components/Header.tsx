import { useState } from 'react';
import { CheckSquare, Sparkles, Download, Trash2, Settings, Cloud, CloudOff, Menu, X, Sliders, Calendar, BookOpen, Brain, FolderOpen, LayoutGrid, CalendarDays, LogOut, User, Search } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';
import { useAuth } from '../../../context/AuthContext';

export const Header = () => {
  const {
    focoActive,
    setFocoActive,
    setActiveTab,
    activeTab,
    setPomodoroRunning,
    showToast,
    syncStatus,
    setShowGlobalSearch,
    deferredPrompt,
    setDeferredPrompt
  } = useBujo();

  const { user, signOut, setOfflineMode } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'indice', label: 'Índice', icon: Sliders },
    { id: 'daily_log', label: 'Log Diário', icon: CheckSquare },
    { id: 'weekly_log', label: 'Log Semanal', icon: LayoutGrid },
    { id: 'monthly_log', label: 'Log Mensal', icon: CalendarDays },
    { id: 'daily_spread', label: 'Agenda Diária', icon: Calendar },
    { id: 'future_log', label: 'Log Futuro', icon: BookOpen },
    { id: 'collections', label: 'Coleções', icon: FolderOpen },
    { id: 'dream_board', label: 'Quadro dos Sonhos', icon: Sparkles },
  ];

  const triggerPWAInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('🎉 BuJo Focus instalado com sucesso!');
        setDeferredPrompt(null);
      } else {
        showToast('Instalação cancelada pelo usuário.');
      }
    } else {
      showToast('Para instalar: toque nos 3 pontinhos do navegador e selecione "Instalar aplicativo" ou "Adicionar à tela de início".');
    }
  };

  return (
    <>
      <header className="relative z-20 px-4 md:px-6 py-4 border-b border-zinc-200/50 dark:border-white/10 backdrop-blur-md no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Hamburger Menu & Logo */}
          <div className="flex items-center gap-3">
            {!focoActive && (
              <button
                id="tutorial-mobile-menu-trigger"
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 rounded-lg border border-zinc-200/40 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:text-white md:hidden cursor-pointer bg-zinc-200/20 dark:bg-white/5"
                title="Abrir Menu"
              >
                <Menu className="w-4.5 h-4.5" />
              </button>
            )}

            <div 
              onClick={() => { if (!focoActive) setActiveTab(activeTab === 'landing_page' ? 'indice' : 'landing_page'); }}
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
              {/* Global Search Trigger */}
              <button
                onClick={() => setShowGlobalSearch(true)}
                className="flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-1.5 rounded-full bg-zinc-200/40 dark:bg-white/5 border border-zinc-200/40 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/10 hover:text-bujo-text transition-all cursor-pointer group"
                title="Pesquisa Global (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Pesquisar</span>
                <div className="hidden lg:flex items-center gap-0.5 ml-1 opacity-50">
                  <span className="text-[8px] border border-white/20 px-1 rounded">⌘</span>
                  <span className="text-[8px] border border-white/20 px-1 rounded">K</span>
                </div>
              </button>

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
          <div className="relative flex w-full max-w-xs flex-col bg-zinc-950 border-r border-white/10 p-5 shadow-3xl overflow-y-auto animate-slide-in-right justify-between">
            <div className="flex flex-col">
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
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

            {/* Mobile User Profile Card */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2 mt-6 select-none">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-bujo-highlight/15 border border-bujo-highlight/30 text-bujo-highlight flex items-center justify-center font-bold text-xs shrink-0 select-none">
                  {user?.email ? user.email[0].toUpperCase() : 'O'}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[8px] font-bold text-zinc-550 dark:text-zinc-500 tracking-widest block select-none">Usuário</span>
                  <span className="text-[11px] font-medium text-white truncate block select-text" title={user?.email || 'Modo Offline Local'}>
                    {user?.email || 'Modo Offline'}
                  </span>
                </div>
              </div>
              <div className="h-[1px] bg-white/5" />
              {user ? (
                <button
                  onClick={async () => {
                    const { error } = await signOut();
                    if (error) {
                      showToast(`Erro ao sair: ${error.message}`);
                    } else {
                      setMobileMenuOpen(false);
                      window.location.reload();
                    }
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10.5px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-red-500/20"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair / Trocar Conta
                </button>
              ) : (
                <button
                  onClick={() => {
                    setOfflineMode(false);
                    setMobileMenuOpen(false);
                    window.location.reload();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-bujo-highlight hover:opacity-95 text-white text-[10.5px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-bujo-highlight/15"
                >
                  <User className="w-3.5 h-3.5" />
                  Conectar Conta
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
