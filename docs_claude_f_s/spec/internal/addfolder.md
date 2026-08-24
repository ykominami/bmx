# AddFolder — クラス内部仕様書

**ファイル**: `js/addfolder.js`
**継承**: なし

## 概要

階層パス（`hier`）からブックマークフォルダを再帰的に取得または作成する機能と、月次/日次の自動フォルダ作成機能（`addFolderx`/`addDayFolderx`）を提供するクラス。`config/settings3.js` の `folderPrefixes`/`folderDayPrefixes` 設定を駆動源とする。

---

## メソッド

### `getYearAndCurrentMonthAsString() -> string`

現在日時から `YYYYMM` 形式の文字列を返す。

### `getYearAndMonthAndDayAsString() -> Array<string>`

現在日時から `[年, 年月, 年月日]`（例: `["2025", "202501", "20250107"]`）を返す。

### `registerx(key, value) -> void`

`data.setItemByHier(key, value)` と `data.setItem(value.id, value)` を両方呼び、アイテムを階層パス索引・ID索引の両方に登録する。

### `makeElement(idx, parentidx, indexx, urlx, titlex) -> Object`

Chromeブックマーク要素相当のプレーンオブジェクト `{id, parentId, index, url, title}` を作成する。

### `makeItem(element) -> Object`

`element` からアイテム相当のプレーンオブジェクトを作成する（下記「設計上の注意」参照）。

### `async makeAndRegisterBookmarkFolder(keytop, parentidx, indexx, titlex, from) -> Promise<Object>`

Chromeブックマークフォルダを作成し、`data` に登録する。

処理フロー:
  1. `chrome.bookmarks.create()` で新規フォルダを作成
  2. `makeElement()`/`makeItem()` でアイテムオブジェクトを組み立て、`hier = keytop` を設定
  3. `registerx(keytop, item)` で `data` に登録し、作成したアイテムを返す

**Args**: `from` — 呼び出し元を識別するデバッグ用の数値

### `async addFolderx() -> Promise<void>`

`config/settings3.js` の `getFoldersFromPrefixes()` が返す各親フォルダの下に、今月分のプレフィックス付きフォルダ（例: `K-202501`）を作成する。

処理フロー:
  1. `getFoldersFromPrefixes()` で対象親フォルダ一覧を取得
  2. 各親フォルダについて `getOrCreateFolder()` で親フォルダ自体を確保
  3. `getPrefix()` で得たプレフィックスと当月文字列から新フォルダ名を組み立て、`getOrCreateFolder()` で作成

### `async getOrCreateFolderWithArray(ary) -> Promise<Object>`

階層パスのセグメント配列から、末端フォルダを再帰的に取得または作成する。

処理フロー:
  1. `ary.length <= 1` ならブックマークバートップアイテムを返す
  2. `ary.length === 2` かつ `ary[0] !== ''` なら例外を投げる（ルート直下の想定形式チェック）
  3. `ary.join('/')` で階層パスを作り、既存アイテムがあればそれを返す
  4. 無ければ親セグメント配列で自身を再帰呼び出しし、`makeAndRegisterBookmarkFolder()` で末端フォルダを作成して返す

**Raises**: `Error('hier must be a non-empty string')` — 2要素配列の先頭が空文字列でない場合

### `async getOrCreateFolder(hier) -> Promise<Object>`

階層パス文字列からフォルダを取得または作成する（`getOrCreateFolderWithArray()` の文字列版エントリポイント）。

処理フロー:
  1. `hier` の型・長さを検証
  2. 既存アイテムがあればそれを返す
  3. `hier` を `/` で分割し、末尾セグメントを除いた親パスを `getOrCreateFolderWithArray()` で解決
  4. `makeAndRegisterBookmarkFolder()` で末端フォルダを作成して返す

**Raises**: `Error('hier must be a non-empty string')` — `hier` が非文字列または空文字列の場合

### `async addDayFolderx() -> Promise<void>`

`config/settings3.js` の `getFoldersFromDayPrefixes()` が返す各親フォルダの下に、`年/年月/年月日` の3階層フォルダを作成する。

処理フロー:
  1. `getFoldersFromDayPrefixes()` で対象親フォルダ一覧、`getYearAndMonthAndDayAsString()` で日付文字列群を取得
  2. 各親フォルダについて `[y_str, ym_str, ymd_str]` を順に累積パスへ連結
  3. 各階層で `getOrCreateFolder()` を呼び、`accumulator` を更新しながら3階層を作成

### `async getBookmarkTitle(nodeId) -> Promise<string>`

指定IDのブックマーク/フォルダのタイトルを取得する。

**Args**: `nodeId` — 対象ノードID
**Raises**: `Error` — `nodeId` が非文字列、またはノードが見つからない場合

### `async lstree() -> Promise<void>`

ID `'0'`〜`'3'` のタイトルをログ出力するデバッグ用メソッド。

### `async lstree_0() -> Promise<void>`

固定の階層パス（`/0/Y-DAY/Day/2025/202504/20250407`）配下のアイテムIDをログ出力するデバッグ用メソッド。

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| `Util`（js/util.js） | 月・日の文字列整形 |
| `data`（js/data.js） | フォルダの検索・登録 |
| `config/settings3.js`（`getFoldersFromPrefixes`/`getFoldersFromDayPrefixes`/`getPrefix`） | 自動フォルダ作成のルール取得 |
| `chrome.bookmarks.create` / `chrome.bookmarks.get` | 実際のフォルダ作成・タイトル取得 |

---

## 設計上の注意

- AGENTS.md には「`getBookmarkTitle()` は古いコールバック形式のChrome APIを使っており、他のコードと一貫していない」と記載されているが、実際の実装は `try/catch` を伴う `async`/`await`（Promiseベース、MV3系の他コードと同様の形式）であり、コールバック形式ではない。AGENTS.md の当該記述は現状のソースと一致しないため、更新が必要と考えられる。
- `makeItem()` は `Item`（[[item]]）と似た形のプレーンオブジェクトを生成しているが、`Item` クラスのインスタンスではなく独立した重複実装であり、`idnum`/`kind` などのフィールドが欠落しているなど構造が完全には一致しない。`data` に登録されたこのオブジェクトを `Item` 型として扱うコードがあれば不整合の原因になりうる。
- `getOrCreateFolderWithArray()`/`getOrCreateFolder()` が投げる `Error` を、呼び出し元の `addFolderx()`/`addDayFolderx()` はいずれも `try/catch` で受けていない。未処理の例外が `Promise` チェーンの外へ伝播する可能性がある。
- `console.log` によるデバッグ出力が多数（`makeAndRegisterBookmarkFolder`、`addFolderx`、`getOrCreateFolderWithArray`、`getOrCreateFolder`、`addDayFolderx` 等）残存しており、本番コードとしては望ましくない。
