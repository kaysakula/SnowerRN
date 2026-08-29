# リゾートハブ画面 仕様設計（v0.6）

作成: 2026-08-28 / ステータス: **v1 設計確定**

> **このドキュメントの扱い**
> 本セッションの成果物は**設計書と実装指示書まで**とし、アプリコードの実装および
> スキーマ変更は行わない。実装手順は別紙
> [`resort-hub-implementation-guide.md`](./resort-hub-implementation-guide.md) を参照。

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
| D6 | ゲレンデマスタ | **登録済み（緯度経度を含む）**。新規作成はせず既存に寄せる |
| D7 | マスタの実スキーマ | 共有済み（§7.2）。フィールド名・型は既存に完全準拠する |
| D8 | コレクション名 | **`resorts`** |
| D9 | 代表座標 | **`locations[0]` が主要ポイント**。ただし**距離計算だけは配列全件の最小距離**（既存のコンディション画面の実装に合わせる） |
| D10 | 休業中・閉業ゲレンデ | **区別せず、どちらもアプリから除外する** |
| D11 | `posts.mountainId` → `resortId` | **リネーム承認**（実装は別セッション） |

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
- **問い合わせキーは登録済みの緯度経度**（D6）。多くの気象APIは `lat` / `lon` を直接受けるため、
  ゲレンデごとに外部APIの独自IDをマッピングする作業は**不要**。マスタ整備の手間がまるごと消える
  （API側が独自の観測地点IDしか受けない場合のみ `externalIds` を後付けする）
- **出典表記**（`source` / `sourceUrl`）を②に必ず出す。多くの気象APIで規約上の義務

### 7.2 ゲレンデマスタ（D6/D7: 登録済み・実スキーマ）

共有された実データ（ドキュメントID `101001`）:

```
resorts/101001
  area                  string   "北海道"
  hpAddress             string   "北海道空知郡中富良野町宮町1-41"
  isActive              boolean
  isPermanentlyClosed   boolean
  locations             array<map>
    [0] address         string   "〒071-0714 北海道空知郡中富良野町宮町１−４１"
        latitude        double
        longitude       double
  name                  string   "中富良野北星スキー場"
  nameKana              string   "なかふらのほくせいすきーじょう"
  officialURL           string   "https://h-sakudo.jp/facility/075/"
```

**このスキーマに完全準拠する。** 特に `officialURL`（`Url` ではなく `URL`）、
`area`（`prefecture` ではない）、`nameKana` の綴りをコード全体で揃える。

TypeScript 定義:

```ts
// src/models/resort/resortModels.ts
export interface ResortLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export interface ResortModel {
  id: string;                    // ドキュメントID。数値に見えるが必ず string で保持
  area: string;                  // "北海道"（都道府県相当）
  name: string;
  nameKana: string;              // 検索・かな順ソート用
  hpAddress: string;             // 公式サイト記載の住所（表記ゆれあり）
  officialURL: string;
  locations: ResortLocation[];   // 0件・複数件あり得る（§7.3）
  isActive: boolean;
  isPermanentlyClosed: boolean;  // 未設定のドキュメントがあるため undefined は false 扱い
}
```

### 7.3 実スキーマから来る設計上の帰結（重要）

#### (1) `locations` は「配列の中のマップ」— 座標での範囲クエリができない
Firestore は配列内マップのフィールドに対する不等号クエリをサポートしない。つまり
**「現在地から50km以内のゲレンデ」をサーバー側で引くことは原理的にできない**。

- v1 の距離表示は**端末側で全件計算**する（§7.4）。ゲレンデ数は数百件規模なので問題ない
- 将来これが重くなったら、代表点の `geohash` を**トップレベルの文字列フィールド**として
  追加する必要がある（配列の中に入れても永久に使えない）
- 既存のコンディション画面が既にこの端末側計算を実装しているはずなので、方式は揃っている

#### (2) 代表点と距離計算の使い分け（D9）
`locations` は複数件を持つゲレンデがあり、**0番目が主要ポイント**として登録されている。
ただし**距離だけは扱いが違う**ので混同しないこと。

