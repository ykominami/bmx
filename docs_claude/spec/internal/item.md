# Item — クラス内部仕様書

**ファイル**: `js/item.js`
**継承**: なし

## 概要

Chrome ブックマークノード 1 件を表現するモデルクラス。コンストラクタ内で `parentId` の数値化結果に基づき `ROOT` / `TOP` / `FOLDER` / `ITEM` のいずれかに分類し、`FOLDER` の場合は親の `hier` から自身の階層パスを組み立てる。`ItemGroup` インスタンスから `new Item(element, itemGroup)` の形で生成される。

---

## インスタンス変数

| 変数名 | 型 | 説明 |
|--------|----|------|
| `id` | `string` | ブックマーク ID |
| `idnum` | `number` | `id` を `ItemGroup.determine_id()` で数値化した値 |
| `folder` | `boolean` | フォルダかどうか（`url` を持たなければ `true`） |
| `root` | `boolean` | `ROOT`（`parentIdnum === -1`）かどうか |
| `top` | `boolean` | `TOP`（`parentIdnum === 0`）かどうか |
| `kind` | `string` | `'ROOT'` \| `'TOP'` \| `'FOLDER'` \| `'ITEM'` のいずれか |
| `parentId` | `string` | 親アイテム ID |
| `parentIdnum` | `number` | `parentId` を数値化した値 |
| `posindex` | `number` | ブックマーク内での並び順（`element.index`） |
| `url` | `string\|undefined` | URL（`ITEM` の場合のみ設定） |
| `title` | `string` | タイトル |
| `hier` | `string` | 階層パス。`ROOT`/`TOP`/`ITEM` では `''` のまま |
| `children` | `Array` | 子アイテムの配列（`ItemGroup.add_to_itemgroup()` が後から設定） |

---

## メソッド

### `constructor(element, itemGroup) -> Item`

「処理フロー」:
  1. `itemGroup.determine_id()` で `element.id` と `element.parentId` を数値化する
  2. 基本プロパティ（`id`・`idnum`・`parentId`・`parentIdnum`・`posindex`・`url`・`title` 等）を設定する
  3. `element.url` があれば `kind = 'ITEM'` として即座に return する（`hier` は組み立てない）
  4. `parentIdnum === -1` なら `kind = 'ROOT'` とし `itemGroup.RootItems` に自身を push する
  5. `parentIdnum === 0` なら `kind = 'TOP'` とし `itemGroup.TopItems` に自身を push する（`hier` は `''` のまま）
  6. それ以外は `kind = 'FOLDER'` とし、`data.getItem(this.parentId)` で親アイテムを取得できれば `parent.hier + '/' + this.title` を `hier` に設定する（取得できなければ `hier = ''`）

**Args**: `element` — `{id, parentId, index, url?, title}` 形式のブックマーク要素、`itemGroup` — 生成元の `ItemGroup` インスタンス（`RootItems`/`TopItems` への登録先）

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| `data`（js/data.js） | `FOLDER` 判定時に親アイテムを `getItem()` で取得し、`hier` を組み立てる |

---

## 設計上の注意

- `FOLDER` 分類時、親アイテムが `data` にまだ登録されていない場合（走査順序の問題等）は `hier = ''` にフォールバックし、エラーを出さずに握りつぶす。ツリー走査が親→子の順で行われることに暗黙的に依存している。
- `RootItems`・`TopItems` への登録はコンストラクタの副作用として行われており、`Item` のインスタンス化自体が `itemGroup` の状態を変更する（コンストラクタが単純な初期化に留まらない設計）。
