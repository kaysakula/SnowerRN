//
//  AuthHeader.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-13.
//  Updated by KAY.SAKULA on 2025-10-13.
//
//  Description:
//  認証画面共通ヘッダーコンポーネント
//  左: 戻るボタン、中央: タイトル、右: SKIP/次へボタン
//  SwiftUIのAuthHeaderComponentに相当
//

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface AuthHeaderProps {
  title: string;
  onBack: () => void;
  onNext?: () => void;
  showSkip?: boolean;
  skipText?: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  onBack,
  onNext,
  showSkip = true,
  skipText = 'SKIP',
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      {showSkip && onNext ? (
        <TouchableOpacity onPress={onNext}>
          <Text style={styles.skipText}>{skipText}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 32,
    color: '#007AFF',
    fontWeight: '300',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  skipText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  placeholder: {
    width: 60,
  },
});
