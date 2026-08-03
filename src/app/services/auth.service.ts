import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { ModalService } from './modal.service';
import { mergeArraysByTimestamp, getIsoTimestamp } from '../utils/syncUtils';
import { SyncStatusService } from './sync-status.service';

export interface User {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private getInitialUser(): User | null {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
    const saved = localStorage.getItem('bujo_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem('bujo_user');
      }
    }
    return null;
  }

  private currentUserSubject = new BehaviorSubject<User | null>(this.getInitialUser());
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  
  private supabase: SupabaseClient;

  constructor(
    private modalService: ModalService,
    private syncStatusService: SyncStatusService
  ) {
    const supabaseUrl = environment.supabaseUrl;
    const supabaseKey = environment.supabaseKey;
    this.supabase = createClient(supabaseUrl, supabaseKey);

    this.supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const loggedUser: User = { 
          id: session.user.id, 
          email: session.user.email || '',
          user_metadata: session.user.user_metadata || {}
        };
        localStorage.setItem('bujo_user', JSON.stringify(loggedUser));
        this.currentUserSubject.next(loggedUser);
        
        // Sync with cloud immediately on auth change / app load
        this.syncLocalToCloud(session.user.id, false, false);
      } else {
        const savedUser = localStorage.getItem('bujo_user');
        if (!savedUser || !savedUser.includes('anonymous-user-id')) {
          this.currentUserSubject.next(null);
        }
      }
    });

    // Check local storage for session fallback & sync trigger
    const userObj = this.currentUserSubject.value;
    if (userObj && userObj.id && userObj.id !== 'anonymous-user-id') {
      this.syncLocalToCloud(userObj.id, false, false);
    }

    // Auto-sync whenever mobile / desktop app regains focus or visibility
    if (typeof window !== 'undefined') {
      const handleRefresh = () => {
        const user = this.currentUserSubject.value;
        if (user && user.id && user.id !== 'anonymous-user-id') {
          this.syncLocalToCloud(user.id, false, false);
        }
      };
      window.addEventListener('focus', handleRefresh);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          handleRefresh();
        }
      });
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  async loginSupabase(email: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.auth.signInWithOtp({
        email: email,
      });
      if (error) throw error;
      await this.modalService.alert('Um link de acesso foi enviado para o seu email (' + email + '). Verifique sua caixa de entrada e clique no link para validar, em seguida volte aqui.', 'Acesso Enviado');
      return true;
    } catch (e) {
      console.error(e);
      await this.modalService.alert('Erro ao tentar enviar o email: ' + String(e), 'Erro');
      return false;
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (e) {
      console.error(e);
      await this.modalService.alert('Erro ao fazer login com Google: ' + String(e), 'Erro');
    }
  }

  async syncLocalToCloud(userId: string, shouldReload = false, showToast = false) {
    if (!userId || userId === 'anonymous-user-id') return;

    this.syncStatusService.setSyncState('syncing');

    try {
      // 1. Download existing data from Cloud FIRST
      const { data: cloudRow, error: fetchError } = await this.supabase
        .from('bujo_user_data')
        .select('data')
        .eq('user_id', userId)
        .single();
      
      let cloudData: any = {};
      if (cloudRow && cloudRow.data) {
        cloudData = cloudRow.data;
      }
      
      // 2. Gather local data
      const localData: any = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('bujo_') && key !== 'bujo_user' && key !== 'bujo_supabase_config') {
          try {
            localData[key] = JSON.parse(localStorage.getItem(key) || '""');
          } catch {
            localData[key] = localStorage.getItem(key);
          }
        }
      }

      // 3. Smart Timestamp Merge
      const allKeys = new Set([...Object.keys(cloudData), ...Object.keys(localData)]);
      const mergedData: any = {};

      // Build trash map first from local & cloud trash
      const localTrash = Array.isArray(localData['bujo_focus_trash_items']) ? localData['bujo_focus_trash_items'] : [];
      const cloudTrash = Array.isArray(cloudData['bujo_focus_trash_items']) ? cloudData['bujo_focus_trash_items'] : [];
      const mergedTrash = mergeArraysByTimestamp(localTrash, cloudTrash, undefined, true);
      mergedData['bujo_focus_trash_items'] = mergedTrash;

      const trashMap = new Map<string, any>();
      mergedTrash.forEach(item => {
        if (item && item.id) {
          trashMap.set(item.id, item);
        }
      });

      for (const key of allKeys) {
        if (key === 'bujo_focus_trash_items') continue;

        const cVal = cloudData[key];
        const lVal = localData[key];

        if (!cVal) {
          if (Array.isArray(lVal) && lVal.length > 0 && typeof lVal[0] === 'object' && 'id' in lVal[0]) {
            mergedData[key] = mergeArraysByTimestamp(lVal, [], trashMap);
          } else {
            mergedData[key] = lVal;
          }
        } else if (!lVal) {
          if (Array.isArray(cVal) && cVal.length > 0 && typeof cVal[0] === 'object' && 'id' in cVal[0]) {
            mergedData[key] = mergeArraysByTimestamp([], cVal, trashMap);
          } else {
            mergedData[key] = cVal;
          }
        } else if (Array.isArray(lVal) && Array.isArray(cVal)) {
          if ((lVal.length > 0 && lVal[0] && typeof lVal[0] === 'object' && 'id' in lVal[0]) ||
              (cVal.length > 0 && cVal[0] && typeof cVal[0] === 'object' && 'id' in cVal[0])) {
            mergedData[key] = mergeArraysByTimestamp(lVal, cVal, trashMap);
          } else {
            mergedData[key] = Array.from(new Set([...cVal, ...lVal]));
          }
        } else if (typeof lVal === 'object' && typeof cVal === 'object') {
          mergedData[key] = { ...cVal, ...lVal };
        } else {
          mergedData[key] = lVal || cVal;
        }
      }

      // Enforce deleted habits blacklist filter on merged habit arrays and habit logs
      const deletedHabits: string[] = mergedData['bujo_deleted_habits'] || localData['bujo_deleted_habits'] || cloudData['bujo_deleted_habits'] || [];
      if (Array.isArray(mergedData['bujo_habit_items'])) {
        mergedData['bujo_habit_items'] = mergedData['bujo_habit_items'].filter((h: any) => h && !deletedHabits.includes(h.id) && !deletedHabits.includes(h.title));
      }
      if (Array.isArray(mergedData['bujo_habits'])) {
        mergedData['bujo_habits'] = mergedData['bujo_habits'].filter((title: string) => !deletedHabits.includes(title));
      }
      if (mergedData['bujo_habit_logs'] && typeof mergedData['bujo_habit_logs'] === 'object') {
        for (const d of Object.keys(mergedData['bujo_habit_logs'])) {
          if (Array.isArray(mergedData['bujo_habit_logs'][d])) {
            mergedData['bujo_habit_logs'][d] = mergedData['bujo_habit_logs'][d].filter((h: string) => !deletedHabits.includes(h));
          }
        }
      }

      // Remove restored items from trash ONLY if active item was updated after being trashed
      if (Array.isArray(mergedData['bujo_items'])) {
        const activeMap = new Map<string, any>();
        mergedData['bujo_items'].forEach((i: any) => activeMap.set(i.id, i));

        mergedData['bujo_focus_trash_items'] = (mergedData['bujo_focus_trash_items'] || []).filter((t: any) => {
          if (!activeMap.has(t.id)) return true;
          const activeItem = activeMap.get(t.id);
          const activeTime = new Date(activeItem.updatedAt || activeItem.createdAt || 0).getTime();
          const trashTime = new Date(t.deletedAt || t.updatedAt || 0).getTime();
          return activeTime <= trashTime;
        });
      }

      // 4. Save merged data back to localStorage
      for (const key of Object.keys(mergedData)) {
        if (key.startsWith('bujo_')) {
          const val = mergedData[key];
          localStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
        }
      }

      // Notify services to reload state from localStorage
      this.syncStatusService.notifyDataSynced();

      // 5. Upload merged data to Cloud
      const { error: upsertError } = await this.supabase
        .from('bujo_user_data')
        .upsert({ user_id: userId, data: mergedData, updated_at: getIsoTimestamp() }, { onConflict: 'user_id' });
        
      if (upsertError) throw upsertError;

      // Ensure user session is saved locally
      const loggedUser: User = { id: userId, email: this.currentUserSubject.value?.email || 'user@bujofocus.com' };
      localStorage.setItem('bujo_user', JSON.stringify(loggedUser));
      
      // Clear URL auth parameters if present
      if (window.location.hash.includes('access_token') || window.location.hash.includes('type=recovery') || window.location.hash.includes('type=magiclink')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      
      if (showToast) {
        this.syncStatusService.notifySyncSuccess('Dados sincronizados com a nuvem com sucesso');
      } else {
        this.syncStatusService.setSyncState('synced');
      }

      if (shouldReload) {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
      
    } catch (e) {
      console.error('Erro na sincronização de dados:', e);
      this.syncStatusService.setSyncState(this.syncStatusService.isOnline ? 'error' : 'offline');
    }
  }

  async uploadLocalToCloud(userId: string) {
    // Instead of blind overwrite, perform cloud-first timestamp merge
    return this.syncLocalToCloud(userId, false);
  }

  loginAnonymous(): void {
    const anonUser: User = {
      id: 'anonymous-user-id',
      email: 'offline@bujofocus.local'
    };
    localStorage.setItem('bujo_user', JSON.stringify(anonUser));
    this.currentUserSubject.next(anonUser);
  }

  async logout(): Promise<void> {
    const user = this.currentUserSubject.value;
    if (user && user.id !== 'anonymous-user-id') {
      try {
        console.log('Sincronizando dados antes de sair...');
        await this.syncLocalToCloud(user.id, false); // false = don't reload
      } catch (e) {
        console.error('Falha ao sincronizar antes do logout', e);
      }
    }

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('bujo_') && key !== 'bujo_supabase_config' && key !== 'bujo_offline_mode') {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    try {
      await this.supabase.auth.signOut();
    } catch (e) {
      console.error('Supabase signout erro:', e);
    }
    
    this.currentUserSubject.next(null);
  }
}
