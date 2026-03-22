import { create } from 'zustand';
import { authApi } from '@/services/authApi';
import { clearSessionToken, setSessionToken, setUnauthorizedHandler } from '@/services/authSession';
import type { AuthLoginInput, AuthSession, AuthSignUpInput } from '@/types/auth';

type AuthState = {
  session: AuthSession | null;
  submitting: boolean;
  error?: string;
  signIn: (input: AuthLoginInput) => Promise<AuthSession>;
  signUp: (input: AuthSignUpInput) => Promise<AuthSession>;
  signOut: () => void;
  setSession: (session: AuthSession | null) => void;
};

function applySession(session: AuthSession | null, set: (partial: Partial<AuthState>) => void) {
  if (session?.access_token) {
    setSessionToken(session.access_token);
  } else {
    clearSessionToken();
  }
  set({ session, submitting: false, error: undefined });
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  submitting: false,
  error: undefined,
  signIn: async (input) => {
    set({ submitting: true, error: undefined });
    try {
      const session = await authApi.login(input);
      applySession(session, set);
      return session;
    } catch (error) {
      set({ submitting: false, error: (error as Error).message });
      throw error;
    }
  },
  signUp: async (input) => {
    set({ submitting: true, error: undefined });
    try {
      const session = await authApi.signUp(input);
      applySession(session, set);
      return session;
    } catch (error) {
      set({ submitting: false, error: (error as Error).message });
      throw error;
    }
  },
  signOut: () => {
    clearSessionToken();
    set({ session: null, submitting: false, error: undefined });
  },
  setSession: (session) => applySession(session, set)
}));

setUnauthorizedHandler(() => {
  const state = useAuthStore.getState();
  if (state.session) {
    state.signOut();
  }
});
