import { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, GripVertical, X, ChevronDown, ChevronUp, CheckCheck } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';
import { BulletItem } from './BulletItem';
import { SortableItem, DragHandle } from '../../../components/common/SortableItem';
import { BUJO_ICONS } from '../../../utils/constants';

export const FutureLogTab = () => {
  const {
    items,
    months,
    selectedMonth,
    setSelectedMonth,
    handleAddFutureEvent,
    handleReorderItems
  } = useBujo();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [inputText, setInputText] = useState('');
  const [inputIcon, setInputIcon] = useState('');
  const [showIconDropdown, setShowIconDropdown] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [energy, setEnergy] = useState(1);
  const [complexity, setComplexity] = useState(1);
  const [executionTime, setExecutionTime] = useState('');
  const [inputType, setInputType] = useState<'task' | 'event' | 'note'>('event');
  const [inputTime, setInputTime] = useState('');

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      handleReorderItems(active.id as string, over.id as string);
    }
  };

  const currentMonthEvents = items.filter(item => {
    if (!item.date || item.date === 'someday_maybe') return false;
    const dateMonth = new Date(item.date + 'T00:00:00').getMonth();
    return dateMonth === selectedMonth;
  });

  const scheduledEvents = currentMonthEvents.filter(item => item.status !== 'completed');
  const completedEvents = currentMonthEvents.filter(item => item.status === 'completed');

  const handleLocalSubmit = (e: React.FormEvent) => {
    handleAddFutureEvent(
      e,
      inputText,
      setInputText,
      inputType,
      inputIcon,
      inputTime,
      energy,
      complexity,
      executionTime ? Number(executionTime) : undefined
    );
    // Reset local states
    setInputIcon('');
    setEnergy(1);
    setComplexity(1);
    setExecutionTime('');
    setInputTime('');
    setShowIconDropdown(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-zinc-200/50 dark:border-white/10 pb-4">
        <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest">METAS E PLANOS</span>
        <h3 className="text-3xl font-light">
          Future Log — <span className="italic font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Visão Anual</span>
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {months.map((month, index) => {
          const isSelected = selectedMonth === index;
          const allMonthItems = items.filter(item => {
            if (!item.date || item.date === 'someday_maybe') return false;
            const dateMonth = new Date(item.date + 'T00:00:00').getMonth();
            return dateMonth === index;
          });
          const scheduledCount = allMonthItems.filter(i => i.status !== 'completed').length;
          const completedCount = allMonthItems.filter(i => i.status === 'completed').length;

          return (
            <div
              key={month}
              onClick={() => setSelectedMonth(index)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2 ${
                isSelected 
                  ? 'bg-bujo-highlight/15 border-bujo-highlight text-bujo-text shadow-md' 
                  : 'bg-zinc-200/10 dark:bg-white/5 border-zinc-200/20 dark:border-white/5 hover:border-zinc-300'
              }`}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider">{month}</h4>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-zinc-400 font-mono">
                  {scheduledCount} agendado{scheduledCount !== 1 ? 's' : ''}
                </span>
                {completedCount > 0 && (
                  <span className="text-[10px] text-emerald-500/80 font-mono flex items-center gap-1">
                    <CheckCheck className="w-2.5 h-2.5" />
                    {completedCount} concluído{completedCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-3xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 flex flex-col md:flex-row gap-6">
        
        <div className="flex-1 space-y-4">
          {/* ── Agendadas ── */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200/40 dark:border-white/5 pb-2 flex items-center justify-between">
              <span>Itens de {months[selectedMonth]}</span>
              <span className="text-[10px] font-mono text-zinc-500 normal-case">
                {scheduledEvents.length} agendado{scheduledEvents.length !== 1 ? 's' : ''}
              </span>
            </h4>
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={scheduledEvents.map(i => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {scheduledEvents.map(ev => (
                      <div key={ev.id} className="flex items-start gap-2 group/sort">
                        <DragHandle id={ev.id} className="mt-4 opacity-0 group-hover/sort:opacity-40 hover:!opacity-100 transition-opacity">
                          <GripVertical className="w-4 h-4 text-zinc-500" />
                        </DragHandle>
                        <SortableItem id={ev.id} className="flex-1">
                          <BulletItem item={ev} />
                        </SortableItem>
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {scheduledEvents.length === 0 && (
                <p className="text-xs text-zinc-500 italic py-2 text-center">Sem itens agendados para este mês.</p>
              )}
            </div>
          </div>

          {/* ── Concluídas ── */}
          {completedEvents.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-500/60 border-b border-emerald-500/20 pb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCheck className="w-4 h-4" />
                  Concluídas
                </span>
                <span className="text-[10px] font-mono normal-case text-emerald-600/60 dark:text-emerald-500/50">
                  {completedEvents.length} item{completedEvents.length !== 1 ? 'ns' : ''}
                </span>
              </h4>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 opacity-60">
                {completedEvents.map(ev => (
                  <div key={ev.id} className="flex items-start gap-2">
                    <BulletItem item={ev} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-80 space-y-3 no-print">
          <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Agendar Novo Item</h4>
          <form onSubmit={handleLocalSubmit} className="space-y-3 bg-zinc-200/20 dark:bg-white/[0.02] p-4 rounded-2xl border border-zinc-300/40 dark:border-white/5">
            <div className="flex bg-zinc-200/50 dark:bg-zinc-950/60 p-0.5 rounded-lg border border-zinc-200/40 dark:border-white/5 justify-between">
              {(['task', 'event', 'note'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setInputType(t)}
                  className={`px-2.5 py-0.5 rounded-md text-[10.5px] font-semibold transition-all cursor-pointer flex-1 text-center ${
                    inputType === t ? 'bg-bujo-highlight text-white shadow-sm' : 'text-zinc-500 hover:text-bujo-text'
                  }`}
                >
                  {t === 'task' ? '• Tarefa' : t === 'event' ? '○ Evento' : '- Nota'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowIconDropdown(!showIconDropdown)}
                  className="w-8 h-8 rounded bg-zinc-200/50 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 flex items-center justify-center text-sm hover:border-bujo-highlight transition-all cursor-pointer"
                >
                  {inputIcon || '🎨'}
                </button>
                {showIconDropdown && (
                  <div className="absolute left-0 top-full mt-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl shadow-2xl z-50 w-52 animate-scale-in">
                    <input
                      type="text"
                      placeholder="Pesquisar..."
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      className="w-full px-2 py-1 mb-2 text-xs rounded bg-zinc-100 dark:bg-zinc-950 border border-zinc-250 dark:border-white/10 text-bujo-text outline-none"
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
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-150 dark:hover:bg-white/5 transition-all text-sm"
                        >
                          {icon.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <input
                type="text"
                required
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={inputType === 'task' ? "Adicionar tarefa..." : inputType === 'event' ? "Adicionar evento..." : "Adicionar nota..."}
                className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-bujo-text placeholder:text-zinc-650 outline-none focus:border-bujo-highlight/40"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-zinc-550 dark:text-zinc-400 font-bold uppercase">Hora ⏱️</span>
              <input
                type="time"
                value={inputTime}
                onChange={(e) => setInputTime(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 rounded-lg px-3 py-1 text-xs text-bujo-text outline-none"
              />
            </div>

            {inputType === 'task' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">Energia ⚡</span>
                    <select
                      value={energy}
                      onChange={(e) => setEnergy(Number(e.target.value))}
                      className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-bujo-text outline-none"
                    >
                      {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">Complex. 🧠</span>
                    <select
                      value={complexity}
                      onChange={(e) => setComplexity(Number(e.target.value))}
                      className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-bujo-text outline-none"
                    >
                      {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">Tempo (min) ⏱️</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Minutos"
                    value={executionTime}
                    onChange={(e) => setExecutionTime(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 rounded-lg px-3 py-1 text-xs text-bujo-text outline-none"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-2 bg-bujo-highlight text-white hover:opacity-95 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-bujo-highlight/10"
            >
              <Plus className="w-4 h-4" /> Agendar
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
