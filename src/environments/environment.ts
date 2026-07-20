export const environment = {
  production: false,
  // Lê do env.js gerado dinamicamente via script e exposto em window.env
  supabaseUrl: (window as any).env?.VITE_SUPABASE_URL || (window as any).env?.NG_APP_SUPABASE_URL || '',
  supabaseKey: (window as any).env?.VITE_SUPABASE_ANON_KEY || (window as any).env?.NG_APP_SUPABASE_ANON_KEY || ''
};
