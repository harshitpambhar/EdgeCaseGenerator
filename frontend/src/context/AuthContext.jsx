import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    name: 'Tirth Makadia',
    email: 'tirth@testgenai.dev',
    avatar: null,
    role: 'Developer',
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = (credentials) => {
    setUser({
      name: 'Tirth Makadia',
      email: credentials.email,
      avatar: null,
      role: 'Developer',
    });
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
