import { useState, useEffect, useRef } from 'react';
import { Shield, Sparkles, Smile, RefreshCw, Edit2, Check, Brain, Flame, Activity, Volume2, Play, Pause, Clock } from 'lucide-react';
import { BujoItem } from '../../../types';
import { useBujo } from '../../../context/BujoContext';
import { SoundType } from '../../../hooks/useAmbientAudio';

interface UserPersonaCardProps {
  userXp: number;
  setUserXp: React.Dispatch<React.SetStateAction<number>>;
  currentEnergy: 'high' | 'low' | 'exhausted';
  anxietyLevel: number;
  showToast: (msg: string) => void;
  items: BujoItem[];
  // Focus audio controls
  soundType: SoundType;
  setSoundType: (type: SoundType) => void;
  toggleAmbientAudio: () => void;
  ambientPlaying: boolean;
  ambientVolume: number;
  setAmbientVolume: (volume: number) => void;
  // Local AI integration
  aiEngine: 'local_llm' | 'local';
  aiWorkerRef: React.MutableRefObject<Worker | null>;
  localLLMState: string;
  getCognitiveLoad: () => number;
}

interface Archetype {
  id: 'zari' | 'lily' | 'eddy' | 'oscar';
  name: string;
  emoji: string;
  defaultTitle: string;
  themeColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  role: string;
}

const archetypes: Archetype[] = [
  {
    id: 'zari',
    name: 'Nezuko 🌸',
    emoji: '🌸',
    defaultTitle: 'Oni Aliada',
    themeColor: 'from-pink-550 to-rose-450',
    textColor: 'text-pink-650 dark:text-pink-400',
    bgColor: 'bg-pink-500/10 hover:bg-pink-500/15',
    borderColor: 'border-pink-500/20',
    role: 'Protetora Silenciosa'
  },
  {
    id: 'lily',
    name: 'Shinobu 🦋',
    emoji: '🦋',
    defaultTitle: 'Hashira do Inseto',
    themeColor: 'from-purple-600 to-indigo-500',
    textColor: 'text-purple-650 dark:text-purple-400',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/15',
    borderColor: 'border-purple-500/20',
    role: 'Gentil & Venenosa'
  },
  {
    id: 'eddy',
    name: 'Rengoku 🔥',
    emoji: '🔥',
    defaultTitle: 'Hashira das Chamas',
    themeColor: 'from-red-500 to-orange-500',
    textColor: 'text-red-650 dark:text-red-400',
    bgColor: 'bg-red-500/10 hover:bg-red-500/15',
    borderColor: 'border-red-500/20',
    role: 'Ardente & Motivador'
  },
  {
    id: 'oscar',
    name: 'Giyu 🌊',
    emoji: '🌊',
    defaultTitle: 'Hashira da Água',
    themeColor: 'from-blue-500 to-cyan-500',
    textColor: 'text-blue-650 dark:text-blue-400',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/15',
    borderColor: 'border-blue-500/20',
    role: 'Estóico & Silencioso'
  }
];

