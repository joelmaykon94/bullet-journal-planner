import { useState, useRef } from 'react';
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
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Download, Printer, ChevronLeft, ChevronRight, X, GripVertical } from 'lucide-react';
import { BulletItem } from './BulletItem';
import { useBujo } from '../../../context/BujoContext';
import { getLocalDateString } from '../../../utils/plannerUtils';
import { BUJO_ICONS, CTX_SUGGESTIONS } from '../../../utils/constants';
import { DateInput } from '../../../components/common/DateInput';
import { SortableItem, DragHandle } from '../../../components/common/SortableItem';

export const DailyLogTab = () => {
  const {
    items,
    selectedDate,
    setSelectedDate,
    standardDate,
    setStandardDate,
    standardTime,
    setStandardTime,
    exportToPDF,
    handlePrint,
    handleSaveStandardInput,
    standardType,
    setStandardType,
    standardInput,
    setStandardInput,
    handleStandardInputChange,
    handleStandardInputKeyDown,
    migrateUncompletedTasksToNextDay,
    handleReorderItems
  } = useBujo();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const today = getLocalDateString();
  const [standardIcon, setStandardIcon] = useState<string>('');
  const [showIconDropdown, setShowIconDropdown] = useState<boolean>(false);
  const [standardEnergy, setStandardEnergy] = useState<number>(1);
  const [standardComplexity, setStandardComplexity] = useState<number>(1);
  const [standardExecutionTime, setStandardExecutionTime] = useState<string>('');
  const [iconSearch, setIconSearch] = useState('');

  const [showCtxAutocomplete, setShowCtxAutocomplete] = useState(false);
  const [ctxSearch, setCtxSearch] = useState('');
  const [ctxIndex, setCtxIndex] = useState(0);
  const createInputRef = useRef<HTMLInputElement | null>(null);

  // ponytail: useSensors and useSensor are removed to avoid React 19 "Invalid hook call"
  // DndContext will use default sensors (Pointer/Keyboard) which are safer for now.

  const getContextSearch = (value: string, cursorPosition: number | null) => {
    if (cursorPosition === null) return null;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastSpace = textBeforeCursor.lastIndexOf(' ');
    const currentWord = textBeforeCursor.substring(lastSpace + 1);
    if (currentWord.startsWith('@')) {
      return currentWord.substring(1);
    }
    return null;
  };

  const selectContextSuggestion = (ctxTag: string, currentValue: string, setValue: (v: string) => void, inputEl: HTMLInputElement | null) => {
    if (!inputEl) return;
    const cursorPosition = inputEl.selectionStart;
    if (cursorPosition === null) return;
    const textBeforeCursor = currentValue.substring(0, cursorPosition);
    const textAfterCursor = currentValue.substring(cursorPosition);
    const lastSpace = textBeforeCursor.lastIndexOf(' ');
    const newVal = currentValue.substring(0, lastSpace + 1) + ctxTag + ' ' + textAfterCursor;
    setValue(newVal);
    
    setTimeout(() => {
      inputEl.focus();
      const newPos = lastSpace + 1 + ctxTag.length + 1;
      inputEl.setSelectionRange(newPos, newPos);
    }, 10);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleStandardInputChange(e);
    
    const val = e.target.value;
    const cursor = e.target.selectionStart;
    const search = getContextSearch(val, cursor);
    if (search !== null) {
      setCtxSearch(search);
      setShowCtxAutocomplete(true);
      setCtxIndex(0);
    } else {
      setShowCtxAutocomplete(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const filteredCtxs = CTX_SUGGESTIONS.filter(ctx => 
      ctx.tag.toLowerCase().includes(ctxSearch.toLowerCase()) ||
      ctx.label.toLowerCase().includes(ctxSearch.toLowerCase())
    );

    if (showCtxAutocomplete && filteredCtxs.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCtxIndex(prev => (prev + 1) % filteredCtxs.length);
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCtxIndex(prev => (prev - 1 + filteredCtxs.length) % filteredCtxs.length);
        return;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredCtxs[ctxIndex];
        selectContextSuggestion(selected.tag, standardInput, setStandardInput, createInputRef.current);
        setShowCtxAutocomplete(false);
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowCtxAutocomplete(false);
        return;
      }
    }
    
    handleStandardInputKeyDown(e);
  };

  const handleClearInputs = () => {
    setStandardInput('');
    setStandardTime('');
    setStandardIcon('');
    setStandardEnergy(1);
    setStandardComplexity(1);
    setStandardExecutionTime('');
    setShowIconDropdown(false);
  };

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!standardInput.trim()) return;

    handleSaveStandardInput(
      standardInput,
      setStandardInput,
      standardType,
      standardDate,
      selectedDate,
      standardTime,
      setStandardTime,
      standardIcon,
      standardType === 'task' ? standardEnergy : undefined,
      standardType === 'task' ? standardComplexity : undefined,
      standardType === 'task' && standardExecutionTime ? Number(standardExecutionTime) : undefined
    );

    setStandardIcon('');
    setStandardEnergy(1);
    setStandardComplexity(1);
    setStandardExecutionTime('');
    setShowIconDropdown(false);
    // Keep standard date aligned with current selection
    setStandardDate(selectedDate);
    setStandardTime('');
  };

  const dateItems = items.filter(i => i.date === selectedDate);
  
  // Sort items: Most recent first (based on createdAt)
  const sortedDateItems = [...dateItems].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (aTime !== bTime) return bTime - aTime;
    return b.id.localeCompare(a.id);
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      handleReorderItems(active.id as string, over.id as string);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200/50 dark:border-white/10 pb-2 gap-2">
        <div>
          <span className="text-[9px] text-zinc-400 uppercase font-mono tracking-widest">DIÁRIO CONSOLIDADO</span>
          <h3 className="text-2xl font-light">
            Daily Log — <span className="italic font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>
              {selectedDate === today ? 'Hoje' : new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2 no-print flex-wrap">
          <div className="flex items-center gap-1.5 bg-zinc-200/30 dark:bg-white/5 p-1 rounded-xl border border-zinc-200/40 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                const prev = new Date(selectedDate + 'T00:00:00');
                prev.setDate(prev.getDate() - 1);
                const prevStr = getLocalDateString(prev);
                setSelectedDate(prevStr);
                setStandardDate(prevStr);
              }}
              className="p-1.5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-white/5 transition-colors"
              title="Dia Anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold px-1.5 text-bujo-text">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            </span>
            <button
              type="button"
              onClick={() => {
                const next = new Date(selectedDate + 'T00:00:00');
                next.setDate(next.getDate() + 1);
                const nextStr = getLocalDateString(next);
                setSelectedDate(nextStr);
                setStandardDate(nextStr);
              }}
              className="p-1.5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-white/5 transition-colors"
              title="Próximo Dia"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            {selectedDate !== today && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(today);
                  setStandardDate(today);
                }}
                className="px-2 py-0.5 bg-bujo-highlight text-white text-[10px] font-bold rounded-lg hover:opacity-90 transition-opacity ml-1"
              >
                Hoje
              </button>
            )}
          </div>

          <button
            onClick={() => migrateUncompletedTasksToNextDay(selectedDate)}
            className="p-2.5 rounded-xl bg-zinc-200/40 dark:bg-white/5 border border-zinc-200/40 dark:border-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Migrar tarefas não concluídas para amanhã"
          >
            <ChevronRight className="w-3.5 h-3.5 text-bujo-highlight" /> <span className="hidden sm:inline">Migrar Pendentes</span>
          </button>
          <button
            onClick={exportToPDF}
            className="p-2.5 rounded-xl bg-zinc-200/40 dark:bg-white/5 border border-zinc-200/40 dark:border-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Exportar semana"
          >
            <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Exportar PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl bg-zinc-200/40 dark:bg-white/5 border border-zinc-200/40 dark:border-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Imprimir layout"
          >
            <Printer className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </div>

      <div className="relative bg-zinc-200/30 dark:bg-white/5 p-2 rounded-xl border border-zinc-200/40 dark:border-white/10 no-print">
        <form onSubmit={handleLocalSubmit} className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row gap-2 items-center w-full">
            <div className="flex bg-zinc-200/50 dark:bg-zinc-950/60 p-0.5 rounded-lg border border-zinc-200/40 dark:border-white/5 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
              {(['task', 'event', 'note'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setStandardType(t)}
                  className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex-1 sm:flex-initial text-center ${
                    standardType === t ? 'bg-bujo-highlight text-white shadow-sm' : 'text-zinc-500 hover:text-bujo-text'
                  }`}
                >
                  {t === 'task' ? '• Tarefa' : t === 'event' ? '○ Evento' : '- Nota'}
                </button>
              ))}
            </div>

            <div className="relative shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowIconDropdown(!showIconDropdown)}
                className="w-full sm:w-7 sm:h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-white/10 flex items-center justify-center text-xs hover:border-bujo-highlight hover:bg-zinc-200 dark:hover:bg-white/10 transition-all cursor-pointer gap-2 sm:gap-0"
                title="Escolher Ícone/Desenho"
              >
                <span className="sm:hidden text-xs text-zinc-500 font-semibold">Ícone:</span>
                <span>{standardIcon || '🎨'}</span>
              </button>

              {showIconDropdown && (
                <div className="absolute left-0 top-full mt-1.5 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 w-64 animate-scale-in">
                  <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-zinc-200/40 dark:border-white/5">
                    <span className="text-[9.5px] font-bold text-zinc-450 dark:text-zinc-400 uppercase tracking-wider">Escolha um Ícone</span>
                    <button type="button" onClick={() => setShowIconDropdown(false)} className="p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 hover:text-bujo-text cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Pesquisar ícones..."
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    className="w-full px-2 py-0.5 mb-1.5 text-[9.5px] rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-250 dark:border-white/10 text-bujo-text placeholder-zinc-500 outline-none"
                  />
                  <div className="grid grid-cols-6 gap-1 max-h-36 overflow-y-auto pr-1">
                    {BUJO_ICONS.filter(icon => 
                      icon.name.toLowerCase().includes(iconSearch.toLowerCase()) || 
                      icon.tooltip.toLowerCase().includes(iconSearch.toLowerCase())
                    ).map(icon => (
                      <button
                        key={icon.emoji}
                        type="button"
                        onClick={() => { setStandardIcon(icon.emoji); setShowIconDropdown(false); setIconSearch(''); }}
                        className={`w-7 h-7 flex items-center justify-center rounded text-base hover:bg-zinc-150 dark:hover:bg-white/5 transition-all ${standardIcon === icon.emoji ? 'bg-bujo-highlight/20 border border-bujo-highlight' : ''}`}
                        title={icon.tooltip}
                      >
                        {icon.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative flex-1 flex items-center bg-zinc-100 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-white/5 rounded-lg px-2.5 focus-within:border-bujo-highlight/60 focus-within:ring-1 focus-within:ring-bujo-highlight/30 transition-all w-full">
              <input
                ref={createInputRef}
                type="text"
                required
                value={standardInput}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder={standardType === 'task' ? "Ex: Revisar docs amanhã às 14h p1 #Time" : standardType === 'event' ? "Adicionar evento..." : "Adicionar nota..."}
                className="bg-transparent border-none outline-none w-full text-xs text-bujo-text placeholder:text-zinc-500 py-1.5 pr-8"
              />
              {(standardInput || standardTime || standardIcon) && (
                <button type="button" onClick={handleClearInputs} className="absolute right-2 p-0.5 rounded-full hover:bg-zinc-200/60 dark:hover:bg-white/10 text-zinc-400 hover:text-bujo-text transition-colors cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              )}

              {showCtxAutocomplete && (
                <div className="absolute left-0 top-full mt-2 w-full max-w-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-scale-in">
                  <div className="p-2 border-b border-zinc-200/40 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02]">
                    <span className="text-[9.5px] font-bold text-zinc-450 dark:text-zinc-400 uppercase tracking-wider">Contextos Sugeridos</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {CTX_SUGGESTIONS.filter(ctx => 
                      ctx.tag.toLowerCase().includes(ctxSearch.toLowerCase()) ||
                      ctx.label.toLowerCase().includes(ctxSearch.toLowerCase())
                    ).map((ctx, idx) => (
                      <button
                        key={ctx.tag}
                        type="button"
                        onClick={() => {
                          selectContextSuggestion(ctx.tag, standardInput, setStandardInput, createInputRef.current);
                          setShowCtxAutocomplete(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${ctxIndex === idx ? 'bg-bujo-highlight/10 text-bujo-highlight border-l-2 border-bujo-highlight' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5'}`}
                      >
                        <span className="font-mono font-bold">{ctx.tag}</span>
                        <span className="text-[10px] opacity-60">{ctx.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pt-2 border-t border-zinc-200/30 dark:border-white/5 mt-1">
            <div className="flex flex-wrap items-center gap-2">
              {standardType === 'task' && (
                <div className="flex items-center gap-2 bg-zinc-100/50 dark:bg-white/5 px-2 py-0.5 rounded-lg border border-zinc-200/40 dark:border-white/5">
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-400 select-none text-[9.5px] uppercase font-mono tracking-wider">Energia:</span>
                    <select value={standardEnergy} onChange={(e) => setStandardEnergy(Number(e.target.value))} className="bg-transparent border-none text-bujo-text outline-none cursor-pointer text-xs font-semibold py-0">
                      {[1, 2, 3, 4, 5].map(v => <option key={v} value={v} className="bg-zinc-950 text-white">⚡ {v}</option>)}
                    </select>
                  </div>
                  <div className="w-px h-3.5 bg-zinc-200/60 dark:bg-white/15" />
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-400 select-none text-[9.5px] uppercase font-mono tracking-wider">Complex:</span>
                    <select value={standardComplexity} onChange={(e) => setStandardComplexity(Number(e.target.value))} className="bg-transparent border-none text-bujo-text outline-none cursor-pointer text-xs font-semibold py-0">
                      {[1, 2, 3, 4, 5].map(v => <option key={v} value={v} className="bg-zinc-950 text-white">🧠 {v}</option>)}
                    </select>
                  </div>
                  <div className="w-px h-3.5 bg-zinc-200/60 dark:bg-white/15" />
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-400 select-none text-[9.5px] uppercase font-mono tracking-wider">Tempo:</span>
                    <input type="number" min="0" placeholder="min" value={standardExecutionTime} onChange={(e) => setStandardExecutionTime(e.target.value)} className="bg-transparent border-none text-bujo-text outline-none w-10 font-mono text-xs text-center placeholder:text-zinc-500 font-semibold" />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 bg-zinc-100/50 dark:bg-white/5 px-2 py-0.5 rounded-lg border border-zinc-200/40 dark:border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400 select-none text-[9.5px] uppercase font-mono tracking-wider">Data:</span>
                  <DateInput value={standardDate} onChange={setStandardDate} />
                </div>
                <div className="w-px h-3.5 bg-zinc-200/60 dark:bg-white/15" />
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400 select-none text-[9.5px] uppercase font-mono tracking-wider">Hora:</span>
                  <input type="time" value={standardTime} onChange={(e) => setStandardTime(e.target.value)} className="bg-transparent border-none text-bujo-text outline-none cursor-pointer text-xs font-mono py-0 w-28" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto w-full lg:w-auto justify-end">
              <button type="submit" className="px-3.5 py-1 bg-bujo-highlight text-white rounded-lg text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md shadow-bujo-highlight/10">
                Cadastrar
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 scroll-smooth">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={sortedDateItems.map(i => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sortedDateItems.map(item => (
                <div key={item.id} className="flex items-start gap-2 group/sort">
                  <DragHandle id={item.id} className="mt-4 opacity-0 group-hover/sort:opacity-40 hover:!opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-zinc-400" />
                  </DragHandle>
                  <SortableItem id={item.id} className="flex-1">
                    <BulletItem item={item} />
                  </SortableItem>
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {sortedDateItems.length === 0 && (
          <div className="p-8 rounded-2xl bg-zinc-200/10 dark:bg-white/[0.01] border border-zinc-200/30 dark:border-white/5 text-center text-zinc-500 italic text-sm">
            Nenhuma entrada para este dia. Adicione algo no formulário acima!
          </div>
        )}
      </div>
    </div>
  );
};
