import { LogOut, Briefcase, Shield } from 'lucide-react';
import { useAuth } from '@/src/app/providers/AuthProvider';

export const Header = () => {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  return (
    <header className={`${isAdmin ? 'bg-stone-900' : 'bg-amber-700'} text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center`}>
      <div className="flex items-center">
        {isAdmin && <Shield size={24} className="text-amber-500 mr-2" />}
        <div>
          <h1 className="font-bold text-lg">{isAdmin ? 'Панель управления' : currentUser.name}</h1>
          {!isAdmin && (
            <p className="text-amber-200 text-sm flex items-center">
              <Briefcase size={14} className="mr-1" /> {currentUser.role}
            </p>
          )}
        </div>
      </div>
      <button onClick={logout} className={`p-2 ${isAdmin ? 'bg-stone-800 hover:bg-stone-700' : 'bg-amber-800 hover:bg-amber-900'} rounded-full transition`}>
        <LogOut size={20} />
      </button>
    </header>
  );
};
