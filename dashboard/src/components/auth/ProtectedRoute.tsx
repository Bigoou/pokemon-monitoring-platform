import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Props for the ProtectedRoute component
 */
interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

/**
 * Component that protects routes requiring authentication
 */
export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user, checkAuthStatus, getAuthToken } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Vérifier l'authentification si nous avons un token mais que l'utilisateur n'est pas authentifié
    if (!isAuthenticated && !isLoading && getAuthToken()) {
      checkAuthStatus();
    }
  }, [isAuthenticated, isLoading, checkAuthStatus, getAuthToken]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}; 