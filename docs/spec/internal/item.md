# Item — 内部仕様書

**ファイル**: `js/item.js`  
**継承**: なし

## 概要

Chromeのブックマークツリーから取得された各ノード（ブックマークアイテムまたはフォルダ）を表現し、分類するクラス。アイテムの種類（`ROOT`, `TOP`, `FOLDER`, `ITEM`）を判定し、それぞれの属性（階層パス `hier` や親子関係など）を格納する。

---

## クラス定数

なし

---

## インスタンス変数

| 変数名 | 型 | 説明 |
|--------|----|------|
| `id` | `string` | ブックマーク/フォルダの一意なID。 |
| `idnum` | `number` | `id` を数値に変換した値。変換できない場合は `-1`。 |
| `folder` | `boolean` | フォルダか否かを示すフラグ（デフォルト: `true`、ブックマークアイテムの場合は `false`）。 |
| `root` | `boolean` | Chrome ブックマークシステムのルート（ID `'0'` など）であるかを示すフラグ。 |
| `top` | `boolean` | ルート直下の主要フォルダ（ブックマークバー、その他のブックマークなど）であるかを示すフラグ。 |
| `kind` | `string` | 分類種別（`'ROOT'`, `'TOP'`, `'FOLDER'`, `'ITEM'` のいずれか）。 |
| `parentId` | `string` | 親フォルダのID。 |
| `parentIdnum` | `number` | `parentId` を数値に変換した値。変換できない場合は `-1`。 |
| `posindex` | `number` | 親フォルダ内におけるこのノードの並び順（インデックス）。 |
| `url` | `string` | ブックマークのURL。フォルダの場合は `undefined`。 |
| `title` | `string` | ブックマーク/フォルダのタイトル。 |
| `hier` | `string` | 階層パス表現（例: `/0/Kindle/K-202501`）。 |
| `children` | `Array<Item>` | 子ノードを保持する配列。 |

---

## メソッド

### `constructor(element: Object, itemGroup: ItemGroup)`

コンストラクタ。渡されたブックマーク要素オブジェクトの内容を元に各プロパティを初期化し、ノードの分類（`kind`）および階層パス（`hier`）の設定を行う。

* **処理フロー**:
  1. `itemGroup.determine_id` を用いて、`element.id` および `element.parentId` を数値（`idnum`, `parentIdnum`）に変換。
  2. プロパティ `id`, `idnum`, `folder`, `root`, `top`, `parentId`, `parentIdnum`, `posindex`, `url`, `title`, `children` を初期化。
  3. `this.url` が存在する場合（ブックマークアイテムの場合）:
     * `this.folder = false`
     * `this.kind = 'ITEM'`
     * 処理を終了する（`hier` は空のままであり、親の `hier` は結合しない。ブックマークアイテム自体は `data.ItemHashByHier` には登録されないため）。
  4. `this.url` が存在しない場合（フォルダの場合）の分類:
     * `parentIdnum` が `-1` の場合:
       * `this.root = true`
       * `this.kind = 'ROOT'`
       * `itemGroup.RootItems.push(this)` に自身を追加。
     * `parentIdnum` が `0` の場合:
       * `this.top = true`
       * `this.kind = 'TOP'`
       * `itemGroup.TopItems.push(this)` に自身を追加。（`hier` は空文字列のまま）。
     * それ以外の場合（通常のフォルダ）:
       * `this.kind = 'FOLDER'`
       * `data.getItem(this.parentId)` を呼び出し親フォルダアイテムを取得。
       * 親アイテムが存在しなければ `this.hier = ''`。
       * 親アイテムが存在する場合、親の `hier` と自身の `title` を結合して階層パスを設定 (`this.hier = parent_hier + '/' + this.title`)。

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| [data](file:///E:/Cchrome-ext/bmx/js/data.js) | 親フォルダの階層パスを検索するために `data.getItem` を使用 |

---

## 設計上の注意

* **階層パス（`hier`）の設計ルール**:
  * ブックマークアイテム（`kind: 'ITEM'`）には階層パス `hier` は設定されない（空文字列のまま）。`hier` はフォルダのみが持つ。
  * `TOP` レベルのフォルダ（例: ブックマークバーなど、親IDが `0` のノード）の `hier` は空文字列 `''` のままとなる。そのため、その直接の子フォルダ（親が `TOP` レベル）の `hier` は、`parent.hier` (空文字列) + `'/'` + `title` となり、結果として `hier` は `/タイトル` (例: `/0`, `/Y1`) から始まる形になる。
* **空または無効なキーの処理**:
  * フォルダ名が重複した場合の処理や空白の場合のバリデーションは [data](file:///E:/Cchrome-ext/bmx/js/data.js) クラスで行われるため、本クラスはデータを分類し格納することに専念する。
