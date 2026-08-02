import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getIsoTimestamp, ensureTimestamps } from '../../../utils/syncUtils';
import { SyncStatusService } from '../../../services/sync-status.service';
import { AuthService } from '../../../services/auth.service';

export interface DreamItem {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  conquered: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DreamsService {
  private readonly STORAGE_KEY = 'bujo_focus_dreams';

  private dreamsSubject = new BehaviorSubject<DreamItem[]>(this.loadDreams());
  public dreams$ = this.dreamsSubject.asObservable();

  constructor(
    private syncStatusService: SyncStatusService,
    private authService: AuthService
  ) {
    this.syncStatusService.dataSynced$.subscribe(() => {
      this.reloadDreams();
    });
  }

  public reloadDreams() {
    this.dreamsSubject.next(this.loadDreams());
  }

  private loadDreams(): DreamItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      const parsed: DreamItem[] = JSON.parse(data);
      return parsed.map(d => ensureTimestamps(d));
    } catch {
      return [];
    }
  }

  private triggerCloudSync() {
    const user = this.authService.currentUser;
    if (user && user.id && user.id !== 'anonymous-user-id') {
      this.authService.syncLocalToCloud(user.id, false, false);
    }
  }

  private saveDreams(dreams: DreamItem[]) {
    const sanitized = dreams.map(d => ensureTimestamps(d));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sanitized));
    this.dreamsSubject.next(sanitized);
    this.triggerCloudSync();
  }

  get dreams(): DreamItem[] {
    return this.dreamsSubject.value;
  }

  addDream(title: string, category: string, icon: string, description: string) {
    const now = getIsoTimestamp();
    const newDream: DreamItem = {
      id: `dream-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      category,
      icon,
      description,
      conquered: false,
      createdAt: now,
      updatedAt: now
    };
    this.saveDreams([...this.dreams, newDream]);
  }

  toggleDreamConquered(id: string) {
    const now = getIsoTimestamp();
    const updated = this.dreams.map(d => 
      d.id === id ? { ...d, conquered: !d.conquered, updatedAt: now } : d
    );
    this.saveDreams(updated);
  }

  deleteDream(id: string) {
    const dreamToDelete = this.dreams.find(d => d.id === id);
    const now = getIsoTimestamp();

    if (dreamToDelete) {
      const trashedDream: DreamItem = {
        ...dreamToDelete,
        updatedAt: now,
        deletedAt: now
      };
      
      // Save trashed dream to bujo_focus_trash_items
      let currentTrash: any[] = [];
      try {
        const trashData = localStorage.getItem('bujo_focus_trash_items');
        if (trashData) currentTrash = JSON.parse(trashData);
      } catch {}
      
      const newTrash = [...currentTrash.filter(t => t.id !== id), trashedDream];
      localStorage.setItem('bujo_focus_trash_items', JSON.stringify(newTrash));
    }

    const updated = this.dreams.filter(d => d.id !== id);
    this.saveDreams(updated);
  }

  updateDream(id: string, updates: Partial<DreamItem>) {
    const now = getIsoTimestamp();
    const updated = this.dreams.map(d => 
      d.id === id ? { ...d, ...updates, updatedAt: now } : d
    );
    this.saveDreams(updated);
  }
}
