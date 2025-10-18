//
//  SignupProfileStep3Screen.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-14.
//  Updated by KAY.SAKULA on 2025-10-14.
//
//  Description:
//  プロフィール入力 - Step3: ギア詳細
//  選択されたギアに応じて動的にフィールドを表示
//  スキー板、ボード、バインディング、ブーツなど
//

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../navigation/SignupNavigator';
import { useSignupStore } from '../../stores/signupStore';

type NavigationProp = StackNavigationProp<AuthStackParamList>;

const SignupProfileStep3Screen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    gear,
    skiItems,
    boardItems,
    bindingItems,
    bootsItems,
    wearItems,
    gogglesItems,
    glovesItems,
    setSkiItems,
    setBoardItems,
    setBindingItems,
    setBootsItems,
    setWearItems,
    setGogglesItems,
    setGlovesItems,
  } = useSignupStore();

  const [localSkiItems, setLocalSkiItems] = useState(
    skiItems.length > 0 && skiItems[0] !== '' ? skiItems : [''],
  );
  const [localBoardItems, setLocalBoardItems] = useState(
    boardItems.length > 0 && boardItems[0] !== '' ? boardItems : [''],
  );
  const [localBindingItems, setLocalBindingItems] = useState(
    bindingItems.length > 0 && bindingItems[0] !== '' ? bindingItems : [''],
  );
  const [localBootsItems, setLocalBootsItems] = useState(
    bootsItems.length > 0 && bootsItems[0] !== '' ? bootsItems : [''],
  );
  const [localWearItems, setLocalWearItems] = useState(
    wearItems.length > 0 && wearItems[0] !== '' ? wearItems : [''],
  );
  const [localGogglesItems, setLocalGogglesItems] = useState(
    gogglesItems.length > 0 && gogglesItems[0] !== '' ? gogglesItems : [''],
  );
  const [localGlovesItems, setLocalGlovesItems] = useState(
    glovesItems.length > 0 && glovesItems[0] !== '' ? glovesItems : [''],
  );

  const hasSkiGear = gear.includes('スキー');
  const hasSnowboardGear = gear.includes('スノーボード');

  // 次へ
  const handleNext = () => {
    // Zustandに保存
    setSkiItems(localSkiItems.filter(item => item.trim() !== ''));
    setBoardItems(localBoardItems.filter(item => item.trim() !== ''));
    setBindingItems(localBindingItems.filter(item => item.trim() !== ''));
    setBootsItems(localBootsItems.filter(item => item.trim() !== ''));
    setWearItems(localWearItems.filter(item => item.trim() !== ''));
    setGogglesItems(localGogglesItems.filter(item => item.trim() != ''));
    setGlovesItems(localGlovesItems.filter(item => item.trim() !== ''));

    // 次の画面へ
    navigation.navigate('SignupProfileStep4');
  };

  // SKIPボタン
  const handleSkip = () => {
    navigation.navigate('SignupProfileStep4');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>ギア詳細</Text>
          <Text style={styles.subtitle}>使用しているギアを教えてください</Text>
        </View>

        {/* ステップインジケーター */}
        <View style={styles.stepIndicator}>
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={[styles.stepDot, styles.stepActive]} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
        </View>

        {/* フォーム */}
        <View style={styles.form}>
          {/* スキー板（スキーを選択した場合のみ） */}
          {hasSkiGear && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>スキー板</Text>
              <TextInput
                style={styles.input}
                placeholder="使用スキー板のモデル"
                value={localSkiItems[0]}
                onChangeText={text => setLocalSkiItems([text])}
              />
            </View>
          )}

          {/* ボード（スノーボードを選択した場合のみ） */}
          {hasSnowboardGear && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>スノーボード</Text>
                <TextInput
                  style={styles.input}
                  placeholder="使用ボードのモデル"
                  value={localBoardItems[0]}
                  onChangeText={text => setLocalBoardItems([text])}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>バインディング</Text>
                <TextInput
                  style={styles.input}
                  placeholder="使用バインディングのモデル"
                  value={localBindingItems[0]}
                  onChangeText={text => setLocalBindingItems([text])}
                />
              </View>
            </>
          )}

          {/* 共通フィールド */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ブーツ</Text>
            <TextInput
              style={styles.input}
              placeholder="使用ブーツのモデル"
              value={localBootsItems[0]}
              onChangeText={text => setLocalBootsItems([text])}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ウェア(任意)</Text>
            <TextInput
              style={styles.input}
              placeholder="ジャケットのブランド・モデル"
              value={localWearItems[0]}
              onChangeText={text => setLocalWearItems([text])}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>グローブ(任意)</Text>
            <TextInput
              style={styles.input}
              placeholder="使用グローブ"
              value={localGlovesItems[0]}
              onChangeText={text => setLocalGlovesItems([text])}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ゴーグル(任意)</Text>
            <TextInput
              style={styles.input}
              placeholder="使用ゴーグル"
              value={localGogglesItems[0]}
              onChangeText={text => setLocalGogglesItems([text])}
            />
          </View>
        </View>

        {/* SKIPボタン */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>SKIP</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* フッター */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
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
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 4,
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
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignupProfileStep3Screen;
