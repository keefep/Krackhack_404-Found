import React, { createContext, useContext, useState, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        // TODO: Check if user is logged in
        // - Check for stored auth token
        // - Validate token with API
        // - Fetch user data if token is valid
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
        setIsAuthenticated(false);
        setUser(null);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // TODO: Implement sign in logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Mock successful login
      setUser({
        id: '1',
        name: 'John Doe',
        email: email,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to sign in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        setIsLoading(true);
        // TODO: Implement sign up logic
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        // Mock successful registration
        setUser({
          id: '1',
          name: name,
          email: email,
        });
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to sign up:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: Implement sign out logic
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Failed to sign out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      // TODO: Implement password reset logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } catch (error) {
      console.error('Failed to reset password:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
