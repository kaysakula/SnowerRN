# リゾートハブ画面 仕様設計（ドラフト v0.1）

作成: 2026-08-28 / ステータス: **議論中（未確定）**

---

## 0. この画面の位置づけ

```
コンディション画面（ゲレンデ一覧・今日の雪質）
        │  任意のスキー場をタップ
        ▼
リゾートハブ画面  ← 本ドキュメント
        │
        ├─ ユーザープロフィール画面
        ├─ 投稿詳細画面
        └─ 予定作成モーダル
```

**一言でいうと**: 「そのゲレンデの“今”と“これから”が集まる場所」。

- **今** = コンディション + 実況コメント（リアルタイム）
- **これから** = みんなの予定（誰がいつ行くか）

タイムラインが「人でつながる」場所なのに対して、リゾートハブは
**「場所でつながる」**場所。ここが Snower の差別化ポイントになる。

---

## 1. 必須要件（依頼された機能）

| # | 要件 | 本ドラフトでの解 |
|---|---|---|
| R1 | そのスキー場へのコメントが**最新順**で見える | `resorts/{resortId}/comments` を `createdAt desc` で購読 |
| R2 | コメントが**瞬時に**できる | `onSnapshot` + 楽観的更新（送信前にローカル即挿入） |
| R3 | 該当スキー場の**他人の予定**が見える | `plans` を `resortId` + `date >= today` で取得、日付ストリップ表示 |

---

## 2. 画面構成（IA）

```
┌─────────────────────────────┐
│ ← [ヒーロー画像 / ゲレンデ写真]   ★ ⋯ │  ① ヘッダー（スクロールで縮小）
│   ニセコグラン・ヒラフ 北海道       │
├─────────────────────────────┤
│ ❄ 積雪 320cm  新雪 15cm  -8℃  ☁ │  ② コンディションサマリー
│ リフト 12/14稼働   3分前に更新      │
│ 今日の雪質: パウダー 68% ▓▓▓▓░░   │
├─────────────────────────────┤
│ [ 実況 ] [ 予定 ] [ 写真 ] [ 情報 ] │  ③ セグメントタブ（sticky）
├─────────────────────────────┤
│                             │
│   タブごとのコンテンツ            │  ④ コンテンツ
│                             │
├─────────────────────────────┤
│ [ 💬 コメントする ]  [ 📅 予定を追加 ] │  ⑤ 固定アクションバー
└─────────────────────────────┘
```

### ① ヘッダー
- ヒーロー画像、ゲレンデ名、都道府県 / エリア
- ★ = **お気に入り登録**（フォロー相当）。登録すると新雪通知・友だちの予定通知の対象になる
- ⋯ = 共有 / 公式サイト / マップアプリで開く / 通報

### ② コンディションサマリー
- 積雪・新雪・気温・天気・リフト稼働はコンディション画面から渡されたスナップショットを**即描画**（ローディングを見せない）
- その下に「今日の雪質」= **ユーザー投票の集計**（後述 A-2）
- 「◯分前に更新」+ 情報ソース表記は必須（信頼性が命）

### ③ タブ
`実況 / 予定` が v1 の必須。`写真 / 情報` は v1.5 以降で段階追加。
1画面ロングスクロールではなく**タブ**を推す理由:
- 実況は無限スクロール＋入力バーが要る → 他セクションと同居するとスクロール競合が起きる
- 「今日の雪どう？」と「週末誰か行く？」は**来訪目的が別**。混ぜない方が速い

---

## 3. 実況タブ（R1 / R2）

### 3.1 UX
- **最新が一番上**（`createdAt desc`）。チャット型（下が最新）ではなく**フィード型**を採用
  - 理由: 依頼要件が「最新順」であること、通りすがりの流し読みが主用途、
    未読位置の管理が不要でスクロール制御が単純になる