export const UserPersonaCard = ({
  userXp,
  setUserXp,
  currentEnergy,
  anxietyLevel,
  showToast,
  items,
  soundType,
  setSoundType,
  toggleAmbientAudio,
  ambientPlaying,
  ambientVolume,
  setAmbientVolume,
  aiEngine,
  aiWorkerRef,
  localLLMState,
  getCognitiveLoad
}: UserPersonaCardProps) => {
  
  // Custom companion selection state
  const [selectedArchId, setSelectedArchId] = useState<'zari' | 'lily' | 'eddy' | 'oscar'>(() => {
    const saved = localStorage.getItem('bujo_persona_archetype');
    return (saved as any) || 'zari';
  });

  const activeArch = archetypes.find(a => a.id === selectedArchId) || archetypes[0];

  // Customizable name state
  const [customName, setCustomName] = useState<string>(() => {
    const saved = localStorage.getItem('bujo_persona_name');
    return saved || activeArch.name;
  });

  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Self-care counters
  const [waterCount, setWaterCount] = useState<number>(() => {
    const saved = localStorage.getItem('bujo_daily_water');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Guided activity timer states
  const [activeTimer, setActiveTimer] = useState<null | 'stretch' | 'breathe'>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerMax, setTimerMax] = useState<number>(0);
  const [breathPhase, setBreathPhase] = useState<'inspire' | 'hold' | 'expire'>('inspire');

  // AI Interactive state
  const [customAdvice, setCustomAdvice] = useState<string>('');
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState<boolean>(false);

  const { setItems } = useBujo();

  // Active focus timer states
  const [focusTaskId, setFocusTaskId] = useState<string>('');
  const [focusDuration, setFocusDuration] = useState<number>(25);
  const [focusTimerSeconds, setFocusTimerSeconds] = useState<number>(0);
  const [focusTimerActive, setFocusTimerActive] = useState<boolean>(false);

  const level = Math.floor(userXp / 100) + 1;
  const currentLevelXp = userXp % 100;
  const cognitiveLoad = getCognitiveLoad();

  // Metrics extraction to compute evolution/regression trend
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingToday = items.filter(item => item.type === 'task' && item.status === 'open' && item.date === todayStr);
  const overdueTasks = items.filter(item => item.type === 'task' && item.status === 'open' && item.date < todayStr);
  const completedToday = items.filter(item => item.type === 'task' && item.status === 'completed' && item.date === todayStr);

  // Evolving vs Regressing trend logic
  let trend: 'evolving' | 'stable' | 'regressing' = 'stable';
  if (completedToday.length > 0 && overdueTasks.length === 0) {
    trend = 'evolving';
  } else if (overdueTasks.length > 0 && completedToday.length === 0) {
    trend = 'regressing';
  } else if (overdueTasks.length > 3) {
    trend = 'regressing';
  } else if (completedToday.length > overdueTasks.length) {
    trend = 'evolving';
  }

  // Persist archetype choices
  const handleSelectArchetype = (id: 'zari' | 'lily' | 'eddy' | 'oscar') => {
    setSelectedArchId(id);
    localStorage.setItem('bujo_persona_archetype', id);
    const defaultArch = archetypes.find(a => a.id === id);
    const newName = defaultArch?.name || 'Companheiro';
    setCustomName(newName);
    localStorage.setItem('bujo_persona_name', newName);
    setCustomAdvice(''); // Clear any custom generated advice when switching character
    showToast(`Companheiro alterado para ${newName}!`);
  };

  // Persist customized name changes
  const handleSaveName = () => {
    if (customName.trim()) {
      localStorage.setItem('bujo_persona_name', customName.trim());
      setIsEditingName(false);
      showToast(`Nome do seu guia atualizado para "${customName.trim()}"!`);
    }
  };

  // Wellness timer effect
  useEffect(() => {
    let interval: any = null;
    if (activeTimer && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          const next = prev - 1;
          if (activeTimer === 'breathe') {
            if (next > 6) setBreathPhase('inspire');
            else if (next > 4) setBreathPhase('hold');
            else setBreathPhase('expire');
          }
          return next;
        });
      }, 1000);
    } else if (activeTimer && timerSeconds === 0) {
      setUserXp(prev => prev + 5);
      if (activeTimer === 'stretch') {
        showToast('🧘 Alongamento concluído! Corpo relaxado: +5 XP!');
      } else if (activeTimer === 'breathe') {
        showToast('🌬️ Respiração guiada concluída! Cérebro oxigenado: +5 XP!');
      }
      setActiveTimer(null);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer, timerSeconds]);

  // Focus timer effect
  useEffect(() => {
    let interval: any = null;
    if (focusTimerActive && focusTimerSeconds > 0) {
      interval = setInterval(() => {
        setFocusTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (focusTimerActive && focusTimerSeconds === 0) {
      setFocusTimerActive(false);
      setUserXp(prev => prev + 25);
      
      // Mark task as completed
      setItems(prevItems => prevItems.map(item => {
        if (item.id === focusTaskId) {
          return { ...item, status: 'completed' as const };
        }
        return item;
      }));

      showToast(`🎯 Foco Ativo Concluído! Você completou sua tarefa! +25 XP!`);
      setFocusTaskId('');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusTimerActive, focusTimerSeconds, focusTaskId]);

  // Listener to worker messages for custom advice generation
  useEffect(() => {
    const handleWorkerMessage = (e: MessageEvent) => {
      const { type, data, mode } = e.data;
      if (type === 'result' && mode === 'advise' && isGeneratingAdvice) {
        setCustomAdvice(data);
        setIsGeneratingAdvice(false);
        showToast(`💬 ${customName} enviou uma análise cognitiva das suas tarefas!`);
      } else if (type === 'error' && isGeneratingAdvice) {
        setIsGeneratingAdvice(false);
        setCustomAdvice('Tive um problema ao processar seu conselho localmente. Mas estou aqui com você!');
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
  }, [isGeneratingAdvice, customName, aiWorkerRef.current]);

  const startWellnessTimer = (type: 'stretch' | 'breathe') => {
    if (activeTimer) return;
    setActiveTimer(type);
    if (type === 'stretch') {
      setTimerSeconds(15);
      setTimerMax(15);
    } else {
      setTimerSeconds(10);
      setTimerMax(10);
      setBreathPhase('inspire');
    }
  };

  const handleWaterClick = () => {
    if (waterCount >= 8) {
      showToast('💧 Meta diária ideal de água batida! Sensacional.');
      return;
    }
    const nextCount = waterCount + 1;
    setWaterCount(nextCount);
    localStorage.setItem('bujo_daily_water', nextCount.toString());
    setUserXp(prev => prev + 5);
    showToast(`💧 Copo d'água registrado! +5 XP!`);
  };

  const handleResetWater = () => {
    setWaterCount(0);
    localStorage.setItem('bujo_daily_water', '0');
    showToast('💧 Meta de água resetada.');
  };

  // Determine emotional and physical status
  let emotionalStateText = 'Calmo & Estável';
  let emotionalColor = 'text-emerald-500';
  let dynamicEmoji = activeArch.emoji;

  if (anxietyLevel >= 4) {
    emotionalStateText = 'Paralisado / Ansioso';
    emotionalColor = 'text-rose-500';
  } else if (anxietyLevel === 3) {
    emotionalStateText = 'Agitado';
    emotionalColor = 'text-amber-500';
  }

  // Adjust emojis representing trend states
  if (trend === 'evolving') {
    if (activeArch.id === 'zari') dynamicEmoji = '🤩';
    if (activeArch.id === 'lily') dynamicEmoji = '😏';
    if (activeArch.id === 'eddy') dynamicEmoji = '🏆';
    if (activeArch.id === 'oscar') dynamicEmoji = '🍷';
  } else if (trend === 'regressing') {
    if (activeArch.id === 'zari') dynamicEmoji = '🥺';
    if (activeArch.id === 'lily') dynamicEmoji = '🙄';
    if (activeArch.id === 'eddy') dynamicEmoji = '🤕';
    if (activeArch.id === 'oscar') dynamicEmoji = '🤦';
  }

  // Static Fallback Dialogue Generator in character voice
  const getStaticVoiceAdvice = (): string => {
    const overdueCount = overdueTasks.length;
    const completedCount = completedToday.length;

    switch (activeArch.id) {
      case 'zari':
        if (overdueCount > 0) return `Humph! Humph! (Nezuko aponta para as ${overdueCount} tarefas atrasadas preocupada! Vamos focar juntos?) 🌸`;
        if (completedCount > 0) return `Mmm-hmmm! (Nezuko brilha de alegria ao ver suas ${completedCount} conquistas hoje! Continue assim!) ✨`;
        return `Humph! (Nezuko te olha com determinação e cabeça inclinada, pronta para te apoiar!) 🌸`;
      case 'lily':
        if (overdueCount > 0) return `Olá, olá! Que situação curiosa, temos ${overdueCount} pendências acumuladas. Vamos eliminá-las com calma, sem pressa? 🦋`;
        if (completedCount > 0) return `Arra, incrível! Você concluiu ${completedCount} tarefas com a precisão de uma picada. Estou muito impressionada! 🦋`;
        return `Para manter o foco, é preciso respirar fundo e acalmar a mente. Posso te ajudar a preparar o dia? 🦋`;
      case 'eddy':
        if (overdueCount > 0) return `Mantenha o coração ardente! Temos ${overdueCount} pendências a resolver! Não vacile, encare o desafio de frente! 🔥`;
        if (completedCount > 0) return `Magnífico! Você derrotou ${completedCount} obrigações com vigor! Que energia espetacular! Continue queimando sua determinação! 🔥`;
        return `A vida é cheia de batalhas diárias! Coma bem, durma bem e execute suas tarefas com foco total! 🔥`;
      case 'oscar':
        if (overdueCount > 0) return `Não dê aos outros o poder de decidir seu destino. Resolva essas ${overdueCount} tarefas atrasadas de uma vez. 🌊`;
        if (completedCount > 0) return `Você cumpriu com seu dever hoje (${completedCount} concluídas). Bom trabalho. Mas não baixe a guarda ainda. 🌊`;
        return `Foco é silenciar o ruído ao redor. Apenas respire e faça o que precisa ser feito. 🌊`;
    }
    return 'Estou aqui para acompanhar sua evolução!';
  };

  // Local AI generator calling logic
  const handleAskAIAssistant = async () => {
    setIsGeneratingAdvice(true);
    setCustomAdvice('Pensando...');

    const taskSummary = [
      overdueTasks.length > 0 ? `${overdueTasks.length} tarefas atrasadas` : '',
      pendingToday.length > 0 ? `${pendingToday.length} tarefas de hoje` : '',
      completedToday.length > 0 ? `${completedToday.length} concluídas` : ''
    ].filter(Boolean).join(' e ');

    const promptText = `<|im_start|>system
Você é o companheiro cognitivo "${customName}" com a personalidade do personagem de anime "${activeArch.name}" (${activeArch.role}). Fale de forma curta, natural e direta ao usuário em pt-BR.
Contexto: Ansiedade ${anxietyLevel}/5, Energia física "${currentEnergy}", Carga cognitiva ${cognitiveLoad}%, Demandas: ${taskSummary || 'nenhuma tarefa pendente'}.
Escreva um conselho ou comentário no seu tom de voz em no máximo 2 frases. Seja fiel ao seu personagem (Nezuko faz sons de mmm/humph expressivos, Shinobu é gentil mas levemente irônica, Rengoku é ardente/motivado gritante, Giyu é frio/curto). Não adicione saudações como 'Olá'.<|im_end|>
<|im_start|>assistant
`;

    if (aiEngine === 'local_llm' && localLLMState === 'ready' && aiWorkerRef.current) {
      aiWorkerRef.current.postMessage({
        type: 'generate',
        data: { text: promptText, mode: 'advise', maxTokens: 85 }
      });
    } else {
      // Rule-based dictionary fallback
      setTimeout(() => {
        setCustomAdvice(getStaticVoiceAdvice());
        setIsGeneratingAdvice(false);
      }, 600);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentQuote = customAdvice || getStaticVoiceAdvice();

  return (
    <div className="rounded-3xl bg-zinc-200/20 dark:bg-zinc-900/30 border border-zinc-200/30 dark:border-white/5 p-4 flex flex-col gap-3.5 relative overflow-hidden font-mono h-full justify-between">
      {/* Background radial accent */}
      <div className={`absolute -right-16 -top-16 w-32 h-32 rounded-full bg-gradient-to-br ${activeArch.themeColor} opacity-15 blur-2xl pointer-events-none`} />

      {/* Header section with archetype quick selector and Trend badge */}
      <div className="flex items-center justify-between border-b border-zinc-200/20 dark:border-white/5 pb-2">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-bujo-highlight" />
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Guia de Foco</span>
          
          {/* Dynamic Trend Badge */}
          <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider ${
            trend === 'evolving'
              ? 'bg-emerald-600/15 text-emerald-500 border border-emerald-500/20'
              : trend === 'regressing'
              ? 'bg-rose-600/15 text-rose-500 border border-rose-500/20 animate-pulse'
              : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
          }`}>
            {trend === 'evolving' ? '📈 Evoluindo' : trend === 'regressing' ? '📉 Regredindo' : '⚖️ Estável'}
          </span>
        </div>

        {/* Archetype Quick Selector heads */}
        <div className="flex items-center gap-1 bg-zinc-300/10 dark:bg-black/25 p-0.5 rounded-full border border-zinc-250/20 shrink-0">
          {archetypes.map(arch => (
            <button
              key={arch.id}
              onClick={() => handleSelectArchetype(arch.id)}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all cursor-pointer ${
                selectedArchId === arch.id 
                  ? 'bg-bujo-highlight text-white scale-110 shadow' 
                  : 'hover:bg-white/10 opacity-70 hover:opacity-100'
              }`}
              title={`${arch.name} (${arch.role})`}
            >
              {arch.emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch w-full">
        {/* Col 1: Mascot Profile & Speech/AI advice */}
        <div className="flex flex-col justify-between bg-zinc-200/10 dark:bg-white/[0.01] border border-zinc-200/20 dark:border-white/5 p-3 rounded-2xl gap-3">
          {/* Character Profile Section */}
          <div className="flex gap-3 items-center">
            {/* Companion Avatar */}
            <div id="tutorial-mascot" className={`w-14 h-14 rounded-[20px] bg-gradient-to-br ${activeArch.themeColor} p-0.5 shadow-sm flex-shrink-0 animate-bounce-slow`}>
              <div className="w-full h-full rounded-[18px] bg-zinc-100 dark:bg-zinc-955 flex items-center justify-center text-3xl select-none">
                {dynamicEmoji}
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-1 flex-wrap">
                {isEditingName ? (
                  <div className="flex items-center gap-1">
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); }}
                      className="bg-zinc-350 dark:bg-zinc-800 border border-bujo-highlight/40 rounded px-1.5 py-0.5 text-[10px] text-zinc-100 w-24 outline-none font-mono"
                      maxLength={12}
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-1 bg-bujo-highlight text-white rounded cursor-pointer"
                    >
                      <Check className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 group">
                    <span className="font-bold text-xs text-zinc-100 truncate max-w-28">{customName}</span>
                    <button
                      onClick={() => {
                        setIsEditingName(true);
                        setTimeout(() => nameInputRef.current?.focus(), 50);
                      }}
                      className="p-0.5 opacity-0 group-hover:opacity-80 hover:text-bujo-highlight transition-opacity cursor-pointer"
                      title="Editar nome"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
                <span className="px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-bujo-highlight/15 text-bujo-highlight">
                  Lvl {level}
                </span>
              </div>
              <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider leading-none">
                {activeArch.defaultTitle}
              </span>
            </div>
          </div>

          {/* Bubble Advice Box + Interação IA Button */}
          <div className="relative space-y-2 flex-1 flex flex-col justify-end">
            <div className="p-3 bg-zinc-200/40 dark:bg-zinc-950/60 border border-zinc-200/30 dark:border-white/5 rounded-2xl rounded-tl-none text-[11px] text-zinc-300 leading-normal italic flex-1 flex items-center">
              "{isGeneratingAdvice ? 'Consultando demandas do Bullet Journal...' : currentQuote}"
            </div>
            
            {/* IA Demand Analysis Button */}
            <button
              onClick={handleAskAIAssistant}
              disabled={isGeneratingAdvice}
              className="w-full py-1.5 bg-bujo-accent/10 hover:bg-bujo-accent/25 border border-bujo-accent/20 text-bujo-accent dark:text-zinc-300 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3 h-3 ${isGeneratingAdvice ? 'animate-spin' : ''}`} />
              {isGeneratingAdvice ? 'Analisando com IA...' : 'Pedir Análise de Demandas (IA)'}
            </button>
          </div>
        </div>

        {/* Col 2: Active Focus Timer & Stats */}
        <div className="flex flex-col justify-between bg-zinc-200/10 dark:bg-white/[0.01] border border-zinc-200/20 dark:border-white/5 p-3 rounded-2xl gap-3">
          {/* Stats display */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="p-1.5 rounded-xl bg-zinc-200/10 dark:bg-zinc-950/40 border border-zinc-250/20">
              <span className="text-[7.5px] font-bold text-zinc-500 uppercase block">Carga</span>
              <span className={`font-extrabold block truncate ${cognitiveLoad > 70 ? 'text-red-500' : cognitiveLoad > 40 ? 'text-amber-500' : 'text-emerald-500'}`}>{cognitiveLoad}%</span>
            </div>
            <div className="p-1.5 rounded-xl bg-zinc-200/10 dark:bg-zinc-955 border border-zinc-250/20">
              <span className="text-[7.5px] font-bold text-zinc-500 uppercase block">Energia</span>
              <span className="font-extrabold block text-amber-500">
                {currentEnergy === 'high' ? '⚡ Alta' : currentEnergy === 'low' ? '🍃 Média' : '💤 Baixa'}
              </span>
            </div>
            <div className="p-1.5 rounded-xl bg-zinc-200/10 dark:bg-zinc-955 border border-zinc-250/20">
              <span className="text-[7.5px] font-bold text-zinc-500 uppercase block">Atrasos</span>
              <span className={`font-extrabold block ${overdueTasks.length > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{overdueTasks.length}</span>
            </div>
          </div>

          {/* Foco Ativo Section */}
          <div className="p-3 bg-zinc-200/40 dark:bg-zinc-950/60 border border-zinc-200/30 dark:border-white/5 rounded-2xl space-y-2.5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9.5px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-bujo-highlight" /> Foco Ativo 🎯
                </span>
                {focusTimerSeconds > 0 && (
                  <span className="text-xs font-black text-white bg-bujo-highlight/20 px-2 py-0.5 rounded-lg border border-bujo-highlight/30 animate-pulse font-mono">
                    {formatTime(focusTimerSeconds)}
                  </span>
                )}
              </div>

              {/* Dropdown containing open tasks */}
              <select
                value={focusTaskId}
                onChange={(e) => setFocusTaskId(e.target.value)}
                disabled={focusTimerActive}
                className="w-full bg-zinc-300/40 dark:bg-zinc-900/80 border border-zinc-250/20 dark:border-white/5 rounded-xl px-2.5 py-2 text-[10px] text-zinc-300 outline-none cursor-pointer mb-2"
              >
                <option value="">🎯 Escolha uma tarefa para focar...</option>
                {items.filter(item => item.type === 'task' && (item.status === 'open' || item.status === 'scheduled')).map(task => (
                  <option key={task.id} value={task.id}>
                    {task.content.length > 35 ? `${task.content.substring(0, 35)}...` : task.content}
                  </option>
                ))}
              </select>
            </div>

            {/* Timer Controls and Preset */}
            <div className="space-y-2">
              <div className="flex gap-2">
                {!focusTimerActive && (
                  <select
                    value={focusDuration}
                    onChange={(e) => {
                      const mins = parseInt(e.target.value, 10);
                      setFocusDuration(mins);
                      setFocusTimerSeconds(mins * 60);
                    }}
                    disabled={focusTimerActive}
                    className="bg-zinc-300/40 dark:bg-zinc-900/80 border border-zinc-250/20 dark:border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] text-zinc-300 outline-none cursor-pointer shrink-0"
                  >
                    <option value={5}>5m</option>
                    <option value={15}>15m</option>
                    <option value={25}>25m (Pomodoro)</option>
                    <option value={45}>45m</option>
                    <option value={60}>60m</option>
                  </select>
                )}

                {focusTimerActive ? (
                  <div className="flex gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={() => setFocusTimerActive(false)}
                      className="flex-1 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-500 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Pause className="w-3 h-3" /> Pausar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFocusTimerActive(false);
                        setFocusTimerSeconds(0);
                      }}
                      className="flex-1 py-1.5 bg-red-650/20 hover:bg-red-600/30 border border-red-500/30 text-red-500 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center"
                    >
                      Zerar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!focusTaskId) {
                        showToast('Selecione uma tarefa para focar! 🎯');
                        return;
                      }
                      if (focusTimerSeconds === 0) {
                        setFocusTimerSeconds(focusDuration * 60);
                      }
                      setFocusTimerActive(true);
                      if (!ambientPlaying) {
                        toggleAmbientAudio();
                      }
                      showToast('🔥 Foco ativado! Respira fundo e concentre-se.');
                    }}
                    className="w-full py-1.5 bg-bujo-highlight hover:opacity-95 text-white font-bold rounded-xl text-[10px] transition-all cursor-pointer shadow-md shadow-bujo-highlight/15 flex items-center justify-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    {focusTimerSeconds > 0 ? 'Retomar Foco' : 'Iniciar Foco'}
                  </button>
                )}
              </div>

              {/* Focus progress bar */}
              {focusTimerSeconds > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="w-full h-1.5 bg-zinc-300 dark:bg-zinc-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-bujo-highlight transition-all duration-1000"
                      style={{ width: `${(focusTimerSeconds / (focusDuration * 60)) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[8px] text-zinc-500 uppercase font-bold pl-0.5">
                    <span>{formatTime(focusTimerSeconds)} restantes</span>
                    <span>Progresso: {Math.round((focusTimerSeconds / (focusDuration * 60)) * 100)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Guided activities details */}
          {activeTimer && (
            <div className="p-2.5 bg-bujo-highlight/10 border border-bujo-highlight/20 rounded-xl flex items-center justify-between gap-3 text-[10px] animate-fade-in">
              <div className="flex-1 space-y-1">
                <span className="font-bold text-zinc-200">
                  {activeTimer === 'stretch' ? '🧘 Alongando...' : `🌬️ ${breathPhase === 'inspire' ? 'Inspire...' : breathPhase === 'hold' ? 'Segure...' : 'Expire...'}`}
                </span>
                <div className="w-full h-1 bg-zinc-250 dark:bg-zinc-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-bujo-highlight transition-all duration-1000"
                    style={{ width: `${(timerSeconds / timerMax) * 100}%` }}
                  />
                </div>
              </div>
              <button onClick={() => setActiveTimer(null)} className="px-2 py-1 bg-red-650/20 text-red-500 rounded font-bold cursor-pointer text-[9px]">Parar</button>
            </div>
          )}
        </div>

        {/* Col 3: Wellness quick habits & Sounds of Focus */}
        <div className="flex flex-col justify-between bg-zinc-200/10 dark:bg-white/[0.01] border border-zinc-200/20 dark:border-white/5 p-3 rounded-2xl gap-3">
          {/* Wellness habits */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[8.5px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-bujo-highlight" /> Hábitos Rápidos (+5 XP)
              </span>
              {waterCount > 0 && (
                <button onClick={handleResetWater} className="text-[8px] text-zinc-500 hover:text-zinc-350 underline flex items-center gap-0.5 cursor-pointer"><RefreshCw className="w-2 h-2" /> Resetar</button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button type="button" onClick={handleWaterClick} className="py-1.5 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white border border-blue-500/20 rounded-xl text-[9px] font-bold transition-all cursor-pointer flex flex-col items-center">
                <span>💧 Água</span>
                <span className="text-[7.5px] opacity-75">{waterCount}/8</span>
              </button>
              <button type="button" onClick={() => startWellnessTimer('stretch')} disabled={activeTimer !== null} className="py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 rounded-xl text-[9px] font-bold transition-all cursor-pointer flex flex-col items-center disabled:opacity-50">
                <span>🧘 Alongar</span>
                <span className="text-[7.5px] opacity-75">15s</span>
              </button>
              <button type="button" onClick={() => startWellnessTimer('breathe')} disabled={activeTimer !== null} className="py-1.5 bg-purple-500/10 hover:bg-purple-500 text-purple-500 hover:text-white border border-purple-500/20 rounded-xl text-[9px] font-bold transition-all cursor-pointer flex flex-col items-center disabled:opacity-50">
                <span>🌬️ Respirar</span>
                <span className="text-[7.5px] opacity-75">10s</span>
              </button>
            </div>
          </div>

          {/* Merged Focus Partner Sound Player Controls */}
          <div className="border-t border-zinc-250/20 dark:border-white/5 pt-2.5 space-y-1.5">
            <span className="text-[8.5px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-bujo-highlight" /> Sons de Foco (Body Double)
            </span>
            
            <div className="flex flex-col gap-1.5 bg-zinc-200/10 dark:bg-black/25 p-2 rounded-xl border border-zinc-250/20">
              <div className="flex items-center gap-2">
                {/* Play/Pause control */}
                <button
                  onClick={toggleAmbientAudio}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all shrink-0 cursor-pointer ${
                    ambientPlaying 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-zinc-350/30 dark:bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  {ambientPlaying ? 'Pausar' : 'Tocar'}
                </button>

                {/* Sound Selector */}
                <select
                  value={soundType}
                  onChange={(e) => setSoundType(e.target.value as any)}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-250/20 rounded-lg px-1.5 py-1 text-[9px] text-zinc-300 outline-none cursor-pointer"
                >
                  <option value="chuva_lareira">Respiração da Água (Chuva Calmante) 🌊</option>
                  <option value="lofi_jazz">Respiração da Névoa (Jazz Lofi) 🌫️</option>
                  <option value="vento_floresta">Respiração do Inseto (Floresta de Glicínias) 🦋</option>
                  <option value="foco_marrom">Respiração das Chamas (Foco Ardente) 🔥</option>
                  <option value="gurenge_theme">Gurenge Theme (Demon Slayer OP 1) ⚔️</option>
                  <option value="tanjiro_theme">Tanjiro Theme (Kamado Tanjiro no Uta) 🌊</option>
                  <option value="homura_theme">Homura Theme (Mugen Train) 🔥</option>
                </select>
              </div>

              {/* Volume control slider */}
              <div className="flex items-center justify-between gap-2 px-1 text-[8px]">
                <span className="text-zinc-500 uppercase font-bold shrink-0">Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                  className="flex-1 h-0.5 bg-zinc-350 dark:bg-zinc-800 rounded-lg cursor-pointer appearance-none accent-bujo-highlight"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
