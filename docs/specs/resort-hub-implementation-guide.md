# リゾートハブ画面 実装指示書（v1）

対象仕様: [`resort-hub.md`](./resort-hub.md) v0.6
ステータス: **未着手**（設計セッションでは実装しない）

---

## 0. 読む順番と前提

1. 先に [`resort-hub.md`](./resort-hub.md) の §1（決定事項 D1〜D11）と §7.3
   （マスタの実スキーマから来る帰結）を読む。**ここを読まずに着手すると必ず作り直しになる**
2. 本書は「何を・どのファイルに・どの順で」だけを書く。設計の根拠は仕様書側にある
3. 各タスクの **完了条件** を満たしてから次へ進む。T1〜T3 は既存機能に触るため、
   ここを飛ばして T4 以降を始めない

### 着手前に確認が必要な項目
| # | 内容 | 影響するタスク |
|---|---|---|
| 1 | コンディション画面の**距離計算ロジックのファイル位置** | T3 |
| 2 | 外部APIの具体サービス | T11 |
| 3 | 未ログイン閲覧の可否 | T11（ルール） |

---

## 1. 作業単位一覧

| ID | 内容 | 依存 | 規模 | 既存機能への影響 |
|---|---|---|---|---|
| T0 | `DocumentSnapshot.exists` の誤用修正 | — | XS | あり（バグ修正） |
| T1 | `posts` スキーマ拡張と `mountainId` → `resortId` | T0 | S | **あり（データ移行）** |
| T2 | `timelineService` の非正規化移行 | T1 | M | あり |
| T3 | 距離計算ユーティリティの共通化 | — | S | あり（コンディション画面） |
| T4 | リゾート系モデルの定義 | T1 | S | なし |
| T5 | サービス層の追加 | T4 | M | なし |
| T6 | フックの追加 | T5 | M | なし |
| T7 | ハブ画面の骨格と実況タブ | T6 | L | なし |
| T8 | コンディションタグ投票 | T7 | M | なし |
| T9 | 予定タブと予定エディタ | T6 | L | なし |
| T10 | 写真タブとヒーロー画像 | T7 | M | なし |
| T11 | Functions / ルール / インデックス | T5 | M | あり（ルール差し替え） |

**T1・T2・T3・T11 は既存画面を壊し得る。** 単独のコミットに分け、レビューを挟むこと。

---

## 2. 各タスクの指示

### T0 — `DocumentSnapshot.exists` の誤用修正

**目的**: `@react-native-firebase` v23 では `exists` はプロパティではなく**メソッド**。
プロパティとして参照しているため常に truthy になっている。

**対象**: `src/services/timeline/timelineService.ts`

| 行 | 現状 | 修正後 |
|---|---|---|
| 58 | `if (userDoc.exists)` | `if (userDoc.exists())` |
| 97 | `if (userDoc.exists)` | `if (userDoc.exists())` |
| 196 | `return likeDoc.exists;` | `return likeDoc.exists();` |
| 211 | `return bookmarkDoc.exists;` | `return bookmarkDoc.exists();` |

196 と 211 は**関数オブジェクトを返している**ため、いいね／ブックマーク判定が常に true。
全投稿が「いいね済み」で表示される実害がある。

**完了条件**: `npx tsc --noEmit` で当該4件の TS2774 / TS2322 が消えること。

**注意**: リゾートハブでも同じ Firestore 参照を書く。**新規コードを書く前に直す**
（直さないと同じ誤用がコピーされる）。

---

### T1 — `posts` スキーマ拡張と `mountainId` → `resortId`（D11 承認済み）

**目的**: 実況投稿を `posts` に統合する（D1）ための土台。

**対象**: `src/models/postModels.ts`

追加・変更するフィールド:

