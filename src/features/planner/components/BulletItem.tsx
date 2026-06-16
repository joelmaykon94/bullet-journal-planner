import { useState, useEffect } from 'react';
import { Edit, Trash2, ChevronUp, ChevronDown, Check, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { BujoItem } from '../../../types';
import { useBujo } from '../../../context/BujoContext';

interface BulletItemProps {
  item: BujoItem;
  cycleStatus: (id: string) => void;
  editingItemId: string | null;
  editingItemContent: string;
  setEditingItemContent: (content: string) => void;
  handleSaveEditItem: (id: string, energy?: number, complexity?: number, executionTime?: number) => void;
  setEditingItemId: (id: string | null) => void;
  handleStartEditItem: (id: string, content: string) => void;
  handleDeleteItem: (id: string) => void;
  handleAISplitTask: (id: string, content: string) => void;
  breakingTaskIds: { [key: string]: boolean };
  expandedTaskId: string | null;
  setExpandedTaskId: (id: string | null) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  newSubtaskText: string;
  setNewSubtaskText: (text: string) => void;
  addSubtask: (taskId: string, icon?: string, executionTime?: number) => void;
  getSubtaskCompletionString: (item: BujoItem) => string;
}

export const BulletItem = ({
  item,
  cycleStatus,
  editingItemId,
  editingItemContent,
  setEditingItemContent,
  handleSaveEditItem,
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
}: BulletItemProps) => {
  const { handleUpdateItemDelegatedTo, handleUpdateItemIcon } = useBujo();

  const [localDelegatedTo, setLocalDelegatedTo] = useState(item.delegatedTo || '');
  const [localIcon, setLocalIcon] = useState(item.icon || '');
  const [localEnergy, setLocalEnergy] = useState<number>(item.energy || 1);
  const [localComplexity, setLocalComplexity] = useState<number>(item.complexity || 1);
  const [localExecutionTime, setLocalExecutionTime] = useState<number | ''>(item.executionTime || '');
  const [subtaskIcon, setSubtaskIcon] = useState<string>('');
  const [showSubtaskIconDropdown, setShowSubtaskIconDropdown] = useState<boolean>(false);
  const [subtaskMinutes, setSubtaskMinutes] = useState<string>('');

  useEffect(() => {
    if (editingItemId === item.id) {
      setLocalDelegatedTo(item.delegatedTo || '');
      setLocalIcon(item.icon || '');
      setLocalEnergy(item.energy || 1);
      setLocalComplexity(item.complexity || 1);
      setLocalExecutionTime(item.executionTime || '');
    }
  }, [editingItemId, item.id]);

  const handleSaveEdit = () => {
    handleUpdateItemDelegatedTo(item.id, localDelegatedTo);
    handleUpdateItemIcon(item.id, localIcon);
    handleSaveEditItem(
      item.id,
      localEnergy,
      localComplexity,
      localExecutionTime === '' ? undefined : Number(localExecutionTime)
    );
  };

  const handleAddSubtaskLocal = () => {
    if (!newSubtaskText.trim()) return;
    const mins = subtaskMinutes ? Number(subtaskMinutes) : undefined;
    addSubtask(item.id, subtaskIcon, mins);
    setNewSubtaskText('');
    setSubtaskIcon('');
    setSubtaskMinutes('');
  };

  const hasSubtasks = item.subtasks && item.subtasks.length > 0;
  const isExpanded = expandedTaskId === item.id;

  const renderContentWithTags = (content: string) => {
    const contextRegex = /(@computador|@online|@rua|@casa|@trabalhando|@mestrado|@programando|@aguardando)\b/gi;
    const parts = content.split(contextRegex);
    if (parts.length === 1) return content;

    const colors: { [key: string]: string } = {
      '@computador': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 ml-1.5 border align-middle',
      '@online': 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 ml-1.5 border align-middle',
      '@rua': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 ml-1.5 border align-middle',
      '@casa': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 ml-1.5 border align-middle',
      '@trabalhando': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 ml-1.5 border align-middle',
      '@mestrado': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 ml-1.5 border align-middle',
      '@programando': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 ml-1.5 border align-middle',
      '@aguardando': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 ml-1.5 border align-middle'
    };

    const icons: { [key: string]: string } = {
      '@computador': '💻 ',
      '@online': '🌐 ',
      '@rua': '🚶 ',
      '@casa': '🏠 ',
      '@trabalhando': '💼 ',
      '@mestrado': '🎓 ',
      '@programando': '⚡ ',
      '@aguardando': '⏳ '
    };

    return parts.map((part, index) => {
      const lowerPart = part.toLowerCase();
      if (colors[lowerPart] !== undefined) {
        return (
          <span key={index} className={colors[lowerPart]}>
            {icons[lowerPart]}
            {part.replace('@', '')}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-200/10 dark:bg-white/[0.02] border border-zinc-200/30 dark:border-white/5 flex flex-col gap-2.5 transition-colors hover:bg-zinc-200/20 dark:hover:bg-white/[0.04]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <button
            onClick={() => cycleStatus(item.id)}
            className="w-[26px] h-[26px] rounded-full bg-zinc-200/30 dark:bg-white/5 border border-zinc-300/40 dark:border-white/10 hover:border-bujo-highlight flex items-center justify-center text-xs font-bold transition-colors flex-shrink-0 mt-0.5"
            title="Mudar estado clássico"
          >
            {item.status === 'open' && (
              item.type === 'task' ? (
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-650 dark:bg-zinc-300" />
              ) : item.type === 'event' ? (
                <span className="w-2.5 h-2.5 rounded-full border-2 border-bujo-accent shrink-0" />
              ) : (
                <span className="w-2.5 h-0.5 bg-zinc-500 dark:bg-zinc-400 shrink-0" />
              )
            )}
            {item.status === 'completed' && (
              <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3.5]" />
            )}
            {item.status === 'migrated' && (
              <ChevronRight className="w-3.5 h-3.5 text-bujo-highlight stroke-[3.5]" />
            )}
            {item.status === 'scheduled' && (
              <ChevronLeft className="w-3.5 h-3.5 text-indigo-400 stroke-[3.5]" />
            )}
            {item.status === 'cancelled' && (
              <X className="w-3.5 h-3.5 text-red-500 stroke-[3.5]" />
            )}
          </button>

          {item.icon && (
            <span className="text-lg flex items-center justify-center shrink-0 mt-0.5 select-none" title="Ícone da tarefa">
              {item.icon}
            </span>
          )}

          <div className="flex-1 min-w-0">
            {editingItemId === item.id ? (
              <div className="flex flex-col gap-2.5 w-full">
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={editingItemContent}
                    onChange={(e) => setEditingItemContent(e.target.value)}
                    className="flex-1 bg-zinc-200/50 dark:bg-white/10 border border-bujo-highlight text-sm text-bujo-text px-3 py-1.5 rounded-xl outline-none font-medium focus:ring-1 focus:ring-bujo-highlight"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') setEditingItemId(null);
                    }}
                  />
                </div>
                
                {/* Icon Selector */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-zinc-400 font-bold">Escolha um ícone/emoji:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['', '📚', '🏃‍♂️', '🍎', '💡', '💻', '💼', '🛒', '🎨', '🎵', '🩺', '✈️', '💬', '🔑'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setLocalIcon(emoji)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm border transition-all ${
                          localIcon === emoji 
                            ? 'bg-bujo-highlight border-bujo-highlight text-white font-bold scale-110 shadow-sm'
                            : 'bg-zinc-200/50 dark:bg-white/5 border-zinc-300 dark:border-white/10 hover:bg-zinc-300 dark:hover:bg-white/10'
                        }`}
                      >
                        {emoji || '❌'}
                      </button>
                    ))}
                  </div>
                </div>

                {item.type === 'task' && (
                  <div className="grid grid-cols-3 gap-2.5 bg-zinc-200/20 dark:bg-white/[0.02] p-3 rounded-2xl border border-zinc-300/40 dark:border-white/5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9.5px] text-zinc-550 dark:text-zinc-400 font-bold uppercase tracking-wider">Energia (1-5) ⚡</span>
                      <select
                        value={localEnergy}
                        onChange={(e) => setLocalEnergy(Number(e.target.value))}
                        className="bg-zinc-150 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-bujo-text outline-none cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9.5px] text-zinc-550 dark:text-zinc-400 font-bold uppercase tracking-wider">Complexidade 🧠</span>
                      <select
                        value={localComplexity}
                        onChange={(e) => setLocalComplexity(Number(e.target.value))}
                        className="bg-zinc-150 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-bujo-text outline-none cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9.5px] text-zinc-550 dark:text-zinc-400 font-bold uppercase tracking-wider">Tempo (min) ⏱️</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Minutos"
                        value={localExecutionTime}
                        onChange={(e) => setLocalExecutionTime(e.target.value ? Number(e.target.value) : '')}
                        className="bg-zinc-150 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-bujo-text outline-none font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Delegation Input */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[11px] text-zinc-400 font-bold">Delegar para:</span>
                    <input
                      type="text"
                      placeholder="Nome do responsável..."
                      value={localDelegatedTo}
                      onChange={(e) => setLocalDelegatedTo(e.target.value)}
                      className="bg-zinc-200/50 dark:bg-white/10 border border-zinc-300 dark:border-white/10 text-xs text-bujo-text px-3 py-1.5 rounded-xl outline-none"
                    />
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto mt-2 sm:mt-5">
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingItemId(null)}
                      className="px-3 py-1.5 bg-zinc-300 dark:bg-white/10 text-bujo-text rounded-xl text-xs font-bold hover:bg-zinc-400 dark:hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <span className={`text-xs md:text-[13px] break-words font-medium leading-relaxed ${
                    item.status === 'completed' ? 'line-through opacity-50' : 
                    item.status === 'cancelled' ? 'line-through text-red-500/75 dark:text-red-400/70 opacity-60' : ''
                  }`}>
                    {item.priority && <span className="text-bujo-highlight font-bold mr-1.5">*</span>}
                    {renderContentWithTags(item.content)}
                    {item.type === 'task' && hasSubtasks && (
                      <span className="text-[9.5px] text-bujo-accent font-semibold ml-1.5 font-mono">
                        {getSubtaskCompletionString(item)}
                      </span>
                    )}
                  </span>
                  {item.delegatedTo && (
                    <span className="bg-zinc-200/60 dark:bg-white/10 text-zinc-750 dark:text-zinc-350 px-2 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 border border-zinc-350 dark:border-white/5 align-middle select-none">
                      👥 Delegado: <strong className="text-bujo-highlight">{item.delegatedTo}</strong>
                    </span>
                  )}
                </div>
                {item.time && (
                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5">Agendado para: {item.time}</span>
                )}
                {item.type === 'task' && (item.executionTime || item.energy || item.complexity) && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-zinc-500 font-sans select-none">
                    {item.executionTime && (
                      <span className="flex items-center gap-0.5 bg-zinc-200/40 dark:bg-white/5 border border-zinc-300/30 dark:border-white/5 px-1.5 py-0.5 rounded-lg text-bujo-highlight font-mono">
                        ⏱️ {item.executionTime} min
                      </span>
                    )}
                    {item.energy !== undefined && (
                      <span className="flex items-center gap-0.5 bg-zinc-200/40 dark:bg-white/5 border border-zinc-300/30 dark:border-white/5 px-1.5 py-0.5 rounded-lg" title="Esforço / Energia">
                        ⚡ {item.energy}/5
                      </span>
                    )}
                    {item.complexity !== undefined && (
                      <span className="flex items-center gap-0.5 bg-zinc-200/40 dark:bg-white/5 border border-zinc-300/30 dark:border-white/5 px-1.5 py-0.5 rounded-lg" title="Complexidade">
                        🧠 {item.complexity}/5
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto no-print flex-shrink-0">
          {editingItemId !== item.id && (
            <>
              {item.type === 'task' && (
                <>
                  <button
                    onClick={() => handleAISplitTask(item.id, item.content)}
                    disabled={breakingTaskIds[item.id]}
                    className="px-2 py-0.5 rounded-full bg-bujo-accent/15 text-bujo-accent text-[9px] font-bold hover:bg-bujo-accent/25 transition-colors flex items-center gap-0.5 disabled:opacity-50"
                    title="Dividir com inteligência artificial"
                  >
                    <span>❄️</span>
                    <span>{breakingTaskIds[item.id] ? 'Quebrando...' : 'IA'}</span>
                  </button>
                  <button
                    onClick={() => setExpandedTaskId(isExpanded ? null : item.id)}
                    className="p-0.5 rounded-full hover:bg-zinc-200/50 dark:hover:bg-white/5 transition-colors text-zinc-500"
                    title="Subtarefas"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </>
              )}
              <button
                onClick={() => handleStartEditItem(item.id, item.content)}
                className="p-0.5 rounded-full hover:bg-zinc-200/50 dark:hover:bg-white/5 transition-colors text-zinc-600"
                title="Editar"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="p-0.5 rounded-full hover:bg-red-500/10 hover:text-red-400 transition-colors text-zinc-600"
                title="Excluir"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {item.type === 'task' && isExpanded && (
        <div className="pl-9 pr-1.5 pb-1.5 border-l border-zinc-200/50 dark:border-white/5 mt-1 animate-fade-in flex flex-col gap-2">
          {item.subtasks && item.subtasks.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scroll-smooth">
              {item.subtasks.map(sub => (
                <div key={sub.id} className="flex items-center justify-between gap-3 text-[11px] group/sub py-0.5 animate-fade-in">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSubtask(item.id, sub.id)}
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                        sub.completed ? 'bg-bujo-accent border-bujo-accent text-white' : 'border-zinc-300 dark:border-white/20'
                      }`}
                    >
                      {sub.completed && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                    </button>
                    <span className={`truncate flex items-center gap-1.5 ${sub.completed ? 'line-through opacity-40' : 'text-zinc-600 dark:text-zinc-300'}`}>
                      {sub.icon && <span className="text-xs select-none" title="Ícone do micro-passo">{sub.icon}</span>}
                      <span>{sub.content}</span>
                      {sub.executionTime && (
                        <span className="text-[9px] bg-zinc-200/50 dark:bg-white/5 border border-zinc-300/40 dark:border-white/10 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded font-mono ml-1.5 inline-flex items-center gap-0.5 select-none" title="Tempo de execução do micro-passo">
                          ⏱️ {sub.executionTime} min
                        </span>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteSubtask(item.id, sub.id)}
                    className="text-zinc-400 hover:text-red-500 opacity-0 group-hover/sub:opacity-100 transition-opacity p-0.5 flex-shrink-0 cursor-pointer"
                    title="Remover micro-tarefa"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New Subtask Input Form with Icon Picker and Cancel Actions */}
          <div className="flex items-center gap-2 pt-1.5 no-print relative">
            {/* Icon Picker for Subtask */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSubtaskIconDropdown(!showSubtaskIconDropdown)}
                className="w-6 h-6 rounded bg-zinc-200/50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 flex items-center justify-center text-xs hover:border-bujo-highlight hover:bg-zinc-200/80 dark:hover:bg-white/10 transition-all cursor-pointer"
                title="Escolher Ícone para o micro-passo"
              >
                {subtaskIcon || '🎨'}
              </button>
 
              {showSubtaskIconDropdown && (
                <div className="absolute left-0 bottom-full mb-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl shadow-2xl z-50 w-52 animate-scale-in">
                  <div className="flex justify-between items-center mb-1 pb-1 border-b border-zinc-200/40 dark:border-white/5">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Ícone</span>
                    <div className="flex items-center gap-1.5">
                      {subtaskIcon && (
                        <button
                          type="button"
                          onClick={() => {
                            setSubtaskIcon('');
                            setShowSubtaskIconDropdown(false);
                          }}
                          className="text-[9px] text-red-500 hover:underline font-bold cursor-pointer"
                        >
                          Limpar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowSubtaskIconDropdown(false)}
                        className="p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-405 hover:text-bujo-text cursor-pointer"
                        title="Fechar"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-1 max-h-32 overflow-y-auto">
                    {['📝', '🎯', '🚀', '💡', '📚', '🏃‍♂️', '🍎', '🛒', '🎨', '🍿', '🏠', '🔑', '💬', '⚠️', '🛠️', '💰', '🏆', '🧘‍♂️', '🍕', '🔥'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setSubtaskIcon(emoji);
                          setShowSubtaskIconDropdown(false);
                        }}
                        className={`w-7 h-7 flex items-center justify-center rounded text-sm hover:bg-zinc-150 dark:hover:bg-white/5 transition-all ${
                          subtaskIcon === emoji ? 'bg-bujo-highlight/20 border border-bujo-highlight' : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
 
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                placeholder="Novo micro-passo..."
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                className="bg-transparent border-b border-zinc-200/80 dark:border-white/10 outline-none text-xs text-bujo-text placeholder:text-zinc-500 w-full py-1 pr-6"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSubtaskLocal();
                  }
                }}
              />
              {(newSubtaskText || subtaskIcon || subtaskMinutes) && (
                <button
                  type="button"
                  onClick={() => {
                    setNewSubtaskText('');
                    setSubtaskIcon('');
                    setSubtaskMinutes('');
                    setShowSubtaskIconDropdown(false);
                  }}
                  className="absolute right-1 p-0.5 rounded-full hover:bg-zinc-200/60 dark:hover:bg-white/10 text-zinc-405 hover:text-bujo-text transition-colors cursor-pointer"
                  title="Limpar"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="shrink-0 flex items-center gap-1">
              <input
                type="number"
                min="0"
                placeholder="min"
                value={subtaskMinutes}
                onChange={(e) => setSubtaskMinutes(e.target.value)}
                className="w-12 bg-zinc-200/40 dark:bg-white/5 border border-zinc-300 dark:border-white/10 rounded px-1.5 py-0.5 text-xs text-bujo-text outline-none text-center font-mono placeholder:text-zinc-500"
                title="Tempo estimado (minutos)"
              />
            </div>
 
            <div className="flex gap-1 shrink-0">
              {(newSubtaskText || subtaskIcon || subtaskMinutes) && (
                <button
                  type="button"
                  onClick={() => {
                    setNewSubtaskText('');
                    setSubtaskIcon('');
                    setSubtaskMinutes('');
                    setShowSubtaskIconDropdown(false);
                  }}
                  className="px-2 py-1 bg-zinc-200/50 dark:bg-white/5 text-bujo-text border border-zinc-300/40 dark:border-white/15 rounded text-[10px] font-bold hover:bg-zinc-300/50 dark:hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleAddSubtaskLocal}
                className="px-2.5 py-1 bg-zinc-300/40 dark:bg-white/10 text-[10px] font-bold rounded hover:bg-zinc-300/60 dark:hover:bg-white/20 transition-all cursor-pointer border border-zinc-300/20 dark:border-white/5"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
