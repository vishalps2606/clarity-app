import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const defaultAuthContext: AuthContextType = {
  token: null,
  login: async () => {},
  logout: async () => {},
  isLoading: false,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // For now, just set isLoading to false immediately
    // We'll skip persisting token between app restarts to avoid storage issues
    setIsLoading(false);
  }, []);

  const login = async (newToken: string) => {
    try {
      if (!newToken || typeof newToken !== 'string' || newToken.trim().length === 0) {
        throw new Error('Invalid token: must be a non-empty string');
      }
      console.log('Logged in successfully');
      setToken(newToken);
    } catch (e) {
      console.error('Login error:', e);
      setToken(null);
      throw e;
    }
  };

  const logout = async () => {
    try {
      console.log('Logged out');
      setToken(null);
    } catch (e) {
      console.error('Logout error:', e);
      throw e;
    }
  };

  const value: AuthContextType = {
    token,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};