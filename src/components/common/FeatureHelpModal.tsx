import { useEffect } from 'react';
import { X, Sparkles, Lightbulb, Zap, HelpCircle } from 'lucide-react';
import { useBujo } from '../../context/BujoContext';

interface HelpContent {
  title: string;
  description: string;
  howTo: string[];
  tips: string[];
}

const helpDictionary: Record<string, HelpContent> = {
  indice: {
    title: 'Painel Central (Índice)',
    description: 'Sua visão geral do Bullet Journal. Aqui você acompanha seu ritmo energético, hábitos e progresso em diferentes áreas.',
    howTo: [
      'Acompanhe o gráfico de "Carga Cognitiva" para saber se precisa de uma pausa.',
      'Acesse rapidamente as outras ferramentas usando o "Menu de Acesso Rápido".',
      'Registre horas de estudo na Evolução do Conhecimento para ganhar XP.'
    ],
    tips: [
      'Clique em "Alívio IA" no cabeçalho se a carga estiver alta para redistribuir tarefas.',
      'Use o Mascote (canto inferior direito) para tocar sons de foco (Chuva, LoFi).'
    ]
  },
  daily_log: {
    title: 'Log Diário (Daily Log)',
    description: 'Sua lista rápida de tarefas, notas e eventos para o dia. O coração do método Bullet Journal.',
    howTo: [
      'Digite na caixa de texto para adicionar itens rapidamente.',
      'Clique no círculo ao lado da tarefa para mudar o status (fazer -> feito -> migrado -> cancelado).'
    ],
    tips: [
      'Smart Add: Digite "Reunião amanhã às 15h p1" e o sistema entenderá data, hora e prioridade automaticamente!',
      'Use "#Nome" para delegar uma tarefa para alguém.',
      'Use "[Nome da Coleção]" para salvar a tarefa simultaneamente em uma lista específica.'
    ]
  },
  weekly_log: {
    title: 'Log Semanal (Reflexão)',
    description: 'Faça o planejamento e a reflexão da sua semana para entender onde você acertou e o que pode melhorar.',
    howTo: [
      'Navegue entre as semanas usando as setas no topo.',
      'Preencha as áreas de reflexão para guardar aprendizados sobre sua produtividade.'
    ],
    tips: [
      'A IA do sistema analisa suas reflexões passadas para sugerir melhorias no Painel Central.'
    ]
  },
  monthly_log: {
    title: 'Log Mensal (Calendário)',
    description: 'A visão "macro" do seu mês. Identifique dias sobrecarregados e planeje com antecedência.',
    howTo: [
      'Visualize os pontos coloridos que indicam tarefas, eventos ou notas naquele dia.',
      'Clique em um dia específico para abrir os detalhes e adicionar novas tarefas diretamente.'
    ],
    tips: [
      'A cor vermelha no calendário indica dias com dias de alta sobrecarga.'
    ]
  },
  daily_spread: {
    title: 'Agenda Diária (Timeline)',
    description: 'Combata a "cegueira temporal" (Time Blindness) agendando tarefas em blocos de horas específicos.',
    howTo: [
      'O lado esquerdo mostra a linha do tempo (24 horas).',
      'O lado direito mostra as tarefas pendentes do dia.',
      'Clique em "Alocar" ou arraste a tarefa para o horário desejado.'
    ],
    tips: [
      'Ative o "Motor de Re-agendamento IA" para que o sistema organize os blocos automaticamente com base na sua energia.'
    ]
  },
  future_log: {
    title: 'Log Futuro (Planejamento de Longo Prazo)',
    description: 'Guarde eventos e tarefas que vão acontecer nos próximos meses. Libere espaço mental hoje.',
    howTo: [
      'Selecione o mês desejado na grade.',
      'Adicione eventos importantes ou compromissos que você não quer esquecer.'
    ],
    tips: [
      'Tarefas do Log Futuro aparecerão automaticamente no seu Log Diário quando o mês correspondente chegar.'
    ]
  },
  brain_dump: {
    title: 'Despejo Mental (Brain Dump)',
    description: 'Sua cabeça está cheia? Jogue todos os seus pensamentos aqui sem filtro e deixe a IA organizar para você.',
    howTo: [
      'Digite tudo o que está na sua cabeça, misturando ideias, afazeres e desabafos.',
      'Clique em "Processar com IA" para que o sistema extraia tarefas organizadas a partir do seu texto.'
    ],
    tips: [
      'A IA local roda diretamente no seu navegador, garantindo que seus pensamentos privados não sejam enviados para servidores externos.'
    ]
  },
  collections: {
    title: 'Coleções (Listas Personalizadas)',
    description: 'Agrupe tarefas e notas por temas (ex: Livros para Ler, Viagem de Férias, Projeto X).',
    howTo: [
      'Crie uma nova coleção e escolha um ícone e uma cor.',
      'Adicione itens com descrições, subtarefas e links (URLs) para referência.'
    ],
    tips: [
      'Você pode adicionar tarefas a coleções diretamente do Log Diário escrevendo o nome entre chaves, ex: "[Viagem] Comprar passagens".'
    ]
  },
  dream_board: {
    title: 'Quadro dos Sonhos',
    description: 'Visualize suas metas de vida de longo prazo e registre suas maiores conquistas.',
    howTo: [
      'Adicione sonhos com uma descrição visual ou ícone.',
      'Quando alcançar, marque como "Conquistado" para ver seu mural de vitórias crescer.'
    ],
    tips: [
      'Completar sonhos dá um boost massivo na sua barra de XP e nível do sistema!'
    ]
  },

  trash: {
    title: 'Lixeira',
    description: 'Itens excluídos vêm parar aqui por segurança.',
    howTo: [
      'Você pode restaurar uma tarefa deletada por engano ou esvaziar a lixeira permanentemente.'
    ],
    tips: [
      'Se você estiver sem espaço de armazenamento, esvaziar a lixeira pode ajudar.'
    ]
  },
  settings: {
    title: 'Configurações do Sistema',
    description: 'Ajuste o BuJo Focus para funcionar do seu jeito.',
    howTo: [
      'Mude o tema, as cores e ative Fontes Acessíveis (para Dislexia).',
      'Gerencie a IA Local, importando e ativando os modelos.'
    ],
    tips: [
      'Para usuários avançados: você pode forçar uma sincronização manual com o Supabase na aba de Backups.'
    ]
  }
};

