# Util — クラス内部仕様書

**ファイル**: `js/util.js`
**継承**: なし

## 概要

日付整形・jQuery 要素生成・URL 解析・カテゴリ ID 命名規則などの雑多なユーティリティ関数を集めた static メソッド専用クラス。`js/globalx.js` の `Globalx` に依存し、最近使用フォルダ選択の復元・更新を仲介する。

---

## メソッド

### `static getMonthx(datex) -> number`

(staticmethod) `Date` オブジェクトから月を 1〜12 の範囲で取得する（`getMonth()` は 0 始まりのため +1 する）。

---

### `static adjustAsStr(num) -> string`

(staticmethod) 数値を文字列化し、10 未満なら先頭に `'0'` を付与して 2 桁にする。

---

### `static makeBtnA(name, class_name, id) -> jQuery`

(staticmethod) `<button type="button">` の jQuery オブジェクトを生成する。

---

### `static makeSelectA(class_name, id) -> jQuery`

(staticmethod) `<select>` の jQuery オブジェクトを生成する。

---

### `static getCategoryName(i) -> string`

(staticmethod) カテゴリインデックスから `"c" + i` 形式の名前を作る。

---

### `static getSelectId(name) -> string`

(staticmethod) `name + "inp"` 形式の select 要素 ID を作る。

---

### `static getBtnId(name) -> string`

(staticmethod) `name + "btn"` 形式のボタン要素 ID を作る。

---

### `static getJqueryId(id) -> string`

(staticmethod) `"#" + id` 形式の jQuery セレクタ文字列を作る。

---

### `static async parseURLAsync(url) -> Promise<URL>`

(staticmethod) `url` を `new URL(url)` でパースした結果を返す。

---

### `static parseURLX(url) -> Promise<string>`

(staticmethod) `parseURLAsync()` の結果からホスト名（`hostname`）のみを取り出す。

---

### `static restoreSelectRecently(select) -> void`

(staticmethod) `Globalx.getStorageOptions()` の内容で `Globalx.addRecentlyItemX()` を呼び、select を最近使用履歴で復元する。

---

### `static updateSelectRecently(ary, select) -> void`

(staticmethod) `ary`（`{value, text}` の配列）から `<option>` 要素を作り直して select に反映し、`ary.size > 0`（配列には存在しないプロパティ）なら先頭を選択状態にする。

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| `Globalx`（js/globalx.js） | `restoreSelectRecently()` で最近使用履歴を取得・反映 |
| jQuery (`$`) | 各種 DOM 要素・`URL` パース結果の生成 |

---

## 設計上の注意

- AGENTS.md には「`Util`（js/util.js）は依然としてレガシーな `js/global.js` から `addRecentlyItemX` と `getStorageOptions` を import している」との記述があるが、実際のソースコードでは `js/globalx.js` の `Globalx` のみを import しており、レガシーモジュールへの依存は確認できない。AGENTS.md の記述が現状のコードと乖離している（ドキュメントの陳腐化）。
- `updateSelectRecently()` 内の `opts1.size > 0` は配列 (`Array`) のプロパティとして存在しない `size`（`Map`/`Set` のプロパティ）を参照しており、常に `undefined`（falsy）と評価される。`prop('selectedIndex', 0)` の分岐が意図通りに動作していない可能性が高いバグ。
