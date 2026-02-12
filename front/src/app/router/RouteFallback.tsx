import { Navigate } from "react-router-dom";

import { useAuth } from "../providers/authContext";

export const RouteFallback = () => {
  const { isAuthed } = useAuth();
  return <Navigate to={isAuthed ? "/" : "/signup"} replace />;
};

