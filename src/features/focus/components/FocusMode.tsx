import { Play, Pause, RotateCcw, Activity, Check } from 'lucide-react';
import { BujoItem } from '../../../types';

interface FocusModeProps {
  pomodoroTime: number;
  pomodoroRunning: boolean;
  pomodoroMode: 'work' | 'break';
  setPomodoroRunning: (running: boolean) => void;
  setPomodoroTime: (time: number) => void;
  items: BujoItem[];
  cycleStatus: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  currentMaxQuote: string;
  handleAskMaxForQuote: () => void;
}

export const FocusMode = ({
  pomodoroTime,
  pomodoroRunning,
  pomodoroMode,
  setPomodoroRunning,
  setPomodoroTime,
  items,
  cycleStatus,
  toggleSubtask,
  currentMaxQuote,
  handleAskMaxForQuote
}: FocusModeProps) => {
  const hourNum = new Date().getHours();
  const currentTasks = items.filter(item => {
    if (!item.time) return false;
    return parseInt(item.time.split(':')[0]) === hourNum;
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 py-6 max-w-3xl mx-auto w-full animate-fade-in">
      {/* Left side: Pomodoro Clock */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl w-full">
        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 ${
          pomodoroMode === 'work' ? 'bg-bujo-highlight/10 text-bujo-highlight' : 'bg-bujo-accent/10 text-bujo-accent'
        }`}>
          {pomodoroMode === 'work' ? 'Foco de Trabalho' : 'Pausa para Descanso'}
        </span>

        {/* Timer text */}
        <div className="text-7xl font-mono font-bold tracking-tight mb-8">
          {Math.floor(pomodoroTime / 60).toString().padStart(2, '0')}
          <span className="animate-pulse">:</span>
          {(pomodoroTime % 60).toString().padStart(2, '0')}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPomodoroRunning(!pomodoroRunning)}
            className="p-4 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors flex items-center justify-center"
            aria-label={pomodoroRunning ? 'Pausar Pomodoro' : 'Iniciar Pomodoro'}
          >
            {pomodoroRunning ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
          </button>
          <button
            onClick={() => {
              setPomodoroRunning(false);
              setPomodoroTime(pomodoroMode === 'work' ? 25 * 60 : 5 * 60);
            }}
            className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center border border-white/10"
            aria-label="Reiniciar Pomodoro"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Right side: Current Hour Tasks */}
      <div className="flex-1 flex flex-col justify-center gap-4 w-full">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
          <Activity className="w-4 h-4" />
          Bloco de Horário Atual
        </h3>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-bujo-highlight/10 border-l-4 border-l-bujo-highlight flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-bujo-highlight">
              {hourNum.toString().padStart(2, '0')}:00 - {(hourNum + 1).toString().padStart(2, '0')}:00
            </span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">AGORA</span>
          </div>

          <div className="space-y-2">
            {currentTasks.map(task => (
              <div 
                key={task.id}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => cycleStatus(task.id)}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      task.status === 'completed' ? 'bg-white border-white text-black' : 'border-white/30'
                    }`}
                  >
                    {task.status === 'completed' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <span className={`text-base ${task.status === 'completed' ? 'line-through opacity-50' : ''}`}>
                    {task.content}
                  </span>
                </div>

                {/* Subtasks rendering inside focus mode */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="pl-8 space-y-1.5 border-l border-white/10">
                    {task.subtasks.map(sub => (
                      <div key={sub.id} className="flex items-center gap-2 text-xs">
                        <button
                          onClick={() => toggleSubtask(task.id, sub.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            sub.completed ? 'bg-white border-white text-black' : 'border-white/20'
                          }`}
                        >
                          {sub.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </button>
                        <span className={sub.completed ? 'line-through opacity-40' : 'text-zinc-300'}>
                          {sub.content}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {currentTasks.length === 0 && (
              <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/5 text-center text-zinc-500 italic text-sm">
                Sem tarefas agendadas para esta hora. Foco concluído!
              </div>
            )}
          </div>

          {/* Focus Partner Max - Body Double Card */}
          <div className="mt-4 p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg relative overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent text-bujo-text">
            <div className="absolute top-0 right-0 w-24 h-24 bg-bujo-highlight/5 rounded-full blur-xl pointer-events-none -mr-8 -mt-8"></div>
            
            <div className="flex gap-4 items-start relative z-10">
              {/* Companion Avatar */}
              <div className="w-12 h-12 rounded-2xl bg-bujo-highlight/10 border border-bujo-highlight/20 flex items-center justify-center text-2xl flex-shrink-0 animate-bounce-slow select-none">
                🦊
              </div>
              
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Parceiro de Foco Virtual</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[8px] text-emerald-400 uppercase font-mono">Max está online</span>
                </div>
                <p className="text-sm font-semibold text-zinc-100">
                  Max está focado silenciosamente ao seu lado.
                </p>
                
                {/* Chat bubble advice */}
                <div className="relative mt-2 p-3 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none text-xs text-zinc-300 italic leading-relaxed">
                  "{currentMaxQuote}"
                </div>
                
                <button
                  type="button"
                  onClick={handleAskMaxForQuote}
                  className="mt-2.5 px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/10 text-[10px] font-bold rounded-lg transition-colors text-white"
                >
                  💬 Pedir incentivo ao Max
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