| 用途 | 使う座標 | 理由 |
|---|---|---|
| **距離の計算・表示・並び替え** | **配列全件のうち最小距離** | 「一番近い入口までの距離」が正しい意味。**既存のコンディション画面が既にこの方式で実装済み** |
| 天気APIの問い合わせ | `locations[0]` | 主要ポイントの気象が代表値。全件叩くのは無駄 |
| マップアプリ起動 | `locations[0]` | 「行き方を調べる」の宛先は主要ポイントが妥当 |
| 住所表示 | `locations[0].address` | 同上 |
| チェックイン判定（v1.5） | 配列全件のうち最小距離 | 別ベースにいる人も「そこにいる」ため |

> **重要**: 距離計算はコンディション画面に**既存のロジックがあるため、絶対に再実装しない**。
> 共通ユーティリティとして切り出し、リゾートハブはそれを呼ぶだけにする（実装指示書 T3）。
> 同じ距離が2つの画面で違う値になるのが最悪のパターン。

座標を持たないゲレンデは存在しないため、UI 側に「座標なし」の分岐は作らない。
ただしマスタ追加時の事故に備え、サービス層で空配列を防御的にガードして
`undefined` を返す（画面は落とさず距離表示だけ省く）。

#### (3) 画像フィールドが存在しない → ヒーロー画像はユーザー投稿から作る
マスタに `heroImageUrl` に相当するものが無い。運営が全ゲレンデ分の写真を用意するのは非現実的。

**採用案**: ヒーロー画像 = **そのゲレンデの最新の写真付き投稿**（写真タブのクエリの1件目を流用）。

- 運営の作業がゼロで、しかも**常に最新の景色が出る**（8月に真冬の写真が出ない）
- 投稿が増えるほど画面が良くなるので、投稿の動機付けにもなる
- 写真が1枚も無い場合は、`area` に応じたグラデーション ＋ ゲレンデ名の大きなタイポグラフィ。
  「写真がない」ことを空白として見せない
- 元投稿へのクレジット（`@username`）をヒーロー右下に小さく出し、タップで投稿詳細へ

#### (4) リフト数・コース数・標高が無い
`情報タブ` は v1 では作らない判断（§2-③）のままでよい。v1.5 で作る場合の中身は
**住所・地図・公式サイトへの導線**が主体になる。リフト稼働状況も外部APIでは
まず取れないので、ユーザー投稿の `#リフト運休` タグで補う方針を検討する。

#### (5) `isActive` / `isPermanentlyClosed`（D10）
`isActive: false` は休業中、`isPermanentlyClosed: true` は閉業。
**UI 上は両者を区別せず、どちらもアプリから除外する。**

```ts
// 表示可否は1つの判定に集約する
export const isResortVisible = (r: ResortModel): boolean =>
  r.isActive === true && r.isPermanentlyClosed !== true;
```

- コンディション画面の一覧クエリは `where('isActive','==',true)` で絞り、
  `isPermanentlyClosed` は取得後にクライアント側で除外する
  （Firestore は `!=` と別フィールドの等価条件を組み合わせると
  インデックスが増えるため。除外対象は少数なので取得後の除外で足りる）
- `isPermanentlyClosed` が未設定のドキュメントがあるため、**`undefined` は `false` 扱い**
  （上記のように `!== true` で判定すれば自然に満たせる）
- 除外されたゲレンデのハブへは、一覧・検索からは到達できない。
  過去の投稿から直接遷移した場合のみ、バナー付きで**閲覧のみ**（投稿・予定は不可）

#### (6) 住所が2系統ある
`hpAddress`（公式サイト記載・半角）と `locations[].address`（郵便番号付き・全角混じり）で
表記が異なる。**表示は `locations[0].address`** を使い、`hpAddress` は使わない
（同じ住所が全角/半角で二重に存在するので、突合や重複判定には絶対に使わないこと）。

