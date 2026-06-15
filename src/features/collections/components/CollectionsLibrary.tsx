import { X, Trash2, Plus, ChevronRight, Link2, FileText } from 'lucide-react';
import { Collection } from '../../../types';

interface CollectionsLibraryProps {
  collections: Collection[];
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
  selectedCollectionId: string | null;
  setSelectedCollectionId: (id: string | null) => void;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  showCreateCollectionModal: boolean;
  setShowCreateCollectionModal: (show: boolean) => void;
  newColName: string;
  setNewColName: (name: string) => void;
  newColDesc: string;
  setNewColDesc: (desc: string) => void;
  newColIcon: string;
  setNewColIcon: (icon: string) => void;
  handleCreateCollection: (e: React.FormEvent) => void;
  handleDeleteCollection: (colId: string) => void;
  newColItemTitle: string;
  setNewColItemTitle: (title: string) => void;
  handleCreateCollectionItem: (colId: string) => void;
  handleDeleteCollectionItem: (colId: string, itemId: string) => void;
  handleUpdateCollectionItemStatus: (colId: string, itemId: string, status: 'todo' | 'doing' | 'done') => void;
  migrateCollectionItemToDailyLog: (item: any, collectionName: string) => void;
  decomposingCollectionItemIds: { [key: string]: boolean };
  activeLLMCollectionItemId: string | null;
  handleAICollectionItemDecompose: (colId: string, itemId: string, title: string) => void;
  handleAddCollectionItemSubtask: (colId: string, itemId: string, content: string) => void;
  handleToggleCollectionItemSubtask: (colId: string, itemId: string, subtaskId: string) => void;
  handleDeleteCollectionItemSubtask: (colId: string, itemId: string, subtaskId: string) => void;
  showAddMediaLink: boolean;
  setShowAddMediaLink: (show: boolean) => void;
  mediaLinkName: string;
  setMediaLinkName: (name: string) => void;
  mediaLinkUrl: string;
  setMediaLinkUrl: (url: string) => void;
  handleAddCollectionItemMediaLink: (colId: string, itemId: string) => void;
  handleUploadCollectionItemMedia: (colId: string, itemId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteCollectionItemMedia: (colId: string, itemId: string, mediaId: string) => void;
}

export const CollectionsLibrary = ({
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
  showAddMediaLink,
  setShowAddMediaLink,
  mediaLinkName,
  setMediaLinkName,
  mediaLinkUrl,
  setMediaLinkUrl,
  handleAddCollectionItemMediaLink,
  handleUploadCollectionItemMedia,
  handleDeleteCollectionItemMedia
}: CollectionsLibraryProps) => {
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

      {showCreateCollectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl flex flex-col text-bujo-text">
            <button 
              onClick={() => setShowCreateCollectionModal(false)} 
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold mb-4">Nova Coleção / Lista</h3>
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-400 block">Nome da Coleção</label>
                <input
                  type="text"
                  required
                  value={newColName}
                  onChange={e => setNewColName(e.target.value)}
                  placeholder="Ex: Leituras Recomendadas, Ideias de App, Faculdade"
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 rounded-xl p-2.5 text-xs text-bujo-text outline-none focus:border-bujo-highlight"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-400 block">Descrição</label>
                <textarea
                  value={newColDesc}
                  onChange={e => setNewColDesc(e.target.value)}
                  placeholder="Ex: Livros de desenvolvimento e artigos sobre TDAH."
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 rounded-xl p-2.5 text-xs text-bujo-text outline-none focus:border-bujo-highlight h-20 resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-400 block">Emoji de Ícone</label>
                <select
                  value={newColIcon}
                  onChange={e => setNewColIcon(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 rounded-xl p-2.5 text-xs text-bujo-text outline-none cursor-pointer focus:border-bujo-highlight"
                >
                  <option value="📚">📚 Livros / Leituras</option>
                  <option value="🎨">🎨 Projetos / Design</option>
                  <option value="🎬">🎬 Filmes / Vídeos</option>
                  <option value="💻">💻 Programação / Quarkus</option>
                  <option value="💡">💡 Ideias / Brainstorms</option>
                  <option value="🎧">🎧 Músicas / Podcasts</option>
                  <option value="✈️">✈️ Viagens / Sonhos</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-bujo-highlight text-white rounded-xl text-xs font-semibold hover:opacity-95 transition-opacity"
              >
                Criar Coleção
              </button>
            </form>
          </div>
        </div>
      )}

      {!activeCollection ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map(col => (
            <div 
              key={col.id} 
              className="p-5 rounded-3xl bg-zinc-200/20 dark:bg-zinc-900/30 border border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/40 transition-all flex flex-col justify-between group h-48 cursor-pointer relative"
              onClick={() => setSelectedCollectionId(col.id)}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-3xl p-1 bg-white/5 rounded-2xl">{col.icon}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCollection(col.id);
                    }}
                    className="p-1.5 rounded-full hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 absolute top-4 right-4"
                    title="Excluir Coleção"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-base font-semibold text-zinc-850 dark:text-zinc-100 group-hover:text-bujo-highlight transition-colors">
                  {col.name}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {col.description || 'Nenhuma descrição fornecida.'}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-200/10 pt-2.5 text-[10px] font-medium text-zinc-400">
                <span className="font-mono">{col.items?.length || 0} Itens</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-bujo-highlight font-bold">
                  Abrir Coleção <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}

          <div 
            onClick={() => setShowCreateCollectionModal(true)}
            className="p-5 rounded-3xl border-2 border-dashed border-zinc-350/50 dark:border-white/10 hover:border-bujo-highlight/50 transition-all flex flex-col items-center justify-center h-48 cursor-pointer text-zinc-550 hover:text-bujo-highlight dark:hover:text-bujo-highlight text-center gap-2 group"
          >
            <div className="p-3 rounded-full bg-zinc-200/50 dark:bg-white/5 group-hover:scale-105 transition-transform">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-xs font-semibold">Adicionar Nova Coleção</span>
            <span className="text-[10px] text-zinc-400">Crie uma lista para estruturar suas atividades</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 rounded-3xl bg-zinc-200/20 dark:bg-zinc-900/30 border border-zinc-200/30 dark:border-white/5 p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/10">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Itens da Coleção ({activeCollection.items.length})
              </span>
              <div className="flex gap-1">
                <span className="text-[9px] px-1.5 py-0.5 bg-zinc-200/50 dark:bg-white/5 rounded text-zinc-400">
                  A Fazer: {activeCollection.items.filter((i: any) => i.status === 'todo').length}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/15 rounded text-amber-500">
                  Progresso: {activeCollection.items.filter((i: any) => i.status === 'doing').length}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/15 rounded text-emerald-500">
                  Pronto: {activeCollection.items.filter((i: any) => i.status === 'done').length}
                </span>
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

            <div className="space-y-2.5 overflow-y-auto max-h-[480px] pr-1">
              {activeCollection.items.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs italic">
                  Nenhum item adicionado a esta coleção. Crie um item acima!
                </div>
              ) : (
                activeCollection.items.map((item: any) => {
                  const isSelected = item.id === selectedItemId;
                  const subtaskTotal = item.subtasks?.length || 0;
                  const subtaskCompleted = item.subtasks?.filter((s: any) => s.completed).length || 0;
                  const mediaCount = item.media?.length || 0;
                  
                  let statusColor = 'bg-zinc-500';
                  let statusLabel = 'A Fazer';
                  if (item.status === 'doing') {
                    statusColor = 'bg-amber-500';
                    statusLabel = 'Em Progresso';
                  } else if (item.status === 'done') {
                    statusColor = 'bg-emerald-500';
                    statusLabel = 'Concluído';
                  }

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 relative group ${
                        isSelected 
                          ? 'bg-bujo-highlight/10 border-bujo-highlight text-white shadow-md' 
                          : 'bg-zinc-200/20 dark:bg-white/5 border-zinc-200/30 dark:border-white/5 hover:border-zinc-400 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="text-xs font-semibold leading-snug truncate max-w-[80%]">
                          {item.title}
                        </h4>
                        <span className={`text-[8px] font-bold text-white px-1.5 py-0.5 rounded uppercase shrink-0 ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-zinc-500 dark:text-zinc-400 font-mono mt-1 border-t border-zinc-200/10 pt-2">
                        <div className="flex items-center gap-2">
                          {subtaskTotal > 0 && (
                            <span className="flex items-center gap-0.5" title="Subtarefas">
                              ☑️ {subtaskCompleted}/{subtaskTotal}
                            </span>
                          )}
                          {mediaCount > 0 && (
                            <span className="flex items-center gap-0.5" title="Mídias anexadas">
                              📎 {mediaCount}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCollectionItem(activeCollection.id, item.id);
                          }}
                          className="p-1 rounded hover:bg-red-500/15 text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remover Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-7 rounded-3xl bg-zinc-200/20 dark:bg-zinc-900/30 border border-zinc-200/30 dark:border-white/5 p-6 flex flex-col gap-6 items-stretch">
            {!activeItem ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 gap-2.5 py-20 select-none">
                <div className="text-4xl">📚</div>
                <span className="text-xs font-semibold">Nenhum Item Selecionado</span>
                <p className="text-[10px] max-w-xs leading-normal">
                  Selecione um item da lista lateral para visualizar suas anotações, checklist de micro-tarefas e anexos de mídias ou arquivos.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-3 border-b border-zinc-200/10">
                  <div className="flex-1 w-full">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Título do Item</span>
                    <input
                      type="text"
                      value={activeItem.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCollections(prev => prev.map(col => {
                          if (col.id === activeCollection.id) {
                            return {
                              ...col,
                              items: col.items.map((i: any) => i.id === activeItem.id ? { ...i, title: val } : i)
                            };
                          }
                          return col;
                        }));
                      }}
                      className="w-full bg-transparent border-b border-transparent hover:border-zinc-350 dark:hover:border-zinc-800 focus:border-bujo-highlight font-semibold text-sm outline-none text-zinc-900 dark:text-white pb-1"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Status</span>
                      <select
                        value={activeItem.status}
                        onChange={(e) => handleUpdateCollectionItemStatus(activeCollection.id, activeItem.id, e.target.value as any)}
                        className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-bujo-text outline-none cursor-pointer"
                      >
                        <option value="todo">🔴 A Fazer</option>
                        <option value="doing">🟡 Em Progresso</option>
                        <option value="done">🟢 Concluído</option>
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-transparent select-none block mb-1">Ação</span>
                      <button
                        onClick={() => migrateCollectionItemToDailyLog(activeItem, activeCollection.name)}
                        className="px-3 py-1.5 bg-bujo-accent text-white hover:opacity-95 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm shrink-0"
                      >
                        <span>✈️</span> Migrar p/ Diário
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Anotações & Resumos</label>
                    <span className="text-[8px] text-zinc-500 font-medium">Salva automaticamente</span>
                  </div>
                  <textarea
                    value={activeItem.notes || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setCollections(prev => prev.map(col => {
                        if (col.id === activeCollection.id) {
                          return {
                            ...col,
                            items: col.items.map((i: any) => i.id === activeItem.id ? { ...i, notes: val } : i)
                          };
                        }
                        return col;
                      }));
                    }}
                    placeholder="Anote detalhes de livros, resumos de aulas, requisitos de projetos..."
                    className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 text-xs text-bujo-text outline-none focus:border-bujo-highlight h-24 resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-2.5 p-4 rounded-2xl bg-zinc-250/20 dark:bg-white/[0.02] border border-zinc-250/30 dark:border-white/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h5 className="text-[11px] font-bold text-zinc-850 dark:text-zinc-350 uppercase tracking-widest">📋 Micro-tarefas Checklist</h5>
                      <p className="text-[9px] text-zinc-400 font-medium">Divida o item em passos pequenos para reduzir o bloqueio inicial.</p>
                    </div>
                    
                    {(() => {
                      const isDecomposing = decomposingCollectionItemIds[activeItem.id] || activeLLMCollectionItemId === activeItem.id;
                      return (
                        <button
                          onClick={() => handleAICollectionItemDecompose(activeCollection.id, activeItem.id, activeItem.title)}
                          disabled={isDecomposing}
                          className={`px-3 py-1.5 bg-gradient-to-r from-bujo-highlight to-indigo-600 text-white rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 shadow disabled:opacity-50 ${
                            isDecomposing ? 'animate-pulse' : 'hover:scale-[1.02]'
                          }`}
                        >
                          {isDecomposing ? (
                            <>⌛ Decompondo...</>
                          ) : (
                            <>🤖 Decompor com IA</>
                          )}
                        </button>
                      );
                    })()}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Novo passo..."
                      id={`new-col-subtask-${activeItem.id}`}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const el = e.target as HTMLInputElement;
                          handleAddCollectionItemSubtask(activeCollection.id, activeItem.id, el.value);
                          el.value = '';
                        }
                      }}
                      className="flex-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-bujo-text outline-none focus:border-bujo-highlight"
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById(`new-col-subtask-${activeItem.id}`) as HTMLInputElement;
                        if (el) {
                          handleAddCollectionItemSubtask(activeCollection.id, activeItem.id, el.value);
                          el.value = '';
                        }
                      }}
                      className="px-3 bg-zinc-300/40 dark:bg-white/10 text-bujo-text font-bold text-xs hover:bg-zinc-350 dark:hover:bg-white/20 rounded-xl transition-all"
                    >
                      Adicionar
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {!activeItem.subtasks || activeItem.subtasks.length === 0 ? (
                      <div className="text-[10px] text-zinc-500 italic py-2 text-center">
                        Nenhum passo definido ainda.
                      </div>
                    ) : (
                      activeItem.subtasks.map((st: any) => (
                        <div 
                          key={st.id} 
                          className="flex items-center justify-between gap-3 p-2 bg-zinc-100/50 dark:bg-white/[0.01] hover:bg-zinc-200/30 dark:hover:bg-white/5 rounded-xl border border-zinc-200/10 transition-colors group/sub"
                        >
                          <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={st.completed}
                              onChange={() => handleToggleCollectionItemSubtask(activeCollection.id, activeItem.id, st.id)}
                              className="accent-bujo-highlight h-3.5 w-3.5 rounded"
                            />
                            <span className={`truncate leading-tight ${st.completed ? 'line-through text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'}`}>
                              {st.content}
                            </span>
                          </label>
                          <button
                            onClick={() => handleDeleteCollectionItemSubtask(activeCollection.id, activeItem.id, st.id)}
                            className="p-1 text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover/sub:opacity-100"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-2xl bg-zinc-250/20 dark:bg-white/[0.02] border border-zinc-250/30 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-[11px] font-bold text-zinc-850 dark:text-zinc-350 uppercase tracking-widest">📎 Biblioteca de Mídias e Links</h5>
                      <p className="text-[9px] text-zinc-400 font-medium">Adicione arquivos PDFs, mídias ou links importantes.</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAddMediaLink(!showAddMediaLink)}
                        className="px-2.5 py-1.5 bg-zinc-200 dark:bg-white/5 border border-zinc-300 dark:border-white/10 hover:bg-zinc-300 dark:hover:bg-white/10 rounded-xl text-[10px] font-semibold text-bujo-text transition-colors flex items-center gap-1"
                      >
                        <Link2 className="w-3 h-3" /> Link Web
                      </button>
                      
                      <label className="px-2.5 py-1.5 bg-zinc-200 dark:bg-white/5 border border-zinc-300 dark:border-white/10 hover:bg-zinc-300 dark:hover:bg-white/10 rounded-xl text-[10px] font-semibold text-bujo-text transition-colors flex items-center gap-1 cursor-pointer">
                        <Plus className="w-3 h-3" /> Arquivo Local
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={e => handleUploadCollectionItemMedia(activeCollection.id, activeItem.id, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {showAddMediaLink && (
                    <div className="p-3 bg-zinc-150 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase block">Anexar Link da Internet</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Nome (Ex: Artigo de Referência)"
                          value={mediaLinkName}
                          onChange={e => setMediaLinkName(e.target.value)}
                          className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-bujo-text outline-none focus:border-bujo-highlight"
                        />
                        <input
                          type="url"
                          placeholder="URL completa (https://...)"
                          value={mediaLinkUrl}
                          onChange={e => setMediaLinkUrl(e.target.value)}
                          className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-bujo-text outline-none focus:border-bujo-highlight"
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
                          onClick={() => handleAddCollectionItemMediaLink(activeCollection.id, activeItem.id)}
                          className="px-3 py-1 bg-bujo-highlight text-white font-bold rounded-lg"
                        >
                          Anexar Link
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1">
                    {!activeItem.media || activeItem.media.length === 0 ? (
                      <div className="col-span-full text-[10px] text-zinc-500 italic py-2 text-center">
                        Nenhum arquivo ou link anexado.
                      </div>
                    ) : (
                      activeItem.media.map((med: any) => (
                        <div 
                          key={med.id} 
                          className="flex items-center gap-3 p-2 bg-zinc-100/50 dark:bg-white/[0.01] hover:bg-zinc-200/20 dark:hover:bg-white/5 rounded-xl border border-zinc-200/10 transition-colors group/med text-left overflow-hidden min-w-0"
                        >
                          {med.type === 'image' ? (
                            <img 
                              src={med.url} 
                              alt={med.name} 
                              className="w-10 h-10 object-cover rounded-lg border border-white/10 shrink-0 cursor-pointer"
                              onClick={() => {
                                const win = window.open();
                                win?.document.write(`<img src="${med.url}" style="max-width:100%; height:auto;" />`);
                              }}
                            />
                          ) : med.type === 'pdf' ? (
                            <div className="w-10 h-10 bg-red-650/10 border border-red-500/20 text-red-500 flex items-center justify-center rounded-lg shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-indigo-650/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center rounded-lg shrink-0">
                              <Link2 className="w-5 h-5" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-semibold text-zinc-850 dark:text-zinc-200 block truncate leading-snug">
                              {med.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <a 
                                href={med.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-[9px] text-bujo-highlight font-bold hover:underline"
                              >
                                {med.type === 'link' ? 'Visitar Link' : 'Abrir'}
                              </a>
                              {med.size && (
                                <span className="text-[8px] text-zinc-500 font-mono">
                                  • {(med.size / 1024).toFixed(0)} KB
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteCollectionItemMedia(activeCollection.id, activeItem.id, med.id)}
                            className="p-1 hover:bg-red-500/15 text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover/med:opacity-100 shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
