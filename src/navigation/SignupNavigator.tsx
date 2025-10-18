//
//  SignupNavigator.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-14.
//  Updated by KAY.SAKULA on 2025-10-14.
//
//  Description:
//  サインアップフローのナビゲーション設定
//  サインアップ画面（Email → Code → Account → Profile 5ステップ → Welcome）
//  の遷移を管理
//

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SignupEmailScreen from '../screens/signup/SignupEmailScreen';
import SignupEmailCodeScreen from '../screens/signup/SignupEmailCodeScreen';
import SignupAccountScreen from '../screens/signup/SignupAccountScreen';
import SignupProfileStep1Screen from '../screens/signup/SignupProfileStep1Screen';
import SignupProfileStep2Screen from '../screens/signup/SignupProfileStep2Screen';
import SignupProfileStep3Screen from '../screens/signup/SignupProfileStep3Screen';
import SignupProfileStep4Screen from '../screens/signup/SignupProfileStep4Screen';
import SignupProfileStep5Screen from '../screens/signup/SignupProfileStep5Screen';
import WelcomeToSnowerScreen from '../screens/signup/WelcomeToSnowerScreen';

export type AuthStackParamList = {
  SignupEmail: undefined;
  SignupEmailCode: undefined;
  SignupAccount: undefined;
  SignupProfileStep1: undefined;
  SignupProfileStep2: undefined;
  SignupProfileStep3: undefined;
  SignupProfileStep4: undefined;
  SignupProfileStep5: undefined;
  WelcomeToSnower: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const SignupNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: '', // ✅ @react-navigation/stack用
        headerTintColor: '#1e293b',
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
        // ✅ @react-navigation/stack用のアニメーション設定
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      {/* サインアップフロー */}
      <Stack.Screen
        name="SignupEmail"
        component={SignupEmailScreen}
        options={{
          title: 'サインアップ',
          headerLeft: () => null, // ✅ 戻るボタンを非表示
        }}
      />
      <Stack.Screen
        name="SignupEmailCode"
        component={SignupEmailCodeScreen}
        options={{
          title: '認証コード',
        }}
      />
      <Stack.Screen
        name="SignupAccount"
        component={SignupAccountScreen}
        options={{
          title: 'アカウント情報',
        }}
      />

      {/* プロフィール入力（5ステップ） */}
      <Stack.Screen
        name="SignupProfileStep1"
        component={SignupProfileStep1Screen}
        options={{
          title: 'プロフィール入力 (1/5)',
        }}
      />
      <Stack.Screen
        name="SignupProfileStep2"
        component={SignupProfileStep2Screen}
        options={{
          title: 'プロフィール入力 (2/5)',
        }}
      />
      <Stack.Screen
        name="SignupProfileStep3"
        component={SignupProfileStep3Screen}
        options={{
          title: 'プロフィール入力 (3/5)',
        }}
      />
      <Stack.Screen
        name="SignupProfileStep4"
        component={SignupProfileStep4Screen}
        options={{
          title: 'プロフィール入力 (4/5)',
        }}
      />
      <Stack.Screen
        name="SignupProfileStep5"
        component={SignupProfileStep5Screen}
        options={{
          title: 'プロフィール入力 (5/5)',
        }}
      />

      {/* 完了画面 */}
      <Stack.Screen
        name="WelcomeToSnower"
        component={WelcomeToSnowerScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default SignupNavigator;
