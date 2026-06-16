import React from 'react';
import { Trash2, RotateCcw, ShieldAlert, Trash } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';

export const TrashTab = () => {
  const {
    trashItems,
    handleRestoreItem,
    handleDeletePermanently,
    handleEmptyTrash
  } = useBujo();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-zinc-200/50 dark:border-white/10 pb-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest">ITENS EXCLUÍDOS</span>
          <h3 className="text-3xl font-light">
            Lixeira — <span className="italic font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Recuperação</span>
          </h3>
        </div>
        
        {trashItems.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Deseja realmente esvaziar a lixeira? Todos os itens serão excluídos permanentemente.')) {
                handleEmptyTrash();
              }
            }}
            className="px-4 py-2 text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all border border-red-500/25 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash className="w-3.5 h-3.5" />
            Esvaziar Lixeira
          </button>
        )}
      </div>

      {/* Main Body */}
      {trashItems.length === 0 ? (
        <div className="p-12 rounded-3xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 text-center flex flex-col items-center justify-center gap-3">
          <div className="p-4 rounded-full bg-zinc-200/40 dark:bg-white/5 text-zinc-400 border border-zinc-200/30 dark:border-white/10">
            <Trash2 className="w-8 h-8 opacity-40" />
          </div>
          <h4 className="text-sm font-bold text-zinc-200">Sua lixeira está vazia</h4>
          <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
            Itens excluídos nos logs diários, coleções ou tarefas agendadas aparecerão aqui antes de serem removidos em definitivo.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10.5px] leading-relaxed flex gap-2.5 items-start">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              Itens na lixeira podem ser restaurados para as suas datas ou coleções originais a qualquer momento. Exclusões permanentes não podem ser desfeitas.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {trashItems.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 flex items-center justify-between gap-4 hover:border-zinc-300 dark:hover:border-white/10 transition-all"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      item.type === 'task' ? 'bg-bujo-highlight/15 text-bujo-highlight' :
                      item.type === 'event' ? 'bg-bujo-accent/15 text-bujo-accent' :
                      'bg-zinc-550/20 text-zinc-400'
                    }`}>
                      {item.type === 'task' ? 'Tarefa' : item.type === 'event' ? 'Evento' : 'Nota'}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono">
                      Data original: {item.date === 'someday_maybe' ? 'Algum Dia/Talvez' : new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <span className="text-xs text-bujo-text font-medium truncate font-sans mt-0.5">
                    {item.content}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRestoreItem(item.id)}
                    className="p-2 bg-bujo-accent/10 hover:bg-bujo-accent/20 text-bujo-accent rounded-xl border border-bujo-accent/25 flex items-center justify-center transition-all cursor-pointer"
                    title="Restaurar Item"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Excluir este item permanentemente?')) {
                        handleDeletePermanently(item.id);
                      }
                    }}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/25 flex items-center justify-center transition-all cursor-pointer"
                    title="Excluir Permanentemente"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
