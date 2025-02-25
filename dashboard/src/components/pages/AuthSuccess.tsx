import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Authentication success page component
 */
export const AuthSuccess = () => {
  const { checkAuthStatus, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuth = await checkAuthStatus();
      
      if (isAuth) {
        navigate('/', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    };

    // Ne vérifier que si le chargement est terminé et que l'utilisateur n'est pas déjà authentifié
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/', { replace: true });
      } else {
        verifyAuth();
      }
    }
  }, [checkAuthStatus, isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">
          Authentification réussie
        </h2>
        <p className="mt-2 text-gray-600">
          Redirection vers le tableau de bord...
        </p>
      </div>
    </div>
  );
}; 