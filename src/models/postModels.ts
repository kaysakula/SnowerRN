//
//  postModels.ts
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-17.
//  Updated by KAY.SAKULA on 2025-10-17.
//
//  Description:
//  投稿関連のデータモデル型定義
//  SwiftUIのPostModel、TimelinePostModel、PostWithUserModelに相当
//

import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import type { UserModel } from './userModels';

// ===== Post Model =====
// Firestore `posts` コレクションに保存される投稿データ
export interface PostModel {
  id?: string; // FirestoreドキュメントID
  userId: string; // 投稿者のUID
  text: string; // 投稿本文
  mediaUrls?: string[]; // 添付メディアURL（画像/動画）
  mediaTypes?: ('image' | 'video')[]; // 添付メディア種類
  mountainId?: string; // 関連ゲレンデID
  mountainName?: string; // 関連ゲレンデ表示名
  latitude?: number; // 位置情報（緯度）
  longitude?: number; // 位置情報（経度）
  createdAt?: Date; // 投稿日時（Firestore ServerTimestamp）
  likesCount: number; // いいね数
  commentsCount: number; // コメント数
  repostsCount: number; // リポスト数
  viewsCount: number; // 閲覧数
  visibility: 'public' | 'followers'; // 可視性
  isDeleted: boolean; // 削除済みフラグ
  isReported: boolean; // 通報済みフラグ
  tags?: string[]; // ハッシュタグ
}

// ===== Post With User Model =====
// 投稿データ + ユーザー情報をまとめた中間モデル
// postsコレクションに冗長コピーを持たせる方式
export interface PostWithUserModel {
  id: string;

  // ユーザー情報（冗長コピー）
  userId: string;
  username: string;
  imageUrl?: string;

  // 投稿情報
  text: string;
  mediaUrl?: string;
  createdAt: Date;

  // カウント情報
  commentCount: number;
  repostCount: number;
  likeCount: number;
  viewCount: number;
  bookmarkCount: number;
}

// ===== Timeline Post Model =====
// タイムライン表示用の複合モデル
// PostModelとUserModelを結合してアプリ内で使用
export interface TimelinePostModel {
  id: string; // 投稿の識別子
  post: PostModel; // 投稿データ
  user: UserModel; // 投稿者データ

  // 表示用ヘルパープロパティ
  userId: string;
  displayName: string;
  userImageUrl?: string;
  createdAt?: Date;
  text: string;
  mediaUrls: string[];
  mediaTypes: string[];
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  visibility: string;
  isDeleted: boolean;
  isReported: boolean;
  tags: string[];
}

// ===== Comment Model =====
// 投稿へのコメントデータ
export interface CommentModel {
  id?: string; // FirestoreドキュメントID
  postId: string; // 対象投稿ID
  userId: string; // コメント投稿者のUID
  text: string; // コメント本文
  createdAt?: Date; // コメント日時
  likesCount: number; // いいね数
  isDeleted: boolean; // 削除済みフラグ
}

// ===== Timeline Result =====
// タイムライン取得結果
export interface TimelineResult {
  posts: TimelinePostModel[];
  lastDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot;
}

// ===== Firestore用の変換関数 =====

// PostModelをFirestoreドキュメントに変換
export const postModelToFirestore = (post: PostModel): Record<string, any> => {
  return {
    userId: post.userId,
    text: post.text,
    mediaUrls: post.mediaUrls || [],
    mediaTypes: post.mediaTypes || [],
    mountainId: post.mountainId || null,
    mountainName: post.mountainName || null,
    latitude: post.latitude || null,
    longitude: post.longitude || null,
    createdAt: post.createdAt || new Date(),
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    repostsCount: post.repostsCount,
    viewsCount: post.viewsCount,
    visibility: post.visibility,
    isDeleted: post.isDeleted,
    isReported: post.isReported,
    tags: post.tags || [],
  };
};

// FirestoreドキュメントをPostModelに変換
export const firestoreToPostModel = (
  id: string,
  data: FirebaseFirestoreTypes.DocumentData,
): PostModel => {
  return {
    id,
    userId: data.userId,
    text: data.text,
    mediaUrls: data.mediaUrls || [],
    mediaTypes: data.mediaTypes || [],
    mountainId: data.mountainId,
    mountainName: data.mountainName,
    latitude: data.latitude,
    longitude: data.longitude,
    createdAt: data.createdAt?.toDate(),
    likesCount: data.likesCount || 0,
    commentsCount: data.commentsCount || 0,
    repostsCount: data.repostsCount || 0,
    viewsCount: data.viewsCount || 0,
    visibility: data.visibility || 'public',
    isDeleted: data.isDeleted || false,
    isReported: data.isReported || false,
    tags: data.tags || [],
  };
};

// PostModelとUserModelを結合してTimelinePostModelを作成
export const createTimelinePostModel = (
  post: PostModel,
  user: UserModel,
): TimelinePostModel => {
  return {
    id: post.id || '',
    post,
    user,
    userId: user.userId,
    displayName: user.displayName,
    userImageUrl: user.imageUrl,
    createdAt: post.createdAt,
    text: post.text,
    mediaUrls: post.mediaUrls || [],
    mediaTypes: post.mediaTypes || [],
    viewsCount: post.viewsCount,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    repostsCount: post.repostsCount,
    visibility: post.visibility,
    isDeleted: post.isDeleted,
    isReported: post.isReported,
    tags: post.tags || [],
  };
};

// CommentModelをFirestoreドキュメントに変換
export const commentModelToFirestore = (
  comment: CommentModel,
): Record<string, any> => {
  return {
    postId: comment.postId,
    userId: comment.userId,
    text: comment.text,
    createdAt: comment.createdAt || new Date(),
    likesCount: comment.likesCount,
    isDeleted: comment.isDeleted,
  };
};

// FirestoreドキュメントをCommentModelに変換
export const firestoreToCommentModel = (
  id: string,
  data: FirebaseFirestoreTypes.DocumentData,
): CommentModel => {
  return {
    id,
    postId: data.postId,
    userId: data.userId,
    text: data.text,
    createdAt: data.createdAt?.toDate(),
    likesCount: data.likesCount || 0,
    isDeleted: data.isDeleted || false,
  };
};
