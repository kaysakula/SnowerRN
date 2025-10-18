//
//  useLogin.ts
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-13.
//  Updated by KAY.SAKULA on 2025-10-18.
//
//  Description:
//  認証状態管理フック
//  ログイン・ログアウト・認証状態監視
//  SwiftUIのAuthViewModelに相当
//

import { useState, useEffect, useCallback } from 'react';
import loginService from '../../services/login/loginService';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = loginService.onAuthStateChanged(currentUser => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
    // loginServiceはシングルトンのため依存配列は空
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // メールログイン
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginService.loginWithEmail(email, password);
      setUser(result.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // メール新規登録
  const signup = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginService.signupWithEmail(email, password);
      setUser(result.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Googleログイン
  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginService.loginWithGoogle();
      setUser(result.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Appleログイン
  const loginWithApple = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginService.loginWithApple();
      setUser(result.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ログアウト
  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginService.logout();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // パスワードリセット
  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await loginService.sendPasswordResetEmail(email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    signup,
    loginWithGoogle,
    loginWithApple,
    logout,
    resetPassword,
  };
};
