# リゾートハブ画面 仕様設計（v0.2）

作成: 2026-08-28 / ステータス: **主要論点の合意済み。実装着手可**

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

- **今** = コンディション + 実況投稿（リアルタイム）
- **これから** = みんなの予定（誰がいつ行くか）

タイムラインが「人でつながる」場所なのに対して、リゾートハブは
**「場所でつながる」**場所。ここが Snower の差別化ポイントになる。

---

## 1. 決定事項（2026-08-28 合意）

| # | 論点 | 決定 |
|---|---|---|
| D1 | 実況コメントと `posts` の関係 | **`posts` に統合**。別コレクションは作らない |
| D2 | 予定の公開範囲 | **v1 は `public` のみ**をハブに表示。`followers` / `private` はハブ非表示 |
| D3 | v1 スコープの追加機能 | **コンディションタグ投票** と **写真タブ** を含める |
| D4 | チェックイン / 新雪プッシュ通知 | **v1 対象外**（v1.5 / v2 へ） |
| D5 | 天気・積雪データ | **外部API**から取得 |

### D1 に伴う必須の前提条件（これをやらないと統合は破綻する）
統合はデータの一元化という利点がある反面、そのままやると2つ壊れる。両方を v1 で必ず入れる。

1. **`postType` による分離** — `posts.postType: 'normal' | 'condition'` を追加。
   タイムラインは `postType == 'normal'` のみを表示し、リゾートハブは両方を表示する。
   これがないと、全ゲレンデの「今日パウダー！」が全ユーザーのタイムラインを埋め尽くす。
2. **ユーザー情報の非正規化コピー** — `posts` に `displayName` / `userImageUrl` を持たせる。
   現在の `timelineService.fetchPosts` は投稿1件ごとに `users` を引く N+1 になっており、
   リアルタイム購読でこれをやると更新のたびに30回の追加読み取りが走る。
   実況では**絶対に成立しない**ため、コピー方式へ移行する（`PostWithUserModel` が既にこの形）。

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
│ [ 💬 投稿する ]   [ 📅 予定を追加 ] │  ⑤ 固定アクションバー
└─────────────────────────────┘
```

### ① ヘッダー
- ヒーロー画像、ゲレンデ名、都道府県 / エリア
- ★ = **お気に入り登録**。v1 では表示の並び替えとマイページ用（通知連携は v2）
- ⋯ = 共有 / 公式サイト / マップアプリで開く / 通報

### ② コンディションサマリー
- 積雪・新雪・気温・天気・リフト稼働は**コンディション画面から渡されたスナップショットを即描画**
  （遷移直後にローディングを見せない。ナビゲーションのパラメータで受け取る）
- その下に「今日の雪質」= **ユーザー投票の集計**（§4）
- 「◯分前に更新」+ 情報ソース表記は必須（外部API利用時は出典表記が規約上の義務になることが多い）

### ③ タブ
v1 は `実況 / 予定 / 写真` の3つ。`情報` は v1.5。
1画面ロングスクロールではなく**タブ**を採用する理由:
- 実況は無限スクロール＋入力バーが要る → 他セクションと同居するとスクロール競合が起きる
- 「今日の雪どう？」と「週末誰か行く？」は**来訪目的が別**。混ぜない方が速い

---

## 3. 実況タブ

### 3.1 UX
- **最新が一番上**（`createdAt desc`）。チャット型（下が最新）ではなくフィード型
  - 理由: 要件が「最新順」であること、通りすがりの流し読みが主用途、
    未読位置の管理が不要でスクロール制御が単純になる
- 画面下部に**常設のコンポーザー**（1行入力 → フォーカスで展開）
- 送信すると**即座にリストの先頭に挿入**（送信中は淡色 + スピナー）。Firestore 応答を待たない。
  失敗時のみ「再送」に切り替え
- 新着が来たら先頭に「新着 3件」バナー（`useTimeline` の `hasNewPosts` / `mergeNewPosts` を踏襲）
  - ただし**リスト最上部にいる時は自動で流し込む**（バナーを出さない）
- 1投稿 = 最大140字 + 画像1枚（任意）+ **コンディションタグ**（§4）
- 返信は v1 では持たない（**1階層フラット**）。荒れにくく実装も軽い。❤ いいねのみ置く
- セルは `TimelinePostCell` を流用（`variant: 'resort'` でゲレンデ名バッジを省略）

### 3.2 リアルタイム設計
```ts
// 直近30件だけ購読する（全件購読しない）
postsRef
  .where('resortId', '==', resortId)
  .where('isDeleted', '==', false)
  .orderBy('createdAt', 'desc')
  .limit(30)
  .onSnapshot(...)
