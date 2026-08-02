import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getIsoTimestamp, ensureTimestamps } from '../../../utils/syncUtils';
import { SyncStatusService } from '../../../services/sync-status.service';

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

  constructor(private syncStatusService: SyncStatusService) {
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

  private saveDreams(dreams: DreamItem[]) {
    const sanitized = dreams.map(d => ensureTimestamps(d));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sanitized));
    this.dreamsSubject.next(sanitized);
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
    const updated = this.dreams.filter(d => d.id !== id);
    this.saveDreams(updated);
  }
}
