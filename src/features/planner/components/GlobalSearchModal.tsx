import { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, CheckSquare, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';
import { BujoItem } from '../../../types';

export const GlobalSearchModal = () => {
  const {
    items,
    showGlobalSearch,
    setShowGlobalSearch,
    setSelectedDate,
    setActiveTab,
    setStandardDate
  } = useBujo();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BujoItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearch(prev => !prev);
      }
      if (e.key === 'Escape' && showGlobalSearch) {
        setShowGlobalSearch(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGlobalSearch, setShowGlobalSearch]);

  // Focus input when modal opens
  useEffect(() => {
    if (showGlobalSearch) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
    }
  }, [showGlobalSearch]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const filtered = items.filter(item => {
      const contentMatch = item.content.toLowerCase().includes(q);
      const tagMatch = item.content.includes('#') && item.content.toLowerCase().includes(q);
      const subtaskMatch = item.subtasks?.some(s => s.content.toLowerCase().includes(q));
      return contentMatch || tagMatch || subtaskMatch;
    }).sort((a, b) => b.date.localeCompare(a.date));

    setResults(filtered.slice(0, 50)); // Limit results for performance
  }, [query, items]);

  if (!showGlobalSearch) return null;

  const handleJumpToDate = (date: string) => {
    setSelectedDate(date);
    setStandardDate(date);
    setActiveTab('daily_log');
    setShowGlobalSearch(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm animate-fade-in no-print"
      onClick={() => setShowGlobalSearch(false)}
    >
      <div 
        className="relative max-w-2xl w-full bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[60vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-zinc-900/50">
          <Search className="w-5 h-5 text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Pesquisar em todo o BuJo... (tarefas, #tags, sub-tarefas)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-base text-white placeholder-zinc-550 font-sans"
          />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 hidden sm:block">ESC</span>
            <button 
              onClick={() => setShowGlobalSearch(false)}
              className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto pr-1">
          {query.trim() === '' ? (
            <div className="p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-4 text-zinc-500">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm text-zinc-400 font-medium">Busque por qualquer registro passado ou futuro</p>
              <p className="text-[11px] text-zinc-600 max-w-xs mx-auto">Tente buscar por uma palavra-chave, uma #tag de contexto ou o conteúdo de uma sub-tarefa.</p>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleJumpToDate(item.date)}
                  className="w-full px-5 py-3 hover:bg-white/[0.03] flex items-start gap-4 transition-all text-left group"
                >
                  <div className={`mt-1 p-2 rounded-xl shrink-0 ${
                    item.type === 'task' ? 'bg-bujo-highlight/10 text-bujo-highlight' : 
                    item.type === 'event' ? 'bg-bujo-accent/10 text-bujo-accent' : 'bg-zinc-500/10 text-zinc-400'
                  }`}>
                    {item.type === 'task' ? <CheckSquare className="w-4 h-4" /> : 
                     item.type === 'event' ? <Calendar className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.date)}
                        {item.time && <span>• {item.time}</span>}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-bujo-highlight group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className={`text-sm font-medium truncate ${item.status === 'completed' ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                      {item.content}
                    </p>
                    {item.subtasks && item.subtasks.some(s => s.content.toLowerCase().includes(query.toLowerCase())) && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <div className="w-px h-3 bg-zinc-800 ml-2" />
                        <span className="text-[10px] text-zinc-600 italic truncate">
                          ↳ Sub-tarefa: {item.subtasks.find(s => s.content.toLowerCase().includes(query.toLowerCase()))?.content}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
              <div className="px-5 py-4 border-t border-white/5 mt-2 bg-zinc-955/50 flex justify-between items-center">
                <span className="text-[10px] text-zinc-500">{results.length} resultados encontrados</span>
                <span className="text-[10px] text-zinc-600 font-mono italic">Pressione ENTER para ir ao topo</span>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center">
              <p className="text-sm text-zinc-500">Nenhum resultado para "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
