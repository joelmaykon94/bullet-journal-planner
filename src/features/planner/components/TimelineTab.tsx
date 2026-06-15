import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BujoItem } from '../../../types';

interface TimelineTabProps {
  items: BujoItem[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  timelineMobileView: 'timeline' | 'unscheduled';
  setTimelineMobileView: (view: 'timeline' | 'unscheduled') => void;
  hours: string[];
  assignItemToTime: (id: string, time: string) => void;
  setSelectedHourToSchedule: (hour: number | null) => void;
  editingItemId: string | null;
  editingItemContent: string;
  setEditingItemContent: (content: string) => void;
  handleSaveEditItem: (id: string) => void;
  setEditingItemId: (id: string | null) => void;
  openTasksUnscheduled: BujoItem[];
}

export const TimelineTab = ({
  items,
  selectedDate,
  setSelectedDate,
  timelineMobileView,
  setTimelineMobileView,
  hours,
  assignItemToTime,
  setSelectedHourToSchedule,
  editingItemId,
  editingItemContent,
  setEditingItemContent,
  handleSaveEditItem,
  setEditingItemId,
  openTasksUnscheduled
}: TimelineTabProps) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200/50 dark:border-white/10 pb-4 gap-4">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest">COMBATE À CEGUEIRA TEMPORAL</span>
          <h3 className="text-3xl font-light">
            Visual Timeline — <span className="italic font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>
              {selectedDate === today ? 'Hoje' : new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </h3>
        </div>

        {/* Day Navigation */}
        <div className="flex items-center gap-1.5 bg-zinc-200/30 dark:bg-white/5 p-1 rounded-xl border border-zinc-200/40 dark:border-white/10 no-print self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              const prev = new Date(selectedDate + 'T00:00:00');
              prev.setDate(prev.getDate() - 1);
              setSelectedDate(prev.toISOString().split('T')[0]);
            }}
            className="p-1.5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-white/5 transition-colors"
            title="Dia Anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono font-bold px-2 text-bujo-text">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </span>
          <button
            type="button"
            onClick={() => {
              const next = new Date(selectedDate + 'T00:00:00');
              next.setDate(next.getDate() + 1);
              setSelectedDate(next.toISOString().split('T')[0]);
            }}
            className="p-1.5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-white/5 transition-colors"
            title="Próximo Dia"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex bg-zinc-200/30 dark:bg-white/5 p-1 rounded-xl border border-zinc-200/40 dark:border-white/10 lg:hidden no-print">
        <button
          onClick={() => setTimelineMobileView('timeline')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            timelineMobileView === 'timeline'
              ? 'bg-bujo-highlight text-white shadow-sm'
              : 'text-zinc-500'
          }`}
        >
          Linha do Tempo
        </button>
        <button
          onClick={() => setTimelineMobileView('unscheduled')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            timelineMobileView === 'unscheduled'
              ? 'bg-bujo-highlight text-white shadow-sm'
              : 'text-zinc-500'
          }`}
        >
          Pendentes ({openTasksUnscheduled.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className={`lg:col-span-2 space-y-1 relative bg-zinc-200/15 dark:bg-white/[0.01] border border-zinc-200/30 dark:border-white/5 rounded-3xl p-4 overflow-hidden ${
          timelineMobileView === 'timeline' ? 'block' : 'hidden lg:block'
        }`}>
          
          {selectedDate === today && (() => {
            const now = new Date();
            const h = now.getHours();
            const m = now.getMinutes();
            if (h >= 6 && h <= 23) {
              const pct = ((h - 6) * 60 + m) / ((23 - 6 + 1) * 60) * 100;
              return (
                <div 
                  className="absolute left-0 right-0 h-0.5 bg-bujo-highlight z-10 pointer-events-none opacity-80"
                  style={{ top: `calc(${pct}% + 16px)` }}
                >
                  <span className="absolute right-2 -top-2 bg-bujo-highlight text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                    AGORA {h.toString().padStart(2, '0')}:{m.toString().padStart(2, '0')}
                  </span>
                </div>
              );
            }
            return null;
          })()}

          {hours.map(hour => {
            const hourNum = parseInt(hour.split(':')[0]);
            const isCurrentHour = selectedDate === today && hourNum === new Date().getHours();
            const hourItems = items.filter(item => {
              if (item.date !== selectedDate) return false;
              if (!item.time) return false;
              const itemHour = parseInt(item.time.split(':')[0]);
              return itemHour === hourNum;
            });

            return (
              <div 
                key={hour}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const id = e.dataTransfer.getData('text/plain');
                  assignItemToTime(id, `${hourNum.toString().padStart(2, '0')}:00`);
                }}
                onClick={() => setSelectedHourToSchedule(hourNum)}
                className={`flex items-start gap-4 p-3 rounded-2xl border transition-all cursor-pointer ${
                  isCurrentHour 
                    ? 'bg-bujo-highlight/10 border-bujo-highlight/30 shadow-[0_0_12px_rgba(224,142,69,0.08)]' 
                    : 'bg-transparent border-transparent hover:bg-zinc-200/20 dark:hover:bg-white/[0.02]'
                }`}
              >
                <div className={`text-xs font-mono w-10 ${isCurrentHour ? 'text-bujo-highlight font-bold' : 'text-zinc-400'}`}>
                  {hour}
                </div>
                
                <div className="flex-1 min-h-[30px] flex flex-col gap-2">
                  {hourItems.map(item => (
                    <div 
                      key={item.id}
                      draggable={editingItemId !== item.id}
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', item.id)}
                      className="flex items-center justify-between p-2 rounded-xl bg-zinc-200/40 dark:bg-white/5 border border-zinc-300/40 dark:border-white/10 shadow-sm text-xs hover:bg-zinc-300/60 dark:hover:bg-white/10 cursor-grab"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {editingItemId === item.id ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <input
                            type="text"
                            value={editingItemContent}
                            onChange={(e) => setEditingItemContent(e.target.value)}
                            className="flex-1 bg-zinc-200/50 dark:bg-white/10 border border-bujo-highlight text-xs text-bujo-text px-2 py-1 rounded-lg outline-none font-medium"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEditItem(item.id);
                              if (e.key === 'Escape') setEditingItemId(null);
                            }}
                          />
                          <button
                            onClick={() => handleSaveEditItem(item.id)}
                            className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="px-1.5 py-0.5 bg-zinc-300 dark:bg-white/10 text-bujo-text rounded text-[10px] font-bold cursor-pointer"
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className={item.status === 'completed' ? 'line-through opacity-40' : ''}>{item.content}</span>
                          <span className="text-[10px] text-zinc-400 font-bold uppercase">{item.type === 'event' ? 'Evento' : 'Tarefa'}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className={`lg:col-span-1 space-y-4 ${
          timelineMobileView === 'unscheduled' ? 'block' : 'hidden lg:block'
        }`}>
          <div className="p-5 rounded-3xl bg-zinc-200/30 dark:bg-white/5 border border-zinc-200/40 dark:border-white/10 sticky top-4">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center justify-between">
              Pendentes não Agendados
              <span className="bg-bujo-highlight/10 text-bujo-highlight px-2 py-0.5 rounded-full text-[10px]">
                {openTasksUnscheduled.length}
              </span>
            </h4>
            <p className="text-[10px] text-zinc-400 mb-4 italic leading-relaxed">
              Arraste os itens abaixo para um bloco de horário na linha do tempo para agendá-los.
            </p>
            
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {openTasksUnscheduled.map(item => (
                <div 
                  key={item.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', item.id)}
                  className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-grab hover:border-bujo-highlight transition-colors flex items-center gap-3 group"
                >
                  <span className="text-bujo-highlight font-bold opacity-30 group-hover:opacity-100 transition-opacity">⠿</span>
                  <span className="text-xs text-bujo-text leading-tight">{item.content}</span>
                </div>
              ))}
              
              {openTasksUnscheduled.length === 0 && (
                <div className="py-12 text-center text-zinc-500 text-[10px] italic">
                  Todas as tarefas de hoje já foram agendadas!
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
