import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import Cookies from 'js-cookie';
import * as api from '../api'; 
import { AdminUser } from '../models';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AdminUser | null;
  isLoading: boolean; 
  login: (token: string) => Promise<void>;
  logout: () => void;
}


const defaultAuthValue: AuthContextType = {
    isAuthenticated: false,
    user: null,
    isLoading: true, 
    login: async () => {},
    logout: () => {},
};


export const AuthContext = createContext<AuthContextType>(defaultAuthValue);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); 

  
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    const token = Cookies.get('authToken');
    if (token) {
      try {
        
        const adminInfo = await api.getAdminMe(); 
        setUser(adminInfo);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        Cookies.remove('authToken'); 
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setIsLoading(false);
  }, []); 

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]); 


  const login = useCallback(async (token: string) => {
    const expires = 1; 
    Cookies.set('authToken', token, { expires: expires, path: '/'}); 
    try {
         setIsLoading(true); 
         const adminInfo = await api.getAdminMe(); 
         setUser(adminInfo);
         setIsAuthenticated(true);
         setIsLoading(false);
    } catch (error) {
         console.error("Failed to fetch user info after login:", error);
         
         
         setIsAuthenticated(true); 
         setUser(null);
         setIsLoading(false);
    }

  }, []); 

  const logout = useCallback(() => {
    Cookies.remove('authToken', { path: '/' });
    setIsAuthenticated(false);
    setUser(null);
    
  }, []); 


  
  const contextValue = React.useMemo(() => ({
      isAuthenticated,
      user,
      isLoading,
      login,
      logout,
  }), [isAuthenticated, user, isLoading, login, logout]);


  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};