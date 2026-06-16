import { Target, Brain, Sliders, ListChecks, LayoutGrid, CalendarDays, Sparkles, Cloud, Trash2 } from 'lucide-react';
import { EnergyChart } from '../../adhd/components/EnergyChart';
import { HabitTracker } from './HabitTracker';
import { UserPersonaCard } from './UserPersonaCard';
import { KnowledgeEvolutionChart } from '../../education/components/KnowledgeEvolutionChart';
import { useBujo } from '../../../context/BujoContext';
import { BUJO_ICONS } from './DailyLogTab';
import { getLocalDateString } from '../../../utils/plannerUtils';

export const IndexTab = () => {
  const {
    userXp,
    setUserXp,
    setActiveTab,
    setShowTutorial,
    items,
    completedPomodoros,
    getCognitiveLoad,
    getHarmonyScore,
    getHarmonyRecommendation,
    showEnergyGuide,
    setShowEnergyGuide,
    selectedDate,
    setSelectedDate,
    setStandardDate,
    setShowOverloadReliefModal,
    aiEngine,
    aiWorkerRef,
    localLLMState,
    showToast,
    currentEnergy,
    anxietyLevel,
    soundType,
    setSoundType,
    toggleAmbientAudio,
    ambientPlaying,
    ambientVolume,
    setAmbientVolume
  } = useBujo();

  const level = Math.floor(userXp / 100) + 1;
  const currentLevelXp = userXp % 100;
  const cognitiveLoad = getCognitiveLoad();

  // Metrics calculation
  const today = getLocalDateString();
  const todayTasks = items.filter(i => i.date === today && i.type === 'task');
  const completedToday = todayTasks.filter(i => i.status === 'completed').length;
  const completionRate = todayTasks.length === 0 ? 0 : Math.round((completedToday / todayTasks.length) * 100);

  // General task statistics
  const totalTasks = items.filter(i => i.type === 'task').length;
  const pendingTasks = items.filter(i => i.type === 'task' && i.status === 'open').length;
  const completedTasks = items.filter(i => i.type === 'task' && i.status === 'completed').length;
  const otherTasksCount = items.filter(i => i.type === 'task' && i.status !== 'open' && i.status !== 'completed').length;

  // Context counts
  const contextCounts = items.reduce((acc, item) => {
    if (item.type === 'task') {
      const matches = item.content.match(/@([a-zA-ZÀ-ÿ0-9_-]+)/g);
      if (matches) {
        matches.forEach(ctx => {
          const c = ctx.toLowerCase();
          acc[c] = (acc[c] || 0) + 1;
        });
      }
    }
    return acc;
  }, {} as { [key: string]: number });

  // Delegated counts
  const delegateCounts = items.reduce((acc, item) => {
    if (item.delegatedTo && item.type === 'task') {
      const name = item.delegatedTo;
      acc[name] = (acc[name] || 0) + 1;
    }
    return acc;
  }, {} as { [key: string]: number });
  const delegatedTotalCount = items.filter(item => item.type === 'task' && item.delegatedTo).length;

  // Icon / Category counts
  const categoryCounts = items.reduce((acc, item) => {
    if (item.icon && item.type === 'task') {
      acc[item.icon] = (acc[item.icon] || 0) + 1;
    }
    return acc;
  }, {} as { [key: string]: number });

  return (
    <div className="flex flex-col gap-4 animate-fade-in no-print max-w-7xl mx-auto p-1 h-full select-none font-mono">
      
      {/* 1. Welcomer Banner & KPI Metrics */}
      <div className="p-4 rounded-3xl bg-zinc-200/20 dark:bg-zinc-900/30 border border-zinc-200/30 dark:border-white/5 flex flex-col gap-4">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-200/10 dark:border-white/5 pb-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[9px] uppercase font-bold text-bujo-highlight tracking-widest leading-none">
              Central de Foco Neuro-Adaptativa
            </span>
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-1.5 leading-tight">
              Olá! Vamos organizar a mente hoje?
            </h2>
          </div>

          {/* Compact Metrics Row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Carga Cognitiva */}
            <div 
              id="tutorial-cognitive-load"
              onClick={() => setShowOverloadReliefModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/40 cursor-pointer transition-all flex flex-col justify-center text-center min-w-[95px]"
              title="Clique para Alívio Cognitivo IA"
            >
              <span className="text-[8px] font-bold text-zinc-555 uppercase tracking-wider">Carga</span>
              <span className={`text-xs font-black mt-0.5 ${cognitiveLoad > 70 ? 'text-red-500 animate-pulse' : cognitiveLoad > 40 ? 'text-amber-500' : 'text-emerald-500'}`}>{cognitiveLoad}%</span>
            </div>

            {/* Completude */}
            <div className="px-3.5 py-1.5 rounded-xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 flex flex-col justify-center text-center min-w-[95px]">
              <span className="text-[8px] font-bold text-zinc-555 uppercase tracking-wider">Progresso</span>
              <span className="text-xs font-black mt-0.5 text-zinc-100">{completionRate}%</span>
            </div>

            {/* Tempo Foco */}
            <div className="px-3.5 py-1.5 rounded-xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 flex flex-col justify-center text-center min-w-[95px]">
              <span className="text-[8px] font-bold text-zinc-555 uppercase tracking-wider">Tempo Foco</span>
              <span className="text-xs font-black mt-0.5 text-zinc-150">{completedPomodoros * 25}m</span>
            </div>

            {/* Bujo Action buttons */}
            <div className="flex gap-1.5 pl-1 shrink-0">
              <button 
                onClick={() => {
                  setSelectedDate(today);
                  setStandardDate(today);
                  setActiveTab('daily_log');
                }}
                className="px-3 py-1.5 bg-bujo-highlight text-white text-[9px] font-bold rounded-lg hover:opacity-95 transition-opacity cursor-pointer shadow-sm shadow-bujo-highlight/10"
              >
                Diário Bujo
              </button>
              <button 
                onClick={() => setShowTutorial(true)}
                className="px-3 py-1.5 bg-zinc-350/20 dark:bg-white/10 text-[9px] font-bold rounded-lg hover:bg-zinc-300/40 dark:hover:bg-white/20 transition-colors cursor-pointer"
              >
                Tutorial
              </button>
            </div>
          </div>
        </div>

        {/* High-density Task & Status distribution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Col 1: Overview */}
          <div className="bg-zinc-200/10 dark:bg-white/[0.02] border border-zinc-200/40 dark:border-white/5 p-3 rounded-xl flex flex-col justify-between">
            <span className="text-[9px] text-zinc-450 uppercase font-mono tracking-wider font-bold mb-2">Tarefas Gerais</span>
            {totalTasks === 0 ? (
              <span className="text-[10px] text-zinc-500 italic block py-4 text-center">Sem dados de tarefas</span>
            ) : (
              <div className="flex items-end justify-around h-16 pt-2">
                {[
                  { label: 'A Fazer', val: pendingTasks, color: 'bg-amber-500', labelShort: 'Fazer' },
                  { label: 'Feitas', val: completedTasks, color: 'bg-emerald-500', labelShort: 'Feito' },
                  { label: 'Outras', val: otherTasksCount, color: 'bg-indigo-500', labelShort: 'Outro' },
                  { label: 'Total', val: totalTasks, color: 'bg-zinc-500', labelShort: 'Total' }
                ].map(bar => (
                  <div key={bar.label} className="flex flex-col items-center gap-1 group relative">
                    <div className="absolute bottom-full mb-1 px-1.5 py-0.5 rounded bg-zinc-950 text-white text-[8px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-bold shadow-md">
                      {bar.label}: {bar.val}
                    </div>
                    <div className="w-4 bg-zinc-200/20 dark:bg-white/5 rounded-t-md h-12 flex items-end overflow-hidden">
                      <div 
                        className={`w-full rounded-t-sm ${bar.color}`} 
                        style={{ height: `${(bar.val / totalTasks) * 100}%` }}
                      />
                    </div>
                    <span className="text-[8px] font-bold text-zinc-400 select-none">{bar.labelShort}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Col 2: Active Contexts */}
          <div className="bg-zinc-200/10 dark:bg-white/[0.02] border border-zinc-200/40 dark:border-white/5 p-3 rounded-xl flex flex-col justify-between">
            <span className="text-[9px] text-zinc-450 uppercase font-mono tracking-wider font-bold mb-2">Contextos Ativos</span>
            {Object.keys(contextCounts).length === 0 ? (
              <span className="text-[10px] text-zinc-500 italic block py-4 text-center">Nenhum contexto</span>
            ) : (
              <div className="flex items-end justify-around h-16 pt-2">
                {(() => {
                  const maxCtx = Math.max(...Object.values(contextCounts), 1);
                  const icons: { [key: string]: string } = {
                    '@computador': '💻',
                    '@online': '🌐',
                    '@rua': '🚶',
                    '@casa': '🏠',
                    '@trabalhando': '💼',
                    '@mestrado': '🎓',
                    '@programando': '⚡',
                    '@aguardando': '⏳'
                  };
                  return Object.entries(contextCounts).slice(0, 5).map(([ctx, count]) => (
                    <div key={ctx} className="flex flex-col items-center gap-1 group relative">
                      <div className="absolute bottom-full mb-1 px-1.5 py-0.5 rounded bg-zinc-950 text-white text-[8px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-bold shadow-md">
                        {ctx}: {count}
                      </div>
                      <div className="w-4 bg-zinc-200/20 dark:bg-white/5 rounded-t-md h-12 flex items-end overflow-hidden">
                        <div 
                          className="w-full rounded-t-sm bg-bujo-accent" 
                          style={{ height: `${(count / maxCtx) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] select-none" title={ctx}>{icons[ctx] || '🏷️'}</span>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>

          {/* Col 3: Icon Categories (Themes) */}
          <div className="bg-zinc-200/10 dark:bg-white/[0.02] border border-zinc-200/40 dark:border-white/5 p-3 rounded-xl flex flex-col justify-between">
            <span className="text-[9px] text-zinc-450 uppercase font-mono tracking-wider font-bold mb-2">Categorias Ativas</span>
            {Object.keys(categoryCounts).length === 0 ? (
              <span className="text-[10px] text-zinc-500 italic block py-4 text-center">Nenhuma categoria</span>
            ) : (
              <div className="flex items-end justify-around h-16 pt-2">
                {(() => {
                  const maxCat = Math.max(...Object.values(categoryCounts), 1);
                  return Object.entries(categoryCounts).slice(0, 5).map(([icon, count]) => {
                    const bujoIcon = BUJO_ICONS.find(i => i.emoji === icon);
                    const name = bujoIcon ? bujoIcon.name : '';
                    return (
                      <div key={icon} className="flex flex-col items-center gap-1 group relative">
                        <div className="absolute bottom-full mb-1 px-1.5 py-0.5 rounded bg-zinc-950 text-white text-[8px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-bold shadow-md">
                          {name || 'Item'}: {count}
                        </div>
                        <div className="w-4 bg-zinc-200/20 dark:bg-white/5 rounded-t-md h-12 flex items-end overflow-hidden">
                          <div 
                            className="w-full rounded-t-sm bg-bujo-highlight" 
                            style={{ height: `${(count / maxCat) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] select-none">{icon}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* Col 4: Delegation Summary */}
          <div className="bg-zinc-200/10 dark:bg-white/[0.02] border border-zinc-200/40 dark:border-white/5 p-3 rounded-xl flex flex-col justify-between">
            <span className="text-[9px] text-zinc-450 uppercase font-mono tracking-wider font-bold mb-2">Delegados</span>
            {Object.keys(delegateCounts).length === 0 ? (
              <span className="text-[10px] text-zinc-500 italic block py-4 text-center">Sem delegações</span>
            ) : (
              <div className="flex items-end justify-around h-16 pt-2">
                {(() => {
                  const maxDel = Math.max(...Object.values(delegateCounts), 1);
                  return Object.entries(delegateCounts).slice(0, 5).map(([name, count]) => (
                    <div key={name} className="flex flex-col items-center gap-1 group relative">
                      <div className="absolute bottom-full mb-1 px-1.5 py-0.5 rounded bg-zinc-950 text-white text-[8px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-bold shadow-md">
                        {name}: {count}
                      </div>
                      <div className="w-4 bg-zinc-200/20 dark:bg-white/5 rounded-t-md h-12 flex items-end overflow-hidden">
                        <div 
                          className="w-full rounded-t-sm bg-red-500/80" 
                          style={{ height: `${(count / maxDel) * 100}%` }}
                        />
                      </div>
                      <span className="text-[8px] font-bold text-zinc-400 select-none max-w-7 truncate" title={name}>
                        {name.substring(0, 3)}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Three-Column Main Dashboard Grid (Fits viewport cleanly) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-start">
        
        {/* Left Area (Lg:col-span-8 flex flex-col gap-4) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Row A: Energy Chart & Habit Tracker side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            <div id="tutorial-energy-chart" className="lg:col-span-7">
              <EnergyChart 
                items={items}
                getHarmonyScore={getHarmonyScore}
                getHarmonyRecommendation={getHarmonyRecommendation}
                showEnergyGuide={showEnergyGuide}
                setShowEnergyGuide={setShowEnergyGuide}
                selectedDate={selectedDate}
              />
            </div>

            {/* Habit Tracker at top for easy accessibility */}
            <div id="tutorial-habit-tracker" className="lg:col-span-5">
              <HabitTracker />
            </div>
          </div>

          {/* Row B: Knowledge Evolution Chart */}
          <div id="tutorial-knowledge-chart">
            <KnowledgeEvolutionChart />
          </div>

          {/* Row C: Menu de Acesso Rápido (Horizontal Grid) */}
          <div className="rounded-3xl bg-zinc-200/20 dark:bg-zinc-900/30 border border-zinc-200/30 dark:border-white/5 p-4">
            <h4 className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-200/20 dark:border-white/5 pb-2 mb-3">
              <Target className="w-3.5 h-3.5 text-bujo-highlight" />
              Menu de Acesso Rápido
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {[
                { tab: 'daily_spread', label: 'Timeline', icon: Sliders },
                { tab: 'weekly_log', label: 'Weekly Log', icon: LayoutGrid },
                { tab: 'monthly_log', label: 'Monthly Log', icon: CalendarDays },
                { tab: 'collections', label: 'Coleções', icon: ListChecks },
                { tab: 'brain_dump', label: 'Brain Dump', icon: Brain },
                { tab: 'dream_board', label: 'Sonhos', icon: Sparkles },
                { tab: 'someday_maybe', label: 'Algum Dia', icon: Cloud },
                { tab: 'trash', label: 'Lixeira', icon: Trash2 }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div 
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab as any)}
                    className="p-2.5 rounded-xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/50 hover:bg-zinc-200/20 dark:hover:bg-white/10 hover:-translate-y-0.5 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1"
                  >
                    <div className="p-1.5 rounded-lg bg-bujo-highlight/10 text-bujo-highlight shrink-0 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-200 block truncate w-full">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Area (Lg:col-span-4) -> Unified Persona & Focus Companion */}
        <div className="lg:col-span-4 h-full flex flex-col justify-between">
          <UserPersonaCard
            userXp={userXp}
            setUserXp={setUserXp}
            currentEnergy={currentEnergy}
            anxietyLevel={anxietyLevel}
            showToast={showToast}
            items={items}
            // Sound engine integration
            soundType={soundType}
            setSoundType={setSoundType}
            toggleAmbientAudio={toggleAmbientAudio}
            ambientPlaying={ambientPlaying}
            ambientVolume={ambientVolume}
            setAmbientVolume={setAmbientVolume}
            // Local AI integration
            aiEngine={aiEngine}
            aiWorkerRef={aiWorkerRef}
            localLLMState={localLLMState}
            getCognitiveLoad={getCognitiveLoad}
          />
        </div>

      </div>
    </div>
  );
};
