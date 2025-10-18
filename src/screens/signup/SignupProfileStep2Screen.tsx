//
//  SignupProfileStep2Screen.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-14.
//  Updated by KAY.SAKULA on 2025-10-14.
//
//  Description:
//  プロフィール入力 - Step2: ライディング情報
//  ギア(必須)、スタイル(任意)、開始年を選択
//  複数選択とタグ表示機能実装
//

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import DatePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../navigation/SignupNavigator';
import { useSignupStore } from '../../stores/signupStore';

type NavigationProp = StackNavigationProp<AuthStackParamList>;

const GEAR_OPTIONS = ['スキー', 'スノーボード', 'テレマーク'];
const STYLE_OPTIONS = [
  'フリーラン',
  'グラトリ',
  'パーク',
  'パウダー',
  'カービング',
];

const SignupProfileStep2Screen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { gear, style, startDate, setGear, setStyle, setStartDate } =
    useSignupStore();

  const [selectedGear, setSelectedGear] = useState<string[]>(gear);
  const [selectedStyle, setSelectedStyle] = useState<string[]>(style);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(
    startDate ? new Date(startDate) : null,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');

  // ギア選択
  const toggleGear = (item: string) => {
    setError('');
    setSelectedGear(prev =>
      prev.includes(item) ? prev.filter(g => g !== item) : [...prev, item],
    );
  };

  // スタイル選択
  const toggleStyle = (item: string) => {
    setSelectedStyle(prev =>
      prev.includes(item) ? prev.filter(s => s !== item) : [...prev, item],
    );
  };

  // 次へ
  const handleNext = () => {
    // バリデーション: ギアは必須
    if (selectedGear.length === 0) {
      setError('使用ギアを選択してください');
      return;
    }

    // Zustandに保存
    setGear(selectedGear);
    setStyle(selectedStyle);
    setStartDate(selectedStartDate);

    // 次の画面へ
    navigation.navigate('SignupProfileStep3');
  };

  // 戻る
  const handleBack = () => {
    navigation.goBack();
  };

  // SKIPボタン
  const handleSkip = () => {
    // ギアが選択されていればスキップ可能
    if (selectedGear.length > 0) {
      setGear(selectedGear);
      setStyle(selectedStyle);
      setStartDate(selectedStartDate);
      navigation.navigate('SignupProfileStep3');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>ライディング情報</Text>
          <Text style={styles.subtitle}>あなたのスタイルを教えてください</Text>
        </View>

        {/* ステップインジケーター */}
        <View style={styles.stepIndicator}>
          <View style={styles.stepDot} />
          <View style={[styles.stepDot, styles.stepActive]} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
        </View>

        {/* エラーメッセージ */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ギア選択 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            使用ギアカテゴリ <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.checkboxContainer}>
            {GEAR_OPTIONS.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.checkboxItem}
                onPress={() => toggleGear(item)}
              >
                <View
                  style={[
                    styles.checkbox,
                    selectedGear.includes(item) && styles.checkboxChecked,
                  ]}
                >
                  {selectedGear.includes(item) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* スタイル選択 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ライディングスタイル(任意)</Text>
          <View style={styles.checkboxContainer}>
            {STYLE_OPTIONS.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.checkboxItem}
                onPress={() => toggleStyle(item)}
              >
                <View
                  style={[
                    styles.checkbox,
                    selectedStyle.includes(item) && styles.checkboxChecked,
                  ]}
                >
                  {selectedStyle.includes(item) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 開始年 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>始めた時期</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {selectedStartDate
                ? selectedStartDate.toLocaleDateString('ja-JP')
                : '選択してください'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SKIPボタン */}
        {selectedGear.length > 0 && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>SKIP</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* フッター */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedGear.length === 0 && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={selectedGear.length === 0}
        >
          <Text style={styles.nextButtonText}>次へ</Text>
        </TouchableOpacity>
      </View>

      {/* DatePicker */}
      <DatePicker
        modal
        open={showDatePicker}
        date={selectedStartDate || new Date()}
        mode="date"
        onConfirm={date => {
          setShowDatePicker(false);
          setSelectedStartDate(date);
        }}
        onCancel={() => setShowDatePicker(false)}
        maximumDate={new Date()}
        locale="ja"
        title="スノーボードを始めた年"
      />
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
  dateButton: {
    height: 56,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1e293b',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 16,
  },
  skipButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
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

export default SignupProfileStep2Screen;
