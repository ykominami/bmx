# Data — クラス内部仕様書

**ファイル**: `js/data.js`
**継承**: なし

## 概要

ブックマークアイテムをID索引（`ItemHash`）と階層パス索引（`ItemHashByHier`）の2つのハッシュマップで保持する、アプリケーション全体の中心的なデータストア。モジュール下部でシングルトンインスタンス化され（[[data_module]]参照）、`ItemGroup`・`AddFolder`・`PopupManager` など全モジュールから共有参照される。

---

## インスタンス変数

| 変数名 | 型 | 説明 |
|--------|----|----|
| ItemHashByHier | Object<string, Item> | 階層パス（例: `/Y1/ChatGPT/0`）をキーとするアイテムのハッシュ |
| ItemHash | Object<string, Item> | ブックマークIDをキーとするアイテムのハッシュ |

---

## メソッド

### `makeItemHashX(key) -> Object`

指定キーに `ItemHashByHier` と `ItemHash` の参照をまとめたラッパーオブジェクトを作る。`Globalx.initSettings_all()` が `chrome.storage.local` への保存形式に整形する際に使われる。

**Args**: `key` — ラップ先のキー名（例: `Globalx.StorageHiers`）
**Returns**: `{ [key]: { ItemHashByHier, ItemHash } }` 形式のオブジェクト

### `dumpTreeItemsX(bookmarkTreeNodes) -> Array<string>`

ブックマークツリーノード配列を再帰的に走査し、`url` を持つ（＝ブックマークアイテムである）ノードのIDだけを配列に集める。

処理フロー:
  1. 各ノードについて `url` があればIDを結果配列に追加する
  2. `children` があれば再帰呼び出しの結果を結合する
  3. 全ノードを走査し終えたら結果配列を返す

**Args**: `bookmarkTreeNodes` — Chromeブックマークツリーノードの配列
**Returns**: アイテムIDの配列

### `async dumpTreeItemsXTop(folder_id) -> Promise<Array<string>>`

指定フォルダ配下のサブツリーを Chrome API から取得し、`dumpTreeItemsX()` でアイテムIDのみを抽出する。

**Args**: `folder_id` — 起点フォルダのID
**Returns**: アイテムIDの配列を解決する Promise

### `getItemByHier(key) -> Object|null`

階層パスからアイテムを取得する。存在しなければ `null`。

### `setItemByHier(key, value) -> Object|null`

階層パスにアイテムを登録する。`key` が `null`／空文字列／空白のみ、または既に登録済みの場合は登録せず `null` を返す（上書きしない）。

### `getKeysOfItemByHier() -> Array<string>`

`ItemHashByHier` の全キー（階層パス一覧）を返す。

### `getItemHashByHierKeys() -> Array<string>`

`getKeysOfItemByHier()` のエイリアス。同一実装が重複している。

### `getItem(key) -> Object|null`

IDからアイテムを取得する。存在しなければ `null`。

### `setItem(key, value) -> Object|null`

IDにアイテムを登録する。`setItemByHier` と同様、空キーおよび重複キーは無視される（上書きしない）。

### `addItem(item) -> void`

`setItem(item.id, item)` と `setItemByHier(item.hier, item)` をまとめて呼び出し、ID索引・階層索引の両方にアイテムを登録する。

### `getBookmarkBarTopItem() -> Object|null`

`getItem('1')` のショートカット。Chromeのブックマークバー（ID: `'1'`）のアイテムを取得する。

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| `chrome.bookmarks.getSubTree` | `dumpTreeItemsXTop()` でサブツリー取得に使用 |
| `data`（モジュールレベル定数） | このクラスをシングルトン化するインスタンス。詳細は [[data_module]] を参照 |

---

## 設計上の注意

- `setItem` / `setItemByHier` は重複キー・空キーを**エラーを投げずに無視**する仕様（AGENTS.md 記載どおり）。呼び出し側が戻り値 `null` を確認しないと、登録失敗に気づけない。
- `getKeysOfItemByHier` と `getItemHashByHierKeys` は完全に同じ実装のエイリアスであり、DRY原則の観点で重複コード。どちらか一方に統一する余地がある。
- シングルトンはモジュールスコープの `const data = new Data()` で実現されており（[[data_module]]）、明示的なリセット手段がない。テスト時のモック差し替えが難しい設計。
