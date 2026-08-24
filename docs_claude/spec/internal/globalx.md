# Globalx — クラス内部仕様書

**ファイル**: `js/globalx.js`
**継承**: なし

## 概要

`chrome.storage.local` を単一キー `all` の下で管理するグローバル設定ストアクラス。全メソッド・全プロパティが `static` で、インスタンス化せずクラスそのものをシングルトンとして使う。`Options`（最近使用フォルダ履歴）・`Selected`（カテゴリ別選択状態）・`Hiers`（`ItemHashByHier` のキー一覧スナップショット）・`Misc` の 4 サブキーを扱う。`js/global.js` にある同名関数群とほぼ同一のロジックを static メソッドとして再実装したもので、新規コードはこちらを使うことが望ましいとされている（`js/util.js` 参照）。

---

## クラス定数

| 定数名 | 値 | 説明 |
|--------|----|------|
| `Settings` | `{}` | 実行時に保持する設定オブジェクト本体 |
| `StorageOptions` | `'Options'` | 最近使用した対象フォルダ履歴のキー |
| `StorageSelected` | `'Selected'` | 各 keytop 毎の選択された対象フォルダのキー |
| `StorageHiers` | `'Hiers'` | 各 keytop 毎の階層パス一覧のキー |
| `StorageMisc` | `'Misc'` | その他設定のキー |
| `ANOTHER_FOLER` | `-1` | 「別のフォルダ」選択を表すセンチネル値（`ANOTHER_FOLDER` のスペルミス） |
| `Keyvalues` | `[[StorageOptions, []], [StorageSelected, {}], [StorageHiers, {}], [StorageMisc, {}]]` | 初期化用のキーとデフォルト値のペア配列 |

---

## メソッド

### `static adjustValue(val) -> Array`

`val` が `null` の場合は空配列を、それ以外はそのまま返す。

---

### `static async loadSettings() -> Promise<Object>`

`chrome.storage.local.get(null)` の結果から `all` キーの値を取り出す。存在しなければ空オブジェクトを返す。

---

### `static initSettings_a() -> void`

`Keyvalues` の内容で `Settings` の各キーをデフォルト値に初期化する。

---

### `static async initSettings_all() -> Promise<void>`

「処理フロー」:
  1. `loadSettings()` でストレージから現在の設定を読み込む
  2. `data.makeItemHashX(StorageHiers)` で `data` シングルトンのラッパーを作る
  3. `replace_in_Settings()` を 2 回呼び、ストレージ値と `ItemHashByHier` ラッパーの両方を `Settings` にマージする

---

### `static getSettingsByKey(assoc, key) -> *`

連想配列 `assoc` から `key` の値を取得する。存在しなければ `null`。

---

### `static setSettingsByKey(assoc, key, value) -> void`

連想配列 `assoc` に `key: value` を設定する。

---

### `static replace_in_Settings(asoc) -> void`

`Keyvalues` の各キーについて、`asoc` に値があれば `Settings` の対応するキーを上書きする。

---

### `static addStorageSelected(key, value) -> void`

`Settings[StorageSelected]` に `key: value` を設定する。

---

### `static setStorageOptions(value) -> void`

`Settings[StorageOptions]` を置き換える。

---

### `static getStorageOptions() -> Array`

`Settings[StorageOptions]` を取得する。配列でなければ空配列で初期化してから返す。

---

### `static async setStorageHiers(value) -> Promise<void>`

`Settings[StorageHiers]` をいったん空にしてから `chrome.storage.local.set({all: Settings})` で永続化し、その後改めて `value` を設定する（永続化データに巨大な `Hiers` を含めないための意図的な手順と見られる）。

---

### `static async storageOptionsUnshift(obj) -> Promise<void>`

`Settings[StorageOptions]` の先頭に `obj` を追加し、`chrome.storage.local.set({all: Settings})` で永続化する。

---

### `static async removeSettings() -> Promise<void>`

`chrome.storage.local.remove([StorageOptions, StorageSelected, StorageHiers])` でストレージから該当キーを削除する（`StorageMisc` は対象外）。

---

### `static addRecentlyItemX(select, sOptions) -> void`

`sOptions` から select の `<option>` 要素群を作り直し、select に反映する。

---

### `static adjustRecentrlyFolder(value, text) -> void`

「処理フロー」:
  1. `getStorageOptions()` で現在の履歴一覧を取得する
  2. `value` と一致する既存エントリがあれば `splice()` で削除する
  3. `storageOptionsUnshift({value, text})` で先頭に追加し直す

---

### `static makeSelectOptionsData(options) -> Array<jQuery>`

`options` 配列から jQuery `<option>` 要素の配列を作る。

---

### `static addRecentlyItem(select, value = null, text = null) -> void`

`value`・`text` が指定されていれば `adjustRecentrlyFolder()` で履歴を更新し、select の `<option>` 一覧を作り直す。最後に `replace_in_Settings(sOptions)` を呼ぶ（`sOptions` は配列であり `Keyvalues` の各キーを持たないため、実質的に何もマージされない呼び出しになっている）。

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| `data`（js/data.js） | `initSettings_all()` で `ItemHashByHier` ラッパーを作成 |
| `chrome.storage.local` | 設定の永続化・読込・削除 |
| jQuery (`$`) | `<option>` 要素の生成 |

---

## 設計上の注意

- `js/global.js` の同名モジュールレベル関数群とロジックがほぼ完全に重複している（技術的負債）。AGENTS.md によれば `js/util.js` は移行済みで現在は `Globalx` のみを参照しているが、`js/global.js` 自体は削除されておらず残存している。
- `ANOTHER_FOLER` は `ANOTHER_FOLDER` のスペルミスと思われるが、`js/popupx.js` 側も同じ綴りで参照しているため実害はない。
- `addRecentlyItem()` 末尾の `replace_in_Settings(sOptions)` は `sOptions`（配列）を渡しており、`Keyvalues` のキー（オブジェクトのプロパティ名）と噛み合わないため実質的に no-op になっている可能性が高い。
