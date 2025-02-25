import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types/auth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
}

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null
};

const AuthContext = createContext<AuthContextType>({
  ...defaultAuthState,
  login: () => {},
  logout: () => {},
  checkAuthStatus: async () => false
});

/**
 * Custom hook to use the auth context
 */
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);

  /**
   * Check if user is authenticated
   */
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      console.log('Checking auth status...');
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(`${BACKEND_URL}/auth/user`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        console.log('Auth check failed:', response.status);
        throw new Error('Not authenticated');
      }

      const user: User = await response.json();
      console.log('User authenticated:', user.displayName);
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        error: null
      });
      
      return true;
    } catch (error) {
      console.log('Auth error:', error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: error instanceof Error ? error.message : 'Authentication error'
      });
      
      return false;
    }
  };

  /**
   * Redirect to Google login
   */
  const login = () => {
    console.log('Redirecting to login...');
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  /**
   * Logout user
   */
  const logout = () => {
    console.log('Logging out...');
    window.location.href = `${BACKEND_URL}/auth/logout`;
  };

  // Check authentication status on mount
  useEffect(() => {
    console.log('AuthProvider mounted, checking status...');
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        checkAuthStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 