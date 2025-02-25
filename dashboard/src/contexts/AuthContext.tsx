import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types/auth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001';

interface AuthContextType extends AuthState {
  loginWithGoogle: () => void;
  loginWithGithub: () => void;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
  getAuthToken: () => string | null;
}

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null
};

const AuthContext = createContext<AuthContextType>({
  ...defaultAuthState,
  loginWithGoogle: () => {},
  loginWithGithub: () => {},
  logout: () => {},
  checkAuthStatus: async () => false,
  getAuthToken: () => null
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
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));

  /**
   * Get the authentication token
   */
  const getAuthToken = (): string | null => {
    return token || localStorage.getItem('auth_token');
  };

  /**
   * Check if user is authenticated
   */
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Check if we have a token in URL params (after redirect from auth service)
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get('token');
      
      if (tokenParam) {
        localStorage.setItem('auth_token', tokenParam);
        setToken(tokenParam);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // Use token from state or localStorage
      const currentToken = getAuthToken();
      
      if (!currentToken) {
        console.log('AuthContext - No token found');
        throw new Error('No authentication token');
      }
      
      console.log('AuthContext - Validating token with auth service');
      // Validate token with auth service
      const response = await fetch(`${AUTH_SERVICE_URL}/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: currentToken })
      });

      const data = await response.json();
      
      if (!data.valid) {
        console.log('AuthContext - Token invalid:', data.error);
        throw new Error(data.error || 'Invalid token');
      }

      // Get user info
      const userResponse = await fetch(`${AUTH_SERVICE_URL}/auth/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      if (!userResponse.ok) {
        console.log('AuthContext - Failed to get user info:', userResponse.status);
        throw new Error(`Failed to get user info: ${userResponse.status}`);
      }

      const user: User = await userResponse.json();
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        error: null
      });
      
      return true;
    } catch (error) {
      console.log('AuthContext - Auth error:', error);
      // Clear token if authentication failed
      localStorage.removeItem('auth_token');
      setToken(null);
      
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
  const loginWithGoogle = () => {
    window.location.href = `${AUTH_SERVICE_URL}/auth/google`;
  };

  /**
   * Redirect to GitHub login
   */
  const loginWithGithub = () => {
    window.location.href = `${AUTH_SERVICE_URL}/auth/github`;
  };

  /**
   * Logout user
   */
  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null
    });
    window.location.href = `${AUTH_SERVICE_URL}/auth/logout`;
  };

  // Check authentication status on mount
  useEffect(() => {
    console.log('AuthContext - Provider mounted, checking status...');
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        loginWithGoogle,
        loginWithGithub,
        logout,
        checkAuthStatus,
        getAuthToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 