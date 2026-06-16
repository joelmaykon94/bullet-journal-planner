import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

interface SupabaseConfig {
  url: string;
  key: string;
}

interface AuthContextType {
  supabase: SupabaseClient | null;
  user: User | null;
  session: Session | null;
  loading: boolean;
  needsConfig: boolean;
  config: SupabaseConfig | null;
  configError: string | null;
  signUp: (email: string, password: string, redirectTo?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string, redirectTo?: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  saveConfig: (url: string, key: string) => void;
  clearConfig: () => void;
  offlineMode: boolean;
  setOfflineMode: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsConfig, setNeedsConfig] = useState(true);
  const [config, setConfig] = useState<SupabaseConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [offlineMode, setOfflineModeState] = useState<boolean>(() => {
    return localStorage.getItem('bujo_offline_mode') === 'true';
  });

  const setOfflineMode = (val: boolean) => {
    setOfflineModeState(val);
    if (val) {
      localStorage.setItem('bujo_offline_mode', 'true');
    } else {
      localStorage.removeItem('bujo_offline_mode');
    }
  };

  const initSupabase = (url: string, key: string) => {
    setConfigError(null);
    try {
      const client = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      setSupabase(client);
      setNeedsConfig(false);

      // Get initial session
      client.auth.getSession()
        .then(({ data: { session: initialSession } }) => {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to get Supabase session:', err);
          setConfigError(err?.message || String(err));
          localStorage.removeItem('bujo_supabase_config');
          setConfig(null);
          setSupabase(null);
          setNeedsConfig(true);
          setLoading(false);
        });

      // Listen to auth changes
      const { data: { subscription } } = client.auth.onAuthStateChange((_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } catch (error: any) {
      console.error('Failed to initialize Supabase client:', error);
      setConfigError(error?.message || String(error));
      localStorage.removeItem('bujo_supabase_config');
      setConfig(null);
      setSupabase(null);
      setNeedsConfig(true);
      setLoading(false);
    }
  };

  // Load configuration from env or localStorage
  useEffect(() => {
    let url = import.meta.env.VITE_SUPABASE_URL || '';
    let key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    if (!url || !key) {
      const saved = localStorage.getItem('bujo_supabase_config');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          url = parsed.url;
          key = parsed.key;
        } catch (e) {
          console.error('Error parsing Supabase config:', e);
        }
      }
    }

    if (url && key) {
      initSupabase(url, key);
      setConfig({ url, key });
    } else {
      setLoading(false);
      setNeedsConfig(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveConfig = (url: string, key: string) => {
    if (!url || !key) return;
    localStorage.setItem('bujo_supabase_config', JSON.stringify({ url, key }));
    setConfig({ url, key });
    initSupabase(url, key);
  };

  const clearConfig = () => {
    localStorage.removeItem('bujo_supabase_config');
    sessionStorage.removeItem('bujo_synced_reload');
    setConfig(null);
    setSupabase(null);
    setUser(null);
    setSession(null);
    setNeedsConfig(true);
  };

  const signUp = async (email: string, password: string, redirectTo?: string) => {
    if (!supabase) return { error: new Error('Supabase client not initialized') };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo || window.location.origin
      }
    });
    return { error, data };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase client not initialized') };
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error, data };
  };

  const signOut = async () => {
    if (!supabase) return { error: new Error('Supabase client not initialized') };
    const { error } = await supabase.auth.signOut();
    sessionStorage.removeItem('bujo_synced_reload');
    return { error };
  };

  const resetPassword = async (email: string, redirectTo?: string) => {
    if (!supabase) return { error: new Error('Supabase client not initialized') };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${window.location.origin}?type=recovery`
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    if (!supabase) return { error: new Error('Supabase client not initialized') };
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const signInWithGoogle = async () => {
    if (!supabase) return { error: new Error('Supabase client not initialized') };
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    return { error, data };
  };

  return (
    <AuthContext.Provider
      value={{
        supabase,
        user,
        session,
        loading,
        needsConfig,
        config,
        configError,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        signInWithGoogle,
        saveConfig,
        clearConfig,
        offlineMode,
        setOfflineMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
