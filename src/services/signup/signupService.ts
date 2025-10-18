//
//  signupService.ts
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-13.
//  Updated by KAY.SAKULA on 2025-10-13.
//
//  Description:
//  サインアップ全体を管理するサービス
//  すべてのDB操作を集約し、ViewModelはこのServiceを経由してのみDBアクセス
//  SwiftUIのSignupService.swiftをReact Native版に移植
//

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import type {
  SignupProfileModel,
  RecommendedUserModel,
} from '../../models/userModels';
import {
  userModelToFirestore,
  signupProfileToUserModel,
} from '../../models/userModels';

export class SignupService {
  private static instance: SignupService;
  private db = firestore();

  private constructor() {}

  static getInstance(): SignupService {
    if (!SignupService.instance) {
      SignupService.instance = new SignupService();
    }
    return SignupService.instance;
  }

  // MARK: - Email関連
  async sendVerificationCode(email: string): Promise<string> {
    // 6桁の認証コードを生成
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // TODO: 実際のメール送信サービス実装（Firebase Cloud Functions等）
    console.log(`📧 Verification code sent to ${email}: ${code}`);
    console.log('⚠️ 開発モード: 実際にはメールは送信されていません');

    return code;
  }

  async checkEmailDuplicate(email: string): Promise<boolean> {
    const snapshot = await this.db
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    return !snapshot.empty;
  }

  // MARK: - Account関連
  async checkUserIdDuplicate(userId: string): Promise<boolean> {
    const snapshot = await this.db
      .collection('users')
      .where('userId', '==', userId)
      .limit(1)
      .get();
    return !snapshot.empty;
  }

  async createFirebaseAccount(
    email: string,
    password: string,
  ): Promise<string> {
    const result = await auth().createUserWithEmailAndPassword(email, password);
    return result.user.uid;
  }

  // 仮ユーザー登録（userIdを予約し、Profile入力を待つ状態）
  async saveIncompleteUser(
    uid: string,
    email: string,
    userId: string,
    birthday: Date,
  ): Promise<void> {
    const userDoc = this.db.collection('users').doc(uid);

    const incompleteData = {
      email,
      userId,
      birthday: firestore.Timestamp.fromDate(birthday),
      status: 'incomplete',
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    await userDoc.set(incompleteData);
  }

  // 未完了ユーザーのステータス確認
  async checkIncompleteStatus(
    uid: string,
  ): Promise<{ isIncomplete: boolean; currentStep: number }> {
    const snapshot = await this.db.collection('users').doc(uid).get();

    const data = snapshot.data();
    if (!data || data.status !== 'incomplete') {
      return { isIncomplete: false, currentStep: 0 };
    }

    // AsyncStorageから保存されたSTEP情報を取得（実装は後述）
    // const savedStep = await AsyncStorage.getItem(`incompleteStep_${uid}`);
    return { isIncomplete: true, currentStep: 0 };
  }

  // MARK: - Profile関連
  async saveUserProfile(
    uid: string,
    profileData: SignupProfileModel,
  ): Promise<void> {
    const userDoc = this.db.collection('users').doc(uid);

    // SignupProfileModelをUserModelに変換してからFirestore形式に変換
    const userModel = signupProfileToUserModel(uid, profileData);
    const userData = userModelToFirestore(userModel);

    await userDoc.set(userData);
  }

  async loadRecommendedUsers(): Promise<RecommendedUserModel[]> {
    try {
      const snapshot = await this.db
        .collection('users')
        .where('isVerified', '==', true)
        .orderBy('followerCount', 'desc')
        .limit(5)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          displayName: data.displayName || '',
          imageUrl: data.imageUrl,
          followerCount: data.followerCount || 0,
          bio: data.bio,
        };
      });
    } catch (error) {
      console.error('Error loading recommended users:', error);
      // エラー時はサンプルデータを返す（開発用）
      return this.getSampleRecommendedUsers();
    }
  }

  async followUsers(userId: string, targetUserIds: string[]): Promise<void> {
    const batch = this.db.batch();

    for (const targetUserId of targetUserIds) {
      // フォロー関係を作成
      const followRef = this.db.collection('follows').doc();
      batch.set(followRef, {
        followerId: userId,
        followingId: targetUserId,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // ターゲットユーザーのフォロワー数を増加
      const targetUserRef = this.db.collection('users').doc(targetUserId);
      batch.update(targetUserRef, {
        followerCount: firestore.FieldValue.increment(1),
      });
    }

    await batch.commit();
  }

  // MARK: - サンプルデータ（開発用）
  private getSampleRecommendedUsers(): RecommendedUserModel[] {
    return [
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
      {
        id: 'sample3',
        displayName: '田中次郎',
        followerCount: 2100,
        bio: 'グラトリ練習中🤸‍♂️',
      },
    ];
  }
}

// シングルトンインスタンスのエクスポート
export const signupService = SignupService.getInstance();