| フィールド | 型 | 用途 |
|---|---|---|
| `resortId` | `string?` | `mountainId` からリネーム。**必ず string**（`101001` を数値にしない） |
| `resortName` | `string?` | `mountainName` からリネーム |
| `postType` | `'normal' \| 'condition'` | タイムライン分離。既定は `'normal'` |
| `conditionTags` | `string[]` | コンディションタグ |
| `hasMedia` | `boolean` | 写真タブのクエリ用（配列の空判定はクエリできないため） |
| `clientId` | `string?` | 楽観的更新の重複排除 |
| `displayName` | `string` | 非正規化コピー |
| `userImageUrl` | `string?` | 非正規化コピー |

**やること**
1. `PostModel` に上記を追加。`mountainId` / `mountainName` は**削除**する
2. `postModelToFirestore` / `firestoreToPostModel` を追従
   - 読み込み側は移行期間中の後方互換を入れる:
     `resortId: data.resortId ?? data.mountainId ?? null`
   - 書き込み側は**新フィールドのみ**（`mountainId` を書き戻さない）
   - `postType: data.postType || 'normal'`（既存ドキュメントは normal 扱い）
   - `hasMedia: (data.mediaUrls?.length ?? 0) > 0` をフォールバックにする
3. `createTimelinePostModel` を追従
4. 既存ドキュメントの移行スクリプト（`mountainId` → `resortId`、`hasMedia` /
   `postType` の付与）を用意する。**アプリのリリース前に実行する**

**完了条件**: 型チェックが通り、既存のタイムラインが従来どおり表示される。

**落とし穴**
- `resortId` を number にしない。Firestore のドキュメントIDは文字列であり、
  数値化すると照合に失敗する
- 後方互換の読み込みは**移行スクリプト実行後に削除する**。残すと不整合の温床になる

---

### T2 — `timelineService` の非正規化移行

**目的**: 現在の `fetchPosts` は投稿1件ごとに `users` を引く N+1。実況のリアルタイム購読で
これをやると、更新のたびに30回の追加読み取りが走り成立しない。

**対象**: `src/services/timeline/timelineService.ts`

**やること**
1. `createPost` 側で `displayName` / `userImageUrl` / `hasMedia` / `postType` /
   `clientId` を**書き込み時に埋める**
2. `fetchPosts` / `observeNewPosts` から `usersRef.doc(...).get()` のループを削除し、
   投稿ドキュメントのコピーだけで `TimelinePostModel` を組み立てる
3. タイムラインのクエリに `.where('postType', '==', 'normal')` を追加
   （これが無いと全ゲレンデの実況がタイムラインを埋め尽くす）
4. `createTimelinePostModel` が `UserModel` 全体を要求している現在の形を、
   コピー済みフィールドから組める形に変更する

**完了条件**
- 投稿20件の取得で Firestore の読み取りが**1クエリ分のみ**になっていること
- タイムラインに `postType: 'condition'` の投稿が出ないこと

**落とし穴**
- 表示名やアイコンを変更した既存ユーザーの過去投稿は、コピーが古いままになる。
  これは**許容する**（SNS では一般的な割り切り）。気になるなら v2 で Functions による
  バックフィルを検討する

---

### T3 — 距離計算ユーティリティの共通化

**目的**: コンディション画面が**既に `locations` 配列の最小距離で計算している**。
リゾートハブで再実装すると、同じゲレンデの距離が画面ごとに違う値になる。

**やること**
1. コンディション画面の既存の距離計算ロジックを特定する（着手前確認 #1）
2. `src/utils/geoUtils.ts` へ切り出す。想定するインターフェース:

```ts
// 2点間の距離（km）
export const distanceKm = (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number => { /* 既存ロジックをそのまま移設する */ };

// ゲレンデまでの距離（locations 全件のうち最小。座標が無ければ undefined）
export const resortDistanceKm = (
  from: { latitude: number; longitude: number },
  resort: ResortModel,
): number | undefined => { /* locations が空配列でも落ちないこと */ };
```

3. コンディション画面を新ユーティリティの呼び出しに置き換える
4. リゾートハブは `resortDistanceKm` を呼ぶだけにする

**完了条件**: 同一ゲレンデについて、コンディション画面とリゾートハブが**同じ距離**を表示する。

