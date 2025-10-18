//
//  SignupAccountScreen.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-14.
//  Updated by KAY.SAKULA on 2025-10-15.
//
//  Description:
//  サインアップ - アカウント情報入力画面
//  ユーザーID、パスワード、誕生日を入力
//  Firebase Authentication でアカウント作成し、Firestoreに未完了ユーザーとして保存
//

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../navigation/SignupNavigator';
import { useSignupStore } from '../../stores/signupStore';
import { signupService } from '../../services/signupService';
import { ValidationUtils } from '../../utils/validationUtils';
import { getErrorMessage } from '../../locales';

type NavigationProp = StackNavigationProp<AuthStackParamList>;

const SignupAccountScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    email,
    userId,
    password,
    confirmPassword,
    setUserId,
    setPassword,
    setConfirmPassword,
    setBirthday,
  } = useSignupStore();

  const [localUserId, setLocalUserId] = useState(userId);
  const [localPassword, setLocalPassword] = useState(password);
  const [localConfirmPassword, setLocalConfirmPassword] =
    useState(confirmPassword);
  const [selectedBirthday, setSelectedBirthday] = useState(
    new Date(2000, 0, 1),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    userId: '',
    password: '',
    confirmPassword: '',
    birthday: '',
  });

  // アカウント作成
  const handleCreateAccount = async () => {
    // バリデーション
    const userIdError = ValidationUtils.validateUserId(localUserId);
    const passwordError = ValidationUtils.validatePassword(localPassword);
    const passwordMatchError = ValidationUtils.validatePasswordMatch(
      localPassword,
      localConfirmPassword,
    );
    const birthdayError = ValidationUtils.validateBirthday(selectedBirthday);

    const newErrors = {
      userId: userIdError ? getErrorMessage(userIdError) : '',
      password: passwordError ? getErrorMessage(passwordError) : '',
      confirmPassword: passwordMatchError
        ? getErrorMessage(passwordMatchError)
        : '',
      birthday: birthdayError ? getErrorMessage(birthdayError) : '',
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(err => err !== '')) {
      return;
    }

    setLoading(true);

    try {
      // ユーザーID重複チェック
      const isDuplicate = await signupService.checkUserIdDuplicate(localUserId);
      if (isDuplicate) {
        setErrors({
          ...errors,
          userId: 'このユーザーIDは既に使用されています',
        });
        setLoading(false);
        return;
      }

      // Firebaseアカウント作成
      const uid = await signupService.createFirebaseAccount(
        email,
        localPassword,
      );

      // 未完了ユーザーとして保存
      await signupService.saveIncompleteUser(
        uid,
        email,
        localUserId,
        selectedBirthday,
      );

      // Zustandに保存
      setUserId(localUserId);
      setPassword(localPassword);
      setConfirmPassword(localConfirmPassword);
      setBirthday(selectedBirthday);

      // プロフィール入力画面へ
      navigation.navigate('SignupProfileStep1');
    } catch (error: any) {
      console.error('Account creation error:', error);
      let errorMessage = 'アカウント作成に失敗しました';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'このメールアドレスは既に使用されています';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'パスワードが弱すぎます';
      }

      Alert.alert('エラー', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🎿</Text>
          <Text style={styles.title}>アカウント作成</Text>
          <Text style={styles.subtitle}>
            あなただけのユーザーIDとパスワードを設定
          </Text>
        </View>

        {/* ステップインジケーター */}
        <View style={styles.stepIndicator}>
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={[styles.stepDot, styles.stepActive]} />
          <View style={styles.stepDot} />
        </View>

        {/* フォーム */}
        <View style={styles.form}>
          {/* ユーザーID */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ユーザーID</Text>
            <TextInput
              style={[styles.input, errors.userId && styles.inputError]}
              placeholder="snowboarder123"
              value={localUserId}
              onChangeText={text => {
                setLocalUserId(text);
                setErrors({ ...errors, userId: '' });
              }}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {errors.userId ? (
              <Text style={styles.errorText}>{errors.userId}</Text>
            ) : (
              <Text style={styles.helperText}>6〜32文字、半角英数字と記号</Text>
            )}
          </View>

          {/* パスワード */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>パスワード</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="••••••••"
                value={localPassword}
                onChangeText={text => {
                  setLocalPassword(text);
                  setErrors({ ...errors, password: '' });
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : (
              <Text style={styles.helperText}>6文字以上</Text>
            )}
          </View>

          {/* パスワード確認 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>パスワード（確認）</Text>
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && styles.inputError,
              ]}
              placeholder="••••••••"
              value={localConfirmPassword}
              onChangeText={text => {
                setLocalConfirmPassword(text);
                setErrors({ ...errors, confirmPassword: '' });
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          {/* 誕生日 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>誕生日</Text>
            <TouchableOpacity
              style={[styles.dateButton, errors.birthday && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
              disabled={loading}
            >
              <Text style={styles.dateText}>
                {selectedBirthday.toLocaleDateString('ja-JP')}
              </Text>
            </TouchableOpacity>
            {errors.birthday && (
              <Text style={styles.errorText}>{errors.birthday}</Text>
            )}
          </View>

          {/* 作成ボタン */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateAccount}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>アカウントを作成</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* DateTimePicker Modal (iOS) / Native Dialog (Android) */}
      {Platform.OS === 'ios' ? (
        <Modal transparent visible={showDatePicker} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalButton}>キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowDatePicker(false);
                    setErrors({ ...errors, birthday: '' });
                  }}
                >
                  <Text style={[styles.modalButton, styles.modalButtonPrimary]}>
                    完了
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedBirthday}
                mode="date"
                display="spinner"
                onChange={(event, date) => {
                  if (date) {
                    setSelectedBirthday(date);
                  }
                }}
                maximumDate={new Date()}
                locale="ja-JP"
              />
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={selectedBirthday}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (event.type === 'set' && date) {
                setSelectedBirthday(date);
                setErrors({ ...errors, birthday: '' });
              }
            }}
            maximumDate={new Date()}
          />
        )
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
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
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  eyeText: {
    fontSize: 24,
  },
  dateButton: {
    height: 56,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  dateText: {
    fontSize: 16,
    color: '#1e293b',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
  },
  helperText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 8,
  },
  button: {
    height: 56,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalButton: {
    fontSize: 16,
    color: '#64748b',
  },
  modalButtonPrimary: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export default SignupAccountScreen;
