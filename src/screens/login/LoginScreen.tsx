//
//  LoginScreen.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-17.
//  Updated by KAY.SAKULA on 2025-10-18.
//
//  Description:
//  ログイン画面
//  Google/Apple/Email認証と新規登録への遷移
//

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.emoji}>⛷️</Text>
          <Text style={styles.title}>Snowerへようこそ</Text>
          <Text style={styles.subtitle}>スキー・スノボ仲間と繋がろう</Text>
        </View>

        {/* ボタングループ */}
        <View style={styles.buttonGroup}>
          {/* Googleログイン */}
          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={loginWithGoogle}
          >
            <Icon name="chrome" size={24} color="#fff" />
            <Text style={styles.buttonText}>Googleアカウントで続ける</Text>
          </TouchableOpacity>

          {/* Appleログイン */}
          <TouchableOpacity
            style={[styles.button, styles.appleButton]}
            onPress={loginWithApple}
          >
            <Icon name="user" size={24} color="#fff" />
            <Text style={styles.buttonText}>Appleアカウントで続ける</Text>
          </TouchableOpacity>

          {/* 区切り線 */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>または</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 新規作成ボタン */}
          <TouchableOpacity
            style={[styles.button, styles.signupButton]}
            onPress={onNavigateToSignup}
          >
            <Text style={styles.buttonText}>アカウント新規作成</Text>
          </TouchableOpacity>

          {/* 既存ログイン */}
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => setShowEmailLogin(true)}
          >
            <Text style={styles.loginButtonText}>
              アカウントをお持ちの方はログイン
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  buttonGroup: {
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  googleButton: {
    backgroundColor: '#EF4444',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  signupButton: {
    backgroundColor: '#3B82F6',
  },
  loginButton: {
    backgroundColor: '#E5E7EB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  dividerText: {
    color: '#6B7280',
    fontSize: 14,
  },
});
