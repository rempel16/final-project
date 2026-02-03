import React, { createContext, useContext, useMemo, useState } from 'react';
import { tokenStorage } from '../../shared/lib/storage';

type AuthContextValue = {
  isAuthed: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => tokenStorage.get());

  const login = (newToken: string) => {
    tokenStorage.set(newToken);
    setToken(newToken);
  };

  const logout = () => {
    tokenStorage.remove();
    setToken(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthed: Boolean(token), token, login, logout }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
