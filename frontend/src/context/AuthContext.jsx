import { createContext, useContext, useState, useEffect } from 'react';
import { authService, getErrorMessage, getFieldErrors } from '../services/api';

const AuthContext = createContext(null);

/** Backend returns `fullName`; header/UI expect `name`. */
function normalizeStoredUser(u) {
  if (!u) return null;
  const displayName = u.fullName ?? u.name ?? '';
  return { ...u, name: displayName, fullName: u.fullName ?? u.name ?? displayName };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token) {
      setIsAuthenticated(true);
      if (storedUser) {
        try {
          setUser(normalizeStoredUser(JSON.parse(storedUser)));
        } catch {
          setUser(null);
        }
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { token, user: u } = response.data;
      
      // Store JWT token
      localStorage.setItem('token', token);
      
      // Normalize and store user data
      const normalized = normalizeStoredUser(u);
      if (normalized) {
        localStorage.setItem('user', JSON.stringify(normalized));
        setUser(normalized);
      } else {
        localStorage.removeItem('user');
        setUser(null);
      }
      
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: getErrorMessage(error),
        fieldErrors: getFieldErrors(error),
      };
    }
  };

  const signup = async (payload) => {
    try {
      await authService.signup(payload);
      return { success: true };
    } catch (error) {
      console.error('Signup failed:', error);
      return {
        success: false,
        error: getErrorMessage(error),
        fieldErrors: getFieldErrors(error),
      };
    }
  };

  const logout = () => {
    // Clear JWT token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Check if user has valid token
  const hasValidToken = () => {
    return !!localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        login, 
        signup, 
        logout, 
        loading,
        hasValidToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
