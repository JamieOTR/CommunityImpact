import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { AdminLayout } from './AdminLayout';

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminAuth();

  // Show loading state while checking authentication
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to landing if not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Redirect to not authorized if not admin
  if (!isAdmin) {
    return <Navigate to="/not-authorized" replace />;
  }

  // Render children within admin layout if authorized
  return <AdminLayout>{children}</AdminLayout>;
}