- 画面下部に**常設のコンポーザー**（1行入力 → フォーカスで展開）
- 送信すると**即座にリストの先頭に自分のコメントが挿入される**（送信中は淡色 + スピナー）。
  Firestore 応答を待たない。失敗時のみ「再送」に切り替え
- 新着が来たら先頭に「新着 3件」バナー（タイムライン画面と同じパターンを流用）
  - ただし**自分がリスト最上部にいる時は自動で流し込む**（バナーを出さない）
- 1コメント = 最大140字 + 画像1枚（任意）+ **コンディションタグ**（後述）
- コメントへの返信は v1 では持たない（**1階層フラット**）。荒れにくく、実装も軽い。
  代わりに ❤ といいねだけ置く

### 3.2 コンディションタグ（推し機能）
コンポーザーの上にチップを並べる:

`#パウダー` `#圧雪バーン` `#アイスバーン` `#シャバ雪` `#視界不良` `#混雑` `#空いてる` `#強風`

- タグだけタップして「投稿」も可能 → **投稿コストがほぼゼロ**
- 集計して②の「今日の雪質: パウダー 68%」を作る（当日分のみ、翌日0時リセット）
- テキストだけのコメント欄は必ず過疎る。**数値化できる軽量アクションを併設する**のが肝

### 3.3 リアルタイム設計
```ts
// 直近30件だけ購読する（全件購読しない）
resortsRef.doc(resortId).collection('comments')
  .where('isDeleted', '==', false)
  .orderBy('createdAt', 'desc')
  .limit(30)
  .onSnapshot(...)
```
- それ以前は `startAfter` でページング取得（購読しない）
- **画面から離れたら必ず detach**（`useFocusEffect` のクリーンアップ）。Firestore の読み取り課金は購読しっぱなしが一番効く
- 楽観的更新の重複排除は `clientId`（UUID をクライアント生成してドキュメントにも保存）で行う
- ユーザー情報（displayName / imageUrl）は**コメントドキュメントに非正規化コピー**する。
  `timelineService.fetchPosts` のように1件ずつ users を引くとコメント30件で30回読み取りになり、
  リアルタイム更新のたびに再取得が走る。ここは必ずコピーで持つ

---

## 4. 予定タブ（R3）

### 4.1 UX
```
┌─────────────────────────────┐
│ 8/29  8/30  8/31  9/1  9/2  9/3 │ ← 日付ストリップ（横スクロール）
│  ●●    ●●●●   -    ●     ●●   ●  │   ドット = その日の予定人数
├─────────────────────────────┤
│ 8/30(土)  4人が行く予定             │
│  ┌───┐ かず   1泊2日・パウダー狙い    │
│  ┌───┐ みお   日帰り  [一緒に滑る?]   │
│  ...                          │
├─────────────────────────────┤
│ + 自分の予定を追加                 │
└─────────────────────────────┘
```
- デフォルトは**直近14日**。日付ストリップで絞り込み
- 並び順: **フォロー中の人 → 相互フォロー → その他**（クライアント側で並べ替え）
- 各行から プロフィール遷移 / DM（将来）/ 「一緒に滑る？」リアクション

### 4.2 予定モデルの論点
「他人の予定」を出す以上、**公開範囲の設計が必須**（実質的な位置情報の予告になるため）。

- `visibility: 'public' | 'followers' | 'private'`
- Firestore の制約上 followers 限定を1クエリで解決できない
  （`in` は最大30件までなので「フォロワー全員」を条件にできない）
- **v1 提案**: `public` のみリゾートハブに表示。`followers` / `private` は
  自分のカレンダーとフォロワーのタイムラインにのみ出す。
  ハブ側は「公開予定だけが並ぶ掲示板」と割り切る
- 予定作成時に**デフォルトを `followers` にする**（安全側）。ハブに載せたい人が明示的に public を選ぶ

### 4.3 予定 → チェックインへの遷移
`status: 'planned' | 'checkedin' | 'done'` を持たせ、当日その場でチェックインすると
「**今ゲレンデにいる人**」セクションが実況タブの上に出る。これが実況コメントの燃料になる。

