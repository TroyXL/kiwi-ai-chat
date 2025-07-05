import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as authApi from '../api/auth';
import { Spinner } from '../components/Spinner';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (userName: string, pass: string) => Promise<void>;
  register: (userName: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (userName: string, password: string) => {
    await authApi.login(userName, password);
    setIsAuthenticated(true);
  };

  const register = async (userName: string, password: string) => {
    await authApi.register(userName, password);
    await login(userName, password);
  };

  const logout = async () => {
    await authApi.logout();
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div className="loading-screen"><Spinner /></div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};