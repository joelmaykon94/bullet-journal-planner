import { useState, useEffect } from 'react';
import { Sparkles, Brain, Clock, AlertTriangle, Check, ArrowRight, ShieldAlert, Heart, CalendarDays } from 'lucide-react';
import { BujoItem } from '../../../types';
import { useBujo } from '../../../context/BujoContext';

interface ProposalItem {
  id: string;
  content: string;
  originalDate: string;
  proposedDate: string;
  action: 'keep' | 'postpone' | 'future' | 'simplify';
  proposedTime?: string;
}

export const OverloadReliefModal = () => {
  const {
    items,
    setItems,
    setShowOverloadReliefModal,
    showToast,
    aiEngine,
    aiWorkerRef,
    localLLMState,
    initLocalLLMWorker
  } = useBujo();

  const onClose = () => setShowOverloadReliefModal(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [anxiety, setAnxiety] = useState<number>(3); // 1 to 5
  const [energy, setEnergy] = useState<'high' | 'low' | 'exhausted'>('low');
  const [availableHours, setAvailableHours] = useState<number>(2); // 1, 2, 4, 8 hours
  const [counsel, setCounsel] = useState<string>('');
  const [isGeneratingCounsel, setIsGeneratingCounsel] = useState<boolean>(false);
  const [proposal, setProposal] = useState<ProposalItem[]>([]);
  const [step, setStep] = useState<'inputs' | 'proposal'>('inputs');

  const pendingTasks = items.filter(i => i.status === 'open' && i.type === 'task');

  // Trigger local worker message handler if needed
  useEffect(() => {
    const handleWorkerMessage = (e: MessageEvent) => {
      const { type, data } = e.data;
      if (type === 'result' && isGeneratingCounsel) {
        setCounsel(data);
        setIsGeneratingCounsel(false);
      } else if (type === 'error' && isGeneratingCounsel) {
        setIsGeneratingCounsel(false);
        generateFallbackCounsel();
      }
    };

    if (aiWorkerRef.current) {
      aiWorkerRef.current.addEventListener('message', handleWorkerMessage);
    }
    return () => {
      if (aiWorkerRef.current) {
        aiWorkerRef.current.removeEventListener('message', handleWorkerMessage);
      }
    };
  }, [isGeneratingCounsel]);

  const generateFallbackCounsel = () => {
    let text = '';
    if (anxiety >= 4 || energy === 'exhausted') {
      text = '⚠️ ALERTA DE ESGOTAMENTO: Seu cérebro está sinalizando sobrecarga severa. Não tente abraçar o mundo hoje. A prioridade absoluta é reduzir o estresse. Sugerimos focar em apenas uma tarefa simples ou tirar um período de descanso programado. Seus compromissos restantes foram remanejados para dar espaço para você respirar.';
    } else if (anxiety === 3 || energy === 'low') {
      text = '⚖️ RITMO MODERADO: Sua energia está reduzida e há sinais de tensão. O melhor caminho é o equilíbrio. Selecionamos apenas 1 ou 2 tarefas prioritárias para hoje, jogando as demandas burocráticas ou não essenciais para o decorrer da semana. Vá com calma, uma micro-etapa de cada vez.';
    } else {
      text = '⚡ RITMO SAUDÁVEL: Sua energia está boa e a ansiedade sob controle. Mesmo assim, para evitar frustração pós-almoço, distribuímos as tarefas de forma equilibrada ao longo do dia, agendando as mais pesadas para as próximas horas.';
    }
    setCounsel(text);
    setIsGeneratingCounsel(false);
  };

  const generateReliefPlan = async () => {
    setIsGeneratingCounsel(true);
    setStep('proposal');

    // 1. Generate local AI counsel letter
    const counselPrompt = `Acalme um usuário com TDAH que está com ansiedade nível ${anxiety}/5 e energia mental "${energy}" (disponibilidade: ${availableHours}h). Dê um conselho amigável, acolhedor e pragmático em no máximo 3 frases em Português do Brasil.`;
    
    if (aiEngine === 'local_llm' && localLLMState === 'ready' && aiWorkerRef.current) {
      aiWorkerRef.current.postMessage({
        type: 'generate',
        data: { text: counselPrompt, maxTokens: 120, mode: 'advise' }
      });
    } else {
      // Use fallback counsel
      setTimeout(() => {
        generateFallbackCounsel();
      }, 500);
    }

    // 2. Algorithmically construct the rescheduling proposal
    // Decide max tasks for today based on energy & hours
    let maxTasksToday = 1;
    if (energy === 'high') {
      maxTasksToday = availableHours >= 4 ? 3 : 2;
    } else if (energy === 'low') {
      maxTasksToday = availableHours >= 4 ? 2 : 1;
    } else {
      maxTasksToday = 1; // Exhausted
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Date of next week's Monday
    const nextMonday = new Date();
    const currentDay = nextMonday.getDay();
    const distanceToMonday = currentDay === 0 ? 1 : 8 - currentDay;
    nextMonday.setDate(nextMonday.getDate() + distanceToMonday);
    const nextMondayStr = nextMonday.toISOString().split('T')[0];

    // Date of next month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];

    let allocatedToday = 0;
    const newProposal: ProposalItem[] = pendingTasks.map((task, idx) => {
      // Decide destination based on priority and count
      let proposedDate = todayStr;
      let action: 'keep' | 'postpone' | 'future' | 'simplify' = 'keep';

      if (task.priority && allocatedToday < maxTasksToday) {
        proposedDate = todayStr;
        action = 'keep';
        allocatedToday++;
      } else if (allocatedToday < maxTasksToday && idx < maxTasksToday) {
        proposedDate = todayStr;
        action = 'keep';
        allocatedToday++;
      } else {
        // Postpone based on index
        if (idx % 3 === 0) {
          proposedDate = tomorrowStr;
          action = 'postpone';
        } else if (idx % 3 === 1) {
          proposedDate = nextMondayStr;
          action = 'postpone';
        } else {
          proposedDate = nextMonthStr;
          action = 'future';
        }
      }

      // If exhausted, simplify tasks today
      if (proposedDate === todayStr && (energy === 'exhausted' || anxiety >= 4)) {
        action = 'simplify';
      }

      return {
        id: task.id,
        content: task.content,
        originalDate: task.date,
        proposedDate,
        action
      };
    });

    setProposal(newProposal);
  };

  const handleApplyProposal = () => {
    setItems(prev => prev.map(item => {
      const prop = proposal.find(p => p.id === item.id);
      if (prop) {
        // If simplify is selected, we can also inject some subtasks automatically
        let subtasks = item.subtasks;
        if (prop.action === 'simplify' && (!subtasks || subtasks.length === 0)) {
          subtasks = [
            { id: `sub-${Date.now()}-1`, content: 'Abrir ferramentas necessárias', completed: false },
            { id: `sub-${Date.now()}-2`, content: 'Fazer o primeiro passo por 2 minutos', completed: false },
            { id: `sub-${Date.now()}-3`, content: 'Parar e beber água', completed: false }
          ];
        }
        return {
          ...item,
          date: prop.proposedDate,
          subtasks
        };
      }
      return item;
    }));

    showToast('Planilha de Carga Cognitiva reorganizada com sucesso!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in no-print">
      <div className="relative w-full max-w-3xl rounded-[40px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-3xl flex flex-col text-bujo-text max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <Brain className="w-6 h-6 text-bujo-highlight animate-pulse" />
          <h3 className="text-2xl font-bold tracking-tight">Centro de Alívio de Sobrecarga IA</h3>
        </div>
        <p className="text-xs text-zinc-500 mb-6 max-w-xl">
          Sentindo-se paralisado ou sobrecarregado? Nossa inteligência artificial redistribui suas pendências para acalmar a mente e reduzir o atrito cognitivo.
        </p>

        {step === 'inputs' ? (
          <div className="space-y-6">
            {/* Anxiety Slider */}
            <div className="space-y-3 bg-zinc-200/20 dark:bg-white/5 p-5 rounded-3xl border border-zinc-200/30 dark:border-white/5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-bujo-highlight" /> Nível de Ansiedade ou Paralisão
              </label>
              <div className="flex justify-between text-[10px] text-zinc-400 font-medium px-1">
                <span>Tranquilo (1)</span>
                <span>Tensionado (3)</span>
                <span>Crise / Paralisado (5)</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={anxiety}
                onChange={(e) => setAnxiety(parseInt(e.target.value))}
                className="w-full accent-bujo-highlight h-2 bg-zinc-350 dark:bg-zinc-800 rounded-lg cursor-pointer appearance-none"
              />
              <div className="text-center font-bold text-sm text-bujo-highlight mt-1 font-mono">
                {anxiety === 1 && '🟢 Calmo & Sob Controle'}
                {anxiety === 2 && '🟡 Levemente Tenso'}
                {anxiety === 3 && '🟠 Ansioso / Disperso'}
                {anxiety === 4 && '🔴 Muito Ansioso'}
                {anxiety === 5 && '🔥 Crise / Paralisia por Sobrecarga'}
              </div>
            </div>

            {/* Energy and Available Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 bg-zinc-200/20 dark:bg-white/5 p-5 rounded-3xl border border-zinc-200/30 dark:border-white/5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-bujo-accent" /> Energia Mental Atual
                </label>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {(['exhausted', 'low', 'high'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setEnergy(mode)}
                      className={`py-3 px-2 rounded-2xl text-[10px] font-bold border transition-all text-center ${
                        energy === mode
                          ? 'bg-bujo-highlight border-bujo-highlight text-white'
                          : 'bg-zinc-150 dark:bg-zinc-850 border-zinc-200 dark:border-white/5 text-zinc-500 hover:border-zinc-300 dark:hover:border-white/10'
                      }`}
                    >
                      {mode === 'exhausted' && '🔋 Esgotado'}
                      {mode === 'low' && '🔌 Baixa'}
                      {mode === 'high' && '⚡ Alta'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 bg-zinc-200/20 dark:bg-white/5 p-5 rounded-3xl border border-zinc-200/30 dark:border-white/5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" /> Tempo Disponível Hoje
                </label>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[1, 2, 4, 8].map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setAvailableHours(h)}
                      className={`py-3 px-1.5 rounded-2xl text-[10px] font-bold border transition-all text-center ${
                        availableHours === h
                          ? 'bg-bujo-highlight border-bujo-highlight text-white'
                          : 'bg-zinc-150 dark:bg-zinc-850 border-zinc-200 dark:border-white/5 text-zinc-500 hover:border-zinc-300 dark:hover:border-white/10'
                      }`}
                    >
                      {h === 8 ? 'Dia Inteiro' : `${h}h`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pending Demands Count Warning */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Você possui <strong>{pendingTasks.length} tarefas pendentes</strong> cadastradas no diário de hoje para frente.</span>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-zinc-500 hover:bg-zinc-150 dark:hover:bg-white/5 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={generateReliefPlan}
                disabled={pendingTasks.length === 0}
                className="px-5 py-2.5 bg-bujo-highlight text-white rounded-xl text-xs font-semibold hover:opacity-95 transition-opacity disabled:opacity-55 flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Elaborar Plano de Alívio
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* AI Counsel Letter */}
            <div className="p-5 rounded-3xl bg-zinc-200/30 dark:bg-white/5 border border-zinc-200/40 dark:border-white/10 space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-bujo-highlight/5 rounded-full blur-2xl pointer-events-none"></div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-bujo-highlight flex items-center gap-1.5">
                <Heart className="w-4 h-4" /> Carta de Acolhimento da IA
              </h4>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                {isGeneratingCounsel ? (
                  <span className="flex items-center gap-1 text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]"></span>
                    Escrevendo conselho cognitivo...
                  </span>
                ) : counsel}
              </p>
            </div>

            {/* Proposed Task Redistribution List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-indigo-400" /> Proposta de Redistribuição de Agenda
              </h4>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {proposal.map(task => {
                  const formatDate = (dateStr: string) => {
                    const date = new Date(dateStr + 'T00:00:00');
                    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
                  };

                  return (
                    <div key={task.id} className="p-4 rounded-2xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-bujo-text block truncate">{task.content}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Original: {formatDate(task.originalDate)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] text-zinc-500 font-mono">Mover para</span>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="font-mono font-bold text-indigo-400 bg-indigo-500/5 px-2.5 py-1 rounded-xl border border-indigo-500/10">
                          {formatDate(task.proposedDate)}
                        </span>
                        
                        {task.action === 'simplify' && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Simplificar (IA)
                          </span>
                        )}
                        {task.action === 'keep' && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Manter Hoje
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-200/50 dark:border-white/10 mt-2">
              <button
                type="button"
                onClick={() => setStep('inputs')}
                className="px-5 py-2.5 rounded-xl text-zinc-500 hover:bg-zinc-150 dark:hover:bg-white/5 text-xs font-semibold transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleApplyProposal}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/10"
              >
                <Check className="w-4 h-4" /> Confirmar Reorganização
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
