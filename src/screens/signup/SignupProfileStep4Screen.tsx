//
//  SignupProfileStep4Screen.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-14.
//  Updated by KAY.SAKULA on 2025-10-14.
//
//  Description:
//  プロフィール入力 - Step4: 目的
//  Snowerでやりたいことを選択（必須）
//  友達探し、情報収集、割引探しなど
//

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../navigation/SignupNavigator';
import { useSignupStore } from '../../stores/signupStore';

type NavigationProp = StackNavigationProp<AuthStackParamList>;

const PURPOSE_OPTIONS = [
  '友達探し',
  '情報収集',
  '割引探し',
  'ギア探し',
  '記録残し',
  '予定合わせ',
  '暇つぶし',
];

const SignupProfileStep4Screen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { purposes, setPurposes } = useSignupStore();
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>(purposes);
  const [error, setError] = useState('');

  // 目的選択
  const togglePurpose = (item: string) => {
    setError('');
    setSelectedPurposes(prev =>
      prev.includes(item) ? prev.filter(p => p !== item) : [...prev, item],
    );
  };

  // 次へ
  const handleNext = () => {
    // バリデーション: 目的は必須
    if (selectedPurposes.length === 0) {
      setError('やりたいことを選択してください');
      return;
    }

    // Zustandに保存
    setPurposes(selectedPurposes);

    // 次の画面へ
    navigation.navigate('SignupProfileStep5');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>Snowerでやりたいこと</Text>
          <Text style={styles.subtitle}>目的を教えてください</Text>
        </View>

        {/* ステップインジケーター */}
        <View style={styles.stepIndicator}>
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={[styles.stepDot, styles.stepActive]} />
          <View style={styles.stepDot} />
        </View>

        {/* エラーメッセージ */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* 目的選択 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Snowerでやりたいこと <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.checkboxContainer}>
            {PURPOSE_OPTIONS.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.checkboxItem}
                onPress={() => togglePurpose(item)}
              >
                <View
                  style={[
                    styles.checkbox,
                    selectedPurposes.includes(item) && styles.checkboxChecked,
                  ]}
                >
                  {selectedPurposes.includes(item) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* フッター */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedPurposes.length === 0 && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={selectedPurposes.length === 0}
        >
          <Text style={styles.nextButtonText}>次へ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
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
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  required: {
    color: '#ef4444',
  },
  checkboxContainer: {
    gap: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#334155',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  nextButton: {
    height: 56,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignupProfileStep4Screen;
