import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiRequest, setLocalAccessToken } from '../services/api.js';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SALES_MEMBER';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: 'ADMIN' | 'SALES_MEMBER') => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: ('ADMIN' | 'SALES_MEMBER')[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const silentLogin = useCallback(async () => {
    try {
      // Trigger API request which will execute silent token refresh under the hood
      const response = await apiRequest('/auth/refresh', { method: 'POST', skipAuth: true });
      if (response.success && response.data.accessToken) {
        setLocalAccessToken(response.data.accessToken);
        setUser(response.data.user);
      }
    } catch (e) {
      // User is not logged in, ignore silent fail
      setLocalAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    silentLogin();
  }, [silentLogin]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true,
      });

      if (response.success && response.data.accessToken) {
        setLocalAccessToken(response.data.accessToken);
        setUser(response.data.user);
      }
    } catch (error) {
      setLocalAccessToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role?: 'ADMIN' | 'SALES_MEMBER') => {
    setIsLoading(true);
    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
        skipAuth: true,
      });

      if (response.success) {
        // Auto-login after registration
        await login(email, password);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLocalAccessToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  const hasRole = (roles: ('ADMIN' | 'SALES_MEMBER')[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