```
- それ以前は `startAfter` でページング取得（**購読はしない**）
- **画面から離れたら必ず detach**。Firestore の読み取り課金は購読の貼りっぱなしが一番効く
- 楽観的更新の重複排除は `clientId`（クライアント生成 UUID をドキュメントにも保存）で行う
- `postType` はハブ側では絞らない。通常投稿にゲレンデタグを付けたものも実況に混ぜてよい

### 3.3 投稿の種別
| postType | 作られる場所 | タイムライン | リゾートハブ | プロフィール |
|---|---|---|---|---|
| `normal` | 投稿タブ | 出る | `resortId` 一致なら出る | 出る |
| `condition` | リゾートハブのコンポーザー | **出ない** | 出る | 出る |

---

## 4. コンディションタグ投票（v1 採用）

コンポーザーの上にチップを並べる:

`#パウダー` `#圧雪バーン` `#アイスバーン` `#シャバ雪` `#視界不良` `#混雑` `#空いてる` `#強風`

- **タグだけタップして投稿も可能**（本文なし）→ 投稿コストがほぼゼロ
- 雪質系タグ（パウダー / 圧雪 / アイスバーン / シャバ雪）は**排他選択**、
  状況系タグ（視界不良 / 混雑 / 空いてる / 強風）は複数選択可
- 投稿と同時に、同一バッチで投票ドキュメントを **`set`（上書き）** する:
  ```
  resorts/{resortId}/conditionVotes/{userId}_{YYYYMMDD}
  ```
  ドキュメントIDに日付を含めることで**1人1日1票**が自然に担保される（連投しても票は増えない）
- 集計は当日分のみ。②のヘッダーに「今日の雪質: パウダー 68%」として還元
- 集計方法は v1 では**クライアント側集計**（当日分を `get` で取得して数える。
  1ゲレンデ1日の票数はたかが知れている）。票数が増えたら Functions での事前集計に移行

> テキスト投稿だけのゲレンデ掲示板はユーザー数が閾値を超えるまで必ず過疎る。
> ワンタップ投票なら1人でも成立し、**集計値というコンテンツが自動生成される**。

---

## 5. 予定タブ

### 5.1 UX
```
┌─────────────────────────────┐
│ 8/29  8/30  8/31  9/1  9/2  9/3 │ ← 日付ストリップ（横スクロール）
│  ●●    ●●●●   -    ●     ●●   ●  │   ドット = その日の予定人数
├─────────────────────────────┤
│ 8/30(土)  4人が行く予定             │
│  ┌───┐ かず   1泊2日・パウダー狙い    │
│  ┌───┐ みお   日帰り                │
│  ...                          │
├─────────────────────────────┤
│ + 自分の予定を追加                 │
└─────────────────────────────┘
```
- デフォルトは**直近14日**。日付ストリップで絞り込み
- 並び順: **フォロー中の人 → その他**（クライアント側で並べ替え）
- 各行からプロフィール遷移

### 5.2 公開範囲（D2）
他人の予定は実質的な**行動予告**なので、安全性の設計が本体。

- `visibility: 'public' | 'followers' | 'private'`
- **リゾートハブに出るのは `public` のみ**（1クエリで完結し、ルールも単純）
- `followers` / `private` はマイカレンダーとタイムラインにのみ出す。
  ハブ側は「公開予定だけが並ぶ掲示板」と割り切る
- 予定作成モーダルの**デフォルトは `followers`**（安全側）。
  ハブに載せたい人が明示的に `public` を選ぶ。
  「リゾートハブに表示されます」という文言をトグルの直下に必ず出す

### 5.3 v1.5 への接続点
`status: 'planned' | 'checkedin' | 'done'` のフィールドだけは **v1 の時点で定義しておく**
（マイグレーション回避）。チェックイン機能自体の実装は v1.5。

---

## 6. 写真タブ（v1 採用）

- `posts` を `resortId` で絞り、メディア付きのものだけを3列グリッド表示
- 配列の「空でない」条件は Firestore でクエリできないため、**`hasMedia: boolean` を追加**して絞る
- タップで投稿詳細へ。実況/通常の区別なく混ぜる
- 既存の投稿データの再利用だけで作れるため、統合方式（D1）の恩恵が最も出る機能

