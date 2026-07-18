import { api } from '@/lib/api-client';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function me() {
  const { data } = await api.get<AuthUser>('/auth/me');
  return data;
}

export async function logout() {
  await api.post('/auth/logout');
}
