//
//  src/components/timeline/TimelineSkeletonCell.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-17.
//  Updated by KAY.SAKULA on 2025-10-17.
//
//  Description:
//  タイムライン読み込み中に表示されるスケルトンUI
//  - 雪背景に馴染む白半透明
//  - 各要素に薄いシャドウを付け、雪上に積もる質感を演出
//  - アニメーション効果付き
//

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export const TimelineSkeletonCell: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
    // pulseAnimはuseRefで作成されているため依存配列に含める必要なし
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* アイコン */}
        <Animated.View style={[styles.avatar, { opacity }]} />

        <View style={styles.body}>
          {/* ユーザー名 */}
          <View style={styles.header}>
            <Animated.View style={[styles.displayName, { opacity }]} />
            <Animated.View style={[styles.userId, { opacity }]} />
            <Animated.View style={[styles.timestamp, { opacity }]} />
          </View>

          {/* 本文（2行分） */}
          <View style={styles.textContainer}>
            <Animated.View style={[styles.textLine, { opacity }]} />
            <Animated.View
              style={[styles.textLine, styles.textLineShort, { opacity }]}
            />
          </View>

          {/* アクションボタン */}
          <View style={styles.actions}>
            <Animated.View style={[styles.actionButton, { opacity }]} />
            <Animated.View style={[styles.actionButton, { opacity }]} />
            <Animated.View style={[styles.actionButton, { opacity }]} />
            <Animated.View style={[styles.actionButton, { opacity }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
  },
  body: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  displayName: {
    width: 100,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  userId: {
    width: 70,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
  },
  timestamp: {
    width: 50,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
  },
  textContainer: {
    marginBottom: 12,
    gap: 6,
  },
  textLine: {
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  textLineShort: {
    width: '75%',
  },
  actions: {
    flexDirection: 'row',
    gap: 24,
  },
  actionButton: {
    width: 40,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
  },
});

export default TimelineSkeletonCell;
