import React, { useState } from 'react';
import { 
  Plus, Calendar, Trash2, Check, Cloud, 
  Search, Folder, Pin, Clock, Tag, ChevronDown, 
  BookOpen, Edit3, X, Inbox, AlertCircle
} from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';
import { BujoItem } from '../../../types';
import { DateInput } from '../../../components/common/DateInput';

// Categories for Someday/Maybe items
const CATEGORIES = [
  { 
    id: 'projects', 
    label: 'Projetos & Ideias', 
    icon: '💡', 
    color: 'border-amber-400/30 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/10 text-amber-900 dark:text-amber-200',
    stickyColor: 'bg-[#FFF9D6] border-[#E8DD95] text-[#4A4212] dark:bg-[#2F2C1A] dark:border-[#524D28] dark:text-[#EAE3B6]' 
  },
  { 
    id: 'media', 
    label: 'Ler, Assistir & Estudar', 
    icon: '📚', 
    color: 'border-blue-400/30 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/10 text-blue-900 dark:text-blue-200',
    stickyColor: 'bg-[#E3F4FF] border-[#B8DEFC] text-[#123954] dark:bg-[#1A2633] dark:border-[#2C4A66] dark:text-[#BCE2FF]'
  },
  { 
    id: 'travel', 
    label: 'Viagens & Lugares', 
    icon: '✈️', 
    color: 'border-emerald-400/30 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-900 dark:text-emerald-200',
    stickyColor: 'bg-[#E8FCEF] border-[#BFECD0] text-[#124C28] dark:bg-[#172D21] dark:border-[#284E37] dark:text-[#BEECD2]'
  },
  { 
    id: 'shopping', 
    label: 'Desejos & Compras', 
    icon: '🛒', 
    color: 'border-purple-400/30 dark:border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/10 text-purple-900 dark:text-purple-200',
    stickyColor: 'bg-[#F9EBFF] border-[#EDBDF7] text-[#491654] dark:bg-[#2E1A33] dark:border-[#4B2857] dark:text-[#F3CEFA]'
  },
  { 
    id: 'growth', 
    label: 'Habilidades & Foco', 
    icon: '🌱', 
    color: 'border-teal-400/30 dark:border-teal-500/20 bg-teal-50/50 dark:bg-teal-950/10 text-teal-900 dark:text-teal-200',
    stickyColor: 'bg-[#E6FBF8] border-[#BDF7EE] text-[#124941] dark:bg-[#182C29] dark:border-[#264D47] dark:text-[#C1FAF0]'
  },
  { 
    id: 'general', 
    label: 'Diversos & Geral', 
    icon: '📂', 
    color: 'border-rose-400/30 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/10 text-rose-900 dark:text-rose-200',
    stickyColor: 'bg-[#FFEBEB] border-[#FCD2D2] text-[#541212] dark:bg-[#2F1A1A] dark:border-[#4E2B2B] dark:text-[#FFCECE]'
  }
];

