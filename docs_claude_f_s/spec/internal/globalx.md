# Globalx — クラス内部仕様書

**ファイル**: `js/globalx.js`
**継承**: なし

## 概要

`chrome.storage.local` の単一キー `all` の下で、4つのサブキー（`Options`/`Selected`/`Hiers`/`Misc`）を管理するストレージ抽象化クラス。全メンバーが `static` で構成された、事実上の名前空間オブジェクト（シングルトン）。

---

## クラス定数

| 定数名 | 値 | 説明 |
|--------|----|----|
| Settings | `{}` | 実行時に構築される設定オブジェクト本体（メモリ上のキャッシュ） |
| StorageOptions | `'Options'` | 最近使用した対象フォルダ履歴のキー名 |
| StorageSelected | `'Selected'` | カテゴリキー毎の最終選択フォルダのキー名 |
| StorageHiers | `'Hiers'` | `ItemHashByHier` キー一覧のスナップショットのキー名 |
| StorageMisc | `'Misc'` | その他設定のキー名 |
| ANOTHER_FOLER | `-1` | 「別のフォルダを選ぶ」を意味するセレクトのセンチネル値（綴りは `FOLER`＝`FOLDER` のタイプミス） |
| Keyvalues | `[[StorageOptions, []], [StorageSelected, {}], [StorageHiers, {}], [StorageMisc, {}]]` | 初期化時に `Settings` へ投入するキー・初期値ペアの一覧 |

---

## メソッド

### `adjustValue(val) -> Array` (staticmethod)

`val` が `null` なら空配列、そうでなければ `val` そのものを返す正規化ヘルパー。

### `async loadSettings() -> Promise<Object>` (staticmethod)

`chrome.storage.local.get(null)` で全ストレージを読み出し、`all` キーの中身（なければ `{}`）を返す。

### `initSettings_a() -> void` (staticmethod)

`Keyvalues` の初期値を `Settings` に投入する（起動シーケンスの第1ステップ）。

### `async initSettings_all() -> Promise<void>` (staticmethod)

ストレージから読み込んだ実データと、`data.makeItemHashX(StorageHiers)` の結果の両方を `Settings` にマージする（起動シーケンスの第2ステップ）。

処理フロー:
  1. `loadSettings()` でストレージの内容を取得
  2. `data.makeItemHashX(StorageHiers)` でアイテムハッシュのラッパーを作成
  3. `replace_in_Settings()` を2回呼び、ストレージ値・アイテムハッシュの順に `Settings` へ反映

### `getSettingsByKey(assoc, key) -> *` (staticmethod)

連想配列からキーの値を取得。存在しなければ `null`。

### `setSettingsByKey(assoc, key, value) -> void` (staticmethod)

連想配列にキー・値を設定する。

### `replace_in_Settings(asoc) -> void` (staticmethod)

`Keyvalues` に定義された4キーのみ、`asoc` に値があれば `Settings` へ反映する（ホワイトリスト方式のマージ）。

### `addStorageSelected(key, value) -> void` (staticmethod)

`Settings[StorageSelected]` にキー・値を追加する。

### `setStorageOptions(value) -> void` (staticmethod)

`Settings[StorageOptions]` を直接置き換える。

### `getStorageOptions() -> Array` (staticmethod)

`Settings[StorageOptions]` を返す。配列でない場合は空配列に初期化してから返す（自己修復的フォールバック）。

### `async setStorageHiers(value) -> Promise<void>` (staticmethod)

`StorageHiers` を一旦空オブジェクトにしてストレージへ保存し、その後 `value` をメモリ上の `Settings` にセットする。

処理フロー:
  1. `Settings[StorageHiers]` を `{}` にリセット
  2. `chrome.storage.local.set({all: Settings})` で永続化（`Hiers` が空の状態で保存される）
  3. `Settings[StorageHiers] = value` でメモリ上のみ実際の値に更新

### `async storageOptionsUnshift(obj) -> Promise<void>` (staticmethod)

`Settings[StorageOptions]` の先頭に `obj` を追加し、ストレージへ保存する。

### `async removeSettings() -> Promise<void>` (staticmethod)

`StorageOptions`／`StorageSelected`／`StorageHiers` をストレージから削除する（`StorageMisc` は対象外）。

### `addRecentlyItemX(select, sOptions) -> void` (staticmethod)

渡された `sOptions` からセレクトの `<option>` を再構築する（ストレージ読み込みを伴わない版）。

### `adjustRecentrlyFolder(value, text) -> void` (staticmethod)

`getStorageOptions()` から同一 `value` の既存エントリを削除し、新エントリを `storageOptionsUnshift()` で先頭に追加する（最近使用順の並べ替え）。

### `makeSelectOptionsData(options) -> Array<jQuery>` (staticmethod)

`{value, text}` の配列から `<option>` のjQueryオブジェクト配列を作る。

### `addRecentlyItem(select, value = null, text = null) -> void` (staticmethod)

`getStorageOptions()` を取得し、`value`/`text` が指定されていれば `adjustRecentrlyFolder()` で並べ替えた上で、セレクト要素を再構築する。

処理フロー:
  1. 現在の履歴を取得
  2. `value`/`text` が両方非nullなら履歴内の並べ替えを行う
  3. 履歴から `<option>` 群を再構築してセレクトに反映
  4. `replace_in_Settings(sOptions)` を呼ぶ（下記「設計上の注意」参照）

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| `data`（js/data.js） | `initSettings_all()` で `makeItemHashX()` を呼び出す |
| `chrome.storage.local` | 設定の永続化・読み込み・削除 |
| jQuery (`$`) | `<option>` 要素の生成 |

---

## 設計上の注意

- `ANOTHER_FOLER` はスペルミス（正しくは `ANOTHER_FOLDER`）。既に `PopupManager`（[[popupx]]）から参照されているため、リネームは影響範囲の確認が必要。
- `addRecentlyItem()` 末尾の `replace_in_Settings(sOptions)` は、本来 `Keyvalues` のキー（`Options`/`Selected`/…）を持つオブジェクトを渡すべき箇所に `sOptions`（単なる配列）を渡しており、`replace_in_Settings` 内の `asoc[key]` 参照は常に `undefined` になる。実質的に何も反映されない死んだコードの可能性が高い。
- `setStorageHiers()` は一旦 `Hiers` を空にしてから保存するため、保存処理の途中でエラーが起きると `Hiers` が空のまま永続化されるリスクがある。
- `js/global.js` に完全に並行した非クラス版の実装が存在し（[[global]]参照）、コードが二重管理されている。AGENTS.md には「新規コードは `Globalx` を使うべき」と記載されているが、`js/global.js` 自体はまだ旧実装として存続している。
