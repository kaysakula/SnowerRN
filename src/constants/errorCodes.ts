//
//  errorCodes.ts
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-13.
//  Updated by KAY.SAKULA on 2025-10-13.
//
//  Description:
//  エラーコード定義
//  多言語対応のため、エラーメッセージは別ファイル（locales）で管理
//

export const ErrorCode = {
  // ===== Auth.Email =====
  EMAIL_INVALID_FORMAT: 'EMSG-01-0101',
  EMAIL_ALREADY_IN_USE: 'EMSG-01-0102',

  // ===== Auth.Password =====
  PASSWORD_TOO_SHORT: 'EMSG-01-0201',
  PASSWORD_TOO_LONG: 'EMSG-01-0202',
  PASSWORD_INVALID_CHAR: 'EMSG-01-0203',

  // ===== Auth.UserID =====
  USERID_TOO_SHORT: 'EMSG-01-0301',
  USERID_TOO_LONG: 'EMSG-01-0302',
  USERID_INVALID_FORMAT: 'EMSG-01-0303',
  USERID_ALREADY_IN_USE: 'EMSG-01-0304',

  // ===== Auth.Birthday =====
  BIRTHDAY_FUTURE_DATE: 'EMSG-01-0501',
  BIRTHDAY_AGE_UNDER_MINIMUM: 'EMSG-01-0502',

  // ===== Profile.BasicInfo =====
  DISPLAY_NAME_TOO_SHORT: 'EMSG-02-0101',
  DISPLAY_NAME_TOO_LONG: 'EMSG-02-0102',
  BIO_TOO_LONG: 'EMSG-02-0201',
  LOCATION_TOO_LONG: 'EMSG-02-0301',
  URL_INVALID_FORMAT: 'EMSG-02-0401',

  // ===== システムエラー =====
  REQUIRED_FIELD_EMPTY: 'EMSG-99-0001',
  PASSWORD_MISMATCH: 'EMSG-99-0002',
  VERIFICATION_CODE_INVALID: 'EMSG-99-0003',
  VERIFICATION_CODE_EXPIRED: 'EMSG-99-0004',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];
