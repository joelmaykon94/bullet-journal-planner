import { useState, useEffect } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';
import { Collection } from '../../types';
import { BUJO_ICONS } from '../../utils/constants';

interface RapidLogModalProps {
  showRapidLog: boolean;
  setShowRapidLog: (show: boolean) => void;
  rapidType: 'task' | 'event' | 'note';
  setRapidType: (type: 'task' | 'event' | 'note') => void;
  rapidInput: string;
  setRapidInput: (input: string) => void;
  handleRapidInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRapidInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  showAutocompleteRapid: boolean;
  filteredCollections: Collection[];
  autocompleteIndexRapid: number;
  selectCollectionAutocompleteRapid: (name: string) => void;
  handleSaveRapidLog: (e: React.FormEvent) => void;

  rapidIcon: string;
  setRapidIcon: (icon: string) => void;
  rapidDate: string;
  setRapidDate: (date: string) => void;
  rapidTime: string;
  setRapidTime: (time: string) => void;
}

export const RapidLogModal = ({
  showRapidLog,
  setShowRapidLog,
  rapidType,
  setRapidType,
  rapidInput,
  setRapidInput,
  handleRapidInputChange,
  handleRapidInputKeyDown,
  showAutocompleteRapid,
  filteredCollections,
  autocompleteIndexRapid,
  selectCollectionAutocompleteRapid,
  handleSaveRapidLog,

  rapidIcon,
  setRapidIcon,
  rapidDate,
  setRapidDate,
  rapidTime,
  setRapidTime
}: RapidLogModalProps) => {
  const [showIconDropdown, setShowIconDropdown] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showRapidLog) {
        setShowRapidLog(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showRapidLog, setShowRapidLog]);

  if (!showRapidLog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in no-print">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl flex flex-col text-bujo-text">

        <button
          onClick={() => setShowRapidLog(false)}
          className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Fechar modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-bujo-highlight" />
          <h3 className="text-xl font-bold tracking-tight">Captura Rápida</h3>
        </div>
        <p className="text-xs text-zinc-500 mb-6">Salve pensamentos instantâneos antes que eles fujam.</p>

        <form onSubmit={handleSaveRapidLog} className="space-y-5">
          <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-2xl border border-zinc-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setRapidType('task')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${rapidType === 'task' ? 'bg-white dark:bg-zinc-800 shadow-md text-bujo-highlight' : 'text-zinc-500'}`}
            >
              • Tarefa
            </button>
            <button
              type="button"
              onClick={() => setRapidType('event')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${rapidType === 'event' ? 'bg-white dark:bg-zinc-800 shadow-md text-bujo-accent' : 'text-zinc-500'}`}
            >
              O Evento
            </button>
            <button
              type="button"
              onClick={() => setRapidType('note')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${rapidType === 'note' ? 'bg-white dark:bg-zinc-800 shadow-md text-zinc-400' : 'text-zinc-500'}`}
            >
              - Nota
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              required
              autoFocus
              value={rapidInput}
              onChange={handleRapidInputChange}
              onKeyDown={handleRapidInputKeyDown}
              placeholder={rapidType === 'task' ? "O que precisa ser feito?" : rapidType === 'event' ? "Qual o compromisso?" : "O que está pensando?"}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-bujo-highlight/30 rounded-2xl p-4 text-sm outline-none transition-all"
            />
            {showAutocompleteRapid && filteredCollections.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                {filteredCollections.map((col, idx) => (
                  <div
                    key={col.id}
                    onClick={() => selectCollectionAutocompleteRapid(col.name)}
                    className={`px-4 py-2 text-sm cursor-pointer transition-colors flex items-center gap-2 ${idx === autocompleteIndexRapid ? 'bg-bujo-highlight/10 text-bujo-highlight font-bold' : 'text-bujo-text hover:bg-zinc-100 dark:hover:bg-white/5'}`}
                  >
                    <span className="text-base">{col.icon}</span>
                    <span>{col.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metadata Grid (Icon, Date, Time) */}
          <div className="grid grid-cols-3 gap-3 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-150 dark:border-white/5 p-3 rounded-2xl relative">
            {/* Icon Picker Dropdown */}
            <div className="flex flex-col gap-1 relative">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Ícone</label>
              <button
                type="button"
                onClick={() => setShowIconDropdown(!showIconDropdown)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-sm hover:border-bujo-highlight transition-all cursor-pointer select-none"
              >
                <span>{rapidIcon || (rapidType === 'task' ? '🎯' : '🎨')}</span>
                <span className="text-[9px] text-zinc-400">▼</span>
              </button>
              {showIconDropdown && (
                <div className="absolute left-0 bottom-full mb-2 p-2 bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl shadow-2xl z-50 w-52 animate-scale-in">
                  <input
                    type="text"
                    placeholder="Pesquisar..."
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    className="w-full px-2 py-1 mb-2 text-xs rounded bg-zinc-150 dark:bg-zinc-950 border border-zinc-250 dark:border-white/10 text-bujo-text outline-none"
                  />
                  <div className="grid grid-cols-5 gap-1 max-h-32 overflow-y-auto">
                    {BUJO_ICONS.filter(icon => 
                      icon.name.toLowerCase().includes(iconSearch.toLowerCase()) || 
                      icon.tooltip.toLowerCase().includes(iconSearch.toLowerCase())
                    ).map(icon => (
                      <button
                        key={icon.emoji}
                        type="button"
                        onClick={() => {
                          setRapidIcon(icon.emoji);
                          setShowIconDropdown(false);
                          setIconSearch('');
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-150 dark:hover:bg-white/5 transition-all text-sm"
                      >
                        {icon.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Date Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Data</label>
              <input
                type="date"
                value={rapidDate}
                onChange={(e) => setRapidDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-xs text-bujo-text focus:outline-none focus:border-bujo-highlight cursor-pointer"
              />
            </div>

            {/* Time Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Hora</label>
              <input
                type="time"
                value={rapidTime}
                onChange={(e) => setRapidTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-xs text-bujo-text focus:outline-none focus:border-bujo-highlight cursor-pointer"
              />
            </div>
          </div>



          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowRapidLog(false)}
              className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-[2] py-3.5 bg-bujo-highlight text-white rounded-2xl text-sm font-bold hover:opacity-90 shadow-lg shadow-bujo-highlight/20 transition-all"
            >
              Salvar Entrada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const FloatingActionButton = ({
  focoActive,
  onClick
}: {
  focoActive: boolean;
  onClick: () => void;
}) => {
  if (focoActive) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 p-4 bg-bujo-highlight text-white hover:scale-105 active:scale-95 transition-all rounded-full shadow-2xl flex items-center justify-center cursor-pointer no-print animate-bounce"
      aria-label="Captura Rápida"
    >
      <Plus className="w-6 h-6 stroke-[3]" />
    </button>
  );
};
