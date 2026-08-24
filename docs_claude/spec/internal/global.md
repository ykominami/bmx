# Global — モジュール内部仕様書

**ファイル**: `js/global.js`

## 概要

`chrome.storage.local` を単一キー `all` の下で管理する、クラスを持たないレガシーなモジュールレベル関数群。役割・実装内容は `js/globalx.js` の `Globalx` クラス（static メソッド版）とほぼ完全に重複している。AGENTS.md によれば `js/util.js` は新しい `Globalx` への移行を終えており、新規コードは `Globalx` を使うべきとされる（このモジュールは互換性のため残存）。

---

## モジュールレベル定数・型

| 変数名 | 値/型 | 用途 |
|--------|-------|------|
| `Settings` | `{}` | 実行時に保持する設定オブジェクト本体 |
| `StorageOptions` | `'Options'` | 最近使用した対象フォルダ履歴のキー |
| `StorageSelected` | `'Selected'` | 各 keytop 毎の選択された対象フォルダのキー |
| `StorageHiers` | `'Hiers'` | 各 keytop 毎の階層パス一覧のキー |
| `StorageMisc` | `'Misc'` | その他設定のキー |
| `ANOTHER_FOLER` | `-1` | 「別のフォルダ」選択を表すセンチネル値 |
| `Keyvalues` | `[[StorageOptions, []], [StorageSelected, {}], [StorageHiers, {}], [StorageMisc, {}]]` | 初期化用のキーとデフォルト値のペア配列 |

---

## モジュールレベル関数

### `adjustValue(val) -> Array`

`val` が `null` の場合は空配列を、それ以外はそのまま返す。

---

### `async loadSettings() -> Promise<Object>`

`chrome.storage.local.get(null)` の結果から `all` キーの値を取り出す。存在しなければ空オブジェクトを返す。

---

### `initSettings_a() -> void`

`Keyvalues` の内容で `Settings` の各キーをデフォルト値に初期化する。

---

### `async initSettings_all() -> Promise<void>`

`loadSettings()` の結果と `data.makeItemHashX(StorageHiers)` の両方を `replace_in_Settings()` で `Settings` にマージする。

---

### `getSettingsByKey(assoc, key) -> *`

連想配列 `assoc` から `key` の値を取得する。存在しなければ `null`。

---

### `setSettingsByKey(assoc, key, value) -> void`

連想配列 `assoc` に `key: value` を設定する。

---

### `replace_in_Settings(asoc) -> void`

`Keyvalues` の各キーについて、`asoc` に値があれば `Settings` の対応するキーを上書きする。

---

### `addStorageSelected(key, value) -> void`

`Settings[StorageSelected]` に `key: value` を設定する。

---

### `setStorageOptions(value) -> void`

`Settings[StorageOptions]` を置き換える。

---

### `getStorageOptions() -> Array`

`Settings[StorageOptions]` を取得する。配列でなければ空配列で初期化してから返す。

---

### `async setStorageHiers(value) -> Promise<void>`

`Settings[StorageHiers]` をいったん空にしてから永続化し、その後改めて `value` を設定する。

---

### `async storageOptionsUnshift(obj) -> Promise<void>`

`Settings[StorageOptions]` の先頭に `obj` を追加し、`chrome.storage.local.set({all: Settings})` で永続化する。

---

### `async removeSettings() -> Promise<void>`

`chrome.storage.local.remove([StorageOptions, StorageSelected, StorageHiers])` で該当キーを削除する。

---

### `addRecentlyItemX(select, sOptions) -> void`

`sOptions` から select の `<option>` 要素群を作り直し、select に反映する。

---

### `adjustRecentrlyFolder(value, text) -> void`

既存の同一 `value` エントリを削除してから `storageOptionsUnshift({value, text})` で先頭に追加し直す。

---

### `makeSelectOptionsData(options) -> Array<jQuery>`

`options` 配列から jQuery `<option>` 要素の配列を作る。

---

### `addRecentlyItem(select, value = null, text = null) -> void`

`value`・`text` が指定されていれば履歴を更新し、select の `<option>` 一覧を作り直す。

---

## 設計上の注意

- 本モジュールのロジックは `js/globalx.js`（`Globalx` クラス）に static メソッドとしてほぼそのまま再実装されており、実装が二重管理になっている（技術的負債）。AGENTS.md では新規コードは `Globalx` を使うことが推奨されているが、本モジュールは削除されずに残っている。
- 唯一の呼び出し元候補として AGENTS.md は `js/util.js` を挙げているが、実際の `js/util.js`（`Util` クラス）は現在 `import { Globalx } from './globalx.js';` のみを行っており、`js/global.js` からの import は見当たらない。AGENTS.md の当該記述は現状のソースと食い違っており、本モジュールが実質的にどこからも import されていない可能性がある（要確認）。
