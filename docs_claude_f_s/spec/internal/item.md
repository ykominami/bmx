# Item — クラス内部仕様書

**ファイル**: `js/item.js`
**継承**: なし

## 概要

Chromeブックマークノード1件を表現し、コンストラクタ内でノード種別（`ROOT`/`TOP`/`FOLDER`/`ITEM`）判定と階層パス（`hier`）算出まで行う値オブジェクト。生成時に `ItemGroup` の `RootItems`/`TopItems` コレクションへ自己登録する副作用を持つ。

---

## インスタンス変数

| 変数名 | 型 | 説明 |
|--------|----|----|
| id | string | ブックマークID（`element.id` そのまま） |
| idnum | number | `id` を数値化したもの（`ItemGroup.determine_id()` 経由、非数値なら `-1`） |
| folder | boolean | フォルダかどうか（`url` があれば `false`） |
| root | boolean | ROOTノードかどうか |
| top | boolean | TOPノードかどうか |
| kind | string | `'ROOT'` / `'TOP'` / `'FOLDER'` / `'ITEM'` のいずれか |
| parentId | string | 親ノードID |
| parentIdnum | number | 親IDを数値化したもの |
| posindex | number | 兄弟内での位置（`element.index`） |
| url | string\|undefined | URL（ITEMの場合のみ設定） |
| title | string | タイトル |
| hier | string | 階層パス。TOP/ROOTは `''`、FOLDERは `親のhier + '/' + title` |
| children | Array | 子アイテムの配列（`ItemGroup.add_to_itemgroup()` が後から設定） |

---

## メソッド

### `constructor(element, itemGroup) -> Item`

Chromeブックマーク要素からノード種別を判定し、`hier` を算出する。

処理フロー:
  1. `itemGroup.determine_id()` で `id`/`parentId` を数値化
  2. `element.url` があれば `kind='ITEM'` として即座に確定（`folder=false`）
  3. `parentIdnum === -1`（非数値）なら `kind='ROOT'` とし、`itemGroup.RootItems` に自身を追加
  4. `parentIdnum === 0` なら `kind='TOP'` とし、`itemGroup.TopItems` に自身を追加（`hier` は `''` のまま）
  5. それ以外は `kind='FOLDER'` とし、`data.getItem(parentId)` で親アイテムを取得して `hier = parent.hier + '/' + title` を算出

**Args**: `element` — `{id, parentId, index, url?, title}` 形式のブックマーク要素、`itemGroup` — `ItemGroup` インスタンス（`RootItems`/`TopItems`への登録先）

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| `data`（js/data.js） | FOLDER種別判定時、`getItem(parentId)` で親アイテムの `hier` を参照 |
| `ItemGroup`（js/itemgroup.js） | `determine_id()` の呼び出し、および `RootItems`/`TopItems` への自己登録先 |

---

## 設計上の注意

- コンストラクタ内で `itemGroup.RootItems.push(this)` / `itemGroup.TopItems.push(this)` という副作用を行っており、「オブジェクトを作るだけ」のはずのコンストラクタが外部コレクションを変更する（隠れた副作用）。テストや再利用の際に注意が必要。
- FOLDER種別の場合、`data.getItem(this.parentId)` が `null` を返すと `hier` が空文字列になる。これは親ノードがまだ `data` に登録されていない順序で走査された場合に起こりうるが、呼び出し元（`ItemGroup.add_to_itemgroup()`）はツリーを親から子へ深さ優先で辿るため通常は発生しない前提になっている。順序が保証されない呼び出し方をすると階層パスが破損する。
