import { useAuth } from './providers/AuthProvider';
import { AuthPage } from '@/src/pages/auth';
import { WorkerPage } from '@/src/pages/worker';
import { AdminPage } from '@/src/pages/admin';

export const AppContent = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <AuthPage />;
  }

  if (currentUser.role === 'admin') {
    return <AdminPage />;
  }

  return <WorkerPage />;
};

export const App = () => {
  return <AppContent />;
};
