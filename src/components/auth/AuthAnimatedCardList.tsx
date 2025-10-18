//
//  AuthAnimatedCardList.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-13.
//  Updated by KAY.SAKULA on 2025-10-13.
//
//  Description:
//  認証画面用アニメーションカードリストコンポーネント
//  カードが左右からスライドインするアニメーション
//  SwiftUIのAuthAnimatedCardListComponentに相当
//

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { AuthInputCard } from './AuthInputCard';

export interface CardItem {
  id: string;
  title: string;
  errorMessage?: string;
  content: React.ReactNode;
}

interface AuthAnimatedCardListProps {
  items: CardItem[];
  direction: -1 | 1; // -1 = 戻る（左から）, 1 = 進む（右から）
}

const ANIMATION_CONFIG = {
  offset: 200,
  delayStep: 100, // ミリ秒
  springConfig: {
    stiffness: 120,
    damping: 15,
  },
};

export const AuthAnimatedCardList: React.FC<AuthAnimatedCardListProps> = ({
  items,
  direction,
}) => {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <AnimatedCard
          key={item.id}
          item={item}
          index={index}
          direction={direction}
        />
      ))}
    </View>
  );
};

interface AnimatedCardProps {
  item: CardItem;
  index: number;
  direction: -1 | 1;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  item,
  index,
  direction,
}) => {
  const offset = useSharedValue(direction * ANIMATION_CONFIG.offset);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // アニメーション実行
    offset.value = withDelay(
      index * ANIMATION_CONFIG.delayStep,
      withSpring(0, ANIMATION_CONFIG.springConfig),
    );
    opacity.value = withDelay(
      index * ANIMATION_CONFIG.delayStep,
      withSpring(1, ANIMATION_CONFIG.springConfig),
    );

    // クリーンアップ（画面離脱時）
    return () => {
      offset.value = direction * ANIMATION_CONFIG.offset;
      opacity.value = 0;
    };
  }, [direction, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.cardContainer, animatedStyle]}>
      <AuthInputCard title={item.title} errorMessage={item.errorMessage}>
        {item.content}
      </AuthInputCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  cardContainer: {
    width: '100%',
  },
});