export const FeatureHelpModal = () => {
  const { activeTab, showFeatureHelpModal, setShowFeatureHelpModal } = useBujo();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFeatureHelpModal) {
        setShowFeatureHelpModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFeatureHelpModal, setShowFeatureHelpModal]);

  if (!showFeatureHelpModal) return null;

  const content = helpDictionary[activeTab] || {
    title: 'Recurso',
    description: 'Bem-vindo a esta área do Bullet Journal.',
    howTo: ['Explore a interface para descobrir suas funcionalidades.'],
    tips: ['Tente integrar esta funcionalidade à sua rotina diária.']
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-print">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[28px] shadow-2xl overflow-hidden p-6 animate-scale-in flex flex-col relative">
        
        {/* Glow Background Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-bujo-highlight/10 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-bujo-highlight/10 border border-bujo-highlight/20 text-bujo-highlight shadow-inner shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest block mb-0.5">Como Usar</span>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">{content.title}</h3>
            </div>
          </div>
          <button
            onClick={() => setShowFeatureHelpModal(false)}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-zinc-500 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="space-y-5 relative z-10">
          {/* Description */}
          <p className="text-xs text-zinc-300 leading-relaxed border-l-2 border-zinc-700 pl-3">
            {content.description}
          </p>

          {/* How To List */}
          <div className="space-y-2.5 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3 h-3 text-bujo-accent" /> Primeiros Passos
            </h4>
            <ul className="space-y-2.5">
              {content.howTo.map((item, idx) => (
                <li key={idx} className="text-xs text-zinc-200 flex items-start gap-2 leading-snug">
                  <span className="text-bujo-highlight mt-0.5 font-black text-[10px]">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Tips */}
          {content.tips && content.tips.length > 0 && (
            <div className="space-y-2.5 bg-bujo-highlight/[0.03] border border-bujo-highlight/10 rounded-2xl p-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-bujo-highlight flex items-center gap-1.5 mb-3">
                <Zap className="w-3 h-3" /> Dicas de Produtividade
              </h4>
              <ul className="space-y-2.5">
                {content.tips.map((item, idx) => (
                  <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2 leading-snug italic">
                    <span className="text-bujo-highlight/70 mt-0.5 font-black text-[10px]">💡</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/5 flex justify-end relative z-10">
          <button
            onClick={() => setShowFeatureHelpModal(false)}
            className="px-6 py-2.5 bg-bujo-highlight text-white hover:opacity-95 font-bold text-xs rounded-xl shadow-lg shadow-bujo-highlight/20 transition-all active:scale-95 cursor-pointer"
          >
            Entendi, vamos lá!
          </button>
        </div>
      </div>
    </div>
  );
};

export const FloatingHelpButton = () => {
  const { setShowFeatureHelpModal, focoActive } = useBujo();

  if (focoActive) return null; // Don't show in focus mode

  return (
    <button
      onClick={() => setShowFeatureHelpModal(true)}
      className="fixed bottom-6 left-6 z-40 p-3 bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:scale-105 active:scale-95 transition-all rounded-full shadow-2xl flex items-center justify-center cursor-pointer no-print group"
      title="Como usar esta funcionalidade?"
    >
      <HelpCircle className="w-5 h-5 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
    </button>
  );
};