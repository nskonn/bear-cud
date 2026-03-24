import { useState } from 'react';
import { User, Shield, Lock } from 'lucide-react';
import { useAuth } from '@/src/app/providers/AuthProvider';
import { useUsers } from '@/src/entities/user/model/queries';
import {toast} from "sonner";

export const AuthPage = () => {
  const { data: users = [] } = useUsers();
  const { login } = useAuth();

  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const handleLogin = async () => {
    if (!loginInput.trim() || !passwordInput.trim()) return;
    
    const user = users.find(u => u.login === loginInput.trim() && u.password === passwordInput.trim());
    
    if (!user) {
      toast.error('Неверный логин или пароль');
      return;
    }

    if (user.isBlocked) {
      toast.error('Ваш аккаунт заблокирован. Обратитесь к администратору.');
      return;
    }
    
    login(user);
  };

  const handleAdminLogin = () => {
    login({ id: 'admin', name: 'Администратор', role: 'admin' });
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="bg-amber-700 p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-amber-700 shadow-inner">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Bear cud</h1>
          <p className="text-amber-200 text-sm mt-1">Система учета выработки</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Логин</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-stone-400" size={20} />
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                placeholder="Введите логин"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-stone-400" size={20} />
              <input 
                type="password" 
                className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                placeholder="Введите пароль"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={handleLogin}
            disabled={!loginInput.trim() || !passwordInput.trim()}
            className="w-full bg-amber-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-amber-700 active:transform active:scale-95 transition disabled:opacity-50"
          >
            Войти в систему
          </button>
        </div>
      </div>
    </div>
  );
};
