//
//  AuthContext.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-16.
//  Updated by KAY.SAKULA on 2025-10-18.
//
//  Description:
//  認証状態管理
//  ログイン・ログアウト・エラーハンドリング
//

import React, { useState, useEffect, createContext, useContext } from 'react';
import loginService from '../services/login/loginService';

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
    const unsubscribe = loginService.onAuthStateChanged(currentUser => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
    // loginServiceはシングルトンのため、依存配列は空でOK
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const result = await loginService.loginWithEmail(email, password);
      setUser(result.user);
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
      const result = await loginService.signupWithEmail(email, password);
      setUser(result.user);
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
      const result = await loginService.loginWithGoogle();
      setUser(result.user);
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
      const result = await loginService.loginWithApple();
      setUser(result.user);
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
