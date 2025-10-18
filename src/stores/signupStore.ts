//
//  signupStore.ts
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-13.
//  Updated by KAY.SAKULA on 2025-10-13.
//
//  Description:
//  サインアップフロー全体のデータ管理（Zustand + AsyncStorage）
//  SwiftUIのSignupDraftManager + SignupProfileViewModelに相当
//  画面遷移してもデータを保持し、アプリ再起動後も復元可能
//

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SignupState {
  // Step 1: Email
  email: string;
  verificationCode: string;

  // Step 2: Account
  userId: string;
  password: string;
  confirmPassword: string;
  birthday: string | null; // ISO文字列形式

  // Step 3: Profile - Step1 (基本情報)
  displayName: string;
  profileImageUri: string | null;
  bio: string;
  location: string;
  urls: string[];

  // Step 4: Profile - Step2 (ライディング)
  gear: string[];
  style: string[];
  startDate: string | null;
  favoriteMountains: string[];

  // Step 5: Profile - Step3 (ギア詳細)
  skiItems: string[];
  boardItems: string[];
  bindingItems: string[];
  bootsItems: string[];
  wearItems: string[];
  pantsItems: string[];
  gogglesItems: string[];
  glovesItems: string[];
  helmetsItems: string[];
  othersItems: string[];
  favoriteBrands: string[];

  // Step 6: Profile - Step4 (目的)
  purposes: string[];

  // Step 7: Profile - Step5 (フォロー)
  followedUserIds: string[];

  // 現在のステップ
  currentStep: number;

  // アクション
  setEmail: (email: string) => void;
  setVerificationCode: (code: string) => void;
  setUserId: (userId: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  setBirthday: (birthday: Date) => void;
  setDisplayName: (name: string) => void;
  setProfileImage: (uri: string | null) => void;
  setBio: (bio: string) => void;
  setLocation: (location: string) => void;
  setUrls: (urls: string[]) => void;
  setGear: (gear: string[]) => void;
  setStyle: (style: string[]) => void;
  setStartDate: (date: Date | null) => void;
  setFavoriteMountains: (mountains: string[]) => void;
  setSkiItems: (items: string[]) => void;
  setBoardItems: (items: string[]) => void;
  setBindingItems: (items: string[]) => void;
  setBootsItems: (items: string[]) => void;
  setWearItems: (items: string[]) => void;
  setPantsItems: (items: string[]) => void;
  setGogglesItems: (items: string[]) => void;
  setGlovesItems: (items: string[]) => void;
  setHelmetsItems: (items: string[]) => void;
  setOthersItems: (items: string[]) => void;
  setFavoriteBrands: (brands: string[]) => void;
  setPurposes: (purposes: string[]) => void;
  setCurrentStep: (step: number) => void;
  toggleFollowUser: (userId: string) => void;
  clearSignupData: () => void;
}

const initialState = {
  email: '',
  verificationCode: '',
  userId: '',
  password: '',
  confirmPassword: '',
  birthday: null,
  displayName: '',
  profileImageUri: null,
  bio: '',
  location: '',
  urls: [''],
  gear: [],
  style: [],
  startDate: null,
  favoriteMountains: [],
  skiItems: [''],
  boardItems: [''],
  bindingItems: [''],
  bootsItems: [''],
  wearItems: [''],
  pantsItems: [''],
  gogglesItems: [''],
  glovesItems: [''],
  helmetsItems: [''],
  othersItems: [''],
  favoriteBrands: [],
  purposes: [],
  followedUserIds: [],
  currentStep: 0,
};

export const useSignupStore = create<SignupState>()(
  persist(
    set => ({
      ...initialState,

      // アクション
      setEmail: email => set({ email }),
      setVerificationCode: code => set({ verificationCode: code }),
      setUserId: userId => set({ userId }),
      setPassword: password => set({ password }),
      setConfirmPassword: password => set({ confirmPassword: password }),
      setBirthday: birthday => set({ birthday: birthday.toISOString() }),
      setDisplayName: name => set({ displayName: name }),
      setProfileImage: uri => set({ profileImageUri: uri }),
      setBio: bio => set({ bio }),
      setLocation: location => set({ location }),
      setUrls: urls => set({ urls }),
      setGear: gear => set({ gear }),
      setStyle: style => set({ style }),
      setStartDate: date =>
        set({ startDate: date ? date.toISOString() : null }),
      setFavoriteMountains: mountains => set({ favoriteMountains: mountains }),
      setSkiItems: items => set({ skiItems: items }),
      setBoardItems: items => set({ boardItems: items }),
      setBindingItems: items => set({ bindingItems: items }),
      setBootsItems: items => set({ bootsItems: items }),
      setWearItems: items => set({ wearItems: items }),
      setPantsItems: items => set({ pantsItems: items }),
      setGogglesItems: items => set({ gogglesItems: items }),
      setGlovesItems: items => set({ glovesItems: items }),
      setHelmetsItems: items => set({ helmetsItems: items }),
      setOthersItems: items => set({ othersItems: items }),
      setFavoriteBrands: brands => set({ favoriteBrands: brands }),
      setPurposes: purposes => set({ purposes }),
      setCurrentStep: step => set({ currentStep: step }),

      toggleFollowUser: userId =>
        set(state => ({
          followedUserIds: state.followedUserIds.includes(userId)
            ? state.followedUserIds.filter(id => id !== userId)
            : [...state.followedUserIds, userId],
        })),

      clearSignupData: () => set(initialState),
    }),
    {
      name: 'signup-storage', // AsyncStorageのキー
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
