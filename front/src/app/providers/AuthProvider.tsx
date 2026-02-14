import React, { useEffect, useMemo, useState } from "react";
import { tokenStorage } from "@/shared/lib/storage";
import { AuthContext, type AuthContextValue } from "./authContext";

const READY = true;

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

  useEffect(() => {
    const onLogout = () => setToken(null);
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthed: Boolean(token), token, login, logout, ready: READY }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
