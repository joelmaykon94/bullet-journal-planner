import { Calendar, ChevronLeft, ChevronRight, CheckSquare, Sparkles, AlertCircle } from 'lucide-react';
import { BujoItem } from '../../../types';

interface WeeklyLogTabProps {
  items: BujoItem[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  setActiveTab: (tab: 'indice' | 'daily_log' | 'daily_spread' | 'future_log' | 'brain_dump' | 'settings' | 'collections' | 'weekly_log' | 'monthly_log') => void;
}

export const WeeklyLogTab = ({
  items,
  selectedDate,
  setSelectedDate,
  setActiveTab
}: WeeklyLogTabProps) => {
  // Calculate the days of the current week (Monday to Sunday) based on selectedDate
  const getWeekDays = (baseDateStr: string) => {
    const baseDate = new Date(baseDateStr + 'T00:00:00');
    const day = baseDate.getDay();
    // Monday is index 0
    const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(baseDate.setDate(diff));
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const weekDays = getWeekDays(selectedDate);
  
  // Format range string: e.g. "15 Jun - 21 Jun, 2026"
  const formatDateRange = () => {
    const start = new Date(weekDays[0] + 'T00:00:00');
    const end = new Date(weekDays[6] + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `${start.toLocaleDateString('pt-BR', options)} - ${end.toLocaleDateString('pt-BR', options)}, ${start.getFullYear()}`;
  };

  // Move week forward/backward
  const navigateWeek = (direction: 'prev' | 'next') => {
    const date = new Date(selectedDate + 'T00:00:00');
    date.setDate(date.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDayName = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  };

  const formatDayNumber = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.getDate();
  };

  const getWeekReviews = () => {
    const saved = localStorage.getItem(`bujo_weekly_review_${weekDays[0]}`);
    return saved || '';
  };

  const saveWeekReview = (text: string) => {
    localStorage.setItem(`bujo_weekly_review_${weekDays[0]}`, text);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200/50 dark:border-white/10 pb-4 gap-4">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest">PLANO & AVALIAÇÃO DE RITMO</span>
          <h3 className="text-3xl font-light">
            Weekly Log — <span className="italic font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Revisão Semanal</span>
          </h3>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-2 bg-zinc-200/30 dark:bg-white/5 p-1 rounded-2xl border border-zinc-200/40 dark:border-white/10 no-print">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 rounded-xl hover:bg-zinc-200/50 dark:hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold px-3 font-mono text-bujo-text">
            {formatDateRange()}
          </span>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 rounded-xl hover:bg-zinc-200/50 dark:hover:bg-white/5 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7-Day Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDays.map(dateStr => {
          const dayItems = items.filter(i => i.date === dateStr);
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          const isSelected = dateStr === selectedDate;

          return (
            <div
              key={dateStr}
              onClick={() => {
                setSelectedDate(dateStr);
                setActiveTab('daily_log');
              }}
              className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col gap-3 min-h-[180px] hover:-translate-y-0.5 ${
                isToday
                  ? 'bg-bujo-highlight/10 border-bujo-highlight/40 shadow-lg shadow-bujo-highlight/5'
                  : isSelected
                  ? 'bg-zinc-200/35 dark:bg-white/10 border-bujo-accent/40'
                  : 'bg-zinc-200/15 dark:bg-white/5 border-zinc-200/30 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10'
              }`}
            >
              <div className="flex items-baseline justify-between border-b border-zinc-200/40 dark:border-white/5 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {formatDayName(dateStr)}
                </span>
                <span className={`text-lg font-bold font-mono ${isToday ? 'text-bujo-highlight' : 'text-bujo-text'}`}>
                  {formatDayNumber(dateStr)}
                </span>
              </div>

              <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[150px] pr-0.5">
                {dayItems.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center gap-1.5 text-[10px] min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      item.status === 'completed'
                        ? 'bg-emerald-500'
                        : item.type === 'event'
                        ? 'bg-bujo-accent'
                        : 'bg-zinc-400'
                    }`} />
                    <span className={`truncate ${item.status === 'completed' ? 'line-through opacity-45' : 'text-zinc-650 dark:text-zinc-300'}`}>
                      {item.content}
                    </span>
                  </div>
                ))}
                {dayItems.length > 5 && (
                  <div className="text-[9px] text-zinc-450 italic pl-3">
                    + {dayItems.length - 5} mais
                  </div>
                )}
                {dayItems.length === 0 && (
                  <div className="text-[9px] text-zinc-500 italic py-4 text-center">Vazio</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reflection and Review Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Weekly stats and partner advice */}
        <div className="lg:col-span-1 rounded-3xl bg-zinc-200/20 dark:bg-zinc-900/30 border border-zinc-200/30 dark:border-white/5 p-6 space-y-4">
          <h4 className="text-sm font-bold text-bujo-text flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-bujo-highlight" /> Resumo de Foco da Semana
          </h4>
          
          {(() => {
            const weekTasks = items.filter(i => weekDays.includes(i.date) && i.type === 'task');
            const completed = weekTasks.filter(i => i.status === 'completed').length;
            const completionPct = weekTasks.length > 0 ? Math.round((completed / weekTasks.length) * 100) : 0;

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-200/30 dark:bg-white/5 p-3 rounded-2xl text-center border border-zinc-200/40 dark:border-white/10">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Tarefas</span>
                    <span className="text-2xl font-bold font-mono text-bujo-highlight">{completed}/{weekTasks.length}</span>
                  </div>
                  <div className="bg-zinc-200/30 dark:bg-white/5 p-3 rounded-2xl text-center border border-zinc-200/40 dark:border-white/10">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Conclusão</span>
                    <span className="text-2xl font-bold font-mono text-emerald-500">{completionPct}%</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-zinc-650 dark:text-zinc-300 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Dica Cognitiva (TDAH):</span>
                  </div>
                  <p className="leading-relaxed text-[11px]">
                    Revisar a semana nos ajuda a fixar nossas vitórias na memória de trabalho. Celebre o que deu certo e não se julgue pelas tarefas migradas. A flexibilidade é essencial!
                  </p>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Review Editor */}
        <div className="lg:col-span-2 rounded-3xl bg-zinc-200/20 dark:bg-zinc-900/30 border border-zinc-200/30 dark:border-white/5 p-6 flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-bold text-bujo-text flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-bujo-accent" /> Notas e Reflexão Semanal
            </h4>
            <p className="text-[10px] text-zinc-500 mt-1">Como foi seu ritmo energético? O que te distraiu? Escreva livremente.</p>
          </div>

          <textarea
            defaultValue={getWeekReviews()}
            onChange={(e) => saveWeekReview(e.target.value)}
            placeholder="Exemplo: Fui muito produtivo nas manhãs de terça e quarta. Quinta tive um crash forte pós-almoço e precisei de mais descanso. Para a próxima semana, vou agendar as tarefas complexas exclusivamente antes das 12h..."
            className="flex-1 min-h-[150px] w-full bg-zinc-200/30 dark:bg-white/5 border border-zinc-250 dark:border-white/10 rounded-2xl p-4 text-xs text-bujo-text placeholder:text-zinc-500 outline-none focus:border-bujo-highlight/30 resize-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
