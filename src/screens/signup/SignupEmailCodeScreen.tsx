//
//  SignupEmailCodeScreen.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-14.
//  Updated by KAY.SAKULA on 2025-10-15.
//
//  Description:
//  サインアップ - 認証コード入力画面
//  メールで送信された6桁の認証コードを検証
//  自動フォーカス、再送信機能、タイマー実装
//

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../navigation/SignupNavigator';
import { useSignupStore } from '../../stores/signupStore';
import { signupService } from '../../services/signupService';

type NavigationProp = StackNavigationProp<AuthStackParamList>;

const SignupEmailCodeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { email, setVerificationCode } = useSignupStore();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // タイマー
  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // コード入力処理
  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // 次の入力欄へ
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // 6桁入力完了時に自動検証
    if (newCode.every(digit => digit !== '') && !loading) {
      verifyCode(newCode.join(''));
    }
  };

  // バックスペース処理
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 認証コード検証
  const verifyCode = async (fullCode: string) => {
    setLoading(true);

    try {
      // TODO: 実際の認証コード検証ロジック
      // 開発環境では任意のコードを受け入れる
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));

      // 検証成功
      setVerificationCode(fullCode);

      // アカウント作成画面へ
      navigation.navigate('SignupAccount');
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('エラー', '認証コードが正しくありません');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // 再送信
  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      await signupService.sendVerificationCode(email);
      setResendTimer(60);
      Alert.alert('送信完了', '認証コードを再送信しました');
    } catch {
      Alert.alert('エラー', '再送信に失敗しました');
    }
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.emoji}>📧</Text>
        <Text style={styles.title}>認証コードを入力</Text>
        <Text style={styles.subtitle}>
          {email} に送信された6桁のコードを入力してください
        </Text>
      </View>

      {/* ステップインジケーター */}
      <View style={styles.stepIndicator}>
        <View style={styles.stepDot} />
        <View style={[styles.stepDot, styles.stepActive]} />
        <View style={styles.stepDot} />
        <View style={styles.stepDot} />
      </View>

      {/* コード入力欄 */}
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (inputRefs.current[index] = ref)}
            style={[styles.codeInput, digit ? styles.codeInputFilled : null]}
            value={digit}
            onChangeText={text => handleCodeChange(text.slice(-1), index)}
            onKeyPress={e => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            autoFocus={index === 0}
            editable={!loading}
          />
        ))}
      </View>

      {loading && (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      )}

      {/* 再送信 */}
      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResend}
        disabled={resendTimer > 0}
      >
        <Text
          style={[
            styles.resendText,
            resendTimer > 0 && styles.resendTextDisabled,
          ]}
        >
          {resendTimer > 0
            ? `コードを再送信 (${resendTimer}秒)`
            : 'コードを再送信'}
        </Text>
      </TouchableOpacity>

      {/* ヒント */}
      <Text style={styles.hintText}>
        コードが届かない場合は、迷惑メールフォルダをご確認ください
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
  },
  stepActive: {
    backgroundColor: '#3b82f6',
    width: 24,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    color: '#1e293b',
  },
  codeInputFilled: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  loader: {
    marginVertical: 20,
  },
  resendButton: {
    padding: 16,
    alignItems: 'center',
  },
  resendText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: '#94a3b8',
  },
  hintText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 12,
    marginTop: 20,
    lineHeight: 18,
  },
});

export default SignupEmailCodeScreen;
