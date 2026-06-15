import { useState } from 'react';
import { X, Trash2, Plus, ChevronRight, Link2, FileText } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';

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
    decomposingCollectionItemIds,
    activeLLMCollectionItemId,
    handleAICollectionItemDecompose,
    handleAddCollectionItemSubtask,
    handleToggleCollectionItemSubtask,
    handleDeleteCollectionItemSubtask,
    handleAddCollectionItemMediaLink,
    handleUploadCollectionItemMedia,
    handleDeleteCollectionItemMedia
  } = useBujo();

  const [showAddMediaLink, setShowAddMediaLink] = useState(false);
  const [mediaLinkName, setMediaLinkName] = useState('');
  const [mediaLinkUrl, setMediaLinkUrl] = useState('');

  const activeCollection = collections.find(c => c.id === selectedCollectionId);
  const activeItem = activeCollection?.items.find((i: any) => i.id === selectedItemId);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map(col => (
            <div
              key={col.id}
              onClick={() => setSelectedCollectionId(col.id)}
              className="p-5 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/40 cursor-pointer transition-all flex flex-col justify-between h-44 group"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-2xl">{col.icon || '📚'}</span>
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
                <h3 className="text-sm font-bold text-zinc-200">{col.name}</h3>
                <p className="text-[10px] text-zinc-500 mt-1 leading-normal line-clamp-2">{col.description || 'Sem descrição.'}</p>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 mt-4 block">
                {col.items?.length || 0} itens catalogados
              </span>
            </div>
          ))}

          {collections.length === 0 && (
            <div className="col-span-full py-16 text-center text-zinc-500 italic text-sm">
              Nenhuma coleção criada ainda. Clique em "Nova Coleção" para iniciar!
            </div>
          )}
        </div>
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
                {activeCollection.items?.map((item: any) => {
                  const isSelected = selectedItemId === item.id;
                  const isDecomposing = decomposingCollectionItemIds[item.id] || activeLLMCollectionItemId === item.id;
                  const completedSubtasks = item.subtasks?.filter((s: any) => s.completed).length || 0;
                  const totalSubtasks = item.subtasks?.length || 0;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between group ${
                        isSelected 
                          ? 'bg-bujo-highlight/10 border-bujo-highlight/40 text-bujo-text' 
                          : 'bg-zinc-200/10 dark:bg-white/[0.01] border-zinc-250/20 dark:border-white/5 hover:border-zinc-350'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 pr-2">
                        <span className="text-xs font-semibold block truncate leading-tight">{item.title}</span>
                        {totalSubtasks > 0 && (
                          <span className="text-[9px] text-zinc-500 font-mono block">
                            Progresso: {completedSubtasks}/{totalSubtasks} micro-tarefas
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <select
                          value={item.status || 'todo'}
                          onClick={e => e.stopPropagation()}
                          onChange={e => handleUpdateCollectionItemStatus(activeCollection.id, item.id, e.target.value as any)}
                          className="text-[9px] font-bold bg-zinc-200 dark:bg-zinc-900 border border-zinc-250 dark:border-white/10 rounded-lg px-1.5 py-0.5 text-bujo-text outline-none cursor-pointer"
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
                          className="p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {(!activeCollection.items || activeCollection.items.length === 0) && (
                  <div className="py-12 text-center text-zinc-500 text-xs italic">
                    Nenhum item adicionado a esta coleção.
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-zinc-200/30 dark:bg-white/5 rounded-2xl border border-zinc-250/20 dark:border-white/5 space-y-2">
              <span className="text-[9px] font-bold text-zinc-500 uppercase block">Rápido: Adicionar Item</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Título do item..."
                  value={newColItemTitle}
                  onChange={e => setNewColItemTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleCreateCollectionItem(activeCollection.id);
                    }
                  }}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-bujo-text outline-none focus:border-bujo-highlight"
                />
                <button
                  onClick={() => handleCreateCollectionItem(activeCollection.id)}
                  className="p-2 bg-bujo-highlight text-white hover:opacity-95 rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Item Detail Panel */}
          <div className="lg:col-span-7">
            {activeItem ? (
              <div className="p-6 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 space-y-5 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  {/* Item header */}
                  <div className="flex justify-between items-start gap-4 border-b border-zinc-200/30 dark:border-white/5 pb-3">
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">DETALHES DO ITEM</span>
                      <h3 className="text-base font-bold leading-tight">{activeItem.title}</h3>
                    </div>
                    <button
                      onClick={() => migrateCollectionItemToDailyLog(activeItem, activeCollection.name)}
                      className="px-3 py-1.5 bg-bujo-accent/15 hover:bg-bujo-accent/25 border border-bujo-accent/30 text-bujo-accent text-[9px] font-black uppercase rounded-lg transition-colors flex items-center gap-1 text-white"
                    >
                      🚀 Migrar para o Daily Log
                    </button>
                  </div>

                  {/* Microtasks / subtasks section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Micro-tarefas</span>
                      <button
                        onClick={() => handleAICollectionItemDecompose(activeCollection.id, activeItem.id, activeItem.title)}
                        disabled={decomposingCollectionItemIds[activeItem.id] || activeLLMCollectionItemId === activeItem.id}
                        className="text-[9px] font-bold text-bujo-highlight hover:underline flex items-center gap-1 transition-all disabled:opacity-50"
                      >
                        ⚡ Gerar passos com IA
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {activeItem.subtasks?.map((st: any) => (
                        <div key={st.id} className="flex items-center gap-2 py-1 px-1.5 rounded-lg hover:bg-white/5 group transition-colors">
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => handleToggleCollectionItemSubtask(activeCollection.id, activeItem.id, st.id)}
                            className="rounded border-zinc-350 text-bujo-highlight focus:ring-bujo-highlight w-3.5 h-3.5"
                          />
                          <span className={`text-xs flex-1 leading-normal ${st.completed ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>
                            {st.content}
                          </span>
                          <button
                            onClick={() => handleDeleteCollectionItemSubtask(activeCollection.id, activeItem.id, st.id)}
                            className="p-0.5 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {(!activeItem.subtasks || activeItem.subtasks.length === 0) && (
                        <span className="text-xs text-zinc-550 italic block py-2">Sem micro-tarefas.</span>
                      )}
                    </div>

                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const input = form.elements.namedItem('subtaskText') as HTMLInputElement;
                        if (input.value.trim()) {
                          handleAddCollectionItemSubtask(activeCollection.id, activeItem.id, input.value.trim());
                          input.value = '';
                        }
                      }}
                      className="flex gap-1.5 pt-1"
                    >
                      <input
                        type="text"
                        name="subtaskText"
                        placeholder="Adicionar micro-passo manual..."
                        className="flex-1 bg-zinc-200/40 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-bujo-highlight placeholder:text-zinc-650"
                      />
                      <button type="submit" className="px-2.5 py-1.5 bg-bujo-highlight text-white rounded-lg text-xs font-bold">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>

                  {/* Media Library */}
                  <div className="space-y-3 pt-3 border-t border-zinc-200/30 dark:border-white/5 relative">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Galeria de Mídias & Links</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowAddMediaLink(!showAddMediaLink)}
                          className="text-[9px] font-bold text-bujo-highlight hover:underline flex items-center gap-0.5"
                        >
                          <Link2 className="w-3 h-3" /> Link
                        </button>
                        <label className="text-[9px] font-bold text-bujo-highlight hover:underline flex items-center gap-0.5 cursor-pointer">
                          <FileText className="w-3 h-3" /> Local
                          <input
                            type="file"
                            className="hidden"
                            onChange={e => handleUploadCollectionItemMedia(activeCollection.id, activeItem.id, e)}
                          />
                        </label>
                      </div>
                    </div>

                    {showAddMediaLink && (
                      <div className="p-3.5 rounded-2xl bg-zinc-200/40 dark:bg-white/[0.02] border border-zinc-250 dark:border-white/5 space-y-2.5 z-10 relative">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Nome do link (ex: GitHub)"
                            value={mediaLinkName}
                            onChange={e => setMediaLinkName(e.target.value)}
                            className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-bujo-highlight placeholder:text-zinc-600"
                          />
                          <input
                            type="url"
                            placeholder="https://..."
                            value={mediaLinkUrl}
                            onChange={e => setMediaLinkUrl(e.target.value)}
                            className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-bujo-highlight placeholder:text-zinc-600"
                          />
                        </div>
                        <div className="flex justify-end gap-2 text-[10px]">
                          <button
                            onClick={() => setShowAddMediaLink(false)}
                            className="px-2 py-1 text-zinc-500 hover:text-bujo-text"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleAddCollectionItemMediaLink(activeCollection.id, activeItem.id, mediaLinkName, setMediaLinkName, mediaLinkUrl, setMediaLinkUrl, setShowAddMediaLink)}
                            className="px-3 py-1 bg-bujo-highlight text-white font-bold rounded-lg"
                          >
                            Anexar Link
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1">
                      {!activeItem.media || activeItem.media.length === 0 ? (
                        <span className="text-xs text-zinc-550 italic block py-2 col-span-2">Sem anexos de mídias.</span>
                      ) : (
                        activeItem.media.map((med: any) => (
                          <div
                            key={med.id}
                            className="p-2 rounded-xl bg-zinc-200/50 dark:bg-white/5 border border-zinc-250/20 dark:border-white/5 flex items-center justify-between text-xs hover:border-bujo-highlight/20 transition-all group/media"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-zinc-400 shrink-0">
                                {med.type === 'link' ? <Link2 className="w-3.5 h-3.5 text-blue-400" /> : <FileText className="w-3.5 h-3.5 text-amber-500" />}
                              </span>
                              {med.type === 'link' ? (
                                <a
                                  href={med.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline text-blue-400 truncate leading-snug font-medium"
                                >
                                  {med.name || med.url}
                                </a>
                              ) : (
                                <span className="truncate leading-snug font-medium">{med.name}</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteCollectionItemMedia(activeCollection.id, activeItem.id, med.id)}
                              className="p-0.5 text-zinc-500 hover:text-red-400 opacity-0 group-hover/media:opacity-100 transition-opacity"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-200/30 dark:border-white/5 mt-auto text-left">
                  <span className="text-[10px] text-zinc-500 font-mono block mb-1">ANOTAÇÕES DO REGISTRO</span>
                  <textarea
                    defaultValue={activeItem.notes || ''}
                    onBlur={e => {
                      setCollections(prev => prev.map(col => {
                        return {
                          ...col,
                          items: col.items.map((it: any) => {
                            if (it.id === activeItem.id) {
                              return { ...it, notes: e.target.value };
                            }
                            return it;
                          })
                        };
                      }));
                    }}
                    placeholder="Espaço livre para anotações do item... (Salva ao clicar fora)"
                    rows={4}
                    className="w-full bg-zinc-150 dark:bg-zinc-950 border border-zinc-250/20 dark:border-white/5 rounded-2xl p-3 text-xs text-bujo-text placeholder:text-zinc-650 resize-none outline-none focus:border-bujo-highlight/30 transition-all font-mono"
                  />
                </div>
              </div>
            ) : (
              <div className="h-full rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 flex flex-col items-center justify-center py-20 text-center text-zinc-550 italic text-xs min-h-[350px]">
                Selecione um registro na lista ao lado para ver e editar seus detalhes.
              </div>
            )}
          </div>

        </div>
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
                onClick={() => setShowCreateCollectionModal(false)}
                className="p-1 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-white/10 transition-colors text-zinc-500 hover:text-bujo-text cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Ícone / Emoji</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={newColIcon}
                  onChange={e => setNewColIcon(e.target.value)}
                  className="w-16 bg-zinc-150 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-center text-lg outline-none focus:border-bujo-highlight"
                />
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
                  onClick={() => setShowCreateCollectionModal(false)}
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
