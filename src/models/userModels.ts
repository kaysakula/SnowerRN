//
//  userModels.ts
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-13.
//  Updated by KAY.SAKULA on 2025-10-13.
//
//  Description:
//  アプリ全体で使用するデータモデルの型定義
//  SwiftUIのUserModel、SignupProfileModel、SignupRecommendedUserModelに相当
//

import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// ===== User Model =====
export interface UserModel {
  id: string;
  email: string;
  userId: string;
  birthday: Date;
  displayName: string;
  imageUrl?: string;
  headerUrl?: string;
  bio: string;
  location: string;
  urls: string[];
  purposes: string[];
  planType: 'free' | 'premium';
  period?: string;
  subscriptionStart?: Date;
  subscriptionEnd?: Date;
  gear: string[];
  style: string[];
  startDate?: Date;
  favoriteMountains: string[];
  favoriteBrands: string[];
  createdAt: Date;
  updatedAt: Date;

  // ギア詳細
  ski?: string;
  board?: string;
  binding?: string;
  boots?: string;
  wear?: string;
  pants?: string;
  goggles?: string;
  gloves?: string;
  helmets?: string;
  others?: string;

  // SNS情報
  followerCount?: number;
  followingCount?: number;
  isPrivate?: boolean;
  isVerified?: boolean;
  status?: 'active' | 'inactive' | 'incomplete';
}

// ===== Signup Profile Model =====
// サインアップ時のプロフィールデータ転送用モデル
export interface SignupProfileModel {
  // Account情報
  email: string;
  userId: string;
  birthday: Date;

  // Profile情報 - Step1
  displayName: string;
  imageUrl?: string;
  bio: string;
  location: string;
  urls: string[];

  // Profile情報 - Step2
  gear: string[];
  style: string[];
  startDate?: Date;
  favoriteMountains: string[];

  // Profile情報 - Step3（ギア詳細）
  skiItems: string[];
  boardItems: string[];
  bindingItems: string[];
  bootsItems: string[];
  wearItems: string[];
  pantsItems: string[];
  gogglesItems: string[];
  glovesItems: string[];
  helmetsItems: string[];
  favoriteBrands: string[];
  othersItems: string[];

  // Profile情報 - Step4
  purposes: string[];

  // Profile情報 - Step5
  followedUserIds: string[];
}

// ===== Recommended User Model =====
// サインアップ時のおすすめユーザー表示用
export interface RecommendedUserModel {
  id: string;
  displayName: string;
  imageUrl?: string;
  followerCount: number;
  bio?: string;
}

// ===== Firestore用の変換関数 =====

// UserModelをFirestoreドキュメントに変換
export const userModelToFirestore = (user: UserModel): Record<string, any> => {
  return {
    email: user.email,
    userId: user.userId,
    birthday: user.birthday,
    displayName: user.displayName,
    imageUrl: user.imageUrl || '',
    headerUrl: user.headerUrl || '',
    bio: user.bio,
    location: user.location,
    urls: user.urls,
    purposes: user.purposes,
    planType: user.planType,
    period: user.period || null,
    subscriptionStart: user.subscriptionStart || null,
    subscriptionEnd: user.subscriptionEnd || null,
    gear: user.gear,
    style: user.style,
    startDate: user.startDate || null,
    favoriteMountains: user.favoriteMountains,
    favoriteBrands: user.favoriteBrands,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    ski: user.ski || null,
    board: user.board || null,
    binding: user.binding || null,
    boots: user.boots || null,
    wear: user.wear || null,
    pants: user.pants || null,
    goggles: user.goggles || null,
    gloves: user.gloves || null,
    helmets: user.helmets || null,
    others: user.others || null,
    followerCount: user.followerCount || 0,
    followingCount: user.followingCount || 0,
    isPrivate: user.isPrivate || false,
    isVerified: user.isVerified || false,
    status: user.status || 'active',
  };
};

// FirestoreドキュメントをUserModelに変換
export const firestoreToUserModel = (
  id: string,
  data: FirebaseFirestoreTypes.DocumentData,
): UserModel => {
  return {
    id,
    email: data.email,
    userId: data.userId,
    birthday: data.birthday?.toDate() || new Date(),
    displayName: data.displayName,
    imageUrl: data.imageUrl,
    headerUrl: data.headerUrl,
    bio: data.bio || '',
    location: data.location || '',
    urls: data.urls || [],
    purposes: data.purposes || [],
    planType: data.planType || 'free',
    period: data.period,
    subscriptionStart: data.subscriptionStart?.toDate(),
    subscriptionEnd: data.subscriptionEnd?.toDate(),
    gear: data.gear || [],
    style: data.style || [],
    startDate: data.startDate?.toDate(),
    favoriteMountains: data.favoriteMountains || [],
    favoriteBrands: data.favoriteBrands || [],
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    ski: data.ski,
    board: data.board,
    binding: data.binding,
    boots: data.boots,
    wear: data.wear,
    pants: data.pants,
    goggles: data.goggles,
    gloves: data.gloves,
    helmets: data.helmets,
    others: data.others,
    followerCount: data.followerCount || 0,
    followingCount: data.followingCount || 0,
    isPrivate: data.isPrivate || false,
    isVerified: data.isVerified || false,
    status: data.status || 'active',
  };
};

// SignupProfileModelをUserModelに変換
export const signupProfileToUserModel = (
  uid: string,
  profileData: SignupProfileModel,
): UserModel => {
  return {
    id: uid,
    email: profileData.email,
    userId: profileData.userId,
    birthday: profileData.birthday,
    displayName: profileData.displayName,
    imageUrl: profileData.imageUrl,
    bio: profileData.bio,
    location: profileData.location,
    urls: profileData.urls,
    purposes: profileData.purposes,
    planType: 'free',
    gear: profileData.gear,
    style: profileData.style,
    startDate: profileData.startDate,
    favoriteMountains: profileData.favoriteMountains,
    favoriteBrands: profileData.favoriteBrands,
    createdAt: new Date(),
    updatedAt: new Date(),
    ski: profileData.skiItems.join(', ') || undefined,
    board: profileData.boardItems.join(', ') || undefined,
    binding: profileData.bindingItems.join(', ') || undefined,
    boots: profileData.bootsItems.join(', ') || undefined,
    wear: profileData.wearItems.join(', ') || undefined,
    pants: profileData.pantsItems.join(', ') || undefined,
    goggles: profileData.gogglesItems.join(', ') || undefined,
    gloves: profileData.glovesItems.join(', ') || undefined,
    helmets: profileData.helmetsItems.join(', ') || undefined,
    others: profileData.othersItems.join(', ') || undefined,
    followerCount: 0,
    followingCount: profileData.followedUserIds.length,
    isPrivate: false,
    isVerified: false,
    status: 'active',
  };
};