export const SomedayMaybeTab = () => {
  const {
    somedayItems,
    handleAddSomedayItem,
    handleDeleteSomedayItem,
    handleScheduleSomedayItem,
    handleToggleSomedayItem,
    handleUpdateSomedayItemCategory,
    handleEditSomedayItemContent
  } = useBujo();

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'task' | 'event' | 'note'>('all');
  
  // Tab states for responsive layout
  const [activeMobileTab, setActiveMobileTab] = useState<'inbox' | 'collections'>('inbox');

  // Input states for main Capturer
  const [inputContent, setInputContent] = useState('');
  const [inputType, setInputType] = useState<'task' | 'event' | 'note'>('task');
  const [inputCategory, setInputCategory] = useState<string>('');

  // Inline inputs for specific category cards
  const [cardInputs, setCardInputs] = useState<{ [catId: string]: string }>({});

  // Inline editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Dropdown states
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [scheduleDates, setScheduleDates] = useState<{ [id: string]: string }>({});

  // Deterministic sticky note rotation based on ID
  const getStickyRotation = (id: string) => {
    let sum = 0;
    for (let i = 0; i < id.length; i++) {
      sum += id.charCodeAt(i);
    }
    const rotations = ['-rotate-1', 'rotate-1', '-rotate-1.5', 'rotate-1.5', '-rotate-2', 'rotate-2', '-rotate-0.5', 'rotate-0.5'];
    return rotations[sum % rotations.length];
  };

  // Sticky note color mapping
  const getStickyColor = (item: BujoItem) => {
    if (item.category) {
      const cat = CATEGORIES.find(c => c.id === item.category);
      if (cat) return cat.stickyColor;
    }
    
    // Fallback based on item type if uncategorized
    switch (item.type) {
      case 'task':
        return 'bg-[#FFF8C7] border-[#F2E7A0] dark:bg-[#2C291A] dark:border-[#4E4826] text-[#4A4212] dark:text-amber-200';
      case 'event':
        return 'bg-[#EDF9FF] border-[#CAE9FA] dark:bg-[#1A252C] dark:border-[#263D4E] text-[#123954] dark:text-sky-200';
      case 'note':
        return 'bg-[#EFFFF4] border-[#CEEBD4] dark:bg-[#1A2C1F] dark:border-[#264E30] text-[#124C28] dark:text-emerald-200';
      default:
        return 'bg-[#FCFAF7] border-[#E4DBC5] dark:bg-[#1B1917] dark:border-zinc-800 text-bujo-text';
    }
  };

  // Handle Main Form Submission (Inbox Add)
  const handleSubmitMain = (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputContent.trim();
    if (!content) return;
    handleAddSomedayItem(content, inputType, inputCategory || undefined);
    setInputContent('');
    setInputCategory('');
  };

  // Handle Specific Category Card Quick Add
  const handleSubmitCategoryQuick = (categoryId: string) => {
    const content = cardInputs[categoryId]?.trim();
    if (!content) return;
    handleAddSomedayItem(content, 'task', categoryId);
    setCardInputs(prev => ({ ...prev, [categoryId]: '' }));
  };

  // Start Editing Item
  const handleStartEdit = (item: BujoItem) => {
    setEditingItemId(item.id);
    setEditingText(item.content);
  };

  // Save Editing Item
  const handleSaveEdit = (id: string) => {
    if (editingText.trim()) {
      handleEditSomedayItemContent(id, editingText.trim());
    }
    setEditingItemId(null);
  };

  // Filter somedayItems based on Search Query and Type
  const filteredItems = somedayItems.filter(item => {
    const matchesSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // Separate uncategorized (Inbox) vs categorized items
  const uncategorizedItems = filteredItems.filter(item => !item.category);
  const getItemsByCategory = (catId: string) => filteredItems.filter(item => item.category === catId);

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in pr-2 overflow-y-auto pb-8">
      {/* Top Banner: Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-200/20 dark:bg-white/[0.02] border border-zinc-200/40 dark:border-white/5 p-3.5 rounded-3xl no-print">
        <div className="flex-1 flex items-center gap-2 bg-zinc-200/40 dark:bg-white/5 border border-zinc-300/30 dark:border-white/10 px-3 py-1.5 rounded-2xl">
          <Search className="w-4 h-4 text-zinc-450 shrink-0" />
          <input
            type="text"
            placeholder="Pesquisar ideias e capturas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs text-bujo-text placeholder:text-zinc-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-zinc-400 hover:text-bujo-text">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'task', 'event', 'note'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                filterType === type
                  ? 'bg-bujo-accent text-white shadow-sm'
                  : 'bg-zinc-200/45 dark:bg-white/5 text-zinc-500 hover:text-bujo-text'
              }`}
            >
              {type === 'all' ? 'Tudo' : type === 'task' ? 'Tarefas' : type === 'event' ? 'Eventos' : 'Notas'}
            </button>
          ))}
        </div>
      </div>

      {/* Segmented Control for Mobile Screen Navigation */}
      <div className="flex md:hidden bg-zinc-200/30 dark:bg-white/5 p-1 rounded-2xl border border-zinc-200/40 dark:border-white/5 no-print">
        <button
          onClick={() => setActiveMobileTab('inbox')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMobileTab === 'inbox'
              ? 'bg-bujo-highlight text-white shadow-sm font-semibold'
              : 'text-zinc-500'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          Inbox de Ideias ({uncategorizedItems.length})
        </button>
        <button
          onClick={() => setActiveMobileTab('collections')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMobileTab === 'collections'
              ? 'bg-bujo-highlight text-white shadow-sm font-semibold'
              : 'text-zinc-500'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Coleções Organizadas
        </button>
      </div>

      {/* Main Physically-Themed Notebook Spread Container */}
      <div className="relative min-h-[600px] border border-[#E4DBC5] dark:border-zinc-800 rounded-3xl bg-[#FCFAF7] dark:bg-[#151413] shadow-xl flex flex-col md:flex-row overflow-hidden">
        
        {/* Binder Crease Seam Line */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#E4DBC5] via-zinc-400/20 to-[#E4DBC5] dark:from-zinc-800 dark:via-zinc-700/10 dark:to-zinc-800 z-10 shadow-[0_0_10px_rgba(0,0,0,0.15)] pointer-events-none"></div>

        {/* Realistic Binder Rings */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-0 bottom-0 flex-col justify-around py-12 z-20 pointer-events-none">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center justify-center">
              <div className="w-8 h-4 rounded-full border border-zinc-350 dark:border-zinc-700 bg-gradient-to-r from-zinc-200 via-white to-zinc-200 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800 shadow-[0_3px_5px_rgba(0,0,0,0.1)]"></div>
            </div>
          ))}
        </div>

        {/* PAGE 1: LEFT PAGE - BRAIN DUMP / STICKY NOTES INBOX */}
        <div className={`flex-1 p-5 lg:p-7 flex flex-col border-r border-[#E4DBC5]/50 dark:border-zinc-850 bg-[#FAF7F2] dark:bg-[#151413] bg-[radial-gradient(#d5cdc4_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#302c28_1.2px,transparent_1.2px)] [background-size:16px_16px] ${
          activeMobileTab === 'inbox' ? 'flex' : 'hidden md:flex'
        }`}>
          {/* Page Header */}
          <div className="border-b border-zinc-200/50 dark:border-white/5 pb-4 mb-6">
            <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest bg-zinc-200/40 dark:bg-white/5 px-2 py-0.5 rounded">
              Descarregar a Mente
            </span>
            <h3 className="text-2xl font-light text-bujo-text mt-1.5">
              Rascunhos & <span className="italic font-normal font-serif text-bujo-accent">Brain Dump Inbox</span>
            </h3>
            <p className="text-[10.5px] text-zinc-500 leading-relaxed mt-1">
              Escreva ideias soltas que você queira guardar. Elas ficam salvas como notas adesivas até serem organizadas.
            </p>
          </div>

          {/* Quick Capture Ruled Input Form */}
          <form onSubmit={handleSubmitMain} className="p-4 rounded-2xl bg-[#FCFAF7] dark:bg-[#191817] border border-[#E4DBC5] dark:border-zinc-800 shadow-sm space-y-3.5 mb-6 no-print">
            <div className="relative">
              <span className="absolute left-0 top-3 text-red-300 dark:text-red-900/50 text-xs font-mono font-bold select-none border-r pr-2">IN</span>
              <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="Qual o seu próximo insight, projeto futuro ou livro para ler?"
                className="w-full h-16 bg-transparent border-none outline-none text-xs text-bujo-text placeholder:text-zinc-650 resize-none font-sans pl-10 pt-1 focus:ring-0"
                required
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-200/50 dark:border-white/5">
              <div className="flex items-center gap-2">
                {/* Type Selection dots */}
                <div className="flex items-center gap-1 bg-zinc-200/40 dark:bg-white/5 p-1 rounded-xl border border-zinc-300/30 dark:border-white/5 text-[10px]">
                  {(['task', 'event', 'note'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInputType(type)}
                      className={`px-2 py-0.5 rounded-lg transition-all capitalize ${
                        inputType === type ? 'bg-bujo-highlight text-white font-semibold' : 'text-zinc-500 hover:text-bujo-text'
                      }`}
                    >
                      {type === 'task' ? 'Tarefa' : type === 'event' ? 'Evento' : 'Nota'}
                    </button>
                  ))}
                </div>

                {/* Optional Quick Category */}
                <select
                  value={inputCategory}
                  onChange={(e) => setInputCategory(e.target.value)}
                  className="bg-zinc-200/40 dark:bg-white/5 border border-zinc-300/30 dark:border-white/5 rounded-xl px-2 py-1 text-[10px] text-bujo-text outline-none cursor-pointer"
                >
                  <option value="">📂 Enviar p/ Inbox</option>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="px-3.5 py-1.5 bg-bujo-highlight hover:opacity-95 text-white font-bold rounded-xl text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>
          </form>

          {/* Sticky Notes Grid Area */}
          <div className="flex-1 min-h-[300px]">
            {uncategorizedItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[#E4DBC5] dark:border-zinc-800 rounded-3xl bg-zinc-200/5 dark:bg-white/[0.01]">
                <Inbox className="w-8 h-8 text-zinc-400 stroke-1 mb-2.5" />
                <p className="text-xs text-zinc-500 font-medium">Sua Inbox de ideias está limpa!</p>
                <p className="text-[10px] text-zinc-650 max-w-xs mt-1 leading-relaxed">
                  Não deixe ideias se perderem. Escreva acima para descarregá-las como notas adesivas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1 pb-4">
                {uncategorizedItems.map((item) => {
                  const isCompleted = item.status === 'completed';
                  const stickyRot = getStickyRotation(item.id);
                  const stickyCol = getStickyColor(item);
                  
                  return (
                    <div
                      key={item.id}
                      className={`relative p-4 rounded-xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:rotate-0 hover:shadow-md ${stickyRot} ${stickyCol} flex flex-col justify-between min-h-[120px] group`}
                    >
                      {/* Realistic Washi Tape Sticker effect */}
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-white/30 dark:bg-white/10 backdrop-blur-sm border-x border-zinc-200/40 rotate-1 shadow-[0_1px_2px_rgba(0,0,0,0.03)] select-none"></div>

                      <div className="space-y-1.5 mt-1">
                        {/* Type Indicator */}
                        <div className="flex items-center justify-between">
                          <span className="text-[8.5px] font-mono tracking-widest uppercase opacity-60">
                            {item.type === 'task' ? 'Tarefa' : item.type === 'event' ? 'Evento' : 'Nota'}
                          </span>
                          {item.type === 'task' && (
                            <button
                              onClick={() => handleToggleSomedayItem(item.id)}
                              className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                                isCompleted
                                  ? 'bg-bujo-accent border-bujo-accent text-white'
                                  : 'bg-transparent border-zinc-500/50 hover:border-bujo-accent'
                              }`}
                            >
                              {isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </button>
                          )}
                        </div>

                        {/* Inline Content Edit */}
                        {editingItemId === item.id ? (
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onBlur={() => handleSaveEdit(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(item.id);
                              if (e.key === 'Escape') setEditingItemId(null);
                            }}
                            className="w-full bg-white/60 dark:bg-black/20 border border-bujo-highlight text-xs rounded p-1 outline-none font-sans"
                            autoFocus
                          />
                        ) : (
                          <p 
                            className={`text-xs font-serif leading-relaxed break-words pr-2 ${
                              isCompleted ? 'line-through opacity-50' : 'font-medium'
                            }`}
                            onDoubleClick={() => handleStartEdit(item)}
                          >
                            {item.content}
                          </p>
                        )}
                      </div>

                      {/* Sticky Actions */}
                      <div className="flex items-center justify-between gap-1.5 pt-3 mt-2 border-t border-zinc-500/10 no-print">
                        <div className="flex items-center gap-1">
                          {/* Folder dropdown to categorize */}
                          <div className="relative">
                            <button
                              onClick={() => setActiveDropdownId(activeDropdownId === item.id ? null : item.id)}
                              className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-600 dark:text-zinc-350 transition-colors"
                              title="Organizar em categoria"
                            >
                              <Folder className="w-3.5 h-3.5" />
                            </button>

                            {activeDropdownId === item.id && (
                              <div className="absolute left-0 bottom-full mb-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-1 z-30 w-48 animate-scale-in">
                                <span className="text-[8.5px] uppercase font-bold text-zinc-400 p-1 block">Mover para:</span>
                                {CATEGORIES.map(c => (
                                  <button
                                    key={c.id}
                                    onClick={() => {
                                      handleUpdateSomedayItemCategory(item.id, c.id);
                                      setActiveDropdownId(null);
                                    }}
                                    className="w-full text-left px-2 py-1 text-[10px] font-medium hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md text-bujo-text transition-colors flex items-center gap-1.5"
                                  >
                                    <span>{c.icon}</span>
                                    <span>{c.label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Quick Calendar Migration */}
                          <div className="flex items-center gap-1 bg-white/40 dark:bg-black/10 p-0.5 rounded-lg border border-zinc-400/20">
                            <DateInput
                              value={scheduleDates[item.id] || ''}
                              onChange={(val) => setScheduleDates(prev => ({ ...prev, [item.id]: val }))}
                              inputClassName="text-[8.5px] w-14"
                            />
                            <button
                              onClick={() => {
                                const date = scheduleDates[item.id];
                                if (!date) return;
                                handleScheduleSomedayItem(item.id, date);
                              }}
                              disabled={!scheduleDates[item.id]}
                              className="p-0.5 bg-bujo-accent text-white disabled:opacity-40 rounded hover:opacity-95 transition-opacity"
                              title="Agendar no Daily Log"
                            >
                              <Calendar className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-550 dark:text-zinc-350 transition-colors"
                            title="Editar texto"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSomedayItem(item.id)}
                            className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded text-zinc-550 dark:text-zinc-300 transition-colors"
                            title="Mover para lixeira"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* PAGE 2: RIGHT PAGE - CATEGORIZED COLLECTION INDEX CARDS */}
        <div className={`flex-1 p-5 lg:p-7 flex flex-col bg-[#FCFAF7] dark:bg-[#151413] bg-[radial-gradient(#d5cdc4_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#302c28_1.2px,transparent_1.2px)] [background-size:16px_16px] ${
          activeMobileTab === 'collections' ? 'flex' : 'hidden md:flex'
        }`}>
          {/* Page Header */}
          <div className="border-b border-zinc-200/50 dark:border-white/5 pb-4 mb-6">
            <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest bg-zinc-200/40 dark:bg-white/5 px-2 py-0.5 rounded">
              Coleções GTD
            </span>
            <h3 className="text-2xl font-light text-bujo-text mt-1.5">
              Quadros Organizados — <span className="italic font-normal font-serif text-bujo-accent">Algum Dia / Talvez</span>
            </h3>
            <p className="text-[10.5px] text-zinc-550 leading-relaxed mt-1">
              Ideias catalogadas em listas temáticas para manter seu foco limpo. Double-click no item para editar o texto.
            </p>
          </div>

          {/* Categorized List Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5 max-h-[660px] overflow-y-auto pr-1 pb-4 scroll-smooth">
            {CATEGORIES.map(category => {
              const catItems = getItemsByCategory(category.id);
              const cardInputVal = cardInputs[category.id] || '';

              return (
                <div
                  key={category.id}
                  className={`relative p-4 rounded-2xl border bg-white dark:bg-[#1C1B1A] border-[#E4DBC5] dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]`}
                >
                  {/* Styled Header mimicking index cards tabs */}
                  <div className={`absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-t-lg border-t border-x text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-[0_-1px_2px_rgba(0,0,0,0.02)] ${category.color}`}>
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                    <span className="ml-1 opacity-70">({catItems.length})</span>
                  </div>

                  {/* Ruled notebook background card container */}
                  <div className="flex-1 mt-3 pl-1 pr-1 pb-2 overflow-y-auto max-h-[170px] bg-[linear-gradient(to_bottom,transparent_23px,#f1ead8_24px)] dark:bg-[linear-gradient(to_bottom,transparent_23px,#2c2925_24px)] bg-[size:100%_24px] min-h-[100px] border-l border-red-200/60 dark:border-red-950/30 pl-3">
                    {catItems.length === 0 ? (
                      <p className="text-[10px] text-zinc-400 italic pt-2">Sem itens nesta coleção.</p>
                    ) : (
                      <div className="space-y-[6px] pt-1">
                        {catItems.map(item => {
                          const isCompleted = item.status === 'completed';
                          return (
                            <div key={item.id} className="flex items-start justify-between gap-1 text-[11px] group/item min-h-[18px]">
                              {/* Classic Bujo Signifiers & Content */}
                              <div className="flex items-start gap-1.5 min-w-0 flex-1">
                                {item.type === 'task' ? (
                                  <button
                                    onClick={() => handleToggleSomedayItem(item.id)}
                                    className="text-zinc-650 dark:text-zinc-350 hover:text-bujo-accent font-bold mt-[2px] transition-colors cursor-pointer shrink-0"
                                  >
                                    {isCompleted ? (
                                      <span className="text-[9.5px] line-through text-zinc-400 dark:text-zinc-600 block leading-none select-none">✕</span>
                                    ) : (
                                      <span className="text-sm block leading-none select-none">•</span>
                                    )}
                                  </button>
                                ) : item.type === 'event' ? (
                                  <span className="text-bujo-accent text-[8.5px] font-bold mt-[4px] shrink-0 select-none">○</span>
                                ) : (
                                  <span className="text-zinc-450 dark:text-zinc-550 text-[10px] mt-[2px] shrink-0 select-none">–</span>
                                )}

                                {/* Render Text */}
                                {editingItemId === item.id ? (
                                  <input
                                    type="text"
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    onBlur={() => handleSaveEdit(item.id)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveEdit(item.id);
                                      if (e.key === 'Escape') setEditingItemId(null);
                                    }}
                                    className="bg-zinc-100 dark:bg-zinc-900 text-[11px] rounded outline-none border border-bujo-highlight px-1 py-px w-full font-sans"
                                    autoFocus
                                  />
                                ) : (
                                  <span
                                    onDoubleClick={() => handleStartEdit(item)}
                                    className={`truncate cursor-text hover:text-bujo-highlight font-sans leading-tight ${
                                      isCompleted ? 'line-through text-zinc-400 dark:text-zinc-600' : 'text-zinc-800 dark:text-zinc-300'
                                    }`}
                                    title="Double-click para editar"
                                  >
                                    {item.content}
                                  </span>
                                )}
                              </div>

                              {/* Hover actions */}
                              <div className="flex items-center gap-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 bg-white dark:bg-[#1C1B1A] pl-1.5 no-print">
                                {/* Return to Inbox button */}
                                <button
                                  onClick={() => handleUpdateSomedayItemCategory(item.id, '')}
                                  className="text-zinc-400 hover:text-bujo-accent"
                                  title="Mover de volta para Inbox"
                                >
                                  <Inbox className="w-3 h-3" />
                                </button>

                                {/* Quick Folder change */}
                                <div className="relative">
                                  <button
                                    onClick={() => setActiveDropdownId(activeDropdownId === item.id ? null : item.id)}
                                    className="text-zinc-450 hover:text-bujo-accent"
                                    title="Alterar categoria"
                                  >
                                    <Folder className="w-3 h-3" />
                                  </button>
                                  {activeDropdownId === item.id && (
                                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-1 z-30 w-40 animate-scale-in">
                                      {CATEGORIES.map(c => (
                                        <button
                                          key={c.id}
                                          onClick={() => {
                                            handleUpdateSomedayItemCategory(item.id, c.id);
                                            setActiveDropdownId(null);
                                          }}
                                          className="w-full text-left px-2 py-0.5 text-[9px] hover:bg-zinc-100 dark:hover:bg-white/5 rounded text-bujo-text transition-colors flex items-center gap-1"
                                        >
                                          <span>{c.icon}</span>
                                          <span>{c.label}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Calendar picker sticker */}
                                <div className="flex items-center gap-0.5 bg-zinc-200/50 dark:bg-white/5 px-1 rounded border border-zinc-300/30">
                                  <DateInput
                                    value=""
                                    onChange={(val) => {
                                      if (val) {
                                        handleScheduleSomedayItem(item.id, val);
                                      }
                                    }}
                                    inputClassName="text-[8px] w-12"
                                  />
                                </div>

                                <button
                                  onClick={() => handleDeleteSomedayItem(item.id)}
                                  className="text-zinc-405 hover:text-red-500"
                                  title="Mover para lixeira"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Quick Add */}
                  <div className="mt-2 border-t border-zinc-200/50 dark:border-white/5 pt-2 flex items-center gap-1 no-print">
                    <input
                      type="text"
                      placeholder="+ Escrever tarefa..."
                      value={cardInputVal}
                      onChange={(e) => setCardInputs(prev => ({ ...prev, [category.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSubmitCategoryQuick(category.id);
                      }}
                      className="flex-1 bg-transparent border-none outline-none text-[10px] text-bujo-text placeholder:text-zinc-450 py-0.5 focus:ring-0"
                    />
                    {cardInputVal.trim() && (
                      <button
                        onClick={() => handleSubmitCategoryQuick(category.id)}
                        className="p-1 bg-bujo-accent/10 hover:bg-bujo-accent/20 text-bujo-accent rounded"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
};
