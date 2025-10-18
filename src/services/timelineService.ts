//
//  services/timelineService.ts
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-17.
//  Updated by KAY.SAKULA on 2025-10-17.
//
//  Description:
//  Firestoreから投稿を取得するサービス層
//  - ページネーション対応（20件ずつ）
//  - Pull to Refresh対応
//  - 新規投稿のリアルタイム監視
//  - いいね・ブックマーク機能
//

import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {
  PostModel,
  TimelinePostModel,
  TimelineResult,
  firestoreToPostModel,
  createTimelinePostModel,
} from '../models/postModels';
import { firestoreToUserModel } from '../models/userModels';

class TimelineService {
  private postsRef = firestore().collection('posts');
  private usersRef = firestore().collection('users');
  private listener: (() => void) | null = null;

  // MARK: - 投稿取得（ページネーション対応）
  async fetchPosts(
    pageSize: number = 20,
    lastDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  ): Promise<TimelineResult> {
    try {
      let query = this.postsRef.orderBy('createdAt', 'desc').limit(pageSize);

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();

      // PostModelに変換
      const posts: PostModel[] = snapshot.docs.map(doc =>
        firestoreToPostModel(doc.id, doc.data()),
      );

      // Post + User を結合して TimelinePostModel に変換
      const results: TimelinePostModel[] = [];

      for (const post of posts) {
        try {
          const userDoc = await this.usersRef.doc(post.userId).get();
          if (userDoc.exists) {
            const user = firestoreToUserModel(userDoc.id, userDoc.data()!);
            results.push(createTimelinePostModel(post, user));
          }
        } catch (error) {
          console.error('ユーザー取得エラー:', error);
        }
      }

      return {
        posts: results,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
      };
    } catch (error) {
      console.error('投稿取得エラー:', error);
      throw error;
    }
  }

  // MARK: - 新規投稿監視
  observeNewPosts(
    since: Date,
    callback: (posts: TimelinePostModel[]) => void,
  ): () => void {
    if (this.listener) {
      this.listener();
    }

    this.listener = this.postsRef
      .where('createdAt', '>', firestore.Timestamp.fromDate(since))
      .orderBy('createdAt', 'asc')
      .onSnapshot(async snapshot => {
        const results: TimelinePostModel[] = [];

        for (const docSnapshot of snapshot.docs) {
          const post = firestoreToPostModel(docSnapshot.id, docSnapshot.data());

          try {
            const userDoc = await this.usersRef.doc(post.userId).get();
            if (userDoc.exists) {
              const user = firestoreToUserModel(userDoc.id, userDoc.data()!);
              results.push(createTimelinePostModel(post, user));
            }
          } catch (error) {
            console.error('ユーザー取得エラー:', error);
          }
        }

        callback(results);
      });

    return this.listener;
  }

  // 監視解除
  removeListener(): void {
    if (this.listener) {
      this.listener();
      this.listener = null;
    }
  }

  // MARK: - いいね更新
  async toggleLike(
    postId: string,
    userId: string,
    isLiked: boolean,
  ): Promise<void> {
    try {
      const postRef = this.postsRef.doc(postId);
      const userLikeRef = this.usersRef
        .doc(userId)
        .collection('likes')
        .doc(postId);
      const postLikeRef = postRef.collection('likes').doc(userId);

      const batch = firestore().batch();

      if (isLiked) {
        // いいね追加
        batch.set(userLikeRef, {
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
        batch.set(postLikeRef, {
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
        batch.update(postRef, {
          likesCount: firestore.FieldValue.increment(1),
        });
      } else {
        // いいね解除
        batch.delete(userLikeRef);
        batch.delete(postLikeRef);
        batch.update(postRef, {
          likesCount: firestore.FieldValue.increment(-1),
        });
      }

      await batch.commit();
    } catch (error) {
      console.error('いいね更新エラー:', error);
      throw error;
    }
  }

  // MARK: - ブックマーク更新
  async toggleBookmark(
    postId: string,
    userId: string,
    isBookmarked: boolean,
  ): Promise<void> {
    try {
      const bookmarkRef = this.usersRef
        .doc(userId)
        .collection('bookmarks')
        .doc(postId);

      if (isBookmarked) {
        await bookmarkRef.set({
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      } else {
        await bookmarkRef.delete();
      }
    } catch (error) {
      console.error('ブックマーク更新エラー:', error);
      throw error;
    }
  }

  // MARK: - いいね状態取得
  async checkLikeStatus(postId: string, userId: string): Promise<boolean> {
    try {
      const likeDoc = await this.usersRef
        .doc(userId)
        .collection('likes')
        .doc(postId)
        .get();
      return likeDoc.exists;
    } catch (error) {
      console.error('いいね状態取得エラー:', error);
      return false;
    }
  }

  // MARK: - ブックマーク状態取得
  async checkBookmarkStatus(postId: string, userId: string): Promise<boolean> {
    try {
      const bookmarkDoc = await this.usersRef
        .doc(userId)
        .collection('bookmarks')
        .doc(postId)
        .get();
      return bookmarkDoc.exists;
    } catch (error) {
      console.error('ブックマーク状態取得エラー:', error);
      return false;
    }
  }

  // MARK: - 投稿作成
  async createPost(post: PostModel): Promise<string> {
    try {
      const docRef = await this.postsRef.add({
        ...post,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('投稿作成エラー:', error);
      throw error;
    }
  }

  // MARK: - 投稿削除
  async deletePost(postId: string): Promise<void> {
    try {
      await this.postsRef.doc(postId).update({
        isDeleted: true,
      });
    } catch (error) {
      console.error('投稿削除エラー:', error);
      throw error;
    }
  }

  // MARK: - 投稿通報
  async reportPost(
    postId: string,
    userId: string,
    reason: string,
  ): Promise<void> {
    try {
      const batch = firestore().batch();

      // 投稿を通報済みにマーク
      batch.update(this.postsRef.doc(postId), {
        isReported: true,
      });

      // 通報情報を記録
      const reportRef = firestore().collection('reports').doc();
      batch.set(reportRef, {
        postId,
        userId,
        reason,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();
    } catch (error) {
      console.error('投稿通報エラー:', error);
      throw error;
    }
  }

  // MARK: - ユーザーの投稿を取得
  async fetchUserPosts(
    userId: string,
    pageSize: number = 20,
    lastDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  ): Promise<TimelineResult> {
    try {
      let query = this.postsRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(pageSize);

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();

      const posts: PostModel[] = snapshot.docs.map(doc =>
        firestoreToPostModel(doc.id, doc.data()),
      );

      // ユーザー情報を1度だけ取得
      const userDoc = await this.usersRef.doc(userId).get();
      if (!userDoc.exists) {
        return { posts: [], lastDoc: undefined };
      }

      const user = firestoreToUserModel(userDoc.id, userDoc.data()!);
      const results = posts.map(post => createTimelinePostModel(post, user));

      return {
        posts: results,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
      };
    } catch (error) {
      console.error('ユーザー投稿取得エラー:', error);
      throw error;
    }
  }
}

export default new TimelineService();
