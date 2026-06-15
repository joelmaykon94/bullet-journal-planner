import { CheckSquare, Sparkles, Download } from 'lucide-react';

interface HeaderProps {
  focoActive: boolean;
  setFocoActive: (active: boolean) => void;
  setActiveTab: (tab: any) => void;
  aiEngine: 'local_llm' | 'local';
  localLLMState: string;
  setPomodoroRunning: (running: boolean) => void;
  triggerPWAInstall: () => void;
}

export const Header = ({
  focoActive,
  setFocoActive,
  setActiveTab,
  aiEngine,
  localLLMState,
  setPomodoroRunning,
  triggerPWAInstall
}: HeaderProps) => {
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
              {/* AI Status Badge Button */}
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setTimeout(() => {
                    const el = document.getElementById('local-llm-activation-center');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
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
                    : 'IA: Dicionário Offline'
                }
              >
                <Sparkles className="w-3.5 h-3.5 text-bujo-highlight" />
                <span className="hidden md:inline">
                  {aiEngine === 'local_llm' ? 'IA Browser:' : 'IA Dicionário:'}
                </span>
                <span>
                  {aiEngine === 'local_llm'
                    ? localLLMState === 'ready' ? 'Ativa' : localLLMState === 'loading' ? 'Baixando' : 'Carregar'
                    : 'Offline'}
                </span>
              </button>


              <button
                onClick={triggerPWAInstall}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-zinc-200/40 dark:bg-white/5 border border-zinc-200/40 dark:border-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/10 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Instalar PWA
              </button>
            </>
          )}

          {/* Foco Mode Toggle Button */}
          <button
            onClick={() => {
              setFocoActive(!focoActive);
              setPomodoroRunning(false);
            }}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full transition-all border ${
              focoActive 
                ? 'bg-bujo-highlight text-white border-bujo-highlight shadow-lg shadow-bujo-highlight/25 animate-pulse' 
                : 'bg-zinc-200/40 dark:bg-white/5 text-bujo-text border-zinc-200/40 dark:border-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/10'
            }`}
          >
            <span>🎯 {focoActive ? 'Parar Foco' : 'Modo Foco'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
