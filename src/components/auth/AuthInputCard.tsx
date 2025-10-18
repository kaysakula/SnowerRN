//
//  AuthInputCard.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-13.
//  Updated by KAY.SAKULA on 2025-10-13.
//
//  Description:
//  認証画面用入力カードコンポーネント
//  項目名 + 入力欄 + エラーメッセージ表示
//  SwiftUIのAuthInputCardComponentに相当
//

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface AuthInputCardProps {
  title: string;
  errorMessage?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const AuthInputCard: React.FC<AuthInputCardProps> = ({
  title,
  errorMessage,
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.inputContainer}>
        <View
          style={[
            styles.inputWrapper,
            errorMessage && styles.inputWrapperError,
          ]}
        >
          {children}
        </View>

        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    gap: 4,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    borderRadius: 8,
    padding: 8,
  },
  inputWrapperError: {
    borderColor: '#FF0000',
    borderWidth: 2,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  errorIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF0000',
  },
});
