# Data — クラス内部仕様書

**ファイル**: `js/data.js`
**継承**: なし

## 概要

Chrome ブックマークツリーを解析した結果を保持するデータストアクラス。ID をキーとするハッシュ（`ItemHash`）と、階層パス文字列をキーとするハッシュ（`ItemHashByHier`）の 2 系統でアイテムを管理する。モジュール末尾で `const data = new Data();` としてインスタンス化され、`export { data }` によりアプリ全体で共有される単一シングルトンとして使われる（`js/item.js`・`js/itemgroup.js`・`js/addfolder.js`・`js/popupx.js` などが直接参照）。

---

## インスタンス変数

| 変数名 | 型 | 説明 |
|--------|----|------|
| `ItemHashByHier` | `Object<string, Item>` | 階層パス文字列（例: `/Y1/ChatGPT/0`）をキーとする Item ハッシュ |
| `ItemHash` | `Object<string, Item>` | ブックマーク ID をキーとする Item ハッシュ |

---

## メソッド

### `constructor()`

`ItemHashByHier` と `ItemHash` を空オブジェクトで初期化する。

---

### `makeItemHashX(key) -> Object`

指定キーの下に `ItemHashByHier` と `ItemHash` を格納したラッパーオブジェクトを作る。`Globalx.initSettings_all()` から `StorageHiers` キーで呼ばれ、`Globalx.Settings` にマージするために使う。

**Args**: `key` — ラッパーオブジェクトのトップレベルキー
**Returns**: `{ [key]: { ItemHashByHier, ItemHash } }` の形をしたオブジェクト

---

### `dumpTreeItemsX(bookmarkTreeNodes) -> Array<string>`

Chrome ブックマークツリーノード配列を再帰的に走査し、`url` を持つノード（ブックマークアイテム）の ID だけを配列として収集する。

「処理フロー」:
  1. 各ノードを走査し、`element.url` があれば ID を結果配列に push する
  2. `element.children` があれば再帰呼び出しした結果を結果配列に結合する
  3. すべてのノードを処理し終えたら結果配列を返す

**Args**: `bookmarkTreeNodes` — `chrome.bookmarks.getSubTree()` などが返すツリーノード配列
**Returns**: アイテム（URL 付きノード）の ID 文字列配列

---

### `async dumpTreeItemsXTop(folder_id) -> Promise<Array<string>>`

指定フォルダ ID 配下のサブツリーを Chrome から取得し、`dumpTreeItemsX()` でアイテム ID 一覧に変換する。

**Args**: `folder_id` — 起点となるフォルダの ID
**Returns**: フォルダ配下のアイテム ID 配列の Promise

---

### `getItemByHier(key) -> Object|null`

階層パスからアイテムを取得する。存在しなければ `null`。

---

### `setItemByHier(key, value) -> Object|null`

階層パスにアイテムを設定する。`key` が `null`・空文字・空白のみの場合、または既に同じキーが存在する場合は書き込まずに `null` を返す（サイレント無視）。

**Returns**: 設定に成功した場合は `value`、失敗した場合は `null`

---

### `getKeysOfItemByHier() -> Array<string>`

`ItemHashByHier` の全キー（階層パス一覧）を返す。

---

### `getItemHashByHierKeys() -> Array<string>`

`getKeysOfItemByHier()` と同一実装のエイリアスメソッド。

---

### `getItem(key) -> Object|null`

ID からアイテムを取得する。存在しなければ `null`。

---

### `setItem(key, value) -> Object|null`

ID にアイテムを設定する。`key` が `null`・空文字・空白のみの場合、または既に同じキーが存在する場合は書き込まずに `null` を返す（サイレント無視）。

---

### `addItem(item) -> void`

`item.id` と `item.hier` の両方をキーとして、`setItem()` と `setItemByHier()` を同時に呼び出す。

---

### `getBookmarkBarTopItem() -> Object|null`

ID `'1'`（Chrome のブックマークバー）に対応するアイテムを取得する。

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| `chrome.bookmarks.getSubTree` | `dumpTreeItemsXTop()` でサブツリーを取得 |

---

## 設計上の注意

- `setItem` / `setItemByHier` は重複キーを検出すると **サイレントに無視**して `null` を返す。上書きされないことを呼び出し側が意識していないと、既存アイテムが更新されないバグに繋がりやすい。
- `getItemHashByHierKeys()` は `getKeysOfItemByHier()` と完全に同一の実装を持つ重複メソッド（技術的負債）。
- `data` はモジュール読み込み時に生成されるシングルトンであり、`PopupManager.start()` の起動シーケンス（`Globalx.initSettings_a()` → `Globalx.initSettings_all()` → `loadItems1()` → `get_bookmarks()` → `make_popup_ui()`）内で `get_bookmarks()` が完了するまで空の状態である点に注意。
