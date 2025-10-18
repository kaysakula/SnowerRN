//
//  index.ts
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-14.
//  Updated by KAY.SAKULA on 2025-10-14.
//
//  Description:
//  言語切り替え管理
//  エラーコードから対応する言語のメッセージを取得
//  将来的にはデバイス設定やユーザー設定から言語を自動選択
//

import { ja } from './ja';
import { en } from './en';
import type { ErrorCodeType } from '../constants/errorCodes';

type Locale = 'ja' | 'en';

const translations = {
  ja,
  en,
};

// 現在の言語（デフォルトは日本語）
let currentLocale: Locale = 'ja';

// 言語を設定
export const setLocale = (locale: Locale) => {
  currentLocale = locale;
};

// 現在の言語を取得
export const getLocale = (): Locale => {
  return currentLocale;
};

// エラーメッセージを取得
export const getErrorMessage = (errorCode: ErrorCodeType): string => {
  return translations[currentLocale][errorCode] || errorCode;
};
