//
//  LoginEmailScreen.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-17.
//  Updated by KAY.SAKULA on 2025-10-18.
//
//  Description:
//  メール・パスワードログイン画面
//

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
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
    try {
      await login(email, password);
    } catch {
      // エラーはuseAuthのerrorMessageで表示される
    }
  }, [email, password, login]);

  const isFormValid = email && password;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 戻るボタン */}
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Icon name="arrow-left" size={24} color="#3B82F6" />
          <Text style={styles.backText}>戻る</Text>
        </TouchableOpacity>

        {/* タイトル */}
        <Text style={styles.title}>ログイン</Text>

        {/* フォーム */}
        <View style={styles.form}>
          {/* メールアドレス */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>メールアドレス / ユーザー名</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="mail"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* パスワード */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>パスワード</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="lock"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                editable={!isLoading}
              />
            </View>
          </View>

          {/* エラーメッセージ */}
          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* ログインボタン */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              (!isFormValid || isLoading) && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>ログイン</Text>
            )}
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
    padding: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  backText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 32,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
