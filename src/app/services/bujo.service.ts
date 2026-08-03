import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { getLocalDateString } from '../utils/smartParser';
import { AuthService } from './auth.service';
import { getIsoTimestamp, ensureTimestamps } from '../utils/syncUtils';
import { SyncStatusService } from './sync-status.service';

export interface BujoItem {
  id: string;
  content: string;
  type: 'task' | 'event' | 'note';
  status: 'todo' | 'completed' | 'cancelled' | 'in_progress' | 'migrated' | 'scheduled';
  date: string;
  time?: string;
  endTime?: string;
  priority?: boolean;
  delegatedTo?: string;
  energy?: number;
  complexity?: number;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  icon?: string;
  link?: string;
  description?: string;
  reminderType?: 'notification' | 'email' | 'both' | 'none';
  constantReminder?: boolean;
  subtasks?: any[];
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'none';
}

export function calculateNextRecurrenceDate(startDateStr: string, pattern: 'daily' | 'weekly' | 'monthly' | 'weekdays'): string {
  const d = new Date(startDateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return startDateStr;

  if (pattern === 'daily') {
    d.setDate(d.getDate() + 1);
  } else if (pattern === 'weekly') {
    d.setDate(d.getDate() + 7);
  } else if (pattern === 'monthly') {
    d.setMonth(d.getMonth() + 1);
  } else if (pattern === 'weekdays') {
    d.setDate(d.getDate() + 1);
    while (d.getDay() === 0 || d.getDay() === 6) {
      d.setDate(d.getDate() + 1);
    }
  }

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export interface BujoTag {
  id: string;
  label: string;
  colorClass: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface HabitItem {
  id: string;
  title: string;
  icon: string;
}

export interface BujoSettings {
  theme: string;
  font: string;
  pomodoroWorkTime: number;
  pomodoroBreakTime: number;
  pomodoroLongBreakTime: number;
  soundVolume: number;
  soundEnabled: boolean;
  selectedCompanion: string;
}

@Injectable({
  providedIn: 'root'
})
export class BujoService {
  // Observables for state
  private itemsSubject = new BehaviorSubject<BujoItem[]>([]);
  public items$: Observable<BujoItem[]> = this.itemsSubject.asObservable();

  private _highlightItemId = new BehaviorSubject<string | null>(null);
  public highlightItemId$ = this._highlightItemId.asObservable();

  setHighlightItemId(id: string | null) {
    this._highlightItemId.next(id);
  }

  private _selectedDate = new BehaviorSubject<string>(getLocalDateString());
  public selectedDate$ = this._selectedDate.asObservable();

  get selectedDate(): string {
    return this._selectedDate.value;
  }

  setSelectedDate(dateStr: string) {
    this._selectedDate.next(dateStr);
  }

  private settingsSubject = new BehaviorSubject<BujoSettings>({
    theme: 'dark',
    font: 'sans',
    pomodoroWorkTime: 25,
    pomodoroBreakTime: 5,
    pomodoroLongBreakTime: 15,
    soundVolume: 50,
    soundEnabled: true,
    selectedCompanion: 'tanjiro'
  });
  public settings$: Observable<BujoSettings> = this.settingsSubject.asObservable();

  private collectionsSubject = new BehaviorSubject<any[]>([]);
  public collections$: Observable<any[]> = this.collectionsSubject.asObservable();

  private habitsSubject = new BehaviorSubject<string[]>([]);
  public habits$: Observable<string[]> = this.habitsSubject.asObservable();

  private habitLogsSubject = new BehaviorSubject<Record<string, string[]>>({});
  public habitLogs$: Observable<Record<string, string[]>> = this.habitLogsSubject.asObservable();

  private dreamsSubject = new BehaviorSubject<any[]>([]);
  public dreams$: Observable<any[]> = this.dreamsSubject.asObservable();

  private trashSubject = new BehaviorSubject<BujoItem[]>([]);
  public trash$: Observable<BujoItem[]> = this.trashSubject.asObservable();

  private tagsSubject = new BehaviorSubject<BujoTag[]>([]);
  public tags$: Observable<BujoTag[]> = this.tagsSubject.asObservable();

  constructor(
    private authService: AuthService,
    private syncStatusService: SyncStatusService
  ) {
    this.loadAllData();
    this.syncStatusService.dataSynced$.subscribe(() => {
      this.loadAllData();
    });
  }

  public loadAllData() {
    this.itemsSubject.next(this.getParsedStorage('bujo_items', []));
    this.settingsSubject.next(this.getParsedStorage('bujo_settings', this.settingsSubject.value));
    this.collectionsSubject.next(this.getParsedStorage('bujo_collections', []));
    this.habitsSubject.next(this.getParsedStorage('bujo_habits', []));
    this.habitLogsSubject.next(this.getParsedStorage('bujo_habit_logs', {}));
    this.dreamsSubject.next(this.getParsedStorage('bujo_focus_dreams', []));
    this.trashSubject.next(this.getParsedStorage('bujo_focus_trash_items', []));
    
    const savedTags = this.getParsedStorage('bujo_tags', null);
    if (savedTags && savedTags.length > 0) {
      this.tagsSubject.next(savedTags);
    } else {
      this.tagsSubject.next(this.getDefaultTags());
      this.saveToStorage('bujo_tags', this.tagsSubject.value);
    }
  }

  private getDefaultTags(): BujoTag[] {
    return [
      { id: '@computador', label: 'computador', colorClass: 'bg-blue-500/10 text-blue-600 border-blue-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 border' },
      { id: '@online', label: 'online', colorClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 border' },
      { id: '@rua', label: 'rua', colorClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 border' },
      { id: '@casa', label: 'casa', colorClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 border' },
      { id: '@trabalho', label: 'trabalho', colorClass: 'bg-purple-500/10 text-purple-600 border-purple-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 border' },
      { id: '@trabalhando', label: 'trabalhando', colorClass: 'bg-purple-500/10 text-purple-600 border-purple-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 border' },
      { id: '@mestrado', label: 'mestrado', colorClass: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 border' },
      { id: '@programando', label: 'programando', colorClass: 'bg-orange-500/10 text-orange-600 border-orange-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 border' },
      { id: '@reuniao', label: 'reuniao', colorClass: 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 border' },
      { id: '@financeiro', label: 'financeiro', colorClass: 'bg-green-500/10 text-green-600 border-green-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 border' },
      { id: '@infra', label: 'infra', colorClass: 'bg-slate-500/10 text-slate-600 border-slate-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 border' },
      { id: '@seguranca', label: 'seguranca', colorClass: 'bg-red-500/10 text-red-600 border-red-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 border' },
      { id: '@aguardando', label: 'aguardando', colorClass: 'bg-rose-500/10 text-rose-600 border-rose-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-0.5 border' }
    ];
  }

  private getParsedStorage(key: string, defaultValue: any): any {
    const val = localStorage.getItem(key);
    if (!val) return defaultValue;
    try {
      return JSON.parse(val);
    } catch {
      return defaultValue;
    }
  }

  private syncTimeout: any;

  private saveToStorage(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
    
    // Auto-sync debounced
    const user = this.authService.currentUser;
    if (user && user.id !== 'anonymous-user-id') {
      if (this.syncTimeout) {
        clearTimeout(this.syncTimeout);
      }
      this.syncTimeout = setTimeout(() => {
        this.authService.uploadLocalToCloud(user.id);
      }, 3000);
    }
  }

  // Items Actions
  getItems(): BujoItem[] {
    return this.itemsSubject.value;
  }

  saveItems(newItems: BujoItem[]) {
    const sanitized = newItems.map(item => ensureTimestamps(item));
    this.itemsSubject.next(sanitized);
    this.saveToStorage('bujo_items', sanitized);
  }

  addItem(item: Partial<BujoItem>) {
    const items = this.getItems();
    const now = getIsoTimestamp();
    const newItem: BujoItem = {
      id: item.id || Math.random().toString(36).substring(2, 9),
      content: item.content || 'Nova tarefa',
      type: item.type || 'task',
      status: item.status || 'todo',
      date: item.date || new Date().toISOString().split('T')[0],
      createdAt: now,
      updatedAt: now,
      ...item
    };
    this.saveItems([...items, newItem]);
  }

  deleteItem(id: string) {
    const items = this.getItems();
    const itemToDelete = items.find(i => i.id === id);
    if (itemToDelete) {
      const now = getIsoTimestamp();
      const trashedItem: BujoItem = {
        ...itemToDelete,
        updatedAt: now,
        deletedAt: now
      };
      // Add to trash without duplicate ID
      const currentTrash = this.trashSubject.value;
      const newTrash = [...currentTrash.filter(i => i.id !== id), trashedItem];
      this.trashSubject.next(newTrash);
      this.saveToStorage('bujo_focus_trash_items', newTrash);
      
      // Remove from active
      this.saveItems(items.filter(item => item.id !== id));
    }
  }

  restoreItem(id: string) {
    const currentTrash = this.trashSubject.value;
    const itemToRestore = currentTrash.find(i => i.id === id);
    if (itemToRestore) {
      const now = getIsoTimestamp();
      const restoredItem: BujoItem = {
        ...itemToRestore,
        updatedAt: now,
        deletedAt: undefined
      };
      // Remove from trash
      const newTrash = currentTrash.filter(i => i.id !== id);
      this.trashSubject.next(newTrash);
      this.saveToStorage('bujo_focus_trash_items', newTrash);
      
      // Add back to active
      const items = this.getItems();
      this.saveItems([...items, restoredItem]);
    }
  }

  updateItem(id: string, updates: Partial<BujoItem>) {
    const items = this.getItems();
    const now = getIsoTimestamp();
    const existing = items.find(i => i.id === id);

    let updatedList = items.map(item => item.id === id ? { ...item, ...updates, updatedAt: now } : item);

    // Auto-recurrence spawn logic
    if (existing && updates.status === 'completed' && existing.status !== 'completed') {
      const recurrence = updates.recurrence || existing.recurrence;
      if (recurrence && recurrence !== 'none') {
        const currentDate = updates.date || existing.date || getLocalDateString();
        const nextDate = calculateNextRecurrenceDate(currentDate, recurrence);
        
        // Check if next recurrence already exists
        const existsNext = items.some(i => i.content === existing.content && i.date === nextDate && !i.deletedAt);
        if (!existsNext) {
          const nextItem: BujoItem = {
            id: Math.random().toString(36).substring(2, 9),
            content: existing.content,
            type: existing.type || 'task',
            status: 'todo',
            date: nextDate,
            recurrence: recurrence,
            priority: existing.priority,
            delegatedTo: existing.delegatedTo,
            energy: existing.energy,
            complexity: existing.complexity,
            createdAt: now,
            updatedAt: now
          };
          updatedList = [...updatedList, nextItem];
          
          this.syncStatusService.showToast({
            type: 'success',
            message: `🔄 Tarefa recorrente agendada para ${nextDate}!`
          });
        }
      }
    }

    this.saveItems(updatedList);
  }

  // Habits Actions
  getHabits(): string[] {
    return this.getHabitItems().map(h => h.title);
  }

  getHabitItems(): HabitItem[] {
    const deletedHabits: string[] = this.getParsedStorage('bujo_deleted_habits', []);
    const isInitialized = typeof localStorage !== 'undefined' && localStorage.getItem('bujo_habits_init_v1') === 'true';
    if (!isInitialized) {
      const defaultHabits: HabitItem[] = [
        { id: '1', title: 'Água', icon: 'droplet' },
        { id: '2', title: 'Mestrado', icon: 'graduation-cap' },
        { id: '3', title: 'Musculação', icon: 'dumbbell' },
        { id: '4', title: 'Óleo/Água', icon: 'car' },
        { id: '5', title: 'Lixo', icon: 'trash' },
        { id: '6', title: 'Medicamento', icon: 'pill' }
      ];
      const filteredDefaults = defaultHabits.filter(h => !deletedHabits.includes(h.id) && !deletedHabits.includes(h.title));
      this.saveToStorage('bujo_habit_items', filteredDefaults);
      this.saveToStorage('bujo_habits', filteredDefaults.map(h => h.title));
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('bujo_habits_init_v1', 'true');
      }
      return filteredDefaults;
    }
    const rawItems: HabitItem[] = this.getParsedStorage('bujo_habit_items', []);
    return rawItems.filter(h => !deletedHabits.includes(h.id) && !deletedHabits.includes(h.title));
  }

  addHabit(habit: string, icon: string = 'target') {
    this.addHabitItem(habit, icon);
  }

  addHabitItem(title: string, icon: string = 'target') {
    const items = this.getHabitItems();
    
    // Remove title from deleted habits blacklist if user re-adds it
    const deletedHabits: string[] = this.getParsedStorage('bujo_deleted_habits', []);
    const updatedBlacklist = deletedHabits.filter(d => d !== title);
    this.saveToStorage('bujo_deleted_habits', updatedBlacklist);

    if (!items.some(h => h.title === title)) {
      const newItem: HabitItem = {
        id: Date.now().toString(),
        title,
        icon: icon || 'target'
      };
      const updated = [...items, newItem];
      this.saveToStorage('bujo_habit_items', updated);
      this.saveToStorage('bujo_habits', updated.map(h => h.title));
      this.habitsSubject.next(updated.map(h => h.title));
    }
  }

  removeHabit(habit: string) {
    this.removeHabitItem(habit);
  }

  removeHabitItem(idOrTitle: string) {
    const currentItems = this.getHabitItems();
    const itemToRemove = currentItems.find(h => h.id === idOrTitle || h.title === idOrTitle);
    const updatedItems = currentItems.filter(h => h.id !== idOrTitle && h.title !== idOrTitle);

    // Save ID and title to deleted habits blacklist to prevent cloud sync resurrection
    const deletedHabits: string[] = this.getParsedStorage('bujo_deleted_habits', []);
    if (idOrTitle && !deletedHabits.includes(idOrTitle)) {
      deletedHabits.push(idOrTitle);
    }
    if (itemToRemove && itemToRemove.id && !deletedHabits.includes(itemToRemove.id)) {
      deletedHabits.push(itemToRemove.id);
    }
    if (itemToRemove && itemToRemove.title && !deletedHabits.includes(itemToRemove.title)) {
      deletedHabits.push(itemToRemove.title);
    }

    this.saveToStorage('bujo_deleted_habits', deletedHabits);
    this.saveToStorage('bujo_habit_items', updatedItems);
    this.saveToStorage('bujo_habits', updatedItems.map(h => h.title));
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('bujo_habits_init_v1', 'true');
    }
    this.habitsSubject.next(updatedItems.map(h => h.title));
  }

  getHabitLogs(): Record<string, string[]> {
    return this.habitLogsSubject.value || {};
  }

  isHabitCompleted(dateStr: string, habitName: string): boolean {
    const logs = this.getHabitLogs();
    const dateLogs = logs[dateStr] || [];
    return dateLogs.includes(habitName);
  }

  toggleHabitForDate(dateStr: string, habitName: string): boolean {
    const logs = { ...this.getHabitLogs() };
    const dateLogs = logs[dateStr] ? [...logs[dateStr]] : [];

    const index = dateLogs.indexOf(habitName);
    let isCompleted = false;
    if (index >= 0) {
      dateLogs.splice(index, 1);
      isCompleted = false;
    } else {
      dateLogs.push(habitName);
      isCompleted = true;
    }

    logs[dateStr] = dateLogs;
    this.habitLogsSubject.next(logs);
    this.saveToStorage('bujo_habit_logs', logs);

    // Immediate Cloud Sync when toggling habit
    const user = this.authService.currentUser;
    if (user && user.id !== 'anonymous-user-id') {
      this.authService.uploadLocalToCloud(user.id);
    }

    return isCompleted;
  }

  // Budget storage items getters (returns arrays)
  getBudgetFixed(): any[] {
    return this.getParsedStorage('bujo_budget_fixed', []);
  }

  getBudgetInstallments(): any[] {
    return this.getParsedStorage('bujo_budget_installments', []);
  }

  getBudgetDebts(): any[] {
    return this.getParsedStorage('bujo_budget_debts', []);
  }

  getBudgetNew(): any[] {
    return this.getParsedStorage('bujo_budget_new', []);
  }
  
  // Tag Management
  getTags(): BujoTag[] {
    return this.tagsSubject.value;
  }
  
  saveTags(tags: BujoTag[]) {
    this.tagsSubject.next(tags);
    this.saveToStorage('bujo_tags', tags);
  }
  
  addTag(tag: BujoTag) {
    this.saveTags([...this.getTags(), tag]);
  }
  
  updateTag(oldId: string, newTag: BujoTag) {
    const tags = this.getTags().map(t => t.id === oldId ? newTag : t);
    this.saveTags(tags);
    
    if (oldId !== newTag.id) {
      let items = this.getItems();
      let updated = false;
      items = items.map(item => {
        let tokens = item.content.split(/(\s+)/);
        let changed = false;
        tokens = tokens.map(token => {
          if (token.toLowerCase() === oldId.toLowerCase()) {
            changed = true;
            return newTag.id;
          }
          return token;
        });
        if (changed) {
          updated = true;
          return { ...item, content: tokens.join('').trim() };
        }
        return item;
      });
      if (updated) this.saveItems(items);
    }
  }
  
  deleteTag(id: string) {
    this.saveTags(this.getTags().filter(t => t.id !== id));
    
    let items = this.getItems();
    let updated = false;
    items = items.map(item => {
      let tokens = item.content.split(/(\s+)/);
      let changed = false;
      tokens = tokens.map(token => {
        if (token.toLowerCase() === id.toLowerCase()) {
          changed = true;
          return ''; // remove the tag
        }
        return token;
      });
      if (changed) {
        updated = true;
        // fix double spaces potentially caused by removing
        return { ...item, content: tokens.join('').replace(/\s+/g, ' ').trim() };
      }
      return item;
    });
    if (updated) this.saveItems(items);
  }
  
  countItemsWithTag(id: string): number {
    return this.getItems().filter(item => {
      const tokens = item.content.split(/(\s+)/);
      return tokens.some(t => t.toLowerCase() === id.toLowerCase());
    }).length;
  }

  // Collections Management
  getCollections(): any[] {
    return this.collectionsSubject.value;
  }

  saveCollections(collections: any[]) {
    this.collectionsSubject.next(collections);
    this.saveToStorage('bujo_collections', collections);
  }

  updateCollection(collection: any) {
    const cols = this.getCollections();
    const updated = cols.map(c => c.id === collection.id ? collection : c);
    this.saveCollections(updated);
  }
}