### 7.4 緯度経度があることで追加で開けるもの
| 機能 | 内容 | 時期 |
|---|---|---|
| **距離表示** | 「現在地から 142km」をヘッダーに出す。端末の位置情報のみで計算でき通信不要。**配列全件の最小距離**（既存ロジックを流用） | v1（安い） |
| **マップアプリ起動** | ⋯メニューから座標で Apple/Google マップを開く | v1 |
| **近くのゲレンデ** | 全件を端末側で距離計算。サーバー側の範囲クエリは §7.3(1) の理由で不可 | v1.5 |
| **チェックインの真正性** | 端末位置と配列全件の最小距離で検証。判定半径は広めに取る（滑走中は登録地点から数km離れる） | v1.5 |
| **投稿のゲレンデ自動推定** | `posts.latitude/longitude` は既に存在する。最寄りを推定して `resortId` の初期選択にする | v2 |

`geohash` は v1 では**不要**。必要になるのは全件走査が重くなってからで、
その時はトップレベルの文字列フィールドとして追加する（§7.3(1)）。

## 8. データモデル（Firestore）

### 8.1 コレクション

```
resorts/{resortId}                          … ★既存。§7.2 の実スキーマ。アプリからは読み取り専用
  area, name, nameKana, hpAddress, officialURL,
  locations[], isActive, isPermanentlyClosed
  ※ 既存フィールドは一切変更しない。追加もしない（下記 resortConditions に分離）

resortConditions/{resortId}                 … ＋新規。Functions が定期更新（§7.1）
  snowDepth, newSnow, temp, weather
  liftOpen, liftTotal
  updatedAt, source, sourceUrl

resortStats/{resortId}                      … ＋新規。Functions がトリガ更新
  postsCount, upcomingPlansCount, followersCount, lastPostAt

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
- **問い合わせキーは登録済みの緯度経度**（D6）。多くの気象APIは `lat` / `lon` を直接受けるため、
  ゲレンデごとに外部APIの独自IDをマッピングする作業は**不要**。マスタ整備の手間がまるごと消える
  （API側が独自の観測地点IDしか受けない場合のみ `externalIds` を後付けする）
- **出典表記**（`source` / `sourceUrl`）を②に必ず出す。多くの気象APIで規約上の義務

### 7.2 ゲレンデマスタ（D6/D7: 登録済み・実スキーマ）

共有された実データ（ドキュメントID `101001`）:

```
resorts/101001
  area                  string   "北海道"
  hpAddress             string   "北海道空知郡中富良野町宮町1-41"
  isActive              boolean
  isPermanentlyClosed   boolean
  locations             array<map>
    [0] address         string   "〒071-0714 北海道空知郡中富良野町宮町１−４１"
        latitude        double
        longitude       double
  name                  string   "中富良野北星スキー場"
  nameKana              string   "なかふらのほくせいすきーじょう"
  officialURL           string   "https://h-sakudo.jp/facility/075/"
