import { Edit, X, Plus } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';

export const FutureLogTab = () => {
  const {
    items,
    months,
    selectedMonth,
    setSelectedMonth,
    editingItemId,
    editingItemContent,
    setEditingItemContent,
    handleSaveEditItemForm,
    setEditingItemId,
    handleStartEditItem,
    handleDeleteItem,
    handleAddFutureEvent,
    futureLogEventContent,
    setFutureLogEventContent
  } = useBujo();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-zinc-200/50 dark:border-white/10 pb-4">
        <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest">METAS E PLANOS</span>
        <h3 className="text-3xl font-light">
          Future Log — <span className="italic font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Visão Anual</span>
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {months.map((month, index) => {
          const isSelected = selectedMonth === index;
          const monthEvents = items.filter(item => {
            if (item.type !== 'event') return false;
            if (!item.date) return false;
            const dateMonth = new Date(item.date + 'T00:00:00').getMonth();
            return dateMonth === index;
          });

          return (
            <div
              key={month}
              onClick={() => setSelectedMonth(index)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2 ${
                isSelected 
                  ? 'bg-bujo-highlight/15 border-bujo-highlight text-bujo-text shadow-md' 
                  : 'bg-zinc-200/10 dark:bg-white/5 border-zinc-200/20 dark:border-white/5 hover:border-zinc-300'
              }`}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider">{month}</h4>
              <span className="text-[10px] text-zinc-400 font-mono">{monthEvents.length} eventos agendados</span>
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-3xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 flex flex-col md:flex-row gap-6">
        
        <div className="flex-1 space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200/40 dark:border-white/5 pb-2">
            Eventos de {months[selectedMonth]}
          </h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {items.filter(item => {
              if (item.type !== 'event') return false;
              if (!item.date) return false;
              const dateMonth = new Date(item.date + 'T00:00:00').getMonth();
              return dateMonth === selectedMonth;
            }).map(ev => (
              <div 
                key={ev.id} 
                className="p-3 rounded-xl bg-zinc-200/30 dark:bg-white/5 border border-zinc-300/40 dark:border-white/10 text-xs flex justify-between items-center"
              >
                {editingItemId === ev.id ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={editingItemContent}
                      onChange={(e) => setEditingItemContent(e.target.value)}
                      className="flex-1 bg-zinc-200/50 dark:bg-white/10 border border-bujo-highlight text-xs text-bujo-text px-2 py-1 rounded-lg outline-none font-medium"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEditItemForm(ev.id);
                        if (e.key === 'Escape') setEditingItemId(null);
                      }}
                    />
                    <button
                      onClick={() => handleSaveEditItemForm(ev.id)}
                      className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingItemId(null)}
                      className="px-2 py-1 bg-zinc-350 dark:bg-white/10 text-bujo-text rounded-lg text-[10px] font-bold hover:bg-zinc-400 dark:hover:bg-white/20 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-bujo-highlight">O</span>
                      <span>{ev.content}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartEditItem(ev.id, ev.content)}
                        className="text-zinc-500 hover:text-bujo-highlight p-0.5"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(ev.id)}
                        className="text-zinc-500 hover:text-red-400 p-0.5"
                        title="Excluir"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {items.filter(item => {
              if (item.type !== 'event') return false;
              if (!item.date) return false;
              const dateMonth = new Date(item.date + 'T00:00:00').getMonth();
              return dateMonth === selectedMonth;
            }).length === 0 && (
              <p className="text-xs text-zinc-500 italic py-2">Sem eventos agendados para este mês.</p>
            )}
          </div>
        </div>

        <div className="w-full md:w-80 space-y-3 no-print">
          <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Agendar Novo Evento</h4>
          <form onSubmit={handleAddFutureEvent} className="space-y-3">
            <input
              type="text"
              required
              value={futureLogEventContent}
              onChange={(e) => setFutureLogEventContent(e.target.value)}
              placeholder="Reunião importante, consulta..."
              className="w-full bg-zinc-200/30 dark:bg-white/5 border border-zinc-300/40 dark:border-white/10 rounded-xl p-3 text-xs text-bujo-text placeholder:text-zinc-650 outline-none focus:border-bujo-highlight/40"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-bujo-highlight text-white hover:opacity-95 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> Agendar
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
