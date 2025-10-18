//
//  WelcomeToSnowerScreen.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-14.
//  Updated by KAY.SAKULA on 2025-10-14.
//
//  Description:
//  サインアップ完了画面
//  登録完了メッセージとアニメーション
//  画面タップでMainTabViewへ遷移
//

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';

const WelcomeToSnowerScreen = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // アニメーション開始
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => {
    // TODO: MainTabViewへ遷移
    console.log('Continue to main app');
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={handleContinue}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* アイコン */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>⛷️</Text>
          </View>
        </View>

        {/* メッセージ */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>Snowerへようこそ！</Text>
          <Text style={styles.subtitle}>アカウントの作成が完了しました</Text>
          <Text style={styles.description}>
            スノーボードライフを楽しみましょう！
          </Text>
        </View>

        {/* 特徴 */}
        <View style={styles.featuresContainer}>
          <FeatureItem icon="👥" text="仲間と繋がる" />
          <FeatureItem icon="📰" text="最新情報をチェック" />
          <FeatureItem icon="🏔️" text="ゲレンデを発見" />
        </View>

        {/* タップ案内 */}
        <View style={styles.tapHintContainer}>
          <Text style={styles.tapIcon}>👆</Text>
          <Text style={styles.tapText}>画面をタップして始める</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const FeatureItem = ({ icon, text }: { icon: string; text: string }) => {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 60,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 60,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 16,
    color: '#64748b',
  },
  tapHintContainer: {
    alignItems: 'center',
    gap: 12,
  },
  tapIcon: {
    fontSize: 32,
  },
  tapText: {
    fontSize: 14,
    color: '#94a3b8',
  },
});

export default WelcomeToSnowerScreen;
