//
//  components/TimelinePostCell.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-17.
//  Updated by KAY.SAKULA on 2025-10-17.
//
//  Description:
//  タイムライン1件分のセルコンポーネント
//  - TimelinePostModelを受け取り、ユーザ情報＋投稿本文＋メディア＋アクション群を表示
//  - 「いいね」「ブックマーク」操作はTimelineService経由でFirestoreに反映
//

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
// オプション1: react-native-vector-icons
import Icon from 'react-native-vector-icons/Feather';

// オプション2: @expo/vector-icons（Expoプロジェクトの場合）
// import { Feather as Icon } from '@expo/vector-icons';
import { TimelinePostModel } from '../../models/postModels';
import TimelineService from '../../services/timeline/timelineService';
import { formatTimeAgo, formatCount } from '../../utils/formatterUtils';

interface TimelinePostCellProps {
  post: TimelinePostModel;
  currentUserId: string;
  onPostClick?: () => void;
  onUserClick?: () => void;
}

export const TimelinePostCell: React.FC<TimelinePostCellProps> = ({
  post,
  currentUserId,
  onPostClick,
  onUserClick,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [localLikesCount, setLocalLikesCount] = useState(post.likesCount);
  const toastOpacity = new Animated.Value(0);

  // 初期状態を取得
  useEffect(() => {
    const fetchInitialState = async () => {
      const [liked, bookmarked] = await Promise.all([
        TimelineService.checkLikeStatus(post.id, currentUserId),
        TimelineService.checkBookmarkStatus(post.id, currentUserId),
      ]);
      setIsLiked(liked);
      setIsBookmarked(bookmarked);
    };
    fetchInitialState();
  }, [post.id, currentUserId]);

  // いいね切り替え
  const handleToggleLike = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLocalLikesCount(prev => (newLikedState ? prev + 1 : prev - 1));

    try {
      await TimelineService.toggleLike(post.id, currentUserId, newLikedState);
    } catch (error) {
      console.error('いいね更新エラー:', error);
      // ロールバック
      setIsLiked(!newLikedState);
      setLocalLikesCount(prev => (newLikedState ? prev - 1 : prev + 1));
    }
  };

  // ブックマーク切り替え
  const handleToggleBookmark = async () => {
    const newBookmarkedState = !isBookmarked;
    setIsBookmarked(newBookmarkedState);

    const message = newBookmarkedState
      ? 'ブックマークに追加しました'
      : 'ブックマークを解除しました';
    showToastMessage(message);

    try {
      await TimelineService.toggleBookmark(
        post.id,
        currentUserId,
        newBookmarkedState,
      );
    } catch (error) {
      console.error('ブックマーク更新エラー:', error);
      setIsBookmarked(!newBookmarkedState);
    }
  };

  // トースト表示
  const showToastMessage = (message: string) => {
    setShowToast(message);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1300),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setShowToast(null));
  };

  // アクションボタン
  const ActionButton = ({
    iconName,
    count,
    active = false,
    activeColor = '#EF4444',
    onPress,
  }: {
    iconName: string;
    count: number;
    active?: boolean;
    activeColor?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.actionButton}
      activeOpacity={0.7}
    >
      <Icon
        name={iconName}
        size={18}
        color={active ? activeColor : '#6B7280'}
      />
      <Text style={styles.actionCount}>{formatCount(count)}</Text>
    </TouchableOpacity>
  );

  return (
    <TouchableOpacity
      onPress={onPostClick}
      activeOpacity={0.95}
      style={styles.container}
    >
      {/* ヘッダー */}
      <View style={styles.header}>
        {/* アイコン */}
        <TouchableOpacity onPress={onUserClick} activeOpacity={0.7}>
          {post.userImageUrl ? (
            <Image source={{ uri: post.userImageUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Icon name="user" size={20} color="#9CA3AF" />
            </View>
          )}
        </TouchableOpacity>

        {/* ユーザー情報 */}
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.displayName} numberOfLines={1}>
              {post.displayName}
            </Text>
            <Text style={styles.userId} numberOfLines={1}>
              @{post.userId}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimeAgo(post.createdAt)}
            </Text>
            <TouchableOpacity style={styles.moreButton}>
              <Icon name="more-vertical" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* 本文 */}
          {post.text && <Text style={styles.text}>{post.text}</Text>}

          {/* メディア */}
          {post.mediaUrls.length > 0 && (
            <View style={styles.mediaContainer}>
              {post.mediaUrls.map((url, index) => (
                <Image
                  key={index}
                  source={{ uri: url }}
                  style={styles.media}
                  resizeMode="cover"
                />
              ))}
            </View>
          )}

          {/* アクション群 */}
          <View style={styles.actions}>
            <ActionButton
              iconName="message-circle"
              count={post.commentsCount}
              onPress={() => {}}
            />
            <ActionButton
              iconName="repeat"
              count={post.repostsCount}
              onPress={() => {}}
            />
            <ActionButton
              iconName="heart"
              count={localLikesCount}
              active={isLiked}
              activeColor="#EF4444"
              onPress={handleToggleLike}
            />
            <View style={styles.actionButton}>
              <Icon name="eye" size={18} color="#6B7280" />
              <Text style={styles.actionCount}>
                {formatCount(post.viewsCount)}
              </Text>
            </View>
            <TouchableOpacity onPress={handleToggleBookmark}>
              <Icon
                name="bookmark"
                size={18}
                color={isBookmarked ? '#F59E0B' : '#6B7280'}
                fill={isBookmarked ? '#F59E0B' : 'none'}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="share" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* トースト */}
      {showToast && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{showToast}</Text>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  displayName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  userId: {
    fontSize: 14,
    color: '#6B7280',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  moreButton: {
    marginLeft: 'auto',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1F2937',
    marginBottom: 12,
  },
  mediaContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  media: {
    width: '100%',
    height: 200,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  toast: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: [{ translateX: -100 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    width: 200,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default TimelinePostCell;
