//
//  ja.ts
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-13.
//  Updated by KAY.SAKULA on 2025-10-18.
//
//  Description:
//  日本語エラーメッセージ定義
//  エラーコードに対応するメッセージを管理
//

import { ErrorCode } from '../constants/errorCodes';

export const ja = {
  // ===== Auth.Email =====
  [ErrorCode.EMAIL_INVALID_FORMAT]:
    '正しい形式のメールアドレスを入力してください',
  [ErrorCode.EMAIL_ALREADY_IN_USE]:
    'このメールアドレスはすでに登録されています',

  // ===== Auth.Password =====
  [ErrorCode.PASSWORD_TOO_SHORT]: 'パスワードは6文字以上で入力してください',
  [ErrorCode.PASSWORD_TOO_LONG]: 'パスワードは32文字以内で入力してください',
  [ErrorCode.PASSWORD_INVALID_CHAR]: '使用できない文字が含まれています',
  [ErrorCode.PASSWORD_MISMATCH]: 'パスワードが一致しません',
  [ErrorCode.PASSWORD_WRONG]: 'パスワードが正しくありません',

  // ===== Auth.UserID =====
  [ErrorCode.USERID_TOO_SHORT]: 'ユーザーIDは6文字以上で入力してください',
  [ErrorCode.USERID_TOO_LONG]: 'ユーザーIDは32文字以内で入力してください',
  [ErrorCode.USERID_INVALID_FORMAT]:
    'ユーザーIDは半角英数字と._-のみ使用できます',
  [ErrorCode.USERID_ALREADY_IN_USE]: 'このユーザーIDはすでに使用されています',

  // ===== Auth.Birthday =====
  [ErrorCode.BIRTHDAY_FUTURE_DATE]: '生年月日に未来の日付は指定できません',
  [ErrorCode.BIRTHDAY_AGE_UNDER_MINIMUM]: '13歳未満の方はご利用いただけません',

  // ===== Profile.BasicInfo =====
  [ErrorCode.DISPLAY_NAME_TOO_SHORT]: '名前は1文字以上で入力してください',
  [ErrorCode.DISPLAY_NAME_TOO_LONG]: '名前は32文字以内で入力してください',
  [ErrorCode.BIO_TOO_LONG]: '自己紹介は200文字以内で入力してください',
  [ErrorCode.LOCATION_TOO_LONG]: '場所は50文字以内で入力してください',
  [ErrorCode.URL_INVALID_FORMAT]: '正しい形式のURLを入力してください',

  // ===== Firebase Auth エラー =====
  [ErrorCode.AUTH_INVALID_EMAIL]: 'メールアドレスの形式が正しくありません',
  [ErrorCode.AUTH_USER_DISABLED]: 'このアカウントは無効化されています',
  [ErrorCode.AUTH_USER_NOT_FOUND]: 'ユーザーが見つかりません',
  [ErrorCode.AUTH_WRONG_PASSWORD]: 'パスワードが正しくありません',
  [ErrorCode.AUTH_EMAIL_ALREADY_IN_USE]:
    'このメールアドレスは既に使用されています',
  [ErrorCode.AUTH_WEAK_PASSWORD]: 'パスワードは6文字以上で設定してください',
  [ErrorCode.AUTH_OPERATION_NOT_ALLOWED]: 'この認証方法は現在利用できません',
  [ErrorCode.AUTH_TOO_MANY_REQUESTS]:
    'リクエストが多すぎます。しばらく待ってから再試行してください',
  [ErrorCode.AUTH_NETWORK_ERROR]: 'ネットワークエラーが発生しました',
  [ErrorCode.AUTH_GOOGLE_ID_TOKEN_ERROR]:
    'Google IDトークンの取得に失敗しました',
  [ErrorCode.AUTH_APPLE_ERROR]: 'Apple認証に失敗しました',

  // ===== システムエラー =====
  [ErrorCode.REQUIRED_FIELD_EMPTY]: '必須項目を入力してください',
  [ErrorCode.VERIFICATION_CODE_INVALID]: '認証コードが正しくありません',
  [ErrorCode.VERIFICATION_CODE_EXPIRED]: '認証コードの有効期限が切れました',
  [ErrorCode.AUTH_GENERAL_ERROR]: '認証エラーが発生しました',
  [ErrorCode.NOT_LOGGED_IN]: 'ログインしていません',
};
