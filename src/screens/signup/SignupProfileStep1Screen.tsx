//
//  SignupProfileStep1Screen.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-14.
//  Updated by KAY.SAKULA on 2025-10-14.
//
//  Description:
//  プロフィール入力 - Step1: 基本情報
//  画像、自己紹介(10文字以上)、場所、URL(最大3つ)を入力
//  画像アップロード機能とバリデーション実装
//

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../navigation/SignupNavigator';
import { useSignupStore } from '../../stores/signupStore';
import { ValidationUtils } from '../../utils/validationUtils';
import { getErrorMessage } from '../../locales';

type NavigationProp = StackNavigationProp<AuthStackParamList>;

const SignupProfileStep1Screen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    displayName,
    profileImageUri,
    bio,
    location,
    urls,
    setDisplayName,
    setProfileImage,
    setBio,
    setLocation,
    setUrls,
  } = useSignupStore();

  const [localDisplayName, setLocalDisplayName] = useState(displayName);
  const [localBio, setLocalBio] = useState(bio);
  const [localLocation, setLocalLocation] = useState(location);
  const [localUrls, setLocalUrls] = useState(
    urls.length > 0 && urls[0] !== '' ? urls : [''],
  );
  const [localImageUri, setLocalImageUri] = useState(profileImageUri);
  const [uploading, setUploading] = useState(false);

  const [errors, setErrors] = useState({
    displayName: '',
    bio: '',
    location: '',
    url: '',
  });

  // 画像選択
  const handleSelectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
    });

    if (result.assets && result.assets[0]) {
      setLocalImageUri(result.assets[0].uri || null);
    }
  };

  // URL追加
  const handleAddUrl = () => {
    if (localUrls.length < 3) {
      setLocalUrls([...localUrls, '']);
    }
  };

  // URL削除
  const handleRemoveUrl = (index: number) => {
    const newUrls = localUrls.filter((_, i) => i !== index);
    setLocalUrls(newUrls.length > 0 ? newUrls : ['']);
  };

  // URL更新
  const handleUrlChange = (text: string, index: number) => {
    const newUrls = [...localUrls];
    newUrls[index] = text;
    setLocalUrls(newUrls);
    setErrors({ ...errors, url: '' });
  };

  // 次へ
  const handleNext = () => {
    // バリデーション
    const displayNameError =
      localDisplayName.length < 1
        ? 'EMSG-02-0101' // 名前は1文字以上
        : localDisplayName.length > 32
        ? 'EMSG-02-0102' // 名前は32文字以内
        : null;

    const bioError =
      localBio.length < 10
        ? '自己紹介は10文字以上で入力してください'
        : localBio.length > 200
        ? getErrorMessage('EMSG-02-0201')
        : '';

    const locationError = ValidationUtils.validateLocation(localLocation);

    // URLバリデーション
    let urlError = '';
    for (const url of localUrls) {
      if (url.trim()) {
        const error = ValidationUtils.validateURL(url);
        if (error) {
          urlError = getErrorMessage(error);
          break;
        }
      }
    }

    const newErrors = {
      displayName: displayNameError ? getErrorMessage(displayNameError) : '',
      bio: bioError,
      location: locationError ? getErrorMessage(locationError) : '',
      url: urlError,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(err => err !== '')) {
      return;
    }

    // Zustandに保存
    setDisplayName(localDisplayName);
    setProfileImage(localImageUri);
    setBio(localBio);
    setLocation(localLocation);
    setUrls(localUrls.filter(url => url.trim() !== ''));

    // 次の画面へ
    navigation.navigate('SignupProfileStep2');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>基本情報</Text>
          <Text style={styles.subtitle}>プロフィールを入力してください</Text>
        </View>

        {/* ステップインジケーター */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepActive]} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
        </View>

        {/* プロフィール画像 */}
        <View style={styles.imageSection}>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={handleSelectImage}
          >
            {localImageUri ? (
              <Image source={{ uri: localImageUri }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>📷</Text>
                <Text style={styles.imagePlaceholderSubtext}>
                  タップして選択
                </Text>
              </View>
            )}
          </TouchableOpacity>
          {uploading && <ActivityIndicator style={styles.uploadIndicator} />}
          <Text style={styles.imageHint}>推奨: 正方形の画像、5MB以下</Text>
        </View>

        {/* フォーム */}
        <View style={styles.form}>
          {/* 表示名 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              表示名 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.displayName && styles.inputError]}
              placeholder="山田太郎"
              value={localDisplayName}
              onChangeText={text => {
                setLocalDisplayName(text);
                setErrors({ ...errors, displayName: '' });
              }}
              maxLength={32}
            />
            {errors.displayName && (
              <Text style={styles.errorText}>{errors.displayName}</Text>
            )}
          </View>

          {/* 自己紹介 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              自己紹介 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textArea, errors.bio && styles.inputError]}
              placeholder="あなたについて教えてください(10文字以上)"
              value={localBio}
              onChangeText={text => {
                setLocalBio(text);
                setErrors({ ...errors, bio: '' });
              }}
              multiline
              numberOfLines={4}
              maxLength={200}
            />
            <Text style={styles.charCount}>{localBio.length}/200</Text>
            {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
          </View>

          {/* 場所 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ロケーション</Text>
            <TextInput
              style={[styles.input, errors.location && styles.inputError]}
              placeholder="例: 東京都"
              value={localLocation}
              onChangeText={text => {
                setLocalLocation(text);
                setErrors({ ...errors, location: '' });
              }}
              maxLength={50}
            />
            {errors.location && (
              <Text style={styles.errorText}>{errors.location}</Text>
            )}
          </View>

          {/* URL */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>URL(任意)</Text>
              {localUrls.length < 3 && (
                <TouchableOpacity onPress={handleAddUrl}>
                  <Text style={styles.addButton}>URLを追加</Text>
                </TouchableOpacity>
              )}
            </View>
            {localUrls.map((url, index) => (
              <View key={index} style={styles.urlRow}>
                <TextInput
                  style={[
                    styles.input,
                    styles.urlInput,
                    errors.url && styles.inputError,
                  ]}
                  placeholder="https://..."
                  value={url}
                  onChangeText={text => handleUrlChange(text, index)}
                  autoCapitalize="none"
                  keyboardType="url"
                />
                {localUrls.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveUrl(index)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {errors.url && <Text style={styles.errorText}>{errors.url}</Text>}
          </View>
        </View>
      </ScrollView>

      {/* フッター */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>次へ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
  },
  stepActive: {
    backgroundColor: '#3b82f6',
    width: 24,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  imageButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 40,
    marginBottom: 8,
  },
  imagePlaceholderSubtext: {
    fontSize: 12,
    color: '#64748b',
  },
  uploadIndicator: {
    marginVertical: 8,
  },
  imageHint: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    height: 56,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  textArea: {
    minHeight: 100,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  urlInput: {
    flex: 1,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#ef4444',
    fontSize: 18,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  nextButton: {
    height: 56,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignupProfileStep1Screen;
