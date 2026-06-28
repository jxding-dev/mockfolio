export type AuthMode = 'login' | 'signup' | 'forgot-password';

export interface AuthCredentials {
  email: string;
  password?: string;
}

export interface AuthService {
  login(credentials: AuthCredentials): Promise<void>;
  signUp(credentials: AuthCredentials): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
}

export const authProviderLabel = 'Supabase Auth';

