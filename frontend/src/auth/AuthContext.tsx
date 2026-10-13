import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { login, register } from '../services/api';

type AuthContextValue = {
  username: string | null;
  authenticated: boolean;
  signIn: (username: string, password: string, createAccount: boolean) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = 'algolab_token';
const USER_KEY = 'algolab_username';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState(() => localStorage.getItem(USER_KEY));

  const value = useMemo<AuthContextValue>(() => ({
    username,
    authenticated: Boolean(username && localStorage.getItem(TOKEN_KEY)),
    async signIn(name, password, createAccount) {
      const session = createAccount ? await register(name, password) : await login(name, password);
      localStorage.setItem(TOKEN_KEY, session.access_token);
      localStorage.setItem(USER_KEY, session.username);
      setUsername(session.username);
    },
    signOut() {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setUsername(null);
    },
  }), [username]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
