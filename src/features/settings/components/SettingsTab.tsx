import { ChevronRight, Sparkles, LogOut, Database, User } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';
import { useAuth } from '../../../context/AuthContext';

export const SettingsTab = () => {
  const {
    settings,
    setSettings,
    setShowTutorial,
    aiEngine,
    setAiEngine,
    localLLMState,
    localLLMProgress,
    localLLMError,
    initLocalLLMWorker,
    askConfirmation,
    showToast
  } = useBujo();

  const { user, signOut, clearConfig } = useAuth();

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
                className={`p-2.5 rounded-xl border text-xs font-semibold ${
                  settings.font === 'mono' ? 'bg-bujo-highlight text-white border-bujo-highlight' : 'bg-zinc-200/30 dark:bg-white/5 border-zinc-200/40 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                }`}
              >
                Monoespaçada
              </button>
            </div>
            <p className="text-[10px] text-zinc-550 leading-relaxed pl-0.5">
              Fontes personalizadas auxiliam na diminuição do cansaço visual e aumentam a velocidade de leitura para mentes neurodivergentes.
            </p>
          </div>

          {/* Color palette selector */}
          <div className="space-y-3.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Esquema de Cores de Hiperfoco</label>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Ocre & Verde Sálvia */}
              <button
                onClick={() => setSettings(prev => ({ ...prev, highlightColor: '#E08E45', accentColor: '#4A7C6C' }))}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between items-start gap-3 transition-all ${
                  settings.highlightColor === '#E08E45' 
                    ? 'border-bujo-highlight/85 bg-bujo-highlight/10 shadow-sm' 
                    : 'bg-zinc-200/30 dark:bg-white/5 border-zinc-200/40 dark:border-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: '#E08E45' }}></span>
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: '#4A7C6C' }}></span>
                </div>
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-bujo-text block">Terracota & Sálvia</span>
                  <span className="text-[9px] text-zinc-550 block">Paleta Aconchegante</span>
                </div>
              </button>

              {/* Classic Dark */}
              <button
                onClick={() => setSettings(prev => ({ ...prev, highlightColor: '#E11D48', accentColor: '#2563EB' }))}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between items-start gap-3 transition-all ${
                  settings.highlightColor === '#E11D48' 
                    ? 'border-bujo-highlight/85 bg-bujo-highlight/10 shadow-sm' 
                    : 'bg-zinc-200/30 dark:bg-white/5 border-zinc-200/40 dark:border-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: '#E11D48' }}></span>
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: '#2563EB' }}></span>
                </div>
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-bujo-text block">Neon Dark</span>
                  <span className="text-[9px] text-zinc-550 block">Foco de Alta Energia</span>
                </div>
              </button>

              {/* Minimalist Silver */}
              <button
                onClick={() => setSettings(prev => ({ ...prev, highlightColor: '#A1A1AA', accentColor: '#71717A' }))}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between items-start gap-3 transition-all ${
                  settings.highlightColor === '#A1A1AA' 
                    ? 'border-bujo-highlight/85 bg-bujo-highlight/10 shadow-sm' 
                    : 'bg-zinc-200/30 dark:bg-white/5 border-zinc-200/40 dark:border-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: '#A1A1AA' }}></span>
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: '#71717A' }}></span>
                </div>
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-bujo-text block">Monocromático</span>
                  <span className="text-[9px] text-zinc-550 block">Baixa Estimulação Visual</span>
                </div>
              </button>

              {/* Lavender Fields */}
              <button
                onClick={() => setSettings(prev => ({ ...prev, highlightColor: '#8B5CF6', accentColor: '#EC4899' }))}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between items-start gap-3 transition-all ${
                  settings.highlightColor === '#8B5CF6' 
                    ? 'border-bujo-highlight/85 bg-bujo-highlight/10 shadow-sm' 
                    : 'bg-zinc-200/30 dark:bg-white/5 border-zinc-200/40 dark:border-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: '#8B5CF6' }}></span>
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: '#EC4899' }}></span>
                </div>
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-bujo-text block">Lavanda & Rosa</span>
                  <span className="text-[9px] text-zinc-550 block">Calmante Antiestresse</span>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-200/30 dark:border-white/5 flex flex-col sm:flex-row gap-3 justify-between">
            <button
              onClick={() => {
                askConfirmation({
                  title: 'Apagar Banco de Dados Local?',
                  message: 'Deseja realmente apagar todos os seus registros do Bullet Journal local? Todos os dados salvos neste navegador serão limpos permanentemente. Esta ação NÃO pode ser desfeita.',
                  confirmText: 'Apagar Tudo',
                  cancelText: 'Cancelar',
                  isDanger: true,
                  onConfirm: () => {
                    localStorage.clear();
                    window.location.reload();
                  }
                });
              }}
              className="px-4 py-2 text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all cursor-pointer border border-red-500/25"
            >
              Apagar Banco de Dados Local
            </button>

            <button
              onClick={() => setShowTutorial(true)}
              className="px-4 py-2 text-xs font-bold bg-zinc-200/40 dark:bg-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/20 text-bujo-text rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Ver Tutorial de Onboarding
            </button>
          </div>
        </div>

        {/* AI & Worker Management Hub */}
        <div id="local-llm-activation-center" className="p-6 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-bujo-highlight uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Configuração do Motor de Inteligência Artificial
            </span>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              O BuJo Focus funciona de forma 100% offline e privada. Você pode rodar a IA localmente no browser usando modelos Transformers leves.
            </p>
          </div>

          {/* Engine Selector Toggle */}
          <div className="bg-zinc-200/40 dark:bg-white/5 p-1 rounded-2xl border border-zinc-300/40 dark:border-white/10 flex">
            <button
              onClick={() => {
                if (aiEngine === 'local_llm') {
                  askConfirmation({
                    title: 'Desativar IA Avançada?',
                    message: 'Tem certeza que deseja mudar para o motor simples de regras? O modelo de linguagem local será desativado e você perderá a habilidade de quebrar tarefas de forma inteligente.',
                    confirmText: 'Usar Motor Simples',
                    cancelText: 'Manter IA Avançada',
                    isDanger: false,
                    onConfirm: () => setAiEngine('local')
                  });
                } else {
                  setAiEngine('local');
                }
              }}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                aiEngine === 'local' 
                  ? 'bg-bujo-highlight text-white shadow-md' 
                  : 'text-zinc-500 hover:text-bujo-text'
              }`}
            >
              Motor Simples (Regras / Rápido)
            </button>
            <button
              onClick={() => setAiEngine('local_llm')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                aiEngine === 'local_llm' 
                  ? 'bg-bujo-highlight text-white shadow-md' 
                  : 'text-zinc-500 hover:text-bujo-text'
              }`}
            >
              IA Avançada (LLM no Browser)
            </button>
          </div>

          {/* Local LLM Management Details */}
          {aiEngine === 'local_llm' && (
            <div className="p-5 rounded-2xl bg-zinc-200/30 dark:bg-white/[0.02] border border-zinc-350 dark:border-white/5 space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-zinc-450 uppercase tracking-widest">Status da IA Local</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  localLLMState === 'ready' 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25' 
                    : localLLMState === 'loading'
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25 animate-pulse'
                    : 'bg-zinc-500/10 text-zinc-550 border border-zinc-500/25'
                }`}>
                  {localLLMState === 'ready' ? 'Carregado' : localLLMState === 'loading' ? 'Baixando/Inicializando' : 'Inativo'}
                </span>
              </div>

              {localLLMState === 'idle' && (
                <div className="space-y-3">
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    O modelo de IA (Qwen 1.5B Chat quantizado, ~350MB) será baixado diretamente no cache do browser. O download acontece apenas uma vez e roda localmente, sem enviar dados para servidores externos.
                  </p>
                  <button
                    onClick={initLocalLLMWorker}
                    className="w-full py-2.5 bg-bujo-highlight hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Ativar IA Avançada Local (350MB) <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {localLLMState === 'loading' && (
                <div className="space-y-3.5">
                  <p className="text-[10px] text-zinc-400">
                    Fazendo download e cacheando os arquivos do modelo. Por favor, aguarde e não feche a aba...
                  </p>
                  
                  {/* Progress bar container */}
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {Object.entries(localLLMProgress).map(([file, progress]) => (
                      <div key={file} className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                          <span className="truncate w-36">{file.split('/').pop()}</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-bujo-highlight h-full rounded-full transition-all duration-150" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {localLLMState === 'ready' && (
                <div className="space-y-2 text-[10px] text-zinc-400 leading-relaxed">
                  <p>✓ Modelo carregado com sucesso no Web Worker da sua CPU/GPU local!</p>
                  <p>💡 Você já pode clicar em <strong>"💡 Decompor Tarefa"</strong> no Daily Log ou em itens de Coleções para dividi-los em micro-passos cognitivos de forma instantânea e offline.</p>
                </div>
              )}

              {localLLMState === 'error' && (
                <div className="space-y-2">
                  <p className="text-[10px] text-red-400 leading-relaxed font-mono">
                    Erro no download ou alocação: {localLLMError}
                  </p>
                  <button
                    onClick={initLocalLLMWorker}
                    className="w-full py-2 bg-zinc-200/50 hover:bg-zinc-200/75 dark:bg-white/10 dark:hover:bg-white/15 text-bujo-text text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Supabase sync card */}
      <div className="p-6 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 space-y-4">
        <span className="text-xs font-bold text-bujo-highlight uppercase tracking-wider flex items-center gap-1.5">
          <Database className="w-4 h-4" />
          Sincronização & Segurança da Conta
        </span>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-200/30 dark:bg-white/[0.02] border border-zinc-350 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-bujo-accent/10 border border-bujo-accent/20 text-bujo-accent">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Usuário Logado</span>
              <span className="text-sm font-semibold text-bujo-text font-sans">{user?.email}</span>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => {
                askConfirmation({
                  title: 'Desconectar Banco de Dados?',
                  message: 'Deseja realmente desconectar este projeto do Supabase? Suas credenciais salvas localmente serão limpas do navegador.',
                  confirmText: 'Desconectar DB',
                  cancelText: 'Cancelar',
                  isDanger: true,
                  onConfirm: () => {
                    clearConfig();
                    window.location.reload();
                  }
                });
              }}
              className="px-4 py-2 text-xs font-bold bg-zinc-200/40 dark:bg-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/20 text-bujo-text rounded-xl transition-all cursor-pointer border border-zinc-200/30 dark:border-white/10 flex-1 sm:flex-initial"
            >
              Desconectar DB
            </button>
            <button
              onClick={() => {
                askConfirmation({
                  title: 'Sair da Conta?',
                  message: 'Tem certeza de que deseja desconectar e sair do aplicativo? Você precisará realizar o login novamente para sincronizar seus dados.',
                  confirmText: 'Sair da Conta',
                  cancelText: 'Cancelar',
                  isDanger: true,
                  onConfirm: async () => {
                    const { error } = await signOut();
                    if (error) {
                      showToast(`Erro ao deslogar: ${error.message}`);
                    } else {
                      window.location.reload();
                    }
                  }
                });
              }}
              className="px-4 py-2 text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all cursor-pointer border border-red-500/25 flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair da Conta
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