**落とし穴**
- 計算式（Haversine か簡易式か）を**変えない**。既存の値が変わると検証が困難になる
- 天気APIの問い合わせとマップ起動は `locations[0]` を使う（距離だけが最小値。仕様書 §7.3(2)）

---

### T4 — リゾート系モデルの定義

**対象（新規）**
- `src/models/resort/resortModels.ts`
- `src/models/resort/resortPlanModels.ts`
- `src/models/resort/conditionTagModels.ts`

`ResortModel` の定義は仕様書 §7.2 の TypeScript 定義をそのまま使う。加えて:

```ts
// 表示可否は必ずこの関数を通す（休業中と閉業を区別しない: D10）
export const isResortVisible = (r: ResortModel): boolean =>
  r.isActive === true && r.isPermanentlyClosed !== true;
```

**落とし穴**
- フィールド名は既存マスタに**完全準拠**する。`officialURL`（`Url` ではない）、
  `area`（`prefecture` ではない）、`nameKana`
- `firestoreToResortModel` で `locations` を必ず配列にフォールバックする（`data.locations || []`）

---

### T5 — サービス層の追加

**対象（新規）**
- `src/services/resort/resortService.ts` — マスタ取得 / お気に入り / 投票の集計
- `src/services/resort/resortPostService.ts` — 実況の購読・ページング・投稿
- `src/services/resort/resortPlanService.ts` — 予定の取得 / 作成 / 更新

購読は**直近30件のみ**。それ以前は `startAfter` でページングし、購読しない:

```ts
postsRef
  .where('resortId', '==', resortId)
  .where('isDeleted', '==', false)
  .orderBy('createdAt', 'desc')
  .limit(30)
  .onSnapshot(...)
```

**落とし穴**
- `timelineService` が採用しているシングルトン + インスタンス変数の listener 管理は、
  **複数ゲレンデを同時に開くと壊れる**（`removeListener` が他画面の購読を切る）。
  リゾート系は購読ごとに unsubscribe を返す形にし、**サービス側に状態を持たせない**
- 画面を離れたら必ず detach する。購読の貼りっぱなしが読み取り課金で最も効く

---

### T6 — フックの追加

**対象（新規）**: `src/hooks/resort/` に `useResortHub` / `useResortPosts` /
`useResortPlans` / `useResortPhotos`

`useResortPosts` は `useTimeline` の返り値の形
（`posts` / `newPosts` / `hasNewPosts` / `mergeNewPosts` / `fetchMorePosts`）を**踏襲する**。

楽観的更新:
1. 送信時に `clientId` を採番し、`status: 'sending'` のローカル項目をリストの先頭へ即挿入
2. Firestore への書き込みを投げる（**応答を待たない**）
3. `onSnapshot` の到着時、同じ `clientId` のローカル項目を実データで置換
4. 失敗時のみ `status: 'failed'` にして「再送」を出す

**落とし穴**
- 自分の投稿が snapshot で戻ってきたときに**二重表示にしない**（`clientId` で必ず突合）
- リスト最上部にいるときは新着バナーを出さず自動で流し込む

---

### T7 — ハブ画面の骨格と実況タブ

**対象（新規）**: `src/screens/resort/ResortHubScreen.tsx` と `src/components/resort/` 一式
（構成は仕様書 §9）

- コンディション画面から**スナップショットをパラメータで受け取り即描画**する
  （遷移直後にローディングを出さない）
- タブは `実況 / 予定 / 写真` の3つ。`情報` は v1 では作らない
- セルは `TimelinePostCell` を流用する

**注意**: `MainTabNavigator` は現在 `useState` による手動タブ切り替えで、
スタックを持っていない。**ハブへ遷移する導線の追加は、この画面の実装より先に必要**。
`@react-navigation/stack` は導入済みなので、コンディション画面側の構成に合わせること。

---

### T8 — コンディションタグ投票

投稿と**同一バッチ**で投票ドキュメントを `set`（上書き）する:

```
resorts/{resortId}/conditionVotes/{userId}_{YYYYMMDD}
```

