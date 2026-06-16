import React, { useState } from 'react';
import { BookOpen, Plus, Calendar, Trash, Check, CheckSquare } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';

export const SomedayMaybeTab = () => {
  const {
    somedayItems,
    handleAddSomedayItem,
    handleDeleteSomedayItem,
    handleScheduleSomedayItem,
    handleToggleSomedayItem
  } = useBujo();

  const [inputContent, setInputContent] = useState('');
  const [inputType, setInputType] = useState<'task' | 'event' | 'note'>('task');
  const [scheduleDates, setScheduleDates] = useState<{ [id: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputContent.trim();
    if (!content) return;
    handleAddSomedayItem(content, inputType);
    setInputContent('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-zinc-200/50 dark:border-white/10 pb-4">
        <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest">CAPTURA GTD</span>
        <h3 className="text-3xl font-light">
          Algum Dia / Talvez — <span className="italic font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Ideias e Projetos Futuros</span>
        </h3>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Someday/Maybe list */}
        <div className="flex-1 space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200/40 dark:border-white/5 pb-2">
            Minhas Capturas
          </h4>

          {somedayItems.length === 0 ? (
            <div className="p-8 rounded-3xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 text-center flex flex-col items-center justify-center gap-2">
              <p className="text-xs text-zinc-500 italic">Nenhum item em Algum Dia/Talvez.</p>
              <p className="text-[10px] text-zinc-600 max-w-xs leading-relaxed">
                Use este espaço para descarregar ideias de projetos, sonhos, livros para ler ou coisas a realizar no futuro sem uma data definida.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {somedayItems.map(item => {
                const isCompleted = item.status === 'completed';
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isCompleted ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {item.type === 'task' ? (
                        <button
                          onClick={() => handleToggleSomedayItem(item.id)}
                          className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                            isCompleted
                              ? 'bg-bujo-accent border-bujo-accent text-white'
                              : 'bg-transparent border-zinc-400 dark:border-white/20 hover:border-bujo-accent'
                          }`}
                        >
                          {isCompleted && <Check className="w-3 h-3 stroke-[2.5]" />}
                        </button>
                      ) : (
                        <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-lg shrink-0 mt-0.5 ${
                          item.type === 'event' ? 'bg-bujo-accent/15 text-bujo-accent' : 'bg-zinc-550/20 text-zinc-450'
                        }`}>
                          {item.type === 'event' ? 'Event' : 'Note'}
                        </span>
                      )}
                      <span className={`text-xs text-bujo-text font-medium truncate ${isCompleted ? 'line-through text-zinc-500' : ''}`} title={item.content}>
                        {item.content}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      {/* Inline Scheduler */}
                      <div className="flex items-center gap-1.5 bg-zinc-200/40 dark:bg-white/3 border border-zinc-300/40 dark:border-white/5 p-1 rounded-xl">
                        <input
                          type="date"
                          value={scheduleDates[item.id] || ''}
                          onChange={(e) => setScheduleDates(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="px-2 py-0.5 text-[9px] rounded-lg bg-zinc-250/20 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 text-bujo-text focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const date = scheduleDates[item.id];
                            if (!date) return;
                            handleScheduleSomedayItem(item.id, date);
                          }}
                          disabled={!scheduleDates[item.id]}
                          className="px-2.5 py-1 text-[9.5px] font-bold bg-bujo-accent hover:opacity-95 disabled:opacity-40 text-white rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          title="Agendar para o Daily Log"
                        >
                          <Calendar className="w-3 h-3" />
                          Agendar
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteSomedayItem(item.id)}
                        className="p-1.5 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded-lg transition-all cursor-pointer border border-transparent hover:border-red-500/20"
                        title="Excluir"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Quick Capture Form */}
        <div className="w-full md:w-80 space-y-4 no-print">
          <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
            Capturar Nova Ideia
          </h4>
          <form onSubmit={handleSubmit} className="p-4 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-550 uppercase">O que você está pensando?</label>
              <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="Escreva sua ideia, tarefa futura ou meta..."
                className="w-full h-24 bg-zinc-200/30 dark:bg-white/5 border border-zinc-300/40 dark:border-white/10 rounded-xl p-3 text-xs text-bujo-text placeholder:text-zinc-650 outline-none focus:border-bujo-highlight/40 resize-none font-sans"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-550 uppercase">Tipo</label>
              <div className="grid grid-cols-3 gap-1 bg-zinc-200/40 dark:bg-white/5 p-1 rounded-xl border border-zinc-300/40 dark:border-white/10">
                {(['task', 'event', 'note'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInputType(type)}
                    className={`py-1 text-[9.5px] font-bold rounded-lg transition-all cursor-pointer uppercase ${
                      inputType === type
                        ? 'bg-bujo-highlight text-white shadow-sm'
                        : 'text-zinc-500 hover:text-bujo-text'
                    }`}
                  >
                    {type === 'task' ? 'Tarefa' : type === 'event' ? 'Evento' : 'Nota'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-bujo-highlight text-white hover:opacity-95 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Capturar Ideia
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
