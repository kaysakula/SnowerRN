//
//  RootNavigator.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-16.
//  Updated by KAY.SAKULA on 2025-10-17.
//
//  Description:
//  ルーティング管理
//  認証状態に応じてSplash/Login/MainTabを表示
//

import React, { useState, useCallback } from 'react';
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

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⛷️</div>
          <div className="text-xl text-gray-600">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (user) {
    return <MainTabNavigator />;
  }

  if (showSignup) {
    return <SignupEmailScreen onBack={handleBackFromSignup} />;
  }

  return <LoginScreen onNavigateToSignup={handleNavigateToSignup} />;
};
