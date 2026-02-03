import { Outlet } from 'react-router-dom';
import { AuthGuard } from '../../app/guards/AuthGuard';
import { AppLayout } from './AppLayout';

export const ProtectedLayout = () => {
  return (
    <AuthGuard>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </AuthGuard>
  );
};
