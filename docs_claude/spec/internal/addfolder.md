# AddFolder — クラス内部仕様書

**ファイル**: `js/addfolder.js`
**継承**: なし

## 概要

日付ベースの階層フォルダ（月次・年月日）を Chrome ブックマーク上に作成し、`data` シングルトンへ登録するクラス。パスを `/` 区切りのセグメントに分解し、存在しない中間フォルダを再帰的に作成しながら最終的な対象フォルダを返す `getOrCreateFolder()` が中核。`config/settings3.js` の `getFoldersFromPrefixes()`/`getFoldersFromDayPrefixes()`/`getPrefix()` を使い、対象となるフォルダ群を決定する。

---

## メソッド

### `constructor()`

特に状態を持たない（コメントのみ）。

---

### `getYearAndCurrentMonthAsString() -> string`

現在日時から `"YYYYMM"` 形式の文字列を返す。

---

### `getYearAndMonthAndDayAsString() -> Array<string>`

現在日時から `[year, year+month, year+month+day]`（例: `["2025", "202501", "20250107"]`）を返す。

---

### `registerx(key, value) -> void`

`data.setItemByHier(key, value)` と `data.setItem(value.id, value)` を同時に呼び、階層パスと ID の両方でアイテムを登録する。

---

### `makeElement(idx, parentidx, indexx, urlx, titlex) -> Object`

`{id, parentId, index, url, title}` 形式のブックマーク要素オブジェクトを作る。

---

### `makeItem(element) -> Object`

`element` から `{id, folder, root, top, parentId, posindex, url, title, hier, children}` 形式のアイテムオブジェクトを作る（`js/item.js` の `Item` とは別の、プレーンオブジェクト版）。

---

### `async makeAndRegisterBookmarkFolder(keytop, parentidx, indexx, titlex, from) -> Promise<Object>`

「処理フロー」:
  1. `chrome.bookmarks.create()` で実際の Chrome ブックマークフォルダを作成する
  2. `makeElement()` で要素オブジェクトを組み立てる
  3. `makeItem()` でアイテムオブジェクトを組み立て、`hier = keytop` を設定する
  4. `registerx(keytop, item)` で `data` に登録する
  5. 作成したアイテムを返す

**Args**: `keytop` — 登録する階層パス、`parentidx` — 親フォルダ ID、`indexx` — 挿入位置、`titlex` — フォルダ名、`from` — 呼び出し元識別用のログタグ

---

### `async addFolderx() -> Promise<void>`

`getFoldersFromPrefixes()` の各親フォルダに対し、`getOrCreateFolder()` で親フォルダを解決した上で `<prefix>-<年月>` という名前の月次フォルダを `getOrCreateFolder()` で作成する。

---

### `async getOrCreateFolderWithArray(ary) -> Promise<Object>`

「処理フロー」:
  1. `ary.length <= 1` ならブックマークバートップアイテムを返す
  2. `ary.length === 2` かつ `ary[0] !== ''` なら例外を投げる。それ以外はブックマークバートップを親候補とする
  3. `ary.join('/')` で階層パスを作り、既に `data` に存在すればそれを返す
  4. 存在しなければ `ary` の末尾を除いた配列で自身を再帰呼び出しして親アイテムを解決する
  5. `makeAndRegisterBookmarkFolder()` で末尾セグメントのフォルダを作成し、`data` に登録して返す

**Args**: `ary` — 階層パスをセグメント分割した配列
**Returns**: 対象フォルダの `Item`
**Raises**: `Error('hier must be a non-empty string')` — `ary.length === 2` かつ先頭セグメントが空文字でない場合

---

### `async getOrCreateFolder(hier) -> Promise<Object>`

「処理フロー」:
  1. `hier` が非空文字列であることを検証する
  2. `data.getItemByHier(hier)` に既存アイテムがあればそれを返す
  3. `hier.split('/')` でセグメント分割し、末尾を除いた親セグメント配列を `getOrCreateFolderWithArray()` で解決する
  4. `makeAndRegisterBookmarkFolder()` で末尾セグメントのフォルダを作成して返す

**Args**: `hier` — 階層パス
**Returns**: 対象フォルダの `Item`
**Raises**: `Error('hier must be a non-empty string')` — `hier` が空文字列または非文字列の場合

---

### `async addDayFolderx() -> Promise<void>`

「処理フロー」:
  1. `getFoldersFromDayPrefixes()` で対象親フォルダ一覧を取得する
  2. `getYearAndMonthAndDayAsString()` で `[年, 年月, 年月日]` を取得する
  3. 各親フォルダについて `[年, 年月, 年月日]` を `accumulator` に順次連結しながら `getOrCreateFolder()` を呼び、`親/年/年月/年月日` の階層フォルダを作成する

---

### `async getBookmarkTitle(nodeId) -> Promise<string>`

`chrome.bookmarks.get(nodeId)` で指定 ID のブックマークノードのタイトルを取得する。

**Args**: `nodeId` — ブックマークノード ID
**Returns**: タイトル文字列
**Raises**: `Error` — `nodeId` が非文字列/空、またはノードが存在しない場合

---

### `async lstree() -> Promise<void>`

ID `'0'`〜`'3'` の各ノードのタイトルをログ出力するデバッグ用メソッド。

---

### `async lstree_0() -> Promise<void>`

固定の階層パス `/0/Y-DAY/Day/2025/202504/20250407` に対応するアイテムと、その配下のアイテム ID 一覧をログ出力するデバッグ用メソッド。

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| `Util`（js/util.js） | 日付の月・0 埋め文字列整形 |
| `data`（js/data.js） | フォルダの検索・登録 |
| `getFoldersFromDayPrefixes`/`getFoldersFromPrefixes`/`getPrefix`（config/settings3.js） | 対象フォルダ一覧・プレフィックスの取得 |

---

## 設計上の注意

- AGENTS.md は「`getBookmarkTitle()` は旧来のコールバックスタイルの Chrome API を使っており、他のコードと一貫していない」と記述しているが、実際のコードは `await chrome.bookmarks.get(nodeId)` という Promise ベース（MV3 準拠）の実装であり、記述と食い違っている（ドキュメントの陳腐化）。
- `lstree()`・`lstree_0()` はハードコードされたテスト用パスを含むデバッグ専用メソッドであり、`js/popupx.js` の `#lsbtn` からのみ呼び出される。本番機能とテスト/デバッグ機能が同一クラスに混在している。
- AGENTS.md によれば `config/settings3.js` が参照先だが、リポジトリには内容が同一の `config/settings2.js` のみが存在する可能性がある（拡張機能ロード時のエラー要因になり得る）。
