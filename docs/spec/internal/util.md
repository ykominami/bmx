# Util — 内部仕様書

**ファイル**: `js/util.js`  
**継承**: なし

## 概要

拡張機能の UI コンポーネント（ボタン、セレクト）の動的構築や、日付文字列のフォーマット、URL のパース・ホスト名抽出、および履歴情報の UI 反映などの多目的な汎用処理を提供するユーティリティクラス。全てのメソッドは静的（`static`）メソッドとして実装されている。

---

## クラス定数

なし

---

## インスタンス変数

なし（静的ユーティリティクラスであるため、インスタンス変数は使用しない）

---

## メソッド

### `static getMonthx(datex: Date) -> number` (staticmethod)

指定された `Date` オブジェクトから、1始まりの月（1〜12）を取得する。

* **Returns**: 月の値（1〜12）

---

### `static adjustAsStr(num: number) -> string` (staticmethod)

数値を 2 桁の文字列に変換する（10 未満の場合は先頭に `"0"` を付与）。

* **Returns**: 2 桁に調整された文字列（例: `9` → `"09"`, `10` → `"10"`）

---

### `static makeBtnA(name: string, class_name: string, id: string) -> jQuery` (staticmethod)

HTML の `<button>` 要素を表す jQuery オブジェクトを生成する。

* **Returns**: 生成されたボタンの jQuery オブジェクト

---

### `static makeSelectA(class_name: string, id: string) -> jQuery` (staticmethod)

HTML の `<select>` 要素を表す jQuery オブジェクトを生成する。

* **Returns**: 生成されたセレクト要素の jQuery オブジェクト

---

### `static getCategoryName(i: number) -> string` (staticmethod)

インデックス番号をカテゴリの内部的な名前文字列（`"c"` + インデックス）に変換する。

* **Returns**: カテゴリ名（例: `"c0"`, `"c1"`）

---

### `static getSelectId(name: string) -> string` (staticmethod)

指定された名前に `"inp"` 接尾辞を追加して、セレクト要素用の ID 文字列を生成する。

* **Returns**: セレクトID文字列（例: `"c0inp"`）

---

### `static getBtnId(name: string) -> string` (staticmethod)

指定された名前に `"btn"` 接尾辞を追加して、ボタン要素用の ID 文字列を生成する。

* **Returns**: ボタンID文字列（例: `"c0btn"`）

---

### `static getJqueryId(id: string) -> string` (staticmethod)

ID に `"#"` 接頭辞を付与して、jQuery の ID セレクタ用文字列を生成する。

* **Returns**: jQuery ID セレクタ（例: `"#c0btn"`）

---

### `static parseURLAsync(url: string) -> Promise<URL>` (staticmethod)

URL 文字列を非同期でパースし、`URL` オブジェクトを返す。

* **Returns**: パースされた `URL` オブジェクトを解決する `Promise`

---

### `static parseURLX(url: string) -> Promise<string>` (staticmethod)

URL 文字列からホスト名（ドメイン部分）を抽出し、非同期で取得する。

* **処理フロー**:
  1. `Util.parseURLAsync(url)` を呼び出し、非同期で `URL` オブジェクトにパースする。
  2. パス完了後、`URL` の `hostname` プロパティを取り出して返す。
* **Returns**: ホスト名文字列を解決する `Promise`

---

### `static restoreSelectRecently(select: jQuery) -> void` (staticmethod)

ストレージに保存されている最近使用したフォルダの履歴データを取り出し、セレクト要素へ復元・適用する。

* **処理フロー**:
  1. `Globalx.getStorageOptions()` を呼び出し、履歴配列を取得。
  2. `Globalx.addRecentlyItemX(select, sOptions)` を呼び出して、セレクト要素に選択項目を設定。

---

### `static updateSelectRecently(ary: Array<Object>, select: jQuery) -> void` (staticmethod)

引数で渡された履歴配列の情報を基に、指定されたセレクト要素の中身を再構築する。

* **処理フロー**:
  1. `ary` の各要素（`value`, `text`）から `<option>` 要素の jQuery オブジェクトを作成。
  2. `select` の中身をクリアし、新しく作成したオプション要素を追加する。
  3. オプションが 1 件以上存在する場合は、先頭要素（インデックス 0）を選択状態にする。

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| [Globalx](file:///E:/Cchrome-ext/bmx/js/globalx.js) | 履歴情報の復元処理において `getStorageOptions` および `addRecentlyItemX` を使用するためにインポート |
| jQuery (`$`) | HTML 要素の動的生成（ボタン、セレクト、オプション等）に使用 |

---

## 設計上の注意

* **global.js からの完全移行**:
  * 履歴復元の処理で使用していたレガシーモジュールである [global.js](file:///E:/Cchrome-ext/bmx/js/global.js) の代わりに、静的クラスである [Globalx](file:///E:/Cchrome-ext/bmx/js/globalx.js) への移行が完了した。これにより技術的負債（アーキテクチャ不整合）が解消されている。
