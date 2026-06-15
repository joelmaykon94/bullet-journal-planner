import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Calendar as CalendarIcon, CheckSquare, Plus } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';

export const MonthlyLogTab = () => {
  const {
    items,
    selectedDate,
    setSelectedDate,
    setActiveTab
  } = useBujo();

  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    const [y, m] = selectedDate.split('-');
    return { year: parseInt(y), month: parseInt(m) - 1 }; // 0-indexed month
  });

  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [activeCalendarDate, setActiveCalendarDate] = useState(selectedDate);

  const monthsList = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Get days in the current month
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    
    // Fill empty slots for days of previous month (Monday start)
    let firstDayIndex = date.getDay();
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    while (date.getMonth() === month) {
      days.push(new Date(date).toISOString().split('T')[0]);
      date.setDate(date.getDate() + 1);
    }

    return days;
  };

  const calendarDays = getDaysInMonth(currentYearMonth.year, currentYearMonth.month);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentYearMonth(prev => {
      let newMonth = prev.month + (direction === 'next' ? 1 : -1);
      let newYear = prev.year;

      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      } else if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }

      return { year: newYear, month: newMonth };
    });
  };

  const getMonthReviewText = () => {
    const key = `bujo_monthly_review_${currentYearMonth.year}_${currentYearMonth.month}`;
    return localStorage.getItem(key) || '';
  };

  const saveMonthReviewText = (text: string) => {
    const key = `bujo_monthly_review_${currentYearMonth.year}_${currentYearMonth.month}`;
    localStorage.setItem(key, text);
  };

  const activeDateItems = items.filter(item => item.date === activeCalendarDate);
  const activeDateTasks = activeDateItems.filter(item => item.type === 'task');
  const activeDateEvents = activeDateItems.filter(item => item.type === 'event');
  const activeDateNotes = activeDateItems.filter(item => item.type === 'note');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200/50 dark:border-white/10 pb-4 gap-4">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest">VISÃO MACRO & ANÁLISE COMPORTAMENTAL</span>
          <h3 className="text-3xl font-light">
            Monthly Log — <span className="italic font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Visão Mensal</span>
          </h3>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-zinc-200/30 dark:bg-white/5 p-1 rounded-2xl border border-zinc-200/40 dark:border-white/10 no-print">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-xl hover:bg-zinc-200/50 dark:hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold px-3 font-mono text-bujo-text w-32 text-center">
            {monthsList[currentYearMonth.month]} {currentYearMonth.year}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-xl hover:bg-zinc-200/50 dark:hover:bg-white/5 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Calendar Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] font-bold text-zinc-550 uppercase tracking-widest py-1 border-b border-zinc-200/30 dark:border-white/5">
            <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((dayStr, idx) => {
              if (dayStr === null) {
                return <div key={`empty-${idx}`} className="aspect-square rounded-2xl bg-transparent"></div>;
              }

              const isToday = new Date().toISOString().split('T')[0] === dayStr;
              const isSelected = activeCalendarDate === dayStr;
              
              const dayItems = items.filter(item => item.date === dayStr);
              const dayTasks = dayItems.filter(item => item.type === 'task');
              const dayCompletedTasks = dayTasks.filter(item => item.status === 'completed');
              const dayEvents = dayItems.filter(item => item.type === 'event');

              const hasItems = dayItems.length > 0;
              const hasUncompleted = dayTasks.length > dayCompletedTasks.length;

              // Render simple visual bullets inside the cell
              return (
                <div
                  key={dayStr}
                  onClick={() => {
                    setActiveCalendarDate(dayStr);
                    setHoveredDate(dayStr);
                  }}
                  onMouseEnter={() => setHoveredDate(dayStr)}
                  className={`aspect-square p-2 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all relative group hover:border-bujo-highlight/40 ${
                    isSelected
                      ? 'bg-zinc-200/40 dark:bg-white/[0.04] border-bujo-highlight/50 shadow-md scale-[1.02]'
                      : isToday
                      ? 'bg-zinc-200/20 dark:bg-white/[0.02] border-zinc-300 dark:border-white/20'
                      : 'bg-zinc-200/10 dark:bg-white/[0.01] border-zinc-200/30 dark:border-white/5'
                  }`}
                >
                  <span className={`text-xs font-mono font-bold self-start ${isToday ? 'text-bujo-highlight' : 'text-zinc-400 group-hover:text-bujo-text'}`}>
                    {dayStr.split('-')[2]}
                  </span>

                  {/* Indicators */}
                  <div className="flex gap-0.5 mt-auto">
                    {dayEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-bujo-accent" title={`${dayEvents.length} Eventos`}></span>
                    )}
                    {dayTasks.length > 0 && (
                      <span className={`w-1.5 h-1.5 rounded-full ${hasUncompleted ? 'bg-amber-500' : 'bg-emerald-500'}`} title={`${dayTasks.length} Tarefas`}></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Day Details & Month Review */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Calendar Day Detail */}
          <div className="p-5 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-baseline border-b border-zinc-200/30 dark:border-white/5 pb-2.5 mb-4">
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">LOG DO DIA SELECIONADO</span>
                <span className="text-xs font-bold font-mono text-bujo-highlight">
                  {new Date(activeCalendarDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </div>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {activeDateTasks.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Tarefas ({activeDateTasks.length})</span>
                    {activeDateTasks.map(t => (
                      <div key={t.id} className="flex items-center gap-2 text-xs text-zinc-400">
                        <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        <span className={t.status === 'completed' ? 'line-through text-zinc-600' : ''}>{t.content}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeDateEvents.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Eventos ({activeDateEvents.length})</span>
                    {activeDateEvents.map(e => (
                      <div key={e.id} className="flex items-center gap-2 text-xs text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-bujo-accent"></span>
                        <span>{e.time ? `[${e.time}] ` : ''}{e.content}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeDateNotes.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Notas ({activeDateNotes.length})</span>
                    {activeDateNotes.map(n => (
                      <div key={n.id} className="flex items-center gap-2 text-xs text-zinc-500 italic">
                        <span>-</span>
                        <span>{n.content}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeDateItems.length === 0 && (
                  <span className="text-xs text-zinc-550 italic block text-center py-6">Nenhum registro para esta data.</span>
                )}
              </div>
            </div>

            {activeDateItems.length > 0 && (
              <button
                onClick={() => {
                  setSelectedDate(activeCalendarDate);
                  setActiveTab('daily_log');
                }}
                className="w-full mt-4 py-2 bg-zinc-200/50 hover:bg-zinc-200/70 dark:bg-white/10 dark:hover:bg-white/15 text-bujo-text font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer no-print"
              >
                <CalendarIcon className="w-4 h-4" />
                Ir para Diário do Dia
              </button>
            )}
          </div>

          {/* Month retrospective */}
          <div className="p-5 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 space-y-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-bujo-highlight" />
              Retrospectiva & Lições do Mês
            </span>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Resumo executivo do mês. Acompanhe se o seu hiperfoco foi direcionado às coleções corretas e se respeitou seus picos de energia.
            </p>

            <textarea
              value={getMonthReviewText()}
              onChange={(e) => saveMonthReviewText(e.target.value)}
              placeholder="O que aprendi de mais valioso sobre minha energia neste mês? Quais objetivos principais eu consegui atacar? (Salva automaticamente)..."
              rows={4}
              className="w-full bg-zinc-200/30 dark:bg-white/5 border border-zinc-350/50 dark:border-white/10 rounded-2xl p-4 text-xs text-bujo-text placeholder:text-zinc-650 outline-none focus:border-bujo-highlight/30 resize-none transition-colors"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
