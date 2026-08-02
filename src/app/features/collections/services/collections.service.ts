import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { getIsoTimestamp, ensureTimestamps } from '../../../utils/syncUtils';
import { SyncStatusService } from '../../../services/sync-status.service';

export interface Subtask {
  id: string;
  content: string;
  completed: boolean;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Media {
  id: string;
  type: 'image' | 'link';
  name: string;
  url: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CollectionItem {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
  notes: string;
  media: Media[];
  subtasks: Subtask[];
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  icon: string;
  items: CollectionItem[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CollectionsService {
  private readonly STORAGE_KEY = 'bujo_collections';
  
  private collectionsSubject = new BehaviorSubject<Collection[]>(this.loadCollections());
  public collections$ = this.collectionsSubject.asObservable();

  constructor(private syncStatusService: SyncStatusService) {
    this.syncStatusService.dataSynced$.subscribe(() => {
      this.reloadCollections();
    });
  }

  public reloadCollections() {
    this.collectionsSubject.next(this.loadCollections());
  }

  private loadCollections(): Collection[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) return [];
    try {
      const parsed: Collection[] = JSON.parse(saved);
      const now = getIsoTimestamp();
      return parsed.map(c => {
        const col = ensureTimestamps(c, now);
        return {
          ...col,
          items: (col.items || []).map(i => ensureTimestamps(i, now))
        };
      });
    } catch {
      return [];
    }
  }

  private saveCollections(collections: Collection[]) {
    const now = getIsoTimestamp();
    const sanitized = collections.map(c => {
      const colWithTime = ensureTimestamps(c, now);
      return {
        ...colWithTime,
        items: (colWithTime.items || []).map(i => ensureTimestamps(i, now))
      };
    });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sanitized));
    this.collectionsSubject.next(sanitized);
  }

  get collections(): Collection[] {
    return this.collectionsSubject.value;
  }

  createCollection(name: string, description: string, icon: string) {
    const now = getIsoTimestamp();
    const newCol: Collection = {
      id: `col-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      icon,
      items: [],
      createdAt: now,
      updatedAt: now
    };
    this.saveCollections([...this.collections, newCol]);
  }

  deleteCollection(id: string) {
    this.saveCollections(this.collections.filter(c => c.id !== id));
  }

  createCollectionItem(colId: string, title: string, icon?: string, notes: string = '') {
    const now = getIsoTimestamp();
    const newItem: CollectionItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      title: title.trim(),
      status: 'todo',
      notes: notes.trim(),
      media: [],
      subtasks: [],
      icon,
      createdAt: now,
      updatedAt: now
    };
    
    this.saveCollections(this.collections.map(c => 
      c.id === colId ? { ...c, updatedAt: now, items: [...c.items, newItem] } : c
    ));
  }

  deleteCollectionItem(colId: string, itemId: string) {
    const now = getIsoTimestamp();
    this.saveCollections(this.collections.map(c => 
      c.id === colId ? { ...c, updatedAt: now, items: c.items.filter(i => i.id !== itemId) } : c
    ));
  }

  updateCollectionItemStatus(colId: string, itemId: string, status: 'todo' | 'doing' | 'done') {
    const now = getIsoTimestamp();
    this.saveCollections(this.collections.map(c => 
      c.id === colId ? {
        ...c,
        updatedAt: now,
        items: c.items.map(i => i.id === itemId ? { ...i, status, updatedAt: now } : i)
      } : c
    ));
  }

  updateCollectionItem(colId: string, itemId: string, updates: Partial<CollectionItem>) {
    const now = getIsoTimestamp();
    this.saveCollections(this.collections.map(c => 
      c.id === colId ? {
        ...c,
        updatedAt: now,
        items: c.items.map(i => i.id === itemId ? { ...i, ...updates, updatedAt: now } : i)
      } : c
    ));
  }

  reorderItems(colId: string, previousIndex: number, currentIndex: number) {
    const col = this.collections.find(c => c.id === colId);
    if (!col) return;
    
    const items = [...col.items];
    const [movedItem] = items.splice(previousIndex, 1);
    items.splice(currentIndex, 0, movedItem);

    this.saveCollections(this.collections.map(c => 
      c.id === colId ? { ...c, items } : c
    ));
  }

  reorderSubtasks(colId: string, itemId: string, previousIndex: number, currentIndex: number) {
    const col = this.collections.find(c => c.id === colId);
    if (!col) return;
    const item = col.items.find(i => i.id === itemId);
    if (!item) return;

    const subtasks = [...item.subtasks];
    const [movedSubtask] = subtasks.splice(previousIndex, 1);
    subtasks.splice(currentIndex, 0, movedSubtask);

    this.updateCollectionItem(colId, itemId, { subtasks });
  }

  addSubtask(colId: string, itemId: string, content: string, icon?: string) {
    this.saveCollections(this.collections.map(c => 
      c.id === colId ? {
        ...c,
        items: c.items.map(i => i.id === itemId ? {
          ...i,
          subtasks: [...(i.subtasks || []), { id: `st-${Date.now()}`, content: content.trim(), completed: false, icon }]
        } : i)
      } : c
    ));
  }
  toggleSubtask(colId: string, itemId: string, subtaskId: string) {
    this.saveCollections(this.collections.map(c => 
      c.id === colId ? {
        ...c,
        items: c.items.map(i => i.id === itemId ? {
          ...i,
          subtasks: (i.subtasks || []).map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st)
        } : i)
      } : c
    ));
  }

  deleteSubtask(colId: string, itemId: string, subtaskId: string) {
    this.saveCollections(this.collections.map(c => 
      c.id === colId ? {
        ...c,
        items: c.items.map(i => i.id === itemId ? {
          ...i,
          subtasks: (i.subtasks || []).filter(st => st.id !== subtaskId)
        } : i)
      } : c
    ));
  }

  addMediaLink(colId: string, itemId: string, name: string, url: string) {
    const newMedia: Media = {
      id: `media-${Date.now()}`,
      type: 'link',
      name: name.trim(),
      url: url.trim()
    };
    
    this.saveCollections(this.collections.map(c => 
      c.id === colId ? {
        ...c,
        items: c.items.map(i => i.id === itemId ? {
          ...i,
          media: [...(i.media || []), newMedia]
        } : i)
      } : c
    ));
  }

  addMediaFile(colId: string, itemId: string, file: File) {
    const fakeUrl = URL.createObjectURL(file);
    const newMedia: Media = {
      id: `media-${Date.now()}`,
      type: 'image',
      name: file.name,
      url: fakeUrl
    };

    this.saveCollections(this.collections.map(c => 
      c.id === colId ? {
        ...c,
        items: c.items.map(i => i.id === itemId ? {
          ...i,
          media: [...(i.media || []), newMedia]
        } : i)
      } : c
    ));
  }

  deleteMedia(colId: string, itemId: string, mediaId: string) {
    this.saveCollections(this.collections.map(c => 
      c.id === colId ? {
        ...c,
        items: c.items.map(i => i.id === itemId ? {
          ...i,
          media: (i.media || []).filter(m => m.id !== mediaId)
        } : i)
      } : c
    ));
  }
}
