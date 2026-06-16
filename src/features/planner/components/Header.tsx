import { CheckSquare, Sparkles, Download, Trash2, Settings, Cloud, CloudOff } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';

export const Header = () => {
  const {
    focoActive,
    setFocoActive,
    setActiveTab,
    aiEngine,
    localLLMState,
    setPomodoroRunning,
    showToast,
    setShowAIDownloadModal,
    syncStatus
  } = useBujo();

  const triggerPWAInstall = () => {
    showToast('Para instalar: toque nos 3 pontinhos do navegador e selecione "Instalar aplicativo" ou "Adicionar à tela de início".');
  };

  return (
    <header className="relative z-20 px-4 md:px-6 py-4 border-b border-zinc-200/50 dark:border-white/10 backdrop-blur-md no-print">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => { if (!focoActive) setActiveTab('indice'); }}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="p-1.5 rounded-full bg-bujo-highlight/10 border border-bujo-highlight/20 text-bujo-highlight">
            <CheckSquare className="w-5 h-5 group-hover:rotate-12 transition-transform duration-350" />
          </div>
          <span className="font-semibold text-lg tracking-tight">BuJo Focus</span>
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
  );
};
