import { useState } from 'react';
import { Target, Brain, Sliders, ListChecks, LayoutGrid, CalendarDays, Sparkles, Cloud, Trash2, X, GraduationCap, Zap, Activity, Shield } from 'lucide-react';
import { EnergyChart } from '../../adhd/components/EnergyChart';
import { HabitTracker } from './HabitTracker';
import { UserPersonaCard } from './UserPersonaCard';
import { KnowledgeEvolutionChart } from '../../education/components/KnowledgeEvolutionChart';
import { useBujo } from '../../../context/BujoContext';
import { BUJO_ICONS } from '../../../utils/constants';
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

  // Modal states for dashboard cards
  const [activeModal, setActiveModal] = useState<'knowledge' | 'energy' | 'habits' | 'focus' | null>(null);

  const level = Math.floor(userXp / 100) + 1;
  const currentLevelXp = userXp % 100;
  const cognitiveLoad = getCognitiveLoad();

  // Metrics calculation
  const today = getLocalDateString();
  // For today's metrics, exclude migrated tasks (they are just records of tasks forwarded to today)
  const todayTasks = items.filter(i => i.date === today && i.type === 'task' && i.status !== 'migrated');
  const completedToday = todayTasks.filter(i => i.status === 'completed').length;
  const completionRate = todayTasks.length === 0 ? 0 : Math.round((completedToday / todayTasks.length) * 100);

  // General task statistics — exclude 'migrated' tasks to avoid double-counting.
  // Migrated tasks are historical records; the real copy lives on the day it was migrated to.
  const activeTasks = items.filter(i => i.type === 'task' && i.status !== 'migrated');
  const totalTasks = activeTasks.length;
  const pendingTasks = activeTasks.filter(i => i.status === 'open').length;
  const completedTasks = activeTasks.filter(i => i.status === 'completed').length;
  const otherTasksCount = activeTasks.filter(i => i.status !== 'open' && i.status !== 'completed').length;

  // Context counts — only count active (non-migrated) tasks
  const contextCounts = activeTasks.reduce((acc, item) => {
    const matches = item.content.match(/@([a-zA-ZÀ-ÿ0-9_-]+)/g);
    if (matches) {
      matches.forEach(ctx => {
        const c = ctx.toLowerCase();
        acc[c] = (acc[c] || 0) + 1;
      });
    }
    return acc;
  }, {} as { [key: string]: number });

  // Delegated counts — only count active (non-migrated) tasks
  const delegateCounts = activeTasks.reduce((acc, item) => {
    if (item.delegatedTo) {
      const name = item.delegatedTo;
      acc[name] = (acc[name] || 0) + 1;
    }
    return acc;
  }, {} as { [key: string]: number });
  const delegatedTotalCount = activeTasks.filter(item => item.delegatedTo).length;

  // Icon / Category counts — only count active (non-migrated) tasks
  const categoryCounts = activeTasks.reduce((acc, item) => {
    if (item.icon) {
      acc[item.icon] = (acc[item.icon] || 0) + 1;
    }
    return acc;
  }, {} as { [key: string]: number });

  return (
    <div className="flex flex-col gap-4 animate-fade-in no-print max-w-7xl mx-auto p-1 w-full h-full select-none font-mono overflow-x-hidden">
      
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
                  return Object.entries(contextCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([ctx, count]) => (
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
                  return Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([icon, count]) => {
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
                  return Object.entries(delegateCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => (
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

      {/* 2. Menu de Acesso Rápido (Full width) - Moved to top */}
      <div className="rounded-3xl bg-zinc-200/20 dark:bg-zinc-900/30 border border-zinc-200/30 dark:border-white/5 p-4 w-full">
        <h4 className="text-[10px] font-bold text-zinc-555 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-200/20 dark:border-white/5 pb-2 mb-3">
          <Target className="w-3.5 h-3.5 text-bujo-highlight" />
          Menu de Acesso Rápido
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {[
            { tab: 'daily_spread', label: 'Agenda Diária', icon: Sliders },
            { tab: 'weekly_log', label: 'Log Semanal', icon: LayoutGrid },
            { tab: 'monthly_log', label: 'Log Mensal', icon: CalendarDays },
            { tab: 'collections', label: 'Coleções', icon: ListChecks },
            { tab: 'brain_dump', label: 'Despejo de Mente', icon: Brain },
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

      {/* 3. Dashboard Cards Grid — replaces full-width scrollable sections */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        {/* Card: Evolução Acadêmica */}
        <button
          id="tutorial-knowledge-chart"
          onClick={() => setActiveModal('knowledge')}
          className="group p-4 rounded-2xl bg-zinc-200/10 dark:bg-zinc-900/40 border border-zinc-200/30 dark:border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2.5 min-h-[120px]"
        >
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-100 block">Evolução Acadêmica</span>
            <span className="text-[9px] text-zinc-500 block mt-0.5">Progresso de estudos e XP</span>
          </div>
        </button>

        {/* Card: Ritmo Energético */}
        <button
          id="tutorial-energy-chart"
          onClick={() => setActiveModal('energy')}
          className="group p-4 rounded-2xl bg-zinc-200/10 dark:bg-zinc-900/40 border border-zinc-200/30 dark:border-white/5 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2.5 min-h-[120px]"
        >
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-100 block">Ritmo Energético</span>
            <span className="text-[9px] text-zinc-500 block mt-0.5">Curva de foco TDAH</span>
          </div>
        </button>

        {/* Card: Rastreador de Hábitos */}
        <button
          id="tutorial-habit-tracker"
          onClick={() => setActiveModal('habits')}
          className="group p-4 rounded-2xl bg-zinc-200/10 dark:bg-zinc-900/40 border border-zinc-200/30 dark:border-white/5 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2.5 min-h-[120px]"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-100 block">Rastreador de Hábitos</span>
            <span className="text-[9px] text-zinc-500 block mt-0.5">Streak e consistência</span>
          </div>
        </button>

        {/* Card: Guia de Foco */}
        <button
          onClick={() => setActiveModal('focus')}
          className="group p-4 rounded-2xl bg-zinc-200/10 dark:bg-zinc-900/40 border border-zinc-200/30 dark:border-white/5 hover:border-red-500/40 hover:bg-red-500/5 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2.5 min-h-[120px]"
        >
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 group-hover:scale-110 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-100 block">Guia de Foco</span>
            <span className="text-[9px] text-zinc-500 block mt-0.5">Persona, áudio e IA</span>
          </div>
        </button>
      </div>

      {/* Full-screen Modals for each card */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 no-print">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setActiveModal(null)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-[20px] md:rounded-[28px] shadow-3xl overflow-hidden flex flex-col max-h-[88vh] animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-zinc-900/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg border ${
                  activeModal === 'knowledge' ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' :
                  activeModal === 'energy' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                  activeModal === 'habits' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                  'bg-red-500/15 text-red-400 border-red-500/30'
                }`}>
                  {activeModal === 'knowledge' && <GraduationCap className="w-4 h-4" />}
                  {activeModal === 'energy' && <Zap className="w-4 h-4" />}
                  {activeModal === 'habits' && <Activity className="w-4 h-4" />}
                  {activeModal === 'focus' && <Shield className="w-4 h-4" />}
                </div>
                <h3 className="text-sm font-extrabold text-white tracking-tight">
                  {activeModal === 'knowledge' && 'Evolução Acadêmica'}
                  {activeModal === 'energy' && 'Ritmo Energético TDAH'}
                  {activeModal === 'habits' && 'Rastreador de Hábitos'}
                  {activeModal === 'focus' && 'Guia de Foco & Persona'}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-2.5 md:p-4">
              {activeModal === 'knowledge' && <KnowledgeEvolutionChart />}
              {activeModal === 'energy' && (
                <EnergyChart
                  items={items}
                  getHarmonyScore={getHarmonyScore}
                  getHarmonyRecommendation={getHarmonyRecommendation}
                  showEnergyGuide={showEnergyGuide}
                  setShowEnergyGuide={setShowEnergyGuide}
                  selectedDate={selectedDate}
                />
              )}
              {activeModal === 'habits' && <HabitTracker />}
              {activeModal === 'focus' && (
                <UserPersonaCard
                  userXp={userXp}
                  setUserXp={setUserXp}
                  currentEnergy={currentEnergy}
                  anxietyLevel={anxietyLevel}
                  showToast={showToast}
                  items={items}
                  soundType={soundType}
                  setSoundType={setSoundType}
                  toggleAmbientAudio={toggleAmbientAudio}
                  ambientPlaying={ambientPlaying}
                  ambientVolume={ambientVolume}
                  setAmbientVolume={setAmbientVolume}
                  aiEngine={aiEngine}
                  aiWorkerRef={aiWorkerRef}
                  localLLMState={localLLMState}
                  getCognitiveLoad={getCognitiveLoad}
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
