import { Target, Brain, Sliders, ListChecks, LayoutGrid, CalendarDays } from 'lucide-react';
import { EnergyChart } from '../../adhd/components/EnergyChart';
import { HabitTracker } from './HabitTracker';
import { UserPersonaCard } from './UserPersonaCard';
import { BujoItem } from '../../../types';

interface IndexTabProps {
  userXp: number;
  setUserXp: React.Dispatch<React.SetStateAction<number>>;
  setActiveTab: (tab: any) => void;
  setShowTutorial: (show: boolean) => void;
  items: BujoItem[];
  completedPomodoros: number;
  getCognitiveLoad: () => number;
  getHarmonyScore: () => number | null;
  getHarmonyRecommendation: (score: number | null) => string;
  showEnergyGuide: boolean;
  setShowEnergyGuide: (show: boolean) => void;
  selectedDate: string;
  onOverloadReliefClick: () => void;
  aiEngine: 'local_llm' | 'local';
  aiWorkerRef: React.MutableRefObject<Worker | null>;
  localLLMState: string;
  showToast: (msg: string) => void;
  currentEnergy: 'high' | 'low' | 'exhausted';
  anxietyLevel: number;
  // Audio controls from Focus Partner
  soundType: 'chuva_lareira' | 'lofi_jazz' | 'foco_marrom' | 'vento_floresta';
  setSoundType: (type: 'chuva_lareira' | 'lofi_jazz' | 'foco_marrom' | 'vento_floresta') => void;
  toggleAmbientAudio: () => void;
  ambientPlaying: boolean;
  ambientVolume: number;
  setAmbientVolume: (volume: number) => void;
}

