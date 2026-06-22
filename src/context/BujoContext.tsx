import { createContext, useContext, ReactNode, useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { BujoItem, BujoSettings, AISubtaskSuggestions, Collection, DreamItem, ConfirmationModalConfig } from '../types';
import { useBujoItems } from '../hooks/useBujoItems';
import { useBujoSettings } from '../hooks/useBujoSettings';
import { useCollections } from '../hooks/useCollections';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';
import { useAmbientAudio, SoundType } from '../hooks/useAmbientAudio';
import { useHabits, HabitLog } from '../hooks/useHabits';
import { useTaskNotifications } from '../hooks/useTaskNotifications';
import { maxQuotes, getRealTimeSuggestions, adhdTriggers, getLocalDateString, getWeekdaysForDate, extractLinksFromText } from '../utils/plannerUtils';
import { HOURS, MONTHS, BRAIN_DUMP_KEYWORDS } from '../utils/constants';

import { useAuth } from './AuthContext';

export interface BujoContextType {
  showFeatureHelpModal: boolean;
  setShowFeatureHelpModal: React.Dispatch<React.SetStateAction<boolean>>;
  viewedFeatureHelp: Record<string, boolean>;
  setViewedFeatureHelp: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

  // Sync status
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  handleRetrySync: () => Promise<void>;

  // Items
  items: BujoItem[];
  setItems: React.Dispatch<React.SetStateAction<BujoItem[]>>;
  itemsRef: React.MutableRefObject<BujoItem[]>;
  handleSaveStandardInput: (
    standardInput: string,
    setStandardInput: React.Dispatch<React.SetStateAction<string>>,
    standardType: 'task' | 'event' | 'note',
    standardDate: string,
    selectedDate: string,
    standardTime: string,
    setStandardTime: React.Dispatch<React.SetStateAction<string>>,
    icon?: string,
    energy?: number,
    complexity?: number,
    executionTime?: number,
    link?: string
  ) => void;
  handleTimelineAddInput: (
    timelineInput: string,
    setTimelineInput: React.Dispatch<React.SetStateAction<string>>
  ) => void;
  handleCreateAndSchedule: (
    newHourTaskContent: string,
    setNewHourTaskContent: React.Dispatch<React.SetStateAction<string>>,
    selectedHourToSchedule: number | null,
    setSelectedHourToSchedule: React.Dispatch<React.SetStateAction<number | null>>,
    newHourTaskType: 'task' | 'event'
  ) => void;
  cycleStatus: (id: string) => void;
  assignItemToTime: (
    itemId: string,
    timeStr: string
  ) => void;
  unassignItemFromTime: (itemId: string) => void;
  handleDeleteItem: (id: string) => void;
  handleSaveEditItem: (
    id: string,
    editingItemContent: string,
    energy?: number,
    complexity?: number,
    executionTime?: number,
    date?: string,
    time?: string,
    delegatedTo?: string,
    icon?: string,
    link?: string
  ) => void;
  handleReorderItems: (activeId: string, overId: string) => void;
  handleReorderSubtasks: (taskId: string, activeId: string, overId: string) => void;
  addSubtask: (
    taskId: string,
    newSubtaskText: string,
    setNewSubtaskText: React.Dispatch<React.SetStateAction<string>>,
    icon?: string,
    executionTime?: number
  ) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  migrateUncompletedTasksToNextDay: (dateStr: string) => void;

  // Lixeira & Someday
  trashItems: BujoItem[];
  handleRestoreItem: (id: string) => void;
  handleDeletePermanently: (id: string) => void;
  handleEmptyTrash: () => void;
  somedayItems: BujoItem[];
  handleAddSomedayItem: (
    content: string,
    type?: 'task' | 'event' | 'note',
    category?: string,
    icon?: string,
    time?: string,
    energy?: number,
    complexity?: number,
    executionTime?: number
  ) => void;
  handleDeleteSomedayItem: (id: string) => void;
  handleScheduleSomedayItem: (id: string, date: string) => void;
  handleToggleSomedayItem: (id: string) => void;
  handleUpdateSomedayItemCategory: (id: string, category: string) => void;
  handleEditSomedayItemContent: (id: string, newContent: string) => void;
  handleUpdateItemDelegatedTo: (id: string, delegatedTo: string) => void;
  handleUpdateItemIcon: (id: string, icon: string) => void;

  // Dream Board
  dreams: DreamItem[];
  handleAddDream: (title: string, category: string, icon?: string, description?: string) => void;
  handleToggleDreamConquered: (id: string) => void;
  handleDeleteDream: (id: string) => void;

  // Settings
  settings: BujoSettings;
  setSettings: React.Dispatch<React.SetStateAction<BujoSettings>>;
  currentFontClass: () => string;

  // Collections
  collections: any[];
  setCollections: React.Dispatch<React.SetStateAction<any[]>>;
  selectedCollectionId: string | null;
  setSelectedCollectionId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedItemId: string | null;
  setSelectedItemId: React.Dispatch<React.SetStateAction<string | null>>;
  showCreateCollectionModal: boolean;
  setShowCreateCollectionModal: React.Dispatch<React.SetStateAction<boolean>>;
  newColName: string;
  setNewColName: React.Dispatch<React.SetStateAction<string>>;
  newColDesc: string;
  setNewColDesc: React.Dispatch<React.SetStateAction<string>>;
  newColIcon: string;
  setNewColIcon: React.Dispatch<React.SetStateAction<string>>;
  newColItemTitle: string;
  setNewColItemTitle: React.Dispatch<React.SetStateAction<string>>;
  newColItemNotes: string;
  setNewColItemNotes: React.Dispatch<React.SetStateAction<string>>;
  decomposingCollectionItemIds: { [key: string]: boolean };
  setDecomposingCollectionItemIds: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  handleCreateCollection: (e: React.FormEvent) => void;
  handleDeleteCollection: (colId: string) => void;
  handleCreateCollectionItem: (colId: string, icon?: string) => void;
  handleDeleteCollectionItem: (colId: string, itemId: string) => void;
  handleUpdateCollectionItemStatus: (colId: string, itemId: string, newStatus: 'todo' | 'doing' | 'done') => void;
  handleAddCollectionItemSubtask: (colId: string, itemId: string, subtaskText: string, icon?: string) => void;
  handleToggleCollectionItemSubtask: (colId: string, itemId: string, subtaskId: string) => void;
  handleDeleteCollectionItemSubtask: (colId: string, itemId: string, subtaskId: string) => void;
  handleUploadCollectionItemMedia: (colId: string, itemId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddCollectionItemMediaLink: (
    colId: string,
    itemId: string,
    mediaLinkName: string,
    setMediaLinkName: React.Dispatch<React.SetStateAction<string>>,
    mediaLinkUrl: string,
    setMediaLinkUrl: React.Dispatch<React.SetStateAction<string>>,
    setShowAddMediaLink: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
  handleDeleteCollectionItemMedia: (colId: string, itemId: string, mediaId: string) => void;
  migrateCollectionItemToDailyLog: (item: any, collectionName: string) => void;
  handleAICollectionItemDecompose: (collectionId: string, itemId: string, content: string) => Promise<void>;
  handleReorderCollections: (activeId: string, overId: string) => void;
  handleReorderCollectionItems: (colId: string, activeId: string, overId: string) => void;
  handleReorderCollectionSubtasks: (colId: string, itemId: string, activeId: string, overId: string) => void;

  // Pomodoro
  pomodoroTime: number;
  setPomodoroTime: React.Dispatch<React.SetStateAction<number>>;
  pomodoroRunning: boolean;
  setPomodoroRunning: React.Dispatch<React.SetStateAction<boolean>>;
  pomodoroMode: 'work' | 'break';
  setPomodoroMode: React.Dispatch<React.SetStateAction<'work' | 'break'>>;
  completedPomodoros: number;

  // Habits
  habits: string[];
  setHabits: React.Dispatch<React.SetStateAction<string[]>>;
  habitLogs: HabitLog;
  setHabitLogs: React.Dispatch<React.SetStateAction<HabitLog>>;
  toggleHabitDate: (habit: string, dateStr: string) => void;
  handleAddHabit: (name: string) => void;
  handleDeleteHabit: (habit: string) => void;

  // Data Management
  exportFullDataJSON: () => void;
  importFullDataJSON: (file: File) => Promise<void>;
  exportTasksToCSV: () => void;
  handleClearAllData: () => void;
  showGlobalSearch: boolean;
  setShowGlobalSearch: React.Dispatch<React.SetStateAction<boolean>>;

  // PWA & Network
  deferredPrompt: any;
  setDeferredPrompt: React.Dispatch<React.SetStateAction<any>>;
  isOnline: boolean;
  setIsOnline: React.Dispatch<React.SetStateAction<boolean>>;
  setCompletedPomodoros: React.Dispatch<React.SetStateAction<number>>;

  // Ambient Audio
  soundType: SoundType;
  setSoundType: React.Dispatch<React.SetStateAction<SoundType>>;
  ambientPlaying: boolean;
  setAmbientPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  ambientVolume: number;
  setAmbientVolume: React.Dispatch<React.SetStateAction<number>>;
  toggleAmbientAudio: () => void;
  stopAmbientAudio: () => void;

  // Global Context Internal States
  userXp: number;
  setUserXp: React.Dispatch<React.SetStateAction<number>>;
  anxietyLevel: number;
  setAnxietyLevel: React.Dispatch<React.SetStateAction<number>>;
  currentEnergy: 'high' | 'low' | 'exhausted';
  setCurrentEnergy: React.Dispatch<React.SetStateAction<'high' | 'low' | 'exhausted'>>;
  activeTab: 'indice' | 'daily_log' | 'weekly_log' | 'monthly_log' | 'daily_spread' | 'future_log' | 'brain_dump' | 'settings' | 'collections' | 'trash' | 'someday_maybe' | 'dream_board' | 'landing_page';
  setActiveTab: React.Dispatch<React.SetStateAction<'indice' | 'daily_log' | 'weekly_log' | 'monthly_log' | 'daily_spread' | 'future_log' | 'brain_dump' | 'settings' | 'collections' | 'trash' | 'someday_maybe' | 'dream_board' | 'landing_page'>>;
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  showOverloadReliefModal: boolean;
  setShowOverloadReliefModal: React.Dispatch<React.SetStateAction<boolean>>;
  showToast: (msg: string) => void;
  toastMessage: string | null;
  setToastMessage: React.Dispatch<React.SetStateAction<string | null>>;
  focoActive: boolean;
  setFocoActive: React.Dispatch<React.SetStateAction<boolean>>;
  selectedHourToSchedule: number | null;
  setSelectedHourToSchedule: React.Dispatch<React.SetStateAction<number | null>>;

  // Custom Confirmation Modal
  confirmModal: ConfirmationModalConfig | null;
  setConfirmModal: React.Dispatch<React.SetStateAction<ConfirmationModalConfig | null>>;
  askConfirmation: (config: ConfirmationModalConfig) => void;

  // Local AI states
  aiEngine: 'local_llm' | 'local';
  setAiEngine: React.Dispatch<React.SetStateAction<'local_llm' | 'local'>>;
  localLLMState: string;
  setLocalLLMState: React.Dispatch<React.SetStateAction<string>>;
  localLLMProgress: { [key: string]: number };
  localLLMError: string;
  initLocalLLMWorker: () => void;
  aiWorkerRef: React.MutableRefObject<Worker | null>;
  showAIDownloadModal: boolean;
  setShowAIDownloadModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleConfirmAIDownload: () => void;
  handleDeclineAIDownload: () => void;
  breakingTaskIds: { [key: string]: boolean };
  setBreakingTaskIds: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;

  activeLLMSplitTaskId: string | null;
  setActiveLLMSplitTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  activeLLMCollectionItemId: string | null;
  setActiveLLMCollectionItemId: React.Dispatch<React.SetStateAction<string | null>>;
  aiSuggestions: { taskId: string; content: string; suggestions: AISubtaskSuggestions } | null;
  setAiSuggestions: React.Dispatch<React.SetStateAction<{ taskId: string; content: string; suggestions: AISubtaskSuggestions } | null>>;
  customSteps: { high: { text: string; enabled: boolean }[]; low: { text: string; enabled: boolean }[]; unlock: { text: string; enabled: boolean }[] } | null;
  setCustomSteps: React.Dispatch<React.SetStateAction<{ high: { text: string; enabled: boolean }[]; low: { text: string; enabled: boolean }[]; unlock: { text: string; enabled: boolean }[] } | null>>;
  isOptimizingTask: boolean;
  setIsOptimizingTask: React.Dispatch<React.SetStateAction<boolean>>;
  handleAISplitTask: (taskId: string, content: string, refinementText?: string) => Promise<void>;
  handleAIOptimizeTask: (taskId: string, content: string) => Promise<void>;

  // Autocomplete, form, and dialog states relocated from App.tsx
  showTutorial: boolean;
  setShowTutorial: React.Dispatch<React.SetStateAction<boolean>>;
  showEnergyGuide: boolean;
  setShowEnergyGuide: React.Dispatch<React.SetStateAction<boolean>>;
  brainDumpText: string;
  setBrainDumpText: React.Dispatch<React.SetStateAction<string>>;
  isProcessingBrainDump: boolean;
  setIsProcessingBrainDump: React.Dispatch<React.SetStateAction<boolean>>;
  brainDumpResult: {
    tasks: BujoItem[];
    events: BujoItem[];
    notes: BujoItem[];
    emotion: string;
  } | null;
  setBrainDumpResult: React.Dispatch<React.SetStateAction<any | null>>;
  standardInput: string;
  setStandardInput: React.Dispatch<React.SetStateAction<string>>;
  standardType: 'task' | 'event' | 'note';
  setStandardType: React.Dispatch<React.SetStateAction<'task' | 'event' | 'note'>>;
  standardDate: string;
  setStandardDate: React.Dispatch<React.SetStateAction<string>>;
  standardTime: string;
  setStandardTime: React.Dispatch<React.SetStateAction<string>>;
  rapidText: string;
  setRapidText: React.Dispatch<React.SetStateAction<string>>;
  rapidType: 'task' | 'event' | 'note';
  setRapidType: React.Dispatch<React.SetStateAction<'task' | 'event' | 'note'>>;
  rapidTime: string;
  setRapidTime: React.Dispatch<React.SetStateAction<string>>;
  rapidPriority: boolean;
  setRapidPriority: React.Dispatch<React.SetStateAction<boolean>>;
  showRapidLog: boolean;
  setShowRapidLog: React.Dispatch<React.SetStateAction<boolean>>;
  showAutocomplete: boolean;
  setShowAutocomplete: React.Dispatch<React.SetStateAction<boolean>>;
  autocompleteSearch: string;
  setAutocompleteSearch: React.Dispatch<React.SetStateAction<string>>;
  autocompleteIndex: number;
  setAutocompleteIndex: React.Dispatch<React.SetStateAction<number>>;
  showAutocompleteRapid: boolean;
  setShowAutocompleteRapid: React.Dispatch<React.SetStateAction<boolean>>;
  autocompleteIndexRapid: number;
  setAutocompleteIndexRapid: React.Dispatch<React.SetStateAction<number>>;
  editingItemId: string | null;
  setEditingItemId: React.Dispatch<React.SetStateAction<string | null>>;
  editingItemContent: string;
  setEditingItemContent: React.Dispatch<React.SetStateAction<string>>;
  expandedTaskId: string | null;
  setExpandedTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  newSubtaskText: string;
  setNewSubtaskText: React.Dispatch<React.SetStateAction<string>>;
  currentMaxQuote: string;
  setCurrentMaxQuote: React.Dispatch<React.SetStateAction<string>>;

  // Shared actions and form events relocated from App.tsx
  handleAskMaxForQuote: () => void;
  getCognitiveLoad: () => number;
  getHarmonyScore: () => number | null;
  getHarmonyRecommendation: (score: number | null) => string;
  handleStandardInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStandardInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleRapidInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRapidInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  selectCollectionAutocomplete: (colName: string) => void;
  selectCollectionAutocompleteRapid: (colName: string) => void;
  handleSaveRapidLog: (e: React.FormEvent) => void;
  renderRealTimeSuggestions: (text: string, inputType: 'task' | 'event' | 'note', onSelectSuggestion: (subtasks: string[]) => void) => React.ReactNode;
  createStandardTaskWithSuggestions: (subtasks: string[]) => void;
  createRapidTaskWithSuggestions: (subtasks: string[]) => void;
  handleStartEditItem: (id: string, initialContent: string) => void;
  handleSaveEditItemForm: (id: string, energy?: number, complexity?: number, executionTime?: number, date?: string, time?: string) => void;
  handleBrainDumpOrganize: () => void;
  addBrainDumpItemsToBujo: () => void;
  appendBrainDumpTrigger: (trigger: string) => void;
  getSubtaskCompletionString: (item: BujoItem) => string;
  handleToggleCustomStep: (category: 'high' | 'low' | 'unlock', index: number) => void;
  handleEditCustomStep: (category: 'high' | 'low' | 'unlock', index: number, text: string) => void;
  handleRemoveCustomStep: (category: 'high' | 'low' | 'unlock', index: number) => void;
  handleAddCustomStep: (category: 'high' | 'low' | 'unlock') => void;
  handleApplyAISuggestion: (steps: string[]) => void;

  // Timeline & derived layouts
  timelineMobileView: 'timeline' | 'unscheduled';
  setTimelineMobileView: React.Dispatch<React.SetStateAction<'timeline' | 'unscheduled'>>;
  hours: string[];
  openTasksUnscheduled: BujoItem[];

  // Future Log & Derived Months
  selectedMonth: number;
  setSelectedMonth: React.Dispatch<React.SetStateAction<number>>;
  months: string[];
  futureLogEventContent: string;
  setFutureLogEventContent: React.Dispatch<React.SetStateAction<string>>;
  handleAddFutureEvent: (
    e: React.FormEvent,
    content: string,
    setContent: (v: string) => void,
    type: 'task' | 'event' | 'note',
    icon?: string,
    time?: string,
    energy?: number,
    complexity?: number,
    executionTime?: number
  ) => void;

  // Media & Prints
  exportToPDF: () => void;
  handlePrint: () => void;
}

const BujoContext = createContext<BujoContextType | undefined>(undefined);

export function BujoProvider({ children }: { children: ReactNode }) {

  const [showFeatureHelpModal, setShowFeatureHelpModal] = useState(false);
  const [viewedFeatureHelp, setViewedFeatureHelp] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('bujo_feature_help_viewed');
    if (saved) return JSON.parse(saved);
    return {};
  });

  useEffect(() => {
    localStorage.setItem('bujo_feature_help_viewed', JSON.stringify(viewedFeatureHelp));
  }, [viewedFeatureHelp]);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    const timeout = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timeout);
  };

  // Base state setups
  const [userXp, setUserXp] = useState<number>(() => {
    const saved = localStorage.getItem('bujo_focus_xp');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [anxietyLevel, setAnxietyLevel] = useState<number>(() => {
    const saved = localStorage.getItem('bujo_focus_anxiety_level');
    return saved ? parseInt(saved, 10) : 3;
  });

  const [currentEnergy, setCurrentEnergy] = useState<'high' | 'low' | 'exhausted'>(() => {
    const saved = localStorage.getItem('bujo_focus_current_energy');
    return (saved as any) || 'high';
  });

  const [activeTab, setActiveTab] = useState<'indice' | 'daily_log' | 'weekly_log' | 'monthly_log' | 'daily_spread' | 'future_log' | 'brain_dump' | 'settings' | 'collections' | 'trash' | 'someday_maybe' | 'dream_board' | 'landing_page'>(() => {
    const saved = localStorage.getItem('bujo_focus_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.firstTime === true) {
          return 'landing_page';
        }
      } catch (e) {
        console.error('Error parsing settings for initial tab:', e);
      }
    } else {
      return 'landing_page';
    }
    return 'indice';
  });
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString());
  const [showOverloadReliefModal, setShowOverloadReliefModal] = useState<boolean>(false);
  const [focoActive, setFocoActive] = useState<boolean>(false);
  const [selectedHourToSchedule, setSelectedHourToSchedule] = useState<number | null>(null);

  // Custom Confirmation Modal state & helpers
  const [confirmModal, setConfirmModal] = useState<ConfirmationModalConfig | null>(null);

  const askConfirmation = (config: ConfirmationModalConfig) => {
    setConfirmModal(config);
  };

  // Supabase Sync integration
  const { supabase, user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('offline');
  const lastSyncHashRef = useRef<string>('');

  const serializeLocalBujoData = () => {
    const data: { [key: string]: any } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('bujo_') && key !== 'bujo_supabase_config') {
        const val = localStorage.getItem(key);
        if (val !== null) {
          try {
            data[key] = JSON.parse(val);
          } catch {
            data[key] = val;
          }
        }
      }
    }
    return data;
  };

  const mergeBujoData = (local: any, remote: any) => {
    const merged = { ...remote, ...local };

    const mergeArrayById = (locArr: any[], remArr: any[]) => {
      const map = new Map();
      remArr.forEach(item => {
        if (item && typeof item === 'object') {
          map.set(item.id || JSON.stringify(item), item);
        } else {
          map.set(item, item);
        }
      });
      locArr.forEach(item => {
        if (item && typeof item === 'object') {
          const key = item.id || JSON.stringify(item);
          const existing = map.get(key);
          if (existing && typeof existing === 'object') {
            map.set(key, { ...existing, ...item });
          } else {
            map.set(key, item);
          }
        } else {
          map.set(item, item);
        }
      });
      return Array.from(map.values());
    };

    for (const key of Object.keys(remote)) {
      if (local[key] !== undefined) {
        const localVal = local[key];
        const remoteVal = remote[key];

        if (Array.isArray(localVal) && Array.isArray(remoteVal)) {
          merged[key] = mergeArrayById(localVal, remoteVal);
        } else if (
          localVal && typeof localVal === 'object' &&
          remoteVal && typeof remoteVal === 'object'
        ) {
          if (key === 'bujo_habit_logs') {
            const mergedLogs = { ...remoteVal };
            for (const habit of Object.keys(localVal)) {
              mergedLogs[habit] = {
                ...(remoteVal[habit] || {}),
                ...(localVal[habit] || {})
              };
            }
            merged[key] = mergedLogs;
          } else {
            merged[key] = { ...remoteVal, ...localVal };
          }
        } else if (key === 'bujo_focus_xp') {
          merged[key] = Math.max(Number(localVal) || 0, Number(remoteVal) || 0);
        } else {
          merged[key] = localVal !== null && localVal !== undefined ? localVal : remoteVal;
        }
      }
    }

    return merged;
  };

  useEffect(() => {
    if (!supabase || !user) {
      setSyncStatus('offline');
      return;
    }

    let active = true;

    const performInitialSync = async () => {
      setSyncStatus('syncing');
      try {
        const { data: row, error } = await supabase
          .from('bujo_user_data')
          .select('data')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        const localData = serializeLocalBujoData();

        if (!row) {
          const { error: insertError } = await supabase
            .from('bujo_user_data')
            .insert({ user_id: user.id, data: localData });

          if (insertError) throw insertError;
          if (active) {
            lastSyncHashRef.current = JSON.stringify(localData);
            setSyncStatus('synced');
            showToast('☁️ Backup inicial criado no Supabase!');
          }
        } else {
          const remoteData = row.data || {};
          const mergedData = mergeBujoData(localData, remoteData);

          Object.entries(mergedData).forEach(([key, val]) => {
            localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
          });

          if (active) {
            lastSyncHashRef.current = JSON.stringify(mergedData);
            setSyncStatus('synced');
            showToast('☁️ Dados sincronizados com o Supabase!');
            
            if (!sessionStorage.getItem('bujo_synced_reload')) {
              sessionStorage.setItem('bujo_synced_reload', 'true');
              window.location.reload();
            }
          }
        }
      } catch (err: any) {
        console.error('Supabase sync error:', err);
        if (active) {
          setSyncStatus('error');
          const msg = err?.message || err?.details || JSON.stringify(err);
          showToast(`❌ Erro de Sincronização: ${msg}`);
        }
      }
    };

    performInitialSync();

    return () => {
      active = false;
    };
  }, [supabase, user]);

  useEffect(() => {
    if (!supabase || !user || syncStatus === 'error') return;

    const checkAndSync = async () => {
      const localData = serializeLocalBujoData();
      const currentHash = JSON.stringify(localData);

      if (currentHash === lastSyncHashRef.current) return;

      setSyncStatus('syncing');
      try {
        const { error } = await supabase
          .from('bujo_user_data')
          .upsert({ 
            user_id: user.id, 
            data: localData,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        lastSyncHashRef.current = currentHash;
        setSyncStatus('synced');
      } catch (err: any) {
        console.error('Background sync error:', err);
        setSyncStatus('error');
        const msg = err?.message || JSON.stringify(err);
        showToast(`❌ Erro ao salvar na nuvem: ${msg}`);
      }
    };

    const interval = setInterval(checkAndSync, 5000);
    return () => clearInterval(interval);
  }, [supabase, user, syncStatus]);

  const handleRetrySync = async () => {
    if (!supabase || !user) return;
    setSyncStatus('syncing');
    try {
      const { data: row, error } = await supabase
        .from('bujo_user_data')
        .select('data')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      const localData = serializeLocalBujoData();

      if (!row) {
        const { error: insertError } = await supabase
          .from('bujo_user_data')
          .insert({ user_id: user.id, data: localData });

        if (insertError) throw insertError;
        lastSyncHashRef.current = JSON.stringify(localData);
        setSyncStatus('synced');
        showToast('☁️ Backup inicial criado no Supabase!');
      } else {
        const remoteData = row.data || {};
        const mergedData = mergeBujoData(localData, remoteData);

        Object.entries(mergedData).forEach(([key, val]) => {
          localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
        });

        lastSyncHashRef.current = JSON.stringify(mergedData);
        setSyncStatus('synced');
        showToast('☁️ Dados sincronizados com o Supabase!');
        
        if (!sessionStorage.getItem('bujo_synced_reload')) {
          sessionStorage.setItem('bujo_synced_reload', 'true');
          window.location.reload();
        }
      }
    } catch (err: any) {
      console.error('Manual sync retry error:', err);
      setSyncStatus('error');
      const msg = err?.message || err?.details || JSON.stringify(err);
      showToast(`❌ Erro ao re-sincronizar: ${msg}`);
    }
  };

  // Sync effects
  useEffect(() => {
    localStorage.setItem('bujo_focus_xp', userXp.toString());
  }, [userXp]);

  useEffect(() => {
    localStorage.setItem('bujo_focus_anxiety_level', anxietyLevel.toString());
  }, [anxietyLevel]);

  useEffect(() => {
    localStorage.setItem('bujo_focus_current_energy', currentEnergy);
  }, [currentEnergy]);

  // AI states
  const [aiEngine, setAiEngine] = useState<'local_llm' | 'local'>(() => {
    const saved = localStorage.getItem('bujo_ai_engine');
    if (saved) return saved as 'local_llm' | 'local';
    return 'local'; // Default to simple rules engine for new users to avoid auto-download
  });

  const [showAIDownloadModal, setShowAIDownloadModal] = useState<boolean>(false);

  const [localLLMState, setLocalLLMState] = useState<string>('idle');
  const [localLLMProgress, setLocalLLMProgress] = useState<{ [key: string]: number }>({});
  const [localLLMError, setLocalLLMError] = useState<string>('');
  const aiWorkerRef = useRef<Worker | null>(null);

  const [breakingTaskIds, setBreakingTaskIds] = useState<{ [key: string]: boolean }>({});
  const [activeLLMSplitTaskId, setActiveLLMSplitTaskId] = useState<string | null>(null);
  const [activeLLMCollectionItemId, setActiveLLMCollectionItemId] = useState<string | null>(null);

  const [aiSuggestions, setAiSuggestions] = useState<{ taskId: string; content: string; suggestions: AISubtaskSuggestions } | null>(null);
  const [customSteps, setCustomSteps] = useState<{ high: { text: string; enabled: boolean }[]; low: { text: string; enabled: boolean }[]; unlock: { text: string; enabled: boolean }[] } | null>(null);
  const [isOptimizingTask, setIsOptimizingTask] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('bujo_ai_engine', aiEngine);
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
      const worker = new Worker(new URL('../ai.worker.ts', import.meta.url), { type: 'module' });

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

          if (mode === 'braindump') {
            const dumpTasks: any[] = [];
            const dumpEvents: any[] = [];
            const dumpNotes: any[] = [];
            
            const lines = resultText.split('\n').map((l: string) => l.trim()).filter(Boolean);
            lines.forEach((line: string, index: number) => {
              const cleanedLine = line.replace(/^[TEN]:\s*/i, '').trim();
              if (line.toUpperCase().startsWith('T:')) {
                dumpTasks.push({
                  id: `${Date.now() + index}-${Math.random().toString(36).substring(2, 11)}`,
                  type: 'task',
                  status: 'open',
                  content: cleanedLine,
                  date: getLocalDateString(),
                  createdAt: new Date().toISOString()
                });
              } else if (line.toUpperCase().startsWith('E:')) {
                const parts = cleanedLine.split('|');
                const content = (parts[0] || '').trim();
                const time = (parts[1] || '12:00').trim();
                dumpEvents.push({
                  id: `${Date.now() + index}-${Math.random().toString(36).substring(2, 11)}`,
                  type: 'event',
                  status: 'open',
                  content,
                  date: getLocalDateString(),
                  time,
                  createdAt: new Date().toISOString()
                });
              } else if (line.toUpperCase().startsWith('N:')) {
                dumpNotes.push({
                  id: `${Date.now() + index}-${Math.random().toString(36).substring(2, 11)}`,
                  type: 'note',
                  status: 'open',
                  content: cleanedLine,
                  date: getLocalDateString(),
                  createdAt: new Date().toISOString()
                });
              }
            });
            
            let emotion = 'Mente processada com sucesso pela IA Local.';
            const textLower = brainDumpTextRef.current.toLowerCase();
            const anxietyKeywords = BRAIN_DUMP_KEYWORDS.anxiety;
            const fatigueKeywords = BRAIN_DUMP_KEYWORDS.fatigue;
            const positiveKeywords = BRAIN_DUMP_KEYWORDS.positive;

            if (anxietyKeywords.some(w => textLower.includes(w))) {
              emotion = '⚠️ Identificamos ansiedade relacionada a prazos ou volume de tarefas.';
            } else if (fatigueKeywords.some(w => textLower.includes(w))) {
              emotion = '🔋 Identificamos fadiga física ou mental. Considere descansar.';
            } else if (positiveKeywords.some(w => textLower.includes(w))) {
              emotion = '✨ Foco otimista e positivo. Excelente momento para iniciar!';
            }

            setBrainDumpResult({ tasks: dumpTasks, events: dumpEvents, notes: dumpNotes, emotion });
            setIsProcessingBrainDump(false);
            showToast('Caos mental organizado pela IA com sucesso!');
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

  const handleConfirmAIDownload = () => {
    localStorage.setItem('bujo_asked_ai_download', 'true');
    setAiEngine('local_llm');
    setShowAIDownloadModal(false);
    initLocalLLMWorker();
  };

  const handleDeclineAIDownload = () => {
    localStorage.setItem('bujo_asked_ai_download', 'true');
    setShowAIDownloadModal(false);
  };

  useEffect(() => {
    const asked = localStorage.getItem('bujo_asked_ai_download');
    const savedEngine = localStorage.getItem('bujo_ai_engine');
    
    // Only show if never asked before, and not already using local_llm
    if (asked !== 'true' && savedEngine !== 'local_llm') {
      const timer = setTimeout(() => {
        setShowAIDownloadModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Hook integrations
  const settingsData = useBujoSettings();
  const { settings, setSettings } = settingsData;

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

  const itemsData = useBujoItems(setUserXp, setCollections, showToast);
  const { items, setItems, itemsRef } = itemsData;

  const handleDeleteItemWithConfirm = (id: string) => {
    const itemToDelete = items.find(item => item.id === id) || itemsData.somedayItems.find(item => item.id === id);
    if (!itemToDelete) return;
    
    askConfirmation({
      title: 'Mover para a Lixeira?',
      message: `Deseja realmente mover o item "${itemToDelete.content}" para a lixeira? Você poderá restaurá-lo depois se precisar.`,
      confirmText: 'Mover para Lixeira',
      cancelText: 'Cancelar',
      isDanger: true,
      onConfirm: () => {
        itemsData.handleDeleteItem(id);
      }
    });
  };

  const collectionsData = useCollections(
    collections,
    setCollections,
    setItems,
    showToast,
    aiEngine,
    localLLMState,
    aiWorkerRef,
    initLocalLLMWorker,
    setActiveTab,
    setActiveLLMCollectionItemId
  );

  const {
    selectedCollectionId,
    setSelectedCollectionId,
    selectedItemId,
    setSelectedItemId,
    showCreateCollectionModal,
    setShowCreateCollectionModal,
    newColName,
    setNewColName,
    newColDesc,
    setNewColDesc,
    newColIcon,
    setNewColIcon,
    newColItemTitle,
    setNewColItemTitle,
    newColItemNotes,
    setNewColItemNotes,
    decomposingCollectionItemIds,
    setDecomposingCollectionItemIds,
    handleCreateCollection,
    handleCreateCollectionItem,
    handleDeleteCollectionItem,
    handleUpdateCollectionItemStatus,
    handleAddCollectionItemSubtask,
    handleToggleCollectionItemSubtask,
    handleDeleteCollectionItemSubtask,
    handleUploadCollectionItemMedia,
    handleAddCollectionItemMediaLink,
    handleDeleteCollectionItemMedia,
    handleAICollectionItemDecompose
  } = collectionsData;

  // Resolve collections setItems circular ref & override default setCollections to sync with local storage
  useEffect(() => {
    localStorage.setItem('bujo_collections', JSON.stringify(collections));
  }, [collections]);

  const migrateCollectionItemToDailyLog = (item: any, collectionName: string) => {
    const newItem: BujoItem = {
      id: `migrated-${Date.now()}`,
      type: 'task',
      status: 'open',
      content: `[${collectionName}] ${item.title}`,
      date: getLocalDateString(),
      subtasks: (item.subtasks || []).map((st: any) => ({
        id: `st-${Date.now()}-${Math.random()}`,
        content: st.content,
        completed: st.completed
      })),
      createdAt: new Date().toISOString()
    };
    setItems(prev => [newItem, ...prev]);
    showToast(`"${item.title}" migrado para o Daily Log!`);
  };

  const handleDeleteCollection = (colId: string) => {
    const colToDelete = collections.find(col => col.id === colId);
    const colName = colToDelete ? `"${colToDelete.name}"` : 'esta coleção';
    askConfirmation({
      title: 'Excluir Coleção?',
      message: `Deseja realmente excluir ${colName} e todos os seus itens associados? Esta ação não poderá ser desfeita.`,
      confirmText: 'Excluir Coleção',
      cancelText: 'Cancelar',
      isDanger: true,
      onConfirm: () => {
        setCollections(prev => prev.filter(col => col.id !== colId));
        if (selectedCollectionId === colId) {
          setSelectedCollectionId(null);
          setSelectedItemId(null);
        }
        showToast('Coleção excluída.');
      }
    });
  };

  const pomodoroData = usePomodoroTimer(setUserXp, showToast);
  const audioData = useAmbientAudio(showToast);
  const habitData = useHabits();

  // Task Notifications Hook
  useTaskNotifications(items);

  // Data Management Implementations
  const exportFullDataJSON = () => {
    const data = {
      items: itemsData.items,
      trashItems: itemsData.trashItems,
      somedayItems: itemsData.somedayItems,
      dreams: itemsData.dreams,
      collections: collections,
      settings: settingsData.settings,
      habits: habitData.habits,
      habitLogs: habitData.habitLogs,
      userXp: userXp,
      version: '2.0.0',
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bujo_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Backup JSON gerado com sucesso! 📦');
  };

  const importFullDataJSON = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Basic validation
      if (!data.items || !Array.isArray(data.items)) {
        throw new Error('Formato de arquivo inválido: lista de itens não encontrada.');
      }

      askConfirmation({
        title: 'Importar Backup?',
        message: 'Isso substituirá TODOS os seus dados atuais pelos dados do arquivo. Esta ação não pode ser desfeita. Deseja continuar?',
        confirmText: 'Importar e Sobrescrever',
        cancelText: 'Cancelar',
        isDanger: true,
        onConfirm: () => {
          if (data.items) itemsData.setItems(data.items);
          if (data.trashItems) {
            localStorage.setItem('bujo_focus_trash_items', JSON.stringify(data.trashItems));
          }
          if (data.somedayItems) {
             localStorage.setItem('bujo_focus_someday_items', JSON.stringify(data.somedayItems));
          }
          if (data.dreams) {
             localStorage.setItem('bujo_focus_dreams', JSON.stringify(data.dreams));
          }
          if (data.collections) setCollections(data.collections);
          if (data.settings) settingsData.setSettings(data.settings);
          if (data.habits) habitData.setHabits(data.habits);
          if (data.habitLogs) habitData.setHabitLogs(data.habitLogs);
          if (data.userXp !== undefined) setUserXp(data.userXp);

          showToast('Dados importados com sucesso! Recarregando...');
          setTimeout(() => window.location.reload(), 1500);
        }
      });
    } catch (err: any) {
      showToast(`Erro ao importar: ${err.message}`);
    }
  };

  const exportTasksToCSV = () => {
    const tasks = itemsData.items;
    if (tasks.length === 0) {
      showToast('Nenhuma tarefa para exportar.');
      return;
    }

    const headers = ['ID', 'Data', 'Tipo', 'Conteúdo', 'Status', 'Hora', 'Energia', 'Complexidade', 'TempoExecucao', 'Responsavel', 'CriadoEm'];
    const rows = tasks.map(t => [
      t.id,
      t.date,
      t.type,
      `"${t.content.replace(/"/g, '""')}"`,
      t.status,
      t.time || '',
      t.energy || '',
      t.complexity || '',
      t.executionTime || '',
      t.delegatedTo || '',
      t.createdAt || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bujo_tasks_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exportação CSV concluída! 📊');
  };

  const handleClearAllData = () => {
    askConfirmation({
      title: 'LIMPAR TUDO?',
      message: 'Esta ação apagará permanentemente TODOS os seus dados (tarefas, coleções, hábitos, sonhos e configurações) deste navegador. Isso não pode ser desfeito!',
      confirmText: 'SIM, APAGAR TUDO',
      cancelText: 'Cancelar',
      isDanger: true,
      onConfirm: () => {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('bujo_')) {
            localStorage.removeItem(key);
          }
        });
        showToast('Todos os dados foram removidos. Recarregando...');
        setTimeout(() => window.location.reload(), 1500);
      }
    });
  };

  // Additional Relocated States
  const [showTutorial, setShowTutorial] = useState<boolean>(settings.firstTime);
  const [showEnergyGuide, setShowEnergyGuide] = useState<boolean>(false);
  
  const [brainDumpText, setBrainDumpText] = useState<string>('');
  const brainDumpTextRef = useRef<string>('');
  useEffect(() => {
    brainDumpTextRef.current = brainDumpText;
  }, [brainDumpText]);
  const [isProcessingBrainDump, setIsProcessingBrainDump] = useState<boolean>(false);
  const [brainDumpResult, setBrainDumpResult] = useState<any | null>(null);

  const [standardInput, setStandardInput] = useState<string>('');
  const [standardType, setStandardType] = useState<'task' | 'event' | 'note'>('task');
  const [standardDate, setStandardDate] = useState<string>(() => getLocalDateString());
  const [standardTime, setStandardTime] = useState<string>('');

  const [rapidText, setRapidText] = useState<string>('');
  const [rapidType, setRapidType] = useState<'task' | 'event' | 'note'>('task');
  const [rapidTime, setRapidTime] = useState<string>('');
  const [rapidPriority, setRapidPriority] = useState<boolean>(false);
  const [showRapidLog, setShowRapidLog] = useState<boolean>(false);

  const [showAutocomplete, setShowAutocomplete] = useState<boolean>(false);
  const [autocompleteSearch, setAutocompleteSearch] = useState<string>('');
  const [autocompleteIndex, setAutocompleteIndex] = useState<number>(0);

  const [showAutocompleteRapid, setShowAutocompleteRapid] = useState<boolean>(false);
  const [autocompleteIndexRapid, setAutocompleteIndexRapid] = useState<number>(0);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemContent, setEditingItemContent] = useState<string>('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [newSubtaskText, setNewSubtaskText] = useState<string>('');

  const [currentMaxQuote, setCurrentMaxQuote] = useState<string>(() => maxQuotes[0]);

  // Timeline States
  const [timelineMobileView, setTimelineMobileView] = useState<'timeline' | 'unscheduled'>('timeline');
  const hours = HOURS;
  const openTasksUnscheduled = items.filter(i => i.date === selectedDate && i.type === 'task' && i.status === 'open' && !i.time);

  // Future Log States
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth());
  const months = MONTHS;
  const [futureLogEventContent, setFutureLogEventContent] = useState<string>('');

  const [showGlobalSearch, setShowGlobalSearch] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Harmony and Cognitive Load calculators
  const getCognitiveLoad = () => {
    const todayStr = getLocalDateString();
    const todayItems = items.filter(i => i.date === todayStr);
    const openTasks = todayItems.filter(i => i.type === 'task' && i.status === 'open').length;
    const openEvents = todayItems.filter(i => i.type === 'event' && i.status === 'open').length;
    const completedTasks = todayItems.filter(i => i.type === 'task' && i.status === 'completed').length;
    
    const baseLoad = (openTasks * 20) + (openEvents * 15) + (anxietyLevel * 12);
    const relief = (completedTasks * 25) + (pomodoroData.completedPomodoros * 10) + (brainDumpText ? 15 : 0);
    const load = Math.max(10, Math.min(95, baseLoad - relief));
    return Math.round(load);
  };

  const getHarmonyScore = () => {
    const todayStr = getLocalDateString();
    const todayTasks = items.filter(item => item.date === todayStr && item.type === 'task' && item.time);
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

  // Autocomplete inputs & controls
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
    const filteredCols = collections.filter(col =>
      col.name.toLowerCase().includes(autocompleteSearch.toLowerCase())
    );

    if (showAutocomplete && filteredCols.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setAutocompleteIndex(prev => (prev + 1) % filteredCols.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setAutocompleteIndex(prev => (prev - 1 + filteredCols.length) % filteredCols.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectCollectionAutocomplete(filteredCols[autocompleteIndex].name);
      } else if (e.key === 'Escape') {
        setShowAutocomplete(false);
      }
    }
  };

  const selectCollectionAutocomplete = (colName: string) => {
    const lastBracketIndex = standardInput.lastIndexOf('[');
    const newVal = standardInput.substring(0, lastBracketIndex) + `[${colName}] `;
    setStandardInput(newVal);
    setShowAutocomplete(false);
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
    const filteredCols = collections.filter(col =>
      col.name.toLowerCase().includes(autocompleteSearch.toLowerCase())
    );

    if (showAutocompleteRapid && filteredCols.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setAutocompleteIndexRapid(prev => (prev + 1) % filteredCols.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setAutocompleteIndexRapid(prev => (prev - 1 + filteredCols.length) % filteredCols.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectCollectionAutocompleteRapid(filteredCols[autocompleteIndexRapid].name);
      } else if (e.key === 'Escape') {
        setShowAutocompleteRapid(false);
      }
    }
  };

  const selectCollectionAutocompleteRapid = (colName: string) => {
    const lastBracketIndex = rapidText.lastIndexOf('[');
    const newVal = rapidText.substring(0, lastBracketIndex) + `[${colName}] `;
    setRapidText(newVal);
    setShowAutocompleteRapid(false);
  };

  // Action methods
  const handleAskMaxForQuote = () => {
    const randomIdx = Math.floor(Math.random() * maxQuotes.length);
    setCurrentMaxQuote(maxQuotes[randomIdx]);
    showToast('💬 Max enviou um conselho de foco!');
  };

  const handleSaveRapidLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rapidText.trim()) return;

    const { cleanContent, links } = extractLinksFromText(rapidText.trim());
    const extractedSubtasks = links.map((lnk, lIdx) => ({
      id: `st-${Date.now()}-${lIdx}-${Math.random().toString(36).substring(2, 11)}`,
      content: lnk,
      completed: false
    }));

    const newItem: BujoItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type: rapidType,
      status: 'open',
      content: cleanContent,
      date: getLocalDateString(),
      time: rapidTime || undefined,
      priority: rapidPriority,
      subtasks: rapidType === 'task' ? extractedSubtasks : undefined
    };

    setItems(prev => [newItem, ...prev]);
    setRapidText('');
    setRapidTime('');
    setRapidPriority(false);
    setShowRapidLog(false);
    showToast('Entrada salva com sucesso!');
  };

  const renderRealTimeSuggestions = (
    text: string,
    inputType: 'task' | 'event' | 'note',
    onSelectSuggestion: (subtasks: string[]) => void
  ) => {
    const sug = getRealTimeSuggestions(text);
    if (!sug || inputType !== 'task') return null;

    return (
      <div className="mt-1.5 p-2 rounded-xl border border-bujo-accent/20 bg-bujo-accent/[0.02] dark:bg-bujo-accent/[0.04] backdrop-blur-sm animate-fade-in text-[10.5px] space-y-1.5 text-bujo-text relative z-10 no-print shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[9.5px] font-bold text-bujo-accent uppercase tracking-widest flex items-center gap-1">
            <span>🧠</span> Copiloto TDAH ({sug.category})
          </span>
          <span className="text-[9px] text-zinc-500 font-mono">Micro-passos sugeridos</span>
        </div>

        <div className="flex flex-wrap gap-1.5 pl-0.5 text-[9.5px]">
          {sug.subtasks.map((step: string, index: number) => (
            <span key={index} className="inline-flex items-center gap-1 bg-zinc-200/40 dark:bg-white/5 px-2 py-0.5 rounded-lg border border-zinc-200/50 dark:border-white/5 text-zinc-600 dark:text-zinc-350">
              <span className="text-bujo-accent font-bold">•</span>
              <span>{step}</span>
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onSelectSuggestion(sug.subtasks)}
          className="w-full py-1 bg-bujo-accent/10 hover:bg-bujo-accent/20 text-bujo-accent text-[9.5px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 border border-bujo-accent/20 cursor-pointer"
        >
          <span>✨</span> Criar tarefa com estes {sug.subtasks.length} micro-passos
        </button>
      </div>
    );
  };

  const createStandardTaskWithSuggestions = (subtasks: string[]) => {
    if (!standardInput.trim()) return;
    const { cleanContent, links } = extractLinksFromText(standardInput.trim());
    const linkSubtasks = links.map((lnk, lIdx) => ({
      id: `st-lnk-${Date.now()}-${lIdx}-${Math.random().toString(36).substring(2, 5)}`,
      content: lnk,
      completed: false
    }));
    const suggestionSubtasks = subtasks.map(s => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      content: s,
      completed: false
    }));

    const newItem: BujoItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type: 'task',
      status: 'open',
      content: cleanContent,
      date: getLocalDateString(),
      subtasks: [...linkSubtasks, ...suggestionSubtasks],
      createdAt: new Date().toISOString()
    };
    setItems(prev => [newItem, ...prev]);
    setStandardInput('');
    setExpandedTaskId(newItem.id);
    showToast('Adicionado com micro-passos!');
  };

  const createRapidTaskWithSuggestions = (subtasks: string[]) => {
    if (!rapidText.trim()) return;
    const { cleanContent, links } = extractLinksFromText(rapidText.trim());
    const linkSubtasks = links.map((lnk, lIdx) => ({
      id: `st-lnk-${Date.now()}-${lIdx}-${Math.random().toString(36).substring(2, 5)}`,
      content: lnk,
      completed: false
    }));
    const suggestionSubtasks = subtasks.map(s => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      content: s,
      completed: false
    }));

    const newItem: BujoItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type: 'task',
      status: 'open',
      content: cleanContent,
      date: getLocalDateString(),
      subtasks: [...linkSubtasks, ...suggestionSubtasks],
      createdAt: new Date().toISOString()
    };
    setItems(prev => [newItem, ...prev]);
    setRapidText('');
    setShowRapidLog(false);
    setExpandedTaskId(newItem.id);
    showToast('Adicionado com micro-passos!');
  };

  const handleStartEditItem = (id: string, initialContent: string) => {
    setEditingItemId(id);
    setEditingItemContent(initialContent);
  };

  const handleSaveEditItemForm = (
    id: string,
    energy?: number,
    complexity?: number,
    executionTime?: number,
    date?: string,
    time?: string
  ) => {
    if (!editingItemContent.trim()) {
      showToast('O conteúdo não pode estar vazio!');
      return;
    }
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        // Delegation regex extraction
        const delegationMatch = editingItemContent.match(/#([a-zA-ZÀ-ÿ0-9_-]+)/);
        const delegatedTo = delegationMatch ? delegationMatch[1] : undefined;

        return {
          ...item,
          content: editingItemContent.trim(),
          energy: item.type === 'task' ? (energy ?? item.energy) : undefined,
          complexity: item.type === 'task' ? (complexity ?? item.complexity) : undefined,
          executionTime: item.type === 'task' ? (executionTime ?? item.executionTime) : undefined,
          delegatedTo: delegatedTo !== undefined ? delegatedTo : item.delegatedTo,
          date: date ?? item.date,
          time: time !== undefined ? time : item.time
        };
      }
      return item;
    }));
    setEditingItemId(null);
    setEditingItemContent('');
    showToast('Item atualizado com sucesso!');
  };

  // Brain Dump organizer functions
  const handleBrainDumpOrganize = () => {
    if (!brainDumpText.trim()) return;
    setIsProcessingBrainDump(true);
    showToast('IA analisando o despejo de pensamentos...');

    if (aiEngine === 'local_llm') {
      if (localLLMState !== 'ready') {
        initLocalLLMWorker();
        showToast('IA Local carregando... Aguarde.');
        setIsProcessingBrainDump(false);
        setActiveTab('settings');
        return;
      }
      if (aiWorkerRef.current) {
        aiWorkerRef.current.postMessage({
          type: 'generate',
          data: { text: brainDumpText, mode: 'braindump' }
        });
      }
      return;
    }

    setTimeout(() => {
      const text = brainDumpText;
      
      const cleanBujoContent = (str: string) => {
        return str
          .replace(/^[,.\s-]+/, '')
          .replace(/^(?:preciso\s+(?:de\s+)?|tenho\s+(?:que|de)\s+|lembrar\s+(?:de|da|do)\s+|quero\s+|vou\s+|devo\s+)/i, '')
          .trim()
          .replace(/^\w/, (c) => c.toUpperCase());
      };

      const sentences = text
        .split(/(?:[.\n!?]|\be\s+(?:também|preciso|tenho|vou|devo)\b)/i)
        .map(s => s.trim())
        .filter(s => s.length > 3);

      const dumpTasks: BujoItem[] = [];
      const dumpEvents: BujoItem[] = [];
      const dumpNotes: BujoItem[] = [];
      
      let emotion = 'Estado neutro com tendência à reflexão';
      const textLower = text.toLowerCase();
      
      const anxietyKeywords = BRAIN_DUMP_KEYWORDS.anxiety;
      const fatigueKeywords = BRAIN_DUMP_KEYWORDS.fatigue;
      const positiveKeywords = BRAIN_DUMP_KEYWORDS.positive;

      if (anxietyKeywords.some(w => textLower.includes(w))) {
        emotion = '⚠️ Identificamos ansiedade relacionada a prazos ou volume de tarefas.';
      } else if (fatigueKeywords.some(w => textLower.includes(w))) {
        emotion = '🔋 Identificamos fadiga física ou mental. Considere descansar.';
      } else if (positiveKeywords.some(w => textLower.includes(w))) {
        emotion = '✨ Foco otimista e positivo. Excelente momento para iniciar!';
      }

      sentences.forEach((sentence, index) => {
        const cleaned = cleanBujoContent(sentence);
        const lowerCleaned = cleaned.toLowerCase();
        
        const timeMatch = sentence.match(/(\d{1,2})h(\d{2})?|(\d{1,2}):(\d{2})/i);
        const isEvent = BRAIN_DUMP_KEYWORDS.events.some(w => lowerCleaned.includes(w));
        
        if (timeMatch || isEvent) {
          let time = '12:00';
          if (timeMatch) {
            const h = timeMatch[1] || timeMatch[3];
            const m = timeMatch[2] || timeMatch[4] || '00';
            time = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
          }
          const eventContent = cleaned.replace(/(\d{1,2})h(\d{2})?|(\d{1,2}):(\d{2})/gi, '').trim();
          dumpEvents.push({
            id: `${Date.now() + index}-${Math.random().toString(36).substring(2, 11)}`,
            type: 'event',
            status: 'open',
            content: eventContent,
            date: getLocalDateString(),
            time: time,
            createdAt: new Date().toISOString()
          });
        } else if (['sinto', 'estou', 'pensando', 'acho', 'triste', 'feliz', 'ansioso', 'cansado', 'bonito', 'legal'].some(w => lowerCleaned.includes(w))) {
          dumpNotes.push({
            id: `${Date.now() + index}-${Math.random().toString(36).substring(2, 11)}`,
            type: 'note',
            status: 'open',
            content: cleaned,
            date: getLocalDateString(),
            createdAt: new Date().toISOString()
          });
        } else {
          dumpTasks.push({
            id: `${Date.now() + index}-${Math.random().toString(36).substring(2, 11)}`,
            type: 'task',
            status: 'open',
            content: cleaned,
            date: getLocalDateString(),
            createdAt: new Date().toISOString()
          });
        }
      });

      setBrainDumpResult({ tasks: dumpTasks, events: dumpEvents, notes: dumpNotes, emotion });
      setIsProcessingBrainDump(false);
      showToast('Mente organizada em blocos!');
    }, 2000);
  };

  const addBrainDumpItemsToBujo = () => {
    if (!brainDumpResult) return;
    const all = [...brainDumpResult.tasks, ...brainDumpResult.events, ...brainDumpResult.notes];
    setItems(prev => [...all, ...prev]);
    setBrainDumpText('');
    setBrainDumpResult(null);
    showToast('Tudo adicionado ao seu Bullet Journal!');
    setActiveTab('daily_log');
  };

  const appendBrainDumpTrigger = (trigger: string) => {
    setBrainDumpText(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n${trigger}` : trigger;
    });
    showToast(`"${trigger}" adicionado ao despejo!`);
  };

  const getSubtaskCompletionString = (item: BujoItem) => {
    if (!item.subtasks || item.subtasks.length === 0) return '';
    const completed = item.subtasks.filter(s => s.completed).length;
    return `(${completed}/${item.subtasks.length})`;
  };

  // AISuggestions steps handlers
  const handleToggleCustomStep = (category: 'high' | 'low' | 'unlock', index: number) => {
    if (!customSteps) return;
    setCustomSteps(prev => {
      if (!prev) return null;
      const updated = [...prev[category]];
      updated[index] = { ...updated[index], enabled: !updated[index].enabled };
      return { ...prev, [category]: updated };
    });
  };

  const handleEditCustomStep = (category: 'high' | 'low' | 'unlock', index: number, text: string) => {
    if (!customSteps) return;
    setCustomSteps(prev => {
      if (!prev) return null;
      const updated = [...prev[category]];
      updated[index] = { ...updated[index], text };
      return { ...prev, [category]: updated };
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

  // Future Log Add Event Form
  const handleAddFutureEvent = (
    e: React.FormEvent,
    content: string,
    setContent: (v: string) => void,
    type: 'task' | 'event' | 'note',
    icon?: string,
    time?: string,
    energy?: number,
    complexity?: number,
    executionTime?: number
  ) => {
    e.preventDefault();
    if (!content.trim()) return;

    const { cleanContent, links } = extractLinksFromText(content);
    const extractedSubtasks = links.map((lnk, lIdx) => ({
      id: `st-${Date.now()}-${lIdx}-${Math.random().toString(36).substring(2, 5)}`,
      content: lnk,
      completed: false
    }));

    const year = new Date().getFullYear();
    const dateStr = `${year}-${(selectedMonth + 1).toString().padStart(2, '0')}-01`;

    const newEvent: BujoItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type,
      status: 'open',
      content: cleanContent,
      date: dateStr,
      time: time || undefined,
      subtasks: type === 'task' ? extractedSubtasks : undefined,
      icon,
      energy: type === 'task' ? energy : undefined,
      complexity: type === 'task' ? complexity : undefined,
      executionTime: type === 'task' ? executionTime : undefined
    };

    setItems(prev => [newEvent, ...prev]);
    setContent('');
    showToast(type === 'task' ? 'Tarefa agendada no Future Log!' : type === 'event' ? 'Evento agendado no Future Log!' : 'Nota salva no Future Log!');
  };

  // PDF Exportation
  const exportToPDF = async () => {
    showToast('Gerando PDF com os dados das tarefas...');

    try {
      const dateStr = selectedDate;
      const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const dateItems = items.filter(item => item.date === dateStr);
      const tasks = dateItems.filter(item => item.type === 'task');

      const pdf = new jsPDF('p', 'mm', 'a4');
      let y = 20;
      const pageHeight = 297;
      const margin = 15;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          pdf.addPage();
          y = 20; // reset y coordinate for new page
        }
      };

      // Header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(45, 42, 36);
      pdf.text(`Lista de Tarefas — ${formattedDate}`, margin, y);
      y += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(110, 110, 110);
      pdf.text('ADHD Bullet Journal & Planner — Central de Organização e Hiperfoco', margin, y);
      y += 6;

      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, y, 210 - margin, y);
      y += 10;

      if (tasks.length === 0) {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(10);
        pdf.setTextColor(120, 120, 120);
        pdf.text('Nenhuma tarefa registrada para este dia.', margin, y);
      } else {
        tasks.forEach((task, idx) => {
          const subtasksCount = task.subtasks?.length || 0;
          const textLines = pdf.splitTextToSize(`${idx + 1}. ${task.content}`, 170);
          const neededHeight = (textLines.length * 6) + (subtasksCount * 5) + 8;
          checkPageBreak(neededHeight);

          // Draw status badge
          let statusText = 'Pendente';
          let statusBg = [254, 243, 199]; // amber-100
          let statusFg = [217, 119, 6];   // amber-600
          if (task.status === 'completed') {
            statusText = 'Concluída';
            statusBg = [209, 250, 229]; // emerald-100
            statusFg = [5, 150, 105];   // emerald-600
          } else if (task.status === 'migrated') {
            statusText = 'Migrada';
            statusBg = [243, 244, 246]; // gray-100
            statusFg = [107, 114, 128];  // gray-500
          } else if (task.status === 'cancelled') {
            statusText = 'Cancelada';
            statusBg = [254, 226, 226]; // red-100
            statusFg = [239, 68, 68];   // red-500
          }

          // Draw status badge rectangle
          pdf.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
          pdf.roundedRect(margin, y - 4, 16, 5, 0.8, 0.8, 'F');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7);
          pdf.setTextColor(statusFg[0], statusFg[1], statusFg[2]);
          pdf.text(statusText, margin + 1.5, y - 0.5);

          // Clean tags from description text for visual rendering
          let textWithoutTags = task.content;
          const contextRegex = /(@[a-zA-ZÀ-ÿ0-9_-]+)/g;
          const tagsFound = task.content.match(contextRegex) || [];
          tagsFound.forEach(tag => {
            textWithoutTags = textWithoutTags.replace(tag, '');
          });
          textWithoutTags = textWithoutTags.replace(/\s+/g, ' ').trim();

          // Print task description text
          pdf.setFont('helvetica', task.status === 'completed' ? 'normal' : 'bold');
          pdf.setFontSize(9.5);
          pdf.setTextColor(task.status === 'completed' ? 130 : 45, task.status === 'completed' ? 130 : 42, task.status === 'completed' ? 130 : 36);

          const mainTextLines = pdf.splitTextToSize(`${idx + 1}. ${textWithoutTags}`, 145);
          pdf.text(mainTextLines, margin + 19, y);
          const taskHeightUsed = mainTextLines.length * 4.5;

          // Draw tag badges next to/below description
          let tagX = margin + 19;
          const tagY = y + taskHeightUsed + 1.5;
          let drawTagLine = false;

          tagsFound.forEach(tag => {
            const lowerTag = tag.toLowerCase();
            let tagBg = [243, 244, 246];
            let tagFg = [107, 114, 128];
            if (lowerTag === '@computador') { tagBg = [219, 234, 254]; tagFg = [37, 99, 235]; }
            else if (lowerTag === '@online') { tagBg = [207, 250, 254]; tagFg = [8, 145, 178]; }
            else if (lowerTag === '@rua') { tagBg = [254, 243, 199]; tagFg = [217, 119, 6]; }
            else if (lowerTag === '@casa') { tagBg = [209, 250, 229]; tagFg = [5, 150, 105]; }
            else if (lowerTag === '@trabalhando') { tagBg = [243, 232, 255]; tagFg = [147, 51, 234]; }
            else if (lowerTag === '@mestrado') { tagBg = [224, 231, 255]; tagFg = [79, 70, 229]; }
            else if (lowerTag === '@programando') { tagBg = [255, 237, 213]; tagFg = [234, 88, 12]; }
            else if (lowerTag === '@aguardando') { tagBg = [255, 228, 230]; tagFg = [225, 29, 72]; }

            const textWidth = pdf.getTextWidth(tag);
            const badgeW = textWidth + 3;

            if (tagX + badgeW > 200 - margin) return;

            pdf.setFillColor(tagBg[0], tagBg[1], tagBg[2]);
            pdf.roundedRect(tagX, tagY - 3, badgeW, 4.2, 0.8, 0.8, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(6.5);
            pdf.setTextColor(tagFg[0], tagFg[1], tagFg[2]);
            pdf.text(tag, tagX + 1.5, tagY);
            tagX += badgeW + 1.5;
            drawTagLine = true;
          });

          y += taskHeightUsed + (drawTagLine ? 6 : 2.5);

          // Draw metadata
          const metaList = [];
          if (task.delegatedTo) metaList.push(`Delegado: @${task.delegatedTo}`);
          if (task.energy) metaList.push(`Energia: ${'⚡'.repeat(task.energy)}`);
          if (task.complexity) metaList.push(`Dificuldade: ${'🧠'.repeat(task.complexity)}`);
          if (task.executionTime) metaList.push(`Tempo: ${task.executionTime} min`);

          if (metaList.length > 0) {
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(8);
            pdf.setTextColor(120, 120, 120);
            pdf.text(`   • ${metaList.join(' | ')}`, margin + 19, y);
            y += 4.5;
          }

          // Draw subtasks
          if (task.subtasks && task.subtasks.length > 0) {
            task.subtasks.forEach(sub => {
              const subIcon = sub.completed ? '[X]' : '[ ]';
              const subText = `${subIcon} ${sub.icon || ''} ${sub.content}${sub.executionTime ? ` (${sub.executionTime} min)` : ''}`;
              const splitSub = pdf.splitTextToSize(subText, 140);
              
              pdf.setFont('helvetica', 'normal');
              pdf.setFontSize(8);
              pdf.setTextColor(sub.completed ? 160 : 90);
              pdf.text(splitSub, margin + 24, y);
              y += (splitSub.length * 4);
            });
          }

          y += 3.5; // space between tasks
        });
      }

      // Format filename with current export date and time
      const now = new Date();
      const exportDay = String(now.getDate()).padStart(2, '0');
      const exportMonth = String(now.getMonth() + 1).padStart(2, '0');
      const exportYear = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const filename = `bujo-export-${exportDay}-${exportMonth}-${exportYear}_${hours}h${minutes}m${seconds}s.pdf`;

      pdf.save(filename);
      showToast('Exportado com sucesso!');
    } catch (e) {
      console.error(e);
      showToast('Erro ao exportar arquivo.');
    }
  };

  const handlePrint = () => {
    window.print();
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

  // Wrapped assignItemToTime to auto-supply setSelectedHourToSchedule
  const assignItemToTime = (itemId: string, timeStr: string) => {
    itemsData.assignItemToTime(itemId, timeStr, setSelectedHourToSchedule);
  };

  // Font class resolver
  const currentFontClass = () => {
    if (settings.font === 'dyslexic') return 'font-dyslexic';
    if (settings.font === 'mono') return 'font-mono';
    return 'font-sans';
  };

  return (
    <BujoContext.Provider value={{
      showFeatureHelpModal,
      setShowFeatureHelpModal,
      viewedFeatureHelp,
      setViewedFeatureHelp,

      // Sync status
      syncStatus,
      handleRetrySync,

      // Items
      ...itemsData,
      handleSaveEditItem: (...args: Parameters<typeof itemsData.handleSaveEditItem>) => {
        itemsData.handleSaveEditItem(...args);
        setEditingItemId(null);
        setEditingItemContent('');
      },
      handleEditSomedayItemContent: (id: string, newContent: string) => {
        itemsData.handleEditSomedayItemContent(id, newContent);
        setEditingItemId(null);
      },
      assignItemToTime,
      handleDeleteItem: handleDeleteItemWithConfirm,

      // Settings
      ...settingsData,
      currentFontClass,

      // Collections
      ...collectionsData,
      collections,
      setCollections,
      migrateCollectionItemToDailyLog,
      handleDeleteCollection,
      handleReorderCollections: collectionsData.handleReorderCollections,
      handleReorderCollectionItems: collectionsData.handleReorderCollectionItems,
      handleReorderCollectionSubtasks: collectionsData.handleReorderCollectionSubtasks,

      // Pomodoro
      ...pomodoroData,

      // Audio
      ...audioData,

      // Global context states
      userXp,
      setUserXp,
      anxietyLevel,
      setAnxietyLevel,
      currentEnergy,
      setCurrentEnergy,
      activeTab,
      setActiveTab,
      selectedDate,
      setSelectedDate,
      showOverloadReliefModal,
      setShowOverloadReliefModal,
      showToast,
      toastMessage,
      setToastMessage,
      focoActive,
      setFocoActive,
      selectedHourToSchedule,
      setSelectedHourToSchedule,

      // Confirmation Modal
      confirmModal,
      setConfirmModal,
      askConfirmation,

      // AI States
      aiEngine,
      setAiEngine,
      localLLMState,
      setLocalLLMState,
      localLLMProgress,
      localLLMError,
      initLocalLLMWorker,
      aiWorkerRef,
      showAIDownloadModal,
      setShowAIDownloadModal,
      handleConfirmAIDownload,
      handleDeclineAIDownload,
      breakingTaskIds,
      setBreakingTaskIds,
      activeLLMSplitTaskId,
      setActiveLLMSplitTaskId,
      activeLLMCollectionItemId,
      setActiveLLMCollectionItemId,
      aiSuggestions,
      setAiSuggestions,
      customSteps,
      setCustomSteps,
      isOptimizingTask,
      setIsOptimizingTask,
      handleAISplitTask,
      handleAIOptimizeTask,

      // Habits
      ...habitData,
      toggleHabitDate: (habit: string, dateStr: string) => habitData.toggleHabitDate(habit, dateStr, setUserXp, showToast),
      handleAddHabit: (name: string) => habitData.handleAddHabit(name, showToast),
      handleDeleteHabit: (habit: string) => habitData.handleDeleteHabit(habit, showToast),

      // Data Management
      exportFullDataJSON,
      importFullDataJSON,
      exportTasksToCSV,
      handleClearAllData,
      showGlobalSearch,
      setShowGlobalSearch,
      deferredPrompt,
      setDeferredPrompt,
      isOnline,
      setIsOnline,

      // Extra states & handlers relocated from App.tsx
      showTutorial,
      setShowTutorial,
      showEnergyGuide,
      setShowEnergyGuide,
      brainDumpText,
      setBrainDumpText,
      isProcessingBrainDump,
      setIsProcessingBrainDump,
      brainDumpResult,
      setBrainDumpResult,
      standardInput,
      setStandardInput,
      standardType,
      setStandardType,
      standardDate,
      setStandardDate,
      standardTime,
      setStandardTime,
      rapidText,
      setRapidText,
      rapidType,
      setRapidType,
      rapidTime,
      setRapidTime,
      rapidPriority,
      setRapidPriority,
      showRapidLog,
      setShowRapidLog,
      showAutocomplete,
      setShowAutocomplete,
      autocompleteSearch,
      setAutocompleteSearch,
      autocompleteIndex,
      setAutocompleteIndex,
      showAutocompleteRapid,
      setShowAutocompleteRapid,
      autocompleteIndexRapid,
      setAutocompleteIndexRapid,
      editingItemId,
      setEditingItemId,
      editingItemContent,
      setEditingItemContent,
      expandedTaskId,
      setExpandedTaskId,
      newSubtaskText,
      setNewSubtaskText,
      currentMaxQuote,
      setCurrentMaxQuote,
      handleAskMaxForQuote,
      getCognitiveLoad,
      getHarmonyScore,
      getHarmonyRecommendation,
      handleStandardInputChange,
      handleStandardInputKeyDown,
      handleRapidInputChange,
      handleRapidInputKeyDown,
      selectCollectionAutocomplete,
      selectCollectionAutocompleteRapid,
      handleSaveRapidLog,
      renderRealTimeSuggestions,
      createStandardTaskWithSuggestions,
      createRapidTaskWithSuggestions,
      handleStartEditItem,
      handleSaveEditItemForm,
      handleBrainDumpOrganize,
      addBrainDumpItemsToBujo,
      appendBrainDumpTrigger,
      getSubtaskCompletionString,
      handleToggleCustomStep,
      handleEditCustomStep,
      handleRemoveCustomStep,
      handleAddCustomStep,
      handleApplyAISuggestion,

      // Timeline Specific
      timelineMobileView,
      setTimelineMobileView,
      hours,
      openTasksUnscheduled,

      // Future Log Specific
      selectedMonth,
      setSelectedMonth,
      months,
      futureLogEventContent,
      setFutureLogEventContent,
      handleAddFutureEvent,

      // Media
      exportToPDF,
      handlePrint
    }}>
      {children}
    </BujoContext.Provider>
  );
}

export function useBujo() {
  const context = useContext(BujoContext);
  if (context === undefined) {
    throw new Error('useBujo must be used within a BujoProvider');
  }
  return context;
}
