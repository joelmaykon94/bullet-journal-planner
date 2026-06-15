import { ChevronRight, Sparkles } from 'lucide-react';
import { BujoSettings } from '../../../types';

interface SettingsTabProps {
  settings: BujoSettings;
  setSettings: React.Dispatch<React.SetStateAction<BujoSettings>>;
  setShowTutorial: (show: boolean) => void;
  aiEngine: 'local_llm' | 'local';
  setAiEngine: (engine: 'local_llm' | 'local') => void;
  localLLMState: string;
  localLLMProgress: { [key: string]: number };
  localLLMError: string;
  initLocalLLMWorker: () => void;
}

export const SettingsTab = ({
  settings,
  setSettings,
  setShowTutorial,
  aiEngine,
  setAiEngine,
  localLLMState,
  localLLMProgress,
  localLLMError,
  initLocalLLMWorker
}: SettingsTabProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-zinc-200/50 dark:border-white/10 pb-4">
        <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest">CONFIGURAÇÃO PESSOAL</span>
        <h3 className="text-3xl font-light">
          Ajustes — <span className="italic font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Personalização</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="p-6 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 space-y-6">
          
          {/* Font selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Opção de Fonte Legível (TDAH / Dislexia)</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSettings(prev => ({ ...prev, font: 'sans' }))}
                className={`p-2.5 rounded-xl border text-xs font-semibold ${
                  settings.font === 'sans' ? 'bg-bujo-highlight text-white border-bujo-highlight' : 'bg-zinc-200/30 dark:bg-white/5 border-zinc-200/40 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                }`}
              >
                Sans-serif
              </button>
              <button
                onClick={() => setSettings(prev => ({ ...prev, font: 'dyslexic' }))}
                className={`p-2.5 rounded-xl border text-xs font-semibold ${
                  settings.font === 'dyslexic' ? 'bg-bujo-highlight text-white border-bujo-highlight' : 'bg-zinc-200/30 dark:bg-white/5 border-zinc-200/40 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                }`}
                style={{ fontFamily: 'Lexend' }}
              >
                Dyslexie Friendly
              </button>
              <button
                onClick={() => setSettings(prev => ({ ...prev, font: 'mono' }))}
                className={`p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                  settings.font === 'mono' ? 'bg-bujo-highlight text-white border-bujo-highlight' : 'bg-zinc-200/30 dark:bg-white/5 border-zinc-200/40 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                }`}
              >
                Monospace
              </button>
            </div>
          </div>

          {/* Color highlighting palette */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Cor de Destaque Primária (Salvo local)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: 'Burned Orange', value: '#E08E45' },
                { name: 'Warm Amber', value: '#D97706' },
                { name: 'Classic Blue', value: '#2563EB' },
                { name: 'Bright Pink', value: '#EC4899' }
              ].map(color => (
                <button
                  key={color.value}
                  onClick={() => setSettings(prev => ({ ...prev, highlightColor: color.value }))}
                  className={`p-2 rounded-xl border text-[10px] font-semibold flex flex-col items-center gap-1.5 ${
                    settings.highlightColor === color.value ? 'border-zinc-800 dark:border-white bg-zinc-200 dark:bg-white/10' : 'border-zinc-200/30 dark:border-white/5'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: color.value }} />
                  <span className="truncate text-zinc-500 w-full text-center">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accent colors */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Cor Secundária (Acento)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: 'Sage Green', value: '#4A7C6C' },
                { name: 'Ocean Teal', value: '#0D9488' },
                { name: 'Iris Purple', value: '#9333EA' },
                { name: 'Stone Gray', value: '#52525b' }
              ].map(color => (
                <button
                  key={color.value}
                  onClick={() => setSettings(prev => ({ ...prev, accentColor: color.value }))}
                  className={`p-2 rounded-xl border text-[10px] font-semibold flex flex-col items-center gap-1.5 ${
                    settings.accentColor === color.value ? 'border-zinc-800 dark:border-white bg-zinc-200 dark:bg-white/10' : 'border-zinc-200/30 dark:border-white/5'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: color.value }} />
                  <span className="truncate text-zinc-500 w-full text-center">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Clear Storage */}
          <div className="border-t border-zinc-200/40 dark:border-white/10 pt-4">
            <button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja apagar todos os dados locais? Esta ação é irreversível.')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="px-4 py-2.5 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-semibold hover:bg-red-600/20 transition-colors"
            >
              Apagar Banco de Dados Local
            </button>
          </div>

        </div>

        {/* Tutorial / Help area */}
        <div className="p-6 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Ajuda e Recursos</h4>
          <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <p>
              O <strong>BuJo Focus</strong> foi construído de acordo com os princípios neuro-cognitivos do TDAH:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Zero Distrações</strong>: Interfaces minimalistas com alternância de Modo Foco.</li>
              <li><strong>Atrito Mínimo</strong>: Salve lembretes instantâneos no botão flutuante "+".</li>
              <li><strong>Passos acionáveis</strong>: Evite a paralisia utilizando o "Quebrar com IA".</li>
              <li><strong>Feedback de Conclusão</strong>: Sinalizadores visuais para validar progresso.</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowTutorial(true)}
              className="mt-2 text-bujo-highlight font-semibold hover:underline flex items-center gap-1"
            >
              Ver Tutorial de Símbolos <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Inteligência Artificial & Otimizações */}
        <div id="local-llm-activation-center" className="p-6 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 space-y-6 text-bujo-text scroll-mt-6 md:col-span-2">
          <div className="flex items-center justify-between border-b border-zinc-200/30 dark:border-white/5 pb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              🧠 Configuração do Motor de Inteligência Artificial
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Engine Selection */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Selecione o Motor de IA</span>
              <p className="text-xs text-zinc-550 leading-normal">
                Escolha como deseja gerar sugestões cognitivas de micro-tarefas e resumos semanais/mensais:
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAiEngine('local_llm');
                    initLocalLLMWorker();
                  }}
                  className={`py-3.5 px-4 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                    aiEngine === 'local_llm'
                      ? 'bg-bujo-highlight/10 border-bujo-highlight text-zinc-100 shadow-sm'
                      : 'bg-zinc-200/30 dark:bg-white/5 border-zinc-200/40 dark:border-white/10 text-zinc-500 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    🧠 IA no Browser (Qwen 2.5)
                  </span>
                  <span className="text-[10px] opacity-85 leading-normal">
                    Executa um modelo LLM completo localmente no seu computador. Garante 100% de privacidade. Requer download inicial (~350MB).
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAiEngine('local')}
                  className={`py-3.5 px-4 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                    aiEngine === 'local'
                      ? 'bg-bujo-highlight/10 border-bujo-highlight text-zinc-100 shadow-sm'
                      : 'bg-zinc-200/30 dark:bg-white/5 border-zinc-200/40 dark:border-white/10 text-zinc-500 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    ⚡ Dicionário de Sugestões (Heurística)
                  </span>
                  <span className="text-[10px] opacity-85 leading-normal">
                    Sugestões baseadas em regras de termos comuns e dicionário local estático. Instantâneo e não consome processamento de CPU/GPU.
                  </span>
                </button>
              </div>
            </div>

            {/* Local LLM Control Panel */}
            <div className="space-y-4 p-4 rounded-2xl bg-zinc-350/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Painel do Modelo Local</span>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500">Status do Modelo:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wide ${
                    localLLMState === 'ready' ? 'bg-emerald-600/10 text-emerald-500' : localLLMState === 'loading' ? 'bg-amber-600/10 text-amber-500 animate-pulse' : 'bg-zinc-500/10 text-zinc-500'
                  }`}>
                    {localLLMState === 'ready' ? 'Pronto para uso' : localLLMState === 'loading' ? 'Carregando weights' : 'Inativo / Não Carregado'}
                  </span>
                </div>
                {localLLMError && <p className="text-red-500 text-[10px]">{localLLMError}</p>}

                {localLLMState === 'loading' && (
                  <div className="space-y-2 pt-2">
                    {Object.entries(localLLMProgress).map(([file, progress]) => (
                      <div key={file} className="space-y-1">
                        <div className="flex justify-between text-[9px] text-zinc-500">
                          <span className="truncate w-40">{file}</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                          <div className="bg-bujo-highlight h-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={initLocalLLMWorker}
                disabled={localLLMState === 'loading' || localLLMState === 'ready'}
                className="w-full py-3 bg-bujo-highlight text-white rounded-xl text-xs font-bold disabled:opacity-50 hover:opacity-95 transition-opacity mt-4 cursor-pointer"
              >
                {localLLMState === 'ready' ? 'Modelo Pronto ✓' : 'Carregar / Iniciar IA Local (Transformers.js)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
