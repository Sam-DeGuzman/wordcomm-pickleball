import { auth } from '../lib/firebase';
import { AuthSessionResponse } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}/api${path.startsWith('/') ? path : `/${path}`}`;
  const currentUser = auth.currentUser;
  let token: string | null = null;

  if (currentUser) {
    try {
      token = await currentUser.getIdToken();
    } catch (err) {
      console.warn('[API] Could not retrieve ID token:', err);
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.error || `${options?.method ?? 'GET'} ${path} failed with ${res.status}`
    );
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  syncSession: () => request<AuthSessionResponse>('/auth/session', { method: 'POST' }),
  getHealth: () => request<{ status: string }>('/health', { method: 'GET' }),
};
