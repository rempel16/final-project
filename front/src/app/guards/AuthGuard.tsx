import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

type Props = {
  children: JSX.Element;
};

export const AuthGuard = ({ children }: Props) => {
  const { isAuthed } = useAuth();
  if (!isAuthed) return <Navigate to="/signup" replace />;
  return children;
};
