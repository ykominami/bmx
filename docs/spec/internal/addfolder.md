# AddFolder — 内部仕様書

**ファイル**: `js/addfolder.js`  
**継承**: なし

## 概要

ブックマークフォルダの追加および管理を担うクラス。日付ベースのフォルダ階層（年/年月/年月日）の自動作成や、プレフィックス情報に基づいた月次フォルダ（例: `K-202501`）の自動作成といったフォルダ構築機能を提供する。

---

## クラス定数

なし

---

## インスタンス変数

なし

---

## メソッド

### `constructor()`

コンストラクタ。特別な初期化処理は行わない。

---

### `getYearAndCurrentMonthAsString() -> string`

現在の年と現在の月を組み合わせた文字列（`YYYYMM` 形式）を取得する。

* **処理フロー**:
  1. 現在の `Date` オブジェクトを取得。
  2. `Date` オブジェクトから年を取得。
  3. `Util.getMonthx` と `Util.adjustAsStr` を用いて、現在の月を 2 桁の文字列にする。
  4. 年と月を結合した文字列を返す。
* **Returns**: 年と現在の月の文字列（例: `"202501"`）

---

### `getYearAndMonthAndDayAsString() -> Array<string>`

現在の年、月、日をそれぞれ文字列化した配列を取得する。

* **Returns**: `[年, 年月, 年月日]` の配列（例: `["2025", "202501", "20250107"]`）

---

### `registerx(key: string, value: Object) -> void`

新しく作成したフォルダアイテムを `data` シングルトンに登録する。

* **Args**: 
  * `key` — 階層パス
  * `value` — アイテムオブジェクト

---

### `makeElement(idx: string, parentidx: string|null, indexx: number, urlx: string|null, titlex: string) -> Object`

ブックマークの要素オブジェクトを作成する。

* **Returns**: 作成されたブックマーク要素オブジェクト

---

### `makeItem(element: Object) -> Object`

要素オブジェクトから、内部で扱うフォルダのアイテムオブジェクト（`Item` に類似する構造）を作成する。

* **Returns**: フォルダのアイテムオブジェクト

---

### `makeAndRegisterBookmarkFolder(keytop: string, parentidx: string|null, indexx: number, titlex: string, from: number) -> Promise<Object>`

Chrome API を呼び出してブックマークフォルダを新規作成し、`data` シングルトンに登録する。

* **処理フロー**:
  1. 親IDが `null` でなければ文字列に変換し、作成元情報（`from`）を含めてログに出力。
  2. `chrome.bookmarks.create` を用いて、非同期で Chrome のブックマークツリーにフォルダを作成。
  3. `makeElement` および `makeItem` を呼び出して内部管理用のアイテムオブジェクトを構築。
  4. `registerx` を呼び出して、作成されたアイテムを階層パスおよびIDで登録。
* **Returns**: 作成・登録されたアイテムオブジェクト

---

### `addFolderx() -> Promise<void>`

プレフィックスを持つ各親フォルダの下に、当月のフォルダ（例: `K-202501`）を自動作成する。

* **処理フロー**:
  1. `getFoldersFromPrefixes()` よりプレフィックス対象フォルダの一覧を取得。
  2. `getYearAndCurrentMonthAsString()` より当月の年月文字列を取得。
  3. 各フォルダに対し、`getOrCreateFolder` で親フォルダを作成・取得。
  4. 親フォルダが存在する場合、プレフィックスと年月を結合したタイトル（例: `K-202501`）を生成。
  5. 結合した階層パスで `getOrCreateFolder` を呼び出し、当月フォルダを作成する。

---

### `getOrCreateFolderWithArray(ary: Array<string>) -> Promise<Object>`

配列で表現されたフォルダ階層パスから、再帰的にフォルダを作成または取得する。

