import { useState, useEffect } from 'react';
import { Sparkles, Check, Trash2, Plus, HelpCircle } from 'lucide-react';

interface AISuggestionsModalProps {
  taskContent: string;
  customSteps: {
    high: { text: string; enabled: boolean }[];
    low: { text: string; enabled: boolean }[];
    unlock: { text: string; enabled: boolean }[];
  } | null;
  handleToggleCustomStep: (type: 'high' | 'low' | 'unlock', idx: number) => void;
  handleEditCustomStep: (type: 'high' | 'low' | 'unlock', idx: number, text: string) => void;
  handleRemoveCustomStep: (type: 'high' | 'low' | 'unlock', idx: number) => void;
  handleAddCustomStep: (type: 'high' | 'low' | 'unlock') => void;
  handleApplyAISuggestion: (steps: string[]) => void;
  setAiSuggestions: (val: any) => void;
  setCustomSteps: (val: any) => void;
  onUpdateTaskContent: (newContent: string) => void;
  handleOptimizeDescription: () => void;
  isOptimizing: boolean;
  handleRegenerateSuggestions: (refinementText: string, updatedTaskContent: string, stylePreset: string) => void;
  isGenerating: boolean;
}

export const AISuggestionsModal = ({
  taskContent,
  customSteps,
  handleToggleCustomStep,
  handleEditCustomStep,
  handleRemoveCustomStep,
  handleAddCustomStep,
  handleApplyAISuggestion,
  setAiSuggestions,
  setCustomSteps,
  onUpdateTaskContent,
  handleOptimizeDescription,
  isOptimizing,
  handleRegenerateSuggestions,
  isGenerating
}: AISuggestionsModalProps) => {
  const [editedTask, setEditedTask] = useState(taskContent);
  const [refinementText, setRefinementText] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [showGuidelines, setShowGuidelines] = useState(true);

  // Sync editedTask state when prop updates (e.g. when optimized by AI)
  useEffect(() => {
    setEditedTask(taskContent);
  }, [taskContent]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && customSteps) {
        setAiSuggestions(null);
        setCustomSteps(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [customSteps, setAiSuggestions, setCustomSteps]);

  if (!customSteps) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in no-print">
      <div className="relative w-full max-w-5xl rounded-[45px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-3xl flex flex-col text-bujo-text max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-bujo-highlight animate-pulse" />
            <h3 className="text-xl md:text-2xl font-bold tracking-tight">Otimizador de Tarefas IA</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowGuidelines(!showGuidelines)}
            className="text-xs font-semibold text-zinc-500 hover:text-bujo-highlight flex items-center gap-1 cursor-pointer transition-colors bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showGuidelines ? 'Ocultar Guia' : 'Mostrar Guia de Escrita'}
          </button>
        </div>

        {/* Guidelines Panel */}
        {showGuidelines && (
          <div className="mb-6 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-4 text-xs animate-fade-in">
            <h4 className="font-bold text-bujo-highlight flex items-center gap-1.5 mb-1.5">
              💡 Dica de Sucesso: Como ajudar o modelo a gerar micro-tarefas excelentes?
            </h4>
            <p className="text-zinc-500 dark:text-zinc-400 mb-3">
              A IA divide melhor as tarefas quando você escreve uma descrição específica. Siga estes padrões simples:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-white/5">
                <span className="font-semibold text-bujo-text block mb-1">1. Comece com Verbo de Ação</span>
                <span className="text-[11px] text-zinc-400 block mb-2">Evita ambiguidade e direciona o cérebro.</span>
                <div className="mt-1 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded-lg">
                  <span className="text-red-500 block">❌ Estudo de Inglês</span>
                  <span className="text-emerald-500 block">✔ Ler artigo em inglês e traduzir 3 palavras</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-white/5">
                <span className="font-semibold text-bujo-text block mb-1">2. Especifique um Limite Finito</span>
                <span className="text-[11px] text-zinc-400 block mb-2">Combate a paralisia por sobrecarga de esforço.</span>
                <div className="mt-1 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded-lg">
                  <span className="text-red-500 block">❌ Arrumar a casa inteira</span>
                  <span className="text-emerald-500 block">✔ Guardar roupas espalhadas no quarto</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-white/5">
                <span className="font-semibold text-bujo-text block mb-1">3. Reduza a Menores Partes</span>
                <span className="text-[11px] text-zinc-400 block mb-2">Nunca insira projetos inteiros em um único Bullet.</span>
                <div className="mt-1 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded-lg">
                  <span className="text-red-500 block">❌ Entregar Relatório Financeiro</span>
                  <span className="text-emerald-500 block">✔ Abrir planilha e atualizar despesas do dia</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Interactive Optimization Section */}
        <div className="mb-6 p-5 rounded-3xl bg-zinc-200/40 dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 flex flex-col gap-4">
          
          {/* Editable Task Field with AI Optimize Option */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">
                Tarefa Original (Otimize a descrição para melhorar a IA)
              </label>
              <button
                type="button"
                onClick={handleOptimizeDescription}
                disabled={isOptimizing || isGenerating}
                className="px-3 py-1 text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-bujo-text hover:bg-bujo-highlight hover:text-white rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>🤖</span> {isOptimizing ? 'Otimizando...' : 'Melhorar Descrição com IA'}
              </button>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={editedTask}
                onChange={(e) => setEditedTask(e.target.value)}
                placeholder="Ex: Ler livro, Lavar a louça..."
                className="flex-1 bg-zinc-150 dark:bg-zinc-950 border border-zinc-250 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-bujo-text outline-none focus:border-bujo-highlight/40"
                disabled={isOptimizing || isGenerating}
              />
              <button
                type="button"
                onClick={() => {
                  onUpdateTaskContent(editedTask);
                }}
                disabled={isOptimizing || isGenerating || !editedTask.trim() || editedTask.trim() === taskContent}
                className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white text-xs font-bold rounded-xl transition-all disabled:opacity-35 cursor-pointer shrink-0"
                title="Atualizar permanentemente a tarefa no seu log diário"
              >
                Salvar Nome
              </button>
            </div>
          </div>

          {/* Presets and Custom Instruction Panel */}
          <div className="border-t border-zinc-200/35 dark:border-white/5 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1.5">
                  Estilo das Micro-tarefas (Presets de IA)
                </label>
                <select
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(e.target.value)}
                  className="w-full bg-zinc-150 dark:bg-zinc-950 border border-zinc-250 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-bujo-text outline-none focus:border-bujo-highlight/40 cursor-pointer"
                  disabled={isGenerating || isOptimizing}
                >
                  <option value="default">✨ Padrão (Passos curtos e claros)</option>
                  <option value="baby_steps">👶 Passos de Bebê (Mínimo esforço cognitivo)</option>
                  <option value="pomodoro">⏱ Método Pomodoro (Organizado por blocos de tempo)</option>
                  <option value="preparation">🧹 Organização prévia (Preparar ambiente e distrações)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1.5">
                  💡 Refinamento de Instruções para a IA
                </label>
                <input
                  type="text"
                  value={refinementText}
                  onChange={(e) => setRefinementText(e.target.value)}
                  placeholder="Ex: estou sem foco, adicione pausas, focar no preparo inicial..."
                  className="w-full bg-zinc-150 dark:bg-zinc-950 border border-zinc-250 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-bujo-text outline-none focus:border-bujo-highlight/40"
                  disabled={isGenerating || isOptimizing}
                />
              </div>
            </div>

            {/* Regeneration Action Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleRegenerateSuggestions(refinementText, editedTask, selectedPreset)}
                disabled={isGenerating || isOptimizing || !editedTask.trim()}
                className="w-full md:w-auto px-6 py-2.5 bg-bujo-highlight hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-55 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-bujo-highlight/15"
              >
                {isGenerating ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    Gerando outra lista de micro tarefas...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    Gerar Outra Lista de Micro-tarefas
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Intensity columns based on mental energy */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 max-w-3xl">
          Nossa inteligência artificial gerou diferentes formas de abordar a sua tarefa. Escolha a intensidade que melhor se adequa ao seu estado de <strong>energia mental</strong> de hoje.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[300px]">
          {/* HIGH ENERGY CARD */}
          <div className="flex flex-col rounded-3xl border border-amber-500/20 dark:border-amber-500/10 bg-amber-500/[0.01] dark:bg-amber-500/[0.03] p-5 transition-all hover:border-amber-500/35">
            <div className="flex items-center justify-between mb-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span>🔥</span> Alta Energia
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase">Hiperfoco</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-4">
              Passos detalhados para quem quer aprofundar e realizar a tarefa com perfeição.
            </p>

            <div className="space-y-2.5 flex-1 mb-4">
              {customSteps.high.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 group">
                  <button
                    type="button"
                    onClick={() => handleToggleCustomStep('high', idx)}
                    className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      step.enabled ? 'bg-amber-500 border-amber-500 text-white' : 'border-zinc-300 dark:border-white/20'
                    }`}
                  >
                    {step.enabled && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                  </button>
                  <input
                    type="text"
                    value={step.text}
                    onChange={(e) => handleEditCustomStep('high', idx, e.target.value)}
                    placeholder="Novo passo..."
                    className={`flex-1 min-w-0 bg-transparent text-xs outline-none border-b border-transparent focus:border-amber-500/50 py-0.5 transition-colors ${
                      step.enabled ? 'text-zinc-700 dark:text-zinc-200' : 'line-through text-zinc-400 dark:text-zinc-500 opacity-55'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomStep('high', idx)}
                    className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                    title="Remover passo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddCustomStep('high')}
                className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 mt-2"
              >
                <Plus className="w-3 h-3" /> Adicionar passo
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleApplyAISuggestion(customSteps.high.filter(s => s.enabled).map(s => s.text))}
              className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md shadow-amber-500/10 transition-all active:scale-95 cursor-pointer"
            >
              Aplicar Versão Alta Energia
            </button>
          </div>

          {/* LOW ENERGY CARD */}
          <div className="flex flex-col rounded-3xl border border-emerald-500/20 dark:border-emerald-500/10 bg-emerald-500/[0.01] dark:bg-emerald-500/[0.03] p-5 transition-all hover:border-emerald-500/35">
            <div className="flex items-center justify-between mb-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>🍃</span> Baixa Energia
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase">Modo Econômico</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-4">
              Passos curtos e essenciais. Ideal para dias cansativos, evitando ansiedade e estresse.
            </p>

            <div className="space-y-2.5 flex-1 mb-4">
              {customSteps.low.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 group">
                  <button
                    type="button"
                    onClick={() => handleToggleCustomStep('low', idx)}
                    className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      step.enabled ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300 dark:border-white/20'
                    }`}
                  >
                    {step.enabled && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                  </button>
                  <input
                    type="text"
                    value={step.text}
                    onChange={(e) => handleEditCustomStep('low', idx, e.target.value)}
                    placeholder="Novo passo..."
                    className={`flex-1 min-w-0 bg-transparent text-xs outline-none border-b border-transparent focus:border-emerald-500/50 py-0.5 transition-colors ${
                      step.enabled ? 'text-zinc-700 dark:text-zinc-200' : 'line-through text-zinc-400 dark:text-zinc-500 opacity-55'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomStep('low', idx)}
                    className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                    title="Remover passo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddCustomStep('low')}
                className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-2"
              >
                <Plus className="w-3 h-3" /> Adicionar passo
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleApplyAISuggestion(customSteps.low.filter(s => s.enabled).map(s => s.text))}
              className="w-full py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/10 transition-all active:scale-95 cursor-pointer"
            >
              Aplicar Versão Baixa Energia
            </button>
          </div>

          {/* QUICK UNLOCK CARD */}
          <div className="flex flex-col rounded-3xl border border-indigo-500/20 dark:border-indigo-500/10 bg-indigo-500/[0.01] dark:bg-indigo-500/[0.03] p-5 transition-all hover:border-indigo-500/35">
            <div className="flex items-center justify-between mb-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <span>🎯</span> Destravar Rápido
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase">2 min para Iniciar</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-4">
              Uma micro-ação extremamente simples apenas para quebrar a procrastinação.
            </p>

            <div className="space-y-2.5 flex-1 mb-4">
              {customSteps.unlock.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 group">
                  <button
                    type="button"
                    onClick={() => handleToggleCustomStep('unlock', idx)}
                    className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      step.enabled ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-zinc-300 dark:border-white/20'
                    }`}
                  >
                    {step.enabled && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                  </button>
                  <input
                    type="text"
                    value={step.text}
                    onChange={(e) => handleEditCustomStep('unlock', idx, e.target.value)}
                    placeholder="Novo passo..."
                    className={`flex-1 min-w-0 bg-transparent text-xs outline-none border-b border-transparent focus:border-indigo-500/50 py-0.5 transition-colors ${
                      step.enabled ? 'text-zinc-700 dark:text-zinc-200' : 'line-through text-zinc-400 dark:text-zinc-500 opacity-55'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomStep('unlock', idx)}
                    className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                    title="Remover passo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddCustomStep('unlock')}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-2"
              >
                <Plus className="w-3 h-3" /> Adicionar passo
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleApplyAISuggestion(customSteps.unlock.filter(s => s.enabled).map(s => s.text))}
              className="w-full py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-500/10 transition-all active:scale-95 cursor-pointer"
            >
              Aplicar Destravar Rápido
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end border-t border-zinc-200/50 dark:border-white/10 pt-4 mt-6">
          <button
            type="button"
            onClick={() => {
              setAiSuggestions(null);
              setCustomSteps(null);
            }}
            className="px-6 py-2.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar Otimizador
          </button>
        </div>

      </div>
    </div>
  );
};
