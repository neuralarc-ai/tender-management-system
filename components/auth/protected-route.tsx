'use client';

import { useAuth } from '@/contexts/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('client' | 'admin')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { authState, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!authState.isAuthenticated) {
        router.push('/auth/pin');
        return;
      }

      if (allowedRoles && authState.role && !allowedRoles.includes(authState.role)) {
        // User doesn't have the right role, redirect to their appropriate dashboard
        router.push(authState.role === 'client' ? '/client' : '/admin');
        return;
      }
    }
  }, [authState, isLoading, router, allowedRoles]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-passion"></div>
            <span className="text-lg font-semibold text-neural-light">Authenticating...</span>
          </div>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or wrong role
  if (!authState.isAuthenticated) {
    return null;
  }

  if (allowedRoles && authState.role && !allowedRoles.includes(authState.role)) {
    return null;
  }

  return <>{children}</>;
}

