/**
 * User information
 */
export interface User {
  id: string;
  googleId?: string;
  githubId?: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  profilePicture?: string;
  role: 'user' | 'admin';
  authProvider: 'google' | 'github';
}

/**
 * Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
} 