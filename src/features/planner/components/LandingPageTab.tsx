import { useBujo } from '../../../context/BujoContext';
import { Sparkles, Brain, Volume2, Award, Zap, CheckCircle2, Heart, ListTodo, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

export const LandingPageTab = () => {
  const { setActiveTab } = useBujo();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-16 py-6 pb-20 font-mono text-zinc-300 animate-fade-in no-print">
      {/* Hero Section */}
      <div className="relative text-center space-y-6 py-12 px-6 rounded-3xl bg-zinc-200/10 dark:bg-zinc-900/20 border border-zinc-200/20 dark:border-white/5 overflow-hidden">
        {/* Animated pink aura/circles */}
        <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 opacity-10 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 opacity-10 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-pink-550/15 text-pink-500 border border-pink-500/25 uppercase tracking-widest">
          <Sparkles className="w-3 h-3" /> Gratuito & Open Source
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          BuJo Focus <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient-shift">🌸</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xs md:text-sm text-zinc-400 leading-relaxed">
          O Bullet Journal definitivo otimizado para TDAH e mentes neurodivergentes.
          Organize tarefas, reduza a sobrecarga cognitiva e ganhe foco absoluto sem se perder em interfaces barulhentas.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setActiveTab('indice')}
            className="w-full sm:w-auto px-6 py-3 bg-bujo-highlight hover:bg-bujo-highlight/95 text-white font-bold rounded-2xl text-xs transition-all shadow-lg shadow-bujo-highlight/25 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
          >
            <span>Acessar o Painel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <a
            href="https://github.com/joelmaykon/bullet-journal-planner"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 bg-zinc-200/10 dark:bg-white/5 hover:bg-zinc-200/20 dark:hover:bg-white/10 border border-zinc-200/35 dark:border-white/10 font-bold rounded-2xl text-xs text-white transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            <span>Código Aberto</span>
          </a>
        </div>
      </div>

      {/* Pain points comparison cards */}
      <div className="space-y-6">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest text-center">
          Desenhado sob medida para Desafios Neurodivergentes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-zinc-200/15 dark:bg-zinc-950/40 border border-zinc-200/20 dark:border-white/5 space-y-3">
            <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20 w-fit text-pink-500">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Paralisia por Análise</h3>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Grandes tarefas paralisam você? O BuJo Focus divide automaticamente tarefas complexas em micro-passos e permite focar apenas no que você consegue fazer agora, adaptando as demandas ao seu ritmo diário.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-200/15 dark:bg-zinc-950/40 border border-zinc-200/20 dark:border-white/5 space-y-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 w-fit text-purple-500">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Distração & Ruído</h3>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Elimine o caos mental. O player integrado de som ambiente ("Body Double") e as técnicas de respiração e alongamento ajudam você a ancorar seu cérebro no momento atual de forma natural e sem fricção.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-200/15 dark:bg-zinc-950/40 border border-zinc-200/20 dark:border-white/5 space-y-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 w-fit text-amber-500">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Perda de Interesse</h3>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Acompanhe seu avanço de forma divertida! Uma mecânica leve de gamificação com sistema de XP, conquistas e guias adaptativos mantém o entusiasmo ativo a cada tarefa concluída ou hábito registrado.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Showcases Section */}
      <div className="space-y-8">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest text-center">
          Recursos Principais
        </h2>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-8 p-6 rounded-2xl bg-zinc-200/10 dark:bg-zinc-900/30 border border-zinc-200/20 dark:border-white/5">
            <div className="flex-1 space-y-3">
              <div className="inline-flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                Gestão Ágil
              </div>
              <h3 className="text-base font-bold text-white">Daily Log Inteligente</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Adicione tarefas rapidamente especificando complexidade, esforço energético e tempo de execução. Filtre de forma visual seus itens e limpe a mente migrando pendências com apenas um clique.
              </p>
            </div>
            <div className="w-full md:w-72 bg-zinc-200/25 dark:bg-black/35 rounded-xl border border-zinc-250/20 p-4 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-zinc-250/15 pb-1">
                <span>TAREFAS DE HOJE</span>
                <span>📅 16/06</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-150 dark:bg-zinc-900 border border-emerald-500/20 text-[10px] flex items-center justify-between">
                <span className="text-zinc-300 font-medium">💻 Codificar nova landing page</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-500">25 min</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-150 dark:bg-zinc-900 border border-zinc-250/20 text-[10px] flex items-center justify-between">
                <span className="text-zinc-400">📝 Estudar estrutura do projeto</span>
                <span className="px-1.5 py-0.2 rounded bg-zinc-200/15 text-zinc-400">10 min</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center gap-8 p-6 rounded-2xl bg-zinc-200/10 dark:bg-zinc-900/30 border border-zinc-200/20 dark:border-white/5">
            <div className="flex-1 space-y-3">
              <div className="inline-flex items-center gap-1 text-[10px] text-pink-500 font-bold uppercase tracking-wider bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded">
                Terapia Ocupacional
              </div>
              <h3 className="text-base font-bold text-white">Guia de Foco & Demon Slayer</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Selecione seus mentores favoritos como Nezuko 🌸, Rengoku 🔥, Shinobu 🦋 ou Giyu 🌊. Use as respirações para relaxar com áudio ambiente e utilize o cronômetro de foco para ganhar XP e concluir suas tarefas ativas.
              </p>
            </div>
            <div className="w-full md:w-72 bg-zinc-200/25 dark:bg-black/35 rounded-xl border border-zinc-250/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-lg">
                  🔥
                </div>
                <div className="text-[10px] leading-tight">
                  <span className="font-bold text-white block">Kyojuro Rengoku</span>
                  <span className="text-zinc-500 text-[8px]">Hashira das Chamas</span>
                </div>
              </div>
              <div className="p-2.5 bg-zinc-150 dark:bg-zinc-950 rounded-lg text-[9.5px] italic text-zinc-300 leading-normal">
                "Mantenha o coração ardente! Vamos eliminar essa tarefa juntos!"
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demon Slayer Gamification Showcase */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-red-900/15 via-orange-900/10 to-transparent border border-red-500/15 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-red-500 opacity-5 blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          <h3 className="text-sm font-extrabold uppercase text-white tracking-widest">
            Sincronia das Chamas e da Água (Demon Slayer Theme)
          </h3>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Tornar a rotina menos massiva exige inspiração. O BuJo Focus vem pré-carregado com um tema imersivo inspirado no anime Demon Slayer: Kimetsu No Yaiba. Sinta a lâmina cortando a procrastinação através de efeitos sonoros baseados em respirações, personagens icônicos e um plano de fundo dinâmico de sakura e cortes de espada.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-[10px]">
          <div className="p-2.5 rounded-xl bg-pink-500/5 border border-pink-500/10">
            <span className="block text-lg mb-1">🌸</span>
            <span className="block font-bold text-pink-400">Nezuko</span>
            <span className="text-[8px] text-zinc-500">Protetora Silenciosa</span>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/10">
            <span className="block text-lg mb-1">🦋</span>
            <span className="block font-bold text-purple-400">Shinobu</span>
            <span className="text-[8px] text-zinc-500">Respiração do Inseto</span>
          </div>
          <div className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/10">
            <span className="block text-lg mb-1">🔥</span>
            <span className="block font-bold text-red-400">Rengoku</span>
            <span className="text-[8px] text-zinc-500">Coração Ardente</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <span className="block text-lg mb-1">🌊</span>
            <span className="block font-bold text-blue-400">Tomioka</span>
            <span className="text-[8px] text-zinc-500">Respiração da Água</span>
          </div>
        </div>
      </div>

      {/* FAQ / Manifesto */}
      <div className="p-6 rounded-2xl bg-zinc-200/10 dark:bg-zinc-900/20 border border-zinc-200/20 dark:border-white/5 space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-250/20 pb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Privacidade, Licença e Segurança</span>
        </h3>
        
        <div className="space-y-4 text-[11px] leading-relaxed text-zinc-400">
          <div>
            <h4 className="font-bold text-zinc-200">Como meus dados são gerenciados?</h4>
            <p>
              Privacidade total. O BuJo Focus armazena todos os seus registros localmente no seu próprio navegador utilizando LocalStorage. Se você optar por habilitar a sincronização na nuvem (Supabase), os dados serão transmitidos de forma segura para sua conta.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-zinc-200">O produto é realmente gratuito?</h4>
            <p>
              Sim, 100% gratuito e de código aberto sob a licença MIT. Você pode clonar o repositório, executar no seu próprio computador localmente e até customizar funcionalidades conforme desejar.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-250/10 pt-8 text-center text-[10px] text-zinc-500 space-y-2">
        <div className="flex items-center justify-center gap-1">
          <span>Criado com</span>
          <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          <span>para mentes neurodivergentes. Código aberto sob a licença MIT.</span>
        </div>
        <p>© 2026 BuJo Focus Planner. Sem fins lucrativos.</p>
      </div>
    </div>
  );
};
