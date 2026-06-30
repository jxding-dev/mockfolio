import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { authConfigMessage, isAuthConfigured, supabase } from '../lib/supabaseClient';
import { AuthContext, type AuthUser } from './authContext';

function mapUser(user: User): AuthUser {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? null,
    name: (meta.full_name as string) || (meta.name as string) || null,
    avatarUrl: (meta.avatar_url as string) || null,
  };
}

function buildRedirectUrl(): string {
  const { origin, pathname, search, hash } = window.location;
  const cleanHash = hash ? hash.split('?')[0] : '#/';
  return `${origin}${pathname}${search}${cleanHash}`;
}

function consumeAuthErrorFromUrl(): string | null {
  const current = new URL(window.location.href);
  const hash = current.hash;
  const hashQueryIndex = hash.indexOf('?');
  const hashParams = hashQueryIndex >= 0 ? new URLSearchParams(hash.slice(hashQueryIndex + 1)) : null;
  const pageParams = current.searchParams;

  const error =
    pageParams.get('error_description')
    ?? pageParams.get('error')
    ?? hashParams?.get('error_description')
    ?? hashParams?.get('error')
    ?? null;

  if (!error) return null;

  ['error', 'error_code', 'error_description'].forEach((key) => pageParams.delete(key));
  const cleanHash = hashQueryIndex >= 0 ? hash.slice(0, hashQueryIndex) : hash;
  const cleanSearch = pageParams.toString();
  const cleanUrl = `${current.origin}${current.pathname}${cleanSearch ? `?${cleanSearch}` : ''}${cleanHash}`;
  window.history.replaceState({}, document.title, cleanUrl);
  return decodeURIComponent(error.replace(/\+/g, ' '));
}

function friendlyAuthError(error: string | null): string | null {
  if (!error) return null;
  const lower = error.toLowerCase();
  if (lower.includes('expired') || lower.includes('invalid')) {
    return '로그인 링크가 만료됐어요. 이메일을 다시 입력해 새 링크를 받아주세요.';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return '네트워크 연결 때문에 로그인 상태를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.';
  }
  return '로그인을 완료하지 못했어요. 메일함의 최신 링크로 다시 시도해 주세요.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(isAuthConfigured);
  const [authNotice, setAuthNotice] = useState<string | null>(() => friendlyAuthError(consumeAuthErrorFromUrl()));

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setUser(null);
        setAuthNotice('로그인 상태를 확인하지 못했어요. 새로고침하거나 다시 로그인해 주세요.');
      } else {
        setUser(data.session ? mapUser(data.session.user) : null);
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session ? mapUser(session.user) : null);
      setLoading(false);
      if (event === 'SIGNED_IN') setAuthNotice(null);
      if (event === 'TOKEN_REFRESHED') setAuthNotice(null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    if (!supabase) return { error: 'auth-not-configured' };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: buildRedirectUrl(),
        shouldCreateUser: true,
      },
    });
    return { error: error ? error.message : null };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return { error: 'auth-not-configured' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: buildRedirectUrl() },
    });
    return { error: error ? error.message : null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) {
      setUser(null);
      return { error: null };
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthNotice('로그아웃하지 못했어요. 잠시 후 다시 시도해 주세요.');
      return { error: error.message };
    }
    setUser(null);
    setAuthNotice(null);
    return { error: null };
  }, []);

  const clearAuthNotice = useCallback(() => setAuthNotice(null), []);

  return (
    <AuthContext.Provider
      value={{
        configured: isAuthConfigured,
        configMessage: authConfigMessage,
        loading,
        authNotice,
        user,
        signInWithEmail,
        signInWithGoogle,
        signOut,
        clearAuthNotice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
