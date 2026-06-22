import React, { useState, useEffect } from 'react';
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
import { X, Plus, Trash2, Link2, FileText, Sparkles, GripVertical } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';
import { BUJO_ICONS } from '../../../utils/constants';
import { SortableItem, DragHandle } from '../../../components/common/SortableItem';

interface CollectionItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: string;
  itemId: string;
}

export const CollectionItemModal = ({ isOpen, onClose, collectionId, itemId }: CollectionItemModalProps) => {
  const {
    collections,
    handleAICollectionItemDecompose,
    decomposingCollectionItemIds,
    activeLLMCollectionItemId,
    handleAddCollectionItemSubtask,
    handleToggleCollectionItemSubtask,
    handleDeleteCollectionItemSubtask,
    handleUploadCollectionItemMedia,
    handleAddCollectionItemMediaLink,
    handleDeleteCollectionItemMedia,
    handleReorderCollectionSubtasks,
    showToast
  } = useBujo();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEndSubtasks = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      handleReorderCollectionSubtasks(collectionId, itemId, active.id as string, over.id as string);
    }
  };

  const [showAddMediaLink, setShowAddMediaLink] = useState(false);
  const [mediaLinkName, setMediaLinkName] = useState('');
  const [mediaLinkUrl, setMediaLinkUrl] = useState('');
  const [colSubIcon, setColSubIcon] = useState('');
  const [showColSubIconDropdown, setShowColSubIconDropdown] = useState(false);
  const [iconSearch, setIconSearch] = useState('');

  const activeCollection = collections.find(c => c.id === collectionId);
  const activeItem = activeCollection?.items.find((i: any) => i.id === itemId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !activeItem) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-print">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in text-bujo-text">
        <div className="p-6 border-b border-zinc-200/40 dark:border-white/5 flex justify-between items-center">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">DETALHES E MÍDIAS</span>
            <h3 className="text-lg font-bold truncate flex items-center gap-2">
              {activeItem.icon && <span>{activeItem.icon}</span>}
              {activeItem.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors text-zinc-500 hover:text-bujo-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
          {/* Microtasks section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-bujo-highlight" /> Micro-tarefas
              </h4>
              <button
                onClick={() => handleAICollectionItemDecompose(collectionId, activeItem.id, activeItem.title)}
                disabled={decomposingCollectionItemIds[activeItem.id] || activeLLMCollectionItemId === activeItem.id}
                className="text-[10px] font-bold text-bujo-highlight hover:bg-bujo-highlight/10 px-2 py-1 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                ⚡ Gerar passos com IA
              </button>
            </div>

            <div className="space-y-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEndSubtasks}
              >
                <SortableContext 

                  items={activeItem.subtasks?.map((s: any) => s.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  {activeItem.subtasks?.map((st: any) => (
                    <div key={st.id} className="flex items-start gap-1 group/sort-sub">
                      <DragHandle id={st.id} className="mt-3 opacity-0 group-hover/sort-sub:opacity-40 hover:!opacity-100 transition-opacity">
                        <GripVertical className="w-3.5 h-3.5 text-zinc-500" />
                      </DragHandle>
                      <SortableItem id={st.id} className="flex-1">
                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-100 dark:bg-white/[0.02] border border-zinc-200/50 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 group transition-all">
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => handleToggleCollectionItemSubtask(collectionId, activeItem.id, st.id)}
                            className="rounded border-zinc-300 dark:border-white/20 text-bujo-highlight focus:ring-bujo-highlight w-4 h-4 cursor-pointer"
                          />
                          <span className={`text-xs flex-1 leading-normal flex items-center gap-2 ${st.completed ? 'line-through text-zinc-500 opacity-60' : 'text-zinc-700 dark:text-zinc-200'}`}>
                            {st.icon && <span className="text-sm select-none shrink-0">{st.icon}</span>}
                            {st.content}
                          </span>
                          <button
                            onClick={() => handleDeleteCollectionItemSubtask(collectionId, activeItem.id, st.id)}
                            className="p-1 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </SortableItem>
                    </div>
                  ))}
                </SortableContext>
              </DndContext>

              {(!activeItem.subtasks || activeItem.subtasks.length === 0) && (
                <div className="py-6 text-center text-zinc-500 text-xs italic bg-zinc-50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-zinc-200 dark:border-white/5">
                  Nenhuma micro-tarefa definida.
                </div>
              )}
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.elements.namedItem('subtaskText') as HTMLInputElement;
                if (input.value.trim() || colSubIcon) {
                  handleAddCollectionItemSubtask(collectionId, activeItem.id, input.value.trim(), colSubIcon);
                  input.value = '';
                  setColSubIcon('');
                }
              }}
              className="flex gap-2 pt-2 relative"
            >
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowColSubIconDropdown(!showColSubIconDropdown)}
                  className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-lg hover:border-bujo-highlight transition-all cursor-pointer"
                >
                  {colSubIcon || '🎨'}
                </button>

                {showColSubIconDropdown && (
                  <div className="absolute left-0 bottom-full mb-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 w-64 animate-scale-in">
                    <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-zinc-200/40 dark:border-white/5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Ícone</span>
                      <button type="button" onClick={() => setShowColSubIconDropdown(false)} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-6 gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {BUJO_ICONS.map(icon => (
                        <button
                          key={icon.emoji}
                          type="button"
                          onClick={() => { setColSubIcon(icon.emoji); setShowColSubIconDropdown(false); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-all text-lg"
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
                name="subtaskText"
                placeholder="Adicionar passo manual..."
                className="flex-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs outline-none focus:border-bujo-highlight placeholder:text-zinc-550"
              />
              <button type="submit" className="px-4 py-2 bg-bujo-highlight text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-md shadow-bujo-highlight/10">
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </form>
          </div>

          {/* Media Library */}
          <div className="space-y-4 pt-4 border-t border-zinc-200/40 dark:border-white/5 relative">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Link2 className="w-3.5 h-3.5 text-blue-500" /> Galeria de Mídias & Links
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddMediaLink(!showAddMediaLink)}
                  className="text-[10px] font-bold text-bujo-highlight hover:bg-bujo-highlight/10 px-2 py-1 rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <Link2 className="w-3.5 h-3.5" /> Anexar Link
                </button>
                <label className="text-[10px] font-bold text-bujo-highlight hover:bg-bujo-highlight/10 px-2 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer">
                  <FileText className="w-3.5 h-3.5" /> Enviar Local
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => handleUploadCollectionItemMedia(collectionId, activeItem.id, e)}
                  />
                </label>
              </div>
            </div>

            {showAddMediaLink && (
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 space-y-3 animate-scale-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Nome do link</label>
                    <input
                      type="text"
                      placeholder="Ex: Documentação"
                      value={mediaLinkName}
                      onChange={e => setMediaLinkName(e.target.value)}
                      className="w-full bg-zinc-200/50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-bujo-highlight"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">URL (https://...)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={mediaLinkUrl}
                      onChange={e => setMediaLinkUrl(e.target.value)}
                      className="w-full bg-zinc-200/50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-bujo-highlight"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowAddMediaLink(false)}
                    className="px-3 py-1.5 text-xs text-zinc-500 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleAddCollectionItemMediaLink(collectionId, activeItem.id, mediaLinkName, setMediaLinkName, mediaLinkUrl, setMediaLinkUrl, setShowAddMediaLink)}
                    className="px-4 py-1.5 bg-bujo-highlight text-white text-xs font-bold rounded-xl shadow-md shadow-bujo-highlight/10"
                  >
                    Anexar Mídia
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeItem.media?.map((med: any) => (
                <div
                  key={med.id}
                  className="p-3 rounded-2xl bg-zinc-100 dark:bg-white/[0.02] border border-zinc-200/50 dark:border-white/5 flex items-center justify-between text-xs hover:border-bujo-highlight/30 transition-all group/media"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="shrink-0 p-2 rounded-xl bg-white dark:bg-white/5 shadow-sm border border-zinc-200 dark:border-white/5">
                      {med.type === 'link' ? <Link2 className="w-4 h-4 text-blue-500" /> : <FileText className="w-4 h-4 text-amber-500" />}
                    </span>
                    <div className="truncate min-w-0">
                      {med.type === 'link' ? (
                        <a href={med.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-500 dark:text-blue-400 font-bold block truncate">
                          {med.name || med.url}
                        </a>
                      ) : (
                        <span className="font-bold block truncate">{med.name}</span>
                      )}
                      <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">{med.type === 'link' ? 'Website / Link' : 'Arquivo Local'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCollectionItemMedia(collectionId, activeItem.id, med.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-500 opacity-0 group-hover/media:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {(!activeItem.media || activeItem.media.length === 0) && (
                <div className="col-span-2 py-8 text-center text-zinc-500 text-xs italic bg-zinc-50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-zinc-200 dark:border-white/5">
                  Nenhuma mídia ou link anexado.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-200/40 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01] flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-zinc-800 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
          >
            Fechar Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};
