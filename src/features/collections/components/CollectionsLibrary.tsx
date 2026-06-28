import { useState, useEffect } from 'react';
import { MarkdownNotebook } from '../../../components/common/MarkdownNotebook';
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
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { X, Trash2, Plus, ChevronRight, Link2, FileText, Sparkles, LayoutPanelLeft, GripVertical } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';
import { CollectionItemModal } from './CollectionItemModal';
import { SortableItem, DragHandle } from '../../../components/common/SortableItem';

export const CollectionsLibrary = () => {
  const {
    collections,
    setCollections,
    selectedCollectionId,
    setSelectedCollectionId,
    selectedItemId,
    setSelectedItemId,
    showCreateCollectionModal,
    setShowCreateCollectionModal,
    newColName,
    setNewColName,
    newColDesc,
    setNewColDesc,
    newColIcon,
    setNewColIcon,
    handleCreateCollection,
    handleDeleteCollection,
    newColItemTitle,
    setNewColItemTitle,
    handleCreateCollectionItem,
    handleDeleteCollectionItem,
    handleUpdateCollectionItemStatus,
    migrateCollectionItemToDailyLog,
    handleReorderCollections,
    handleReorderCollectionItems
  } = useBujo();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEndCollections = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      handleReorderCollections(active.id as string, over.id as string);
    }
  };

  const handleDragEndItems = (event: DragEndEvent) => {
    const { active, over } = event;
    if (selectedCollectionId && over && active.id !== over.id) {
      handleReorderCollectionItems(selectedCollectionId, active.id as string, over.id as string);
    }
  };

  const [showItemModal, setShowItemModal] = useState(false);
  const [showColIconDropdown, setShowColIconDropdown] = useState(false);
  const [newColItemIcon, setNewColItemIcon] = useState('');
  const [showColItemIconDropdown, setShowColItemIconDropdown] = useState(false);

  const handleCancelCreateCollection = () => {
    setNewColName('');
    setNewColDesc('');
    setNewColIcon('📚');
    setShowCreateCollectionModal(false);
  };

  // Close create collection modal on ESC keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancelCreateCollection();
      }
    };
    if (showCreateCollectionModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showCreateCollectionModal]);

  const activeCollection = collections.find(c => c.id === selectedCollectionId);
  const activeItem = activeCollection?.items.find((i: any) => i.id === selectedItemId);

  // Notes change handler — receives plain string from MarkdownNotebook
  const handleNotesChange = (newValue: string) => {
    setCollections(prev => prev.map(col => {
      if (col.id === selectedCollectionId) {
        return {
          ...col,
          items: col.items.map((it: any) => {
            if (it.id === selectedItemId) {
              return { ...it, notes: newValue };
            }
            return it;
          })
        };
      }
      return col;
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in no-print text-bujo-text">
      <div className="p-6 rounded-3xl bg-zinc-200/30 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-white/5 backdrop-blur-md relative overflow-hidden bg-gradient-to-r dark:from-zinc-900/60 dark:to-zinc-800/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-bujo-highlight tracking-widest block mb-1">
              Biblioteca & Biblioteca de Mídias
            </span>
            <h2 className="text-xl md:text-2xl font-semibold mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>
              {activeCollection ? `${activeCollection.icon} ${activeCollection.name}` : '📚 Biblioteca de Coleções'}
            </h2>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 max-w-xl">
              {activeCollection 
                ? activeCollection.description || 'Coleção de itens personalizados. Adicione mídias, anotações e divida em micro-passos.' 
                : 'Crie coleções personalizadas de mídias, tarefas, livros ou projetos, e migre itens com facilidade para o seu Daily Log.'}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {activeCollection ? (
              <button
                onClick={() => {
                  setSelectedCollectionId(null);
                  setSelectedItemId(null);
                }}
                className="px-4 py-2 bg-zinc-300/40 dark:bg-white/10 text-xs font-semibold rounded-xl hover:bg-zinc-300/60 dark:hover:bg-white/20 transition-colors"
              >
                Voltar para Biblioteca
              </button>
            ) : (
              <button
                onClick={() => setShowCreateCollectionModal(true)}
                className="px-4 py-2 bg-bujo-highlight text-white text-xs font-semibold rounded-xl hover:opacity-95 transition-opacity"
              >
                Nova Coleção
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {!activeCollection ? (
        // List collections
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEndCollections}
        >
          <SortableContext 
            items={collections.map(c => c.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {collections.map(col => (
                <div key={col.id} className="relative group/sort">
                  <DragHandle id={col.id} className="absolute top-2 left-2 z-20 opacity-0 group-hover/sort:opacity-40 hover:!opacity-100 transition-opacity">
                    <GripVertical className="w-3.5 h-3.5 text-zinc-400" />
                  </DragHandle>
                  <SortableItem id={col.id}>
                    <div
                      onClick={() => setSelectedCollectionId(col.id)}
                      className="p-4 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/40 cursor-pointer transition-all flex flex-col justify-between h-32 group"
                    >
                      <div className="min-w-0">
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="text-xl ml-4">{col.icon || '📚'}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCollection(col.id);
                            }}
                            className="p-1 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h3 className="text-xs font-bold text-zinc-200 truncate">{col.name}</h3>
                        <p className="text-[9px] text-zinc-500 mt-0.5 leading-tight line-clamp-2">{col.description || 'Sem descrição.'}</p>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-400 block">
                        {col.items?.length || 0} itens
                      </span>
                    </div>
                  </SortableItem>
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        // Detail collection
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Collection Items list */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200/30 dark:border-white/5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Registros Catalogados</span>
                <span className="bg-white/5 px-2 py-0.5 rounded-full text-[9px] text-zinc-500 font-mono">
                  {activeCollection.items?.length || 0} itens
                </span>
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEndItems}
                >
                  <SortableContext 

                    items={activeCollection.items?.map((i: any) => i.id) || []}
                    strategy={verticalListSortingStrategy}
                  >
                    {activeCollection.items?.map((item: any) => {
                      const isSelected = selectedItemId === item.id;
                      const completedSubtasks = item.subtasks?.filter((s: any) => s.completed).length || 0;
                      const totalSubtasks = item.subtasks?.length || 0;

                      return (
                        <div key={item.id} className="flex items-start gap-1 group/sort-item">
                          <DragHandle id={item.id} className="mt-4 opacity-0 group-hover/sort-item:opacity-40 hover:!opacity-100 transition-opacity">
                            <GripVertical className="w-3.5 h-3.5 text-zinc-500" />
                          </DragHandle>
                          <SortableItem id={item.id} className="flex-1 min-w-0">
                            <div
                              onClick={() => setSelectedItemId(item.id)}
                              className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group ${
                                isSelected 
                                  ? 'bg-bujo-highlight/10 border-bujo-highlight/40 text-bujo-text' 
                                  : 'bg-zinc-200/10 dark:bg-white/[0.01] border-zinc-250/20 dark:border-white/5 hover:border-zinc-350'
                              }`}
                            >
                              <div className="space-y-1 min-w-0 pr-0 sm:pr-2 flex items-center gap-1.5 w-full sm:w-auto flex-1">
                                {item.icon && <span className="text-base select-none shrink-0" title="Ícone do item">{item.icon}</span>}
                                <div className="min-w-0 flex-1">
                                  <span className="text-xs font-semibold block truncate leading-tight">{item.title}</span>
                                  {totalSubtasks > 0 && (
                                    <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">
                                      Progresso: {completedSubtasks}/{totalSubtasks}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t border-zinc-200/20 dark:border-white/5 pt-2 sm:pt-0 sm:border-t-0 mt-1 sm:mt-0">
                                <select
                                  value={item.status || 'todo'}
                                  onClick={e => e.stopPropagation()}
                                  onChange={e => handleUpdateCollectionItemStatus(activeCollection.id, item.id, e.target.value as any)}
                                  className="text-[10px] font-bold bg-zinc-200 dark:bg-zinc-900 border border-zinc-250 dark:border-white/10 rounded-lg px-2 py-1 text-bujo-text outline-none cursor-pointer"
                                >
                                  <option value="todo">Pendente</option>
                                  <option value="doing">Fazendo</option>
                                  <option value="done">Concluído</option>
                                </select>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCollectionItem(activeCollection.id, item.id);
                                  }}
                                  className="p-1.5 text-zinc-500 hover:text-red-400 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-200/30 sm:bg-transparent dark:bg-white/5 sm:dark:bg-transparent rounded-lg sm:rounded-none"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </SortableItem>
                        </div>
                      );
                    })}
                  </SortableContext>
                </DndContext>

                {(!activeCollection.items || activeCollection.items.length === 0) && (
                  <div className="py-12 text-center text-zinc-500 text-xs italic">
                    Nenhum item adicionado a esta coleção.
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-zinc-200/30 dark:bg-white/5 rounded-2xl border border-zinc-250/20 dark:border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block">Rápido: Adicionar Item</span>
                {newColItemTitle && (
                  <button
                    onClick={() => setNewColItemTitle('')}
                    className="text-[9px] text-zinc-500 hover:text-red-500 font-bold cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <div className="flex gap-2 items-center relative">
                {/* Icon picker for collection item */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowColItemIconDropdown(!showColItemIconDropdown)}
                    className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 flex items-center justify-center text-sm hover:border-bujo-highlight transition-all cursor-pointer"
                    title="Escolher Ícone/Desenho"
                  >
                    {newColItemIcon || '🎨'}
                  </button>

                  {showColItemIconDropdown && (
                    <div className="absolute left-0 bottom-full mb-2 p-2.5 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl shadow-2xl z-50 w-56 animate-scale-in">
                      <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-zinc-200/40 dark:border-white/5">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Escolha um Ícone</span>
                        <button type="button" onClick={() => setShowColItemIconDropdown(false)} className="p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 hover:text-bujo-text cursor-pointer">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-5 gap-1 max-h-32 overflow-y-auto">
                        {['📝', '🎯', '🚀', '💡', '📚', '🏃‍♂️', '🍎', '🛒', '🎨', '🍿', '🏠', '🔑', '💬', '⚠️', '🛠️', '💰', '🏆', '🧘‍♂️', '🍕', '🔥'].map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              setNewColItemIcon(emoji);
                              setShowColItemIconDropdown(false);
                            }}
                            className={`w-7 h-7 flex items-center justify-center rounded text-sm hover:bg-zinc-150 dark:hover:bg-white/5 transition-all ${
                              newColItemIcon === emoji ? 'bg-bujo-highlight/20 border border-bujo-highlight' : ''
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
                    placeholder="Título do item..."
                    value={newColItemTitle}
                    onChange={e => setNewColItemTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleCreateCollectionItem(activeCollection.id, newColItemIcon);
                        setNewColItemIcon('');
                      }
                    }}
                    className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 pr-8 text-xs text-bujo-text outline-none focus:border-bujo-highlight"
                  />
                </div>

                <button
                  onClick={() => {
                    handleCreateCollectionItem(activeCollection.id, newColItemIcon);
                    setNewColItemIcon('');
                  }}
                  className="p-2 bg-bujo-highlight text-white hover:opacity-95 rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Item Detail Panel */}
          <div className="lg:col-span-7 h-full min-h-[400px]">
            {activeItem ? (
              <div className="p-6 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 flex flex-col h-full space-y-4">
                {/* Item header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200/30 dark:border-white/5 pb-4">
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5 tracking-tighter">REGISTRO SELECIONADO</span>
                    <h3 className="text-base font-bold leading-tight flex items-center gap-2">
                      {activeItem.icon && <span>{activeItem.icon}</span>}
                      {activeItem.title}
                    </h3>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setShowItemModal(true)}
                      className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-bujo-highlight text-white text-[9px] sm:text-[10px] font-bold uppercase rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-md shadow-bujo-highlight/10 truncate"
                    >
                      <LayoutPanelLeft className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Mídias & Passos</span>
                    </button>
                    <button
                      onClick={() => migrateCollectionItemToDailyLog(activeItem, activeCollection.name)}
                      className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-bujo-accent/20 hover:bg-bujo-accent/30 border border-bujo-accent/30 text-bujo-accent text-[9px] font-black uppercase rounded-lg transition-colors flex items-center justify-center gap-1.5 truncate"
                    >
                      <span className="shrink-0">🚀</span> <span className="truncate">Migrar Log</span>
                    </button>
                  </div>
                </div>

                {/* Full Column Notes Area - Markdown Notebook */}
                <div className="flex-1 flex flex-col space-y-2 min-h-0">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Anotações do Registro</span>
                    <span className="text-[8px] text-zinc-600 dark:text-zinc-500 italic">Markdown: # título, ## subtítulo, **negrito**, *itálico*, - lista, [] tarefa</span>
                  </div>
                  <MarkdownNotebook
                    value={activeItem.notes || ''}
                    onChange={handleNotesChange}
                    placeholder="Espaço livre para anotações... Suporta Markdown."
                    className="flex-1"
                  />
                </div>
              </div>
            ) : (
              <div className="h-full rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 flex flex-col items-center justify-center py-20 text-center text-zinc-550 italic text-xs min-h-[400px]">
                <div className="p-4 rounded-full bg-zinc-200/20 dark:bg-white/5 mb-4">
                  <ChevronRight className="w-8 h-8 text-zinc-400 rotate-90 lg:rotate-0" />
                </div>
                Selecione um registro na lista ao lado para ver e editar detalhes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collection Item Modal (Media & Subtasks) */}
      {selectedCollectionId && selectedItemId && (
        <CollectionItemModal
          isOpen={showItemModal}
          onClose={() => setShowItemModal(false)}
          collectionId={selectedCollectionId}
          itemId={selectedItemId}
        />
      )}

      {/* CREATE COLLECTION MODAL */}
      {showCreateCollectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-print">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 animate-scale-in text-bujo-text select-none">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-200/40 dark:border-white/5 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-bujo-highlight flex items-center gap-1">
                <span>📚</span> Criar Nova Coleção
              </h3>
              <button
                onClick={handleCancelCreateCollection}
                className="p-1 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-white/10 transition-colors text-zinc-500 hover:text-bujo-text cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="space-y-4 text-left">
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Ícone / Emoji</label>
                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => setShowColIconDropdown(!showColIconDropdown)}
                    className="w-12 h-12 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center text-xl outline-none hover:border-bujo-highlight transition-all cursor-pointer"
                  >
                    {newColIcon}
                  </button>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={newColIcon}
                    onChange={e => setNewColIcon(e.target.value)}
                    className="w-16 bg-zinc-100 dark:bg-zinc-955 border border-zinc-205 dark:border-zinc-800 rounded-xl px-3 py-2 text-center text-sm outline-none focus:border-bujo-highlight"
                    title="Ou digite o emoji diretamente"
                  />
                </div>

                {showColIconDropdown && (
                  <div className="absolute left-0 top-full mt-2 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 w-64 animate-scale-in">
                    <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-zinc-200/40 dark:border-white/5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Escolha um Ícone</span>
                      <button
                        type="button"
                        onClick={() => setShowColIconDropdown(false)}
                        className="p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-450 hover:text-bujo-text cursor-pointer"
                        title="Fechar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-6 gap-1.5 max-h-40 overflow-y-auto">
                      {['📚', '🎨', '💼', '💻', '📝', '📅', '🎯', '🚀', '💡', '🏃‍♂️', '🍎', '✈️', '🛒', '🎵', '🍿', '🏠', '🔑', '💬', '⚠️', '🛠️', '💰', '🏆', '🧘‍♂️', '🩺', '🍕', '🌸', '🌻', '🐶', '🐱', '🌍'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setNewColIcon(emoji);
                            setShowColIconDropdown(false);
                          }}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg hover:bg-zinc-150 dark:hover:bg-white/5 transition-all ${
                            newColIcon === emoji ? 'bg-bujo-highlight/20 border border-bujo-highlight' : ''
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Nome da Coleção</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Leituras, Projeto X..."
                  value={newColName}
                  onChange={e => setNewColName(e.target.value)}
                  className="w-full bg-zinc-150 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-bujo-highlight"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Descrição / Objetivo</label>
                <textarea
                  placeholder="Do que se trata esta coleção?"
                  value={newColDesc}
                  onChange={e => setNewColDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-150 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 text-xs outline-none focus:border-bujo-highlight resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 text-xs">
                <button
                  type="button"
                  onClick={handleCancelCreateCollection}
                  className="px-4 py-2 text-zinc-500 hover:text-bujo-text font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-bujo-highlight text-white hover:opacity-95 font-semibold rounded-xl"
                >
                  Criar Coleção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
