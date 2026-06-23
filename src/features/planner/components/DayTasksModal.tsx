import { useState, useEffect } from 'react';
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
import { X, Search, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { BulletItem } from './BulletItem';
import { useBujo } from '../../../context/BujoContext';
import { BUJO_ICONS } from '../../../utils/constants';
import { compareBujoItems } from '../../../utils/plannerUtils';
import { SortableItem, DragHandle } from '../../../components/common/SortableItem';

interface DayTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string | null;
}

export const DayTasksModal = ({ isOpen, onClose, dateStr }: DayTasksModalProps) => {
  const {
    items,
    handleSaveStandardInput,
    cycleStatus,
    editingItemId,
    editingItemContent,
    setEditingItemContent,
    handleSaveEditItemForm,
    setEditingItemId,
    handleStartEditItem,
    handleDeleteItem,
    expandedTaskId,
    setExpandedTaskId,
    toggleSubtask,
    deleteSubtask,
    newSubtaskText,
    setNewSubtaskText,
    addSubtask,
    getSubtaskCompletionString,
    handleReorderItems
  } = useBujo();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      handleReorderItems(active.id as string, over.id as string);
    }
  };

  // Local form states
  const [inputText, setInputText] = useState('');
  const [inputType, setInputType] = useState<'task' | 'event' | 'note'>('task');
  const [inputIcon, setInputIcon] = useState('');
  const [showIconDropdown, setShowIconDropdown] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [inputTime, setInputTime] = useState('');
  const [energy, setEnergy] = useState(1);
  const [complexity, setComplexity] = useState(1);
  const [executionTime, setExecutionTime] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !dateStr) return null;

  // Filter items matching the modal date & sort by default order
  const dateItems = items.filter(item => item.date === dateStr).sort(compareBujoItems);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    handleSaveStandardInput(
      inputText,
      setInputText,
      inputType,
      dateStr,
      dateStr,
      inputTime,
      setInputTime,
      inputIcon,
      inputType === 'task' ? energy : undefined,
      inputType === 'task' ? complexity : undefined,
      inputType === 'task' && executionTime ? Number(executionTime) : undefined,
      undefined
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

  const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in no-print">
      <div 
        className="relative max-w-2xl w-full max-h-[85vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-3.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest">
              AGENDA DIÁRIA DO DIA
            </span>
            <h3 className="text-xl font-light text-white">
              Dia {formattedDate}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Fechar Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add Form */}
        <div className="bg-zinc-900/50 border border-white/5 p-3 rounded-2xl mb-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            {/* Row 1 */}
            <div className="flex items-center gap-2 w-full">
              {/* Type selector */}
              <div className="flex bg-zinc-950 p-0.5 rounded border border-white/5 shrink-0 select-none">
                {(['task', 'event', 'note'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setInputType(t)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      inputType === t
                        ? 'bg-bujo-highlight text-white'
                        : 'text-zinc-550 hover:text-bujo-text'
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
                  className="w-7 h-7 rounded bg-zinc-900 border border-white/10 flex items-center justify-center text-xs hover:border-bujo-highlight hover:bg-white/10 transition-all cursor-pointer"
                  title="Escolher Ícone"
                >
                  {inputIcon || '🎨'}
                </button>

                {showIconDropdown && (
                  <div className="absolute left-0 top-full mt-1.5 p-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 w-52 animate-scale-in">
                    <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-white/5">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Ícones</span>
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
                          className="p-0.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
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
                      className="w-full px-2 py-0.5 mb-1.5 text-[9.5px] rounded bg-zinc-855 border border-white/10 text-white placeholder-zinc-550 outline-none"
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
                          className={`w-7 h-7 flex items-center justify-center rounded text-sm hover:bg-white/5 transition-all ${
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

              {/* Text input */}
              <input
                type="text"
                required
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={inputType === 'task' ? "Ex: Revisar docs amanhã às 14h p1 #Time" : inputType === 'event' ? "Adicionar evento..." : "Adicionar nota..."}
                className="flex-1 bg-zinc-950 border border-white/5 rounded-lg px-2.5 py-1 text-xs text-white placeholder-zinc-500 outline-none focus:border-bujo-highlight/50 transition-colors"
              />
            </div>

            {/* Row 2 */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-1.5 mt-0.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Task-specific fields */}
                {inputType === 'task' && (
                  <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-0.5 rounded border border-white/5">
                    <div className="flex items-center gap-1">
                      <span className="text-zinc-500 text-[9px] uppercase font-mono">Energ:</span>
                      <select
                        value={energy}
                        onChange={(e) => setEnergy(Number(e.target.value))}
                        className="bg-transparent border-none text-white outline-none cursor-pointer text-[10.5px] font-semibold py-0"
                      >
                        {[1, 2, 3, 4, 5].map(v => <option key={v} value={v} className="bg-zinc-950">⚡ {v}</option>)}
                      </select>
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <div className="flex items-center gap-1">
                      <span className="text-zinc-500 text-[9px] uppercase font-mono">Compl:</span>
                      <select
                        value={complexity}
                        onChange={(e) => setComplexity(Number(e.target.value))}
                        className="bg-transparent border-none text-white outline-none cursor-pointer text-[10.5px] font-semibold py-0"
                      >
                        {[1, 2, 3, 4, 5].map(v => <option key={v} value={v} className="bg-zinc-950">🧠 {v}</option>)}
                      </select>
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <div className="flex items-center gap-1">
                      <span className="text-zinc-500 text-[9px] uppercase font-mono">Tempo:</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="min"
                        value={executionTime}
                        onChange={(e) => setExecutionTime(e.target.value)}
                        className="bg-transparent border-none text-white outline-none w-8 font-mono text-[10.5px] text-center placeholder-zinc-650 font-semibold"
                      />
                      <span className="text-[9px] text-zinc-500">min</span>
                    </div>
                  </div>
                )}

                {/* Time picker */}
                <div className="flex items-center gap-1 bg-zinc-950 px-2 py-0.5 rounded border border-white/5">
                  <span className="text-zinc-500 text-[9px] uppercase font-mono">Hora:</span>
                  <input
                    type="time"
                    value={inputTime}
                    onChange={(e) => setInputTime(e.target.value)}
                    className="bg-transparent border-none text-white outline-none cursor-pointer text-[10.5px] font-mono py-0 w-28"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 ml-auto">
                {(inputText || inputTime || inputIcon) && (
                  <button
                    type="button"
                    onClick={handleClearInputs}
                    className="px-2.5 py-1 bg-zinc-900 text-zinc-400 hover:text-white rounded-lg text-[10px] font-bold border border-white/5 transition-colors cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
                <button
                  type="submit"
                  className="px-3.5 py-1 bg-bujo-highlight text-white rounded-lg text-[10px] font-bold hover:opacity-95 transition-opacity cursor-pointer shadow-md shadow-bujo-highlight/10"
                >
                  Cadastrar
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Scrollable Tasks List */}
        <div className="flex-1 overflow-y-auto pr-1">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={dateItems.map(i => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {dateItems.map(item => (
                  <div key={item.id} className="flex items-start gap-2 group/sort">
                    <DragHandle id={item.id} className="mt-4 opacity-0 group-hover/sort:opacity-40 hover:!opacity-100 transition-opacity">
                      <GripVertical className="w-4 h-4 text-zinc-500" />
                    </DragHandle>
                    <SortableItem id={item.id} className="flex-1">
                      <BulletItem item={item} />
                    </SortableItem>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {dateItems.length === 0 && (
            <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/5 text-center text-zinc-550 italic text-xs">
              Nenhuma entrada para este dia. Adicione algo no formulário acima!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