---

## 7. コンディションデータ（D5: 外部API）

### 7.1 取得経路
**クライアントから外部APIを直接叩かない**。理由:

- APIキーがアプリバイナリに埋まる（RN では実質的に秘匿できない）
- 同一ゲレンデを開いた人数ぶんリクエストが飛び、レート制限とコストが人数に比例する
- API 障害時に画面が丸ごと壊れる

**採用する経路**:
```
Cloud Functions（スケジュール実行 / 30分ごと）
    │  外部API を叩く（対象は resorts コレクション全件）
    ▼
resorts/{resortId}.condition = {
  snowDepth, newSnow, temp, weather, liftOpen, liftTotal,
  updatedAt, source, sourceUrl
}
    │
    ▼
コンディション画面 / リゾートハブ は Firestore だけを読む
```
- コストはゲレンデ数 × 48回/日 で**ユーザー数に依存しない**
- オフラインでも直前の値が出る。API 障害時は `updatedAt` が古くなるだけで画面は壊れない
- 各ゲレンデに外部APIの識別子を持たせる: `externalIds: { weather: '...', snow: '...' }`
- **出典表記**（`source` / `sourceUrl`）を②に必ず出す。多くの気象APIで規約上の義務

### 7.2 ゲレンデマスタ
外部APIは天気・積雪を返すだけで、ゲレンデの名前・位置・リフト数などは自前で持つ必要がある。
`resorts` コレクションを運営が投入する（§8.1）。初期データの作り方（手動 / 公開データ）は別途。

---

## 8. データモデル（Firestore）

### 8.1 コレクション

```
resorts/{resortId}                          … ゲレンデマスタ（運営が投入）
  name, nameKana, prefecture, area, country
  geo: { lat, lng, geohash }
  heroImageUrl, officialUrl, mapUrl
  liftCount, courseCount, elevationTop, elevationBase
  externalIds: { weather, snow }            … 外部APIの識別子
  condition: {                              … Functions が定期更新（§7.1）
    snowDepth, newSnow, temp, weather,
    liftOpen, liftTotal, updatedAt, source, sourceUrl
  }
  stats: { postsCount, upcomingPlansCount, followersCount }

resorts/{resortId}/conditionVotes/{userId}_{YYYYMMDD}   … 雪質投票（1人1日1票）
  tag, userId, date, createdAt

resorts/{resortId}/followers/{userId}       … お気に入り登録者
users/{userId}/followingResorts/{resortId}  … 逆引き

posts/{postId}                              … ★既存を拡張（D1）
  userId
  displayName, userImageUrl                 … ＋非正規化コピー（必須・§1）
  text, mediaUrls[], mediaTypes[]
  hasMedia: boolean                         … ＋写真タブ用
  resortId, resortName                      … mountainId / mountainName からリネーム
  postType: 'normal' | 'condition'          … ＋タイムライン分離用
  conditionTags: string[]                   … ＋タグ
  clientId                                  … ＋楽観的更新の重複排除
  createdAt, likesCount, commentsCount, ...  （既存フィールド）

plans/{planId}                              … 予定（トップレベル）
  userId, displayName, userImageUrl         … 非正規化コピー
  resortId, resortName
  date: 'YYYY-MM-DD', endDate?
  visibility: 'public' | 'followers' | 'private'
  note
  status: 'planned' | 'checkedin' | 'done'  … v1 は planned 固定（§5.3）
  createdAt, updatedAt
```

**予定をトップレベルに置く理由**: 「自分の予定一覧（マイカレンダー）」と
「フォロー中の人の予定」を横断で引きたいため。サブコレクションだと collectionGroup
クエリが必要になり、インデックスとルールが余計に増える。

### 8.2 必要な複合インデックス
```
posts:  resortId ASC, isDeleted ASC, createdAt DESC      （実況タブ）
posts:  resortId ASC, hasMedia ASC, createdAt DESC       （写真タブ）
posts:  postType ASC, isDeleted ASC, createdAt DESC      （タイムライン）
plans:  resortId ASC, visibility ASC, date ASC           （予定タブ）
plans:  userId ASC, date DESC                            （マイカレンダー）
```

### 8.3 セキュリティルールの要点
- `posts`: 作成は `request.auth.uid == request.resource.data.userId` のみ。
  更新は `likesCount` 等のカウンタ以外禁止。削除は論理削除（`isDeleted`）のみ
