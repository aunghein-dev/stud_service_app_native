import { apiClient } from '@/api/client';
import type { AuthLoginInput, AuthSession, AuthSignUpInput } from '@/types/auth';

export const authApi = {
  signUp: (input: AuthSignUpInput) => apiClient.post<AuthSession>('/auth/signup', input),
  login: (input: AuthLoginInput) => apiClient.post<AuthSession>('/auth/login', input),
  me: () => apiClient.get<AuthSession>('/auth/me')
};
