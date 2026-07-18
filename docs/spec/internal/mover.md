# Mover — 内部仕様書

**ファイル**: `js/mover.js`  
**継承**: なし

## 概要

ブックマークの自動移動ルールにおける個々の「移動処理（ムーバー）」を表現するクラス。移動先の階層パスに対応する実フォルダ情報（ID等）を事前に取得し、合致したブックマークを実際に Chrome API を介して移動させる役割を担う。

---

## クラス定数

なし

---

## インスタンス変数

| 変数名 | 型 | 説明 |
|--------|----|------|
| `hier` | `string` | 移動先フォルダの階層パス。 |
| `url` | `string` | 対象のホスト名（※コンストラクタ引数名は `url` だが、実際はホスト名が格納される）。 |
| `dest_parent_item` | `Item` or `null` | 階層パスに対応する移動先の親フォルダオブジェクト。起動時に `data` から取得される。 |

---

## メソッド

### `constructor(hier: string, url: string)`

コンストラクタ。引数で指定された階層パスおよびホスト名を設定し、`data` から対応する移動先フォルダアイテムを取得する。

* **処理フロー**:
  1. `this.hier` に `hier`、`this.url` に `url` を設定。
  2. `data.getItemByHier(this.hier)` を呼び出し、移動先フォルダアイテムを取得して `this.dest_parent_item` に設定する。

---

### `move(bookmarkItem: Object) -> Promise<Object>`

指定されたブックマークノードを、本インスタンスが管理する移動先フォルダ配下に移動する。

* **処理フロー**:
  1. `this.dest_parent_item` が `null` でないか確認する。
  2. `null` でない場合、`chrome.bookmarks.move` を用いて、ブックマーク `bookmarkItem.id` を `parentId: this.dest_parent_item.id` へ非同期で移動する。
  3. `null` の場合（移動先フォルダが登録されていない場合など）、移動失敗のエラーを返す。
* **Args**:
  * `bookmarkItem` — 移動対象のブックマークノード（IDを持つオブジェクト）
* **Returns**: Chrome API の移動結果（移動後のブックマークノード情報）を解決する `Promise`。
* **Raises**: `Error` — 移動先の親フォルダアイテムが見つからない場合。

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| [data](file:///E:/Cchrome-ext/bmx/js/data.js) | 移動先のフォルダ情報を取得するために `data.getItemByHier` を使用 |

---

## 設計上の注意

* **コンストラクタ引数名と実態の乖離**:
  * コンストラクタの第2引数およびインスタンス変数名は `url` となっているが、実際にはドメイン名（ホスト名、例: `www.youtube.com`）が渡され保存される。保守性を高めるため、変数名は `hostname` 等にリファクタリングすることが望ましい。
* **フォルダ未作成状態での挙動**:
  * `dest_parent_item` が `null` のまま `move` を呼び出すと `Promise.reject` となる。自動移動の実行前に、対象フォルダが `data` シングルトン上に構築（および Chrome 上に作成）されていることが前提となる。
