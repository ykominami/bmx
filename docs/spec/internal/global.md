# global.js — 内部仕様書

**ファイル**: `js/global.js`  
**型**: モジュール仕様書（クラスなし）

## 概要

拡張機能のグローバルな設定情報および `chrome.storage.local` とのデータ送受信を管理するユーティリティ関数群を提供するレガシーモジュール。

---

## モジュールレベル定数・型

| 変数名 | 値/型 | 用途 |
|--------|-------|------|
| `Settings` | `Object` | アプリケーションの動作に必要な各種設定情報・履歴データをメモリ上に保持するグローバルオブジェクト。 |
| `StorageOptions` | `'Options'` | 選択された対象フォルダの履歴一覧をストレージ保存する際のキー名。 |
| `StorageSelected` | `'Selected'` | 各カテゴリキー（`keytop`）ごとに最後に選択されたフォルダIDをストレージ保存する際のキー名。 |
| `StorageHiers` | `'Hiers'` | 階層パス一覧をストレージ保存する際のキー名。 |
| `StorageMisc` | `'Misc'` | その他の設定値をストレージ保存する際のキー名。 |
| `ANOTHER_FOLER` | `-1` | 「別のフォルダ」を選択したことを示すためのセンチネル値（定数）。 |
| `Keyvalues` | `Array<Array>` | 各ストレージキーに対するデフォルトの初期値ペアを定義する配列。 |

---

## モジュールレベル関数

### `adjustValue(val: Array|null) -> Array`

値が `null` の場合に空配列を返し、それ以外の場合はそのまま値を返す。

---

### `loadSettings() -> Promise<Object>`

`chrome.storage.local` から設定データを非同期でロードする。

* **Returns**: ストレージ上の `'all'` プロパティに保存されているオブジェクト。存在しない場合は空オブジェクト `{}`。

---

### `initSettings_a() -> void`

`Keyvalues` の定義に基づいて `Settings` の初期状態をメモリ上に設定する。

---

### `initSettings_all() -> Promise<void>`

ストレージから設定データをロードしてメモリ上の `Settings` に反映し、さらに `data` シングルトンから作成した階層ハッシュマップ情報で `Settings` を更新する。

---

### `getSettingsByKey(assoc: Object, key: string) -> *`

指定されたオブジェクトからキーに対応する値を取得する。

---

### `setSettingsByKey(assoc: Object, key: string, value: *) -> void`

指定されたオブジェクトのキーに対して値を設定する。

---

### `replace_in_Settings(asoc: Object) -> void`

`Keyvalues` に定義されたキーに限り、引数 `asoc` 内に存在する値でグローバル `Settings` の値を上書き置換する。

---

### `addStorageSelected(key: string, value: *) -> void`

`Settings[StorageSelected]` ハッシュに対し、指定されたキーと値のペアを追加・更新する。

---

### `setStorageOptions(value: Array) -> void`

`Settings[StorageOptions]` の履歴配列を上書き更新する。

---

### `getStorageOptions() -> Array`

メモリ上の `Settings` から対象フォルダの履歴配列を取得する。配列でない場合は空配列で初期化し、それを返す。

---

### `setStorageHiers(value: Object) -> Promise<void>`

階層パス一覧をストレージに保存し、メモリ上の `Settings` も同期する。

* **処理フロー**:
  1. `Settings[StorageHiers]` を一時的に空オブジェクトにクリア。
  2. `chrome.storage.local.set` を使用して `Settings` 全体をストレージに非同期保存。
  3. メモリ上の `Settings[StorageHiers]` に `value` をセット。

---

### `storageOptionsUnshift(obj: Object) -> Promise<void>`

履歴配列の先頭に新しいオブジェクトを追加し、その内容をローカルストレージへ保存する。

---

### `removeSettings() -> Promise<void>`

ローカルストレージから `StorageOptions`、`StorageSelected`、および `StorageHiers` に関連する設定情報を削除する。

---

### `addRecentlyItemX(select: jQuery, sOptions: Array) -> void`

履歴データに基づいて、指定されたセレクト要素（jQuery オブジェクト）の選択項目を生成・設定する。

---

### `adjustRecentrlyFolder(value: string, text: string) -> void`

直近で使用したフォルダの履歴を調整する。既に同じ値のフォルダが履歴に存在する場合はそれを削除した上で、配列の先頭（最も新しい履歴）に再挿入する。

---

### `makeSelectOptionsData(options: Array<Object>) -> Array<jQuery>`

オプションの配列から、HTMLの `<option>` 要素を表す jQuery オブジェクトの配列を生成する。

---

### `addRecentlyItem(select: jQuery, value: string|null, text: string|null) -> void`

現在選択されたフォルダの履歴追加および、セレクト要素の選択肢の再描画を行う。

* **処理フロー**:
  1. `value` と `text` が指定されている場合、`adjustRecentrlyFolder` を介して履歴配列を更新。
  2. セレクト要素の中身をクリアする。
  3. `makeSelectOptionsData` を用いて、履歴情報からオプション要素を生成し、セレクト要素に追加。
  4. 先頭の要素を選択状態に設定する。

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| [data](file:///E:/Cchrome-ext/bmx/js/data.js) | `initSettings_all` 時の階層ハッシュマップ生成 (`makeItemHashX`) のために使用 |
| jQuery (`$`) | HTML `<option>` 要素の動的生成および DOM 操作に使用 |

---

## 設計上の注意

* **技術的負債 (レガシーコード)**:
  * 本ファイルは、ES6クラス設計を導入した [Globalx](file:///E:/Cchrome-ext/bmx/js/globalx.js) の導入により、本来非推奨（レガシー）とされるコードである。
  * しかし、[Util](file:///E:/Cchrome-ext/bmx/js/util.js) から `addRecentlyItemX` および `getStorageOptions` が依然として本モジュールからインポートされており、完全な移行ができていない。新規コードの実装やリファクタリング時は [Globalx](file:///E:/Cchrome-ext/bmx/js/globalx.js) に置き換える必要がある。
