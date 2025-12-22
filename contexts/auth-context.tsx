'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface AuthState {
  isAuthenticated: boolean;
  role: 'client' | 'admin' | null;
  userId: string | null;
  email: string | null;
  organization: string | null;
  timestamp: number | null;
}

interface AuthContextType {
  authState: AuthState;
  login: (role: 'client' | 'admin', userId: string, email: string, organization: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_EXPIRY_HOURS = 8; // 8 hours session expiry

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    userId: null,
    email: null,
    organization: null,
    timestamp: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication state on mount and when pathname changes
  useEffect(() => {
    checkAuthState();
  }, [pathname]);

  const checkAuthState = async () => {
    try {
      const storedAuth = localStorage.getItem('auth');
      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth) as AuthState;
        const now = Date.now();
        const sessionAge = now - (parsedAuth.timestamp || 0);
        const maxAge = AUTH_EXPIRY_HOURS * 60 * 60 * 1000;

        if (parsedAuth.isAuthenticated && sessionAge < maxAge) {
          setAuthState(parsedAuth);
          
          // Update last_login_at in database
          if (parsedAuth.userId) {
            await supabase
              .from('users')
              .update({ last_login_at: new Date().toISOString() })
              .eq('id', parsedAuth.userId);
          }
          
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
        userId: null,
        email: null,
        organization: null,
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
        userId: null,
        email: null,
        organization: null,
        timestamp: null,
      });
      router.push('/auth/pin');
    }
    
    setIsLoading(false);
  };

  const login = (role: 'client' | 'admin', userId: string, email: string, organization: string) => {
    const newAuthState: AuthState = {
      isAuthenticated: true,
      role,
      userId,
      email,
      organization,
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
      userId: null,
      email: null,
      organization: null,
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
