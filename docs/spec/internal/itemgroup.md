# ItemGroup — 内部仕様書

**ファイル**: `js/itemgroup.js`  
**継承**: なし

## 概要

ブックマークアイテムグループ（ツリー構造の解析結果やルート、トップフォルダ等）を管理・構築するクラス。Chromeのブックマークノード要素を `Item` オブジェクトへ分類・登録する処理や、特定のフォルダから自動ルーティングによるブックマークの移動処理を起動する機能を備える。

---

## クラス定数

なし

---

## インスタンス変数

| 変数名 | 型 | 説明 |
|--------|----|------|
| `RootItems` | `Array<Item>` | システムのルートノード（`kind: 'ROOT'`）を保持する配列。 |
| `TopItems` | `Array<Item>` | ルート直下のトップレベルフォルダ（`kind: 'TOP'`、ブックマークバーなど）を保持する配列。 |

---

## メソッド

### `constructor()`

コンストラクタ。内部で管理する `RootItems` および `TopItems` を空配列で初期化する。

---

### `determine_id(id: string) -> number`

ID文字列を10進数の数値に変換する。

* **Returns**: 変換された数値。IDが `NaN`（数値でない）の場合は `-1` を返す。

---

### `add_to_itemgroup(element: Object, dumpTreeNodes: Function) -> Item|null`

ブックマークツリー要素を解析し、`Item` インスタンスとして登録・構築する。

* **処理フロー**:
  1. `new Item(element, this)` を呼び出して `Item` オブジェクトを構築する。
  2. 構築したアイテムの種別（`kind`）が `'ITEM'`（＝通常のブックマーク）である場合は、そのまま `null` を返して終了する。
  3. アイテムの種別がフォルダ（`ROOT`, `TOP`, `FOLDER`）である場合:
     * `data.addItem(item)` を呼び出し、`data` シングルトンに登録。
     * ノード要素に `children` が存在する場合、引数として渡されたダンプ関数 `dumpTreeNodes(element.children)` を再帰的に呼び出して子要素の配列を取得し、`item.children` に設定。
     * 構築された `item` オブジェクトを返す。
* **Args**:
  * `element` — 解析元のChromeブックマーク要素オブジェクト
  * `dumpTreeNodes` — 子要素を再帰的にダンプ・解析するためのコールバック関数
* **Returns**: 生成・登録された `Item` オブジェクト。アイテムがブックマーク（フォルダ以外）の場合は `null`。

---

### `moveBMXFolderBase(mover_group: Movergroup, src_folder_id: string) -> Promise<void>`

指定された移動元フォルダID（`src_folder_id`）の配下にあるブックマークアイテムを、自動ルーティングルールに基づいて移動する。

* **処理フロー**:
  1. `chrome.bookmarks.getChildren(src_folder_id)` を呼び出し、移動元のフォルダ直下にある全子ブックマーク要素を非同期で取得する。
  2. 取得した要素配列の各要素に対して、`mover_group.move(bookmarkItem)` を呼び出して自動移動処理を実行する。
* **Args**:
  * `mover_group` — 自動移動定義を保持する `Movergroup` シングルトンインスタンス
  * `src_folder_id` — 移動対象のブックマークが入っている移動元フォルダのID

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| [data](file:///E:/Cchrome-ext/bmx/js/data.js) | フォルダアイテムの登録先として `data.addItem` を使用 |
| [Item](file:///E:/Cchrome-ext/bmx/js/item.js) | 渡された要素を `Item` インスタンスに変換するために使用 |

---

## 設計上の注意

* **ブックマークアイテムの除外**:
  * `add_to_itemgroup` はフォルダノードのみを `data` へ登録し、子ノードのツリー構造を維持する役割を持つ。ブックマーク（`kind: 'ITEM'`）自身は `add_to_itemgroup` では `data` に登録されない（`Item` のコンストラクタ生成時点で `url` を持っていると `folder: false` となり登録対象から除外される）。
* **再帰処理の安全性**:
  * Chrome API から取得するツリーのネストが非常に深い場合であっても、jQuery および vanilla JS で構築された再帰的呼び出し `dumpTreeNodes` をそのまま実行する。
