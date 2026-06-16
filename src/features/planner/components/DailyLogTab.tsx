import { useState } from 'react';
import { Download, Printer, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { BulletItem } from './BulletItem';
import { useBujo } from '../../../context/BujoContext';

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
    showAutocomplete,
    collections,
    autocompleteIndex,
    selectCollectionAutocomplete,
    renderRealTimeSuggestions,
    createStandardTaskWithSuggestions,
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

  const today = new Date().toISOString().split('T')[0];
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [standardIcon, setStandardIcon] = useState<string>('');
  const [showIconDropdown, setShowIconDropdown] = useState<boolean>(false);

  const handleClearInputs = () => {
    setStandardInput('');
    setStandardTime('');
    setStandardIcon('');
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
      standardIcon
    );

    setStandardIcon('');
    setShowIconDropdown(false);
  };
  const dateItems = items.filter(i => i.date === selectedDate);
  const filteredDateItems = dateItems.filter(item => {
    if (!selectedContext) return true;
    return item.content.toLowerCase().includes(selectedContext.toLowerCase());
  });

  const filteredCollections = collections.filter((col: any) =>
    col.name.toLowerCase().includes((standardInput.match(/\[(.*)/)?.[1] || '').toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200/50 dark:border-white/10 pb-4 gap-4">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest">DIÁRIO CONSOLIDADO</span>
          <h3 className="text-3xl font-light">
            Daily Log — <span className="italic font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>
              {selectedDate === today ? 'Hoje' : new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2 no-print flex-wrap">
          {/* Day Navigation */}
          <div className="flex items-center gap-1.5 bg-zinc-200/30 dark:bg-white/5 p-1 rounded-xl border border-zinc-200/40 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                const prev = new Date(selectedDate + 'T00:00:00');
                prev.setDate(prev.getDate() - 1);
                const prevStr = prev.toISOString().split('T')[0];
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
                const nextStr = next.toISOString().split('T')[0];
                setSelectedDate(nextStr);
                setStandardDate(nextStr);
              }}
              className="p-1.5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-white/5 transition-colors"
              title="Próximo Dia"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

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

      <div className="relative">
        <form onSubmit={handleLocalSubmit} className="flex flex-col md:flex-row gap-2 bg-zinc-200/30 dark:bg-white/5 p-2 rounded-2xl border border-zinc-200/40 dark:border-white/10 no-print">
          <div className="flex gap-2 flex-1 items-center">
            <select
              value={standardType}
              onChange={(e) => setStandardType(e.target.value as any)}
              className="bg-transparent border-none text-xs text-bujo-text font-bold p-2 outline-none cursor-pointer shrink-0"
            >
              <option value="task" className="bg-bujo-bg text-bujo-text">• Tarefa</option>
              <option value="event" className="bg-bujo-bg text-bujo-text">O Evento</option>
              <option value="note" className="bg-bujo-bg text-bujo-text">- Nota</option>
            </select>

            {/* Icon Picker Trigger */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowIconDropdown(!showIconDropdown)}
                className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-white/10 flex items-center justify-center text-sm hover:border-bujo-highlight hover:bg-zinc-200 dark:hover:bg-white/10 transition-all cursor-pointer"
                title="Escolher Ícone/Desenho"
              >
                {standardIcon || '🎨'}
              </button>

              {showIconDropdown && (
                <div className="absolute left-0 top-full mt-2 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 w-64 animate-scale-in">
                  <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-zinc-200/40 dark:border-white/5">
                    <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-400 uppercase tracking-wider">Escolha um Ícone</span>
                    <div className="flex items-center gap-2">
                      {standardIcon && (
                        <button
                          type="button"
                          onClick={() => {
                            setStandardIcon('');
                            setShowIconDropdown(false);
                          }}
                          className="text-[10px] text-red-500 hover:underline font-bold cursor-pointer"
                        >
                          Remover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowIconDropdown(false)}
                        className="p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 hover:text-bujo-text cursor-pointer"
                        title="Fechar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {['📝', '📅', '🎯', '🚀', '💡', '💼', '📚', '🏃‍♂️', '🍎', '✈️', '🛒', '🎨', '🎵', '🍿', '🏠', '🔑', '💬', '⚠️', '🛠️', '💰', '🏆', '🧘‍♂️', '🩺', '🍕', '🚗', '⭐', '❤️', '🔥', '🔋', '💤'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setStandardIcon(emoji);
                          setShowIconDropdown(false);
                        }}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-base hover:bg-zinc-150 dark:hover:bg-white/5 transition-all ${
                          standardIcon === emoji ? 'bg-bujo-highlight/20 border border-bujo-highlight' : ''
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
                required
                value={standardInput}
                onChange={handleStandardInputChange}
                onKeyDown={handleStandardInputKeyDown}
                placeholder="Adicionar entrada rápida... Use [ para coleções"
                className="bg-transparent border-none outline-none w-full text-sm text-bujo-text placeholder:text-zinc-500 py-2 pl-1 pr-8"
              />
              {(standardInput || standardTime || standardIcon) && (
                <button
                  type="button"
                  onClick={handleClearInputs}
                  className="absolute right-1 p-1 rounded-full hover:bg-zinc-200/60 dark:hover:bg-white/10 text-zinc-400 hover:text-bujo-text transition-colors cursor-pointer"
                  title="Limpar formulário"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-zinc-200/45 dark:border-white/10 pt-2 md:pt-0 pl-0 md:pl-2 shrink-0 justify-between md:justify-start">
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={standardDate}
                onChange={(e) => setStandardDate(e.target.value)}
                className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-bujo-text outline-none cursor-pointer font-mono"
              />
              <input
                type="time"
                value={standardTime}
                onChange={(e) => setStandardTime(e.target.value)}
                className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-bujo-text outline-none cursor-pointer font-mono w-24"
              />
            </div>

            <div className="flex gap-2">
              {(standardInput || standardTime || standardIcon) && (
                <button
                  type="button"
                  onClick={handleClearInputs}
                  className="px-3 py-2 bg-zinc-200/50 dark:bg-white/5 text-bujo-text border border-zinc-350 dark:border-white/15 rounded-xl text-xs font-semibold hover:bg-zinc-300/50 dark:hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-bujo-highlight text-white rounded-xl text-xs font-semibold hover:opacity-95 transition-opacity cursor-pointer shrink-0"
              >
                Salvar
              </button>
            </div>
          </div>
        </form>

        {/* Quick Context Tag Appenders */}
        <div className="flex items-center gap-1.5 flex-wrap mt-3 pl-1 no-print">
          <span className="text-[10px] text-zinc-400 font-mono tracking-wider">💡 Contextos GTD (Adicionar à tarefa):</span>
          {['@computador', '@celular', '@rua', '@casa', '@trabalho', '@aguardando'].map(ctx => {
            const icons: { [key: string]: string } = {
              '@computador': '💻 ',
              '@celular': '📱 ',
              '@rua': '🚶 ',
              '@casa': '🏠 ',
              '@trabalho': '💼 ',
              '@aguardando': '⏳ '
            };
            return (
              <button
                key={ctx}
                type="button"
                onClick={() => {
                  if (!standardInput.includes(ctx)) {
                    const space = standardInput.length > 0 && !standardInput.endsWith(' ') ? ' ' : '';
                    setStandardInput(standardInput + space + ctx);
                  }
                }}
                className="px-2 py-1 bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-white/5 rounded-lg text-[10px] font-bold text-bujo-text transition-all cursor-pointer"
              >
                {icons[ctx] || ''}{ctx.replace('@', '')}
              </button>
            );
          })}
        </div>

        {showAutocomplete && filteredCollections.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto animate-fade-in">
            {filteredCollections.map((col: any, idx: number) => (
              <div
                key={col.id}
                onClick={() => selectCollectionAutocomplete(col.name)}
                className={`px-4 py-2 text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                  idx === autocompleteIndex 
                    ? 'bg-bujo-highlight/10 text-bujo-highlight font-bold' 
                    : 'text-bujo-text hover:bg-zinc-100 dark:hover:bg-white/5'
                }`}
              >
                <span className="text-base">{col.icon}</span>
                <span>{col.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {renderRealTimeSuggestions(standardInput, 'task', createStandardTaskWithSuggestions)}

      {/* Context Filter Row */}
      <div className="flex items-center gap-1.5 flex-wrap no-print py-2.5 border-t border-zinc-200/40 dark:border-white/10 mt-4">
        <span className="text-[10px] text-zinc-400 font-mono tracking-wider mr-1">Filtrar por Contexto:</span>
        <button
          type="button"
          onClick={() => setSelectedContext(null)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedContext === null 
              ? 'bg-zinc-800 dark:bg-white text-white dark:text-zinc-900 ring-1 ring-zinc-800 dark:ring-white' 
              : 'bg-zinc-150 dark:bg-white/5 text-zinc-500 hover:text-bujo-text border border-zinc-200 dark:border-white/5'
          }`}
        >
          Todos ({dateItems.length})
        </button>
        {['@computador', '@celular', '@rua', '@casa', '@trabalho', '@aguardando'].map(ctx => {
          const count = dateItems.filter(item => item.content.toLowerCase().includes(ctx)).length;
          if (count === 0) return null;
          
          const isActive = selectedContext === ctx;
          const colors: { [key: string]: string } = {
            '@computador': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
            '@celular': 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30',
            '@rua': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
            '@casa': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
            '@trabalho': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
            '@aguardando': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
          };
          const activeColors: { [key: string]: string } = {
            '@computador': 'bg-blue-500 text-white border-blue-500',
            '@celular': 'bg-teal-500 text-white border-teal-500',
            '@rua': 'bg-amber-500 text-white border-amber-500',
            '@casa': 'bg-emerald-500 text-white border-emerald-500',
            '@trabalho': 'bg-purple-500 text-white border-purple-500',
            '@aguardando': 'bg-rose-500 text-white border-rose-500'
          };
          
          const icons: { [key: string]: string } = {
            '@computador': '💻 ',
            '@celular': '📱 ',
            '@rua': '🚶 ',
            '@casa': '🏠 ',
            '@trabalho': '💼 ',
            '@aguardando': '⏳ '
          };

          return (
            <button
              key={ctx}
              type="button"
              onClick={() => setSelectedContext(isActive ? null : ctx)}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                isActive 
                  ? activeColors[ctx] 
                  : `${colors[ctx]} hover:opacity-85`
              }`}
            >
              {icons[ctx] || ''}
              {ctx.replace('@', '')} ({count})
            </button>
          );
        })}
      </div>

      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1.5 scroll-smooth">
        {filteredDateItems.map(item => (
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
            addSubtask={(taskId) => addSubtask(taskId, newSubtaskText, setNewSubtaskText)}
            getSubtaskCompletionString={getSubtaskCompletionString}
          />
        ))}

        {filteredDateItems.length === 0 && (
          <div className="p-8 rounded-2xl bg-zinc-200/10 dark:bg-white/[0.01] border border-zinc-200/30 dark:border-white/5 text-center text-zinc-500 italic text-sm">
            {selectedContext 
              ? 'Nenhuma entrada correspondente a este contexto.' 
              : 'Nenhuma entrada para este dia. Adicione algo no formulário acima!'}
          </div>
        )}
      </div>
    </div>
  );
};
