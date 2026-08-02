import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type SyncState = 'synced' | 'syncing' | 'offline' | 'error';

export interface SyncToast {
  type: 'success' | 'offline' | 'error';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class SyncStatusService {
  private isOnlineSubject = new BehaviorSubject<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  public isOnline$: Observable<boolean> = this.isOnlineSubject.asObservable();

  private syncStateSubject = new BehaviorSubject<SyncState>(
    (typeof navigator !== 'undefined' && !navigator.onLine) ? 'offline' : 'synced'
  );
  public syncState$: Observable<SyncState> = this.syncStateSubject.asObservable();

  private lastSyncedAtSubject = new BehaviorSubject<Date | null>(new Date());
  public lastSyncedAt$: Observable<Date | null> = this.lastSyncedAtSubject.asObservable();

  private toastSubject = new BehaviorSubject<SyncToast | null>(null);
  public toast$: Observable<SyncToast | null> = this.toastSubject.asObservable();

  private dataSyncedSubject = new BehaviorSubject<number>(Date.now());
  public dataSynced$: Observable<number> = this.dataSyncedSubject.asObservable();

  private toastTimeout: any;

  notifyDataSynced() {
    this.dataSyncedSubject.next(Date.now());
  }

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnlineSubject.next(true);
        this.setSyncState('synced');
        this.showToast({ type: 'success', message: 'Conexão restabelecida. Sincronizado com a nuvem.' });
      });

      window.addEventListener('offline', () => {
        this.isOnlineSubject.next(false);
        this.setSyncState('offline');
        this.showToast({ type: 'offline', message: 'Você está no Modo Offline. Dados salvos localmente.' });
      });
    }
  }

  get isOnline(): boolean {
    return this.isOnlineSubject.value;
  }

  get syncState(): SyncState {
    return this.syncStateSubject.value;
  }

  setSyncState(state: SyncState) {
    if (!this.isOnlineSubject.value && state !== 'offline') {
      state = 'offline';
    }
    this.syncStateSubject.next(state);
    if (state === 'synced') {
      this.lastSyncedAtSubject.next(new Date());
    }
  }

  notifySyncSuccess(message: string = 'Sincronizado com a nuvem com sucesso') {
    this.setSyncState('synced');
    this.showToast({ type: 'success', message });
  }

  showToast(toast: SyncToast) {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastSubject.next(toast);
    this.toastTimeout = setTimeout(() => {
      this.toastSubject.next(null);
    }, 3500);
  }

  dismissToast() {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastSubject.next(null);
  }
}
