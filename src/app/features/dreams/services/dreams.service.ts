import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DreamItem {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  conquered: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DreamsService {
  private readonly STORAGE_KEY = 'bujo_focus_dreams';

  private dreamsSubject = new BehaviorSubject<DreamItem[]>(this.loadDreams());
  public dreams$ = this.dreamsSubject.asObservable();

  constructor() {}

  private loadDreams(): DreamItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveDreams(dreams: DreamItem[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dreams));
    this.dreamsSubject.next(dreams);
  }

  get dreams(): DreamItem[] {
    return this.dreamsSubject.value;
  }

  addDream(title: string, category: string, icon: string, description: string) {
    const newDream: DreamItem = {
      id: `dream-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      category,
      icon,
      description,
      conquered: false,
      createdAt: new Date().toISOString()
    };
    this.saveDreams([...this.dreams, newDream]);
  }

  toggleDreamConquered(id: string) {
    const updated = this.dreams.map(d => 
      d.id === id ? { ...d, conquered: !d.conquered } : d
    );
    this.saveDreams(updated);
  }

  deleteDream(id: string) {
    const updated = this.dreams.filter(d => d.id !== id);
    this.saveDreams(updated);
  }
}
