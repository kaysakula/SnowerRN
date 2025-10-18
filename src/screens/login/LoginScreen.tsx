//
//  LoginScreen.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-17.
//  Updated by KAY.SAKULA on 2025-10-17.
//
//  Description:
//  ログイン画面
//  Google/Apple/Email認証と新規登録への遷移
//

import React, { useState, useCallback } from 'react';
import { Chrome, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginEmailScreen } from './LoginEmailScreen';

interface LoginScreenProps {
  onNavigateToSignup: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToSignup,
}) => {
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const { loginWithGoogle, loginWithApple } = useAuth();

  const handleBackFromEmailLogin = useCallback(() => {
    setShowEmailLogin(false);
  }, []);

  if (showEmailLogin) {
    return <LoginEmailScreen onBack={handleBackFromEmailLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">⛷️</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Snowerへようこそ
          </h1>
          <p className="text-gray-600">スキー・スノボ仲間と繋がろう</p>
        </div>

        <div className="space-y-4">
          {/* Googleログイン */}
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
          >
            <Chrome size={24} />
            <span>Googleアカウントで続ける</span>
          </button>

          {/* Appleログイン */}
          <button
            onClick={loginWithApple}
            className="w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
          >
            <User size={24} />
            <span>Appleアカウントで続ける</span>
          </button>

          {/* 区切り線 */}
          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">または</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* 新規作成ボタン */}
          <button
            onClick={onNavigateToSignup}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
          >
            アカウント新規作成
          </button>

          {/* 既存ログイン */}
          <button
            onClick={() => setShowEmailLogin(true)}
            className="w-full bg-gray-200 hover:bg-gray-300 text-blue-600 font-semibold py-4 px-6 rounded-xl transition-colors"
          >
            アカウントをお持ちの方はログイン
          </button>
        </div>
      </div>
    </div>
  );
};
