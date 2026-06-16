import { useState, useEffect } from 'react';
import { X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  tab: 'indice' | 'daily_log' | 'weekly_log' | 'monthly_log' | 'daily_spread' | 'future_log' | 'brain_dump' | 'settings' | 'collections' | 'someday_maybe' | 'dream_board' | 'trash';
  positionClass: string;
  selector?: string;
  arrowPlacement?: 'top' | 'bottom' | 'left' | 'right';
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
    positionClass: "top-32 left-6 md:left-24",
    selector: "#tutorial-cognitive-load",
    arrowPlacement: "top"
  },
  {
    title: "📈 Ritmo Energético TDAH",
    description: "Este gráfico mostra sua flutuação natural de energia ao longo do dia. Agende tarefas difíceis para o Pico de Foco e tarefas leves para os períodos de Crash para render melhor!",
    tab: "indice",
    positionClass: "bottom-12 left-6 md:left-24",
    selector: "#tutorial-energy-chart",
    arrowPlacement: "top"
  },
  {
    title: "📊 Rastreador de Hábitos Inteligente",
    description: "Monitore seus hábitos diários aqui. Clique em 'Identificar com IA' para analisar suas tarefas anteriores e sugerir os hábitos ideais para você rastrear.",
    tab: "indice",
    positionClass: "top-1/4 right-6 md:right-24",
    selector: "#tutorial-habit-tracker",
    arrowPlacement: "top"
  },
  {
    title: "🎓 Evolução Acadêmica e Profissional",
    description: "Organize seus estudos e monitore seu crescimento! Este gráfico acompanha de forma visual e intuitiva o desenvolvimento do seu conhecimento em suas carreiras e mestrado.",
    tab: "indice",
    positionClass: "bottom-12 left-6 md:left-24",
    selector: "#tutorial-knowledge-chart",
    arrowPlacement: "top"
  },
  {
    title: "🎮 Progresso e Gamificação",
    description: "Foque e evolua! Você acumula XP completando tarefas e hábitos diários. Acompanhe seu nível e barra de progresso no painel lateral para se motivar constantemente.",
    tab: "indice",
    positionClass: "top-32 left-6 md:left-24",
    selector: "#tutorial-gamification",
    arrowPlacement: "right"
  },
  {
    title: "⚡ IA Local no Navegador",
    description: "Este indicador mostra o status da IA avançada no browser. Clique para configurar, ativar ou baixar modelos de IA que rodam 100% de forma privada localmente.",
    tab: "indice",
    positionClass: "top-32 right-6 md:right-24",
    selector: "#tutorial-ai-badge",
    arrowPlacement: "top"
  },
  {
    title: "📲 Instalar como Aplicativo (PWA)",
    description: "Clique aqui para baixar e instalar o BuJo Focus no seu dispositivo. Desfrute de inicialização rápida, execução em tela cheia e acesso instantâneo na área de trabalho.",
    tab: "indice",
    positionClass: "top-32 right-6 md:right-24",
    selector: "#tutorial-install-pwa",
    arrowPlacement: "top"
  },
  {
    title: "📝 Daily Log (Registro Diário)",
    description: "Adicione tarefas, notas ou eventos rapidamente. Agora você pode definir datas e horários personalizados para cada item. Clique no marcador circular para ciclar o status da tarefa!",
    tab: "daily_log",
    positionClass: "bottom-12 left-1/2 -translate-x-1/2",
    selector: "#sidebar-tab-daily_log",
    arrowPlacement: "right"
  },
  {
    title: "📅 Weekly Log (Revisão Semanal)",
    description: "Faça suas reflexões semanais aqui. Revise a taxa de conclusão de tarefas da semana e anote insights sobre seu ritmo e energia mental para melhorar no futuro.",
    tab: "weekly_log",
    positionClass: "bottom-12 left-1/2 -translate-x-1/2",
    selector: "#sidebar-tab-weekly_log",
    arrowPlacement: "right"
  },
  {
    title: "📅 Monthly Log (Calendário Moderno)",
    description: "Veja o mês de forma ampla. Dias com tarefas abertas têm bolinhas coloridas. Clique em qualquer dia para abrir a agenda do dia e planejar o Daily Log rápido.",
    tab: "monthly_log",
    positionClass: "bottom-12 left-1/2 -translate-x-1/2",
    selector: "#sidebar-tab-monthly_log",
    arrowPlacement: "right"
  },
  {
    title: "📅 Future Log (Planejamento Futuro)",
    description: "Projete seus próximos meses de forma organizada. Excelente para anotar das importantes, metas futuras de longo prazo e compromissos distantes.",
    tab: "future_log",
    positionClass: "bottom-12 left-1/2 -translate-x-1/2",
    selector: "#sidebar-tab-future_log",
    arrowPlacement: "right"
  },
  {
    title: "⏳ Linha do Tempo (Timeline)",
    description: "Organize visualmente seu dia para combater a cegueira temporal. Arraste tarefas pendentes para blocos de horários de 24 horas e visualize seu dia estruturado.",
    tab: "daily_spread",
    positionClass: "bottom-12 left-1/2 -translate-x-1/2",
    selector: "#sidebar-tab-daily_spread",
    arrowPlacement: "right"
  },
  {
    title: "🧠 Brain Dump (Despejo de Mente)",
    description: "Tem muitos pensamentos te distraindo? Digite tudo o que está na sua cabeça nesta estação e deixe a nossa inteligência artificial local organizar e extrair tarefas para você.",
    tab: "brain_dump",
    positionClass: "bottom-12 left-1/2 -translate-x-1/2",
    selector: "#sidebar-tab-brain_dump",
    arrowPlacement: "right"
  },
  {
    title: "🗂️ Coleções Personalizadas",
    description: "Organize listas temáticas personalizadas (livros para ler, metas de viagem, projetos). Adicione ícones customizados, crie sub-tarefas e gerencie tudo em um único lugar!",
    tab: "collections",
    positionClass: "bottom-12 left-1/2 -translate-x-1/2",
    selector: "#sidebar-tab-collections",
    arrowPlacement: "right"
  },
  {
    title: "🗓️ Algum Dia / Talvez (GTD)",
    description: "Inspirado no método GTD. Guarde ideias, projetos ou tarefas que você gostaria de realizar no futuro, mas não tem data definida, tirando o peso da sua mente hoje.",
    tab: "someday_maybe",
    positionClass: "bottom-12 left-1/2 -translate-x-1/2",
    selector: "#sidebar-tab-someday_maybe",
    arrowPlacement: "right"
  },
  {
    title: "✨ Quadro dos Sonhos",
    description: "Visualize suas maiores metas e conquistas! Adicione sonhos de vida, coloque prazos e marque o que você já conquistou para ver sua evolução e se motivar diariamente.",
    tab: "dream_board",
    positionClass: "bottom-12 left-1/2 -translate-x-1/2",
    selector: "#sidebar-tab-dream_board",
    arrowPlacement: "right"
  },
  {
    title: "🗑️ Lixeira do Sistema",
    description: "Segurança primeiro! Qualquer item ou tarefa deletada vai diretamente para a lixeira. Se apagar algo por engano, você pode restaurá-lo a qualquer momento ou esvaziar a lixeira de vez.",
    tab: "trash",
    positionClass: "bottom-12 left-1/2 -translate-x-1/2",
    selector: "#sidebar-tab-trash",
    arrowPlacement: "right"
  },
  {
    title: "⚙️ Ajustes e Preferências",
    description: "Ajuste o planner para suas necessidades! Mude fontes (fontes acessíveis para TDAH/Dislexia), configure chaves de IA externas e gerencie backups locais com facilidade.",
    tab: "settings",
    positionClass: "bottom-12 left-1/2 -translate-x-1/2",
    selector: "#sidebar-tab-settings",
    arrowPlacement: "right"
  },
  {
    title: "🦊 Mascote de Foco e Som Ambiente",
    description: "Seu parceiro de foco! Passe o mouse sobre ele no canto inferior para escolher sons de foco (chuva, ruído marrom, lofi) e ajustar o volume sem interromper suas tarefas.",
    tab: "indice",
    positionClass: "bottom-36 right-6 md:right-24",
    selector: "#tutorial-mascot",
    arrowPlacement: "left"
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
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [borderRadius, setBorderRadius] = useState('12px');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const stepData = tutorialSteps[currentStep];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (showTutorial) {
      setCurrentStep(0);
      setActiveTab(tutorialSteps[0].tab);
    }
  }, [showTutorial]);

  useEffect(() => {
    if (!showTutorial) {
      setTargetRect(null);
      return;
    }

    let active = true;
    let checks = 0;

    const checkElement = () => {
      if (!active) return;
      
      // On mobile, if selector is for sidebar, use mobile menu trigger as fallback
      let selector = stepData.selector;
      if (isMobile && selector?.startsWith('#sidebar-tab-')) {
        selector = "#tutorial-mobile-menu-trigger";
      }

      const element = selector ? document.querySelector(selector) : null;
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setTargetRect(rect);
          const computedStyle = window.getComputedStyle(element);
          setBorderRadius(computedStyle.borderRadius || '12px');
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }
      
      // If element is not in DOM or not visible yet, retry (up to 10 times)
      if (checks < 10) {
        checks++;
        setTimeout(checkElement, 150);
      } else {
        setTargetRect(null);
      }
    };

    setTargetRect(null);
    checkElement();

    const handleUpdate = () => {
      let selector = stepData.selector;
      if (isMobile && selector?.startsWith('#sidebar-tab-')) {
        selector = "#tutorial-mobile-menu-trigger";
      }

      if (selector) {
        const element = document.querySelector(selector);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setTargetRect(rect);
          }
        }
      }
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    return () => {
      active = false;
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [currentStep, stepData.selector, showTutorial, isMobile]);

  const getCardPositionClass = () => {
    if (!isMobile) return stepData.positionClass;
    
    if (targetRect) {
      const elementCenterY = targetRect.top + targetRect.height / 2;
      if (elementCenterY > window.innerHeight / 2) {
        return "top-4 left-1/2 -translate-x-1/2";
      }
    }
    return "bottom-4 left-1/2 -translate-x-1/2";
  };

  const getArrowPlacement = (): 'top' | 'bottom' | 'left' | 'right' => {
    const defaultPlacement = stepData.arrowPlacement || 'top';
    if (!isMobile) return defaultPlacement;
    
    // On mobile, sidebar-tab selectors were redirected to mobile-menu-trigger (top-left)
    if (stepData.selector?.startsWith('#sidebar-tab-')) {
      return 'top';
    }

    if (defaultPlacement === 'left' || defaultPlacement === 'right') {
      if (targetRect) {
        return (targetRect.top + targetRect.height / 2 > window.innerHeight / 2) ? 'top' : 'bottom';
      }
    }
    return defaultPlacement;
  };

  if (!showTutorial) return null;

  const resetViewportScroll = () => {
    window.scrollTo(0, 0);
    if (document.body) document.body.scrollTop = 0;
    if (document.documentElement) document.documentElement.scrollTop = 0;
    const root = document.getElementById('root');
    if (root) root.scrollTop = 0;
  };

  const handleNext = () => {
    resetViewportScroll();
    if (currentStep < tutorialSteps.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      setActiveTab(tutorialSteps[nextIdx].tab);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    resetViewportScroll();
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      setActiveTab(tutorialSteps[prevIdx].tab);
    }
  };

  const renderBackdrop = () => {
    if (!targetRect) {
      return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] pointer-events-auto" />
      );
    }

    return (
      <svg 
        className="fixed inset-0 w-full h-full pointer-events-none" 
        style={{ zIndex: 48 }}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect 
              x={targetRect.left - 4} 
              y={targetRect.top - 4} 
              width={targetRect.width + 8} 
              height={targetRect.height + 8} 
              rx={parseFloat(borderRadius) || 12} 
              fill="black" 
            />
          </mask>
        </defs>
        <rect 
          x="0" 
          y="0" 
          width="100%" 
          height="100%" 
          fill="rgba(0, 0, 0, 0.65)" 
          mask="url(#spotlight-mask)"
          className="pointer-events-auto"
        />
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none no-print">
      {renderBackdrop()}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-down-anim {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes bounce-up-anim {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        @keyframes bounce-left-anim {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-8px); }
        }
        @keyframes bounce-right-anim {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(8px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.9; box-shadow: 0 0 0 0px rgba(234, 88, 12, 0.7), 0 0 15px rgba(234, 88, 12, 0.4); }
          70% { transform: scale(1); opacity: 0.5; box-shadow: 0 0 0 10px rgba(234, 88, 12, 0), 0 0 25px rgba(234, 88, 12, 0.7); }
          100% { transform: scale(1); opacity: 0; box-shadow: 0 0 0 0px rgba(234, 88, 12, 0), 0 0 15px rgba(234, 88, 12, 0.4); }
        }
        .tutorial-highlight-ring {
          animation: pulse-ring 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }
      `}} />

      {targetRect && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: `${targetRect.top}px`,
              left: `${targetRect.left}px`,
              width: `${targetRect.width}px`,
              height: `${targetRect.height}px`,
              borderRadius: borderRadius,
              border: '2.5px solid #ea580c',
              boxShadow: '0 0 15px rgba(234, 88, 12, 0.6), inset 0 0 10px rgba(234, 88, 12, 0.3)',
              pointerEvents: 'none',
              zIndex: 49,
              transition: 'all 0.2s ease-out'
            }}
          />
          <div 
            className="tutorial-highlight-ring"
            style={{
              position: 'fixed',
              top: `${targetRect.top}px`,
              left: `${targetRect.left}px`,
              width: `${targetRect.width}px`,
              height: `${targetRect.height}px`,
              borderRadius: borderRadius,
              border: '2.5px solid #ea580c',
              pointerEvents: 'none',
              zIndex: 49,
              transition: 'all 0.2s ease-out'
            }}
          />
          <PointingArrow placement={getArrowPlacement()} rect={targetRect} />
        </>
      )}

      {/* Floating Tutorial Balloon Card - Improved for Mobile */}
      <div className={`fixed ${getCardPositionClass()} z-50 pointer-events-auto w-[calc(100vw-2rem)] max-w-sm sm:max-w-md bg-zinc-950/95 border border-bujo-highlight/30 backdrop-blur-2xl rounded-3xl sm:rounded-[32px] shadow-3xl flex flex-col text-left animate-slide-in ring-1 ring-white/10 max-h-[85vh] overflow-hidden`}>
        
        {/* Header - Fixed */}
        <div className="flex items-center justify-between border-b border-white/5 p-4 sm:p-5 pb-2 sm:pb-3 shrink-0">
          <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest">
            Tour • Passo {currentStep + 1} de {tutorialSteps.length}
          </span>
          <button
            onClick={() => { resetViewportScroll(); onClose(); }}
            className="text-[9px] font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-wider cursor-pointer bg-transparent border-none"
          >
            Pular
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 space-y-3">
          {/* Title and Icon */}
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-lg bg-bujo-highlight/10 border border-bujo-highlight/20 text-bujo-highlight shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">{stepData.title}</h4>
          </div>

          {/* Description */}
          <p className="text-[11px] sm:text-xs leading-relaxed text-zinc-350">
            {stepData.description}
          </p>
        </div>

        {/* Footer Buttons - Fixed */}
        <div className="flex items-center justify-between p-4 sm:p-5 pt-2 sm:pt-3 border-t border-white/5 bg-zinc-950/50 shrink-0">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer bg-transparent border-none"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Anterior
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 py-2 px-5 bg-bujo-highlight hover:opacity-95 text-white text-[11px] font-bold rounded-xl shadow-lg transition-all cursor-pointer border-none"
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

const PointingArrow = ({ placement, rect }: { placement: 'top' | 'bottom' | 'left' | 'right'; rect: DOMRect }) => {
  const getOuterStyles = (): React.CSSProperties => {
    const size = 40; 
    const offset = 14; 
    
    switch (placement) {
      case 'top':
        return {
          position: 'fixed',
          top: `${rect.top - size - offset}px`,
          left: `${rect.left + rect.width / 2 - size / 2}px`,
          animation: 'bounce-down-anim 1.5s infinite ease-in-out',
          zIndex: 60,
          pointerEvents: 'none'
        };
      case 'bottom':
        return {
          position: 'fixed',
          top: `${rect.bottom + offset}px`,
          left: `${rect.left + rect.width / 2 - size / 2}px`,
          animation: 'bounce-up-anim 1.5s infinite ease-in-out',
          zIndex: 60,
          pointerEvents: 'none'
        };
      case 'left':
        return {
          position: 'fixed',
          top: `${rect.top + rect.height / 2 - size / 2}px`,
          left: `${rect.left - size - offset}px`,
          animation: 'bounce-left-anim 1.5s infinite ease-in-out',
          zIndex: 60,
          pointerEvents: 'none'
        };
      case 'right':
        return {
          position: 'fixed',
          top: `${rect.top + rect.height / 2 - size / 2}px`,
          left: `${rect.right + offset}px`,
          animation: 'bounce-right-anim 1.5s infinite ease-in-out',
          zIndex: 60,
          pointerEvents: 'none'
        };
      default:
        return {};
    }
  };

  const getRotation = () => {
    switch (placement) {
      case 'top': return 'rotate(270deg)';
      case 'bottom': return 'rotate(90deg)';
      case 'left': return 'rotate(180deg)';
      case 'right': return 'rotate(0deg)';
      default: return 'rotate(0deg)';
    }
  };

  return (
    <div style={getOuterStyles()}>
      <svg 
        style={{
          transform: getRotation(),
          transition: 'transform 0.3s ease-out'
        }}
        width="40" 
        height="40" 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="arrow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>
        <path 
          d="M30 20H10M10 20L17 13M10 20L17 27" 
          stroke="#ea580c" 
          strokeWidth="5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          opacity="0.3"
          filter="url(#neon-glow)"
        />
        <path 
          d="M30 20H10M10 20L17 13M10 20L17 27" 
          stroke="url(#arrow-grad)" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          filter="url(#neon-glow)"
        />
        <circle cx="9" cy="20" r="2.5" fill="#f59e0b" filter="url(#neon-glow)" />
      </svg>
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
