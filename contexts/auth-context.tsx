'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthState {
  isAuthenticated: boolean;
  role: 'client' | 'admin' | null;
  timestamp: number | null;
}

interface AuthContextType {
  authState: AuthState;
  login: (role: 'client' | 'admin') => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_EXPIRY_HOURS = 8; // 8 hours session expiry

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    timestamp: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication state on mount and when pathname changes
  useEffect(() => {
    checkAuthState();
  }, [pathname]);

  const checkAuthState = () => {
    try {
      const storedAuth = localStorage.getItem('auth');
      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth) as AuthState;
        const now = Date.now();
        const sessionAge = now - (parsedAuth.timestamp || 0);
        const maxAge = AUTH_EXPIRY_HOURS * 60 * 60 * 1000;

        if (parsedAuth.isAuthenticated && sessionAge < maxAge) {
          setAuthState(parsedAuth);
          setIsLoading(false);
          return;
        } else {
          // Session expired, clear it
          localStorage.removeItem('auth');
        }
      }

      // Not authenticated or session expired
      setAuthState({
        isAuthenticated: false,
        role: null,
        timestamp: null,
      });

      // Redirect to PIN page if not already there
      if (pathname !== '/auth/pin' && pathname !== '/') {
        router.push('/auth/pin');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      localStorage.removeItem('auth');
      setAuthState({
        isAuthenticated: false,
        role: null,
        timestamp: null,
      });
      router.push('/auth/pin');
    }
    
    setIsLoading(false);
  };

  const login = (role: 'client' | 'admin') => {
    const newAuthState: AuthState = {
      isAuthenticated: true,
      role,
      timestamp: Date.now(),
    };
    
    setAuthState(newAuthState);
    localStorage.setItem('auth', JSON.stringify(newAuthState));
    
    // Redirect to appropriate dashboard
    router.push(role === 'client' ? '/client' : '/admin');
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      role: null,
      timestamp: null,
    });
    localStorage.removeItem('auth');
    router.push('/auth/pin');
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
