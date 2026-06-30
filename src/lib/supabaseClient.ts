import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Auth is opt-in via env. With no keys the app stays a fully-free guest
// experience (build/deploy never breaks); drop in the two vars to enable login.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isAuthConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isAuthConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