```

**このスキーマに完全準拠する。** 特に `officialURL`（`Url` ではなく `URL`）、
`area`（`prefecture` ではない）、`nameKana` の綴りをコード全体で揃える。

TypeScript 定義:

```ts
// src/models/resort/resortModels.ts
export interface ResortLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export interface ResortModel {
  id: string;                    // ドキュメントID。数値に見えるが必ず string で保持
  area: string;                  // "北海道"（都道府県相当）
  name: string;
  nameKana: string;              // 検索・かな順ソート用
  hpAddress: string;             // 公式サイト記載の住所（表記ゆれあり）
  officialURL: string;
  locations: ResortLocation[];   // 0件・複数件あり得る（§7.3）
  isActive: boolean;
  isPermanentlyClosed: boolean;  // 未設定のドキュメントがあるため undefined は false 扱い
}
```

### 7.3 実スキーマから来る設計上の帰結（重要）

#### (1) `locations` は「配列の中のマップ」— 座標での範囲クエリができない
Firestore は配列内マップのフィールドに対する不等号クエリをサポートしない。つまり
**「現在地から50km以内のゲレンデ」をサーバー側で引くことは原理的にできない**。

- v1 の距離表示は**端末側で全件計算**する（§7.4 で既に採用済みの方針。追加コストなし）
- 将来「近くのゲレンデ」を本格的にやるなら、代表点の `geohash` を**トップレベルの
  文字列フィールド**として別途持たせる必要がある（配列の中に入れても使えない）
- 代表点の扱い: **`locations[0]` を代表点**とする。天気APIの問い合わせもここを使う

#### (2) 1ゲレンデが複数の座標を持ち得る
`locations` が配列である以上、複数ベース（山麓が離れている大型ゲレンデ）を想定した設計。

- **距離表示** = `locations` 全件のうち**最小の距離**を採る（「一番近い入口までの距離」が正しい意味）
- **必ず空配列をガードする**。`locations[0]` を無条件参照するとマスタ次第でクラッシュする。
  座標が無いゲレンデは距離表示とマップ導線を出さない（画面自体は成立させる）

#### (3) 画像フィールドが存在しない → ヒーロー画像はユーザー投稿から作る
マスタに `heroImageUrl` に相当するものが無い。運営が全ゲレンデ分の写真を用意するのは非現実的。

**採用案**: ヒーロー画像 = **そのゲレンデの最新の写真付き投稿**（写真タブのクエリの1件目を流用）。

- 運営の作業がゼロで、しかも**常に最新の景色が出る**（8月に真冬の写真が出ない）
- 投稿が増えるほど画面が良くなるので、投稿の動機付けにもなる
- 写真が1枚も無い場合は、`area` に応じたグラデーション ＋ ゲレンデ名の大きなタイポグラフィ。
  「写真がない」ことを空白として見せない
- 元投稿へのクレジット（`@username`）をヒーロー右下に小さく出し、タップで投稿詳細へ

#### (4) リフト数・コース数・標高が無い
`情報タブ` は v1 では作らない判断（§2-③）のままでよい。v1.5 で作る場合の中身は
**住所・地図・公式サイトへの導線**が主体になる。リフト稼働状況も外部APIでは
まず取れないので、ユーザー投稿の `#リフト運休` タグで補う方針を検討する。

#### (5) `isActive` / `isPermanentlyClosed` のUI挙動
| 状態 | コンディション画面 | リゾートハブ | 投稿・予定 |
|---|---|---|---|
| `isActive: true` | 出す | 通常表示 | 可 |
| `isActive: false` | 出さない | 「今シーズンは営業情報がありません」バナー付きで閲覧可 | 不可（コンポーザー非表示） |
| `isPermanentlyClosed: true` | 出さない | 「閉鎖されたゲレンデです」バナー付きで**閲覧のみ** | 不可 |

- 過去の投稿と写真は残す（アーカイブとして価値がある）。ハブへの直リンクは常に開ける
- `isPermanentlyClosed` が未設定のドキュメントがあるため、**`undefined` は `false` として扱う**
- コンディション画面の一覧クエリは `where('isActive','==',true)` で絞る想定

#### (6) 住所が2系統ある
`hpAddress`（公式サイト記載・半角）と `locations[].address`（郵便番号付き・全角混じり）で
表記が異なる。**表示は `locations[0].address`** を使い、`hpAddress` は使わない
（同じ住所が全角/半角で二重に存在するので、突合や重複判定には絶対に使わないこと）。

### 7.4 緯度経度があることで追加で開けるもの
| 機能 | 内容 | 時期 |
|---|---|---|
| **距離表示** | 「現在地から 142km」をヘッダーに出す。端末の位置情報のみで計算でき通信不要。**配列全件の最小距離**（既存ロジックを流用） | v1（安い） |
| **マップアプリ起動** | ⋯メニューから座標で Apple/Google マップを開く | v1 |
| **近くのゲレンデ** | 全件を端末側で距離計算。サーバー側の範囲クエリは §7.3(1) の理由で不可 | v1.5 |
| **チェックインの真正性** | 端末位置と配列全件の最小距離で検証。判定半径は広めに取る（滑走中は登録地点から数km離れる） | v1.5 |
| **投稿のゲレンデ自動推定** | `posts.latitude/longitude` は既に存在する。最寄りを推定して `resortId` の初期選択にする | v2 |

