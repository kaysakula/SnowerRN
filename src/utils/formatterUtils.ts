//
//  src/utils/common/formatterUtils.ts
//  Project: SnowerRN
//
//  Created by KAY.SAKULA on 2025-10-17.
//  Updated by KAY.SAKULA on 2025-10-17.
//
//  Description:
//  表示用フォーマット関数集
//  - 時間表示（○分前、○時間前など）
//  - カウント表示（1.2K、3.5Mなど）
//  - メンション・ハッシュタグの検出
//

/**
 * 時間を「○分前」形式でフォーマット
 */
export const formatTimeAgo = (date?: Date): string => {
  if (!date) return '';

  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}日前`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}週間前`;

  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
};

/**
 * 数値を省略形式でフォーマット（1.2K、3.5Mなど）
 */
export const formatCount = (count: number): string => {
  if (count < 1000) return count.toString();
  if (count < 10000) return `${(count / 1000).toFixed(1)}K`;
  if (count < 1000000) return `${Math.floor(count / 1000)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
};

/**
 * テキストからメンションを抽出
 */
export const extractMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
};

/**
 * テキストからハッシュタグを抽出
 */
export const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#(\w+)/g;
  const hashtags: string[] = [];
  let match;

  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1]);
  }

  return hashtags;
};

/**
 * テキストからURLを抽出
 */
export const extractUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

/**
 * メンション・ハッシュタグ・URLを含むテキストを解析
 */
interface TextPart {
  type: 'text' | 'mention' | 'hashtag' | 'url';
  content: string;
}

export const parseRichText = (text: string): TextPart[] => {
  const parts: TextPart[] = [];
  let lastIndex = 0;

  // メンション、ハッシュタグ、URLを見つける
  const regex = /(@\w+)|(#\w+)|(https?:\/\/[^\s]+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // マッチ前のテキスト
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    // マッチしたテキスト
    if (match[1]) {
      // メンション
      parts.push({
        type: 'mention',
        content: match[1],
      });
    } else if (match[2]) {
      // ハッシュタグ
      parts.push({
        type: 'hashtag',
        content: match[2],
      });
    } else if (match[3]) {
      // URL
      parts.push({
        type: 'url',
        content: match[3],
      });
    }

    lastIndex = regex.lastIndex;
  }

  // 残りのテキスト
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return parts;
};

/**
 * ファイルサイズをフォーマット
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

/**
 * 日付を相対表示（今日、昨日、○月○日など）
 */
export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今日';
  if (diffDays === 1) return '昨日';
  if (diffDays < 7) return `${diffDays}日前`;

  return date.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
  });
};

/**
 * タイムスタンプを時刻表示（HH:MM）
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 完全な日時表示（YYYY年MM月DD日 HH:MM）
 */
export const formatFullDateTime = (date: Date): string => {
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
