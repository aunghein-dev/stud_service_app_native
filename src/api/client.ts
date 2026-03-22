import { API_BASE_URL } from '@/constants/api';
import { getSessionToken, notifyUnauthorized } from '@/services/authSession';
import type { ApiEnvelope } from '@/types/common';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  const accessToken = getSessionToken();
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(init.headers || {})
      },
      ...init
    });
  } catch (error) {
    throw new Error(`Unable to connect to backend at ${API_BASE_URL}. Check backend server and Expo device network.`);
  }

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    if (response.status === 401) {
      notifyUnauthorized();
    }
    throw new Error(payload?.error?.message || (response.status === 401 ? 'Please sign in again.' : 'Request failed'));
  }
  return payload.data;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' })
};
