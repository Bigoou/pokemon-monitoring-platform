/**
 * User information
 */
export interface User {
  id: string;
  googleId: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  profilePicture?: string;
  role: 'user' | 'admin';
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