---

## 5. データモデル（Firestore）

### 5.1 用語の統一についての提案
既存 `posts` は `mountainId` / `mountainName` を持つ。新規は `resort` 表記で書きたいが
**混在は必ず事故る**。データ量が少ない今のうちに `posts.resortId` / `posts.resortName` へ
リネームすることを提案（決定事項として要合意）。以下は `resortId` 前提で記述。

### 5.2 コレクション

```
resorts/{resortId}                          … ゲレンデマスタ（運営が投入）
  name, nameKana, prefecture, area, country
  geo: { lat, lng, geohash }
  heroImageUrl, officialUrl, mapUrl
  liftCount, courseCount, elevationTop, elevationBase
  condition: {                              … 最新コンディションの非正規化スナップショット
    snowDepth, newSnow, temp, weather,
    liftOpen, liftTotal, updatedAt, source
  }
  stats: { commentsCount, upcomingPlansCount, followersCount, checkedInCount }

resorts/{resortId}/comments/{commentId}     … 実況コメント
  userId, displayName, userImageUrl         … 非正規化コピー（必須）
  text, mediaUrl?
  conditionTags: string[]
  createdAt (serverTimestamp), clientId
  likesCount, isDeleted, isReported

resorts/{resortId}/conditionVotes/{userId}_{yyyymmdd}  … 雪質投票（1人1日1票、上書き）
  tag, createdAt

resorts/{resortId}/followers/{userId}       … お気に入り登録者
users/{userId}/followingResorts/{resortId}  … 逆引き

plans/{planId}                              … 予定（トップレベル）
  userId, displayName, userImageUrl         … 非正規化コピー
  resortId, resortName
  date: 'YYYY-MM-DD'（単日）/ endDate?（連泊）
  visibility: 'public' | 'followers' | 'private'
  note, status: 'planned' | 'checkedin' | 'done'
  isRecruiting: boolean                     … 「一緒に滑る人募集」
  createdAt, updatedAt
```

**予定をトップレベルに置く理由**: 「自分の予定一覧（マイカレンダー）」と
「フォロー中の人の予定」を横断で引きたいため。サブコレクションだと
collectionGroup クエリが必要になり、インデックスとルールが面倒になる。

### 5.3 必要な複合インデックス
```
comments:       isDeleted ASC, createdAt DESC
plans:          resortId ASC, visibility ASC, date ASC
plans:          userId ASC, date DESC
plans:          resortId ASC, status ASC, date ASC     （チェックイン中の抽出用）
```

### 5.4 セキュリティルールの要点
- `comments`: 作成は本人（`request.auth.uid == resource.userId`）のみ。
  更新は `likesCount` 以外禁止。削除は論理削除（`isDeleted`）のみ
- `plans`: 読み取りは `visibility == 'public'` または本人。
  followers 限定はサーバー側（Functions）でのフィードファンアウトが要るので v1 は非対応
- `stats.*` のカウンタはクライアントから直接 increment させず **Functions のトリガで更新**
  （荒らしでカウンタが壊れる）
- レート制限: 同一ユーザーの連投は**クライアント側で3秒スロットル + サーバー側で1分10件**

---

## 6. ファイル構成（既存レイヤ規約に沿う）

