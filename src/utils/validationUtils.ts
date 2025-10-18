//
//  validationUtils.ts
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-13.
//  Updated by KAY.SAKULA on 2025-10-13.
//
//  Description:
//  バリデーションロジック
//  各入力項目のバリデーションを実行し、エラーコードを返す
//  SwiftUIのAuthValidationUtils.swiftとProfileValidationUtils.swiftを統合
//

import { ErrorCode, type ErrorCodeType } from '../constants/errorCodes';

export class ValidationUtils {
  // Email検証
  static validateEmail(email: string): ErrorCodeType | null {
    if (!email || email.trim().length === 0) {
      return ErrorCode.REQUIRED_FIELD_EMPTY;
    }

    const emailRegex = /^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,64}$/;
    if (!emailRegex.test(email)) {
      return ErrorCode.EMAIL_INVALID_FORMAT;
    }

    return null;
  }

  // Password検証
  static validatePassword(password: string): ErrorCodeType | null {
    if (!password || password.length === 0) {
      return ErrorCode.REQUIRED_FIELD_EMPTY;
    }
    if (password.length < 6) {
      return ErrorCode.PASSWORD_TOO_SHORT;
    }
    if (password.length > 32) {
      return ErrorCode.PASSWORD_TOO_LONG;
    }
    return null;
  }

  // パスワード一致確認
  static validatePasswordMatch(
    password: string,
    confirmPassword: string,
  ): ErrorCodeType | null {
    if (password !== confirmPassword) {
      return ErrorCode.PASSWORD_MISMATCH;
    }
    return null;
  }

  // UserId検証
  static validateUserId(userId: string): ErrorCodeType | null {
    if (!userId || userId.trim().length === 0) {
      return ErrorCode.REQUIRED_FIELD_EMPTY;
    }
    if (userId.length < 6) {
      return ErrorCode.USERID_TOO_SHORT;
    }
    if (userId.length > 32) {
      return ErrorCode.USERID_TOO_LONG;
    }

    const userIdRegex = /^[A-Za-z0-9._-]+$/;
    if (!userIdRegex.test(userId)) {
      return ErrorCode.USERID_INVALID_FORMAT;
    }

    return null;
  }

  // Birthday検証（13歳以上、未来の日付NG）
  static validateBirthday(birthday: Date): ErrorCodeType | null {
    const today = new Date();

    // 未来の日付チェック
    if (birthday > today) {
      return ErrorCode.BIRTHDAY_FUTURE_DATE;
    }

    // 年齢計算
    const age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    const dayDiff = today.getDate() - birthday.getDate();

    const actualAge =
      monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (actualAge < 13) {
      return ErrorCode.BIRTHDAY_AGE_UNDER_MINIMUM;
    }

    return null;
  }

  // DisplayName検証
  static validateDisplayName(name: string): ErrorCodeType | null {
    if (!name || name.trim().length === 0) {
      return ErrorCode.REQUIRED_FIELD_EMPTY;
    }
    if (name.length < 1) {
      return ErrorCode.DISPLAY_NAME_TOO_SHORT;
    }
    if (name.length > 32) {
      return ErrorCode.DISPLAY_NAME_TOO_LONG;
    }
    return null;
  }

  // URL検証
  static validateURL(url: string): ErrorCodeType | null {
    if (!url || url.trim().length === 0) {
      return null; // URLは任意項目
    }

    try {
      new URL(url);
      return null;
    } catch {
      return ErrorCode.URL_INVALID_FORMAT;
    }
  }

  // Bio検証
  static validateBio(bio: string): ErrorCodeType | null {
    if (bio && bio.length > 200) {
      return ErrorCode.BIO_TOO_LONG;
    }
    return null;
  }

  // Location検証
  static validateLocation(location: string): ErrorCodeType | null {
    if (location && location.length > 50) {
      return ErrorCode.LOCATION_TOO_LONG;
    }
    return null;
  }
}

// エクスポート
export { ErrorCode } from '../constants/errorCodes';
export { getErrorMessage, setLocale, getLocale } from '../locales';
