import React, { useState } from 'react';
import { Sparkles, Trophy, Plus, Trash2, Award, Filter, Check, GripVertical } from 'lucide-react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem, DragHandle } from '../../../components/common/SortableItem';
import { useBujo } from '../../../context/BujoContext';

export const DreamBoardTab = () => {
  const {
    dreams,
    handleAddDream,
    handleToggleDreamConquered,
    handleDeleteDream,
    handleReorderDreams,
    askConfirmation
  } = useBujo();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      handleReorderDreams(active.id as string, over.id as string);
    }
  };

  // Local Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Pessoal');
  const [icon, setIcon] = useState('🏆');
  const [showAddForm, setShowAddForm] = useState(false);

  // Filters state
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'conquered'>('all');

  // Confetti triggering state (per item id)
  const [celebratingId, setCelebratingId] = useState<string | null>(null);

  const categories = ['Pessoal', 'Carreira', 'Viagem', 'Saúde', 'Finanças', 'Bens', 'Outros'];
  const emojis = ['🏆', '✨', '✈️', '💻', '🏠', '🚗', '🎓', '🏃‍♂️', '🍎', '🎨', '🎵', '💼', '💰', '❤️', '🌟', '🤝', '📚', '🏡'];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    handleAddDream(title, category, icon, description);
    setTitle('');
    setDescription('');
    setCategory('Pessoal');
    setIcon('🏆');
    setShowAddForm(false);
  };

  const handleConquerClick = (id: string, conquered: boolean) => {
    if (!conquered) {
      // Trigger local celebration animation
      setCelebratingId(id);
      setTimeout(() => {
        setCelebratingId(null);
      }, 2500);
    }
    handleToggleDreamConquered(id);
  };

  // Filtered dreams
  const filteredDreams = dreams.filter(dream => {
    const matchesCategory = selectedCategoryFilter === 'Todos' || dream.category === selectedCategoryFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && !dream.conquered) ||
      (statusFilter === 'conquered' && dream.conquered);
    return matchesCategory && matchesStatus;
  });

  const conqueredCount = dreams.filter(d => d.conquered).length;

  return (
    <div className="space-y-6 animate-fade-in relative pb-10">
      {/* CSS Animations for Celebration and Gold Glow */}
      <style>{`
        @keyframes float-emoji {
          0% {
            transform: translateY(0) scale(0.5) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-80px) scale(1.2) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes gold-shine {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-float-1 { animation: float-emoji 2s ease-out infinite 0.1s; }
        .animate-float-2 { animation: float-emoji 1.8s ease-out infinite 0.3s; }
        .animate-float-3 { animation: float-emoji 2.2s ease-out infinite 0.5s; }
        .animate-float-4 { animation: float-emoji 1.5s ease-out infinite 0.7s; }
        .animate-float-5 { animation: float-emoji 2.4s ease-out infinite 0.9s; }
        
        .gold-border-glow {
          border: 1px solid rgba(245, 158, 11, 0.4);
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.15);
          background: linear-gradient(135deg, rgba(30, 27, 22, 0.4) 0%, rgba(20, 20, 20, 0.5) 100%);
        }
        .dark .gold-border-glow {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.03) 0%, rgba(245, 158, 11, 0.05) 100%);
        }
      `}</style>

      {/* Header */}
      <div className="border-b border-zinc-200/50 dark:border-white/10 pb-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest">QUADRO DOS SONHOS</span>
          <h3 className="text-3xl font-light">
            Quadro dos Sonhos — <span className="italic font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Conquistas</span>
          </h3>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Progress Overview Badge */}
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{conqueredCount} de {dreams.length} Conquistados</span>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-bujo-highlight text-white rounded-xl text-xs font-bold hover:bg-bujo-highlight/90 transition-all flex items-center gap-1.5 shadow-md shadow-bujo-highlight/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Adicionar Sonho
          </button>
        </div>
      </div>

      {/* Form Add Dream */}
      {showAddForm && (
        <form onSubmit={handleFormSubmit} className="p-5 rounded-3xl bg-zinc-200/30 dark:bg-white/5 border border-zinc-300/40 dark:border-white/10 space-y-4 animate-fade-in">
          <h4 className="text-sm font-bold flex items-center gap-1.5 text-bujo-text">
            <Sparkles className="w-4 h-4 text-bujo-highlight" />
            Qual é o seu próximo grande objetivo ou sonho?
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-zinc-400 font-bold uppercase">Título do Sonho</label>
              <input
                type="text"
                placeholder="Ex: Falar inglês fluentemente, Comprar meu próprio carro..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-zinc-200/50 dark:bg-white/10 border border-zinc-350 dark:border-white/10 text-sm text-bujo-text px-3.5 py-2 rounded-xl outline-none focus:ring-1 focus:ring-bujo-highlight"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-zinc-400 font-bold uppercase">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-zinc-200/50 dark:bg-white/10 border border-zinc-350 dark:border-white/10 text-sm text-bujo-text px-3 py-2 rounded-xl outline-none focus:ring-1 focus:ring-bujo-highlight"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="dark:bg-zinc-900">{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-zinc-400 font-bold uppercase">Descrição / Detalhes (Opcional)</label>
            <textarea
              placeholder="Descreva o que isso significa para você, por que é importante ou as etapas para chegar lá..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="bg-zinc-200/50 dark:bg-white/10 border border-zinc-350 dark:border-white/10 text-sm text-bujo-text px-3.5 py-2 rounded-xl outline-none focus:ring-1 focus:ring-bujo-highlight resize-none"
            />
          </div>

          {/* Emoji/Icon Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] text-zinc-400 font-bold uppercase">Selecione um Ícone / Avatar</label>
            <div className="flex flex-wrap gap-2">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-lg border transition-all ${
                    icon === emoji 
                      ? 'bg-bujo-highlight border-bujo-highlight text-white scale-110 shadow-md'
                      : 'bg-zinc-200/50 dark:bg-white/5 border-zinc-300 dark:border-white/10 hover:bg-zinc-300 dark:hover:bg-white/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-zinc-300 dark:bg-white/10 text-bujo-text rounded-xl text-xs font-bold hover:bg-zinc-400 dark:hover:bg-white/20 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer"
            >
              Fixar no Quadro ✨
            </button>
          </div>
        </form>
      )}

      {/* Filters Row */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-3.5 rounded-2xl bg-zinc-200/20 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <button
            onClick={() => setSelectedCategoryFilter('Todos')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedCategoryFilter === 'Todos'
                ? 'bg-bujo-text text-zinc-900 dark:text-zinc-900 bg-white shadow-sm'
                : 'text-zinc-500 hover:text-bujo-text'
            }`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategoryFilter === cat
                  ? 'bg-bujo-text text-zinc-900 dark:text-zinc-900 bg-white shadow-sm'
                  : 'text-zinc-500 hover:text-bujo-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 border border-zinc-300 dark:border-white/10 rounded-xl p-1 shrink-0 bg-zinc-200/50 dark:bg-white/5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-bujo-highlight text-white'
                : 'text-zinc-500'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
              statusFilter === 'active'
                ? 'bg-bujo-highlight text-white'
                : 'text-zinc-500'
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setStatusFilter('conquered')}
            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
              statusFilter === 'conquered'
                ? 'bg-bujo-highlight text-white'
                : 'text-zinc-500'
            }`}
          >
            🏆 Conquistados
          </button>
        </div>
      </div>

      {/* Dreams Grid */}
      {filteredDreams.length === 0 ? (
        <div className="p-12 rounded-3xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 text-center flex flex-col items-center justify-center gap-3">
          <div className="p-4 rounded-full bg-zinc-200/40 dark:bg-white/5 text-zinc-400 border border-zinc-200/30 dark:border-white/10">
            <Trophy className="w-8 h-8 opacity-40" />
          </div>
          <h4 className="text-sm font-bold text-zinc-200">Nenhum sonho por aqui</h4>
          <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
            Adicione seus objetivos, metas pessoais ou sonhos e marque-os como conquistados à medida que realizar suas conquistas!
          </p>
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredDreams.map(d => d.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDreams.map(dream => {
                const isCelebrating = celebratingId === dream.id;
                return (
                  <SortableItem
                    key={dream.id}
                    id={dream.id}
                    className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 transition-all duration-300 relative overflow-hidden group ${
                      dream.conquered 
                        ? 'gold-border-glow scale-[1.01]' 
                        : 'bg-zinc-200/15 dark:bg-white/5 border-zinc-200/30 dark:border-white/10 hover:border-zinc-350 dark:hover:border-white/20'
                    }`}
                  >
                    {/* Float Emojis Animation on Conquer */}
                    {isCelebrating && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-10">
                        <span className="absolute text-2xl animate-float-1 left-[15%] bottom-0">✨</span>
                        <span className="absolute text-2xl animate-float-2 left-[35%] bottom-0">🏆</span>
                        <span className="absolute text-2xl animate-float-3 left-[55%] bottom-0">🎉</span>
                        <span className="absolute text-2xl animate-float-4 left-[75%] bottom-0">🌟</span>
                        <span className="absolute text-2xl animate-float-5 left-[45%] bottom-0">❤️</span>
                      </div>
                    )}

                    <div className="space-y-3 relative z-2">
                      <div className="flex items-start justify-between gap-2">
                        {/* Emoji Avatar */}
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                          dream.conquered
                            ? 'bg-amber-500/25 border border-amber-500/30'
                            : 'bg-zinc-200/50 dark:bg-white/5 border border-zinc-300/20 dark:border-white/5'
                        }`}>
                          {dream.icon || '🏆'}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Drag Handle */}
                          <DragHandle id={dream.id} className="p-1 text-zinc-400/60 dark:text-zinc-500/60 hover:text-bujo-highlight dark:hover:text-bujo-highlight transition-colors">
                            <GripVertical className="w-3.5 h-3.5" />
                          </DragHandle>

                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase select-none ${
                            dream.conquered
                              ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-zinc-200/60 dark:bg-white/10 text-zinc-500 dark:text-zinc-400'
                          }`}>
                            {dream.category}
                          </span>

                          <button
                            onClick={() => {
                              askConfirmation({
                                title: 'Remover Sonho?',
                                message: `Deseja realmente remover o sonho "${dream.title}" do seu Quadro dos Sonhos?`,
                                confirmText: 'Remover',
                                cancelText: 'Cancelar',
                                isDanger: true,
                                onConfirm: () => {
                                  handleDeleteDream(dream.id);
                                }
                              });
                            }}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title="Remover sonho"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className={`text-base font-bold tracking-tight break-words ${
                          dream.conquered ? 'text-amber-600 dark:text-amber-400' : 'text-bujo-text'
                        }`}>
                          {dream.title}
                        </h4>
                        {dream.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed break-words">
                            {dream.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-200/40 dark:border-white/5 flex items-center justify-between gap-3 relative z-2">
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {dream.conquered && dream.conqueredAt ? (
                          <span className="text-amber-500 dark:text-amber-400 flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            Conquistado em: {new Date(dream.conqueredAt + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        ) : (
                          <span>Ativo</span>
                        )}
                      </div>

                      <button
                        onClick={() => handleConquerClick(dream.id, dream.conquered)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          dream.conquered
                            ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20'
                            : 'bg-zinc-200/50 dark:bg-white/10 text-bujo-text hover:bg-bujo-highlight hover:text-white border border-zinc-300/30 dark:border-white/10'
                        }`}
                      >
                        {dream.conquered ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            Conquistado!
                          </>
                        ) : (
                          <>
                            <span>Conquistar</span>
                            <span>🏆</span>
                          </>
                        )}
                      </button>
                    </div>
                  </SortableItem>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
