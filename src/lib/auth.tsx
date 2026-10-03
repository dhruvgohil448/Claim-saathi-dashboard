import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, getToken, setToken } from './api';
import type { User } from './types';

interface AuthCtx {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}
const Ctx = createContext<AuthCtx | null>(null);
const USER_KEY = 'cs_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [user, setUser] = useState<User | null>(() => {
    try {
      return getToken() ? (JSON.parse(localStorage.getItem(USER_KEY) || 'null') as User | null) : null;
    } catch {
      return null;
    }
  });
  const [ready, setReady] = useState(!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api<User>('/auth/me')
      .then((u) => {
        if (u.role === 'CUSTOMER') throw new Error('customer');
        setUser(u);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
      })
      .catch((e) => {
        if (e?.network) return; // keep cached session while the server is waking up
        setToken(null);
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<{ token: string; user: User }>('/auth/login', { method: 'POST', json: { email, password } });
    if (res.user.role === 'CUSTOMER') throw new Error('This dashboard is for the Claim Saathi team. Customers can track claims in the Claim Saathi mobile app.');
    setToken(res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    qc.clear();
  }, [qc]);

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth outside provider');
  return c;
};
