# Util — クラス内部仕様書

**ファイル**: `js/util.js`
**継承**: なし

## 概要

日付整形・jQuery要素生成・URL解析・セレクトUI操作など、横断的に使うヘルパーをまとめた静的メソッド専用クラス。全メソッドが `static` で、インスタンス化は想定されていない。

---

## メソッド

### `getMonthx(datex) -> number` (staticmethod)

`Date.getMonth()`（0始まり）に1を足し、1〜12の月番号に変換する。

### `adjustAsStr(num) -> string` (staticmethod)

数値を2桁文字列に変換する（10未満なら先頭を`0`埋め）。

### `makeBtnA(name, class_name, id) -> jQuery` (staticmethod)

`type="button"` の `<button>` 要素をjQueryオブジェクトとして生成する。

### `makeSelectA(class_name, id) -> jQuery` (staticmethod)

`<select>` 要素をjQueryオブジェクトとして生成する。

### `getCategoryName(i) -> string` (staticmethod)

カテゴリインデックスから `"c" + i` 形式の名前を生成する。

### `getSelectId(name) -> string` (staticmethod)

`name + "inp"` 形式のセレクトID文字列を生成する。

### `getBtnId(name) -> string` (staticmethod)

`name + "btn"` 形式のボタンID文字列を生成する。

### `getJqueryId(id) -> string` (staticmethod)

`"#" + id` 形式のjQueryセレクタ文字列を生成する。

### `async parseURLAsync(url) -> Promise<URL>` (staticmethod)

`new URL(url)` をPromiseでラップして返す。

### `parseURLX(url) -> Promise<string>` (staticmethod)

`parseURLAsync()` の結果から `hostname` のみを取り出す。

### `restoreSelectRecently(select) -> void` (staticmethod)

`Globalx.getStorageOptions()` で履歴を取得し、`Globalx.addRecentlyItemX()` でセレクトを復元する。

### `updateSelectRecently(ary, select) -> void` (staticmethod)

配列 `ary` から `<option>` 群を生成し、セレクトを再構築する。先頭要素があれば `selectedIndex` を0に設定する。

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| `Globalx`（js/globalx.js） | `restoreSelectRecently()` で履歴取得・セレクト復元に使用 |
| jQuery (`$`) | 各種UI要素の生成 |

---

## 設計上の注意

- AGENTS.md には「`Util`（js/util.js）はレガシーの `js/global.js` から `addRecentlyItemX` と `getStorageOptions` をインポートしている」と記載されているが、実際のソース（1行目 `import { Globalx } from './globalx.js';` のみ）ではこの記述と一致せず、現在は `Globalx` 経由の呼び出しに統一されている。AGENTS.md の当該記述はドキュメント陳腐化の可能性が高く、更新が必要（[[global]]も参照）。
- `parseURLAsync()` は例外を投げうる `new URL()` の呼び出しを素通しにしており、不正なURLが渡されると呼び出し元でreject処理が必要になる。`Movergroup.move()`（[[movegroup]]）など一部の呼び出し元では `.catch()` が実装されていない。
