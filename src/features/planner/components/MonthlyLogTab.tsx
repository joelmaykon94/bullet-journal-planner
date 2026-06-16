import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Calendar as CalendarIcon, CheckSquare, Plus, Search, X } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';
import { DayTasksModal } from './DayTasksModal';
import { BulletItem } from './BulletItem';
import { BUJO_ICONS } from './DailyLogTab';
import { getLocalDateString } from '../../../utils/plannerUtils';
import { DateInput } from '../../../components/common/DateInput';

interface QuickAddFormProps {
  activeCalendarDate: string;
  setActiveCalendarDate: (date: string) => void;
  handleSaveStandardInput: any;
}

const QuickAddForm = ({ activeCalendarDate, setActiveCalendarDate, handleSaveStandardInput }: QuickAddFormProps) => {
  const [inputText, setInputText] = useState('');
  const [inputType, setInputType] = useState<'task' | 'event' | 'note'>('task');
  const [inputIcon, setInputIcon] = useState('');
  const [showIconDropdown, setShowIconDropdown] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [inputTime, setInputTime] = useState('');
  const [energy, setEnergy] = useState(1);
  const [complexity, setComplexity] = useState(1);
  const [executionTime, setExecutionTime] = useState('');

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    handleSaveStandardInput(
      inputText,
      setInputText,
      inputType,
      activeCalendarDate,
      activeCalendarDate,
      inputTime,
      () => {}, // setStandardTime dummy
      inputIcon,
      inputType === 'task' ? energy : undefined,
      inputType === 'task' ? complexity : undefined,
      inputType === 'task' && executionTime ? Number(executionTime) : undefined
    );

    // Reset local states
    setInputText('');
    setInputTime('');
    setInputIcon('');
    setEnergy(1);
    setComplexity(1);
    setExecutionTime('');
    setShowIconDropdown(false);
  };

  const handleClearInputs = () => {
    setInputText('');
    setInputTime('');
    setInputIcon('');
    setEnergy(1);
    setComplexity(1);
    setExecutionTime('');
    setShowIconDropdown(false);
  };

  return (
    <form onSubmit={handleLocalSubmit} className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Type selector */}
        <div className="flex bg-zinc-300/40 dark:bg-zinc-950 p-0.5 rounded border border-zinc-200/40 dark:border-white/5 shrink-0 select-none">
          {(['task', 'event', 'note'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setInputType(t)}
              className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold transition-all cursor-pointer ${
                inputType === t
                  ? 'bg-bujo-highlight text-white'
                  : 'text-zinc-500 hover:text-bujo-text'
              }`}
            >
              {t === 'task' ? '• Tar' : t === 'event' ? '○ Ev' : '- Not'}
            </button>
          ))}
        </div>

        {/* Icon Picker */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowIconDropdown(!showIconDropdown)}
            className="w-6 h-6 rounded bg-zinc-200/30 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 flex items-center justify-center text-xs hover:border-bujo-highlight hover:bg-zinc-200/50 dark:hover:bg-white/10 transition-all cursor-pointer"
            title="Escolher Ícone"
          >
            {inputIcon || '🎨'}
          </button>

          {showIconDropdown && (
            <div className="absolute left-0 top-full mt-1.5 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 w-52 animate-scale-in">
              <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-zinc-200/40 dark:border-white/5">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Ícones</span>
                <div className="flex items-center gap-1">
                  {inputIcon && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputIcon('');
                        setShowIconDropdown(false);
                      }}
                      className="text-[9px] text-red-500 hover:underline font-bold cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowIconDropdown(false)}
                    className="p-0.5 rounded hover:bg-zinc-150 dark:hover:bg-white/10 text-zinc-405 hover:text-bujo-text cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <input
                type="text"
                placeholder="Pesquisar..."
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                className="w-full px-2 py-0.5 mb-1.5 text-[9.5px] rounded bg-zinc-100 dark:bg-zinc-950/40 border border-zinc-250 dark:border-white/10 text-bujo-text placeholder-zinc-500 outline-none"
              />
              <div className="grid grid-cols-5 gap-1 max-h-32 overflow-y-auto">
                {BUJO_ICONS.filter(icon => 
                  icon.name.toLowerCase().includes(iconSearch.toLowerCase()) || 
                  icon.tooltip.toLowerCase().includes(iconSearch.toLowerCase())
                ).map(icon => (
                  <button
                    key={icon.emoji}
                    type="button"
                    onClick={() => {
                      setInputIcon(icon.emoji);
                      setShowIconDropdown(false);
                      setIconSearch('');
                    }}
                    className={`w-7 h-7 flex items-center justify-center rounded text-sm hover:bg-zinc-200/40 dark:hover:bg-white/5 transition-all ${
                      inputIcon === icon.emoji ? 'bg-bujo-highlight/20 border border-bujo-highlight' : ''
                    }`}
                    title={icon.tooltip}
                  >
                    {icon.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Time picker */}
        <div className="flex items-center gap-1 bg-zinc-300/40 dark:bg-zinc-955 px-1.5 py-0.5 rounded border border-zinc-200/40 dark:border-white/5">
          <span className="text-zinc-500 text-[8.5px] uppercase font-mono">Hora:</span>
          <input
            type="time"
            value={inputTime}
            onChange={(e) => setInputTime(e.target.value)}
            className="bg-transparent border-none text-bujo-text outline-none cursor-pointer text-[9.5px] font-mono py-0 w-14"
          />
        </div>

        {/* Date picker */}
        <div className="flex items-center gap-1 bg-zinc-300/40 dark:bg-zinc-955 px-1.5 py-0.5 rounded border border-zinc-200/40 dark:border-white/5">
          <span className="text-zinc-500 text-[8.5px] uppercase font-mono">Data:</span>
          <DateInput
            value={activeCalendarDate}
            onChange={setActiveCalendarDate}
            inputClassName="text-[9.5px] w-20"
          />
        </div>
      </div>

      <input
        type="text"
        required
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={inputType === 'task' ? "Adicionar tarefa... Use [ para coleções e @ para contextos" : inputType === 'event' ? "Adicionar evento..." : "Adicionar nota..."}
        className="w-full bg-zinc-100 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-white/5 rounded-lg px-2 py-1 text-xs text-bujo-text placeholder-zinc-505 outline-none focus:border-bujo-highlight/50 transition-colors"
      />

      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        {inputType === 'task' && (
          <div className="flex items-center gap-1 bg-zinc-300/40 dark:bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-200/40 dark:border-white/5 text-[9px]">
            <div className="flex items-center gap-0.5">
              <span className="text-zinc-500">Energ:</span>
              <select
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="bg-transparent border-none text-bujo-text outline-none cursor-pointer font-semibold py-0 text-[9px]"
              >
                {[1, 2, 3, 4, 5].map(v => <option key={v} value={v} className="bg-zinc-950 text-white">⚡ {v}</option>)}
              </select>
            </div>
            <div className="w-px h-2.5 bg-zinc-300 dark:bg-white/10" />
            <div className="flex items-center gap-0.5">
              <span className="text-zinc-500">Compl:</span>
              <select
                value={complexity}
                onChange={(e) => setComplexity(Number(e.target.value))}
                className="bg-transparent border-none text-bujo-text outline-none cursor-pointer font-semibold py-0 text-[9px]"
              >
                {[1, 2, 3, 4, 5].map(v => <option key={v} value={v} className="bg-zinc-950 text-white">🧠 {v}</option>)}
              </select>
            </div>
            <div className="w-px h-2.5 bg-zinc-300 dark:bg-white/10" />
            <div className="flex items-center gap-0.5">
              <span className="text-zinc-500">Tempo:</span>
              <input
                type="number"
                min="0"
                placeholder="min"
                value={executionTime}
                onChange={(e) => setExecutionTime(e.target.value)}
                className="bg-transparent border-none text-bujo-text outline-none w-7 font-mono text-[9px] text-center placeholder-zinc-500 font-semibold"
              />
              <span className="text-zinc-500">m</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          {(inputText || inputTime || inputIcon) && (
            <button
              type="button"
              onClick={handleClearInputs}
              className="px-2 py-0.5 bg-zinc-300/40 dark:bg-zinc-900 text-zinc-505 hover:text-bujo-text rounded text-[9.5px] font-bold border border-zinc-200/20 dark:border-white/5 transition-colors cursor-pointer"
            >
              Limpar
            </button>
          )}
          <button
            type="submit"
            className="px-2.5 py-0.5 bg-bujo-highlight text-white rounded text-[9.5px] font-bold hover:opacity-95 transition-opacity cursor-pointer shadow-md shadow-bujo-highlight/10"
          >
            Cadastrar
          </button>
        </div>
      </div>
    </form>
  );
};

export const MonthlyLogTab = () => {
  const {
    items,
    selectedDate,
    setSelectedDate,
    setActiveTab,
    handleSaveStandardInput,
    cycleStatus,
    editingItemId,
    editingItemContent,
    setEditingItemContent,
    handleSaveEditItemForm,
    setEditingItemId,
    handleStartEditItem,
    handleDeleteItem,
    handleAISplitTask,
    breakingTaskIds,
    expandedTaskId,
    setExpandedTaskId,
    toggleSubtask,
    deleteSubtask,
    newSubtaskText,
    setNewSubtaskText,
    addSubtask,
    getSubtaskCompletionString
  } = useBujo();

  const [activeModalDay, setActiveModalDay] = useState<string | null>(null);
  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    const [y, m] = selectedDate.split('-');
    return { year: parseInt(y), month: parseInt(m) - 1 }; // 0-indexed month
  });

  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [activeCalendarDate, setActiveCalendarDate] = useState(selectedDate);
  const [reviewText, setReviewText] = useState('');

  // Sync state with localStorage when the month changes
  useEffect(() => {
    const key = `bujo_monthly_review_${currentYearMonth.year}_${currentYearMonth.month}`;
    setReviewText(localStorage.getItem(key) || '');
  }, [currentYearMonth.year, currentYearMonth.month]);

  // Debounce saving the text to localStorage
  useEffect(() => {
    const key = `bujo_monthly_review_${currentYearMonth.year}_${currentYearMonth.month}`;
    const stored = localStorage.getItem(key) || '';
    if (reviewText !== stored) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(key, reviewText);
      }, 500); // 500ms debounce
      return () => clearTimeout(timeoutId);
    }
  }, [reviewText, currentYearMonth.year, currentYearMonth.month]);

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
          {(() => {
            const today = new Date();
            const isCurrentMonth = currentYearMonth.year === today.getFullYear() && currentYearMonth.month === today.getMonth();
            return !isCurrentMonth && (
              <button
                onClick={() => {
                  const todayDate = new Date();
                  setCurrentYearMonth({ year: todayDate.getFullYear(), month: todayDate.getMonth() });
                  setActiveCalendarDate(getLocalDateString(todayDate));
                }}
                className="p-1 px-2.5 rounded-lg bg-bujo-highlight text-white text-[10px] font-bold transition-all ml-1"
              >
                Mês Atual
              </button>
            );
          })()}
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
                  onDoubleClick={() => {
                    setActiveModalDay(dayStr);
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

              {/* Quick Add Form in Side Panel */}
              <div className="bg-zinc-200/20 dark:bg-zinc-900/30 border border-zinc-250/20 dark:border-white/5 p-3 rounded-2xl mb-3.5 no-print">
                <QuickAddForm
                  activeCalendarDate={activeCalendarDate}
                  setActiveCalendarDate={setActiveCalendarDate}
                  handleSaveStandardInput={handleSaveStandardInput}
                />
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeDateItems.map(item => (
                  <BulletItem
                    key={item.id}
                    item={item}
                    cycleStatus={cycleStatus}
                    editingItemId={editingItemId}
                    editingItemContent={editingItemContent}
                    setEditingItemContent={setEditingItemContent}
                    handleSaveEditItem={handleSaveEditItemForm}
                    setEditingItemId={setEditingItemId}
                    handleStartEditItem={handleStartEditItem}
                    handleDeleteItem={handleDeleteItem}
                    handleAISplitTask={handleAISplitTask}
                    breakingTaskIds={breakingTaskIds}
                    expandedTaskId={expandedTaskId}
                    setExpandedTaskId={setExpandedTaskId}
                    toggleSubtask={toggleSubtask}
                    deleteSubtask={deleteSubtask}
                    newSubtaskText={newSubtaskText}
                    setNewSubtaskText={setNewSubtaskText}
                    addSubtask={(taskId, icon, mins) => addSubtask(taskId, newSubtaskText, setNewSubtaskText, icon, mins)}
                    getSubtaskCompletionString={getSubtaskCompletionString}
                  />
                ))}

                {activeDateItems.length === 0 && (
                  <span className="text-xs text-zinc-550 italic block text-center py-6">Nenhum registro para esta data.</span>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4 no-print">
              <button
                onClick={() => {
                  setSelectedDate(activeCalendarDate);
                  setActiveTab('daily_log');
                }}
                className="flex-1 py-2 bg-zinc-200/50 hover:bg-zinc-200/70 dark:bg-white/10 dark:hover:bg-white/15 text-bujo-text font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CalendarIcon className="w-4 h-4" />
                Ir para Diário
              </button>
              <button
                onClick={() => {
                  setSelectedDate(activeCalendarDate);
                  setActiveModalDay(activeCalendarDate);
                }}
                className="flex-1 py-2 bg-bujo-highlight text-white hover:opacity-95 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-bujo-highlight/10"
              >
                <Sparkles className="w-4 h-4" />
                Abrir Agenda
              </button>
            </div>
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
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="O que aprendi de mais valioso sobre minha energia neste mês? Quais objetivos principais eu consegui atacar? (Salva automaticamente)..."
              rows={4}
              className="w-full bg-zinc-200/30 dark:bg-white/5 border border-zinc-350/50 dark:border-white/10 rounded-2xl p-4 text-xs text-bujo-text placeholder:text-zinc-650 outline-none focus:border-bujo-highlight/30 resize-none transition-colors"
            />
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
