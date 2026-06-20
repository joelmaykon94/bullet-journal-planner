import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckSquare, Sparkles, AlertCircle } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';
import { DayTasksModal } from './DayTasksModal';
import { getLocalDateString, getTaskPendingDays } from '../../../utils/plannerUtils';

export const WeeklyLogTab = () => {
  const {
    items,
    selectedDate,
    setSelectedDate,
    setActiveTab
  } = useBujo();

  const [activeModalDay, setActiveModalDay] = useState<string | null>(null);

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

  const todayStr = getLocalDateString();

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
          {weekDays.indexOf(todayStr) === -1 && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="p-1 px-2.5 rounded-lg bg-bujo-highlight text-white text-[10px] font-bold transition-all ml-1"
            >
              Semana Atual
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: 7 days tasks review */}
        <div className="lg:col-span-8 space-y-4 flex flex-col">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-bujo-highlight" />
            Tarefas & Eventos Agendados na Semana
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
            {weekDays.map(dayStr => {
              const dayItems = items.filter(item => item.date === dayStr);
              const dayTasks = dayItems.filter(item => item.type === 'task');
              const dayEvents = dayItems.filter(item => item.type === 'event');
              const isSelected = selectedDate === dayStr;

              return (
                <div
                  key={dayStr}
                  onClick={() => {
                    setSelectedDate(dayStr);
                    setActiveModalDay(dayStr);
                  }}
                  className={`p-4 rounded-3xl border text-left cursor-pointer transition-all flex flex-col justify-between hover:border-bujo-highlight/40 ${
                    isSelected 
                      ? 'bg-zinc-200/40 dark:bg-white/[0.04] border-bujo-highlight/50 shadow-md' 
                      : 'bg-zinc-200/15 dark:bg-white/[0.01] border-zinc-200/30 dark:border-white/5'
                  }`}
                >
                  <div>
                    {/* Day Header */}
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-bujo-highlight">
                        {formatDayName(dayStr)}
                      </span>
                      <span className="text-xl font-bold tracking-tight text-bujo-text">
                        {formatDayNumber(dayStr)}
                      </span>
                    </div>

                    {/* Content logs preview */}
                    <div className="space-y-1.5 mb-4">
                      {dayTasks.slice(0, 3).map(t => {
                        const tPendingDays = t.type === 'task' && (t.status === 'open' || t.status === 'migrated') ? getTaskPendingDays(t.date, t.createdAt) : 0;
                        return (
                        <div key={t.id} className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                          <CheckSquare className={`w-3 h-3 shrink-0 ${t.status === 'completed' ? 'text-emerald-500' : tPendingDays >= 5 ? 'text-amber-500' : 'text-zinc-650'}`} />
                          <span className={`truncate ${t.status === 'completed' ? 'line-through text-zinc-600' : ''}`}>{t.content}</span>
                          {tPendingDays >= 2 && (
                            <span className="text-[8px] font-bold text-amber-500/80 whitespace-nowrap ml-auto shrink-0">{tPendingDays}d</span>
                          )}
                        </div>
                        );
                      })}
                      {dayEvents.slice(0, 2).map(e => (
                        <div key={e.id} className="flex items-center gap-1.5 text-[10px] text-zinc-555">
                          <span className="w-1.5 h-1.5 rounded-full bg-bujo-accent shrink-0"></span>
                          <span className="truncate">{e.content}</span>
                        </div>
                      ))}

                      {dayTasks.length === 0 && dayEvents.length === 0 && (
                        <span className="text-[10px] text-zinc-600 italic block py-2">Sem registros...</span>
                      )}

                      {(dayTasks.length > 3 || dayEvents.length > 2) && (
                        <span className="text-[8px] font-bold text-zinc-500 block">+{dayTasks.length + dayEvents.length - 5} adicionais</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDate(dayStr);
                      setActiveModalDay(dayStr);
                    }}
                    className="text-[9px] font-bold text-bujo-highlight hover:underline self-start mt-auto flex items-center gap-0.5"
                  >
                    Abrir Agenda
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: ADHD Retrospective and Review Section */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-bujo-highlight" />
              Retrospectiva do Ritmo Semanal
            </span>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              O ADHD Journal preza por auto-compaixão. Reserve 5 minutos para olhar a semana passada sem julgamentos. Como foi o foco? O que causou esgotamento cognitivo?
            </p>

            <textarea
              defaultValue={getWeekReviews()}
              onChange={(e) => saveWeekReview(e.target.value)}
              placeholder="O que funcionou melhor essa semana? Onde encontrei fricção? Como adaptar meu ritmo de energia na próxima semana? (Salva automaticamente)..."
              rows={8}
              className="w-full bg-zinc-200/30 dark:bg-white/5 border border-zinc-350/50 dark:border-white/10 rounded-2xl p-4 text-xs text-bujo-text placeholder:text-zinc-600 outline-none focus:border-bujo-highlight/30 resize-none transition-colors"
            />
          </div>

          <div className="mt-4 p-3.5 rounded-2xl bg-bujo-highlight/[0.03] border border-bujo-highlight/15 text-[10px] text-zinc-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-bujo-highlight shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong>Ritmo de Pausa:</strong> Se esta semana foi difícil, experimente usar ciclos de Pomodoro menores (15 minutos de foco / 3 de pausa) na próxima!
            </span>
          </div>
        </div>

      </div>

      <DayTasksModal
        isOpen={activeModalDay !== null}
        onClose={() => setActiveModalDay(null)}
        dateStr={activeModalDay}
      />
    </div>
  );
};
