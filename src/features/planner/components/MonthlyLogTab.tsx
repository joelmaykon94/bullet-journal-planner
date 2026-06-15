import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Calendar as CalendarIcon, CheckSquare, Plus } from 'lucide-react';
import { BujoItem } from '../../../types';

interface MonthlyLogTabProps {
  items: BujoItem[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  setActiveTab: (tab: 'indice' | 'daily_log' | 'daily_spread' | 'future_log' | 'brain_dump' | 'settings' | 'collections' | 'weekly_log' | 'monthly_log') => void;
}

export const MonthlyLogTab = ({
  items,
  selectedDate,
  setSelectedDate,
  setActiveTab
}: MonthlyLogTabProps) => {
  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    // Extract YYYY-MM from selectedDate
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
    // Sunday is 0, Monday is 1, ..., Saturday is 6
    let firstDayIndex = date.getDay();
    // Adjust to Monday start (Monday = 0, ..., Sunday = 6)
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

  const getMonthlyReview = () => {
    const key = `bujo_monthly_review_${currentYearMonth.year}_${currentYearMonth.month + 1}`;
    return localStorage.getItem(key) || '';
  };

  const saveMonthlyReview = (text: string) => {
    const key = `bujo_monthly_review_${currentYearMonth.year}_${currentYearMonth.month + 1}`;
    localStorage.setItem(key, text);
  };

  const selectedDayItems = items.filter(i => i.date === activeCalendarDate);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200/50 dark:border-white/10 pb-4 gap-4">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest">REVISÃO & CALENDÁRIO VISUAL</span>
          <h3 className="text-3xl font-light">
            Monthly Log — <span className="italic font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Revisão Mensal</span>
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
          <span className="text-xs font-bold px-3 font-mono text-bujo-text min-w-[120px] text-center">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid Container */}
        <div className="lg:col-span-2 rounded-3xl bg-zinc-200/15 dark:bg-white/[0.01] border border-zinc-200/30 dark:border-white/5 p-6 space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] uppercase text-zinc-450 tracking-wider mb-2">
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
            <div>Dom</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayStr, index) => {
              if (!dayStr) {
                return <div key={`empty-${index}`} className="aspect-square opacity-0 pointer-events-none" />;
              }

              const isToday = dayStr === new Date().toISOString().split('T')[0];
              const isSelected = dayStr === activeCalendarDate;
              const dayNum = parseInt(dayStr.split('-')[2]);
              const dayItems = items.filter(i => i.date === dayStr);
              const hasTasks = dayItems.some(i => i.type === 'task');
              const hasEvents = dayItems.some(i => i.type === 'event');

              return (
                <button
                  key={dayStr}
                  onClick={() => setActiveCalendarDate(dayStr)}
                  onMouseEnter={() => setHoveredDate(dayStr)}
                  onMouseLeave={() => setHoveredDate(null)}
                  className={`aspect-square p-2 rounded-2xl border transition-all flex flex-col justify-between items-center relative hover:scale-105 ${
                    isToday
                      ? 'bg-bujo-highlight/10 border-bujo-highlight/40 shadow shadow-bujo-highlight/5'
                      : isSelected
                      ? 'bg-bujo-accent/15 border-bujo-accent/50 text-bujo-accent font-bold'
                      : 'bg-zinc-200/15 dark:bg-white/5 border-zinc-200/30 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10'
                  }`}
                >
                  <span className={`text-xs font-mono font-bold ${isToday ? 'text-bujo-highlight' : 'text-bujo-text'}`}>
                    {dayNum}
                  </span>

                  {/* Indicators */}
                  <div className="flex gap-1">
                    {hasTasks && (
                      <span className="w-1.5 h-1.5 rounded-full bg-bujo-highlight" />
                    )}
                    {hasEvents && (
                      <span className="w-1.5 h-1.5 rounded-full bg-bujo-accent" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Sidebar and Details */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-3xl bg-zinc-200/35 dark:bg-white/5 border border-zinc-200/40 dark:border-white/10 flex flex-col min-h-[350px]">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center justify-between border-b border-zinc-200/40 dark:border-white/5 pb-2">
              <span>Foco do Dia</span>
              <span className="text-[10px] font-mono text-zinc-400">
                {new Date(activeCalendarDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
              </span>
            </h4>

            {/* Tasks / events list */}
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[280px] pr-1">
              {selectedDayItems.map(item => (
                <div key={item.id} className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      item.status === 'completed'
                        ? 'bg-emerald-500'
                        : item.type === 'event'
                        ? 'bg-bujo-accent'
                        : 'bg-zinc-400'
                    }`} />
                    <span className={`truncate ${item.status === 'completed' ? 'line-through opacity-50' : 'text-bujo-text font-medium'}`}>
                      {item.content}
                    </span>
                  </div>
                  {item.time && (
                    <span className="text-[9px] font-mono text-zinc-500 shrink-0">{item.time}</span>
                  )}
                </div>
              ))}

              {selectedDayItems.length === 0 && (
                <p className="text-xs text-zinc-500 italic text-center py-12">Sem tarefas ou compromissos.</p>
              )}
            </div>

            <button
              onClick={() => {
                setSelectedDate(activeCalendarDate);
                setActiveTab('daily_log');
              }}
              className="mt-4 w-full py-2.5 bg-bujo-highlight text-white hover:opacity-95 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-bujo-highlight/10 cursor-pointer"
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Ir para o Daily Log
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Review Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Monthly metrics summary */}
        <div className="lg:col-span-1 rounded-3xl bg-zinc-200/20 dark:bg-zinc-900/30 border border-zinc-200/30 dark:border-white/5 p-6 space-y-4">
          <h4 className="text-sm font-bold text-bujo-text flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-bujo-highlight" /> Estatísticas Mensais
          </h4>

          {(() => {
            // Filter tasks that belong to the current year/month
            const currentYearMonthPrefix = `${currentYearMonth.year}-${(currentYearMonth.month + 1).toString().padStart(2, '0')}`;
            const monthTasks = items.filter(i => i.date.startsWith(currentYearMonthPrefix) && i.type === 'task');
            const completed = monthTasks.filter(i => i.status === 'completed').length;
            const completionPct = monthTasks.length > 0 ? Math.round((completed / monthTasks.length) * 100) : 0;

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-200/30 dark:bg-white/5 p-3 rounded-2xl text-center border border-zinc-200/40 dark:border-white/10">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Registradas</span>
                    <span className="text-2xl font-bold font-mono text-bujo-highlight">{monthTasks.length}</span>
                  </div>
                  <div className="bg-zinc-200/30 dark:bg-white/5 p-3 rounded-2xl text-center border border-zinc-200/40 dark:border-white/10">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Taxa Reg.</span>
                    <span className="text-2xl font-bold font-mono text-emerald-500">{completionPct}%</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-zinc-650 dark:text-zinc-300">
                  <p className="leading-relaxed text-[11px] italic">
                    "O Monthly Log serve para revisar metas e migrar tarefas que perderam a relevância, aliviando a carga mental no TDAH. Pratique a autocompaixão ao descartar tarefas obsoletas."
                  </p>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Notes Editor */}
        <div className="lg:col-span-2 rounded-3xl bg-zinc-200/20 dark:bg-zinc-900/30 border border-zinc-200/30 dark:border-white/5 p-6 flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-bold text-bujo-text flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-bujo-accent" /> Registro de Metas e Revisão Mensal
            </h4>
            <p className="text-[10px] text-zinc-500 mt-1">Reflita sobre os maiores ganhos e aprendizados deste mês.</p>
          </div>

          <textarea
            key={`${currentYearMonth.year}-${currentYearMonth.month}`}
            defaultValue={getMonthlyReview()}
            onChange={(e) => saveMonthlyReview(e.target.value)}
            placeholder="Exemplo: Consegui manter um bom foco nos projetos criativos. O hiperfoco funcionou bem, mas preciso melhorar meu ritmo nos dias de baixa energia. Metas para o próximo mês..."
            className="flex-1 min-h-[150px] w-full bg-zinc-200/30 dark:bg-white/5 border border-zinc-250 dark:border-white/10 rounded-2xl p-4 text-xs text-bujo-text placeholder:text-zinc-500 outline-none focus:border-bujo-highlight/30 resize-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
