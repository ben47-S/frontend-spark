import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, getDefaultRoute } from '@/contexts/AuthContext';
import type { Role } from '@/types/api';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier les rôles autorisés
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Rediriger vers le dashboard approprié
    const defaultRoute = getDefaultRoute(user.role);
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
}
