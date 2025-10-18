//
//  ja.ts
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-13.
//  Updated by KAY.SAKULA on 2025-10-13.
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

  // ===== システムエラー =====
  [ErrorCode.REQUIRED_FIELD_EMPTY]: '必須項目を入力してください',
  [ErrorCode.PASSWORD_MISMATCH]: 'パスワードが一致しません',
  [ErrorCode.VERIFICATION_CODE_INVALID]: '認証コードが正しくありません',
  [ErrorCode.VERIFICATION_CODE_EXPIRED]: '認証コードの有効期限が切れました',
};
