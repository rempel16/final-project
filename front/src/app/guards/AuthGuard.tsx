import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/app/providers/authContext";

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { isAuthed, ready } = useAuth();

  if (!ready) return null;
  if (!isAuthed) return <Navigate to="/login" replace />;

  return <>{children}</>;
};
