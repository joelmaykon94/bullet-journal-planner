import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  userXp: number;
  setActiveTab: (tab: any) => void;
  setShowTutorial: (show: boolean) => void;
}

export const HeroSection = ({ userXp, setActiveTab, setShowTutorial }: HeroSectionProps) => {
  return (
    <div className="p-6 rounded-3xl bg-zinc-200/30 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-white/5 backdrop-blur-md relative overflow-hidden bg-gradient-to-r dark:from-zinc-900/60 dark:to-zinc-800/20 text-bujo-text">
      <div className="absolute top-0 right-0 w-64 h-64 bg-bujo-highlight/5 dark:bg-bujo-highlight/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-bujo-accent/5 dark:bg-bujo-accent/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-bujo-highlight tracking-widest block mb-1">
            Central de Comando Neuro-Adaptativa
          </span>
          <h2 className="text-xl md:text-2xl font-semibold mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Olá! Vamos organizar a mente hoje?
          </h2>
          {/* Gamified level bar */}
          <div className="flex items-center gap-3 mt-1.5 mb-2 bg-white/5 dark:bg-white/10 p-2 rounded-xl border border-white/5 max-w-xs select-none">
            <span className="text-xs font-bold text-bujo-highlight font-mono">Nível {Math.floor(userXp / 100) + 1}</span>
            <div className="flex-1 bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden relative">
              <div className="bg-bujo-highlight h-full rounded-full transition-all duration-300" style={{ width: `${userXp % 100}%` }}></div>
            </div>
            <span className="text-[9px] text-zinc-400 font-mono">{userXp % 100}/100 XP</span>
          </div>
          <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
            Sua interface se adapta ao seu ritmo biológico e níveis de ansiedade. Reduza o atrito cognitivo e planeje de acordo com sua energia atual.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap flex-shrink-0">
          <button 
            onClick={() => setActiveTab('daily_log')}
            className="px-4 py-2 bg-bujo-highlight text-white text-xs font-semibold rounded-xl hover:opacity-95 transition-opacity"
          >
            Diário de Bujo
          </button>
          <button 
            onClick={() => setShowTutorial(true)}
            className="px-4 py-2 bg-zinc-300/40 dark:bg-white/10 text-xs font-semibold rounded-xl hover:bg-zinc-300/60 dark:hover:bg-white/20 transition-colors"
          >
            Símbolos Onboarding
          </button>
        </div>
      </div>
    </div>
  );
};
