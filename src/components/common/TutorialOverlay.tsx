import { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  tab: 'indice' | 'daily_log' | 'weekly_log' | 'monthly_log' | 'daily_spread' | 'future_log' | 'brain_dump' | 'settings' | 'collections';
  positionClass: string;
}

interface TutorialOverlayProps {
  showTutorial: boolean;
  onClose: () => void;
  setActiveTab: (tab: any) => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "👋 Bem-vindo ao BuJo Focus!",
    description: "Vamos fazer um tour rápido para você dominar a plataforma! Este é o seu painel central (Índice), onde você tem uma visão geral do seu progresso e carga diária.",
    tab: "indice",
    positionClass: "bottom-12 left-1/2 -translate-x-1/2"
  },
  {
    title: "🧠 Carga Cognitiva & Alívio IA",
    description: "Aqui monitoramos seu cansaço mental. Se estiver sobrecarregado, clique em 'Alívio IA' para que a IA analise como você se sente e redistribua suas tarefas pendentes de forma equilibrada!",
    tab: "indice",
    positionClass: "top-32 left-6 md:left-24"
  },
  {
    title: "📈 Ritmo Energético TDAH",
    description: "Este gráfico mostra sua flutuação natural de energia ao longo do dia. Agende tarefas difíceis para o Pico de Foco e tarefas leves para os períodos de Crash para render melhor!",
    tab: "indice",
    positionClass: "bottom-12 left-6 md:left-24"
  },
  {
    title: "📊 Rastreador de Hábitos Inteligente",
    description: "Monitore seus hábitos diários aqui. Clique em 'Identificar com IA' para analisar suas tarefas anteriores e sugerir os hábitos ideais para você rastrear.",
    tab: "indice",
    positionClass: "top-1/4 right-6 md:right-24"
  },
  {
    title: "📝 Daily Log (Registro Diário)",
    description: "Adicione tarefas, notas ou eventos rapidamente. Agora você pode definir datas e horários personalizados para cada item. Clique no marcador circular para ciclar o status da tarefa!",
    tab: "daily_log",
    positionClass: "bottom-12 left-1/2 -translate-x-1/2"
  },
  {
    title: "📅 Weekly Log (Revisão Semanal)",
    description: "Faça suas reflexões semanais aqui. Revise a taxa de conclusão de tarefas da semana e anote insights sobre seu ritmo e energia mental para melhorar no futuro.",
    tab: "weekly_log",
    positionClass: "bottom-12 left-1/2 -translate-x-1/2"
  },
  {
    title: "📅 Monthly Log (Calendário Moderno)",
    description: "Veja o mês de forma ampla. Dias com tarefas abertas têm bolinhas coloridas. Clique em qualquer dia para abrir a agenda do dia e planejar o Daily Log rápido.",
    tab: "monthly_log",
    positionClass: "bottom-12 left-1/2 -translate-x-1/2"
  },
  {
    title: "⏳ Linha do Tempo (Timeline)",
    description: "Organize visualmente seu dia para combater a cegueira temporal. Arraste tarefas pendentes para blocos de horários de 24 horas e visualize seu dia estruturado.",
    tab: "daily_spread",
    positionClass: "bottom-12 left-1/2 -translate-x-1/2"
  },
  {
    title: "🧠 Brain Dump (Despejo de Mente)",
    description: "Tem muitos pensamentos te distraindo? Digite tudo o que está na sua cabeça nesta estação e deixe a nossa inteligência artificial local organizar e extrair tarefas para você.",
    tab: "brain_dump",
    positionClass: "bottom-12 left-1/2 -translate-x-1/2"
  },
  {
    title: "🦊 Mascote de Foco e Som Ambiente",
    description: "Seu parceiro de foco! Passe o mouse sobre ele no canto inferior para escolher sons de foco (chuva, ruído marrom, lofi) e ajustar o volume sem interromper suas tarefas.",
    tab: "indice",
    positionClass: "bottom-36 right-6 md:right-24"
  },
  {
    title: "🎯 Tudo Pronto!",
    description: "Você concluiu o tour! Lembre-se de usar o 'Modo Foco' no cabeçalho para focar com Pomodoro sem distrações. Aproveite ao máximo!",
    tab: "indice",
    positionClass: "bottom-12 left-1/2 -translate-x-1/2"
  }
];

export const TutorialOverlay = ({ showTutorial, onClose, setActiveTab }: TutorialOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (showTutorial) {
      setCurrentStep(0);
      setActiveTab(tutorialSteps[0].tab);
    }
  }, [showTutorial]);

  if (!showTutorial) return null;

  const stepData = tutorialSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      setActiveTab(tutorialSteps[nextIdx].tab);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      setActiveTab(tutorialSteps[prevIdx].tab);
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none no-print">
      {/* Background dimmer */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] pointer-events-auto" />

      {/* Floating Tutorial Balloon Card */}
      <div className={`fixed ${stepData.positionClass} z-50 pointer-events-auto w-[calc(100vw-2rem)] max-w-sm sm:max-w-md bg-zinc-950/95 border border-bujo-highlight/30 backdrop-blur-2xl p-6 rounded-[32px] shadow-3xl flex flex-col gap-4 text-left animate-slide-in ring-1 ring-white/10`}>
        {/* Step Indicator and Skip */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest">
            Tour do Sistema • Passo {currentStep + 1} de {tutorialSteps.length}
          </span>
          <button
            onClick={onClose}
            className="text-[9px] font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
          >
            Pular Tour
          </button>
        </div>

        {/* Title and Icon */}
        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded-lg bg-bujo-highlight/10 border border-bujo-highlight/20 text-bujo-highlight shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <h4 className="text-base font-bold text-white tracking-tight">{stepData.title}</h4>
        </div>

        {/* Description */}
        <p className="text-xs leading-relaxed text-zinc-350">
          {stepData.description}
        </p>

        {/* Buttons Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Anterior
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 py-1.5 px-4 bg-bujo-highlight hover:opacity-95 text-white text-[11px] font-bold rounded-xl shadow-lg transition-all cursor-pointer"
          >
            {currentStep === tutorialSteps.length - 1 ? (
              <>Concluir <CheckIcon className="w-3.5 h-3.5" /></>
            ) : (
              <>Próximo <ChevronRight className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={3} 
    stroke="currentColor" 
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
