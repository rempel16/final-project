import React, { useMemo, useState } from "react";
import { tokenStorage } from "../../shared/lib/storage";
import { AuthContext, type AuthContextValue } from "./authContext";

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
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
