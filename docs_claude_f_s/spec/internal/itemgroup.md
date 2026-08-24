# ItemGroup — クラス内部仕様書

**ファイル**: `js/itemgroup.js`
**継承**: なし

## 概要

Chromeブックマークツリーを再帰的に走査し `data.addItem()` へ登録していく走査ドライバ。ROOT/TOPアイテムのコレクション（`RootItems`/`TopItems`）も保持する（実際の追加は `Item` のコンストラクタが行う）。

---

## インスタンス変数

| 変数名 | 型 | 説明 |
|--------|----|----|
| RootItems | Array<Item> | `kind==='ROOT'` のアイテム一覧 |
| TopItems | Array<Item> | `kind==='TOP'` のアイテム一覧 |

---

## メソッド

### `determine_id(id) -> number`

文字列IDを数値に変換する。`Number.parseInt` の結果が `NaN` なら `-1` を返す。

### `add_to_itemgroup(element, dumpTreeNodes) -> Item|null`

要素から `Item` を生成し、`ITEM` 種別なら `null` を返し、それ以外（フォルダ系）なら `data.addItem()` に登録した上で子要素を再帰処理する。

処理フロー:
  1. `new Item(element, this)` でアイテムを生成
  2. `kind === 'ITEM'` なら `null` を返して終了
  3. それ以外は `data.addItem(item)` で登録
  4. `element.children.length > 0` なら `dumpTreeNodes(element.children)` の結果を `item.children` に設定
  5. 生成した `item` を返す

**Args**: `element` — ブックマーク要素、`dumpTreeNodes` — 子要素を再帰処理するコールバック関数（`PopupManager.createDumpTreeNodes()` が生成）

### `async moveBMXFolderBase(mover_group, src_folder_id) -> Promise<void>`

指定フォルダの直下の子ブックマークを取得し、各アイテムを `mover_group.move()` に渡した上で、全件の移動完了を `Promise.all()` で待機する。

**Args**: `mover_group` — `Movergroup` インスタンス、`src_folder_id` — 走査元フォルダID

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| `Item`（js/item.js） | 各ブックマーク要素から `Item` インスタンスを生成 |
| `data`（js/data.js） | `addItem()` でフォルダ系アイテムを登録 |
| `chrome.bookmarks.getChildren` | `moveBMXFolderBase()` で直下の子要素を取得 |

---

## 設計上の注意

- `moveBMXFolderBase()` はかつて `bookmarkItems.map((bookmarkItem) => { mover_group.move(bookmarkItem); })` として `move()` の戻り値を `await` せずに破棄していたが、`await Promise.all(bookmarkItems.map((bookmarkItem) => mover_group.move(bookmarkItem)))` に修正済み。全件の移動が完了してから `moveBMXFolderBase()` 自体が解決するため、呼び出し元（`PopupManager.moveBMX`/`moveBMX2`）が `.then()` で後続処理を行う場合、移動完了後に実行される。
