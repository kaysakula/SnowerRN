//
//  SplashScreen.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-17.
//  Updated by KAY.SAKULA on 2025-10-17.
//
//  Description:
//  アプリ起動時のスプラッシュ画面
//  ロゴ表示後に自動遷移
//

import React, { useState, useEffect } from 'react';

// AnimatedValue helper
class AnimatedValue {
  value: number;

  constructor(initialValue: number) {
    this.value = initialValue;
  }

  setValue(value: number) {
    this.value = value;
  }
}

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadeAnim] = useState(new AnimatedValue(0));

  useEffect(() => {
    fadeAnim.setValue(0);
    const timer = setTimeout(() => {
      fadeAnim.setValue(1);
    }, 100);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [fadeAnim, onFinish]);

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center"
      style={{
        opacity: fadeAnim.value,
        transition: 'opacity 0.8s ease-in-out',
      }}
    >
      <div className="text-center">
        <div className="text-8xl mb-4">⛷️</div>
        <h1 className="text-6xl font-bold text-white mb-2">Snower</h1>
        <p className="text-xl text-blue-100">スキー・スノボ特化型SNS</p>
      </div>
    </div>
  );
};
