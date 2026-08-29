//
//  SignupProfileStep5Screen.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-14.
//  Updated by KAY.SAKULA on 2025-10-14.
//
//  Description:
//  プロフィール入力 - Step5: おすすめフォロー
//  おすすめユーザーをロードしてフォロー機能を提供
//  完了後、プロフィール保存とWelcome画面への遷移
//

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../navigation/SignupNavigator';
import { useSignupStore } from '../../stores/signupStore';
import { signupService } from '../../services/signup/signupService';
import type { SignupProfileModel } from '../../models/userModels';
import auth from '@react-native-firebase/auth';

type NavigationProp = StackNavigationProp<AuthStackParamList>;

interface RecommendedUser {
  id: string;
  displayName: string;
  imageUrl?: string;
  followerCount: number;
  bio?: string;
}

const SignupProfileStep5Screen = () => {
  const navigation = useNavigation<NavigationProp>();
  const store = useSignupStore();
  const [recommendedUsers, setRecommendedUsers] = useState<RecommendedUser[]>(
    [],
  );
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  // おすすめユーザーをロード
  useEffect(() => {
    loadRecommendedUsers();
  }, []);

  const loadRecommendedUsers = async () => {
    try {
      const users = await signupService.loadRecommendedUsers();
      setRecommendedUsers(users);
    } catch (error) {
      console.error('Load recommended users error:', error);
      // エラー時はサンプルデータ
      setRecommendedUsers([
        {
          id: 'sample1',
          displayName: '山田太郎',
          followerCount: 1250,
          bio: '週末はゲレンデにいます🏂',
        },
        {
          id: 'sample2',
          displayName: '佐藤花子',
          followerCount: 890,
          bio: 'パウダー大好き❄️',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // フォロー切り替え
  const toggleFollow = (userId: string) => {
    setFollowedIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId],
    );
  };

  // 完了処理
  const handleComplete = async () => {
    setCompleting(true);

    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('ユーザーが見つかりません');
      }

      // プロフィールデータを構築
      const profileData: SignupProfileModel = {
        email: store.email,
        userId: store.userId,
        birthday: store.birthday ? new Date(store.birthday) : new Date(),
        displayName: store.displayName,
        imageUrl: store.profileImageUri,
        bio: store.bio,
        location: store.location,
        urls: store.urls.filter(url => url.trim() !== ''),
        gear: store.gear,
        style: store.style,
        startDate: store.startDate ? new Date(store.startDate) : undefined,
        favoriteMountains: store.favoriteMountains,
        skiItems: store.skiItems.filter(item => item.trim() !== ''),
        boardItems: store.boardItems.filter(item => item.trim() !== ''),
        bindingItems: store.bindingItems.filter(item => item.trim() !== ''),
        bootsItems: store.bootsItems.filter(item => item.trim() !== ''),
        wearItems: store.wearItems.filter(item => item.trim() !== ''),
        pantsItems: store.pantsItems.filter(item => item.trim() !== ''),
        gogglesItems: store.gogglesItems.filter(item => item.trim() !== ''),
        glovesItems: store.glovesItems.filter(item => item.trim() !== ''),
        helmetsItems: store.helmetsItems.filter(item => item.trim() !== ''),
        othersItems: store.othersItems.filter(item => item.trim() !== ''),
        favoriteBrands: store.favoriteBrands,
        purposes: store.purposes,
        followedUserIds: followedIds,
      };

      // Firestoreに保存
      await signupService.saveUserProfile(currentUser.uid, profileData);

      // フォロー処理
      if (followedIds.length > 0) {
        await signupService.followUsers(currentUser.uid, followedIds);
      }

      // ローカルデータクリア
      store.clearSignupData();

      // Welcome画面へ遷移
      navigation.navigate('WelcomeToSnower');
    } catch (error: any) {
      console.error('Complete signup error:', error);
      Alert.alert('エラー', 'プロフィール保存に失敗しました');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>おすすめフォロー</Text>
          <Text style={styles.subtitle}>興味のあるユーザーをフォロー</Text>
        </View>

        {/* ステップインジケーター */}
        <View style={styles.stepIndicator}>
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={[styles.stepDot, styles.stepActive]} />
        </View>

        {/* ユーザーリスト */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>
              おすすめユーザーを読み込み中...
            </Text>
          </View>
        ) : (
          <View style={styles.userList}>
            {recommendedUsers.map((user, index) => (
              <View key={user.id}>
                <View style={styles.userItem}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {user.displayName[0]}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.displayName}</Text>
                    <Text style={styles.userFollowers}>
                      {user.followerCount} フォロワー
                    </Text>
                    {user.bio && (
                      <Text style={styles.userBio} numberOfLines={2}>
                        {user.bio}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.followButton,
                      followedIds.includes(user.id) &&
                        styles.followButtonActive,
                    ]}
                    onPress={() => toggleFollow(user.id)}
                  >
                    <Text
                      style={[
                        styles.followButtonText,
                        followedIds.includes(user.id) &&
                          styles.followButtonTextActive,
                      ]}
                    >
                      {followedIds.includes(user.id)
                        ? 'フォロー中'
                        : 'フォロー'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {index < recommendedUsers.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        )}

        {/* 完了ボタン */}
        {!loading && (
          <TouchableOpacity
            style={[
              styles.completeButton,
              followedIds.length === 0 && styles.completeButtonSecondary,
              completing && styles.buttonDisabled,
            ]}
            onPress={handleComplete}
            disabled={completing}
          >
            {completing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.completeButtonIcon}>
                  {followedIds.length > 0 ? '✓' : '→'}
                </Text>
                <Text style={styles.completeButtonText}>
                  {followedIds.length > 0 ? '完了' : 'スキップして完了'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
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
    paddingBottom: 40,
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748b',
  },
  userList: {
    marginBottom: 24,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  userFollowers: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  followButtonActive: {
    backgroundColor: '#f1f5f9',
    borderColor: '#94a3b8',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  followButtonTextActive: {
    color: '#64748b',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  completeButton: {
    flexDirection: 'row',
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
    gap: 8,
  },
  completeButtonSecondary: {
    backgroundColor: '#94a3b8',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  completeButtonIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignupProfileStep5Screen;
