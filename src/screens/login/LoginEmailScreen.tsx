//
//  LoginEmailScreen.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-17.
//  Updated by KAY.SAKULA on 2025-10-18.
//

import React, { useState, useCallback } from 'react';
import { Mail, Lock } from 'lucide-react-native'; // ← 変更
import { useAuth } from '../../contexts/AuthContext';

interface LoginEmailScreenProps {
  onBack: () => void;
}

export const LoginEmailScreen: React.FC<LoginEmailScreenProps> = ({
  onBack,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, errorMessage } = useAuth();

  const handleLogin = useCallback(async () => {
    await login(email, password);
  }, [email, password, login]);

  const isFormValid = email && password;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <button
          onClick={onBack}
          className="mb-6 text-blue-600 hover:text-blue-700 font-medium"
        >
          ← 戻る
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-8">ログイン</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス / ユーザー名
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
                color="#9CA3AF"
              />
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
                color="#9CA3AF"
              />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={!isFormValid || isLoading}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              isFormValid && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>

          <div className="text-center space-y-2 text-sm">
            <button
              type="button"
              className="text-blue-600 hover:underline block w-full"
            >
              Email または ユーザー名 を忘れた(未実装)
            </button>
            <button
              type="button"
              className="text-blue-600 hover:underline block w-full"
            >
              パスワードを忘れた(未実装)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
