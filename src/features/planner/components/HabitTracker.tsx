import { useState, useEffect } from 'react';
import { Sparkles, Check, CheckCircle2, Activity } from 'lucide-react';
import { BujoItem } from '../../../types';

interface HabitTrackerProps {
  items: BujoItem[];
  aiEngine: 'local_llm' | 'local';
  aiWorkerRef: React.MutableRefObject<Worker | null>;
  localLLMState: string;
  showToast: (msg: string) => void;
}

interface HabitLog {
  [habitName: string]: {
    [dateStr: string]: boolean;
  };
}

export const HabitTracker = ({
  items,
  aiEngine,
  aiWorkerRef,
  localLLMState,
  showToast
}: HabitTrackerProps) => {
  const [habits, setHabits] = useState<string[]>(() => {
    const saved = localStorage.getItem('bujo_habits');
    if (saved) return JSON.parse(saved);
    return ['Beber água', 'Estudar', 'Exercício físico', 'Meditar'];
  });

  const [logs, setLogs] = useState<HabitLog>(() => {
    const saved = localStorage.getItem('bujo_habit_logs');
    if (saved) return JSON.parse(saved);
    return {};
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    localStorage.setItem('bujo_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('bujo_habit_logs', JSON.stringify(logs));
  }, [logs]);

  // Generate the last 7 days (from today backwards)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();

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
    // text is expected to be a comma-separated list of habits
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
        data: { text: habitsPrompt, maxTokens: 80 }
      });
    } else {
      setTimeout(() => {
        runSemanticFallbackAnalysis();
      }, 500);
    }
  };

  const toggleHabitDate = (habit: string, dateStr: string) => {
    setLogs(prev => {
      const habitLogs = prev[habit] || {};
      const currentVal = habitLogs[dateStr] || false;
      return {
        ...prev,
        [habit]: {
          ...habitLogs,
          [dateStr]: !currentVal
        }
      };
    });
  };

  const formatDayOfWeek = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'short' }).substring(0, 3).toUpperCase();
  };

  const formatDayNum = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.getDate();
  };

  return (
    <div className="rounded-3xl bg-zinc-200/20 dark:bg-zinc-900/30 border border-zinc-200/30 dark:border-white/5 p-4 flex flex-col gap-3.5">
      <div className="flex items-center justify-between flex-wrap border-b border-zinc-200/20 dark:border-white/5 pb-2">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-bujo-highlight" />
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Rastreador de Hábitos</span>
        </div>

        <button
          type="button"
          onClick={handleAnalyzeHabits}
          disabled={isAnalyzing}
          className="flex items-center gap-1 text-[9px] font-bold text-bujo-accent hover:text-bujo-highlight transition-colors shrink-0 disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analisando...' : 'Identificar com IA'}
        </button>
      </div>

      <div className="space-y-3.5">
        {/* Days Header */}
        <div className="grid grid-cols-12 gap-2 text-center items-center">
          <div className="col-span-5 text-[8.5px] font-bold text-zinc-500 text-left uppercase tracking-wider pl-1">Hábito</div>
          <div className="col-span-7 grid grid-cols-7 gap-1">
            {last7Days.map(d => (
              <div key={d} className="flex flex-col items-center">
                <span className="text-[7px] font-bold text-zinc-450 font-mono">{formatDayOfWeek(d)}</span>
                <span className="text-[8.5px] font-bold text-zinc-500 font-mono mt-0.5">{formatDayNum(d)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Habit Rows */}
        <div className="space-y-2.5">
          {habits.map(habit => (
            <div key={habit} className="grid grid-cols-12 gap-2 items-center">
              <span className="col-span-5 text-[11px] text-bujo-text truncate font-medium pr-1" title={habit}>
                {habit}
              </span>
              <div className="col-span-7 grid grid-cols-7 gap-1 justify-items-center">
                {last7Days.map(dateStr => {
                  const isChecked = logs[habit]?.[dateStr] || false;
                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => toggleHabitDate(habit, dateStr)}
                      className={`w-5.5 h-5.5 rounded-full border transition-all flex items-center justify-center ${
                        isChecked
                          ? 'bg-bujo-accent border-bujo-accent text-white hover:opacity-95'
                          : 'bg-zinc-150 dark:bg-white/5 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
