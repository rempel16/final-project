import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/app/providers/authContext";

type Props = {
  children: ReactNode;
};

export const AuthGuard = ({ children }: Props) => {
  const { isAuthed } = useAuth();
  if (!isAuthed) return <Navigate to="/signup" replace />;
  return <>{children}</>;
};
