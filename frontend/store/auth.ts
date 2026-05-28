'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isGuest: boolean;
  setUser: (user: User | null) => void;
  setTokens: (access: string, refresh: string) => void;
  setGuest: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isGuest: false,
      setUser: (user) => set({ user }),
      setTokens: (accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
        }
        set({ accessToken });
      },
      setGuest: (isGuest) => set({ isGuest }),
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        set({ user: null, accessToken: null, isGuest: false });
      },
    }),
    { name: 'codex-auth', partialize: (s) => ({ user: s.user, accessToken: s.accessToken, isGuest: s.isGuest }) }
  )
);
