//
//  MainTabNavigator.tsx
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-17.
//  Updated by KAY.SAKULA on 2025-10-17.
//
//  Description:
//  メインタブナビゲーター
//  ホーム/検索/投稿/通知/プロフィールのタブナビゲーション
//

import React, { useState, useCallback } from 'react';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../contexts/AuthContext';

export const MainTabNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { logout, user } = useAuth();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const tabs = [
    { id: 'home', icon: 'home', label: 'ホーム' },
    { id: 'search', icon: 'search', label: '検索' },
    { id: 'post', icon: 'plus', label: '投稿' },
    { id: 'notifications', icon: 'bell', label: '通知' },
    { id: 'profile', icon: 'user', label: 'プロフィール' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">⛷️</span>
            <h1 className="text-2xl font-bold text-gray-800">Snower</h1>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-2xl w-full mx-auto">
        {activeTab === 'home' && <TimelineScreen />}
        {activeTab === 'search' && <SearchScreen />}
        {activeTab === 'post' && <PostScreen />}
        {activeTab === 'notifications' && <NotificationsScreen />}
        {activeTab === 'profile' && <ProfileScreen user={user} />}
      </main>

      {/* タブバー */}
      <nav className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-2xl mx-auto px-4 py-2 flex justify-around">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon
                  name={tab.icon}
                  size={24}
                  color={isActive ? '#2563eb' : '#4b5563'}
                />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

// タイムライン画面
const TimelineScreen: React.FC = () => {
  const posts = [
    {
      id: 1,
      user: '太郎',
      content: '白馬でパウダー最高でした！❄️',
      likes: 24,
      time: '2時間前',
    },
    {
      id: 2,
      user: '花子',
      content: 'ニセコでバックカントリー🏂',
      likes: 42,
      time: '4時間前',
    },
    {
      id: 3,
      user: '次郎',
      content: '八方尾根の景色が最高✨',
      likes: 18,
      time: '6時間前',
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">タイムライン</h2>
      {posts.map(post => (
        <div
          key={post.id}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
              {post.user[0]}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{post.user}</div>
              <div className="text-sm text-gray-500">{post.time}</div>
            </div>
          </div>
          <p className="text-gray-800 mb-4">{post.content}</p>
          <div className="flex items-center gap-6 text-gray-600">
            <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
              <Icon name="heart" size={20} color="#4b5563" />
              <span>{post.likes}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
              <Icon name="message-circle" size={20} color="#4b5563" />
            </button>
            <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
              <Icon name="share-2" size={20} color="#4b5563" />
            </button>
            <button className="flex items-center gap-2 hover:text-yellow-500 transition-colors ml-auto">
              <Icon name="bookmark" size={20} color="#4b5563" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// 検索画面
const SearchScreen: React.FC = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">検索</h2>
    <input
      type="text"
      placeholder="ユーザーやスポットを検索..."
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

// 投稿画面
const PostScreen: React.FC = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">新規投稿</h2>
    <textarea
      placeholder="今日の滑りはどうでしたか？"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
    />
    <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
      投稿する
    </button>
  </div>
);

// 通知画面
const NotificationsScreen: React.FC = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">通知</h2>
    <div className="text-gray-600 text-center py-12">通知はありません</div>
  </div>
);

// プロフィール画面
const ProfileScreen: React.FC<{ user: any }> = ({ user }) => (
  <div className="p-4">
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
          {user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            {user?.email || 'ユーザー'}
          </h3>
          <p className="text-gray-600">UID: {user?.uid || 'N/A'}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-gray-800">42</div>
          <div className="text-sm text-gray-600">投稿</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-800">128</div>
          <div className="text-sm text-gray-600">フォロー</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-800">256</div>
          <div className="text-sm text-gray-600">フォロワー</div>
        </div>
      </div>
    </div>
  </div>
);
