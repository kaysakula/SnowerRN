//
//  useSignupEmailCode.ts
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-14.
//  Updated by KAY.SAKULA on 2025-10-14.
//
//  Description:
//  SignupEmailCodeScreenの状態管理フック
//  6桁認証コード入力と検証、タイマー管理
//  SwiftUIのSignupEmailCodeViewModelに相当
//

import { useState, useCallback, useEffect, useRef } from 'react';
import { signupService } from '../services/signupService';
import { ErrorCode, getErrorMessage } from '../utils/validationUtils';
import { useSignupStore } from '../stores/signupStore';
import type { ErrorCodeType } from '../constants/errorCodes';

const VERIFICATION_CODE_TIMEOUT = 300; // 5分（秒）
const DEVELOPMENT_CODE = '999999'; // 開発用固定コード

export const useSignupEmailCode = () => {
  const { email, verificationCode: storedCode } = useSignupStore();
  const [inputCode, setInputCode] = useState('');
  const [errorCode, setErrorCode] = useState<ErrorCodeType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [remainingTime, setRemainingTime] = useState(VERIFICATION_CODE_TIMEOUT);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // タイマー開始
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setErrorCode(ErrorCode.VERIFICATION_CODE_EXPIRED);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // コード検証
  const verifyCode = useCallback(async (): Promise<boolean> => {
    if (inputCode.length !== 6) {
      setErrorCode(ErrorCode.REQUIRED_FIELD_EMPTY);
      return false;
    }

    if (remainingTime === 0) {
      setErrorCode(ErrorCode.VERIFICATION_CODE_EXPIRED);
      return false;
    }

    setIsLoading(true);
    try {
      // 開発モード: 999999 または保存されたコードで検証
      if (inputCode === DEVELOPMENT_CODE || inputCode === storedCode) {
        console.log('開発モード: 認証コード検証成功');
        setErrorCode(null);
        setIsValid(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        return true;
      }

      // TODO: 本番用の認証コード検証処理
      setErrorCode(ErrorCode.VERIFICATION_CODE_INVALID);
      return false;
    } catch (error) {
      console.error('Verify code error:', error);
      setErrorCode(ErrorCode.VERIFICATION_CODE_INVALID);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [inputCode, remainingTime, storedCode]);

  // 再送信
  const resendCode = useCallback(async (): Promise<boolean> => {
    if (remainingTime > 240) {
      // 60秒以内は再送信不可
      return false;
    }

    setIsLoading(true);
    try {
      await signupService.sendVerificationCode(email);
      setRemainingTime(VERIFICATION_CODE_TIMEOUT);
      setInputCode('');
      setErrorCode(null);
      console.log('開発モード: 認証コード 999999 を再送信しました');
      return true;
    } catch (error) {
      console.error('Resend code error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [email, remainingTime]);

  // フォーマット済み時間
  const formattedTime = `${Math.floor(remainingTime / 60)}:${(
    remainingTime % 60
  )
    .toString()
    .padStart(2, '0')}`;

  // エラーメッセージ取得
  const errorMessage = errorCode ? getErrorMessage(errorCode) : null;

  return {
    inputCode,
    setInputCode,
    errorMessage,
    isLoading,
    isValid,
    remainingTime,
    formattedTime,
    verifyCode,
    resendCode,
  };
};
