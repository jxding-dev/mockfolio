import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

const missingEnv = [
  !url ? 'VITE_SUPABASE_URL' : null,
  !anonKey ? 'VITE_SUPABASE_ANON_KEY' : null,
].filter(Boolean) as string[];

function isValidSupabaseUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

export const authConfigMessage = missingEnv.length
  ? `${missingEnv.join(', ')} 환경 변수가 없어 로그인을 사용할 수 없어요.`
  : !isValidSupabaseUrl(url)
    ? 'VITE_SUPABASE_URL 형식이 올바르지 않아 로그인을 사용할 수 없어요.'
    : null;

export const isAuthConfigured = !authConfigMessage;

export const supabase: SupabaseClient | null = isAuthConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : null;
