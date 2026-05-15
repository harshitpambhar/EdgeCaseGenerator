import { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signOut, getCurrentUser, fetchUserAttributes, signInWithRedirect } from 'aws-amplify/auth';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Added a loading state

  // When the app loads, check if the user is already logged in
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      await getCurrentUser(); 
      const attributes = await fetchUserAttributes(); 
      
      // Clever trick: Grab the Google name if it exists, otherwise extract it from the email!
      // Example: "paramvadhadiya500@gmail.com" becomes "Paramvadhadiya500"
      let userName = attributes.name || attributes.given_name;
      if (!userName && attributes.email) {
        userName = attributes.email.split('@')[0];
        userName = userName.charAt(0).toUpperCase() + userName.slice(1);
      }

      setUser({
        name: userName || 'Developer', 
        email: attributes.email,
        avatar: attributes.picture || null, // Google sometimes passes a profile picture!
        role: 'Developer',
      });
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Send the email and password to AWS Cognito
      await signIn({
        username: credentials.email,
        password: credentials.password
      });
      await checkUser(); // If successful, grab their details
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Throw the error so the Login Page can show a red warning
    }
  };

  const logout = async () => {
    try {
      await signOut(); // Tell AWS to log them out
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // NEW: Function to handle Google/GitHub buttons
  const socialLogin = async (providerName) => {
    try {
      // providerName will be 'Google' or 'GitHub'
      await signInWithRedirect({ provider: providerName });
    } catch (error) {
      console.error(`${providerName} login error:`, error);
    }
  };



 return (
    // NEW: Add socialLogin to the provided values
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, socialLogin }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};