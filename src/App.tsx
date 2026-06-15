import { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  ArrowRight, 
  Check, 
  Sparkles, 
  BookOpen, 
  Calendar, 
  Brain,
  X,
  Activity,
  ChevronRight,
  Trash2,
  Plus,
  Download,
  Printer,
  Play,
  Pause,
  RotateCcw,
  Info,
  ChevronDown,
  ChevronUp,
  Settings,
  Sliders,
  CheckSquare,
  Edit,
  FolderOpen,
  FileText,
  Link2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import chaleImg from './assets/chale.jpg';

// Imported Types and Components
import { BujoItem, BujoSettings, Collection, MediaItem, Subtask, AISubtaskSuggestions } from './types';
import { adhdTriggers, maxQuotes, getEnergyY, getEnergyX, getRealTimeSuggestions } from './utils/plannerUtils';
import { Instagram, Twitter } from './components/common/Icons';
import { Toast } from './components/common/Toast';
import { CozyCabinBackground } from './components/common/CozyCabinBackground';
import { TutorialOverlay } from './components/common/TutorialOverlay';
import { RapidLogModal, FloatingActionButton } from './components/common/RapidLog';
import { Header } from './features/planner/components/Header';
import { Sidebar } from './features/planner/components/Sidebar';
import { IndexTab } from './features/planner/components/IndexTab';
import { DailyLogTab } from './features/planner/components/DailyLogTab';
import { WeeklyLogTab } from './features/planner/components/WeeklyLogTab';
import { MonthlyLogTab } from './features/planner/components/MonthlyLogTab';
import { TimelineTab } from './features/planner/components/TimelineTab';
import { OverloadReliefModal } from './features/planner/components/OverloadReliefModal';
import { FutureLogTab } from './features/planner/components/FutureLogTab';
import { BrainDumpStation } from './features/braindump/components/BrainDumpStation';
import { SettingsTab } from './features/settings/components/SettingsTab';
import { CollectionsLibrary } from './features/collections/components/CollectionsLibrary';
import { FocusMode } from './features/focus/components/FocusMode';
import { AISuggestionsModal } from './features/planner/components/AISuggestionsModal';

function App() {
  // --- PERSISTED STATE ---
  const [items, setItems] = useState<BujoItem[]>(() => {
    const saved = localStorage.getItem('bujo_focus_items');
    if (saved) return JSON.parse(saved);
    const today = new Date().toISOString().split('T')[0];
    return [
      { 
        id: '1', 
        type: 'task', 
        status: 'open', 
        content: 'Explorar a barra lateral e configurar o app', 
        date: today,
        subtasks: [
          { id: 's1', content: 'Escolher fonte Dyslexie-friendly nas configurações', completed: true },
          { id: 's2', content: 'Fazer o primeiro despejo de mente (Brain Dump)', completed: false }
        ],
        priority: true
      },
      { 
        id: '2', 
        type: 'task', 
        status: 'completed', 
        content: 'Instalar o BuJo Focus na tela inicial do celular (PWA)', 
        date: today 
      },
      { 
        id: '3', 
        type: 'event', 
        status: 'open', 
        content: 'Sessão de Foco Coletivo de TDAH', 
        date: today, 
        time: '14:30' 
      },
      { 
        id: '4', 
        type: 'note', 
        status: 'open', 
        content: 'Nota: Reduzir atrito cognitivo é a chave para a constância.', 
        date: today 
      }
    ];
  });

  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const [settings, setSettings] = useState<BujoSettings>(() => {
    const saved = localStorage.getItem('bujo_focus_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.theme = 'dark'; // Force dark mode
      if (parsed.font === 'sans' || !parsed.font) {
        parsed.font = 'mono';
      }
      return parsed;
    }
    return {
      theme: 'dark', // Default to dark mode
      font: 'mono',
      highlightColor: '#E08E45',
      accentColor: '#4A7C6C',
      firstTime: true
    };
  });

  // --- LOCAL STATE ---
  const [activeTab, setActiveTab] = useState<'indice' | 'daily_log' | 'weekly_log' | 'monthly_log' | 'daily_spread' | 'future_log' | 'brain_dump' | 'settings' | 'collections'>('indice');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [standardDate, setStandardDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [standardTime, setStandardTime] = useState<string>('');
  const [showOverloadReliefModal, setShowOverloadReliefModal] = useState<boolean>(false);

  // --- CUSTOM COLLECTIONS & LIBRARY ---
  const [collections, setCollections] = useState<any[]>(() => {
    const saved = localStorage.getItem('bujo_collections');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'col-1',
        name: 'Leituras & Estudos',
        description: 'Livros, artigos científicos e documentações para ler e estudar.',
        icon: '📚',
        items: [
          {
            id: 'item-1-1',
            title: 'Construir APIs REST com Quarkus e Panache',
            status: 'todo',
            notes: 'Aprender a usar o ecossistema Quarkus para aplicações Java super rápidas e leves. Focar na extensão RestEasy Reactive e Hibernate ORM com Panache.',
            media: [
              { id: 'media-1-1-1', type: 'link', name: 'Documentação Oficial Quarkus', url: 'https://quarkus.io/guides/' }
            ],
            subtasks: [
              { id: 'sub-1-1-1', content: 'Criar esqueleto do projeto usando o code.quarkus.io', completed: true },
              { id: 'sub-1-1-2', content: 'Configurar banco de dados local com Docker e PostgreSQL', completed: false },
              { id: 'sub-1-1-3', content: 'Criar Entity com PanacheEntityBase', completed: false },
              { id: 'sub-1-1-4', content: 'Implementar endpoints HTTP e testar com RestAssured', completed: false }
            ]
          },
          {
            id: 'item-1-2',
            title: 'Manual Prático de TDAH e Hiperfoco',
            status: 'doing',
            notes: 'Estratégias científicas para gerenciar cegueira temporal, procrastinação e cansaço cognitivo.',
            media: [],
            subtasks: []
          }
        ]
      },
      {
        id: 'col-2',
        name: 'Projetos Criativos',
        description: 'Ideias de design, desenvolvimento e arte.',
        icon: '🎨',
        items: [
          {
            id: 'item-2-1',
            title: 'Mockup do App Bullet Journal Planner',
            status: 'done',
            notes: 'Estilo dark mode premium, com ilustrações animadas no fundo.',
            media: [],
            subtasks: []
          }
        ]
      }
    ];
  });

  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeLLMCollectionItemId, setActiveLLMCollectionItemId] = useState<string | null>(null);

  // Form states for creating collection
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [newColIcon, setNewColIcon] = useState('📚');

  // Form states for creating collection item
  const [newColItemTitle, setNewColItemTitle] = useState('');
  const [newColItemNotes, setNewColItemNotes] = useState('');
  const [decomposingCollectionItemIds, setDecomposingCollectionItemIds] = useState<{ [key: string]: boolean }>({});

  // Autocomplete states for Collections in Daily Log
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteSearch, setAutocompleteSearch] = useState('');
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);

  const filteredCollections = collections.filter(col =>
    col.name.toLowerCase().includes(autocompleteSearch.toLowerCase())
  );

  const selectCollectionAutocomplete = (colName: string) => {
    const lastBracketIndex = standardInput.lastIndexOf('[');
    const newVal = standardInput.substring(0, lastBracketIndex) + `[${colName}] `;
    setStandardInput(newVal);
    setShowAutocomplete(false);
  };

  const handleStandardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStandardInput(val);

    const cursorPosition = e.target.selectionStart;
    if (cursorPosition !== null) {
      const textBeforeCursor = val.substring(0, cursorPosition);
      const lastBracketIndex = textBeforeCursor.lastIndexOf('[');
      
      if (lastBracketIndex !== -1) {
        const textAfterBracket = textBeforeCursor.substring(lastBracketIndex);
        if (!textAfterBracket.includes(']')) {
          const search = textBeforeCursor.substring(lastBracketIndex + 1);
          setAutocompleteSearch(search);
          setShowAutocomplete(true);
          setAutocompleteIndex(0);
          return;
        }
      }
    }
    setShowAutocomplete(false);
  };

  const handleStandardInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showAutocomplete && filteredCollections.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setAutocompleteIndex(prev => (prev + 1) % filteredCollections.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setAutocompleteIndex(prev => (prev - 1 + filteredCollections.length) % filteredCollections.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectCollectionAutocomplete(filteredCollections[autocompleteIndex].name);
      } else if (e.key === 'Escape') {
        setShowAutocomplete(false);
      }
    }
  };

  // Autocomplete states for Collections in Rapid Log
  const [showAutocompleteRapid, setShowAutocompleteRapid] = useState(false);
  const [autocompleteIndexRapid, setAutocompleteIndexRapid] = useState(0);

  const selectCollectionAutocompleteRapid = (colName: string) => {
    const lastBracketIndex = rapidText.lastIndexOf('[');
    const newVal = rapidText.substring(0, lastBracketIndex) + `[${colName}] `;
    setRapidText(newVal);
    setShowAutocompleteRapid(false);
  };

  const handleRapidInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRapidText(val);

    const cursorPosition = e.target.selectionStart;
    if (cursorPosition !== null) {
      const textBeforeCursor = val.substring(0, cursorPosition);
      const lastBracketIndex = textBeforeCursor.lastIndexOf('[');
      
      if (lastBracketIndex !== -1) {
        const textAfterBracket = textBeforeCursor.substring(lastBracketIndex);
        if (!textAfterBracket.includes(']')) {
          const search = textBeforeCursor.substring(lastBracketIndex + 1);
          setAutocompleteSearch(search);
          setShowAutocompleteRapid(true);
          setAutocompleteIndexRapid(0);
          return;
        }
      }
    }
    setShowAutocompleteRapid(false);
  };

  const handleRapidInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showAutocompleteRapid && filteredCollections.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setAutocompleteIndexRapid(prev => (prev + 1) % filteredCollections.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setAutocompleteIndexRapid(prev => (prev - 1 + filteredCollections.length) % filteredCollections.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectCollectionAutocompleteRapid(filteredCollections[autocompleteIndexRapid].name);
      } else if (e.key === 'Escape') {
        setShowAutocompleteRapid(false);
      }
    }
  };

  // Form states for media attachment
  const [mediaLinkName, setMediaLinkName] = useState('');
  const [mediaLinkUrl, setMediaLinkUrl] = useState('');
  const [showAddMediaLink, setShowAddMediaLink] = useState(false);

  // Ambient Sound States
  const [soundType, setSoundType] = useState<'chuva_lareira' | 'lofi_jazz' | 'foco_marrom' | 'vento_floresta'>('chuva_lareira');

  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(0.25);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioSourcesRef = useRef<any[]>([]);

  const startAmbientAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(ambientVolume, ctx.currentTime);
      mainGain.connect(ctx.destination);
      gainNodeRef.current = mainGain;

      // Noise Buffer creation (common for rain, wind, fire, rumble)
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      if (soundType === 'chuva_lareira') {
        // 1. Cozy Rain (Brown noise + Lowpass)
        const rainSource = ctx.createBufferSource();
        rainSource.buffer = noiseBuffer;
        rainSource.loop = true;
        const rainFilter = ctx.createBiquadFilter();
        rainFilter.type = 'lowpass';
        rainFilter.frequency.setValueAtTime(320, ctx.currentTime);
        const rainGain = ctx.createGain();
        rainGain.gain.setValueAtTime(0.5, ctx.currentTime);

        rainSource.connect(rainFilter);
        rainFilter.connect(rainGain);
        rainGain.connect(mainGain);
        rainSource.start();
        audioSourcesRef.current.push(rainSource);

        // 2. Fireplace crackling
        const fireSource = ctx.createBufferSource();
        fireSource.buffer = noiseBuffer;
        fireSource.loop = true;
        const fireFilter = ctx.createBiquadFilter();
        fireFilter.type = 'bandpass';
        fireFilter.frequency.setValueAtTime(70, ctx.currentTime);
        fireFilter.Q.setValueAtTime(1.5, ctx.currentTime);
        const fireGain = ctx.createGain();
        fireGain.gain.setValueAtTime(0.65, ctx.currentTime);

        fireSource.connect(fireFilter);
        fireFilter.connect(fireGain);
        fireGain.connect(mainGain);
        fireSource.start();
        audioSourcesRef.current.push(fireSource);

        // Crackle Pops ScriptProcessor
        const scriptNode = ctx.createScriptProcessor(4096, 0, 1);
        scriptNode.onaudioprocess = (e) => {
          const out = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < out.length; i++) {
            out[i] = 0;
            if (Math.random() < 0.00028) {
              out[i] = (Math.random() * 2 - 1) * 0.35;
            } else if (Math.random() < 0.00095) {
              out[i] = (Math.random() * 2 - 1) * 0.12;
            }
          }
        };
        const crackleGain = ctx.createGain();
        crackleGain.gain.setValueAtTime(0.35, ctx.currentTime);
        scriptNode.connect(crackleGain);
        crackleGain.connect(mainGain);
        audioSourcesRef.current.push(scriptNode);

        // 3. Faint ambient pad
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        const oscFilter = ctx.createBiquadFilter();
        oscFilter.type = 'lowpass';
        oscFilter.frequency.setValueAtTime(140, ctx.currentTime);
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.06, ctx.currentTime);

        osc.connect(oscFilter);
        oscFilter.connect(oscGain);
        oscGain.connect(mainGain);
        osc.start();
        audioSourcesRef.current.push(osc);

        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime); 
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.03, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(oscGain.gain);
        lfo.start();
        audioSourcesRef.current.push(lfo);

      } else if (soundType === 'lofi_jazz') {
        // Lofi Beats Sequencer
        let beatIndex = 0;
        let nextBeatTime = ctx.currentTime;
        const beatLength = 0.45; // ~133 BPM
        const playLofiStep = (c: AudioContext, time: number, bIdx: number, targetGain: GainNode) => {
          if (bIdx === 0 || bIdx === 4) {
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.connect(gain);
            gain.connect(targetGain);
            osc.frequency.setValueAtTime(110, time);
            osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.12);
            gain.gain.setValueAtTime(0.38, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
            osc.start(time);
            osc.stop(time + 0.15);
          }
          if (bIdx === 2 || bIdx === 6) {
            const bSize = 0.08 * c.sampleRate;
            const b = c.createBuffer(1, bSize, c.sampleRate);
            const o = b.getChannelData(0);
            for (let i = 0; i < bSize; i++) o[i] = Math.random() * 2 - 1;
            const src = c.createBufferSource();
            src.buffer = b;
            const flt = c.createBiquadFilter();
            flt.type = 'bandpass';
            flt.frequency.setValueAtTime(1000, time);
            const gn = c.createGain();
            gn.gain.setValueAtTime(0.16, time);
            gn.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
            src.connect(flt);
            flt.connect(gn);
            gn.connect(targetGain);
            src.start(time);
            src.stop(time + 0.1);
          }
          if (bIdx === 0 || bIdx === 4) {
            const notes = bIdx === 0 ? [110, 130.81, 164.81, 196.00] : [146.83, 174.61, 220.00, 261.63];
            notes.forEach(f => {
              const o = c.createOscillator();
              o.type = 'triangle';
              o.frequency.setValueAtTime(f, time);
              const fl = c.createBiquadFilter();
              fl.type = 'lowpass';
              fl.frequency.setValueAtTime(250, time);
              const g = c.createGain();
              g.gain.setValueAtTime(0.0, time);
              g.gain.linearRampToValueAtTime(0.045, time + 0.25);
              g.gain.exponentialRampToValueAtTime(0.001, time + 1.8);
              o.connect(fl);
              fl.connect(g);
              g.connect(targetGain);
              o.start(time);
              o.stop(time + 1.9);
            });
          }
        };

        const intervalId = setInterval(() => {
          while (nextBeatTime < ctx.currentTime + 0.1) {
            playLofiStep(ctx, nextBeatTime, beatIndex, mainGain);
            nextBeatTime += beatLength;
            beatIndex = (beatIndex + 1) % 8;
          }
        }, 50);

        audioSourcesRef.current.push({ stop: () => clearInterval(intervalId), disconnect: () => {} });

        // Add soft fireplace crackles behind lofi
        const crackleSource = ctx.createScriptProcessor(4096, 0, 1);
        crackleSource.onaudioprocess = (e) => {
          const out = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < out.length; i++) {
            out[i] = 0;
            if (Math.random() < 0.00015) out[i] = (Math.random() * 2 - 1) * 0.15;
          }
        };
        const cGain = ctx.createGain();
        cGain.gain.setValueAtTime(0.15, ctx.currentTime);
        crackleSource.connect(cGain);
        cGain.connect(mainGain);
        audioSourcesRef.current.push(crackleSource);

      } else if (soundType === 'foco_marrom') {
        // Pure focus Brownian noise
        const brownSource = ctx.createBufferSource();
        brownSource.buffer = noiseBuffer;
        brownSource.loop = true;
        const brownFilter = ctx.createBiquadFilter();
        brownFilter.type = 'lowpass';
        brownFilter.frequency.setValueAtTime(250, ctx.currentTime); // very deep rumble
        const brownGain = ctx.createGain();
        brownGain.gain.setValueAtTime(0.8, ctx.currentTime);

        brownSource.connect(brownFilter);
        brownFilter.connect(brownGain);
        brownGain.connect(mainGain);
        brownSource.start();
        audioSourcesRef.current.push(brownSource);

      } else if (soundType === 'vento_floresta') {
        // Forest Wind (modulated lowpass) + light rain
        const windSource = ctx.createBufferSource();
        windSource.buffer = noiseBuffer;
        windSource.loop = true;
        const windFilter = ctx.createBiquadFilter();
        windFilter.type = 'bandpass';
        windFilter.Q.setValueAtTime(1.8, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // slow sweep
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(150, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(windFilter.frequency);
        windFilter.frequency.setValueAtTime(300, ctx.currentTime);

        const windGain = ctx.createGain();
        windGain.gain.setValueAtTime(0.35, ctx.currentTime);

        windSource.connect(windFilter);
        windFilter.connect(windGain);
        windGain.connect(mainGain);
        windSource.start();
        lfo.start();
        audioSourcesRef.current.push(windSource, lfo);

        // add light rain
        const rainSource = ctx.createBufferSource();
        rainSource.buffer = noiseBuffer;
        rainSource.loop = true;
        const rainFilter = ctx.createBiquadFilter();
        rainFilter.type = 'lowpass';
        rainFilter.frequency.setValueAtTime(450, ctx.currentTime);
        const rainGain = ctx.createGain();
        rainGain.gain.setValueAtTime(0.2, ctx.currentTime);

        rainSource.connect(rainFilter);
        rainFilter.connect(rainGain);
        rainGain.connect(mainGain);
        rainSource.start();
        audioSourcesRef.current.push(rainSource);
      }
    } catch (e) {
      console.error('Falha ao iniciar som:', e);
    }
  };

  const stopAmbientAudio = () => {
    audioSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {}
      try {
        source.disconnect();
      } catch (e) {}
    });
    audioSourcesRef.current = [];

    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }

    if (audioCtxRef.current) {
      if (audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
      audioCtxRef.current = null;
    }
  };

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(ambientVolume, audioCtxRef.current.currentTime);
    }
  }, [ambientVolume]);

  const toggleAmbientAudio = () => {
    if (ambientPlaying) {
      stopAmbientAudio();
      setAmbientPlaying(false);
      showToast('Som ambiente desativado 🤫');
    } else {
      startAmbientAudio();
      setAmbientPlaying(true);
      const soundLabels = {
        chuva_lareira: 'Chuva e Lareira no Chalé 🌧️🔥',
        lofi_jazz: 'Lofi Jazz Sintetizado 🎹🥁',
        foco_marrom: 'Foco Marrom (Ruído Puro) 🤎💤',
        vento_floresta: 'Vento e Chuva na Floresta 🍃🌧️'
      };
      showToast(`Som ambiente ativado: ${soundLabels[soundType]}`);
    }
  };

  // Force restarting audio if soundType changes while playing
  useEffect(() => {
    if (ambientPlaying) {
      stopAmbientAudio();
      startAmbientAudio();
    }
  }, [soundType]);

  useEffect(() => {
    return () => {
      stopAmbientAudio();
    };
  }, []);
  
  // Rapid Log Modal State
  const [showRapidLog, setShowRapidLog] = useState(false);
  const [rapidText, setRapidText] = useState('');
  const [rapidType, setRapidType] = useState<'task' | 'event' | 'note'>('task');
  const [rapidTime, setRapidTime] = useState('');
  const [rapidPriority, setRapidPriority] = useState(false);

  // Focus Mode & Pomodoro State
  const [focoActive, setFocoActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'break'>('work');

  // Brain Dump Input State
  const [brainDumpText, setBrainDumpText] = useState('');
  const [brainDumpResult, setBrainDumpResult] = useState<{
    tasks: BujoItem[];
    events: BujoItem[];
    notes: BujoItem[];
    emotion: string;
  } | null>(null);
  const [isProcessingBrainDump, setIsProcessingBrainDump] = useState(false);

  // Future Log month active selector
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [futureLogEventContent, setFutureLogEventContent] = useState('');

  // Daily log input states (standard non-modal logging)
  const [standardInput, setStandardInput] = useState('');
  const [standardType, setStandardType] = useState<'task' | 'event' | 'note'>('task');

  // Time scheduler selector
  const [selectedHourToSchedule, setSelectedHourToSchedule] = useState<number | null>(null);

  // Timeline quick insert state
  const [timelineInput, setTimelineInput] = useState('');
  const [newHourTaskContent, setNewHourTaskContent] = useState('');
  const [newHourTaskType, setNewHourTaskType] = useState<'task' | 'event'>('task');
  const [timelineMobileView, setTimelineMobileView] = useState<'timeline' | 'unscheduled'>('timeline');

  // AI Cognitive reality task suggestions
  const [aiSuggestions, setAiSuggestions] = useState<{
    taskId: string;
    content: string;
    suggestions: AISubtaskSuggestions;
  } | null>(null);

  const [customSteps, setCustomSteps] = useState<{
    high: { text: string; enabled: boolean }[];
    low: { text: string; enabled: boolean }[];
    unlock: { text: string; enabled: boolean }[];
  } | null>(null);

  // Tutorial overlay state
  const [showTutorial, setShowTutorial] = useState(settings.firstTime);

  // Gamification & XP System
  const [userXp, setUserXp] = useState<number>(() => {
    const saved = localStorage.getItem('bujo_focus_xp');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [currentMaxQuote, setCurrentMaxQuote] = useState<string>(() => {
    return maxQuotes[0];
  });

  const handleAskMaxForQuote = () => {
    const randomIdx = Math.floor(Math.random() * maxQuotes.length);
    setCurrentMaxQuote(maxQuotes[randomIdx]);
    showToast('💬 Max enviou um conselho de foco!');
  };

  const [aiEngine, setAiEngine] = useState<'local_llm' | 'local'>(() => {
    const saved = localStorage.getItem('bujo_ai_engine');
    if (saved === 'local') return 'local';
    return 'local_llm';
  });

  // Local Browser-run LLM Worker States (Transformers.js)
  const aiWorkerRef = useRef<Worker | null>(null);
  const [localLLMState, setLocalLLMState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [localLLMProgress, setLocalLLMProgress] = useState<{ [key: string]: number }>({});
  const [localLLMError, setLocalLLMError] = useState<string>('');
  const [, setActiveLLMSplitTaskId] = useState<string | null>(null);
  const [isOptimizingTask, setIsOptimizingTask] = useState(false);

  // Background Video Ref for dark mode
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fadingOutRef = useRef<boolean>(false);

  // Video looping engine for dark mode
  const animateOpacity = (targetOpacity: number, duration: number, callback?: () => void) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    const video = videoRef.current;
    if (!video) return;

    const startOpacity = parseFloat(video.style.opacity || '0');
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentOpacity = startOpacity + (targetOpacity - startOpacity) * progress;
      video.style.opacity = currentOpacity.toString();

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        animationFrameRef.current = null;
        if (callback) callback();
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const remainingTime = video.duration - video.currentTime;
    if (remainingTime <= 0.55 && !fadingOutRef.current) {
      fadingOutRef.current = true;
      animateOpacity(0, 500);
    }
  };

  const handleEnded = () => {
    const video = videoRef.current;
    if (!video) return;

    video.style.opacity = '0';
    setTimeout(() => {
      fadingOutRef.current = false;
      video.currentTime = 0;
      video.play()
        .then(() => {
          animateOpacity(1, 500);
        })
        .catch((err) => {
          console.error("Video loop autoplay failed:", err);
          animateOpacity(1, 500);
        });
    }, 100);
  };

  const handleLoadedData = () => {
    const video = videoRef.current;
    if (!video) return;
    video.style.opacity = '0';
    video.play()
      .then(() => {
        animateOpacity(1, 500);
      })
      .catch((err) => {
        console.error("Video autoplay on load failed:", err);
        animateOpacity(1, 500);
      });
  };

  useEffect(() => {
    if (settings.theme === 'dark') {
      const video = videoRef.current;
      if (video) {
        video.style.opacity = '0';
        if (video.readyState >= 2) {
          video.play()
            .then(() => {
              animateOpacity(1, 500);
            })
            .catch((err) => console.log("Video looper delayed setup:", err));
        }
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [settings.theme]);

  // Item Editing States and Handlers
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemContent, setEditingItemContent] = useState<string>('');

  const handleStartEditItem = (id: string, initialContent: string) => {
    setEditingItemId(id);
    setEditingItemContent(initialContent);
  };

  const handleSaveEditItem = (id: string) => {
    if (!editingItemContent.trim()) {
      showToast('O conteúdo não pode estar vazio!');
      return;
    }
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, content: editingItemContent.trim() };
      }
      return item;
    }));
    setEditingItemId(null);
    setEditingItemContent('');
    showToast('Item atualizado com sucesso!');
  };

  useEffect(() => {
    localStorage.setItem('bujo_ai_engine', aiEngine);
    // Auto-initialize worker if user selects it
    if (aiEngine === 'local_llm' && localLLMState === 'idle') {
      initLocalLLMWorker();
    }
  }, [aiEngine]);

  const initLocalLLMWorker = () => {
    if (aiWorkerRef.current) return;

    setLocalLLMState('loading');
    setLocalLLMError('');
    setLocalLLMProgress({});

    try {
      const worker = new Worker(new URL('./ai.worker.ts', import.meta.url), { type: 'module' });

      worker.onmessage = (e: MessageEvent) => {
        const { type, data } = e.data;

        if (type === 'progress') {
          setLocalLLMProgress(prev => ({
            ...prev,
            [data.file]: data.progress
          }));
        } else if (type === 'file_ready') {
          setLocalLLMProgress(prev => ({
            ...prev,
            [data.file]: 100
          }));
        } else if (type === 'ready') {
          setLocalLLMState('ready');
          showToast('🤖 IA Local no Browser carregada com sucesso!');
        } else if (type === 'error') {
          setLocalLLMState('error');
          setLocalLLMError(data);
          showToast(`Erro na IA Local: ${data}`);
          setBreakingTaskIds({});
        } else if (type === 'result') {
          const resultText = data;
          const mode = e.data.mode || 'split';

          if (mode === 'advise') {
            return;
          }

          if (mode === 'optimize') {
            setActiveLLMSplitTaskId(currentTaskId => {
              if (currentTaskId) {
                setItems(prev => prev.map(item => {
                  if (item.id === currentTaskId) {
                    return { ...item, content: resultText };
                  }
                  return item;
                }));
                setAiSuggestions(prev => prev ? { ...prev, content: resultText } : null);
              }
              return null;
            });
            setIsOptimizingTask(false);
            setBreakingTaskIds({});
            showToast('Descrição otimizada pela IA local!');
            return;
          }

          setActiveLLMSplitTaskId(currentTaskId => {
            if (currentTaskId) {
              const originalItem = itemsRef.current.find(item => item.id === currentTaskId);
              const originalContent = originalItem ? originalItem.content : '';

              const rawSteps = resultText
                .split('\n')
                .map((l: string) => l.replace(/^[-*•\d.\s]+/, '').trim())
                .filter(Boolean);
              const steps = Array.from(new Set(rawSteps)) as string[];

              const high = steps;
              const low = steps.slice(0, Math.min(3, Math.max(1, Math.floor(steps.length / 2))));
              const unlock = steps.length > 0 ? [steps[0]] : ['Apenas começar por 1 minuto'];

              setAiSuggestions({
                taskId: currentTaskId,
                content: originalContent,
                suggestions: { high, low, unlock }
              });

              setCustomSteps({
                high: high.map((t: string) => ({ text: t, enabled: true })),
                low: low.map((t: string) => ({ text: t, enabled: true })),
                unlock: unlock.map((t: string) => ({ text: t, enabled: true }))
              });

              showToast('Sugestões geradas pela IA local no browser!');
            }
            return null;
          });

          setActiveLLMCollectionItemId(currentItemId => {
            if (currentItemId) {
              const rawSteps = resultText
                .split('\n')
                .map((l: string) => l.replace(/^[-*•\d.\s]+/, '').trim())
                .filter(Boolean);
              const steps = Array.from(new Set(rawSteps)) as string[];

              setCollections(prevCollections => {
                return prevCollections.map(col => {
                  return {
                    ...col,
                    items: col.items.map((item: any) => {
                      if (item.id === currentItemId) {
                        const newSubtasks = [
                          ...(item.subtasks || []),
                          ...steps.map((step: string, idx: number) => ({
                            id: `col-sub-${Date.now()}-${idx}-${Math.random()}`,
                            content: step,
                            completed: false
                          }))
                        ];
                        return { ...item, subtasks: newSubtasks };
                      }
                      return item;
                    })
                  };
                });
              });
              showToast('Micro-tarefas geradas pela IA local!');
            }
            return null;
          });

          setBreakingTaskIds({});
          setDecomposingCollectionItemIds({});
        }
      };

      worker.postMessage({ type: 'load' });
      aiWorkerRef.current = worker;
    } catch (err: any) {
      setLocalLLMState('error');
      setLocalLLMError(err.message || err);
      showToast('Erro ao inicializar o Worker de IA.');
      setBreakingTaskIds({});
    }
  };

  useEffect(() => {
    return () => {
      if (aiWorkerRef.current) {
        aiWorkerRef.current.terminate();
        aiWorkerRef.current = null;
      }
    };
  }, []);



  const appendBrainDumpTrigger = (trigger: string) => {
    setBrainDumpText(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n${trigger}` : trigger;
    });
    showToast(`"${trigger}" adicionado ao despejo!`);
  };

  const renderRealTimeSuggestions = (
    text: string,
    inputType: 'task' | 'event' | 'note',
    onSelectSuggestion: (subtasks: string[]) => void
  ) => {
    const sug = getRealTimeSuggestions(text);
    if (!sug || inputType !== 'task') return null;

    return (
      <div className="mt-2 p-3.5 rounded-xl border border-bujo-accent/20 bg-bujo-accent/[0.03] dark:bg-bujo-accent/[0.05] backdrop-blur-sm animate-fade-in text-xs space-y-2 text-bujo-text relative z-10 no-print shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-bujo-accent uppercase tracking-widest flex items-center gap-1">
            <span>🧠</span> Copiloto TDAH (Sugerido: {sug.category})
          </span>
          <span className="text-[9px] text-zinc-500 font-mono">Micro-passos prontos</span>
        </div>

        <div className="space-y-1 pl-1">
          {sug.subtasks.map((step: string, index: number) => (
            <div key={index} className="flex items-center gap-1.5 text-[10px] text-zinc-600 dark:text-zinc-300">
              <span className="text-bujo-accent font-bold">•</span>
              <span>{step}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onSelectSuggestion(sug.subtasks)}
          className="w-full py-1.5 bg-bujo-accent/15 hover:bg-bujo-accent/25 text-bujo-accent text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 text-white"
        >
          <span>✨</span> Criar tarefa com estes micro-passos acoplados
        </button>
      </div>
    );
  };
  const createStandardTaskWithSuggestions = (subtasks: string[]) => {
    if (!standardInput.trim()) return;
    const newItem: BujoItem = {
      id: Math.random().toString(),
      type: 'task',
      status: 'open',
      content: standardInput.trim(),
      date: new Date().toISOString().split('T')[0],
      subtasks: subtasks.map(s => ({ id: Math.random().toString(), content: s, completed: false }))
    };
    setItems(prev => [newItem, ...prev]);
    setStandardInput('');
    setExpandedTaskId(newItem.id);
    showToast('Adicionado com micro-passos!');
  };

  const createTimelineTaskWithSuggestions = (subtasks: string[]) => {
    if (!timelineInput.trim()) return;
    const newItem: BujoItem = {
      id: Math.random().toString(),
      type: 'task',
      status: 'open',
      content: timelineInput.trim(),
      date: new Date().toISOString().split('T')[0],
      subtasks: subtasks.map(s => ({ id: Math.random().toString(), content: s, completed: false }))
    };
    setItems(prev => [newItem, ...prev]);
    setTimelineInput('');
    setExpandedTaskId(newItem.id);
    showToast('Adicionado com micro-passos!');
  };

  const createScheduledTaskWithSuggestions = (subtasks: string[]) => {
    if (!newHourTaskContent.trim() || selectedHourToSchedule === null) return;
    const timeStr = `${selectedHourToSchedule.toString().padStart(2, '0')}:00`;
    const newItem: BujoItem = {
      id: Math.random().toString(),
      type: 'task',
      status: 'scheduled',
      content: newHourTaskContent.trim(),
      date: new Date().toISOString().split('T')[0],
      time: timeStr,
      subtasks: subtasks.map(s => ({ id: Math.random().toString(), content: s, completed: false }))
    };
    setItems(prev => [newItem, ...prev]);
    setNewHourTaskContent('');
    setSelectedHourToSchedule(null);
    setExpandedTaskId(newItem.id);
    showToast(`Agendado para às ${timeStr} com micro-passos!`);
  };

  const createRapidTaskWithSuggestions = (subtasks: string[]) => {
    if (!rapidText.trim()) return;
    const newItem: BujoItem = {
      id: Math.random().toString(),
      type: 'task',
      status: 'open',
      content: rapidText.trim(),
      date: new Date().toISOString().split('T')[0],
      priority: rapidPriority,
      time: rapidTime || undefined,
      subtasks: subtasks.map(s => ({ id: Math.random().toString(), content: s, completed: false }))
    };
    setItems(prev => [newItem, ...prev]);
    setRapidText('');
    setRapidTime('');
    setRapidPriority(false);
    setShowRapidLog(false);
    setExpandedTaskId(newItem.id);
    showToast('Adicionado com micro-passos!');
  };

  // ADHD and Anxiety Dashboard States
  const [completedPomodoros, setCompletedPomodoros] = useState<number>(() => {
    const saved = localStorage.getItem('bujo_focus_completed_pomodoros');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [currentEnergy, setCurrentEnergy] = useState<'high' | 'low' | 'exhausted'>(() => {
    const saved = localStorage.getItem('bujo_focus_current_energy');
    return (saved as any) || 'high';
  });

  const [anxietyLevel, setAnxietyLevel] = useState<number>(() => {
    const saved = localStorage.getItem('bujo_focus_anxiety_level');
    return saved ? parseInt(saved, 10) : 2;
  });

  // Hover state for interactive task/energy chart tooltips
  const [hoveredChartItem, setHoveredChartItem] = useState<{
    item: BujoItem;
    x: number;
    y: number;
  } | null>(null);

  // Toggle for showing the "Como usar o Ritmo?" interactive explanation guide
  const [showEnergyGuide, setShowEnergyGuide] = useState(false);

  const getHarmonyScore = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = items.filter(item => item.date === today && item.type === 'task' && item.time);
    if (todayTasks.length === 0) return null;
    
    let totalScore = 0;
    todayTasks.forEach(task => {
      const [h] = task.time!.split(':').map(Number);
      if (h >= 9.5 && h < 13) {
        totalScore += 100;
      } else if (h >= 13 && h < 16) {
        totalScore += task.priority ? 30 : 65;
      } else if (h >= 16 && h < 20) {
        totalScore += 90;
      } else {
        totalScore += 50;
      }
    });
    return Math.round(totalScore / todayTasks.length);
  };

  const getHarmonyRecommendation = (score: number | null) => {
    if (score === null) return "Agende horários para suas tarefas hoje para receber recomendações personalizadas de ritmo.";
    if (score >= 80) return "Sincronização Perfeita! 🎉 Suas tarefas mais importantes estão alinhadas com seus picos de energia.";
    if (score >= 55) return "Harmonia Razoável. ⚖️ Você tem algumas tarefas complexas agendadas em períodos de queda de energia (como o crash da tarde). Se possível, mova-as para a manhã.";
    return "Harmonia Baixa. ⚠️ Muitas tarefas importantes estão marcadas nos seus momentos de menor energia (ex: crash pós-almoço). Reorganize para evitar exaustão e procrastinação!";
  };

  const getCognitiveLoad = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayItems = items.filter(i => i.date === today);
    const openTasks = todayItems.filter(i => i.type === 'task' && i.status === 'open').length;
    const openEvents = todayItems.filter(i => i.type === 'event' && i.status === 'open').length;
    const completedTasks = todayItems.filter(i => i.type === 'task' && i.status === 'completed').length;
    
    const baseLoad = (openTasks * 20) + (openEvents * 15) + (anxietyLevel * 12);
    const relief = (completedTasks * 25) + (completedPomodoros * 10) + (brainDumpText ? 15 : 0);
    const load = Math.max(10, Math.min(95, baseLoad - relief));
    return Math.round(load);
  };

  // Subtask adding inline states
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [breakingTaskIds, setBreakingTaskIds] = useState<{ [key: string]: boolean }>({});

  // --- SYNC EFFECTS ---
  useEffect(() => {
    localStorage.setItem('bujo_focus_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('bujo_collections', JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem('bujo_focus_completed_pomodoros', completedPomodoros.toString());
  }, [completedPomodoros]);

  useEffect(() => {
    localStorage.setItem('bujo_focus_xp', userXp.toString());
  }, [userXp]);

  useEffect(() => {
    localStorage.setItem('bujo_focus_current_energy', currentEnergy);
  }, [currentEnergy]);

  useEffect(() => {
    localStorage.setItem('bujo_focus_anxiety_level', anxietyLevel.toString());
  }, [anxietyLevel]);

  useEffect(() => {
    const root = document.documentElement;
    document.body.classList.add('dark-theme');
    root.style.setProperty('--bujo-bg', '#040707'); // Deep cozy forest night obsidian green-black
    root.style.setProperty('--bujo-text', '#e2e8f0');
    root.style.setProperty('--bujo-highlight', settings.highlightColor);
    root.style.setProperty('--bujo-accent', settings.accentColor);
    localStorage.setItem('bujo_focus_settings', JSON.stringify({ ...settings, theme: 'dark' }));
  }, [settings]);



  // Pomodoro ticking effect
  useEffect(() => {
    let interval: any = null;
    if (pomodoroRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(prev => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setPomodoroRunning(false);
      playBeep();
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      
      if (pomodoroMode === 'work') {
        showToast('🎯 Bloco de Trabalho Concluído! Descanse um pouco.');
        setCompletedPomodoros(prev => prev + 1);
        setUserXp(prevXp => {
          const nextXp = prevXp + 50;
          showToast('🎯 Hiperfoco Concluído: +50 XP!');
          return nextXp;
        });
        setPomodoroMode('break');
        setPomodoroTime(5 * 60);
      } else {
        showToast('⚡ Descanso Concluído! Hora de focar.');
        setPomodoroMode('work');
        setPomodoroTime(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [pomodoroRunning, pomodoroTime, pomodoroMode]);

  // --- UTILS ---
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime); // E5 note
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.error("Audio Context blocked by browser permission.", e);
    }
  };

  // --- ACTIONS ---
  
  // Rapid log save
  const handleSaveRapidLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rapidText.trim()) return;

    const newItem: BujoItem = {
      id: Math.random().toString(),
      type: rapidType,
      status: 'open',
      content: rapidText.trim(),
      date: new Date().toISOString().split('T')[0],
      time: rapidTime || undefined,
      priority: rapidPriority,
      subtasks: rapidType === 'task' ? [] : undefined
    };

    setItems(prev => [newItem, ...prev]);
    setRapidText('');
    setRapidTime('');
    setRapidPriority(false);
    setShowRapidLog(false);
    showToast('Entrada salva com sucesso!');
  };

  // Inline standard input save
  const handleSaveStandardInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!standardInput.trim()) return;

    const content = standardInput.trim();
    const newItem: BujoItem = {
      id: Math.random().toString(),
      type: standardType,
      status: 'open',
      content: content,
      date: standardDate || selectedDate,
      time: standardTime || undefined,
      subtasks: standardType === 'task' ? [] : undefined
    };

    // Check for collection sync: [Collection Name] some task
    const collectionMatch = content.match(/^\[(.*?)\]\s*(.*)/);
    if (collectionMatch && standardType === 'task') {
      const colName = collectionMatch[1];
      const taskContent = collectionMatch[2];
      
      let found = false;
      setCollections(prev => prev.map(col => {
        if (col.name.toLowerCase() === colName.toLowerCase()) {
          found = true;
          const newColItem = {
            id: `item-${Date.now()}-${Math.random()}`,
            title: taskContent || colName,
            status: 'todo',
            notes: `Adicionado via Daily Log em ${new Date().toLocaleDateString()}`,
            media: [],
            subtasks: []
          };
          return {
            ...col,
            items: [...col.items, newColItem]
          };
        }
        return col;
      }));

      if (found) {
        showToast(`Adicionado ao Daily Log e à coleção "${colName}"!`);
      } else {
        showToast('Adicionado ao Daily Log!');
      }
    } else {
      showToast('Adicionado ao Daily Log!');
    }

    setItems(prev => [newItem, ...prev]);
    setStandardInput('');
    setStandardTime('');
  };

  // Timeline quick insert handler
  const handleTimelineAddInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timelineInput.trim()) return;

    const newItem: BujoItem = {
      id: Math.random().toString(),
      type: 'task',
      status: 'open',
      content: timelineInput.trim(),
      date: new Date().toISOString().split('T')[0],
      subtasks: []
    };

    setItems(prev => [newItem, ...prev]);
    setTimelineInput('');
    showToast('Tarefa pendente adicionada!');
  };

  // Create and schedule task directly from timeline hour modal
  const handleCreateAndSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHourTaskContent.trim() || selectedHourToSchedule === null) return;

    const timeStr = `${selectedHourToSchedule.toString().padStart(2, '0')}:00`;
    const newItem: BujoItem = {
      id: Math.random().toString(),
      type: newHourTaskType,
      status: 'scheduled',
      content: newHourTaskContent.trim(),
      date: new Date().toISOString().split('T')[0],
      time: timeStr,
      subtasks: newHourTaskType === 'task' ? [] : undefined
    };

    setItems(prev => [newItem, ...prev]);
    setNewHourTaskContent('');
    setSelectedHourToSchedule(null);
    showToast(`Criado e agendado para às ${timeStr}`);
  };

  // Cycle status of tasks
  const cycleStatus = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        let nextStatus: BujoItem['status'] = 'open';
        if (item.status === 'open') {
          nextStatus = 'completed';
          setUserXp(prevXp => {
            const nextXp = prevXp + 20;
            showToast('✨ Conquista! Tarefa concluída: +20 XP');
            return nextXp;
          });
        }
        else if (item.status === 'completed') {
          nextStatus = 'migrated';
          setUserXp(prevXp => {
            const nextXp = Math.max(0, prevXp - 20);
            showToast('↩️ Tarefa desmarcada: -20 XP');
            return nextXp;
          });
        }
        else if (item.status === 'migrated') nextStatus = 'scheduled';
        else if (item.status === 'scheduled') nextStatus = 'open';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  // Schedule task on timeline hour
  const assignItemToTime = (itemId: string, timeStr: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, time: timeStr, status: 'scheduled' };
      }
      return item;
    }));
    setSelectedHourToSchedule(null);
    showToast(`Tarefa agendada para às ${timeStr}`);
  };

  // Unassign task from timeline hour
  const unassignItemFromTime = (itemId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, time: undefined, status: 'open' };
      }
      return item;
    }));
    showToast('Horário removido');
  };

  // Delete item entirely
  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    showToast('Entrada excluída');
  };

  // smart subtask adding
  const addSubtask = (taskId: string) => {
    if (!newSubtaskText.trim()) return;
    setItems(prev => prev.map(item => {
      if (item.id === taskId) {
        const sub = item.subtasks || [];
        return {
          ...item,
          subtasks: [...sub, { id: Math.random().toString(), content: newSubtaskText.trim(), completed: false }]
        };
      }
      return item;
    }));
    setNewSubtaskText('');
  };

  // Toggle subtask checkbox
  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === taskId && item.subtasks) {
        return {
          ...item,
          subtasks: item.subtasks.map(s => {
            if (s.id === subtaskId) {
              const nextVal = !s.completed;
              if (nextVal) {
                setUserXp(prevXp => {
                  const nextXp = prevXp + 5;
                  showToast('⚡ Micro-passo vencido: +5 XP');
                  return nextXp;
                });
              } else {
                setUserXp(prevXp => {
                  const nextXp = Math.max(0, prevXp - 5);
                  showToast('↩️ Micro-passo desmarcado: -5 XP');
                  return nextXp;
                });
              }
              return { ...s, completed: nextVal };
            }
            return s;
          })
        };
      }
      return item;
    }));
  };

  // Delete subtask
  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === taskId && item.subtasks) {
        return {
          ...item,
          subtasks: item.subtasks.filter(s => s.id !== subtaskId)
        };
      }
      return item;
    }));
    showToast('Micro-tarefa removida');
  };

  // AI optimize task description to make it concrete and action-oriented
  const handleAIOptimizeTask = async (taskId: string, content: string) => {
    setIsOptimizingTask(true);
    showToast('Otimizando descrição da tarefa...');

    if (aiEngine === 'local_llm') {
      if (localLLMState !== 'ready') {
        initLocalLLMWorker();
        showToast('IA Local carregando... Aguarde.');
        setIsOptimizingTask(false);
        setActiveTab('settings');
        return;
      }
      setActiveLLMSplitTaskId(taskId);
      if (aiWorkerRef.current) {
        aiWorkerRef.current.postMessage({
          type: 'generate',
          data: { text: content, mode: 'optimize' }
        });
      }
      return;
    }

    let optimized = '';
      // Fallback
      const lower = content.toLowerCase();
      if (lower.includes('limpar') || lower.includes('arrumar')) {
        optimized = 'Organizar um cômodo específico e recolher 5 itens espalhados';
      } else if (lower.includes('estudar') || lower.includes('ler')) {
        optimized = 'Revisar 1 tópico ou ler 3 páginas do material de estudo';
      } else if (lower.includes('trabalhar') || lower.includes('fazer')) {
        optimized = 'Escrever os tópicos principais ou rascunho de 1 item pendente';
      } else {
        optimized = `Focar nos primeiros 5 minutos de: ${content}`;
      }

    setItems(prev => prev.map(item => {
      if (item.id === taskId) {
        return { ...item, content: optimized };
      }
      return item;
    }));

    setAiSuggestions(prev => prev ? { ...prev, content: optimized } : null);
    setIsOptimizingTask(false);
    showToast('Descrição da tarefa otimizada com sucesso!');
  };

  // Local AI split microtasks (using Local LLM in browser worker first, fallback to dictionary)
  const handleAISplitTask = async (taskId: string, content: string, refinementText?: string) => {
    setBreakingTaskIds(prev => ({ ...prev, [taskId]: true }));
    showToast('IA analisando e elaborando sugestões cognitivas...');

    let promptInput = content;
    if (refinementText && refinementText.trim()) {
      promptInput = `${content} (Instrução especial: ${refinementText.trim()})`;
    }

    if (aiEngine === 'local_llm') {
      if (localLLMState !== 'ready') {
        initLocalLLMWorker();
        showToast('IA Local carregando... Aguarde o download do modelo (~350MB, apenas na primeira vez).');
        setBreakingTaskIds(prev => ({ ...prev, [taskId]: false }));
        setActiveTab('settings');
        setTimeout(() => {
          const el = document.getElementById('local-llm-activation-center');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return;
      }

      setActiveLLMSplitTaskId(taskId);
      if (aiWorkerRef.current) {
        aiWorkerRef.current.postMessage({
          type: 'generate',
          data: { text: promptInput }
        });
      }
      return;
    }

    let high: string[] = [];
    let low: string[] = [];
    let unlock: string[] = [];
      const lower = content.toLowerCase();
      const refLower = (refinementText || '').toLowerCase();
      
      let baseHigh: string[] = [];
      let baseLow: string[] = [];
      let baseUnlock: string[] = [];

      if (lower.includes('limpar') || lower.includes('casa') || lower.includes('quarto') || lower.includes('cozinha') || lower.includes('arrumar')) {
        baseHigh = ['Separar pano, vassoura e desinfetante', 'Recolher lixo e pratos sujos', 'Varrer o chão do cômodo', 'Passar pano úmido', 'Devolver objetos aos locais corretos'];
        baseLow = ['Juntar todo o lixo visível em uma sacola', 'Varrer rápido o centro do cômodo', 'Passar um pano básico nas bancadas principais'];
        baseUnlock = ['Apenas juntar as roupas jogadas no chão e colocar no cesto (2 min)'];
      } else if (lower.includes('estudar') || lower.includes('revisar') || lower.includes('ler') || lower.includes('prova')) {
        baseHigh = ['Desligar notificações do celular', 'Escolher um sub-tópico específico', 'Ler por 15 minutos focados', 'Escrever um resumo em 3 frases', 'Resolver 3 questões práticas'];
        baseLow = ['Sentar na mesa de estudos com o caderno aberto', 'Ler 2 páginas do material de referência', 'Escrever 1 frase sobre o que lembrou'];
        baseUnlock = ['Apenas abrir o livro ou PDF na página do assunto (1 min)'];
      } else if (lower.includes('comprar') || lower.includes('mercado') || lower.includes('feira')) {
        baseHigh = ['Olhar o que falta na despensa e geladeira', 'Anotar lista agrupada por corredor', 'Definir limite de gastos', 'Ir ao supermercado ou feira', 'Guardar tudo ao retornar'];
        baseLow = ['Checar a geladeira rápido', 'Anotar 5 itens essenciais', 'Fazer o pedido rápido pelo aplicativo'];
        baseUnlock = ['Abrir a geladeira e tirar foto das prateleiras para checar o que falta (1 min)'];
      } else if (lower.includes('relatório') || lower.includes('trabalho') || lower.includes('enviar') || lower.includes('email') || lower.includes('projeto')) {
        baseHigh = ['Abrir o arquivo principal do projeto', 'Escrever apenas o título e sumário', 'Preencher os pontos chaves em tópicos', 'Escrever uma introdução simples', 'Revisar e anexar/enviar'];
        baseLow = ['Abrir o documento e escrever o título principal', 'Digitar 3 tópicos gerais sobre o assunto', 'Salvar o rascunho inicial'];
        baseUnlock = ['Apenas abrir o Word/Docs e escrever a primeira frase do título (1 min)'];
      } else {
        baseHigh = ['Identificar o primeiro passo de 2 minutos', 'Preparar as ferramentas de trabalho', 'Trabalhar focado por 15 minutos', 'Revisar o rascunho', 'Organizar a mesa'];
        baseLow = ['Fazer a tarefa por apenas 5 minutos com timer', 'Concluir a parte mais básica', 'Anotar o que falta para depois'];
        baseUnlock = ['Colocar o objeto necessário para a tarefa em cima da mesa (1 min)'];
      }

      if (refLower) {
        high = baseHigh.map(s => `${s} (Foco: ${refinementText})`);
        low = baseLow.map(s => `${s} (Foco: ${refinementText})`);
        unlock = baseUnlock.map(s => `${s} (Foco: ${refinementText})`);
      } else {
        high = baseHigh;
        low = baseLow;
        unlock = baseUnlock;
      }


    setAiSuggestions({
      taskId,
      content: content,
      suggestions: { high, low, unlock }
    });

    setCustomSteps({
      high: high.map(s => ({ text: s, enabled: true })),
      low: low.map(s => ({ text: s, enabled: true })),
      unlock: unlock.map(s => ({ text: s, enabled: true }))
    });

    setBreakingTaskIds(prev => ({ ...prev, [taskId]: false }));
    showToast('Sugestões geradas! Selecione a que melhor se adapta à sua realidade.');
  };

  const handleToggleCustomStep = (category: 'high' | 'low' | 'unlock', index: number) => {
    if (!customSteps) return;
    setCustomSteps(prev => {
      if (!prev) return null;
      const updated = [...prev[category]];
      updated[index] = { ...updated[index], enabled: !updated[index].enabled };
      return { ...prev, [category]: updated };
    });
  };

  const handleEditCustomStep = (category: 'high' | 'low' | 'unlock', index: number, newText: string) => {
    if (!customSteps) return;
    setCustomSteps(prev => {
      if (!prev) return null;
      const updated = [...prev[category]];
      updated[index] = { ...updated[index], text: newText };
      return { ...prev, [category]: updated };
    });
  };

  const handleAddCustomStep = (category: 'high' | 'low' | 'unlock') => {
    if (!customSteps) return;
    setCustomSteps(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [category]: [...prev[category], { text: '', enabled: true }]
      };
    });
  };

  const handleRemoveCustomStep = (category: 'high' | 'low' | 'unlock', index: number) => {
    if (!customSteps) return;
    setCustomSteps(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [category]: prev[category].filter((_, idx) => idx !== index)
      };
    });
  };

  const handleApplyAISuggestion = (steps: string[]) => {
    if (!aiSuggestions) return;
    setItems(prev => prev.map(item => {
      if (item.id === aiSuggestions.taskId) {
        const sub = steps.filter(s => s.trim().length > 0).map(s => ({
          id: Math.random().toString(36).substr(2, 9),
          content: s,
          completed: false
        }));
        return { 
          ...item, 
          subtasks: sub 
        };
      }
      return item;
    }));
    setExpandedTaskId(aiSuggestions.taskId);
    setAiSuggestions(null);
    setCustomSteps(null);
    showToast('Sugestões aplicadas com sucesso!');
  };

  // Brain Dump processor
  const handleBrainDumpOrganize = () => {
    if (!brainDumpText.trim()) return;
    setIsProcessingBrainDump(true);
    showToast('IA analisando o despejo de pensamentos...');

    setTimeout(() => {
      const text = brainDumpText;
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const dumpTasks: BujoItem[] = [];
      const dumpEvents: BujoItem[] = [];
      const dumpNotes: BujoItem[] = [];
      
      let emotion = 'Estado neutro com tendência à reflexão';
      const textLower = text.toLowerCase();
      
      const anxietyKeywords = ['ansioso', 'preocupado', 'medo', 'pânico', 'desespero', 'correndo', 'atrasado', 'prazos', 'estresse'];
      const fatigueKeywords = ['cansado', 'exausto', 'sono', 'sem energia', 'desanimado', 'fadiga', 'preguiça'];
      const positiveKeywords = ['feliz', 'animado', 'ótimo', 'produtivo', 'consegui', 'legal', 'aliviado'];

      if (anxietyKeywords.some(w => textLower.includes(w))) {
        emotion = '⚠️ Identificamos ansiedade relacionada a prazos ou volume de tarefas.';
      } else if (fatigueKeywords.some(w => textLower.includes(w))) {
        emotion = '🔋 Identificamos fadiga física ou mental. Considere descansar.';
      } else if (positiveKeywords.some(w => textLower.includes(w))) {
        emotion = '✨ Foco otimista e positivo. Excelente momento para iniciar!';
      }

      lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        
        // Match time formats like 14h30, 14h, 15:30
        const timeMatch = line.match(/(\d{1,2})h(\d{2})?|(\d{1,2}):(\d{2})/);
        const isEvent = ['reunião', 'encontro', 'médico', 'consulta', 'aula', 'festa', 'evento', 'almoço', 'jantar'].some(w => lowerLine.includes(w));
        
        if (timeMatch || isEvent) {
          let time = '12:00';
          if (timeMatch) {
            const h = timeMatch[1] || timeMatch[3];
            const m = timeMatch[2] || timeMatch[4] || '00';
            time = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
          }
          dumpEvents.push({
            id: Math.random().toString(),
            type: 'event',
            status: 'open',
            content: line.replace(/(\d{1,2})h(\d{2})?|(\d{1,2}):(\d{2})/, '').trim(),
            date: new Date().toISOString().split('T')[0],
            time: time
          });
        } else if (['fazer', 'comprar', 'limpar', 'estudar', 'enviar', 'ligar', 'escrever', 'revisar', 'pagar', 'terminar', 'organizar'].some(w => lowerLine.includes(w))) {
          dumpTasks.push({
            id: Math.random().toString(),
            type: 'task',
            status: 'open',
            content: line,
            date: new Date().toISOString().split('T')[0]
          });
        } else {
          dumpNotes.push({
            id: Math.random().toString(),
            type: 'note',
            status: 'open',
            content: line,
            date: new Date().toISOString().split('T')[0]
          });
        }
      });

      setBrainDumpResult({ tasks: dumpTasks, events: dumpEvents, notes: dumpNotes, emotion });
      setIsProcessingBrainDump(false);
      showToast('Mente organizada em blocos!');
    }, 2000);
  };

  // Add all organized brain dump items to main Bujo list
  const addBrainDumpItemsToBujo = () => {
    if (!brainDumpResult) return;
    const all = [...brainDumpResult.tasks, ...brainDumpResult.events, ...brainDumpResult.notes];
    setItems(prev => [...all, ...prev]);
    setBrainDumpText('');
    setBrainDumpResult(null);
    showToast('Tudo adicionado ao seu Bullet Journal!');
    setActiveTab('daily_log');
  };

  // Add event to Month Future Log
  const handleAddFutureEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!futureLogEventContent.trim()) return;

    // Estimate a date in the chosen month (e.g. 1st of that month)
    const year = new Date().getFullYear();
    const dateStr = `${year}-${(selectedMonth + 1).toString().padStart(2, '0')}-01`;

    const newEvent: BujoItem = {
      id: Math.random().toString(),
      type: 'event',
      status: 'scheduled',
      content: futureLogEventContent.trim(),
      date: dateStr
    };

    setItems(prev => [newEvent, ...prev]);
    setFutureLogEventContent('');
    showToast('Evento agendado no Future Log!');
  };

  // --- PDF EXPORTATION (html2canvas & jsPDF) ---
  const exportToPDF = async () => {
    const element = document.getElementById('bujo-export-area');
    if (!element) return;
    showToast('Gerando PDF do layout...');

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: settings.theme === 'light' ? '#FAF7F2' : '#0c0a09'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('bujo-focus-layout.pdf');
      showToast('Exportado com sucesso!');
    } catch (e) {
      console.error(e);
      showToast('Erro ao exportar arquivo.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // --- HELPERS ---
  const getSubtaskCompletionString = (item: BujoItem) => {
    if (!item.subtasks || item.subtasks.length === 0) return '';
    const completed = item.subtasks.filter(s => s.completed).length;
    return `(${completed}/${item.subtasks.length})`;
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const hours = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00', '23:00'
  ];

  // ADHD Dashboard Warnings
  const openTasksUnscheduled = items.filter(i => i.date === selectedDate && i.type === 'task' && i.status === 'open' && !i.time);
  
  // Custom theme background checks
  const currentFontClass = () => {
    if (settings.font === 'dyslexic') return 'font-dyslexic';
    if (settings.font === 'mono') return 'font-mono';
    return 'font-sans';
  };

  // Trigger PWA Installation
  const triggerPWAInstall = () => {
    showToast('Para instalar: toque nos 3 pontinhos do navegador e selecione "Instalar aplicativo" ou "Adicionar à tela de início".');
  };

  // --- CUSTOM COLLECTIONS & LIBRARY HANDLERS ---
  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    const newCol = {
      id: `col-${Date.now()}`,
      name: newColName.trim(),
      description: newColDesc.trim(),
      icon: newColIcon,
      items: []
    };

    setCollections(prev => [...prev, newCol]);
    setNewColName('');
    setNewColDesc('');
    setNewColIcon('📚');
    setShowCreateCollectionModal(false);
    showToast(`Coleção "${newCol.name}" criada com sucesso!`);
  };

  const handleDeleteCollection = (colId: string) => {
    if (confirm('Deseja realmente excluir esta coleção e todos os seus itens?')) {
      setCollections(prev => prev.filter(col => col.id !== colId));
      if (selectedCollectionId === colId) {
        setSelectedCollectionId(null);
        setSelectedItemId(null);
      }
      showToast('Coleção excluída.');
    }
  };

  const handleCreateCollectionItem = (colId: string) => {
    if (!newColItemTitle.trim()) return;

    const newItem = {
      id: `item-${Date.now()}`,
      title: newColItemTitle.trim(),
      status: 'todo',
      notes: newColItemNotes.trim(),
      media: [],
      subtasks: []
    };

    setCollections(prev => prev.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          items: [...col.items, newItem]
        };
      }
      return col;
    }));

    setNewColItemTitle('');
    setNewColItemNotes('');
    showToast(`Item "${newItem.title}" adicionado!`);
  };

  const handleDeleteCollectionItem = (colId: string, itemId: string) => {
    if (confirm('Excluir este item da coleção?')) {
      setCollections(prev => prev.map(col => {
        if (col.id === colId) {
          return {
            ...col,
            items: col.items.filter((item: any) => item.id !== itemId)
          };
        }
        return col;
      }));
      if (selectedItemId === itemId) {
        setSelectedItemId(null);
      }
      showToast('Item removido da coleção.');
    }
  };

  const handleUpdateCollectionItemStatus = (colId: string, itemId: string, newStatus: 'todo' | 'doing' | 'done') => {
    setCollections(prev => prev.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          items: col.items.map((item: any) => {
            if (item.id === itemId) {
              return { ...item, status: newStatus };
            }
            return item;
          })
        };
      }
      return col;
    }));
  };

  const handleAddCollectionItemSubtask = (colId: string, itemId: string, subtaskText: string) => {
    if (!subtaskText.trim()) return;

    setCollections(prev => prev.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          items: col.items.map((item: any) => {
            if (item.id === itemId) {
              return {
                ...item,
                subtasks: [
                  ...(item.subtasks || []),
                  { id: `col-sub-${Date.now()}`, content: subtaskText.trim(), completed: false }
                ]
              };
            }
            return item;
          })
        };
      }
      return col;
    }));
  };

  const handleToggleCollectionItemSubtask = (colId: string, itemId: string, subtaskId: string) => {
    setCollections(prev => prev.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          items: col.items.map((item: any) => {
            if (item.id === itemId) {
              return {
                ...item,
                subtasks: item.subtasks.map((st: any) => {
                  if (st.id === subtaskId) {
                    return { ...st, completed: !st.completed };
                  }
                  return st;
                })
              };
            }
            return item;
          })
        };
      }
      return col;
    }));
  };

  const handleDeleteCollectionItemSubtask = (colId: string, itemId: string, subtaskId: string) => {
    setCollections(prev => prev.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          items: col.items.map((item: any) => {
            if (item.id === itemId) {
              return {
                ...item,
                subtasks: item.subtasks.filter((st: any) => st.id !== subtaskId)
              };
            }
            return item;
          })
        };
      }
      return col;
    }));
  };

  const handleUploadCollectionItemMedia = (colId: string, itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      alert('Por favor, envie arquivos menores que 2.5MB para não estourar o limite de armazenamento local.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newMedia = {
        id: `media-${Date.now()}`,
        type: file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'file',
        name: file.name,
        url: dataUrl,
        size: file.size
      };

      setCollections(prev => prev.map(col => {
        if (col.id === colId) {
          return {
            ...col,
            items: col.items.map((item: any) => {
              if (item.id === itemId) {
                return {
                  ...item,
                  media: [...(item.media || []), newMedia]
                };
              }
              return item;
            })
          };
        }
        return col;
      }));
      showToast(`Mídia "${file.name}" anexada com sucesso!`);
    };
    reader.readAsDataURL(file);
  };

  const handleAddCollectionItemMediaLink = (colId: string, itemId: string) => {
    if (!mediaLinkUrl.trim() || !mediaLinkName.trim()) return;

    const newMedia = {
      id: `media-${Date.now()}`,
      type: 'link',
      name: mediaLinkName.trim(),
      url: mediaLinkUrl.trim()
    };

    setCollections(prev => prev.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          items: col.items.map((item: any) => {
            if (item.id === itemId) {
              return {
                ...item,
                media: [...(item.media || []), newMedia]
              };
            }
            return item;
          })
        };
      }
      return col;
    }));

    setMediaLinkName('');
    setMediaLinkUrl('');
    setShowAddMediaLink(false);
    showToast('Link da web anexado!');
  };

  const handleDeleteCollectionItemMedia = (colId: string, itemId: string, mediaId: string) => {
    if (confirm('Remover esta mídia anexa?')) {
      setCollections(prev => prev.map(col => {
        if (col.id === colId) {
          return {
            ...col,
            items: col.items.map((item: any) => {
              if (item.id === itemId) {
                return {
                  ...item,
                  media: item.media.filter((m: any) => m.id !== mediaId)
                };
              }
              return item;
            })
          };
        }
        return col;
      }));
      showToast('Mídia removida.');
    }
  };

  const migrateCollectionItemToDailyLog = (item: any, collectionName: string) => {
    const newItem: BujoItem = {
      id: `migrated-${Date.now()}`,
      type: 'task',
      status: 'open',
      content: `[${collectionName}] ${item.title}`,
      date: new Date().toISOString().split('T')[0],
      subtasks: (item.subtasks || []).map((st: any) => ({
        id: `st-${Date.now()}-${Math.random()}`,
        content: st.content,
        completed: st.completed
      }))
    };

    setItems(prev => [newItem, ...prev]);
    showToast(`"${item.title}" migrado para o Daily Log!`);
  };

  const handleAICollectionItemDecompose = async (collectionId: string, itemId: string, content: string) => {
    setDecomposingCollectionItemIds(prev => ({ ...prev, [itemId]: true }));
    showToast('IA analisando e elaborando passos...');

    if (aiEngine === 'local_llm') {
      if (localLLMState !== 'ready') {
        initLocalLLMWorker();
        showToast('IA Local carregando... Aguarde o download do modelo (~350MB, apenas na primeira vez).');
        setDecomposingCollectionItemIds(prev => ({ ...prev, [itemId]: false }));
        setActiveTab('settings');
        setTimeout(() => {
          const el = document.getElementById('local-llm-activation-center');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return;
      }

      setActiveLLMCollectionItemId(itemId);
      if (aiWorkerRef.current) {
        aiWorkerRef.current.postMessage({
          type: 'generate',
          data: { text: content }
        });
      }
      return;
    }

    let steps: string[] = [];
      const lower = content.toLowerCase();
      if (lower.includes('quarkus') || lower.includes('api') || lower.includes('backend') || lower.includes('programar')) {
        steps = [
          'Acessar code.quarkus.io para gerar o esqueleto',
          'Importar o projeto na IDE (VS Code ou IntelliJ)',
          'Configurar banco de dados no application.properties',
          'Criar modelo/entidade de dados usando Panache',
          'Implementar recurso/resource REST básico',
          'Executar quarkus dev e testar no navegador ou Postman'
        ];
      } else if (lower.includes('tdah') || lower.includes('hiperfoco') || lower.includes('foco') || lower.includes('estudar')) {
        steps = [
          'Sentar confortavelmente e beber um copo de água',
          'Silenciar notificações do celular por 25 minutos',
          'Ler apenas o primeiro parágrafo/seção para começar',
          'Escrever 3 palavras-chave sobre o que acabou de ler',
          'Fazer uma pausa rápida de 5 minutos'
        ];
      } else if (lower.includes('design') || lower.includes('mockup') || lower.includes('arte') || lower.includes('falar')) {
        steps = [
          'Pesquisar 3 referências visuais no Dribbble ou Pinterest',
          'Rascunhar a estrutura básica no papel em 2 minutos',
          'Abrir ferramenta de design (Figma ou Canva)',
          'Definir paleta de cores principal',
          'Criar a primeira tela/componente principal'
        ];
      } else {
        steps = [
          'Definir o objetivo principal em uma única frase',
          'Separar os materiais ou ferramentas necessárias',
          'Executar a primeira ação simples de 2 minutos',
          'Revisar o progresso inicial',
          'Anotar o próximo passo curto'
        ];
      }


    setCollections(prevCollections => {
      return prevCollections.map(col => {
        if (col.id === collectionId) {
          return {
            ...col,
            items: col.items.map((item: any) => {
              if (item.id === itemId) {
                const newSubtasks = [
                  ...(item.subtasks || []),
                  ...steps.map((step: string, idx: number) => ({
                    id: `col-sub-${Date.now()}-${idx}-${Math.random()}`,
                    content: step,
                    completed: false
                  }))
                ];
                return { ...item, subtasks: newSubtasks };
              }
              return item;
            }
          )};
        }
        return col;
      });
    });

    setDecomposingCollectionItemIds(prev => ({ ...prev, [itemId]: false }));
    showToast('Passos de micro-tarefas adicionados!');
  };

  const renderCollectionsLibrary = () => {
    return (
      <CollectionsLibrary
        collections={collections}
        setCollections={setCollections}
        selectedCollectionId={selectedCollectionId}
        setSelectedCollectionId={setSelectedCollectionId}
        selectedItemId={selectedItemId}
        setSelectedItemId={setSelectedItemId}
        showCreateCollectionModal={showCreateCollectionModal}
        setShowCreateCollectionModal={setShowCreateCollectionModal}
        newColName={newColName}
        setNewColName={setNewColName}
        newColDesc={newColDesc}
        setNewColDesc={setNewColDesc}
        newColIcon={newColIcon}
        setNewColIcon={setNewColIcon}
        handleCreateCollection={handleCreateCollection}
        handleDeleteCollection={handleDeleteCollection}
        newColItemTitle={newColItemTitle}
        setNewColItemTitle={setNewColItemTitle}
        handleCreateCollectionItem={handleCreateCollectionItem}
        handleDeleteCollectionItem={handleDeleteCollectionItem}
        handleUpdateCollectionItemStatus={handleUpdateCollectionItemStatus}
        migrateCollectionItemToDailyLog={migrateCollectionItemToDailyLog}
        decomposingCollectionItemIds={decomposingCollectionItemIds}
        activeLLMCollectionItemId={activeLLMCollectionItemId}
        handleAICollectionItemDecompose={handleAICollectionItemDecompose}
        handleAddCollectionItemSubtask={handleAddCollectionItemSubtask}
        handleToggleCollectionItemSubtask={handleToggleCollectionItemSubtask}
        handleDeleteCollectionItemSubtask={handleDeleteCollectionItemSubtask}
        showAddMediaLink={showAddMediaLink}
        setShowAddMediaLink={setShowAddMediaLink}
        mediaLinkName={mediaLinkName}
        setMediaLinkName={setMediaLinkName}
        mediaLinkUrl={mediaLinkUrl}
        setMediaLinkUrl={setMediaLinkUrl}
        handleAddCollectionItemMediaLink={handleAddCollectionItemMediaLink}
        handleUploadCollectionItemMedia={handleUploadCollectionItemMedia}
        handleDeleteCollectionItemMedia={handleDeleteCollectionItemMedia}
      />
    );
  };

  return (
    <div className={`relative min-h-screen ${currentFontClass()} flex flex-col text-bujo-text bg-bujo-bg transition-colors duration-300`}>
      
      {/* Background Video for Dark Theme */}
      {settings.theme === 'dark' && (
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none no-print">
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-cover translate-y-[17%] transition-none pointer-events-none"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
            muted
            playsInline
            autoPlay
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onLoadedData={handleLoadedData}
            style={{ opacity: 0 }}
          />
          <CozyCabinBackground />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/80" />
          <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      <Toast message={toastMessage} />

      {/* TUTORIAL OVERLAY */}
      <TutorialOverlay
        showTutorial={showTutorial}
        onClose={() => {
          setShowTutorial(false);
          setSettings(prev => ({ ...prev, firstTime: false }));
        }}
        setActiveTab={setActiveTab}
      />

      {/* HEADER NAVBAR */}
      <Header
        focoActive={focoActive}
        setFocoActive={setFocoActive}
        setActiveTab={setActiveTab}
        aiEngine={aiEngine}
        localLLMState={localLLMState}
        setPomodoroRunning={setPomodoroRunning}
        triggerPWAInstall={triggerPWAInstall}
      />

      {/* MAIN WORKSPACE CONTENT */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col gap-6 relative z-10 overflow-hidden">
        {focoActive ? (
          <FocusMode
            pomodoroTime={pomodoroTime}
            pomodoroRunning={pomodoroRunning}
            pomodoroMode={pomodoroMode}
            setPomodoroRunning={setPomodoroRunning}
            setPomodoroTime={setPomodoroTime}
            items={items}
            cycleStatus={cycleStatus}
            toggleSubtask={toggleSubtask}
            currentMaxQuote={currentMaxQuote}
            handleAskMaxForQuote={handleAskMaxForQuote}
          />
        ) : (
          <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
            <Sidebar
              userXp={userXp}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <main id="bujo-export-area" className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
              {activeTab === 'indice' && (
                <IndexTab
                  userXp={userXp}
                  setActiveTab={setActiveTab}
                  setShowTutorial={setShowTutorial}
                  items={items}
                  completedPomodoros={completedPomodoros}
                  getCognitiveLoad={getCognitiveLoad}
                  getHarmonyScore={getHarmonyScore}
                  getHarmonyRecommendation={getHarmonyRecommendation}
                  showEnergyGuide={showEnergyGuide}
                  setShowEnergyGuide={setShowEnergyGuide}
                  selectedDate={selectedDate}
                  onOverloadReliefClick={() => setShowOverloadReliefModal(true)}
                  aiEngine={aiEngine}
                  aiWorkerRef={aiWorkerRef}
                  localLLMState={localLLMState}
                  showToast={showToast}
                  setUserXp={setUserXp}
                  currentEnergy={currentEnergy}
                  anxietyLevel={anxietyLevel}
                  soundType={soundType}
                  setSoundType={setSoundType}
                  toggleAmbientAudio={toggleAmbientAudio}
                  ambientPlaying={ambientPlaying}
                  ambientVolume={ambientVolume}
                  setAmbientVolume={setAmbientVolume}
                />
              )}
              {activeTab === 'daily_log' && (
                <DailyLogTab
                  items={items}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  standardDate={standardDate}
                  setStandardDate={setStandardDate}
                  standardTime={standardTime}
                  setStandardTime={setStandardTime}
                  exportToPDF={exportToPDF}
                  handlePrint={handlePrint}
                  handleSaveStandardInput={handleSaveStandardInput}
                  standardType={standardType}
                  setStandardType={setStandardType}
                  standardInput={standardInput}
                  setStandardInput={setStandardInput}
                  handleStandardInputChange={handleStandardInputChange}
                  handleStandardInputKeyDown={handleStandardInputKeyDown}
                  showAutocomplete={showAutocomplete}
                  filteredCollections={filteredCollections}
                  autocompleteIndex={autocompleteIndex}
                  selectCollectionAutocomplete={selectCollectionAutocomplete}
                  renderRealTimeSuggestions={renderRealTimeSuggestions}
                  createStandardTaskWithSuggestions={createStandardTaskWithSuggestions}
                  cycleStatus={cycleStatus}
                  editingItemId={editingItemId}
                  editingItemContent={editingItemContent}
                  setEditingItemContent={setEditingItemContent}
                  handleSaveEditItem={handleSaveEditItem}
                  setEditingItemId={setEditingItemId}
                  handleStartEditItem={handleStartEditItem}
                  handleDeleteItem={handleDeleteItem}
                  handleAISplitTask={handleAISplitTask}
                  breakingTaskIds={breakingTaskIds}
                  expandedTaskId={expandedTaskId}
                  setExpandedTaskId={setExpandedTaskId}
                  toggleSubtask={toggleSubtask}
                  deleteSubtask={deleteSubtask}
                  newSubtaskText={newSubtaskText}
                  setNewSubtaskText={setNewSubtaskText}
                  addSubtask={addSubtask}
                  getSubtaskCompletionString={getSubtaskCompletionString}
                />
              )}
              {activeTab === 'weekly_log' && (
                <WeeklyLogTab
                  items={items}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === 'monthly_log' && (
                <MonthlyLogTab
                  items={items}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === 'daily_spread' && (
                <TimelineTab
                  items={items}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  timelineMobileView={timelineMobileView}
                  setTimelineMobileView={setTimelineMobileView}
                  hours={hours}
                  assignItemToTime={assignItemToTime}
                  setSelectedHourToSchedule={setSelectedHourToSchedule}
                  editingItemId={editingItemId}
                  editingItemContent={editingItemContent}
                  setEditingItemContent={setEditingItemContent}
                  handleSaveEditItem={handleSaveEditItem}
                  setEditingItemId={setEditingItemId}
                  openTasksUnscheduled={openTasksUnscheduled}
                />
              )}
              {activeTab === 'future_log' && (
                <FutureLogTab
                  items={items}
                  months={months}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  editingItemId={editingItemId}
                  editingItemContent={editingItemContent}
                  setEditingItemContent={setEditingItemContent}
                  handleSaveEditItem={handleSaveEditItem}
                  setEditingItemId={setEditingItemId}
                  handleStartEditItem={handleStartEditItem}
                  handleDeleteItem={handleDeleteItem}
                  handleAddFutureEvent={handleAddFutureEvent}
                  futureLogEventContent={futureLogEventContent}
                  setFutureLogEventContent={setFutureLogEventContent}
                />
              )}
              {activeTab === 'brain_dump' && (
                <BrainDumpStation
                  brainDumpText={brainDumpText}
                  setBrainDumpText={setBrainDumpText}
                  isProcessingBrainDump={isProcessingBrainDump}
                  adhdTriggers={adhdTriggers}
                  appendBrainDumpTrigger={appendBrainDumpTrigger}
                  handleBrainDumpOrganize={handleBrainDumpOrganize}
                  brainDumpResult={brainDumpResult}
                  addBrainDumpItemsToBujo={addBrainDumpItemsToBujo}
                />
              )}
              {activeTab === 'settings' && (
                <SettingsTab
                  settings={settings}
                  setSettings={setSettings}
                  setShowTutorial={setShowTutorial}
                  aiEngine={aiEngine}
                  setAiEngine={setAiEngine}
                  localLLMState={localLLMState}
                  localLLMProgress={localLLMProgress}
                  localLLMError={localLLMError}
                  initLocalLLMWorker={initLocalLLMWorker}
                />
              )}
              {activeTab === 'collections' && (
                renderCollectionsLibrary()
              )}
            </main>
          </div>
        )}
      </div>

      {aiSuggestions && (
        <AISuggestionsModal
          taskContent={aiSuggestions.content}
          customSteps={customSteps}
          handleToggleCustomStep={handleToggleCustomStep}
          handleEditCustomStep={handleEditCustomStep}
          handleRemoveCustomStep={handleRemoveCustomStep}
          handleAddCustomStep={handleAddCustomStep}
          handleApplyAISuggestion={handleApplyAISuggestion}
          setAiSuggestions={setAiSuggestions}
          setCustomSteps={setCustomSteps}
          onUpdateTaskContent={(newContent) => {
            setItems(prev => prev.map(item => {
              if (item.id === aiSuggestions.taskId) {
                return { ...item, content: newContent };
              }
              return item;
            }));
            setAiSuggestions(prev => prev ? { ...prev, content: newContent } : null);
          }}
          handleOptimizeDescription={() => {
            handleAIOptimizeTask(aiSuggestions.taskId, aiSuggestions.content);
          }}
          isOptimizing={isOptimizingTask}
          handleRegenerateSuggestions={(refinement, updatedTaskContent, stylePreset) => {
            const finalContent = updatedTaskContent || aiSuggestions.content || '';
            let finalRefinement = refinement || '';
            if (stylePreset && stylePreset !== 'default') {
              const presets: { [key: string]: string } = {
                baby_steps: 'passos extremamente curtos e fáceis (passos de bebê)',
                pomodoro: 'passos organizados com pomodoro e blocos de tempo',
                preparation: 'com foco forte em preparação do ambiente e remoção de distrações'
              };
              const presetText = presets[stylePreset] || stylePreset;
              finalRefinement = finalRefinement 
                ? `${finalRefinement}. Detalhe adicional: ${presetText}`
                : `Foco em: ${presetText}`;
            }
            // Update task content first in items list
            setItems(prev => prev.map(item => {
              if (item.id === aiSuggestions.taskId) {
                return { ...item, content: finalContent };
              }
              return item;
            }));
            setAiSuggestions(prev => prev ? { ...prev, content: finalContent } : null);

            handleAISplitTask(aiSuggestions.taskId, finalContent, finalRefinement);
          }}
          isGenerating={breakingTaskIds[aiSuggestions.taskId]}
        />
      )}

      {showOverloadReliefModal && (
        <OverloadReliefModal
          items={items}
          setItems={setItems}
          onClose={() => setShowOverloadReliefModal(false)}
          showToast={showToast}
          aiEngine={aiEngine}
          aiWorkerRef={aiWorkerRef}
          localLLMState={localLLMState}
          initLocalLLMWorker={initLocalLLMWorker}
        />
      )}

      
      {/* FLOATING "+" RAPID LOGGING ACTION BUTTON */}
      <FloatingActionButton
        focoActive={focoActive}
        onClick={() => {
          setRapidType('task');
          setShowRapidLog(true);
        }}
      />

      {/* RAPID LOGGING MODAL */}

      {showRapidLog && (
        <RapidLogModal
          showRapidLog={showRapidLog}
          setShowRapidLog={setShowRapidLog}
          rapidType={rapidType}
          setRapidType={setRapidType}
          rapidInput={rapidText}
          setRapidInput={setRapidText}
          handleRapidInputChange={handleRapidInputChange}
          handleRapidInputKeyDown={handleRapidInputKeyDown}
          showAutocompleteRapid={showAutocompleteRapid}
          filteredCollections={filteredCollections}
          autocompleteIndexRapid={autocompleteIndexRapid}
          selectCollectionAutocompleteRapid={selectCollectionAutocompleteRapid}
          handleSaveRapidLog={handleSaveRapidLog}
          renderRealTimeSuggestions={renderRealTimeSuggestions}
          createRapidTaskWithSuggestions={createRapidTaskWithSuggestions}
        />
      )}
    </div>
  );
}

export default App;

