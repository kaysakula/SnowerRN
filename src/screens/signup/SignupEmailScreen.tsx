//
//  SignupEmailScreen.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-14.
//  Updated by KAY.SAKULA on 2025-10-17.
//
//  Description:
//  メール新規登録画面
//  Email、パスワード、パスワード確認でアカウント作成
//

import React, { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface SignupEmailScreenProps {
  onBack: () => void;
  onNext?: () => void;
}

export const SignupEmailScreen: React.FC<SignupEmailScreenProps> = ({
  onBack,
  onNext,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signup, isLoading, errorMessage } = useAuth();

  const handleSignup = useCallback(async () => {
    if (password !== confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }
    await signup(email, password);
  }, [email, password, confirmPassword, signup]);

  const isFormValid =
    email && password && confirmPassword && password === confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <button
          onClick={onBack}
          className="mb-6 text-blue-600 hover:text-blue-700 font-medium"
        >
          ← 戻る
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          アカウント作成
        </h2>
        <p className="text-gray-600 mb-8">メールアドレスで新規登録</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="8文字以上"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード確認
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="もう一度入力"
            />
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}

          <button
            onClick={handleSignup}
            disabled={!isFormValid || isLoading}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              isFormValid && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? '作成中...' : 'アカウント作成'}
          </button>
        </div>
      </div>
    </div>
  );
};
