# Mover — クラス内部仕様書

**ファイル**: `js/mover.js`
**継承**: なし

## 概要

単一の「移動元条件 → 移動先フォルダ」ルールを表現するクラス。生成時に `data.getItemByHier(hier)` で移動先フォルダの `Item` を解決してキャッシュし、`move()` 呼び出し時にそのキャッシュを使ってブックマークを実際に移動する。`Movergroup` から `hier`（移動先階層パス）と `hostname`（照合対象）のペアで生成される。

---

## インスタンス変数

| 変数名 | 型 | 説明 |
|--------|----|------|
| `hier` | `string` | 移動先の階層パス |
| `url` | `string` | コンストラクタの第 2 引数（実際には `Movergroup.add()` から渡される **ホスト名** が格納される） |
| `dest_parent_item` | `Object\|null` | `data.getItemByHier(hier)` で解決した移動先フォルダの `Item`（未解決時は `null`） |

---

## メソッド

### `constructor(hier, url)`

`hier`・`url` をそのまま保持し、`data.getItemByHier(hier)` の結果を `dest_parent_item` にキャッシュする。

---

### `async move(bookmarkItem) -> Promise<Object>`

`dest_parent_item` が非 `null` であれば `chrome.bookmarks.move(bookmarkItem.id, {parentId: dest_parent_item.id})` を呼び出す。`null` の場合は `Promise.reject(new Error("Destination parent item not found."))` を返す。

**Args**: `bookmarkItem` — `{id}` を持つ移動対象のブックマークアイテム
**Returns**: `chrome.bookmarks.move()` の結果を解決する Promise
**Raises**: `Error("Destination parent item not found.")` — `dest_parent_item` が未解決の場合（reject）

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| `data`（js/data.js） | コンストラクタで移動先フォルダの `Item` を解決 |
| `chrome.bookmarks.move` | `move()` で実際の移動を実行 |

---

## 設計上の注意

- コンストラクタの第 2 引数名が `url` だが、実際に `Movergroup.add(hier, hostname)` から渡される値はホスト名文字列であり、フル URL ではない。プロパティ名と実際の意味が一致しておらず紛らわしい命名になっている。
- `dest_parent_item` はコンストラクタ実行時点で 1 度だけ解決され、以降キャッシュされたまま更新されない。`data` の内容がコンストラクタ実行後に変化しても追随しない（`Movergroup.get_mover_group()` がシングルトンとして早期に構築されるため、`data` 初期化タイミングとの整合性に注意が必要）。
