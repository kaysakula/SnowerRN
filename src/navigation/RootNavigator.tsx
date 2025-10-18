//
//  RootNavigator.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-16.
//  Updated by KAY.SAKULA on 2025-10-18.
//
//  Description:
//  ルーティング管理
//  認証状態に応じてSplash/Login/MainTabを表示
//

import React, { useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { SplashScreen } from '../screens/common/SplashScreen';
import { LoginScreen } from '../screens/login/LoginScreen';
import { SignupEmailScreen } from '../screens/signup/SignupEmailScreen';
import { MainTabNavigator } from './MainTabNavigator';

export const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleNavigateToSignup = useCallback(() => {
    setShowSignup(true);
  }, []);

  const handleBackFromSignup = useCallback(() => {
    setShowSignup(false);
  }, []);

  // スプラッシュ画面表示中
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // 認証状態確認中
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingEmoji}>⛷️</Text>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </View>
    );
  }

  // ログイン済み → メイン画面
  if (user) {
    return <MainTabNavigator />;
  }

  // サインアップ画面
  if (showSignup) {
    return <SignupEmailScreen onBack={handleBackFromSignup} />;
  }

  // ログイン画面
  return <LoginScreen onNavigateToSignup={handleNavigateToSignup} />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 8,
  },
});
