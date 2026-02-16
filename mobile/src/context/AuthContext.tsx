import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store'; // <--- We must actually use this!

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
  isLoading: true, // Default to true so we don't flash the login screen
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. LOAD TOKEN ON STARTUP
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('token');
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadToken();
  }, []);

  const login = async (newToken: string) => {
    try {
      if (!newToken || typeof newToken !== 'string' || newToken.trim().length === 0) {
        throw new Error('Invalid token: must be a non-empty string');
      }
      
      // 2. SAVE TOKEN TO SECURE STORE (Critical!)
      await SecureStore.setItemAsync('token', newToken);
      
      console.log('Token saved securely');
      setToken(newToken);
    } catch (e) {
      console.error('Login error:', e);
      throw e;
    }
  };

  const logout = async () => {
    try {
      // 3. DELETE TOKEN FROM SECURE STORE
      await SecureStore.deleteItemAsync('token');
      
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