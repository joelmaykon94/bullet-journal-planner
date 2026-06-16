import { BujoItem } from '../../../types';
import { getLocalDateString } from '../../../utils/plannerUtils';

interface KPIRowProps {
  items: BujoItem[];
  completedPomodoros: number;
  getCognitiveLoad: () => number;
  onOverloadReliefClick: () => void;
}

export const KPIRow = ({ items, completedPomodoros, getCognitiveLoad, onOverloadReliefClick }: KPIRowProps) => {
  const cognitiveLoad = getCognitiveLoad();
  const today = getLocalDateString();
  const todayTasks = items.filter(i => i.date === today && i.type === 'task');
  const completedToday = todayTasks.filter(i => i.status === 'completed').length;
  const completionRate = todayTasks.length === 0 ? 0 : Math.round((completedToday / todayTasks.length) * 100);
  const aiDecompositions = items.filter(i => i.type === 'task' && i.subtasks && i.subtasks.length > 0).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: Carga Cognitiva */}
      <div id="tutorial-cognitive-load" className="liquid-glass p-5 rounded-2xl border border-zinc-200/30 dark:border-white/5 flex flex-col justify-between min-h-[110px] hover:border-bujo-highlight/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Carga Cognitiva</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOverloadReliefClick();
            }}
            className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-bujo-highlight/10 border border-bujo-highlight/20 text-bujo-highlight hover:bg-bujo-highlight hover:text-white transition-all cursor-pointer"
            title="Reduzir carga e reorganizar com IA"
          >
            Alívio IA
          </button>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl md:text-3xl font-light font-mono text-zinc-800 dark:text-white">
            {cognitiveLoad}%
          </span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              cognitiveLoad > 70 
                ? 'bg-red-500' 
                : cognitiveLoad > 40 
                ? 'bg-amber-500' 
                : 'bg-emerald-500'
            }`}
            style={{ width: `${cognitiveLoad}%` }}
          ></div>
        </div>
      </div>

      {/* CARD 2: Conclusão de Tarefas */}
      <div className="liquid-glass p-5 rounded-2xl border border-zinc-200/30 dark:border-white/5 flex flex-col justify-between min-h-[110px] hover:border-bujo-highlight/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans">Completude</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-bujo-accent/15 text-bujo-accent">
            HOJE
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl md:text-3xl font-light font-mono text-zinc-800 dark:text-white">
            {completionRate}%
          </span>
        </div>
        <div className="text-[10px] text-zinc-400 mt-2">
          {completedToday} de {todayTasks.length} concluídas
        </div>
      </div>

      {/* CARD 3: Minutos de Foco */}
      <div className="liquid-glass p-5 rounded-2xl border border-zinc-200/30 dark:border-white/5 flex flex-col justify-between min-h-[110px] hover:border-bujo-highlight/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tempo de Foco</span>
          <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5">
            ⚡ ATIVO
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl md:text-3xl font-light font-mono text-zinc-800 dark:text-white">
            {completedPomodoros * 25}
          </span>
          <span className="text-xs text-zinc-400">min</span>
        </div>
        <div className="text-[10px] text-zinc-400 mt-2">
          {completedPomodoros} {completedPomodoros === 1 ? 'bloco' : 'blocos'} de 25 min hoje
        </div>
      </div>

      {/* CARD 4: Destraves Realizados */}
      <div className="liquid-glass p-5 rounded-2xl border border-zinc-200/30 dark:border-white/5 flex flex-col justify-between min-h-[110px] hover:border-bujo-highlight/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Divisões IA</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-purple-500/10 text-purple-400">
            COGNITIVO
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl md:text-3xl font-light font-mono text-zinc-800 dark:text-white">
            {aiDecompositions}
          </span>
        </div>
        <div className="text-[10px] text-zinc-400 mt-2">
          Tarefas desdobradas em sub-passos
        </div>
      </div>
    </div>
  );
};
