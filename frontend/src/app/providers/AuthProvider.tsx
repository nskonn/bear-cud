import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '@/src/shared/types';

interface AuthContextType {
  currentUser: User | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (response.ok && data.success) {
            setCurrentUser(data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    const handleUnauthorized = () => {
      setCurrentUser(null);
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const login = (user: User, token: string) => {
    localStorage.setItem('token', token);
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  return (
      <AuthContext.Provider value={{ currentUser, login, logout, isLoading }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