```
src/models/resort/
  resortModels.ts            ResortModel, ConditionModel, 変換関数
  resortCommentModels.ts     ResortCommentModel, ConditionTag
  resortPlanModels.ts        ResortPlanModel, PlanVisibility

src/services/resort/
  resortService.ts           マスタ取得 / お気に入り登録 / チェックイン
  resortCommentService.ts    購読・ページング・投稿・いいね・通報
  resortPlanService.ts       予定の取得 / 作成 / 更新

src/hooks/resort/
  useResortHub.ts            ヘッダー・コンディション・お気に入り状態
  useResortComments.ts       リアルタイム購読 + 楽観的更新 + ページング
  useResortPlans.ts          日付別の予定取得

src/screens/resort/
  ResortHubScreen.tsx
  ResortPlanEditorScreen.tsx （モーダル）

src/components/resort/
  ResortHeroHeader.tsx
  ConditionSummaryCard.tsx
  ResortSegmentedTabs.tsx
  ResortCommentCell.tsx
  ResortCommentComposer.tsx
  ConditionTagChips.tsx
  ResortPlanDateStrip.tsx
  ResortPlanCell.tsx
  ResortHubSkeleton.tsx
```

`useResortComments` は `useTimeline` の構造（`posts` / `newPosts` / `hasNewPosts` /
`mergeNewPosts`）をそのまま踏襲すると学習コストがゼロになる。

---

## 7. 追加アイデア（優先度つき）

| 優先 | 機能 | ねらい | コスト |
|---|---|---|---|
| ★★★ | **コンディションタグ投票** | 実況コメントは必ず過疎る。ワンタップの参加口を作り、集計を②に還元する | 小 |
| ★★★ | **チェックイン（今ここにいる）** | 「今ゲレンデにいる人」が見えると実況が回り出す。24hで自動失効 | 小 |
| ★★☆ | **お気に入り + 新雪プッシュ通知** | 「昨夜30cm降ったよ」で再訪率が上がる。リテンションの本命 | 中（Functions） |
| ★★☆ | **一緒に滑る人募集** | 予定に `isRecruiting` を立てるだけでマッチング機能になる。他社にない | 小 |
| ★★☆ | **写真タブ** | `posts` を `resortId` で絞ってグリッド表示。既存データの再利用だけで作れる | 小 |
| ★☆☆ | **情報タブ** | リフト券・アクセス・駐車場・公式サイト・ライブカメラ | 小（データ収集が重い） |
| ★☆☆ | **混雑度 / 駐車場の投票** | 雪質投票と同じ仕組みで増設できる | 小 |
| ★☆☆ | **自分の滑走記録** | 「このゲレンデ 今季5回目」。プロフィールの実績と接続 | 中 |
| ☆☆☆ | **外部API連携（天気/積雪）** | 情報の正確性。ただしライセンスとコストの確認が先 | 大 |

### 特に議論したい2つ
1. **雪質投票** — この画面の成否はこれで決まると思っている。テキストコメントだけの
   ゲレンデ掲示板は 100% 過疎る（ユーザー数が閾値を超えるまで書き込みが発生しない）。
   ワンタップ投票なら1人でも成立し、集計値という**コンテンツが自動生成される**
2. **チェックイン** — 予定（未来）と実況（現在）を接続する唯一の導線。
   これがないと予定タブは「作って終わり」の死んだデータになる

---

## 8. リリース分割

- **v1**: ヘッダー / コンディションサマリー / 実況タブ（コメント + タグ投票）/ 予定タブ（public のみ）/ お気に入り
- **v1.5**: チェックイン / 「今いる人」/ 写真タブ / 募集フラグ
- **v2**: プッシュ通知 / followers 限定予定のフィードファンアウト / 情報タブ / 外部API

---

## 9. 未決事項（要合意）

1. **コメントと `posts` の関係** — 別コレクションで分離（本案）か、`posts` に統合してタイムラインにも流すか
2. **予定の公開範囲** — v1 は public のみで割り切るか、最初から followers 限定を作り込むか
3. **コンディションの情報源** — ユーザー投稿ベースか、外部APIか、公式サイトか
4. **ゲレンデマスタの作り方** — コンディション画面が今どこからデータを取っているか（要共有）
5. **用語統一** — `mountain` → `resort` へリネームするか
6. **想定書き込み量** — 1ゲレンデあたり1日数件か数百件か。数百件ならチャット型UIを再検討
7. **未ログインでの閲覧可否**
