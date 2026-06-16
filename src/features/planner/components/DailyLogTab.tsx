import { useState } from 'react';
import { Download, Printer, ChevronLeft, ChevronRight, X, Search, ArrowDownAZ } from 'lucide-react';
import { BulletItem } from './BulletItem';
import { useBujo } from '../../../context/BujoContext';

export const BUJO_ICONS = [
  { emoji: '📝', name: 'nota', tooltip: 'Anotação / Nota' },
  { emoji: '📅', name: 'data', tooltip: 'Compromisso / Data' },
  { emoji: '🎯', name: 'objetivo', tooltip: 'Objetivo / Foco' },
  { emoji: '🚀', name: 'projeto', tooltip: 'Lançamento / Progresso' },
  { emoji: '💡', name: 'ideia', tooltip: 'Ideia / Insight' },
  { emoji: '💼', name: 'trabalho', tooltip: 'Trabalho / Negócios' },
  { emoji: '📚', name: 'estudo', tooltip: 'Estudo / Leitura' },
  { emoji: '🏃‍♂️', name: 'esporte', tooltip: 'Exercício / Corrida' },
  { emoji: '🍎', name: 'saude', tooltip: 'Alimentação / Saúde' },
  { emoji: '✈️', name: 'viagem', tooltip: 'Viagem / Lazer' },
  { emoji: '🛒', name: 'compras', tooltip: 'Compras / Mercado' },
  { emoji: '🎨', name: 'arte', tooltip: 'Arte / Design' },
  { emoji: '🎵', name: 'musica', tooltip: 'Música / Som' },
  { emoji: '🍿', name: 'lazer', tooltip: 'Filme / Lazer' },
  { emoji: '🏠', name: 'casa', tooltip: 'Casa / Lar' },
  { emoji: '👨‍👩‍👧‍👦', name: 'familia', tooltip: 'Família / Relacionamento' },
  { emoji: '🔑', name: 'chave', tooltip: 'Acesso / Chave' },
  { emoji: '💬', name: 'ideia', tooltip: 'Mensagem / Ideia' },
  { emoji: '⚠️', name: 'alerta', tooltip: 'Alerta / Urgente' },
  { emoji: '🛠️', name: 'ferramenta', tooltip: 'Ferramenta / Ajuste' },
  { emoji: '💰', name: 'dinheiro', tooltip: 'Dinheiro / Finanças' },
  { emoji: '🏆', name: 'conquista', tooltip: 'Prêmio / Conquista' },
  { emoji: '🧘‍♂️', name: 'mente', tooltip: 'Meditação / Foco' },
  { emoji: '🩺', name: 'saude', tooltip: 'Médico / Saúde' },
  { emoji: '🍕', name: 'comida', tooltip: 'Comida / Lanche' },
  { emoji: '🚗', name: 'viagem', tooltip: 'Carro / Viagem' },
  { emoji: '⭐', name: 'favorito', tooltip: 'Estrela / Destaque' },
  { emoji: '❤️', name: 'amor', tooltip: 'Coração / Amor' },
  { emoji: '🔥', name: 'fogo', tooltip: 'Prioridade / Fogo' },
  { emoji: '🔋', name: 'energia', tooltip: 'Bateria / Energia' },
  { emoji: '💤', name: 'descanso', tooltip: 'Sono / Descanso' }
];

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

  // New states for search, sorting, and metadata inputs
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'energy' | 'complexity' | 'time'>('recent');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [standardEnergy, setStandardEnergy] = useState<number>(1);
  const [standardComplexity, setStandardComplexity] = useState<number>(1);
  const [standardExecutionTime, setStandardExecutionTime] = useState<string>('');
  const [iconSearch, setIconSearch] = useState('');

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
  };

  const dateItems = items.filter(i => i.date === selectedDate);

  // Filter items based on search text, selected context, and selected icon category
  const filteredDateItems = dateItems.filter(item => {
    // Context filter
    if (selectedContext) {
      if (!item.content.toLowerCase().includes(selectedContext.toLowerCase())) {
        return false;
      }
    }

    // Category / Icon filter
    if (selectedCategory) {
      if (!item.icon) return false;
      const matchingEmojis = BUJO_ICONS.filter(i => i.name === selectedCategory || i.tooltip.toLowerCase().includes(selectedCategory)).map(i => i.emoji);
      if (!matchingEmojis.includes(item.icon)) {
        return false;
      }
    }

    // Text search filter (checking content and subtasks content)
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      const contentMatches = item.content.toLowerCase().includes(query);
      const subtaskMatches = item.subtasks?.some(sub => sub.content.toLowerCase().includes(query)) || false;
      if (!contentMatches && !subtaskMatches) {
        return false;
      }
    }

    return true;
  });

  // Sort items based on selected sorting
  const sortedDateItems = [...filteredDateItems].sort((a, b) => {
    if (sortBy === 'oldest') {
      return a.id.localeCompare(b.id);
    }
    if (sortBy === 'energy') {
      const aVal = a.energy || 0;
      const bVal = b.energy || 0;
      return bVal - aVal;
    }
    if (sortBy === 'complexity') {
      const aVal = a.complexity || 0;
      const bVal = b.complexity || 0;
      return bVal - aVal;
    }
    if (sortBy === 'time') {
      const aVal = a.executionTime || 0;
      const bVal = b.executionTime || 0;
      return bVal - aVal;
    }
    // Default: 'recent' (descending id comparison)
    return b.id.localeCompare(a.id);
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

      <div className="relative bg-zinc-200/30 dark:bg-white/5 p-3 rounded-2xl border border-zinc-200/40 dark:border-white/10 no-print">
        <form onSubmit={handleLocalSubmit} className="flex flex-col gap-3">
          {/* Row 1: Primary Inputs */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-center w-full">
            {/* Type Selector (Segmented control) */}
            <div className="flex bg-zinc-200/50 dark:bg-zinc-950/60 p-1 rounded-xl border border-zinc-200/40 dark:border-white/5 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
              {(['task', 'event', 'note'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setStandardType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex-1 sm:flex-initial text-center ${
                    standardType === t
                      ? 'bg-bujo-highlight text-white shadow-sm'
                      : 'text-zinc-500 hover:text-bujo-text'
                  }`}
                >
                  {t === 'task' ? '• Tarefa' : t === 'event' ? '○ Evento' : '- Nota'}
                </button>
              ))}
            </div>

            {/* Icon Picker Trigger */}
            <div className="relative shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowIconDropdown(!showIconDropdown)}
                className="w-full sm:w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-white/10 flex items-center justify-center text-sm hover:border-bujo-highlight hover:bg-zinc-200 dark:hover:bg-white/10 transition-all cursor-pointer gap-2 sm:gap-0"
                title="Escolher Ícone/Desenho"
              >
                <span className="sm:hidden text-xs text-zinc-500 font-semibold">Ícone:</span>
                <span>{standardIcon || '🎨'}</span>
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
                  <input
                    type="text"
                    placeholder="Pesquisar ícones..."
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    className="w-full px-2 py-1 mb-2 text-[10px] rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-250 dark:border-white/10 text-bujo-text placeholder-zinc-500 outline-none"
                  />
                  <div className="grid grid-cols-6 gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {BUJO_ICONS.filter(icon => 
                      icon.name.toLowerCase().includes(iconSearch.toLowerCase()) || 
                      icon.tooltip.toLowerCase().includes(iconSearch.toLowerCase())
                    ).map(icon => (
                      <button
                        key={icon.emoji}
                        type="button"
                        onClick={() => {
                          setStandardIcon(icon.emoji);
                          setShowIconDropdown(false);
                          setIconSearch('');
                        }}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-base hover:bg-zinc-150 dark:hover:bg-white/5 transition-all ${
                          standardIcon === icon.emoji ? 'bg-bujo-highlight/20 border border-bujo-highlight' : ''
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

            {/* Text Input Container with Autocomplete inside */}
            <div className="relative flex-1 flex items-center bg-zinc-100 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-white/5 rounded-xl px-3 focus-within:border-bujo-highlight/60 focus-within:ring-1 focus-within:ring-bujo-highlight/30 transition-all w-full">
              <input
                type="text"
                required
                value={standardInput}
                onChange={handleStandardInputChange}
                onKeyDown={handleStandardInputKeyDown}
                placeholder={standardType === 'task' ? "Adicionar tarefa... Use [ para coleções e @ para contextos" : standardType === 'event' ? "Adicionar evento... Use @ para contextos" : "Adicionar nota..."}
                className="bg-transparent border-none outline-none w-full text-sm text-bujo-text placeholder:text-zinc-500 py-2 pr-8"
              />
              {(standardInput || standardTime || standardIcon) && (
                <button
                  type="button"
                  onClick={handleClearInputs}
                  className="absolute right-2 p-1 rounded-full hover:bg-zinc-200/60 dark:hover:bg-white/10 text-zinc-400 hover:text-bujo-text transition-colors cursor-pointer"
                  title="Limpar formulário"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {showAutocomplete && filteredCollections.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto animate-fade-in">
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
          </div>

          {/* Row 2: Metadata & Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2.5 border-t border-zinc-200/40 dark:border-white/5 mt-1.5">
            {/* Metadata Fields */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Task specific: Energy, Complexity, Duration */}
              {standardType === 'task' && (
                <div className="flex items-center gap-2 bg-zinc-100/50 dark:bg-white/5 px-2.5 py-1.5 rounded-xl border border-zinc-200/40 dark:border-white/5">
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-400 select-none text-[10px] uppercase font-mono tracking-wider">Energia:</span>
                    <select
                      value={standardEnergy}
                      onChange={(e) => setStandardEnergy(Number(e.target.value))}
                      className="bg-transparent border-none text-bujo-text outline-none cursor-pointer text-xs font-semibold py-0"
                      title="Esforço / Energia (1-5)"
                    >
                      {[1, 2, 3, 4, 5].map(v => <option key={v} value={v} className="bg-zinc-950 text-white">⚡ {v}</option>)}
                    </select>
                  </div>
                  
                  <div className="w-px h-3.5 bg-zinc-200/60 dark:bg-white/15" />

                  <div className="flex items-center gap-1">
                    <span className="text-zinc-400 select-none text-[10px] uppercase font-mono tracking-wider">Complex:</span>
                    <select
                      value={standardComplexity}
                      onChange={(e) => setStandardComplexity(Number(e.target.value))}
                      className="bg-transparent border-none text-bujo-text outline-none cursor-pointer text-xs font-semibold py-0"
                      title="Complexidade (1-5)"
                    >
                      {[1, 2, 3, 4, 5].map(v => <option key={v} value={v} className="bg-zinc-950 text-white">🧠 {v}</option>)}
                    </select>
                  </div>

                  <div className="w-px h-3.5 bg-zinc-200/60 dark:bg-white/15" />

                  <div className="flex items-center gap-1">
                    <span className="text-zinc-400 select-none text-[10px] uppercase font-mono tracking-wider">Tempo:</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="min"
                      value={standardExecutionTime}
                      onChange={(e) => setStandardExecutionTime(e.target.value)}
                      className="bg-transparent border-none text-bujo-text outline-none w-10 font-mono text-xs text-center placeholder:text-zinc-500 font-semibold"
                      title="Tempo estimado (minutos)"
                    />
                    <span className="text-[10px] text-zinc-500 select-none">min</span>
                  </div>
                </div>
              )}

              {/* Date and Time selectors */}
              <div className="flex items-center gap-2 bg-zinc-100/50 dark:bg-white/5 px-2.5 py-1.5 rounded-xl border border-zinc-200/40 dark:border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400 select-none text-[10px] uppercase font-mono tracking-wider">Data:</span>
                  <input
                    type="date"
                    value={standardDate}
                    onChange={(e) => setStandardDate(e.target.value)}
                    className="bg-transparent border-none text-bujo-text outline-none cursor-pointer text-xs font-mono py-0"
                  />
                </div>
                
                <div className="w-px h-3.5 bg-zinc-200/60 dark:bg-white/15" />

                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400 select-none text-[10px] uppercase font-mono tracking-wider">Hora:</span>
                  <input
                    type="time"
                    value={standardTime}
                    onChange={(e) => setStandardTime(e.target.value)}
                    className="bg-transparent border-none text-bujo-text outline-none cursor-pointer text-xs font-mono py-0 w-16"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-auto w-full lg:w-auto justify-end">
              {(standardInput || standardTime || standardIcon) && (
                <button
                  type="button"
                  onClick={handleClearInputs}
                  className="px-3 py-1.5 bg-zinc-200/50 dark:bg-white/5 text-bujo-text border border-zinc-350 dark:border-white/15 rounded-xl text-xs font-medium hover:bg-zinc-300/50 dark:hover:bg-white/10 transition-all cursor-pointer"
                >
                  Limpar
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 bg-bujo-highlight text-white rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md shadow-bujo-highlight/10"
              >
                Cadastrar
              </button>
            </div>
          </div>
        </form>

        {/* Quick Context Tag Appenders */}
        <div className="flex items-center gap-1.5 flex-wrap mt-2.5 pt-2 border-t border-zinc-200/20 dark:border-white/5 pl-0.5">
          <span className="text-[10px] text-zinc-400 font-mono tracking-wider">💡 Sugerir Contextos:</span>
          {['@computador', '@online', '@rua', '@casa', '@trabalhando', '@mestrado', '@programando', '@aguardando'].map(ctx => {
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
                className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 border border-zinc-200/40 dark:border-white/5 rounded-lg text-[10px] font-semibold text-zinc-550 dark:text-zinc-300 transition-all cursor-pointer"
              >
                {icons[ctx] || ''}{ctx.replace('@', '')}
              </button>
            );
          })}
        </div>
      </div>

      {renderRealTimeSuggestions(standardInput, 'task', createStandardTaskWithSuggestions)}

      {/* Unified Filter & Search Dashboard */}
      <div className="bg-zinc-200/20 dark:bg-white/[0.02] border border-zinc-200/40 dark:border-white/5 rounded-2xl p-4 space-y-3.5 no-print shadow-sm">
        {/* Row 1: Search, Sort and Reset */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Pesquisar tarefas ou subtarefas..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-white/5 text-bujo-text placeholder-zinc-500 outline-none focus:border-bujo-highlight/50 transition-colors"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-bujo-text cursor-pointer p-0.5 rounded-full hover:bg-zinc-200 dark:hover:bg-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort & Reset Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase flex items-center gap-1">
                <ArrowDownAZ className="w-3.5 h-3.5" /> Ordenar por:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-zinc-100 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-bujo-text outline-none cursor-pointer font-medium"
              >
                <option value="recent" className="bg-zinc-950 text-white">Mais Recentes</option>
                <option value="oldest" className="bg-zinc-950 text-white">Mais Antigas</option>
                <option value="energy" className="bg-zinc-950 text-white">Esforço (Energia) ⚡</option>
                <option value="complexity" className="bg-zinc-950 text-white">Complexidade 🧠</option>
                <option value="time" className="bg-zinc-950 text-white">Tempo de Execução ⏱️</option>
              </select>
            </div>

            {/* Clear All Filters Button */}
            {(selectedContext !== null || selectedCategory !== null || searchText.trim() !== '') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedContext(null);
                  setSelectedCategory(null);
                  setSearchText('');
                }}
                className="text-xs text-bujo-highlight hover:underline font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        </div>

        <div className="h-px bg-zinc-200/40 dark:bg-white/5" />

        {/* Row 2: Context Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-0.5">
          <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase min-w-[75px] shrink-0">Contexto:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedContext(null)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                selectedContext === null 
                  ? 'bg-zinc-800 dark:bg-white text-white dark:text-zinc-900 border-zinc-800 dark:border-white' 
                  : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:text-bujo-text border-zinc-200/30 dark:border-white/5'
              }`}
            >
              Todos ({dateItems.length})
            </button>
            {['@computador', '@online', '@rua', '@casa', '@trabalhando', '@mestrado', '@programando', '@aguardando'].map(ctx => {
              const count = dateItems.filter(item => item.content.toLowerCase().includes(ctx)).length;
              if (count === 0) return null;
              
              const isActive = selectedContext === ctx;
              const colors: { [key: string]: string } = {
                '@computador': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                '@online': 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
                '@rua': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                '@casa': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                '@trabalhando': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
                '@mestrado': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
                '@programando': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
                '@aguardando': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              };
              const activeColors: { [key: string]: string } = {
                '@computador': 'bg-blue-500 text-white border-blue-500',
                '@online': 'bg-cyan-500 text-white border-cyan-500',
                '@rua': 'bg-amber-500 text-white border-amber-500',
                '@casa': 'bg-emerald-500 text-white border-emerald-500',
                '@trabalhando': 'bg-purple-500 text-white border-purple-500',
                '@mestrado': 'bg-indigo-500 text-white border-indigo-500',
                '@programando': 'bg-orange-500 text-white border-orange-500',
                '@aguardando': 'bg-rose-500 text-white border-rose-500'
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
      
              return (
                <button
                  key={ctx}
                  type="button"
                  onClick={() => setSelectedContext(isActive ? null : ctx)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
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
        </div>

        {/* Row 3: Category Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-0.5">
          <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase min-w-[75px] shrink-0">Temas:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                selectedCategory === null 
                  ? 'bg-zinc-800 dark:bg-white text-white dark:text-zinc-900 border-zinc-800 dark:border-white' 
                  : 'bg-zinc-150 dark:bg-white/5 text-zinc-500 hover:text-bujo-text border-zinc-200/30 dark:border-white/5'
              }`}
            >
              Todos
            </button>
            {['dinheiro', 'familia', 'saude', 'arte', 'ideia'].map(cat => {
              const matchingEmojis = BUJO_ICONS.filter(i => i.name === cat || i.tooltip.toLowerCase().includes(cat)).map(i => i.emoji);
              const count = dateItems.filter(item => item.icon && matchingEmojis.includes(item.icon)).length;
              if (count === 0) return null;
              
              const label = cat === 'dinheiro' ? '💰 Dinheiro' :
                            cat === 'familia' ? '👨‍👩‍👧‍👦 Família' :
                            cat === 'saude' ? '🩺 Saúde' :
                            cat === 'arte' ? '🎨 Arte' : '💡 Ideia';
                            
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(isActive ? null : cat)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-bujo-highlight text-white border-bujo-highlight' 
                      : 'bg-zinc-150 dark:bg-white/5 text-zinc-500 hover:text-bujo-text border-zinc-200/30 dark:border-white/5'
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1.5 scroll-smooth">
        {sortedDateItems.map(item => (
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

        {sortedDateItems.length === 0 && (
          <div className="p-8 rounded-2xl bg-zinc-200/10 dark:bg-white/[0.01] border border-zinc-200/30 dark:border-white/5 text-center text-zinc-500 italic text-sm">
            {selectedContext || selectedCategory || searchText
              ? 'Nenhuma entrada correspondente aos filtros de busca.' 
              : 'Nenhuma entrada para este dia. Adicione algo no formulário acima!'}
          </div>
        )}
      </div>
    </div>
  );
};
