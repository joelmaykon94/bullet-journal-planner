import { useState, useEffect } from 'react';
import { Sparkles, Check, Activity, Trash2, Plus, Flame, TrendingUp } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';

interface HabitLog {
  [habitName: string]: {
    [dateStr: string]: boolean;
  };
}

export const HabitTracker = () => {
  const {
    items,
    aiEngine,
    aiWorkerRef,
    localLLMState,
    showToast,
    setUserXp,
    habits,
    setHabits,
    habitLogs: logs,
    toggleHabitDate,
    handleAddHabit,
    handleDeleteHabit
  } = useBujo();

  const [newHabitName, setNewHabitName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Generate 8 days starting from the Sunday of the current week
  const get8DaysFromStartOfWeek = () => {
    const today = new Date();
    const currentDay = today.getDay(); // Sunday is 0, Monday is 1, etc.
    
    // Get Sunday of the current week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    
    const days = [];
    for (let i = 0; i < 8; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const last8Days = get8DaysFromStartOfWeek();

  // Listen to worker messages if running AI analysis
  useEffect(() => {
    const handleWorkerMessage = (e: MessageEvent) => {
      const { type, data } = e.data;
      if (type === 'result' && isAnalyzing) {
        parseAndApplyAISuggestions(data);
      } else if (type === 'error' && isAnalyzing) {
        runSemanticFallbackAnalysis();
      }
    };

    if (aiWorkerRef.current) {
      aiWorkerRef.current.addEventListener('message', handleWorkerMessage);
    }
    return () => {
      if (aiWorkerRef.current) {
        aiWorkerRef.current.removeEventListener('message', handleWorkerMessage);
      }
    };
  }, [isAnalyzing]);

  const parseAndApplyAISuggestions = (text: string) => {
    const list = text
      .split(',')
      .map(h => h.replace(/^[-*•\d.\s]+/, '').trim())
      .filter(h => h.length > 2 && h.length < 30);
    
    if (list.length >= 2) {
      const updated = list.slice(0, 4).map(h => h.charAt(0).toUpperCase() + h.slice(1));
      setHabits(updated);
      showToast('🎯 Hábitos identificados e atualizados pela IA!');
    } else {
      runSemanticFallbackAnalysis();
    }
    setIsAnalyzing(false);
  };

  const runSemanticFallbackAnalysis = () => {
    const taskFrequency: { [key: string]: number } = {};
    items.forEach(item => {
      if (item.type !== 'task') return;
      let content = item.content.toLowerCase().trim();
      content = content.replace(/^\[.*?\]\s*/, ''); // Remove collections
      content = content.replace(/\s+\d+.*$/, '');    // Remove numbers/times
      
      if (content.length > 3) {
        taskFrequency[content] = (taskFrequency[content] || 0) + 1;
      }
    });

    const sorted = Object.entries(taskFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1))
      .filter(name => name.length >= 3);

    const defaults = ['Beber água', 'Estudar', 'Exercício físico', 'Meditar'];
    const finalHabits = sorted.slice(0, 4);

    while (finalHabits.length < 4) {
      const nextDefault = defaults.find(d => !finalHabits.includes(d));
      if (nextDefault) finalHabits.push(nextDefault);
      else break;
    }

    setHabits(finalHabits);
    showToast('💡 Hábitos identificados pela frequência de tarefas!');
    setIsAnalyzing(false);
  };

  const handleAnalyzeHabits = () => {
    setIsAnalyzing(true);
    showToast('IA analisando histórico para extrair hábitos...');

    const taskListString = items
      .filter(i => i.type === 'task')
      .map(i => i.content)
      .slice(0, 40)
      .join(', ');

    if (!taskListString) {
      showToast('Sem tarefas suficientes no histórico. Usando hábitos padrão!');
      setIsAnalyzing(false);
      return;
    }

    const habitsPrompt = `Identifique 4 hábitos recorrentes e importantes (curtos, com 1 a 3 palavras) da seguinte lista de tarefas de um usuário. Responda APENAS os 4 nomes separados por vírgula. Lista de tarefas: ${taskListString}`;

    if (aiEngine === 'local_llm' && localLLMState === 'ready' && aiWorkerRef.current) {
      aiWorkerRef.current.postMessage({
        type: 'generate',
        data: { text: habitsPrompt, maxTokens: 80, mode: 'advise' }
      });
    } else {
      setTimeout(() => {
        runSemanticFallbackAnalysis();
      }, 500);
    }
  };

  const formatDayOfWeek = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'short' }).substring(0, 3).toUpperCase();
  };

  const formatDayNum = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.getDate();
  };

  // Calculations for dashboard
  const todayStr = new Date().toISOString().split('T')[0];
  
  let totalCompletions = 0;
  const maxPossibleCompletions = habits.length * 8;
  
  const habitStats = habits.map(habit => {
    let completedCount = 0;
    last8Days.forEach(dateStr => {
      if (logs[habit]?.[dateStr]) {
        completedCount++;
        totalCompletions++;
      }
    });
    
    // Calculate streak
    let streak = 0;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const habitLogs = logs[habit] || {};
    
    if (habitLogs[todayStr] || habitLogs[yesterdayStr]) {
      const cursor = new Date();
      if (!habitLogs[todayStr]) {
        cursor.setDate(cursor.getDate() - 1);
      }
      while (true) {
        const cursorStr = cursor.toISOString().split('T')[0];
        if (habitLogs[cursorStr]) {
          streak++;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      }
    }
    
    return {
      name: habit,
      completedCount,
      rate: Math.round((completedCount / 8) * 100),
      streak
    };
  });

  const adherenceRate = maxPossibleCompletions > 0 
    ? Math.round((totalCompletions / maxPossibleCompletions) * 100)
    : 0;

  const bestHabit = habitStats.reduce((best, current) => {
    if (!best || current.completedCount > best.completedCount) return current;
    return best;
  }, null as typeof habitStats[0] | null);

  const activeStreaksCount = habitStats.filter(h => h.streak > 0).length;

  return (
    <div className="rounded-3xl bg-zinc-200/20 dark:bg-zinc-900/30 border border-zinc-200/30 dark:border-white/5 p-3 md:p-4 flex flex-col gap-2.5 shadow-xl backdrop-blur-md">
      {/* 1. Header (Title, AI Suggestion) */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-zinc-200/20 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-bujo-highlight" />
          <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest">Rastreador de Hábitos</span>
        </div>

        <button
          type="button"
          onClick={handleAnalyzeHabits}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 text-[9px] font-bold text-bujo-accent hover:text-bujo-highlight transition-all shrink-0 disabled:opacity-50 px-2.5 py-1 rounded-xl bg-bujo-accent/10 hover:bg-bujo-accent/20 border border-bujo-accent/20"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analisando...' : 'Identificar com IA'}
        </button>
      </div>

      {/* 2. New Habit Input Form & Add Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline">Gerenciar Hábitos</span>
        <form onSubmit={(e) => { e.preventDefault(); handleAddHabit(newHabitName); setNewHabitName(''); }} className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Adicionar novo hábito..."
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-zinc-250/20 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 text-bujo-text placeholder-zinc-500 focus:outline-none focus:border-bujo-highlight/50 transition-all flex-1 sm:w-48 font-sans"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-bujo-accent/20 hover:bg-bujo-accent/30 text-bujo-accent border border-bujo-accent/30 flex items-center justify-center transition-all cursor-pointer"
            title="Adicionar Hábito"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </form>
      </div>

      {/* 3. The 8-Day Calendar Tracker Grid */}
      <div className="space-y-3 mt-1">
        {/* Days Header */}
        <div className="grid grid-cols-12 gap-2 text-center items-center">
          <div className="col-span-4 text-[8.5px] font-bold text-zinc-500 text-left uppercase tracking-wider pl-1.5">Hábito</div>
          <div className="col-span-8 grid grid-cols-8 gap-1.5">
            {last8Days.map(d => {
              const isToday = d === todayStr;
              return (
                <div key={d} className={`flex flex-col items-center py-1 rounded-lg ${isToday ? 'bg-bujo-highlight/10 border border-bujo-highlight/30' : ''}`}>
                  <span className={`text-[7.5px] font-bold font-mono ${isToday ? 'text-bujo-highlight' : 'text-zinc-450'}`}>{formatDayOfWeek(d)}</span>
                  <span className={`text-[8.5px] font-black font-mono mt-0.5 ${isToday ? 'text-bujo-highlight' : 'text-zinc-500'}`}>{formatDayNum(d)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habit Rows */}
        <div className="space-y-2">
          {habits.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-400 italic">
              Nenhum hábito cadastrado. Adicione um acima!
            </div>
          ) : (
            habits.map(habit => (
              <div key={habit} className="grid grid-cols-12 gap-2 items-center group/habit py-1.5 hover:bg-zinc-200/10 dark:hover:bg-white/3 rounded-2xl px-1.5 transition-all">
                <div className="col-span-4 flex items-center justify-between min-w-0 pr-1">
                  <span className="text-xs text-bujo-text font-semibold truncate leading-tight" title={habit}>
                    {habit}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteHabit(habit)}
                    className="opacity-0 group-hover/habit:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-all ml-1 cursor-pointer"
                    title="Excluir hábito"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="col-span-8 grid grid-cols-8 gap-1.5 justify-items-center">
                  {last8Days.map(dateStr => {
                    const isChecked = logs[habit]?.[dateStr] || false;
                    const isToday = dateStr === todayStr;
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => toggleHabitDate(habit, dateStr)}
                        className={`w-6 h-6 rounded-full border transition-all flex items-center justify-center relative cursor-pointer ${
                          isChecked
                            ? 'bg-bujo-accent border-bujo-accent text-white shadow-sm shadow-bujo-accent/20 hover:opacity-95'
                            : isToday
                            ? 'bg-zinc-100/50 dark:bg-white/5 border-bujo-highlight text-bujo-highlight hover:border-bujo-highlight/70 shadow-sm'
                            : 'bg-zinc-150 dark:bg-white/5 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10'
                        }`}
                      >
                        {isChecked ? (
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : isToday ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-bujo-highlight animate-pulse absolute" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Dashboard de Comportamento dos Hábitos */}
      <div className="mt-2 border-t border-zinc-200/10 dark:border-white/5 pt-2.5">
        <h4 className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest flex items-center gap-1.5 mb-3.5">
          <TrendingUp className="w-3.5 h-3.5 text-bujo-highlight" />
          Dashboard de Comportamento dos Hábitos
        </h4>
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-3 gap-2 mb-2.5">
          <div className="p-2 rounded-2xl bg-zinc-200/10 dark:bg-white/3 border border-zinc-200/30 dark:border-white/5 flex flex-col items-center text-center justify-center">
            <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-wider">Adesão Geral</span>
            <span className="text-sm font-black text-bujo-highlight font-mono mt-0.5">{adherenceRate}%</span>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-bujo-highlight h-full rounded-full transition-all" style={{ width: `${adherenceRate}%` }}></div>
            </div>
          </div>
          
          <div className="p-2 rounded-2xl bg-zinc-200/10 dark:bg-white/3 border border-zinc-200/30 dark:border-white/5 flex flex-col items-center text-center justify-center">
            <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-wider">Mais Consistente</span>
            <span className="text-[10px] font-bold text-zinc-150 truncate w-full mt-0.5 text-ellipsis overflow-hidden" title={bestHabit?.name || 'Nenhum'}>
              {bestHabit && bestHabit.completedCount > 0 ? bestHabit.name : 'Nenhum'}
            </span>
            <span className="text-[7px] text-zinc-400 font-mono mt-0.5">
              {bestHabit && bestHabit.completedCount > 0 ? `${bestHabit.completedCount}/8 dias` : '0 concluído'}
            </span>
          </div>

          <div className="p-2 rounded-2xl bg-zinc-200/10 dark:bg-white/3 border border-zinc-200/30 dark:border-white/5 flex flex-col items-center text-center justify-center">
            <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-wider">Sequências Ativas</span>
            <span className="text-sm font-black text-emerald-500 flex items-center gap-1 mt-0.5">
              <Flame className="w-3.5 h-3.5 fill-amber-500/20 text-amber-500 stroke-[2]" />
              {activeStreaksCount}
            </span>
            <span className="text-[7px] text-zinc-400 mt-0.5">hábitos em foco</span>
          </div>
        </div>

        {/* Detailed Habit Performance Bars */}
        <div className="space-y-2.5">
          {habits.length === 0 ? (
            <div className="text-center py-4 text-xs text-zinc-500 italic">
              Sem dados disponíveis. Adicione hábitos para iniciar o gráfico de desempenho.
            </div>
          ) : (
            habitStats.map(stat => (
              <div key={stat.name} className="flex flex-col gap-1.5 p-1.5 rounded-2xl bg-zinc-200/5 dark:bg-white/2 border border-zinc-200/20 dark:border-white/2">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-semibold text-zinc-100 truncate w-2/3">{stat.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {stat.streak > 0 && (
                      <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-lg shrink-0">
                        <Flame className="w-3 h-3 fill-amber-500/10" />
                        {stat.streak}d
                      </span>
                    )}
                    <span className="text-[9.5px] font-mono text-zinc-400">{stat.rate}% ({stat.completedCount}/8d)</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      stat.rate > 70 ? 'bg-emerald-500' : stat.rate > 40 ? 'bg-bujo-highlight' : 'bg-red-500/80'
                    }`}
                    style={{ width: `${stat.rate}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