- `conditionVotes`: ドキュメントIDが `{uid}_{date}` と一致することを検証（なりすまし投票の防止）
- `plans`: 読み取りは `visibility == 'public'` または本人のみ
- `resorts`: 読み取りのみ許可。**書き込みはクライアントから一切禁止**（Functions のみ）
- `stats.*` のカウンタもクライアントから触らせず Functions のトリガで更新
- レート制限: クライアント側で3秒スロットル + サーバー側で1分10件

---

## 9. ファイル構成（既存レイヤ規約に沿う）

```
src/models/resort/
  resortModels.ts            ResortModel, ConditionModel, 変換関数
  resortPlanModels.ts        ResortPlanModel, PlanVisibility
  conditionTagModels.ts      ConditionTag 定義と集計型
src/models/post/
  postModels.ts              ★既存を拡張（postType / conditionTags / hasMedia / clientId）

src/services/resort/
  resortService.ts           マスタ取得 / お気に入り登録 / 投票の集計
  resortPostService.ts       実況の購読・ページング・投稿（posts を resortId で操作）
  resortPlanService.ts       予定の取得 / 作成 / 更新

src/hooks/resort/
  useResortHub.ts            ヘッダー・コンディション・お気に入り・雪質集計
  useResortPosts.ts          リアルタイム購読 + 楽観的更新 + ページング
  useResortPlans.ts          日付別の予定取得
  useResortPhotos.ts         写真グリッド

src/screens/resort/
  ResortHubScreen.tsx
  ResortPlanEditorScreen.tsx （モーダル）

src/components/resort/
  ResortHeroHeader.tsx
  ConditionSummaryCard.tsx
  ResortSegmentedTabs.tsx
  ResortComposer.tsx
  ConditionTagChips.tsx
  ResortPlanDateStrip.tsx
  ResortPlanCell.tsx
  ResortPhotoGrid.tsx
  ResortHubSkeleton.tsx
```

`useResortPosts` は `useTimeline` の返り値の形（`posts` / `newPosts` / `hasNewPosts` /
`mergeNewPosts` / `fetchMorePosts`）をそのまま踏襲する。学習コストがゼロになる。

---

## 10. 実装順序（v1）

1. **前提整備** — `2dc181f` のディレクトリ移動で壊れたインポートパスの修正
   （`useTimeline.ts:19`、`TimelinePostCell.tsx:29`、`TimelineScreen.tsx:31` ほか）
2. `posts` のスキーマ拡張（`postType` / `conditionTags` / `hasMedia` / `clientId` /
   `displayName` / `userImageUrl`）と `mountainId` → `resortId` のリネーム
3. `timelineService` を非正規化コピー方式へ移行（N+1 の解消）＋ `postType` フィルタ追加
4. `resorts` マスタの定義と初期データ投入
5. models / services / hooks の追加
6. `ResortHubScreen` + 実況タブ（リアルタイム + 楽観的更新）
7. コンディションタグ投票と集計表示
8. 予定タブ + 予定作成モーダル
9. 写真タブ
10. Cloud Functions（外部API定期取得）と Firestore ルール / インデックスの反映

> **2 と 3 は投稿データが少ない今のうちにやる**。後回しにするとマイグレーションが必要になる。

---

## 11. リリース分割

- **v1**: ヘッダー / コンディションサマリー / 実況タブ / タグ投票 / 予定タブ（public のみ）/ 写真タブ / お気に入り
- **v1.5**: チェックイン / 「今ゲレンデにいる人」/ 一緒に滑る人募集 / 情報タブ
- **v2**: 新雪プッシュ通知 / followers 限定予定のフィードファンアウト / 混雑度・駐車場の投票 / 自分の滑走記録

---

## 12. 残りの未決事項

1. **用語統一** — `mountainId` → `resortId` のリネームを実施してよいか（本ドラフトは実施前提）
2. **想定書き込み量** — 1ゲレンデ1日あたり数件か数百件か。数百件ならチャット型UIを再検討
3. **未ログインでの閲覧可否** — 閲覧のみ許可するなら Firestore ルールと導線が変わる
4. **利用する外部APIの具体サービス** — 料金・レート制限・出典表記義務・積雪とリフト稼働の
   カバー範囲（国内ゲレンデのリフト稼働を返すAPIは少ない。リフトはユーザー投稿で補う案もある）
5. **`resorts` 初期データの調達方法** — 手動投入か、公開データセットか
