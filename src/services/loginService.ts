//
//  services/loginService.ts
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-17.
//  Updated by KAY.SAKULA on 2025-10-17.
//
//  Description:
//  Firebase認証サービス
//  Email/Password、Google、Apple認証を管理
//  IDトークンの取得と管理
//

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import { config } from '../config/firebase';

// 認証結果の型定義
interface AuthResult {
  user: FirebaseAuthTypes.User;
  idToken: string;
  isNewUser: boolean;
}

class LoginService {
  // MARK: - 初期化
  constructor() {
    // Google Sign-In設定
    GoogleSignin.configure({
      webClientId: config.google.webClientId,
    });
  }

  // MARK: - Email/Password認証

  /**
   * メールアドレスとパスワードでログイン
   */
  async loginWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );

      const idToken = await userCredential.user.getIdToken();

      return {
        user: userCredential.user,
        idToken,
        isNewUser: false,
      };
    } catch (error) {
      console.error('メールログインエラー:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * メールアドレスとパスワードで新規登録
   */
  async signupWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );

      const idToken = await userCredential.user.getIdToken();

      return {
        user: userCredential.user,
        idToken,
        isNewUser: true,
      };
    } catch (error) {
      console.error('メール新規登録エラー:', error);
      throw this.handleAuthError(error);
    }
  }

  // MARK: - Google認証

  /**
   * Googleアカウントでログイン
   */
  async loginWithGoogle(): Promise<AuthResult> {
    try {
      // Google Sign-In
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const { idToken: googleIdToken } = await GoogleSignin.signIn();

      // Firebaseクレデンシャル作成
      const googleCredential =
        auth.GoogleAuthProvider.credential(googleIdToken);

      // Firebaseにサインイン
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );

      // IDトークン取得
      const idToken = await userCredential.user.getIdToken();

      return {
        user: userCredential.user,
        idToken,
        isNewUser: userCredential.additionalUserInfo?.isNewUser ?? false,
      };
    } catch (error) {
      console.error('Googleログインエラー:', error);
      throw this.handleAuthError(error);
    }
  }

  // MARK: - Apple認証

  /**
   * Apple IDでログイン（iOS専用）
   */
  async loginWithApple(): Promise<AuthResult> {
    try {
      // Apple認証リクエスト
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // 認証状態確認
      if (!appleAuthRequestResponse.identityToken) {
        throw new Error('Apple認証に失敗しました');
      }

      // Firebaseクレデンシャル作成
      const { identityToken, nonce } = appleAuthRequestResponse;
      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce,
      );

      // Firebaseにサインイン
      const userCredential = await auth().signInWithCredential(appleCredential);

      // IDトークン取得
      const idToken = await userCredential.user.getIdToken();

      return {
        user: userCredential.user,
        idToken,
        isNewUser: userCredential.additionalUserInfo?.isNewUser ?? false,
      };
    } catch (error) {
      console.error('Appleログインエラー:', error);
      throw this.handleAuthError(error);
    }
  }

  // MARK: - ユーティリティ

  /**
   * ログアウト
   */
  async logout(): Promise<void> {
    try {
      // Google Sign-Outも実行
      const isGoogleSignedIn = await GoogleSignin.isSignedIn();
      if (isGoogleSignedIn) {
        await GoogleSignin.signOut();
      }

      await auth().signOut();
    } catch (error) {
      console.error('ログアウトエラー:', error);
      throw error;
    }
  }

  /**
   * 現在のユーザーを取得
   */
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }

  /**
   * 現在のユーザーのIDトークンを取得
   */
  async getCurrentUserToken(forceRefresh: boolean = false): Promise<string> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('ログインしていません');
    }

    return await currentUser.getIdToken(forceRefresh);
  }

  /**
   * パスワードリセットメール送信
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      console.error('パスワードリセットエラー:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * メールアドレス確認メール送信
   */
  async sendEmailVerification(): Promise<void> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('ログインしていません');
    }

    try {
      await currentUser.sendEmailVerification();
    } catch (error) {
      console.error('確認メール送信エラー:', error);
      throw error;
    }
  }

  /**
   * 認証状態の監視
   */
  onAuthStateChanged(
    callback: (user: FirebaseAuthTypes.User | null) => void,
  ): () => void {
    return auth().onAuthStateChanged(callback);
  }

  // MARK: - プライベートメソッド

  /**
   * Firebase認証エラーをユーザー向けメッセージに変換
   */
  private handleAuthError(error: any): Error {
    if (error.code === 'auth/invalid-email') {
      return new Error('メールアドレスの形式が正しくありません');
    }
    if (error.code === 'auth/user-disabled') {
      return new Error('このアカウントは無効化されています');
    }
    if (error.code === 'auth/user-not-found') {
      return new Error('ユーザーが見つかりません');
    }
    if (error.code === 'auth/wrong-password') {
      return new Error('パスワードが正しくありません');
    }
    if (error.code === 'auth/email-already-in-use') {
      return new Error('このメールアドレスは既に使用されています');
    }
    if (error.code === 'auth/weak-password') {
      return new Error('パスワードは6文字以上で設定してください');
    }
    if (error.code === 'auth/operation-not-allowed') {
      return new Error('この認証方法は現在利用できません');
    }
    if (error.code === 'auth/too-many-requests') {
      return new Error(
        'リクエストが多すぎます。しばらく待ってから再試行してください',
      );
    }
    if (error.code === 'auth/network-request-failed') {
      return new Error('ネットワークエラーが発生しました');
    }

    // その他のエラー
    return new Error(error.message || '認証エラーが発生しました');
  }
}

export default new LoginService();
