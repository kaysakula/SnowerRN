//
//  App.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-16.
//  Updated by KAY.SAKULA on 2025-10-17.
//
//  Description:
//  メインエントリーポイント
//  AuthProviderでアプリ全体をラップ
//

import React from 'react';
import { AuthProvider } from './AuthContext';
import { RootNavigator } from './navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
