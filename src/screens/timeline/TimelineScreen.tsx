//
//  src/screens/timeline/TimelineScreen.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-17.
//  Updated by KAY.SAKULA on 2025-10-17.
//
//  Description:
//  タイムライン画面
//  - FlatListで縦スクロール（最適化済み）
//  - Pull to Refresh対応
//  - 新規投稿があれば「新しい投稿があります」バナーを表示
//  - スケルトンUIで読み込み中を表示
//

import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTimeline } from '../../hooks/timeline/useTimeline';
import TimelinePostCell from '../../components/timeline/TimelinePostCell';
import TimelineSkeletonCell from '../../components/timeline/TimelineSkeletonCell';
import { TimelinePostModel } from '../../models/postModels';

interface TimelineScreenProps {
  currentUserId: string;
  onPostClick?: (postId: string) => void;
  onUserClick?: (userId: string) => void;
}

export const TimelineScreen: React.FC<TimelineScreenProps> = ({
  currentUserId,
  onPostClick,
  onUserClick,
}) => {
  const {
    posts,
    newPosts,
    isLoading,
    isLoadingMore,
    hasNewPosts,
    errorMessage,
    fetchPosts,
    refresh,
    fetchMorePosts,
    mergeNewPosts,
    clearError,
  } = useTimeline();

  const flatListRef = useRef<FlatList>(null);

  // 初期読み込み
  useEffect(() => {
    fetchPosts();
  }, []);

  // 新規投稿バナークリック
  const handleNewPostsBannerClick = useCallback(() => {
    mergeNewPosts();
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [mergeNewPosts]);

  // リフレッシュ
  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  // リストアイテムレンダリング
  const renderItem = useCallback(
    ({ item }: { item: TimelinePostModel }) => (
      <TimelinePostCell
        post={item}
        currentUserId={currentUserId}
        onPostClick={() => onPostClick?.(item.id)}
        onUserClick={() => onUserClick?.(item.userId)}
      />
    ),
    [currentUserId, onPostClick, onUserClick],
  );

  // リストヘッダー（新規投稿バナー）
  const renderHeader = useCallback(() => {
    if (!hasNewPosts) return null;

    return (
      <TouchableOpacity
        onPress={handleNewPostsBannerClick}
        style={styles.newPostsBanner}
        activeOpacity={0.8}
      >
        <Icon name="snowflake" size={16} color="#3B82F6" />
        <Text style={styles.newPostsText}>
          新しい投稿があります ({newPosts.length}件)
        </Text>
      </TouchableOpacity>
    );
  }, [hasNewPosts, newPosts.length, handleNewPostsBannerClick]);

  // リストフッター（ローディング）
  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }, [isLoadingMore]);

  // 空リスト表示
  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.skeletonContainer}>
          {[...Array(5)].map((_, i) => (
            <TimelineSkeletonCell key={i} />
          ))}
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon name="snowflake" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>まだ投稿がありません</Text>
      </View>
    );
  }, [isLoading]);

  // キーエクストラクタ
  const keyExtractor = useCallback((item: TimelinePostModel) => item.id, []);

  // リスト終端到達時
  const handleEndReached = useCallback(() => {
    if (!isLoadingMore && posts.length > 0) {
      fetchMorePosts();
    }
  }, [isLoadingMore, posts.length, fetchMorePosts]);

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="snowflake" size={24} color="#3B82F6" />
          <Text style={styles.headerTitle}>Snower</Text>
        </View>
        <TouchableOpacity
          onPress={handleRefresh}
          style={styles.refreshButton}
          disabled={isLoading}
        >
          <Icon
            name="refresh-cw"
            size={20}
            color={isLoading ? '#9CA3AF' : '#1F2937'}
          />
        </TouchableOpacity>
      </View>

      {/* エラーメッセージ */}
      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={clearError}>
            <Icon name="x" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      )}

      {/* タイムラインリスト */}
      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && posts.length > 0}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  refreshButton: {
    padding: 8,
  },
  newPostsBanner: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  newPostsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  skeletonContainer: {
    paddingVertical: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

export default TimelineScreen;