export const IndexTab = ({
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
  onOverloadReliefClick,
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
}: IndexTabProps) => {
  const level = Math.floor(userXp / 100) + 1;
  const currentLevelXp = userXp % 100;
  const cognitiveLoad = getCognitiveLoad();

  // Metrics calculation
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = items.filter(i => i.date === today && i.type === 'task');
  const completedToday = todayTasks.filter(i => i.status === 'completed').length;
  const completionRate = todayTasks.length === 0 ? 0 : Math.round((completedToday / todayTasks.length) * 100);

  return (
    <div className="flex flex-col gap-4 animate-fade-in no-print max-w-7xl mx-auto p-1 h-full select-none font-mono">
      
      {/* 1. Welcomer Banner & KPI Metrics (Merged for space saving) */}
      <div className="p-4 rounded-3xl bg-zinc-200/20 dark:bg-zinc-900/30 border border-zinc-200/30 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Welcome Text + XP Bar */}
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[9px] uppercase font-bold text-bujo-highlight tracking-widest leading-none">
            Central de Foco Neuro-Adaptativa
          </span>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-1.5 leading-tight">
            Olá! Vamos organizar a mente hoje?
          </h2>
          <div className="flex items-center gap-2 mt-1 bg-white/5 px-2.5 py-1 rounded-xl border border-white/5 w-60">
            <span className="text-[9px] font-bold text-bujo-highlight shrink-0">Lvl {level}</span>
            <div className="flex-1 bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden relative">
              <div className="bg-bujo-highlight h-full rounded-full transition-all duration-300" style={{ width: `${currentLevelXp}%` }}></div>
            </div>
            <span className="text-[8px] text-zinc-400 font-mono shrink-0">{currentLevelXp}/100 XP</span>
          </div>
        </div>

        {/* Compact Metrics Row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Carga Cognitiva */}
          <div 
            onClick={onOverloadReliefClick}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/40 cursor-pointer transition-all flex flex-col justify-center text-center min-w-[95px]"
            title="Clique para Alívio Cognitivo IA"
          >
            <span className="text-[8px] font-bold text-zinc-550 uppercase tracking-wider">Carga</span>
            <span className={`text-xs font-black mt-0.5 ${cognitiveLoad > 70 ? 'text-red-500 animate-pulse' : cognitiveLoad > 40 ? 'text-amber-500' : 'text-emerald-500'}`}>{cognitiveLoad}%</span>
          </div>

          {/* Completude */}
          <div className="px-3.5 py-1.5 rounded-xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 flex flex-col justify-center text-center min-w-[95px]">
            <span className="text-[8px] font-bold text-zinc-550 uppercase tracking-wider">Progresso</span>
            <span className="text-xs font-black mt-0.5 text-zinc-100">{completionRate}%</span>
          </div>

          {/* Tempo Foco */}
          <div className="px-3.5 py-1.5 rounded-xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 flex flex-col justify-center text-center min-w-[95px]">
            <span className="text-[8px] font-bold text-zinc-550 uppercase tracking-wider">Tempo Foco</span>
            <span className="text-xs font-black mt-0.5 text-zinc-150">{completedPomodoros * 25}m</span>
          </div>

          {/* Bujo Action buttons */}
          <div className="flex gap-1.5 pl-1 shrink-0">
            <button 
              onClick={() => setActiveTab('daily_log')}
              className="px-3 py-1.5 bg-bujo-highlight text-white text-[9px] font-bold rounded-lg hover:opacity-95 transition-opacity cursor-pointer"
            >
              Diário Bujo
            </button>
            <button 
              onClick={() => setShowTutorial(true)}
              className="px-3 py-1.5 bg-zinc-350/20 dark:bg-white/10 text-[9px] font-bold rounded-lg hover:bg-zinc-300/40 dark:hover:bg-white/20 transition-colors cursor-pointer"
            >
              Onboarding
            </button>
          </div>
        </div>
      </div>

      {/* 2. Three-Column Main Dashboard Grid (Fits viewport cleanly) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-start">
        
        {/* Left Area (Lg:col-span-8 flex flex-col gap-4) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Row A: Energy Chart & Quick Access tools side by side */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            <div className="md:col-span-8">
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
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-bujo-highlight" />
                Menu de Acesso Rápido
              </h4>
              <div className="grid grid-cols-2 gap-2 flex-1 items-stretch">
                <div 
                  onClick={() => setActiveTab('daily_spread')}
                  className="p-2.5 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/40 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <Sliders className="w-4 h-4 text-bujo-highlight" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-zinc-200 block">Timeline</span>
                    <span className="text-[8px] text-zinc-500 leading-tight block">Foco no Tempo</span>
                  </div>
                </div>
                
                <div 
                  onClick={() => setActiveTab('weekly_log')}
                  className="p-2.5 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/40 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <LayoutGrid className="w-4 h-4 text-bujo-highlight" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-zinc-200 block">Weekly Log</span>
                    <span className="text-[8px] text-zinc-500 leading-tight block">Revisão Semanal</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('monthly_log')}
                  className="p-2.5 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/40 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <CalendarDays className="w-4 h-4 text-bujo-highlight" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-zinc-200 block">Monthly Log</span>
                    <span className="text-[8px] text-zinc-500 leading-tight block">Revisão Mensal</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('collections')}
                  className="p-2.5 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/40 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <ListChecks className="w-4 h-4 text-bujo-highlight" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-zinc-200 block">Listas</span>
                    <span className="text-[8px] text-zinc-500 leading-tight block">Por Contexto</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('brain_dump')}
                  className="col-span-2 p-2.5 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/40 cursor-pointer transition-all flex items-center gap-3"
                >
                  <Brain className="w-4 h-4 text-bujo-highlight shrink-0" />
                  <div className="text-left space-y-0.5">
                    <span className="text-[10px] font-bold text-zinc-200 block leading-tight">Despejo de Mente</span>
                    <span className="text-[8px] text-zinc-500 block leading-tight">Descarregar pensamentos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row B: Habit Tracker */}
          <HabitTracker
            items={items}
            aiEngine={aiEngine}
            aiWorkerRef={aiWorkerRef}
            localLLMState={localLLMState}
            showToast={showToast}
          />
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
