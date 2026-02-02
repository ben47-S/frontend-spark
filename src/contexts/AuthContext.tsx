import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, tokenStorage, apiGet, apiPost } from '@/lib/api';
import type { User, LoginRequest, LoginResponse, Role } from '@/types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Route par défaut selon le rôle
export const getDefaultRoute = (role: Role): string => {
  switch (role) {
    case 'ADMIN_GLOBAL':
      return '/admin';
    case 'ADMIN_COLLEGE':
      return '/admin-college';
    case 'ENSEIGNANT':
      return '/enseignant';
    case 'ETUDIANT':
      return '/etudiant';
    case 'PARENT':
      return '/parent';
    default:
      return '/';
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiGet<User>('/auth/me');
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        tokenStorage.clearTokens();
        setUser(null);
      }
    } catch {
      tokenStorage.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await apiPost<LoginResponse>('/auth/login', credentials, {
        requiresAuth: false,
      });

      if (response.success && response.data) {
        tokenStorage.setTokens(response.data.tokens);
        setUser(response.data.user);
        
        // Redirection vers le dashboard approprié
        const defaultRoute = getDefaultRoute(response.data.user.role);
        navigate(defaultRoute);
        
        return { success: true };
      }

      return {
        success: false,
        error: response.error?.message || 'Erreur de connexion',
      };
    } catch {
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  };

  const logout = useCallback(() => {
    tokenStorage.clearTokens();
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
