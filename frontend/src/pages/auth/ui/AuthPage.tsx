import { useEffect, useRef, useState } from 'react';
import { User, Lock } from 'lucide-react';
import { useAuth } from '@/src/app/providers/AuthProvider';
import { toast } from 'sonner';
import logo from '@/src/assets/logo.png';

type TelegramInitPayload = {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
};

/**
 * Глобальный интерфейс для Telegram WebApp API
 */
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        ready: () => void;
        expand: () => void;
      };
    };
  }
}

export const AuthPage = () => {
  const { login } = useAuth();

  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [telegramData, setTelegramData] = useState<TelegramInitPayload | null>(null);
  const [telegramMessage, setTelegramMessage] = useState<string | null>(null);
  const [isTelegramLoading, setIsTelegramLoading] = useState(false);
  const telegramInitSent = useRef(false);

  const handleLogin = async () => {
    if (!loginInput.trim() || !passwordInput.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: loginInput.trim(),
          password: passwordInput.trim(),
          telegram: telegramData
            ? {
                id: telegramData.id,
                first_name: telegramData.first_name,
                last_name: telegramData.last_name,
                username: telegramData.username,
              }
            : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || 'Ошибка авторизации');
        return;
      }

      login(data.user, data.token);
    } catch (error) {
      toast.error('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const app = window.Telegram?.WebApp;

    if (!app || !app.initData) {
      return;
    }

    if (telegramInitSent.current) return;
    telegramInitSent.current = true;

    const initTelegram = async () => {
      setIsTelegramLoading(true);
      try {
        const response = await fetch('/api/auth/telegram-init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: app.initData }),
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          toast.error(data.message || 'Не удалось проверить Telegram');
          return;
        }

        if (data.exists) {
          login(data.user, data.token);
          return;
        }

        if (data.telegramData) {
          setTelegramData({
            id: data.telegramData.id,
            first_name: data.telegramData.first_name,
            last_name: data.telegramData.last_name,
            username: data.telegramData.username,
          });
          setTelegramMessage(
            'Вход через Telegram: привяжите аккаунт, введя логин и пароль.',
          );
        }
      } catch (error) {
        toast.error('Ошибка связи с Telegram');
      } finally {
        setIsTelegramLoading(false);
      }
    };

    initTelegram();
  }, [login]);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="bg-amber-700 p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-amber-700 shadow-inner overflow-hidden">
            <img src={logo} alt="Bear cud logo" className="h-13 w-13 rounded-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-white">Bear cud</h1>
          <p className="text-amber-200 text-sm mt-1">Система учета выработки</p>
        </div>

        <div className="p-6 space-y-4">
          {telegramMessage && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-2 text-sm text-stone-600">
              {isTelegramLoading ? 'Проверяем Telegram...' : telegramMessage}
            </div>
          )}
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
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
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
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={!loginInput.trim() || !passwordInput.trim() || isLoading}
            className="w-full bg-amber-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-amber-700 active:transform active:scale-95 transition disabled:opacity-50"
          >
            {isLoading ? 'Вход...' : 'Войти в систему'}
          </button>
        </div>
      </div>
    </div>
  );
};
