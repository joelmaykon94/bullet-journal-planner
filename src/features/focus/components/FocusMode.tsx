import { Play, Pause, RotateCcw, Activity, Check } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';

export const FocusMode = () => {
  const {
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
  } = useBujo();

  const hourNum = new Date().getHours();
  const currentTasks = items.filter(item => {
    if (!item.time) return false;
    return parseInt(item.time.split(':')[0]) === hourNum;
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-center justify-center gap-4 md:gap-8 py-2 md:py-6 max-w-3xl mx-auto w-full animate-fade-in overflow-y-auto max-h-full scroll-smooth pr-1">
      {/* Left side: Pomodoro Clock */}
      <div className="flex-1 flex flex-col items-center justify-center p-5 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl w-full">
        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 ${
          pomodoroMode === 'work' ? 'bg-bujo-highlight/10 text-bujo-highlight' : 'bg-bujo-accent/10 text-bujo-accent'
        }`}>
          {pomodoroMode === 'work' ? 'Foco de Trabalho' : 'Pausa para Descanso'}
        </span>

        {/* Timer text */}
        <div className="text-5xl sm:text-6xl md:text-7xl font-mono font-bold tracking-tight mb-4 md:mb-8">
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
            className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center"
            aria-label="Resetar Pomodoro"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Right side: ADHD Assistant (Max) & Current Hour Tasks */}
      <div className="flex-1 flex flex-col gap-4 md:gap-6 w-full">
        {/* Companion Card */}
        <div className="p-4 md:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden flex flex-col gap-3.5 text-left shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label="guaxinim">🦝</span>
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Parceiro de Foco ADHD</h4>
              <span className="text-sm font-bold text-zinc-200 block">Max, o Guaxinim</span>
            </div>
          </div>
          
          <div className="p-4 rounded-2xl bg-zinc-950/40 border border-white/5 text-xs text-zinc-300 italic leading-relaxed relative">
            <span className="absolute -top-2 left-4 text-[9px] font-bold text-bujo-highlight bg-[#121214] px-1.5 rounded font-mono">
              Conselho cognitivo do Max
            </span>
            "{currentMaxQuote}"
          </div>

          <button
            onClick={handleAskMaxForQuote}
            className="w-full py-2 bg-bujo-highlight/20 hover:bg-bujo-highlight/30 text-bujo-highlight border border-bujo-highlight/30 hover:text-white transition-all text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-white"
          >
            <span>💬</span> Pedir ajuda ao Max
          </button>
        </div>

        {/* Hour Tasks Panel */}
        <div className="p-4 md:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg text-left flex-1 flex flex-col min-h-[180px] md:min-h-0">
          <span className="text-xs font-bold text-zinc-450 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-bujo-highlight" />
            Tarefas Pessoais Marcadas para Esta Hora
          </span>

          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 flex-1">
            {currentTasks.map(item => (
              <div 
                key={item.id} 
                className="p-3.5 rounded-2xl bg-zinc-950/20 border border-white/[0.03] hover:border-white/5 transition-all text-xs flex justify-between items-center group"
              >
                <span className={item.status === 'completed' ? 'line-through text-zinc-500' : 'text-zinc-300 font-medium'}>
                  {item.content}
                </span>

                <button
                  onClick={() => cycleStatus(item.id)}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    item.status === 'completed'
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500 hover:bg-emerald-500/20'
                      : 'bg-white/5 border-white/10 text-zinc-450 hover:text-bujo-text'
                  }`}
                  title={item.status === 'completed' ? 'Reabrir tarefa' : 'Concluir tarefa'}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {currentTasks.length === 0 && (
              <div className="py-8 text-center text-zinc-500 italic text-xs">
                Nenhuma tarefa agendada para esta hora.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
