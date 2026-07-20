import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

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

  constructor() {
    // Keys are now securely loaded from environment variables
    const supabaseUrl = environment.supabaseUrl;
    const supabaseKey = environment.supabaseKey;
    this.supabase = createClient(supabaseUrl, supabaseKey);

    this.supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const loggedUser: User = { id: session.user.id, email: session.user.email || '' };
        localStorage.setItem('bujo_user', JSON.stringify(loggedUser));
        this.currentUserSubject.next(loggedUser);
        
        if (event === 'SIGNED_IN') {
          // Use sessionStorage to prevent infinite reload loops.
          // This ensures sync only happens ONCE per tab session when logging in.
          if (!sessionStorage.getItem('bujo_synced_' + session.user.id)) {
            sessionStorage.setItem('bujo_synced_' + session.user.id, 'true');
            this.syncLocalToCloud(session.user.id);
          }
        }
      } else {
        // If not anonymous mode, log out
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
        this.currentUserSubject.next(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('bujo_user');
      }
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  async loginSupabase(email: string): Promise<boolean> {
    try {
      // Usando magic link ou OTP
      const { data, error } = await this.supabase.auth.signInWithOtp({
        email: email,
      });
      if (error) throw error;
      alert('Um link de acesso foi enviado para o seu email (' + email + '). Verifique sua caixa de entrada e clique no link para validar, em seguida volte aqui.');
      return true;
    } catch (e) {
      console.error(e);
      alert('Erro ao tentar enviar o email: ' + String(e));
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
      alert('Erro ao fazer login com Google: ' + String(e));
    }
  }

  async syncLocalToCloud(userId: string, shouldReload = true) {
    try {
      // 1. Download existing data from Cloud
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

      // 3. Merge data (Cloud takes precedence if local is empty, or simple merge)
      // Here we do a simple object merge where cloud overrides local if conflicts, 
      // but if we want local to not overwrite cloud with empty arrays, we can do a smart merge.
      const mergedData: any = { ...cloudData };
      for (const key of Object.keys(localData)) {
        // Only override cloud data if local data is not "empty" (like empty array or string)
        const lVal = localData[key];
        const cVal = cloudData[key];
        if (!cVal) {
          mergedData[key] = lVal;
        } else if (Array.isArray(lVal) && lVal.length > 0) {
          // Both have arrays? We should merge them by unique ID if possible, but for simplicity, we concat and deduplicate by ID
          if (Array.isArray(cVal)) {
            const map = new Map();
            cVal.forEach((item: any) => { if (item && item.id) map.set(item.id, item); });
            lVal.forEach((item: any) => { if (item && item.id) map.set(item.id, item); });
            mergedData[key] = Array.from(map.values());
            if (mergedData[key].length === 0) {
              // If it's just strings/numbers array
              mergedData[key] = Array.from(new Set([...cVal, ...lVal]));
            }
          } else {
            mergedData[key] = lVal;
          }
        }
      }

      // 4. Save merged data back to localStorage
      for (const key of Object.keys(mergedData)) {
        if (key.startsWith('bujo_')) {
          const val = mergedData[key];
          localStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : val);
        }
      }

      // 5. Upload merged data to Cloud
      const { error: upsertError } = await this.supabase
        .from('bujo_user_data')
        .upsert({ user_id: userId, data: mergedData, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
        
      if (upsertError) throw upsertError;

      // Ensure user session is saved locally
      const loggedUser: User = { id: userId, email: this.currentUserSubject.value?.email || 'user@bujofocus.com' };
      localStorage.setItem('bujo_user', JSON.stringify(loggedUser));
      
      // Prevent infinite loop from OAuth redirects by clearing the URL hash
      if (window.location.hash.includes('access_token') || window.location.hash.includes('type=recovery') || window.location.hash.includes('type=magiclink')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      
      // We only reload if we actually merged something or if it's a fresh login
      if (shouldReload) {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
      
    } catch (e) {
      console.error(e);
      alert('Erro ao sincronizar dados: ' + String(e));
    }
  }

  async uploadLocalToCloud(userId: string) {
    try {
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

      const { error: upsertError } = await this.supabase
        .from('bujo_user_data')
        .upsert({ user_id: userId, data: localData, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
        
      if (upsertError) throw upsertError;
    } catch (e) {
      console.error('Failed to auto-sync to cloud:', e);
    }
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
