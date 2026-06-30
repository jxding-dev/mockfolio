import { createContext, useContext } from 'react';

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

export interface AuthContextValue {
  /** True only when Supabase env keys are present. */
  configured: boolean;
  /** Human-readable reason when auth is not configured. */
  configMessage: string | null;
  /** Resolving the initial session. */
  loading: boolean;
  /** Session or redirect problem that should be shown in the auth UI. */
  authNotice: string | null;
  user: AuthUser | null;
  /** Sends a passwordless magic-link to the email. */
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  /** Starts the Google OAuth redirect flow. */
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  clearAuthNotice: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
