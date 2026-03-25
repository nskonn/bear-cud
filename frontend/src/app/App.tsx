import { useAuth } from './providers/AuthProvider';
import { AuthPage } from '@/src/pages/auth';
import { WorkerPage } from '@/src/pages/worker';
import { AdminPage } from '@/src/pages/admin';

export const AppContent = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
        </div>
    );
  }

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
