//
//  useSignupEmail.ts
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-13.
//  Updated by KAY.SAKULA on 2025-10-18.
//
//  Description:
//  SignupEmailScreenの状態管理フック
//  メール入力とバリデーション、重複チェック、認証コード送信
//  SwiftUIのSignupEmailViewModelに相当
//

import { useState, useCallback, useEffect } from 'react';
import { signupService } from '../../services/signup/signupService';
import {
  ValidationUtils,
  ErrorCode,
  getErrorMessage,
} from '../../utils/validationUtils';
import { useSignupStore } from '../../stores/signupStore';
import type { ErrorCodeType } from '../../constants/errorCodes';

export const useSignupEmail = () => {
  const { email, setEmail, setVerificationCode } = useSignupStore();
  const [errorCode, setErrorCode] = useState<ErrorCodeType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false);

  // メール検証
  const validateEmail = useCallback(async () => {
    // 空欄チェック
    if (!email.trim()) {
      if (hasBlurred) {
        setErrorCode(ErrorCode.REQUIRED_FIELD_EMPTY);
      }
      setIsValid(false);
      return;
    }

    // 形式チェック
    const formatError = ValidationUtils.validateEmail(email);
    if (formatError) {
      if (hasBlurred) {
        setErrorCode(formatError);
      }
      setIsValid(false);
      return;
    }

    // 重複チェック
    setIsLoading(true);
    try {
      const isDuplicate = await signupService.checkEmailDuplicate(email);
      if (isDuplicate) {
        if (hasBlurred) {
          setErrorCode(ErrorCode.EMAIL_ALREADY_IN_USE);
        }
        setIsValid(false);
      } else {
        setErrorCode(null);
        setIsValid(true);
      }
    } catch (error) {
      console.error('Email validation error:', error);
      if (hasBlurred) {
        setErrorCode(ErrorCode.REQUIRED_FIELD_EMPTY); // 仮のエラー
      }
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  }, [email, hasBlurred]);

  // バリデーション（フォーカス外し時）
  const validateOnBlur = useCallback(async () => {
    setHasBlurred(true);
    await validateEmail();
    // validateEmailは依存配列に含めるとvalidateOnBlurが再生成されてしまうため、
    // email, hasBlurredの変更時に自動的に再バリデーションされるようにuseEffectを使用
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  // emailまたはhasBlurredが変更されたら自動的に再検証
  useEffect(() => {
    if (hasBlurred) {
      validateEmail();
    }
    // validateEmailを依存配列に含めると無限ループになるため除外
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, hasBlurred]);

  // 認証コード送信
  const sendVerificationCode = useCallback(async (): Promise<boolean> => {
    if (!isValid) {
      return false;
    }

    setIsLoading(true);
    try {
      const code = await signupService.sendVerificationCode(email);
      setVerificationCode(code);
      console.log(`開発モード: 認証コード ${code} を ${email} に送信しました`);
      return true;
    } catch (error) {
      console.error('Send verification code error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [email, isValid, setVerificationCode]);

  // エラーメッセージ取得
  const errorMessage = errorCode ? getErrorMessage(errorCode) : null;

  return {
    email,
    setEmail,
    errorMessage,
    isLoading,
    isValid,
    hasBlurred,
    validateOnBlur,
    validateEmail,
    sendVerificationCode,
  };
};
