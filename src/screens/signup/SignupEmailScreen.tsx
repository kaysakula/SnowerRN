//
//  SignupEmailScreen.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-14.
//  Updated by KAY.SAKULA on 2025-10-18.
//
//  Description:
//  メール新規登録画面
//  Email、パスワード、パスワード確認でアカウント作成
//

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../contexts/AuthContext';

interface SignupEmailScreenProps {
  onBack: () => void;
  onNext?: () => void;
}

export const SignupEmailScreen: React.FC<SignupEmailScreenProps> = ({
  onBack,
  _onNext, // 未使用だが将来使う可能性があるため _ プレフィックス
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signup, isLoading, errorMessage } = useAuth();

  const handleSignup = useCallback(async () => {
    if (password !== confirmPassword) {
      Alert.alert('エラー', 'パスワードが一致しません');
      return;
    }

    try {
      await signup(email, password);
    } catch {
      // エラーはuseAuthのerrorMessageで表示される
    }
  }, [email, password, confirmPassword, signup]);

  const isFormValid =
    email && password && confirmPassword && password === confirmPassword;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 戻るボタン */}
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Icon name="arrow-left" size={24} color="#3B82F6" />
          <Text style={styles.backText}>戻る</Text>
        </TouchableOpacity>

        {/* タイトル */}
        <Text style={styles.title}>アカウント作成</Text>
        <Text style={styles.subtitle}>メールアドレスで新規登録</Text>

        {/* フォーム */}
        <View style={styles.form}>
          {/* メールアドレス */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>メールアドレス</Text>
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
                placeholder="8文字以上"
                secureTextEntry
                editable={!isLoading}
              />
            </View>
          </View>

          {/* パスワード確認 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>パスワード確認</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="lock"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="もう一度入力"
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

          {/* 作成ボタン */}
          <TouchableOpacity
            style={[
              styles.signupButton,
              (!isFormValid || isLoading) && styles.signupButtonDisabled,
            ]}
            onPress={handleSignup}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signupButtonText}>アカウント作成</Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
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
  signupButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signupButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