ドキュメントIDに日付を含めることで**1人1日1票**が自然に担保される（連投しても票は増えない）。

- 雪質系タグ（パウダー / 圧雪 / アイスバーン / シャバ雪）は**排他選択**
- 状況系タグ（視界不良 / 混雑 / 空いてる / 強風）は複数選択可
- **タグだけで本文なしの投稿を許可する**（投稿コストをゼロにするのが目的）
- 集計は当日分のみ。v1 はクライアント側集計でよい
- 日付は**端末のローカル日付**で切る。UTC で切ると夜の投稿が翌日票になる

---

### T9 — 予定タブと予定エディタ

- ハブに出すのは `visibility === 'public'` のみ（D2）
- 作成モーダルの**既定は `followers`**。トグルの直下に
  「リゾートハブに表示されます」と必ず明示する
- 日付ストリップは直近14日。並びは フォロー中 → その他
- `status` フィールドは v1 では `'planned'` 固定で**書き込むだけ**（v1.5 のチェックイン用）

**落とし穴**: 他人の予定は実質的な行動予告。公開範囲の既定値を `public` にしない。

---

### T10 — 写真タブとヒーロー画像

- 写真タブ: `resortId` + `hasMedia === true` で3列グリッド
- **ヒーロー画像は上記クエリの1件目を流用**する（マスタに画像フィールドが無いため）
- 写真が1枚も無い場合は `area` に応じたグラデーション + ゲレンデ名の大きなタイポグラフィ。
  「写真がない」ことを空白として見せない
- 元投稿へのクレジット（`@username`）をヒーロー右下に出し、タップで投稿詳細へ

---

### T11 — Functions / セキュリティルール / インデックス

**Functions（スケジュール実行・30分ごと）**
- `resorts` を全件走査し、`locations[0]` の緯度経度で外部APIを叩く
- 結果を `resortConditions/{resortId}` に書く（**マスタには絶対に書かない**）
- APIキーは Functions の環境変数に置く。**クライアントに置かない**
- 出典（`source` / `sourceUrl`）を必ず保存し、画面に表示する

**セキュリティルール**（仕様書 §8.3）
- `resorts`: 読み取りのみ。書き込みはクライアントからも Functions からも禁止
- `resortConditions` / `resortStats`: 読み取りのみ。書き込みは Functions のみ
- `conditionVotes`: ドキュメントIDが `{uid}_{date}` と一致することを検証
- `plans`: 読み取りは `visibility == 'public'` または本人のみ
- `posts`: 作成は本人のみ。更新はカウンタ系のみ。削除は論理削除のみ

**複合インデックス**（仕様書 §8.2）を忘れずに反映する。

---

## 3. コード規約

既存ファイルに倣うこと。

```ts
//
//  resortService.ts
//  Project: SnowerRN
//
//  Created by <NAME> on YYYY-MM-DD.
//  Updated by <NAME> on YYYY-MM-DD.
//
//  Description:
//  リゾートマスタの取得とお気に入り管理
//  - ...
//
```

- レイヤは `models / services / hooks / screens / components` を厳守。
  画面から Firestore を直接触らない
- サービスは `src/services/<domain>/<name>Service.ts`、
  フックは `src/hooks/<domain>/use<Name>.ts`
- エラーメッセージは `src/constants/errorCodes.ts` + `src/locales/` 経由。
  画面に日本語をハードコードしない
- **インポートは相対パスの深さに注意**。`2dc181f` で14箇所壊れた前例がある

---

## 4. やってはいけないこと

1. **マスタ（`resorts`）にフィールドを追加しない**。コンディションも統計も別コレクション
2. **距離計算を再実装しない**（T3）。既存ロジックを共通化して呼ぶ
3. **リアルタイム購読の中で `users` を引かない**（T2 の N+1 を持ち込まない）
4. **`resortId` を数値として扱わない**
5. **予定の公開範囲の既定を `public` にしない**
6. **購読を貼りっぱなしにしない**。画面を離れたら detach
7. **`locations[0]` を無条件で参照しない**。空配列を防御的にガードする
