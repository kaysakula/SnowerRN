//
//  en.ts
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-13.
//  Updated by KAY.SAKULA on 2025-10-13.
//
//  Description:
//  英語エラーメッセージ定義
//  将来の多言語対応用（現在は日本語のみ使用）
//

import { ErrorCode } from '../constants/errorCodes';

export const en = {
  // ===== Auth.Email =====
  [ErrorCode.EMAIL_INVALID_FORMAT]: 'Please enter a valid email address',
  [ErrorCode.EMAIL_ALREADY_IN_USE]: 'This email address is already registered',

  // ===== Auth.Password =====
  [ErrorCode.PASSWORD_TOO_SHORT]: 'Password must be at least 6 characters',
  [ErrorCode.PASSWORD_TOO_LONG]: 'Password must be 32 characters or less',
  [ErrorCode.PASSWORD_INVALID_CHAR]: 'Password contains invalid characters',

  // ===== Auth.UserID =====
  [ErrorCode.USERID_TOO_SHORT]: 'User ID must be at least 6 characters',
  [ErrorCode.USERID_TOO_LONG]: 'User ID must be 32 characters or less',
  [ErrorCode.USERID_INVALID_FORMAT]:
    'User ID can only contain letters, numbers, . _ -',
  [ErrorCode.USERID_ALREADY_IN_USE]: 'This User ID is already taken',

  // ===== Auth.Birthday =====
  [ErrorCode.BIRTHDAY_FUTURE_DATE]:
    'Future dates cannot be specified for birthday',
  [ErrorCode.BIRTHDAY_AGE_UNDER_MINIMUM]: 'You must be at least 13 years old',

  // ===== Profile.BasicInfo =====
  [ErrorCode.DISPLAY_NAME_TOO_SHORT]: 'Name must be at least 1 character',
  [ErrorCode.DISPLAY_NAME_TOO_LONG]: 'Name must be 32 characters or less',
  [ErrorCode.BIO_TOO_LONG]: 'Bio must be 200 characters or less',
  [ErrorCode.LOCATION_TOO_LONG]: 'Location must be 50 characters or less',
  [ErrorCode.URL_INVALID_FORMAT]: 'Please enter a valid URL',

  // ===== システムエラー =====
  [ErrorCode.REQUIRED_FIELD_EMPTY]: 'This field is required',
  [ErrorCode.PASSWORD_MISMATCH]: 'Passwords do not match',
  [ErrorCode.VERIFICATION_CODE_INVALID]: 'Verification code is incorrect',
  [ErrorCode.VERIFICATION_CODE_EXPIRED]: 'Verification code has expired',
};
