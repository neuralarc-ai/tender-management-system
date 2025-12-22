'use client';

import { DashboardView } from '@/components/dashboard/DashboardView';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth-context';

export default function ClientPortal() {
  const { logout } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['client']}>
      <DashboardView />
    </ProtectedRoute>
  );
}

