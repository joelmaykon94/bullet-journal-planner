import { Target, Brain, Sliders, ListChecks, LayoutGrid, CalendarDays, Sparkles, Cloud, Trash2 } from 'lucide-react';
import { EnergyChart } from '../../adhd/components/EnergyChart';
import { HabitTracker } from './HabitTracker';
import { UserPersonaCard } from './UserPersonaCard';
import { KnowledgeEvolutionChart } from '../../education/components/KnowledgeEvolutionChart';
import { useBujo } from '../../../context/BujoContext';
import { BUJO_ICONS } from './DailyLogTab';

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
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = items.filter(i => i.date === today && i.type === 'task');
  const completedToday = todayTasks.filter(i => i.status === 'completed').length;
  const completionRate = todayTasks.length === 0 ? 0 : Math.round((completedToday / todayTasks.length) * 100);

  // General task statistics
  const totalTasks = items.filter(i => i.type === 'task').length;
  const pendingTasks = items.filter(i => i.type === 'task' && i.status !== 'completed' && i.status !== 'cancelled').length;
  const completedTasks = items.filter(i => i.type === 'task' && i.status === 'completed').length;

  // Context counts
  const contexts = ['@computador', '@online', '@rua', '@casa', '@trabalhando', '@mestrado', '@programando', '@aguardando'];
  const contextCounts = contexts.reduce((acc, ctx) => {
    const count = items.filter(item => item.content.toLowerCase().includes(ctx)).length;
    if (count > 0) acc[ctx] = count;
    return acc;
  }, {} as { [key: string]: number });

  // Delegated counts
  const delegatedCount = items.filter(item => item.delegatedTo).length;

  // Icon / Theme counts
  const themeCounts = ['dinheiro', 'familia', 'saude', 'arte', 'ideia'].reduce((acc, cat) => {
    const matchingEmojis = BUJO_ICONS.filter(i => i.name === cat || i.tooltip.toLowerCase().includes(cat)).map(i => i.emoji);
    const count = items.filter(item => item.icon && matchingEmojis.includes(item.icon)).length;
    if (count > 0) acc[cat] = count;
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
                onClick={() => setActiveTab('daily_log')}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Col 1: Overview */}
          <div className="bg-zinc-200/10 dark:bg-white/[0.02] border border-zinc-200/40 dark:border-white/5 p-2.5 rounded-xl flex flex-col justify-between">
            <span className="text-[9px] text-zinc-400 uppercase font-mono tracking-wider font-bold">Tarefas Gerais</span>
            <div className="flex items-center justify-between mt-1.5 text-[10.5px]">
              <span className="text-zinc-500">A fazer: <strong className="text-zinc-200">{pendingTasks}</strong></span>
              <span className="text-zinc-500">Feitas: <strong className="text-emerald-500">{completedTasks}</strong></span>
              <span className="text-zinc-555">Total: <strong className="text-zinc-400">{totalTasks}</strong></span>
            </div>
          </div>

          {/* Col 2: Active Contexts */}
          <div className="bg-zinc-200/10 dark:bg-white/[0.02] border border-zinc-200/40 dark:border-white/5 p-2.5 rounded-xl flex flex-col justify-between">
            <span className="text-[9px] text-zinc-400 uppercase font-mono tracking-wider font-bold">Contextos Ativos</span>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {Object.keys(contextCounts).length === 0 ? (
                <span className="text-[10px] text-zinc-500 italic">Nenhum contexto ativo</span>
              ) : (
                Object.entries(contextCounts).map(([ctx, count]) => {
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
                  return (
                    <span key={ctx} className="bg-zinc-250/50 dark:bg-white/5 border border-zinc-300/30 dark:border-white/5 px-1.5 py-0.5 rounded text-[9.5px] font-bold text-zinc-300">
                      {icons[ctx] || ''}{ctx.replace('@', '')} ({count})
                    </span>
                  );
                })
              )}
            </div>
          </div>

          {/* Col 3: Icon Categories (Themes) */}
          <div className="bg-zinc-200/10 dark:bg-white/[0.02] border border-zinc-200/40 dark:border-white/5 p-2.5 rounded-xl flex flex-col justify-between">
            <span className="text-[9px] text-zinc-400 uppercase font-mono tracking-wider font-bold">Categorias Bujo</span>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {Object.keys(themeCounts).length === 0 ? (
                <span className="text-[10px] text-zinc-500 italic">Nenhuma categoria ativa</span>
              ) : (
                Object.entries(themeCounts).map(([cat, count]) => {
                  const label = cat === 'dinheiro' ? '💰 Finan' :
                                cat === 'familia' ? '👨‍👩‍👧‍👦 Fam' :
                                cat === 'saude' ? '🩺 Saúde' :
                                cat === 'arte' ? '🎨 Arte' : '💡 Ideia';
                  return (
                    <span key={cat} className="bg-zinc-250/50 dark:bg-white/5 border border-zinc-300/30 dark:border-white/5 px-1.5 py-0.5 rounded text-[9.5px] font-bold text-zinc-300">
                      {label} ({count})
                    </span>
                  );
                })
              )}
            </div>
          </div>

          {/* Col 4: Delegation Summary */}
          <div className="bg-zinc-200/10 dark:bg-white/[0.02] border border-zinc-200/40 dark:border-white/5 p-2.5 rounded-xl flex flex-col justify-between">
            <span className="text-[9px] text-zinc-400 uppercase font-mono tracking-wider font-bold">Delegado</span>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-[10.5px] text-zinc-500">Tarefas Delegadas:</span>
              <span className="bg-bujo-highlight/15 text-bujo-highlight border border-bujo-highlight/30 px-2 py-0.5 rounded-full text-[9.5px] font-black">
                👥 {delegatedCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Three-Column Main Dashboard Grid (Fits viewport cleanly) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-start">
        
        {/* Left Area (Lg:col-span-8 flex flex-col gap-4) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Row A: Energy Chart & Quick Access tools side by side */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            <div id="tutorial-energy-chart" className="md:col-span-8">
              <EnergyChart 
                items={items}
                getHarmonyScore={getHarmonyScore}
                getHarmonyRecommendation={getHarmonyRecommendation}
                showEnergyGuide={showEnergyGuide}
                setShowEnergyGuide={setShowEnergyGuide}
                selectedDate={selectedDate}
              />
            </div>

            {/* Quick Access Tools Grid */}
            <div className="md:col-span-4 rounded-3xl bg-zinc-200/20 dark:bg-zinc-900/30 border border-zinc-200/30 dark:border-white/5 p-4 flex flex-col gap-3 h-full justify-between">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-200/20 dark:border-white/5 pb-2">
                <Target className="w-3.5 h-3.5 text-bujo-highlight" />
                Menu de Acesso Rápido
              </h4>
              <div className="flex flex-col gap-2 flex-1 justify-between mt-1.5">
                <div 
                  onClick={() => setActiveTab('daily_spread')}
                  className="p-2 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/50 hover:bg-zinc-200/20 dark:hover:bg-white/10 hover:-translate-y-0.5 shadow-sm hover:shadow-[0_0_15px_rgba(224,142,69,0.15)] cursor-pointer transition-all flex items-center gap-3"
                >
                  <div className="p-1.5 rounded-xl bg-bujo-highlight/10 text-bujo-highlight shrink-0 flex items-center justify-center">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-tight">
                    <span className="text-[10px] font-bold text-zinc-200 block">Timeline</span>
                    <span className="text-[8px] text-zinc-550 block">Foco e Organização no Tempo</span>
                  </div>
                </div>
                
                <div 
                  onClick={() => setActiveTab('weekly_log')}
                  className="p-2 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/50 hover:bg-zinc-200/20 dark:hover:bg-white/10 hover:-translate-y-0.5 shadow-sm hover:shadow-[0_0_15px_rgba(224,142,69,0.15)] cursor-pointer transition-all flex items-center gap-3"
                >
                  <div className="p-1.5 rounded-xl bg-bujo-highlight/10 text-bujo-highlight shrink-0 flex items-center justify-center">
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-tight">
                    <span className="text-[10px] font-bold text-zinc-200 block">Weekly Log</span>
                    <span className="text-[8px] text-zinc-550 block">Revisão Semanal de Foco</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('monthly_log')}
                  className="p-2 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/50 hover:bg-zinc-200/20 dark:hover:bg-white/10 hover:-translate-y-0.5 shadow-sm hover:shadow-[0_0_15px_rgba(224,142,69,0.15)] cursor-pointer transition-all flex items-center gap-3"
                >
                  <div className="p-1.5 rounded-xl bg-bujo-highlight/10 text-bujo-highlight shrink-0 flex items-center justify-center">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-tight">
                    <span className="text-[10px] font-bold text-zinc-200 block">Monthly Log</span>
                    <span className="text-[8px] text-zinc-550 block">Revisão Mensal e Metas</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('collections')}
                  className="p-2 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/50 hover:bg-zinc-200/20 dark:hover:bg-white/10 hover:-translate-y-0.5 shadow-sm hover:shadow-[0_0_15px_rgba(224,142,69,0.15)] cursor-pointer transition-all flex items-center gap-3"
                >
                  <div className="p-1.5 rounded-xl bg-bujo-highlight/10 text-bujo-highlight shrink-0 flex items-center justify-center">
                    <ListChecks className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-tight">
                    <span className="text-[10px] font-bold text-zinc-200 block">Listas</span>
                    <span className="text-[8px] text-zinc-550 block">Coleções e Contextos</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('brain_dump')}
                  className="p-2 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/50 hover:bg-zinc-200/20 dark:hover:bg-white/10 hover:-translate-y-0.5 shadow-sm hover:shadow-[0_0_15px_rgba(224,142,69,0.15)] cursor-pointer transition-all flex items-center gap-3"
                >
                  <div className="p-1.5 rounded-xl bg-bujo-highlight/10 text-bujo-highlight shrink-0 flex items-center justify-center">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-tight">
                    <span className="text-[10px] font-bold text-zinc-200 block">Despejo de Mente</span>
                    <span className="text-[8px] text-zinc-550 block">Descarregar Ansiedade</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('dream_board')}
                  className="p-2 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/50 hover:bg-zinc-200/20 dark:hover:bg-white/10 hover:-translate-y-0.5 shadow-sm hover:shadow-[0_0_15px_rgba(224,142,69,0.15)] cursor-pointer transition-all flex items-center gap-3"
                >
                  <div className="p-1.5 rounded-xl bg-bujo-highlight/10 text-bujo-highlight shrink-0 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-tight">
                    <span className="text-[10px] font-bold text-zinc-200 block">Quadro dos Sonhos</span>
                    <span className="text-[8px] text-zinc-550 block">Mentalizar e Conquistar</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('someday_maybe')}
                  className="p-2 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/50 hover:bg-zinc-200/20 dark:hover:bg-white/10 hover:-translate-y-0.5 shadow-sm hover:shadow-[0_0_15px_rgba(224,142,69,0.15)] cursor-pointer transition-all flex items-center gap-3"
                >
                  <div className="p-1.5 rounded-xl bg-bujo-highlight/10 text-bujo-highlight shrink-0 flex items-center justify-center">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-tight">
                    <span className="text-[10px] font-bold text-zinc-200 block">Algum Dia</span>
                    <span className="text-[8px] text-zinc-550 block">Ideias e Planos GTD</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('trash')}
                  className="p-2 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/50 hover:bg-zinc-200/20 dark:hover:bg-white/10 hover:-translate-y-0.5 shadow-sm hover:shadow-[0_0_15px_rgba(224,142,69,0.15)] cursor-pointer transition-all flex items-center gap-3"
                >
                  <div className="p-1.5 rounded-xl bg-bujo-highlight/10 text-bujo-highlight shrink-0 flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-tight">
                    <span className="text-[10px] font-bold text-zinc-200 block">Lixeira</span>
                    <span className="text-[8px] text-zinc-550 block">Itens Excluídos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

           {/* Row B: Knowledge Evolution Chart */}
           <div id="tutorial-knowledge-chart">
             <KnowledgeEvolutionChart />
           </div>

           {/* Row C: Habit Tracker */}
           <div id="tutorial-habit-tracker">
             <HabitTracker />
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
