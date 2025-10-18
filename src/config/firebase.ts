//
//  src/config/firebase/firebase.ts
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-17.
//  Updated by KAY.SAKULA on 2025-10-17.
//
//  Description:
//  Firebase設定とGoogle Sign-In設定
//  環境ごとに設定を切り替え可能
//

// Firebase設定
// 本番環境では環境変数管理サービス（Firebase Remote Config等）の使用を推奨
export const firebaseConfig = {
  // iOS: GoogleService-Info.plist
  // Android: google-services.json
  // React Native Firebaseは自動的に設定ファイルを読み込むため、
  // ここでの設定は不要です
};

// Google Sign-In設定
export const googleSignInConfig = {
  // Firebase Console > Authentication > Sign-in method > Google
  // から「ウェブ クライアント ID」を取得
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',

  // iOS: 不要（GoogleService-Info.plistから自動取得）
  // Android: 不要（google-services.jsonから自動取得）
};

// 開発環境と本番環境の切り替え
const isDevelopment = __DEV__;

export const config = {
  google: {
    webClientId: isDevelopment
      ? 'YOUR_DEV_WEB_CLIENT_ID.apps.googleusercontent.com'
      : 'YOUR_PROD_WEB_CLIENT_ID.apps.googleusercontent.com',
  },
};