* **処理フロー**:
  1. 配列 `ary` の長さが 1 以下の場合は、ブックマークバーのトップアイテムを返す。
  2. 配列の長さが 2 で、最初の要素が空文字列の場合、親アイテムとしてブックマークバーのトップアイテムを設定する。
  3. 配列要素を `/` で結合した階層パスを取得し、すでに `data.getItemByHier` に登録されていればそのアイテムを返す。
  4. 登録されていない場合、配列の末尾を除いた `parent_array` を用いて自分自身を再帰的に呼び出し、親フォルダを取得。
  5. 親フォルダのIDおよび現在の配列末尾の値をタイトルとし、`makeAndRegisterBookmarkFolder` を用いてフォルダを新規作成して返す。
* **Returns**: 取得または新規作成されたフォルダアイテムオブジェクト

---

### `getOrCreateFolder(hier: string) -> Promise<Object>`

階層パス文字列から、フォルダを取得または作成する。

* **処理フロー**:
  1. 引数 `hier` が空文字列または文字列でない場合は例外をスロー。
  2. `data.getItemByHier(hier)` を呼び出し、既に存在すればそのアイテムを返す。
  3. パス `hier` を `/` で分割し、セグメント配列を作成。
  4. 末尾を除くセグメント配列を用いて `getOrCreateFolderWithArray` を呼び出し、親フォルダを取得。
  5. `makeAndRegisterBookmarkFolder` を用いて、指定された階層パスのフォルダを新規作成して返す。
* **Returns**: 取得または新規作成されたフォルダアイテムオブジェクト
* **Raises**: `Error` — `hier` が空文字列または無効なデータ型である場合。

---

### `addDayFolderx() -> Promise<void>`

日付ベースのプレフィックスフォルダの下に、`年/年月/年月日` 形式のフォルダ階層を自動作成する。

* **処理フロー**:
  1. `getFoldersFromDayPrefixes()` より、日付フォルダを構築するルートパス一覧を取得。
  2. `getYearAndMonthAndDayAsString()` より、現在の年、年月、年月日の配列を取得。
  3. 各ルートパスの下に、年、年月、年月日の順番で階層パスを結合しながら、順次 `getOrCreateFolder` を呼び出してフォルダを作成・取得する。

---

### `getBookmarkTitle(nodeId: string) -> Promise<string>`

指定されたノードIDのブックマーク/フォルダのタイトルを非同期で取得する。

* **処理フロー**:
  1. 引数 `nodeId` が無効（空文字、または文字列以外）の場合は例外をスロー。
  2. `await chrome.bookmarks.get(nodeId)` を呼び出し、非同期でノード情報を取得（Promiseを処理）。
  3. 取得したノード配列が空、または存在しない場合は例外をスロー。
  4. 取得した最初のノードのタイトル（`nodes[0].title`）を返す。
* **Returns**: ブックマーク/フォルダのタイトル
* **Raises**: `Error` — `nodeId` が無効、ノードが見つからない、または取得時にエラーが発生した場合。

---

### `lstree() -> Promise<void>`

テスト用のメソッド。ブックマークの特定ID（0, 1, 2, 3）のタイトルを取得し、コンソールに表示する。

---

### `lstree_0() -> Promise<void>`

テスト用のメソッド。特定の階層パス（`/0/Y-DAY/Day/2025/202504/20250407`）の下のブックマークツリーをダンプし、コンソールに表示する。

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| [Util](file:///E:/Cchrome-ext/bmx/js/util.js) | 日付のフォーマット処理（`getMonthx`, `adjustAsStr`）に使用 |
| [data](file:///E:/Cchrome-ext/bmx/js/data.js) | ブックマーク情報の検索・登録、およびルートフォルダの取得に使用 |
| `config/settings3.js` | プレフィックス情報や日付フォルダのルート定義を取得するために使用（`getFoldersFromPrefixes`, `getFoldersFromDayPrefixes`, `getPrefix`） |

---

## 設計上の注意

* **Promise スタイル (Manifest V3) への統一**:
  * `getBookmarkTitle` で使用されていたコールバックベースの古い Chrome API スタイルは、Promise（`async/await`）スタイルに移行された。これにより、他の Chrome API 呼び出しと同様の一貫した非同期処理設計となっている。
* **データ競合・状態不整合の回避**:
  * フォルダを動的に作成する際、`data.addItem` への登録処理が同期的に行われる。事前に `data` シングルトンが十分に構築されている必要がある。
