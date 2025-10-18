//
//  useSignupAccount.ts
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-13.
//  Updated by KAY.SAKULA on 2025-10-13.
//
//  Description:
//  SignupAccountScreenの状態管理フック
//  アカウント情報入力とバリデーション、Firebase Auth アカウント作成
//  SwiftUIのSignupAccountViewModelに相当
//

import { useState, useCallback } from 'react';
import { signupService } from '../services/signupService';
import {
  ValidationUtils,
  ErrorCode,
  getErrorMessage,
} from '../utils/validationUtils';
import { useSignupStore } from '../stores/signupStore';
import type { ErrorCodeType } from '../constants/errorCodes';

interface ValidationErrors {
  userId?: ErrorCodeType;
  password?: ErrorCodeType;
  confirmPassword?: ErrorCodeType;
  birthday?: ErrorCodeType;
}

export const useSignupAccount = (isOAuthSignUp: boolean = false) => {
  const {
    email,
    userId,
    password,
    confirmPassword,
    birthday,
    setUserId,
    setPassword,
    setConfirmPassword,
    setBirthday,
  } = useSignupStore();

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [fieldBlurred, setFieldBlurred] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // 全フィールドバリデーション
  const validateAllFields = useCallback(async () => {
    const errors: ValidationErrors = {};

    // UserID検証
    const userIdError = ValidationUtils.validateUserId(userId);
    if (userIdError) {
      errors.userId = userIdError;
    } else {
      // 重複チェック
      setIsLoading(true);
      try {
        const isDuplicate = await signupService.checkUserIdDuplicate(userId);
        if (isDuplicate) {
          errors.userId = ErrorCode.USERID_ALREADY_IN_USE;
        }
      } catch (error) {
        console.error('UserID validation error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    // Password検証（OAuthでない場合のみ）
    if (!isOAuthSignUp) {
      const passwordError = ValidationUtils.validatePassword(password);
      if (passwordError) {
        errors.password = passwordError;
      }

      const passwordMatchError = ValidationUtils.validatePasswordMatch(
        password,
        confirmPassword,
      );
      if (passwordMatchError) {
        errors.confirmPassword = passwordMatchError;
      }
    }

    // Birthday検証
    if (birthday) {
      const birthdayError = ValidationUtils.validateBirthday(
        new Date(birthday),
      );
      if (birthdayError) {
        errors.birthday = birthdayError;
      }
    } else {
      errors.birthday = ErrorCode.REQUIRED_FIELD_EMPTY;
    }

    setValidationErrors(errors);
    setIsValid(Object.keys(errors).length === 0);
    return Object.keys(errors).length === 0;
  }, [userId, password, confirmPassword, birthday, isOAuthSignUp]);

  // アカウント作成 + 仮ユーザー登録
  const createAccount = useCallback(async (): Promise<string> => {
    const isValidated = await validateAllFields();
    if (!isValidated) {
      throw new Error('入力内容に誤りがあります');
    }

    setIsLoading(true);
    try {
      // 1. Firebase Auth アカウント作成
      const uid = await signupService.createFirebaseAccount(email, password);

      // 2. 仮ユーザー登録（userId予約 + Profile入力待ち状態）
      await signupService.saveIncompleteUser(
        uid,
        email,
        userId,
        new Date(birthday!),
      );

      return uid;
    } catch (error: any) {
      console.error('Create account error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [email, password, userId, birthday, validateAllFields]);

  // 個別バリデーション
  const validateUserId = useCallback(async () => {
    setFieldBlurred(prev => ({ ...prev, userId: true }));

    if (!userId.trim()) {
      setValidationErrors(prev => {
        const { userId, ...rest } = prev;
        return rest;
      });
      return;
    }

    const formatError = ValidationUtils.validateUserId(userId);
    if (formatError) {
      setValidationErrors(prev => ({ ...prev, userId: formatError }));
      return;
    }

    setIsLoading(true);
    try {
      const isDuplicate = await signupService.checkUserIdDuplicate(userId);
      if (isDuplicate) {
        setValidationErrors(prev => ({
          ...prev,
          userId: ErrorCode.USERID_ALREADY_IN_USE,
        }));
      } else {
        setValidationErrors(prev => {
          const { userId, ...rest } = prev;
          return rest;
        });
      }
    } catch (error) {
      console.error('UserID check error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const validatePassword = useCallback(() => {
    if (isOAuthSignUp) return;
    setFieldBlurred(prev => ({ ...prev, password: true }));

    if (!password) {
      setValidationErrors(prev => {
        const { password, ...rest } = prev;
        return rest;
      });
      return;
    }

    const error = ValidationUtils.validatePassword(password);
    if (error) {
      setValidationErrors(prev => ({ ...prev, password: error }));
    } else {
      setValidationErrors(prev => {
        const { password, ...rest } = prev;
        return rest;
      });
    }

    // confirmPasswordも再検証
    if (confirmPassword) {
      validateConfirmPassword();
    }
  }, [password, confirmPassword, isOAuthSignUp]);

  const validateConfirmPassword = useCallback(() => {
    if (isOAuthSignUp) return;
    setFieldBlurred(prev => ({ ...prev, confirmPassword: true }));

    if (!confirmPassword) {
      setValidationErrors(prev => {
        const { confirmPassword, ...rest } = prev;
        return rest;
      });
      return;
    }

    const error = ValidationUtils.validatePasswordMatch(
      password,
      confirmPassword,
    );
    if (error) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: error }));
    } else {
      setValidationErrors(prev => {
        const { confirmPassword, ...rest } = prev;
        return rest;
      });
    }
  }, [password, confirmPassword, isOAuthSignUp]);

  const validateBirthday = useCallback(() => {
    setFieldBlurred(prev => ({ ...prev, birthday: true }));

    if (!birthday) {
      setValidationErrors(prev => ({
        ...prev,
        birthday: ErrorCode.REQUIRED_FIELD_EMPTY,
      }));
      return;
    }

    const error = ValidationUtils.validateBirthday(new Date(birthday));
    if (error) {
      setValidationErrors(prev => ({ ...prev, birthday: error }));
    } else {
      setValidationErrors(prev => {
        const { birthday, ...rest } = prev;
        return rest;
      });
    }
  }, [birthday]);

  // エラーメッセージ取得
  const getValidationError = useCallback(
    (field: keyof ValidationErrors): string | undefined => {
      if (!fieldBlurred[field]) return undefined;
      const errorCode = validationErrors[field];
      return errorCode ? getErrorMessage(errorCode) : undefined;
    },
    [validationErrors, fieldBlurred],
  );

  return {
    userId,
    password,
    confirmPassword,
    birthday,
    setUserId,
    setPassword,
    setConfirmPassword,
    setBirthday,
    validationErrors,
    isLoading,
    isValid,
    validateAllFields,
    createAccount,
    validateUserId,
    validatePassword,
    validateConfirmPassword,
    validateBirthday,
    getValidationError,
  };
};
