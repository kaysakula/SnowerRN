//
//  MainTabNavigator.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-17.
//  Updated by KAY.SAKULA on 2025-10-18.
//
//  Description:
//  メインタブナビゲーター
//  ホーム/検索/投稿/通知/プロフィールのタブナビゲーション
//

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../contexts/AuthContext';

// タブ画面のプレースホルダー（後で実装）
const TimelineScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>タイムライン</Text>
  </View>
);

const SearchScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>検索</Text>
  </View>
);

const PostScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>投稿</Text>
  </View>
);

const NotificationsScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>通知</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>プロフィール</Text>
  </View>
);

export const MainTabNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { logout } = useAuth();

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const tabs = [
    { id: 'home', icon: 'home', label: 'ホーム' },
    { id: 'search', icon: 'search', label: '検索' },
    { id: 'post', icon: 'plus-circle', label: '投稿' },
    { id: 'notifications', icon: 'bell', label: '通知' },
    { id: 'profile', icon: 'user', label: 'プロフィール' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEmoji}>⛷️</Text>
          <Text style={styles.headerTitle}>Snower</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>ログアウト</Text>
        </TouchableOpacity>
      </View>

      {/* メインコンテンツ */}
      <View style={styles.content}>
        {activeTab === 'home' && <TimelineScreen />}
        {activeTab === 'search' && <SearchScreen />}
        {activeTab === 'post' && <PostScreen />}
        {activeTab === 'notifications' && <NotificationsScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </View>

      {/* タブバー */}
      <View style={styles.tabBar}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => setActiveTab(tab.id)}
            >
              <Icon
                name={tab.icon}
                size={24}
                color={isActive ? '#3B82F6' : '#6B7280'}
              />
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerEmoji: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 0 : 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});