`geohash` は v1 では**不要**。必要になるのは全件走査が重くなってからで、
その時はトップレベルの文字列フィールドとして追加する（§7.3(1)）。

## 8. データモデル（Firestore）

### 8.1 コレクション

```
resorts/{resortId}                          … ★ゲレンデマスタ【登録済み】
  name, nameKana, prefecture, area, country   … 既存（要フィールド名確認）
  geo（緯度経度）                              … 既存。形式は要確認（GeoPoint か lat/lng か）
  heroImageUrl, officialUrl, mapUrl, liftCount, courseCount, elevation...
                                              … 既存にあれば流用、無ければ v1.5 で追加
  condition: {                              … ＋Functions が定期更新（§7.1）
    snowDepth, newSnow, temp, weather,
    liftOpen, liftTotal, updatedAt, source, sourceUrl
  }

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

**マスタに `condition` を埋め込まず別コレクションに分ける理由**:
マスタは運営が管理する静的データで滅多に変わらないのに対し、コンディションは30分ごとに
書き換わる。同居させると (a)「マスタはクライアントから一切書き込み禁止」という単純な
ルールが書けなくなる、(b) マスタを購読している画面が30分ごとに再描画で叩き起こされる、
(c) コンディション一覧を引くときにマスタの全フィールドが付いてくる。
ハブのヘッダーは読み取りが1回増えるが、そもそも遷移元から値を受け取って即描画する設計
（§2-②）なので体感には出ない。

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
resorts: isActive ASC, area ASC                           （コンディション画面の一覧）
```

### 8.3 セキュリティルールの要点
- `posts`: 作成は `request.auth.uid == request.resource.data.userId` のみ。
  更新は `likesCount` 等のカウンタ以外禁止。削除は論理削除（`isDeleted`）のみ
- `conditionVotes`: ドキュメントIDが `{uid}_{date}` と一致することを検証（なりすまし投票の防止）
- `plans`: 読み取りは `visibility == 'public'` または本人のみ
- **`resorts`（マスタ）**: 読み取りのみ許可。**書き込みはクライアントからも Functions からも禁止**
  （運営のみ。別コレクションに分けたことでこのルールが単純に書ける）
- `resortConditions` / `resortStats`: 読み取りのみ許可。書き込みは Functions のみ
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

## 10. 実装

手順・対象ファイル・完了条件は別紙にまとめた。

→ **[`resort-hub-implementation-guide.md`](./resort-hub-implementation-guide.md)**

本セッションでは実装は行わない。

## 11. リリース分割

- **v1**: ヘッダー / コンディションサマリー / 実況タブ / タグ投票 / 予定タブ（public のみ）/ 写真タブ / お気に入り
- **v1.5**: チェックイン / 「今ゲレンデにいる人」/ 一緒に滑る人募集 / 情報タブ
- **v2**: 新雪プッシュ通知 / followers 限定予定のフィードファンアウト / 混雑度・駐車場の投票 / 自分の滑走記録

---

## 12. 残りの未決事項

1. **既存の距離計算ロジックの所在** — コンディション画面のどのファイルにあるか。
   共通ユーティリティへの切り出し方（実装指示書 T3）を確定するために必要
2. **利用する外部APIの具体サービス** — 料金・レート制限・出典表記義務・積雪のカバー範囲。
   リフト稼働は取得できない前提で、ユーザー投稿タグで補う方針の可否
3. **想定書き込み量** — 1ゲレンデ1日あたり数件か数百件か。数百件ならチャット型UIを再検討
4. **未ログインでの閲覧可否**

### 解決済み
- コレクション名（`resorts`）/ 実スキーマ / 代表座標 / 休業・閉業の扱い
- `posts.mountainId` → `resortId` のリネーム（D11: 承認済み）
