# ItemGroup — クラス内部仕様書

**ファイル**: `js/itemgroup.js`
**継承**: なし

## 概要

`Item` の生成とツリー走査を橋渡しするクラス。`ROOT`/`TOP` 種別のアイテムをそれぞれ `RootItems`/`TopItems` 配列にまとめて保持し、`data`（`js/data.js`）への登録と、`Movergroup` によるフォルダベース移動の起点処理を担う。`js/popupx.js` の `PopupManager` が 1 インスタンス（`this.itemGroup`）を保持する。

---

## インスタンス変数

| 変数名 | 型 | 説明 |
|--------|----|------|
| `RootItems` | `Array<Item>` | `kind === 'ROOT'` の `Item` 一覧 |
| `TopItems` | `Array<Item>` | `kind === 'TOP'` の `Item` 一覧 |

---

## メソッド

### `determine_id(id) -> number`

`id` を `Number.parseInt(id, 10)` で数値化する。`NaN` になった場合は `-1` を返す。

---

### `add_to_itemgroup(element, dumpTreeNodes) -> Item|null`

「処理フロー」:
  1. `new Item(element, this)` でアイテムを生成する
  2. `kind === 'ITEM'` なら `null` を返して終了する（ブックマークアイテムは `RootItems`/`TopItems`/戻り値ツリーに含めない）
  3. それ以外（フォルダ系）は `data.addItem(item)` で登録する
  4. `element.children.length > 0` なら `dumpTreeNodes(element.children)` を呼び、結果を `item.children` に設定する
  5. `item` を返す

**Args**: `element` — ブックマークツリーノード、`dumpTreeNodes` — 子要素を再帰的にダンプする呼び出し元提供の関数（`js/popupx.js` の `createDumpTreeNodes()` が生成するクロージャ）

---

### `async moveBMXFolderBase(mover_group, src_folder_id) -> Promise<void>`

`chrome.bookmarks.getChildren(src_folder_id)` で直下の子ブックマークを取得し、それぞれについて `mover_group.move(bookmarkItem)` を呼び出す。

**Args**: `mover_group` — `Movergroup` インスタンス、`src_folder_id` — 移動元フォルダ ID

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| `data`（js/data.js） | `add_to_itemgroup()` でアイテムを登録 |
| `Item`（js/item.js） | アイテムの生成 |
| `chrome.bookmarks.getChildren` | `moveBMXFolderBase()` で子ブックマーク一覧を取得 |

---

## 設計上の注意

- `add_to_itemgroup()` は `dumpTreeNodes` 関数を引数として受け取る設計になっており、実際の再帰ロジックは呼び出し元（`PopupManager.createDumpTreeNodes()`）に委譲されている。責務分割としては `ItemGroup` 単体では完結しない構造。
- `moveBMXFolderBase()` は `mover_group.move()` の戻り値（Promise または `boolean`）を無視しており、個々の移動が成功したかどうかを呼び出し元は検知できない。
