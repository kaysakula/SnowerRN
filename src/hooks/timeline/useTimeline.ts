//
//  hooks/useTimeline.ts
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-17.
//  Updated by KAY.SAKULA on 2025-10-17.
//
//  Description:
//  タイムライン用のカスタムフック
//  - Firestoreから20件ずつ取得（ページネーション）
//  - Pull to Refresh対応
//  - 新規投稿監視で「新しい投稿があります」バナーを制御
//  - 3分以上経過したらリフレッシュ
//

import { useState, useEffect, useCallback, useRef } from 'react';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { TimelinePostModel } from '../models/postModels';
import TimelineService from '../services/timelineService';

interface UseTimelineReturn {
  posts: TimelinePostModel[];
  newPosts: TimelinePostModel[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNewPosts: boolean;
  errorMessage: string | null;
  fetchPosts: () => Promise<void>;
  refresh: () => Promise<void>;
  fetchMorePosts: () => Promise<void>;
  mergeNewPosts: () => void;
  clearError: () => void;
}

const PAGE_SIZE = 20;
const REFRESH_THRESHOLD = 180000; // 3分（ミリ秒）

export const useTimeline = (): UseTimelineReturn => {
  const [posts, setPosts] = useState<TimelinePostModel[]>([]);
  const [newPosts, setNewPosts] = useState<TimelinePostModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const lastDocRef = useRef<
    FirebaseFirestoreTypes.QueryDocumentSnapshot | undefined
  >(undefined);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // 初期読み込み
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await TimelineService.fetchPosts(PAGE_SIZE);
      setPosts(result.posts);
      lastDocRef.current = result.lastDoc;
      setLastUpdated(new Date());

      // 新規投稿監視をセット
      if (result.posts.length > 0 && result.posts[0].createdAt) {
        unsubscribeRef.current = TimelineService.observeNewPosts(
          result.posts[0].createdAt,
          newPostsData => {
            if (newPostsData.length > 0) {
              setNewPosts(prev => [...prev, ...newPostsData]);
              setHasNewPosts(true);
            }
          },
        );
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '投稿の取得に失敗しました',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Pull to Refresh
  const refresh = useCallback(async () => {
    lastDocRef.current = undefined;
    setNewPosts([]);
    setHasNewPosts(false);
    await fetchPosts();
  }, [fetchPosts]);

  // ページネーション
  const fetchMorePosts = useCallback(async () => {
    if (isLoadingMore || !lastDocRef.current) return;

    setIsLoadingMore(true);

    try {
      const result = await TimelineService.fetchPosts(
        PAGE_SIZE,
        lastDocRef.current,
      );
      setPosts(prev => [...prev, ...result.posts]);
      lastDocRef.current = result.lastDoc;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '投稿の取得に失敗しました',
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore]);

  // 新規投稿を反映
  const mergeNewPosts = useCallback(() => {
    setPosts(prev => [...newPosts, ...prev]);
    setNewPosts([]);
    setHasNewPosts(false);
  }, [newPosts]);

  // エラークリア
  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  // 3分以上経過したら自動リフレッシュチェック
  useEffect(() => {
    if (lastUpdated) {
      const now = new Date();
      if (now.getTime() - lastUpdated.getTime() > REFRESH_THRESHOLD) {
        refresh();
      }
    }
  }, [lastUpdated, refresh]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      TimelineService.removeListener();
    };
  }, []);

  return {
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
  };
};

// ===== ユーザー投稿専用フック =====
export const useUserTimeline = (userId: string): UseTimelineReturn => {
  const [posts, setPosts] = useState<TimelinePostModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const lastDocRef = useRef<
    FirebaseFirestoreTypes.QueryDocumentSnapshot | undefined
  >(undefined);

  // 初期読み込み
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await TimelineService.fetchUserPosts(userId, PAGE_SIZE);
      setPosts(result.posts);
      lastDocRef.current = result.lastDoc;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '投稿の取得に失敗しました',
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // リフレッシュ
  const refresh = useCallback(async () => {
    lastDocRef.current = undefined;
    await fetchPosts();
  }, [fetchPosts]);

  // ページネーション
  const fetchMorePosts = useCallback(async () => {
    if (isLoadingMore || !lastDocRef.current) return;

    setIsLoadingMore(true);

    try {
      const result = await TimelineService.fetchUserPosts(
        userId,
        PAGE_SIZE,
        lastDocRef.current,
      );
      setPosts(prev => [...prev, ...result.posts]);
      lastDocRef.current = result.lastDoc;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '投稿の取得に失敗しました',
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [userId, isLoadingMore]);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    posts,
    newPosts: [],
    isLoading,
    isLoadingMore,
    hasNewPosts: false,
    errorMessage,
    fetchPosts,
    refresh,
    fetchMorePosts,
    mergeNewPosts: () => {},
    clearError,
  };
};
