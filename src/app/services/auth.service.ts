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
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
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
        const loggedUser: User = { id: session.user.id, email: session.user.email || '' };
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

    // Check local storage for session fallback
    const savedUser = localStorage.getItem('bujo_user');
    if (savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        this.currentUserSubject.next(userObj);
        if (userObj && userObj.id && userObj.id !== 'anonymous-user-id') {
          this.syncLocalToCloud(userObj.id, false, false);
        }
      } catch {
        localStorage.removeItem('bujo_user');
      }
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

      for (const key of allKeys) {
        const cVal = cloudData[key];
        const lVal = localData[key];

        if (!cVal) {
          mergedData[key] = lVal;
        } else if (!lVal) {
          mergedData[key] = cVal;
        } else if (Array.isArray(lVal) && Array.isArray(cVal)) {
          if ((lVal.length > 0 && lVal[0] && typeof lVal[0] === 'object' && 'id' in lVal[0]) ||
              (cVal.length > 0 && cVal[0] && typeof cVal[0] === 'object' && 'id' in cVal[0])) {
            mergedData[key] = mergeArraysByTimestamp(lVal, cVal);
          } else {
            mergedData[key] = Array.from(new Set([...cVal, ...lVal]));
          }
        } else if (typeof lVal === 'object' && typeof cVal === 'object') {
          mergedData[key] = { ...cVal, ...lVal };
        } else {
          mergedData[key] = lVal || cVal;
        }
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
