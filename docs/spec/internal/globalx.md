# Globalx — 内部仕様書

**ファイル**: `js/globalx.js`  
**継承**: なし

## 概要

拡張機能のグローバルな設定情報および `chrome.storage.local` とのデータ永続化処理を管理するクラス。静的（`static`）なメンバ変数およびメソッドで構成され、最近使用したフォルダ履歴の登録や、カテゴリ毎に選択されたフォルダ情報のメモリ管理・保存を司る。

---

## クラス定数・静的プロパティ

| プロパティ名 | 値/型 | 説明 |
|--------------|-------|------|
| `Settings` | `Object` | グローバル設定情報を保持する静的ハッシュオブジェクト。 |
| `StorageOptions` | `'Options'` | 選択された対象フォルダの履歴一覧をストレージ保存する際のキー名。 |
| `StorageSelected` | `'Selected'` | 各カテゴリキーごとに最後に選択されたフォルダIDを保存するキー名。 |
| `StorageHiers` | `'Hiers'` | 階層パス一覧を保存するキー名。 |
| `StorageMisc` | `'Misc'` | その他の設定値を保存するキー名。 |
| `ANOTHER_FOLER` | `-1` | 「別のフォルダ」を選択したことを示すセンチネル値（定数）。 |
| `Keyvalues` | `Array<Array>` | 各ストレージキーに対するデフォルトの初期値ペアを定義する配列。 |

---

## インスタンス変数

なし（静的クラスとして機能するため、インスタンスメンバは存在しない）

---

## メソッド

### `adjustValue(val: Array|null) -> Array` (staticmethod)

値が `null` の場合に空配列を返し、それ以外の場合はそのまま値を返す。

---

### `loadSettings() -> Promise<Object>` (staticmethod)

`chrome.storage.local` から設定データを非同期でロードする。

* **Returns**: ストレージ上の `'all'` プロパティに保存されているオブジェクト。存在しない場合は空オブジェクト `{}`。

---

### `initSettings_a()` (staticmethod)

`Keyvalues` の定義に基づいて `Globalx.Settings` の初期状態をメモリ上に設定する。

---

### `initSettings_all() -> Promise<void>` (staticmethod)

ストレージから設定データをロードして `Globalx.Settings` に反映し、さらに `data` シングルトンから作成した階層ハッシュマップ情報で `Globalx.Settings` を更新する。

---

### `getSettingsByKey(assoc: Object, key: string) -> *` (staticmethod)

指定されたオブジェクトからキーに対応する値を取得する。

---

### `setSettingsByKey(assoc: Object, key: string, value: *) -> void` (staticmethod)

指定されたオブジェクトのキーに対して値を設定する。

---

### `replace_in_Settings(asoc: Object)` (staticmethod)

`Keyvalues` に定義されたキーに限り、引数 `asoc` 内に存在する値でグローバル `Globalx.Settings` の値を上書き置換する。

---

### `addStorageSelected(key: string, value: *)` (staticmethod)

`Globalx.Settings[StorageSelected]` ハッシュに対し、指定されたキーと値のペアを追加・更新する。

---

### `setStorageOptions(value: Array)` (staticmethod)

`Globalx.Settings[StorageOptions]` の履歴配列を上書き更新する。

---

### `getStorageOptions() -> Array` (staticmethod)

メモリ上の `Globalx.Settings` から対象フォルダの履歴配列を取得する。配列でない場合は空配列で初期化し、それを返す。

---

### `setStorageHiers(value: Object) -> Promise<void>` (staticmethod)

階層パス一覧をストレージに保存し、メモリ上の `Globalx.Settings` も同期する。

* **処理フロー**:
  1. `Globalx.Settings[StorageHiers]` を一時的に空オブジェクトにクリア。
  2. `chrome.storage.local.set` を使用して `Globalx.Settings` 全体をストレージに非同期保存。
  3. メモリ上の `Globalx.Settings[StorageHiers]` に `value` をセット。

---

### `storageOptionsUnshift(obj: Object) -> Promise<void>` (staticmethod)

履歴配列の先頭に新しいオブジェクトを追加し、その内容をローカルストレージへ保存する。

---

### `removeSettings() -> Promise<void>` (staticmethod)

ローカルストレージから `StorageOptions`、`StorageSelected`、および `StorageHiers` に関連する設定情報を削除する。

---

### `addRecentlyItemX(select: jQuery, sOptions: Array)` (staticmethod)

履歴データに基づいて、指定されたセレクト要素（jQuery オブジェクト）の選択項目を生成・設定する。

---

### `adjustRecentrlyFolder(value: string, text: string)` (staticmethod)

直近で使用したフォルダの履歴を調整する。既に同じ値のフォルダが履歴に存在する場合はそれを削除した上で、配列の先頭（最も新しい履歴）に再挿入する。

---

### `makeSelectOptionsData(options: Array<Object>) -> Array<jQuery>` (staticmethod)

オプションの配列から、HTMLの `<option>` 要素を表す jQuery オブジェクトの配列を生成する。

---

### `addRecentlyItem(select: jQuery, value: string|null, text: string|null)` (staticmethod)

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

* **global.js からの完全移行**:
  * 本クラスはレガシーモジュールである [global.js](file:///E:/Cchrome-ext/bmx/js/global.js) の代替として作成されたクラスである。
  * 新しいコードや修正では、レガシーである `global.js` ではなく、本 `Globalx` クラスを原則使用しなければならない。
