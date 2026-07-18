import { createContext, useContext, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { login, logout, me, type AuthUser } from './auth-api';

interface AuthContextValue {
  user?: AuthUser;
  permissions: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('accessToken');
  const currentUser = useQuery({ queryKey: ['auth', 'me'], queryFn: me, enabled: Boolean(token), retry: false });
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      queryClient.setQueryData(['auth', 'me'], data.user);
    },
  });
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      queryClient.clear();
    },
  });
  const value = useMemo<AuthContextValue>(() => ({
    user: currentUser.data,
    permissions: currentUser.data?.permissions ?? [],
    isLoading: currentUser.isLoading,
    isAuthenticated: Boolean(currentUser.data),
    login: async (payload) => { await loginMutation.mutateAsync(payload); },
    logout: async () => { await logoutMutation.mutateAsync(); },
  }), [currentUser.data, currentUser.isLoading, loginMutation, logoutMutation]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
