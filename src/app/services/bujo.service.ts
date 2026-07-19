import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { getLocalDateString } from '../utils/smartParser';
import { AuthService } from './auth.service';

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
  icon?: string;
  link?: string;
  description?: string;
  reminderType?: 'notification' | 'email' | 'both' | 'none';
  constantReminder?: boolean;
  subtasks?: any[];
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

  constructor(private authService: AuthService) {
    this.loadAllData();
  }

  private loadAllData() {
    this.itemsSubject.next(this.getParsedStorage('bujo_items', []));
    this.settingsSubject.next(this.getParsedStorage('bujo_settings', this.settingsSubject.value));
    this.collectionsSubject.next(this.getParsedStorage('bujo_collections', []));
    this.habitsSubject.next(this.getParsedStorage('bujo_habits', []));
    this.habitLogsSubject.next(this.getParsedStorage('bujo_habit_logs', {}));
    this.dreamsSubject.next(this.getParsedStorage('bujo_dreams', []));
    this.trashSubject.next(this.getParsedStorage('bujo_focus_trash_items', []));
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
    this.itemsSubject.next(newItems);
    this.saveToStorage('bujo_items', newItems);
  }

  addItem(item: Partial<BujoItem>) {
    const items = this.getItems();
    const newItem: BujoItem = {
      id: item.id || Math.random().toString(36).substring(2, 9),
      content: item.content || 'Nova tarefa',
      type: item.type || 'task',
      status: item.status || 'todo',
      date: item.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      ...item
    };
    this.saveItems([...items, newItem]);
  }

  deleteItem(id: string) {
    const items = this.getItems();
    const itemToDelete = items.find(i => i.id === id);
    if (itemToDelete) {
      // Add to trash
      const currentTrash = this.trashSubject.value;
      const newTrash = [...currentTrash, itemToDelete];
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
      // Remove from trash
      const newTrash = currentTrash.filter(i => i.id !== id);
      this.trashSubject.next(newTrash);
      this.saveToStorage('bujo_focus_trash_items', newTrash);
      
      // Add back to active
      const items = this.getItems();
      this.saveItems([...items, itemToRestore]);
    }
  }

  updateItem(id: string, updates: Partial<BujoItem>) {
    const items = this.getItems();
    this.saveItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  }

  // Habits Actions
  getHabits(): string[] {
    return this.habitsSubject.value;
  }

  addHabit(habit: string) {
    const habits = this.getHabits();
    if (!habits.includes(habit)) {
      const newHabits = [...habits, habit];
      this.habitsSubject.next(newHabits);
      this.saveToStorage('bujo_habits', newHabits);
    }
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
}
