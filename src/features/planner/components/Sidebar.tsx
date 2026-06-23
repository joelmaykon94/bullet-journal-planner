import { Sliders, CheckSquare, Calendar, BookOpen, Brain, FolderOpen, LayoutGrid, CalendarDays, Cloud, Sparkles, LogOut, User } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';
import { useAuth } from '../../../context/AuthContext';
import { getLocalDateString } from '../../../utils/plannerUtils';

export const Sidebar = () => {
  const { userXp, activeTab, setActiveTab, setSelectedDate, setStandardDate, showToast } = useBujo();
  const { user, signOut, setOfflineMode } = useAuth();

  return (
    <aside className="hidden md:flex md:flex-col w-56 flex-shrink-0 gap-1.5 no-print h-full justify-between select-none pr-1.5">
      <div className="flex flex-col gap-1">
        {/* Sidebar gamification card */}
        <div id="tutorial-gamification" className="p-3.5 rounded-2xl bg-zinc-200/30 dark:bg-white/5 border border-zinc-200/40 dark:border-white/10 flex flex-col gap-1.5 mb-2 text-bujo-text select-none">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-zinc-550 dark:text-zinc-500 uppercase tracking-widest">Progresso</span>
            <span className="text-[11px] font-bold text-bujo-highlight font-mono">Nível {Math.floor(userXp / 100) + 1}</span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-bujo-highlight h-full rounded-full transition-all duration-300" style={{ width: `${userXp % 100}%` }}></div>
          </div>
          <span className="text-[8.5px] text-zinc-400 text-right block font-mono">{userXp % 100} / 100 XP</span>
        </div>

        <button
          id="sidebar-tab-indice"
          onClick={() => setActiveTab('indice')}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'indice' 
              ? 'bg-bujo-highlight text-white shadow-md shadow-bujo-highlight/10' 
              : 'hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Índice</span>
        </button>

        <button
          id="sidebar-tab-daily_spread"
          onClick={() => {
            const today = getLocalDateString();
            setSelectedDate(today);
            setStandardDate(today);
            setActiveTab('daily_spread');
          }}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'daily_spread' 
              ? 'bg-bujo-highlight text-white shadow-md shadow-bujo-highlight/10' 
              : 'hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Agenda Diária</span>
        </button>

        <button
          id="sidebar-tab-daily_log"
          onClick={() => {
            const today = getLocalDateString();
            setSelectedDate(today);
            setStandardDate(today);
            setActiveTab('daily_log');
          }}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'daily_log' 
              ? 'bg-bujo-highlight text-white shadow-md shadow-bujo-highlight/10' 
              : 'hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Log Diário</span>
        </button>

        <button
          id="sidebar-tab-weekly_log"
          onClick={() => setActiveTab('weekly_log')}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'weekly_log' 
              ? 'bg-bujo-highlight text-white shadow-md shadow-bujo-highlight/10' 
              : 'hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Log Semanal</span>
        </button>

        <button
          id="sidebar-tab-monthly_log"
          onClick={() => setActiveTab('monthly_log')}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'monthly_log' 
              ? 'bg-bujo-highlight text-white shadow-md shadow-bujo-highlight/10' 
              : 'hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Log Mensal</span>
        </button>

        <button
          id="sidebar-tab-future_log"
          onClick={() => setActiveTab('future_log')}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'future_log' 
              ? 'bg-bujo-highlight text-white shadow-md shadow-bujo-highlight/10' 
              : 'hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Log Futuro</span>
        </button>

        <button
          id="sidebar-tab-collections"
          onClick={() => setActiveTab('collections')}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'collections' 
              ? 'bg-bujo-highlight text-white shadow-md shadow-bujo-highlight/10' 
              : 'hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Coleções</span>
        </button>

        <button
          id="sidebar-tab-dream_board"
          onClick={() => setActiveTab('dream_board')}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'dream_board' 
              ? 'bg-bujo-highlight text-white shadow-md shadow-bujo-highlight/10' 
              : 'hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quadro dos Sonhos</span>
        </button>

      </div>

      {/* User profile card at the bottom */}
      <div className="p-3 rounded-2xl bg-zinc-200/30 dark:bg-white/5 border border-zinc-200/40 dark:border-white/10 flex flex-col gap-2 mt-2 select-none">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-bujo-highlight/10 border border-bujo-highlight/20 text-bujo-highlight flex items-center justify-center font-bold text-xs shrink-0 select-none">
            {user?.email ? user.email[0].toUpperCase() : 'O'}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[8px] font-bold text-zinc-550 dark:text-zinc-500 uppercase tracking-widest block select-none">Usuário</span>
            <span className="text-[11px] font-medium text-bujo-text truncate block select-text" title={user?.email || 'Modo Offline Local'}>
              {user?.email || 'Modo Offline'}
            </span>
          </div>
        </div>
        <div className="h-[1px] bg-zinc-200/30 dark:bg-white/5" />
        {user ? (
          <button
            onClick={async () => {
              const { error } = await signOut();
              if (error) {
                showToast(`Erro ao sair: ${error.message}`);
              } else {
                window.location.reload();
              }
            }}
            className="w-full py-1.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-red-500/20"
          >
            <LogOut className="w-3 h-3" />
            Sair / Trocar Conta
          </button>
        ) : (
          <button
            onClick={() => {
              setOfflineMode(false);
              window.location.reload();
            }}
            className="w-full py-1.5 px-3 rounded-xl bg-bujo-highlight hover:opacity-95 text-white text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-bujo-highlight/15"
          >
            <User className="w-3 h-3" />
            Conectar Conta
          </button>
        )}
      </div>
    </aside>
  );
};
