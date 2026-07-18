# Data — 内部仕様書

**ファイル**: `js/data.js`  
**継承**: なし

## 概要

ブックマークデータの管理および高速検索（ハッシュマップによる管理）を行うクラス。階層パス（`hier`）とID（`id`）それぞれに対応する登録アイテムオブジェクトを参照するためのハッシュマップを保持し、BMX拡張機能におけるデータストアの役割を果たす。本モジュールはシングルトンインスタンス `data` をエクスポートする。

---

## モジュールレベル定数・型

| 変数名 | 値/型 | 用途 |
|--------|-------|------|
| `data` | `Data` のインスタンス | アプリケーション全体で共有されるデータ管理のシングルトンインスタンス |

---

## クラス定数

なし

---

## インスタンス変数

| 変数名 | 型 | 説明 |
|--------|----|------|
| `ItemHashByHier` | `Object` | 階層パス文字列から `Item` オブジェクトを引くためのハッシュマップ。 |
| `ItemHash` | `Object` | ブックマーク ID から `Item` オブジェクトを引くためのハッシュマップ。 |

---

## メソッド

### `constructor()`

コンストラクタ。内部ハッシュマップ `ItemHashByHier` および `ItemHash` を空オブジェクトで初期化する。

---

### `makeItemHashX(key: string) -> Object`

特定のキーに対して、`ItemHashByHier` と `ItemHash` への参照を持つラッパーオブジェクトを生成する。

* **Returns**: `{ [key]: { ItemHashByHier, ItemHash } }` 形式のオブジェクト

---

### `dumpTreeItems(bookmarkTreeNodes: Array<Object>) -> Array<string>`

再帰的にブックマークツリーを走査し、URLを持つアイテム（ブックマーク）のID一覧を取得する。

* **処理フロー**:
  1. ツリーノード配列 `bookmarkTreeNodes` をループ処理する。
  2. ノードに `url` プロパティがある（ブックマークである）場合、その `id` を結果配列 `ary` に追加する。
  3. ノードに `children` が存在する場合、`dumpTreeItems` を再帰的に呼び出し、取得した配列を `ary` に結合する。
  4. 最終的なID一覧配列を返す。
* **Returns**: ブックマークアイテムIDの配列

---

### `dumpTreeItemsXTop(folder_id: string) -> Promise<Array<string>>`

指定されたフォルダID配下の全てのブックマークアイテムのIDを非同期でダンプする。

* **処理フロー**:
  1. `getItem(folder_id)` を呼び出し、該当するフォルダオブジェクトを取得する。
  2. `chrome.bookmarks.getSubTree(item.id)` を呼び出し、該当フォルダのサブツリーを非同期で取得する。
  3. 取得したサブツリーに対して `dumpTreeItems` を適用してブックマークIDの配列を生成し、返す。
* **Returns**: フォルダ配下の全ブックマークIDの配列

---

### `getItemByHier(key: string) -> Object|null`

階層パス文字列からアイテムオブジェクトを取得する。

* **Returns**: アイテムオブジェクト（存在しない場合は `null`）

---

### `setItemByHier(key: string, value: Object) -> Object|null`

階層パスをキーとしてアイテムを設定する。

* **Args**: 
  * `key` — 階層パス文字列
  * `value` — 設定するアイテムオブジェクト
* **Returns**: 設定されたアイテムオブジェクト。ただし、以下に示すバリデーションまたは重複チェックに該当した場合は `null`。
* **非自明な制約**:
  * `key` が `null`、空文字列、または空白のみの文字列である場合は登録を拒否し `null` を返す。
  * `ItemHashByHier` に既に同キーが登録されている場合は、サイレントに重複を無視して `null` を返す（上書きしない）。

---

### `getKeysOfItemByHier() -> Array<string>`

`ItemHashByHier` に登録されている階層パスのキー一覧を取得する。

* **Returns**: 階層パスの配列

---

### `getItemHashByHierKeys() -> Array<string>`

`getKeysOfItemByHier` の別名（エイリアス）メソッド。

* **Returns**: 階層パスの配列

---

### `getItem(key: string) -> Object|null`

IDをキーとしてアイテムオブジェクトを取得する。

* **Returns**: アイテムオブジェクト（存在しない場合は `null`）

---

### `setItem(key: string, value: Object) -> Object|null`

IDをキーとしてアイテムオブジェクトを設定する。

* **Args**:
  * `key` — アイテムID
  * `value` — 設定するアイテムオブジェクト
* **Returns**: 設定されたアイテムオブジェクト。ただし、以下に示すバリデーションまたは重複チェックに該当した場合は `null`。
* **非自明な制約**:
  * `key` が `null`、空文字列、または空白のみの文字列である場合は登録を拒否し `null` を返す。
  * `ItemHash` に既に同キーが登録されている場合は、サイレントに重複を無視して `null` を返す（上書きしない）。

---

### `addItem(item: Object) -> void`

アイテムオブジェクトをIDおよび階層パスの両方に登録する。

---

### `getBookmarkBarTopItem() -> Object|null`

ブックマークバーのルートフォルダ（IDが `'1'` のフォルダ）のアイテムオブジェクトを取得する。

* **Returns**: ルートフォルダアイテム（存在しない場合は `null`）

---

## 依存

なし

---

## 設計上の注意

* **重複キーの挙動**:
  * `setItem` および `setItemByHier` では、既存のキーに対する登録要求があった場合、上書きを行わずサイレントに `null` を返して終了する。これは意図した設計制約であり、重複登録によるデータ整合性の破壊を防ぐ。
* **起動順序依存**:
  * `PopupManager` の UI が構築される前に、このシングルトン `data` が Chrome のブックマークツリー情報で完全に初期化されている必要がある。初期化が不十分な場合、UIのドロップダウンなどの構築が正常に行われない。
