import { createContext, useContext, ReactNode, useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { BujoItem, BujoSettings, Collection, DreamItem, ConfirmationModalConfig } from '../types';
import { useBujoItems } from '../hooks/useBujoItems';
import { useBujoSettings } from '../hooks/useBujoSettings';
import { useCollections } from '../hooks/useCollections';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';
import { useAmbientAudio, SoundType } from '../hooks/useAmbientAudio';
import { useHabits, HabitLog } from '../hooks/useHabits';
import { useTaskNotifications } from '../hooks/useTaskNotifications';
import { maxQuotes, getLocalDateString, getWeekdaysForDate, extractLinksFromText, deduplicateBujoItems } from '../utils/plannerUtils';
import { HOURS, MONTHS } from '../utils/constants';

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

  // Lixeira
  trashItems: BujoItem[];
  handleRestoreItem: (id: string) => void;
  handleDeletePermanently: (id: string) => void;
  handleEmptyTrash: () => void;
  handleUpdateItemDelegatedTo: (id: string, delegatedTo: string) => void;
  handleUpdateItemIcon: (id: string, icon: string) => void;

  // Dream Board
  dreams: DreamItem[];
  handleAddDream: (title: string, category: string, icon?: string, description?: string) => void;
  handleToggleDreamConquered: (id: string) => void;
  handleDeleteDream: (id: string) => void;
  handleReorderDreams: (activeId: string, overId: string) => void;

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
  handleEditHabit: (oldName: string, newName: string) => void;
  habitDreamMap: { [habitName: string]: string };
  updateHabitDreamLink: (habitName: string, dreamId: string) => void;

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
  activeTab: 'indice' | 'daily_log' | 'weekly_log' | 'monthly_log' | 'daily_spread' | 'future_log' | 'settings' | 'collections' | 'trash' | 'dream_board' | 'landing_page';
  setActiveTab: React.Dispatch<React.SetStateAction<'indice' | 'daily_log' | 'weekly_log' | 'monthly_log' | 'daily_spread' | 'future_log' | 'settings' | 'collections' | 'trash' | 'dream_board' | 'landing_page'>>;
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

  // Autocomplete, form, and dialog states relocated from App.tsx
  showTutorial: boolean;
  setShowTutorial: React.Dispatch<React.SetStateAction<boolean>>;
  showEnergyGuide: boolean;
  setShowEnergyGuide: React.Dispatch<React.SetStateAction<boolean>>;
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
  rapidIcon: string;
  setRapidIcon: React.Dispatch<React.SetStateAction<string>>;
  rapidDate: string;
  setRapidDate: React.Dispatch<React.SetStateAction<string>>;
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
  handleStartEditItem: (id: string, initialContent: string) => void;
  handleSaveEditItemForm: (id: string, energy?: number, complexity?: number, executionTime?: number, date?: string, time?: string) => void;
  getSubtaskCompletionString: (item: BujoItem) => string;


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

  const [activeTab, setActiveTab] = useState<'indice' | 'daily_log' | 'weekly_log' | 'monthly_log' | 'daily_spread' | 'future_log' | 'settings' | 'collections' | 'trash' | 'dream_board' | 'landing_page'>(() => {
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
  // Tracks whether the initial remote→local sync has completed.
  // Background writes are blocked until this is true to avoid overwriting
  // remote data with a stale local snapshot.
  const initialSyncDoneRef = useRef<boolean>(false);

  const serializeLocalBujoData = () => {
    const data: { [key: string]: any } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        key.startsWith('bujo_') &&
        key !== 'bujo_supabase_config' &&
        key !== 'bujo_offline_mode'
      ) {
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
    // Start with a union of both sides — keys from either device are included
    const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);
    const merged: any = {};

    // Terminal statuses that should never be downgraded by a remote 'open' snapshot
    const TERMINAL_STATUSES = new Set(['completed', 'cancelled']);

    // Generic shallow array merge by id (used for bujo_focus_items, habits, etc.)
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
            const mergedItem = { ...existing, ...item };
            // Preserve terminal status: completed/cancelled must never regress to open
            if (TERMINAL_STATUSES.has(existing.status) && !TERMINAL_STATUSES.has(item.status)) {
              mergedItem.status = existing.status;
            }
            map.set(key, mergedItem);
          } else {
            map.set(key, item);
          }
        } else {
          map.set(item, item);
        }
      });
      return Array.from(map.values());
    };

    // Deep merge for bujo_collections: merges the collection list by id,
    // and within each collection merges the nested items, subtasks and media by id.
    // This prevents production's item statuses/notes from being wiped by a local snapshot.
    const COLLECTION_TERMINAL = new Set(['done', 'doing']);
    const mergeCollections = (locCols: any[], remCols: any[]): any[] => {
      const map = new Map<string, any>();

      remCols.forEach(col => {
        if (col?.id) map.set(col.id, col);
      });

      locCols.forEach(col => {
        if (!col?.id) return;
        const existing = map.get(col.id);
        if (!existing) {
          map.set(col.id, col);
          return;
        }

        // Merge the collection's own scalar/metadata fields (local wins for name/desc/icon)
        const mergedCol = { ...existing, ...col };

        // Deep-merge the items array inside the collection
        const remItems: any[] = existing.items || [];
        const locItems: any[] = col.items || [];
        const itemMap = new Map<string, any>();

        remItems.forEach((it: any) => {
          if (it?.id) itemMap.set(it.id, it);
        });

        locItems.forEach((it: any) => {
          if (!it?.id) return;
          const existingItem = itemMap.get(it.id);
          if (!existingItem) {
            itemMap.set(it.id, it);
            return;
          }

          const mergedItem = { ...existingItem, ...it };

          // Preserve terminal collection item status (done/doing > todo)
          if (COLLECTION_TERMINAL.has(existingItem.status) && !COLLECTION_TERMINAL.has(it.status)) {
            mergedItem.status = existingItem.status;
          }

          // Deep-merge subtasks by id
          const remSubs: any[] = existingItem.subtasks || [];
          const locSubs: any[] = it.subtasks || [];
          const subMap = new Map<string, any>();
          remSubs.forEach((s: any) => { if (s?.id) subMap.set(s.id, s); });
          locSubs.forEach((s: any) => {
            if (!s?.id) return;
            const existingSub = subMap.get(s.id);
            // For subtasks: prefer completed=true over false (irreversible action)
            if (existingSub) {
              subMap.set(s.id, { ...existingSub, ...s, completed: existingSub.completed || s.completed });
            } else {
              subMap.set(s.id, s);
            }
          });
          mergedItem.subtasks = Array.from(subMap.values());

          // Deep-merge media by id
          const remMedia: any[] = existingItem.media || [];
          const locMedia: any[] = it.media || [];
          const mediaMap = new Map<string, any>();
          remMedia.forEach((m: any) => { if (m?.id) mediaMap.set(m.id, m); });
          locMedia.forEach((m: any) => {
            if (!m?.id) return;
            mediaMap.set(m.id, { ...(mediaMap.get(m.id) || {}), ...m });
          });
          mergedItem.media = Array.from(mediaMap.values());

          // Merge notes: keep the longer/more complete version
          if (existingItem.notes && it.notes && existingItem.notes.length > it.notes.length) {
            mergedItem.notes = existingItem.notes;
          }

          itemMap.set(it.id, mergedItem);
        });

        mergedCol.items = Array.from(itemMap.values());
        map.set(col.id, mergedCol);
      });

      return Array.from(map.values());
    };

    for (const key of allKeys) {
      const localVal = local[key];
      const remoteVal = remote[key];

      // Key exists on only one side → use whichever has it
      if (localVal === undefined) {
        merged[key] = remoteVal;
        continue;
      }
      if (remoteVal === undefined) {
        merged[key] = localVal;
        continue;
      }

      // Both sides have the key — merge intelligently
      if (key === 'bujo_collections' && Array.isArray(localVal) && Array.isArray(remoteVal)) {
        // Deep merge: preserves item statuses, notes, subtasks and media from both devices
        merged[key] = mergeCollections(localVal, remoteVal);
      } else if (Array.isArray(localVal) && Array.isArray(remoteVal)) {
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
        // XP: keep the highest value between devices
        merged[key] = Math.max(Number(localVal) || 0, Number(remoteVal) || 0);
      } else {
        // Scalar: local always wins (most recent action)
        merged[key] = localVal !== null && localVal !== undefined ? localVal : remoteVal;
      }
    }

    if (Array.isArray(merged.bujo_focus_items)) {
      // Remove from active items any ID that the *merged* trash contains —
      // this prevents Supabase from resurrecting items deleted on any device.
      const mergedTrash: any[] = Array.isArray(merged.bujo_focus_trash_items)
        ? merged.bujo_focus_trash_items
        : [];
      const trashedIds = new Set(mergedTrash.map((t: any) => t?.id).filter(Boolean));

      if (trashedIds.size > 0) {
        merged.bujo_focus_items = merged.bujo_focus_items.filter(
          (item: any) => !item?.id || !trashedIds.has(item.id)
        );
      }

      merged.bujo_focus_items = deduplicateBujoItems(merged.bujo_focus_items);
    }

    return merged;
  };

  // Note: Synchronization hooks have been relocated below the state hooks initialization

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
    const itemToDelete = items.find(item => item.id === id);
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
    setActiveTab
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
    handleCreateCollection,
    handleCreateCollectionItem,
    handleDeleteCollectionItem,
    handleUpdateCollectionItemStatus,
    handleAddCollectionItemSubtask,
    handleToggleCollectionItemSubtask,
    handleDeleteCollectionItemSubtask,
    handleUploadCollectionItemMedia,
    handleAddCollectionItemMediaLink,
    handleDeleteCollectionItemMedia
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

  const [habitDreamMap, setHabitDreamMap] = useState<{ [habitName: string]: string }>(() => {
    const saved = localStorage.getItem('bujo_habit_dream_map');
    return saved ? JSON.parse(saved) : {};
  });

  const updateHabitDreamLink = (habitName: string, dreamId: string) => {
    const newMap = { ...habitDreamMap, [habitName]: dreamId };
    if (!dreamId) {
      delete newMap[habitName];
    }
    setHabitDreamMap(newMap);
    localStorage.setItem('bujo_habit_dream_map', JSON.stringify(newMap));
    showToast('Link do hábito atualizado! 🔗');
  };

  // Task Notifications Hook
  useTaskNotifications(items);

  const updateReactStatesFromSync = (mergedData: any) => {
    if (!mergedData) return;

    if (mergedData.bujo_focus_items) {
      itemsData.setItems(mergedData.bujo_focus_items);
    }

    if (mergedData.bujo_focus_trash_items) {
      itemsData.setTrashItems(mergedData.bujo_focus_trash_items);
    }
    if (mergedData.bujo_focus_dreams) {
      itemsData.setDreams(mergedData.bujo_focus_dreams);
    }
    if (mergedData.bujo_collections) {
      setCollections(mergedData.bujo_collections);
    }
    if (mergedData.bujo_focus_xp !== undefined) {
      setUserXp(Number(mergedData.bujo_focus_xp) || 0);
    }
    if (mergedData.bujo_focus_anxiety_level !== undefined) {
      setAnxietyLevel(Number(mergedData.bujo_focus_anxiety_level) || 3);
    }
    if (mergedData.bujo_focus_current_energy) {
      setCurrentEnergy(mergedData.bujo_focus_current_energy);
    }
    if (mergedData.bujo_feature_help_viewed) {
      setViewedFeatureHelp(mergedData.bujo_feature_help_viewed);
    }
    if (mergedData.bujo_focus_settings) {
      settingsData.setSettings(mergedData.bujo_focus_settings);
    }
    if (mergedData.bujo_habits) {
      habitData.setHabits(mergedData.bujo_habits);
    }
    if (mergedData.bujo_habit_logs) {
      habitData.setHabitLogs(mergedData.bujo_habit_logs);
    }
  };

  useEffect(() => {
    if (!supabase || !user) {
      setSyncStatus('offline');
      return;
    }

    let active = true;
    initialSyncDoneRef.current = false;

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
          // No remote record yet → push local as the canonical source
          const { error: insertError } = await supabase
            .from('bujo_user_data')
            .insert({ user_id: user.id, data: localData });

          if (insertError) throw insertError;
          if (active) {
            lastSyncHashRef.current = JSON.stringify(localData);
            initialSyncDoneRef.current = true;
            setSyncStatus('synced');
            showToast('☁️ Backup inicial criado no Supabase!');
          }
        } else {
          // Remote record exists → merge both sides, persist result everywhere
          const remoteData = row.data || {};
          const mergedData = mergeBujoData(localData, remoteData);

          // 1. Update localStorage with merged result
          Object.entries(mergedData).forEach(([key, val]) => {
            localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
          });

          // 2. Push merged result BACK to Supabase so all devices converge
          const { error: upsertError } = await supabase
            .from('bujo_user_data')
            .upsert({
              user_id: user.id,
              data: mergedData
            });

          if (upsertError) {
            console.warn('Could not push merged data back to Supabase:', upsertError);
          }

          if (active) {
            updateReactStatesFromSync(mergedData);
            lastSyncHashRef.current = JSON.stringify(mergedData);
            initialSyncDoneRef.current = true;
            setSyncStatus('synced');
            showToast('☁️ Dados sincronizados com o Supabase!');
          }
        }
      } catch (err: any) {
        console.error('Supabase sync error:', err);
        if (active) {
          // Allow background sync to proceed even if initial read failed
          initialSyncDoneRef.current = true;
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
      // Block background writes until the initial remote→local sync completes
      // to avoid overwriting the Supabase record with stale local data.
      if (!initialSyncDoneRef.current) return;

      const localData = serializeLocalBujoData();
      const currentHash = JSON.stringify(localData);

      if (currentHash === lastSyncHashRef.current) return;

      setSyncStatus('syncing');
      try {
        // Read remote first so we can merge, then push the merged result.
        // This makes background sync bidirectional: changes from other devices
        // are pulled in, not silently overwritten.
        const { data: row, error: readError } = await supabase
          .from('bujo_user_data')
          .select('data')
          .eq('user_id', user.id)
          .maybeSingle();

        if (readError) throw readError;

        let dataToSave = localData;

        if (row?.data) {
          const remoteHash = JSON.stringify(row.data);
          // Only re-merge if remote changed since last sync
          if (remoteHash !== lastSyncHashRef.current) {
            dataToSave = mergeBujoData(localData, row.data);
            // Apply remote changes to localStorage + React state
            Object.entries(dataToSave).forEach(([key, val]) => {
              localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
            });
            updateReactStatesFromSync(dataToSave);
          }
        }

        const { error: writeError } = await supabase
          .from('bujo_user_data')
          .upsert({
            user_id: user.id,
            data: dataToSave
          });

        if (writeError) throw writeError;

        lastSyncHashRef.current = JSON.stringify(dataToSave);
        setSyncStatus('synced');
      } catch (err: any) {
        console.error('Background sync error:', err);
        setSyncStatus('error');
        const msg = err?.message || JSON.stringify(err);
        showToast(`❌ Erro ao salvar na nuvem: ${msg}`);
      }
    };

    const interval = setInterval(checkAndSync, 10000);
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

        // Update localStorage with merged result
        Object.entries(mergedData).forEach(([key, val]) => {
          localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
        });

        // Push merged result back to Supabase so all devices converge
        const { error: upsertError } = await supabase
          .from('bujo_user_data')
          .upsert({ user_id: user.id, data: mergedData });

        if (upsertError) {
          console.warn('Could not push merged data to Supabase:', upsertError);
        }

        updateReactStatesFromSync(mergedData);
        lastSyncHashRef.current = JSON.stringify(mergedData);
        initialSyncDoneRef.current = true;
        setSyncStatus('synced');
        showToast('☁️ Dados sincronizados com o Supabase!');
      }
    } catch (err: any) {
      console.error('Manual sync retry error:', err);
      setSyncStatus('error');
      const msg = err?.message || err?.details || JSON.stringify(err);
      showToast(`❌ Erro ao re-sincronizar: ${msg}`);
    }
  };

  // Data Management Implementations
  const exportFullDataJSON = () => {
    const data = {
      items: itemsData.items,
      trashItems: itemsData.trashItems,
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
  


  const [standardInput, setStandardInput] = useState<string>('');
  const [standardType, setStandardType] = useState<'task' | 'event' | 'note'>('task');
  const [standardDate, setStandardDate] = useState<string>(() => getLocalDateString());
  const [standardTime, setStandardTime] = useState<string>('');

  const [rapidText, setRapidText] = useState<string>('');
  const [rapidType, setRapidType] = useState<'task' | 'event' | 'note'>('task');
  const [rapidTime, setRapidTime] = useState<string>('');
  const [rapidPriority, setRapidPriority] = useState<boolean>(false);
  const [rapidIcon, setRapidIcon] = useState<string>('');
  const [rapidDate, setRapidDate] = useState<string>(() => getLocalDateString());
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
    const relief = (completedTasks * 25) + (pomodoroData.completedPomodoros * 10);
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

    const newItem: BujoItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type: rapidType,
      status: 'open',
      content: cleanContent,
      date: rapidDate || getLocalDateString(),
      time: rapidTime || undefined,
      priority: rapidPriority,
      subtasks: undefined,
      icon: rapidIcon || (rapidType === 'task' ? '🎯' : undefined),
      link: links.length > 0 ? links.join(' ') : undefined
    };

    setItems(prev => [newItem, ...prev]);
    setRapidText('');
    setRapidTime('');
    setRapidPriority(false);
    setRapidIcon('');
    setRapidDate(getLocalDateString());
    showToast('Entrada salva com sucesso!');
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



  const getSubtaskCompletionString = (item: BujoItem) => {
    if (!item.subtasks || item.subtasks.length === 0) return '';
    const completed = item.subtasks.filter(s => s.completed).length;
    return `(${completed}/${item.subtasks.length})`;
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
      icon: icon || (type === 'task' ? '🎯' : undefined),
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



      // Habits
      ...habitData,
      toggleHabitDate: (habit: string, dateStr: string) => habitData.toggleHabitDate(habit, dateStr, setUserXp, showToast),
      handleAddHabit: (name: string) => habitData.handleAddHabit(name, showToast),
      handleDeleteHabit: (habit: string) => habitData.handleDeleteHabit(habit, showToast),
      handleEditHabit: (oldName: string, newName: string) => {
        const trimmed = newName.trim();
        if (!trimmed || trimmed === oldName) return;
        habitData.handleEditHabit(oldName, trimmed, showToast);
        setHabitDreamMap(prev => {
          const newMap = { ...prev };
          if (newMap[oldName]) {
            newMap[trimmed] = newMap[oldName];
            delete newMap[oldName];
          }
          localStorage.setItem('bujo_habit_dream_map', JSON.stringify(newMap));
          return newMap;
        });
      },
      habitDreamMap,
      updateHabitDreamLink,

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
      rapidIcon,
      setRapidIcon,
      rapidDate,
      setRapidDate,
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
      handleStartEditItem,
      handleSaveEditItemForm,
      getSubtaskCompletionString,

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
