import { Sliders, CheckSquare, Calendar, BookOpen, Brain, FolderOpen, Settings, LayoutGrid, CalendarDays, Trash2, Cloud, Sparkles } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';
import { getLocalDateString } from '../../../utils/plannerUtils';

export const Sidebar = () => {
  const { userXp, activeTab, setActiveTab, setSelectedDate, setStandardDate } = useBujo();

  return (
    <aside className="hidden md:flex md:flex-col w-56 flex-shrink-0 gap-2.5 no-print overflow-y-auto max-h-full pr-1.5">
      {/* Sidebar gamification card */}
      <div id="tutorial-gamification" className="p-4 rounded-2xl bg-zinc-200/30 dark:bg-white/5 border border-zinc-200/40 dark:border-white/10 flex flex-col gap-2 mb-2 text-bujo-text select-none">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Progresso</span>
          <span className="text-xs font-bold text-bujo-highlight font-mono">Nível {Math.floor(userXp / 100) + 1}</span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div className="bg-bujo-highlight h-full rounded-full transition-all duration-300" style={{ width: `${userXp % 100}%` }}></div>
        </div>
        <span className="text-[9px] text-zinc-400 text-right block font-mono">{userXp % 100} / 100 XP</span>
      </div>
      <button
        id="sidebar-tab-indice"
        onClick={() => setActiveTab('indice')}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
          activeTab === 'indice' 
            ? 'bg-bujo-highlight text-white shadow-md shadow-bujo-highlight/10' 
            : 'hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400'
        }`}
      >
        <Sliders className="w-4 h-4" />
        <span>Índice</span>
      </button>
      <button
        id="sidebar-tab-daily_log"
        onClick={() => {
          const today = getLocalDateString();
          setSelectedDate(today);
          setStandardDate(today);
          setActiveTab('daily_log');
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
          activeTab === 'daily_log' 
            ? 'bg-bujo-highlight text-white shadow-md shadow-bujo-highlight/10' 
            : 'hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400'
        }`}
      >
        <CheckSquare className="w-4 h-4" />
        <span>Daily Log</span>
      </button>
      <button
        id="sidebar-tab-weekly_log"
        onClick={() => setActiveTab('weekly_log')}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
          activeTab === 'weekly_log' 
            ? 'bg-bujo-highlight text-white shadow-md shadow-bujo-highlight/10' 
            : 'hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        <span>Weekly Log</span>
      </button>
      <button
        id="sidebar-tab-monthly_log"
        onClick={() => setActiveTab('monthly_log')}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
          activeTab === 'monthly_log' 
            ? 'bg-bujo-highlight text-white shadow-md shadow-bujo-highlight/10' 
            : 'hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400'
        }`}
      >
        <CalendarDays className="w-4 h-4" />
        <span>Monthly Log</span>
      </button>
      <button
        id="sidebar-tab-daily_spread"
        onClick={() => {
          const today = getLocalDateString();
          setSelectedDate(today);
          setStandardDate(today);
          setActiveTab('daily_spread');
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
          activeTab === 'daily_spread' 
            ? 'bg-bujo-highlight text-white shadow-md shadow-bujo-highlight/10' 
            : 'hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400'
        }`}
      >
        <Calendar className="w-4 h-4" />
        <span>Spread Diário</span>
      </button>
      <button
        id="sidebar-tab-future_log"
        onClick={() => setActiveTab('future_log')}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
          activeTab === 'future_log' 
            ? 'bg-bujo-highlight text-white shadow-md shadow-bujo-highlight/10' 
            : 'hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400'
        }`}
      >
        <BookOpen className="w-4 h-4" />
        <span>Future Log</span>
      </button>
      <button
        id="sidebar-tab-brain_dump"
        onClick={() => setActiveTab('brain_dump')}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
          activeTab === 'brain_dump' 
            ? 'bg-bujo-highlight text-white shadow-md shadow-bujo-highlight/10' 
            : 'hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400'
        }`}
      >
        <Brain className="w-4 h-4" />
        <span>Despejo de Mente</span>
      </button>
      <button
        id="sidebar-tab-collections"
        onClick={() => setActiveTab('collections')}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
          activeTab === 'collections' 
            ? 'bg-bujo-highlight text-white shadow-md shadow-bujo-highlight/10' 
            : 'hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400'
        }`}
      >
        <FolderOpen className="w-4 h-4" />
        <span>Coleções</span>
      </button>
      <button
        id="sidebar-tab-dream_board"
        onClick={() => setActiveTab('dream_board')}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
          activeTab === 'dream_board' 
            ? 'bg-bujo-highlight text-white shadow-md shadow-bujo-highlight/10' 
            : 'hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span>Quadro dos Sonhos</span>
      </button>
      <button
        id="sidebar-tab-someday_maybe"
        onClick={() => setActiveTab('someday_maybe')}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
          activeTab === 'someday_maybe' 
            ? 'bg-bujo-highlight text-white shadow-md shadow-bujo-highlight/10' 
            : 'hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400'
        }`}
      >
        <Cloud className="w-4 h-4" />
        <span>Algum Dia</span>
      </button>
    </aside>
  );
};
