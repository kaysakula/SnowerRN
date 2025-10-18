//
//  AuthContext.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-16.
//  Updated by KAY.SAKULA on 2025-10-16.
//
//  Description:
//  認証状態管理
//  ログイン・ログアウト・エラーハンドリング
//

import React, { useState, useEffect, createContext, useContext } from 'react';
import { loginService } from '../services/loginService';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  errorMessage: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Firebase Auth状態監視: onAuthStateChanged
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const user = await loginService.login(email, password);
      setUser(user);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const user = await loginService.signup(email, password);
      setUser(user);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const user = await loginService.loginWithGoogle();
      setUser(user);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithApple = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const user = await loginService.loginWithApple();
      setUser(user);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await loginService.logout();
      setUser(null);
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        errorMessage,
        login,
        signup,
        loginWithGoogle,
        loginWithApple,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
