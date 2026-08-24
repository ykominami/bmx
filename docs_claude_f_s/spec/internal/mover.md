# Mover — クラス内部仕様書

**ファイル**: `js/mover.js`
**継承**: なし

## 概要

単一の (階層パス, ホスト名) ペアを保持し、該当ホストのブックマークを対応フォルダへ移動する実行単位。`Movergroup.add()` から1ホストにつき1インスタンス生成される。

---

## インスタンス変数

| 変数名 | 型 | 説明 |
|--------|----|----|
| hier | string | 移動先の階層パス |
| url | string | 実際にはホスト名が格納される（下記「設計上の注意」参照） |
| dest_parent_item | Item\|null | コンストラクタ時点で `data.getItemByHier(hier)` により解決される移動先フォルダアイテム |

---

## メソッド

### `constructor(hier, url)`

`hier`/`url`（実質ホスト名）を保持し、`data.getItemByHier(hier)` で移動先フォルダを即座に解決する。

### `async move(bookmarkItem) -> Promise<Object>`

`dest_parent_item` が存在すれば `chrome.bookmarks.move()` を `await` して結果を返す。存在しなければ拒否された Promise を返す。

**Args**: `bookmarkItem` — `{id}` を持つ移動対象のブックマークアイテム
**Returns**: `chrome.bookmarks.move()` の結果を解決する Promise
**Raises**: `Error("Destination parent item not found.")` — `dest_parent_item` が `null` の場合

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| `data`（js/data.js） | コンストラクタで `getItemByHier()` により移動先フォルダを解決 |
| `chrome.bookmarks.move` | 実際のブックマーク移動処理 |

---

## 設計上の注意

- `url` という変数名だが実際にはホスト名が渡される（`Movergroup.add(hier, hostname)` → `new Mover(hier, hostname)`）。命名が実体と不一致で読み手を誤解させる。
- `dest_parent_item` はコンストラクタ実行時点で一度だけ解決され、以後キャッシュされる。`data` の内容がコンストラクタ実行後に変化しても追随しない（例えば `Movergroup.get_mover_group()` 実行後に対象フォルダが作成された場合、移動は失敗し続ける）。
