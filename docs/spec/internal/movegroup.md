# Movergroup — 内部仕様書

**ファイル**: `js/movegroup.js`  
**継承**: なし

## 概要

ブックマークの自動移動ルール（ホスト名から移動先フォルダ階層パスへのマッピング）を管理し、対象ブックマークを自動的に移動する機能を提供するクラス。本クラスはシングルトンパターンを適用し、主要な動画サイトや通販サイト等の移動設定を初期状態で保持する。

---

## モジュールレベル定数・型

なし

---

## クラス定数・静的プロパティ

| プロパティ名 | 値/型 | 説明 |
|--------------|-------|------|
| `mover_group` | `Movergroup` or `null` | 移動グループのシングルトンインスタンスを保持する静的変数。 |

---

## インスタンス変数

| 変数名 | 型 | 説明 |
|--------|----|------|
| `group` | `Object` | ホスト名（文字列）をキー、[Mover](file:///E:/Cchrome-ext/bmx/js/mover.js) インスタンスを値とするハッシュマップ。 |
| `keys` | `Array<string>` | `group` に登録されているホスト名の一覧配列。ホスト名判定の高速化のために保持される。 |

---

## メソッド

### `constructor()`

コンストラクタ。空のルールマップ `group` およびキー配列 `keys` を初期化する。

---

### `static get_mover_group() -> Movergroup` (staticmethod)

`Movergroup` のシングルトンインスタンスを取得する。インスタンスが存在しない場合は新規に作成し、初期状態の自動移動ルールを登録した上で返す。

* **初期登録されるルール**:
  * `/Video` — `www.youtube.com`
  * `/Video-nico` — `www.nicovideo.jp`
  * `/Video-bili` — `www.bilibili.com`
  * `/Amazon` — `www.amazon.co.jp`
  * `/Note.com` — `note.com`
* **Returns**: `Movergroup` シングルトンインスタンス

---

### `add(hier: string, hostname: string) -> void`

ホスト名に対する移動ルールを追加する。

* **処理フロー**:
  1. 指定された階層パス `hier` とホスト名 `hostname` を用いて、新しく `Mover` インスタンスを生成する。
  2. `this.group[hostname]` に生成した `Mover` オブジェクトを登録する。
  3. `Object.keys(this.group)` を用いて、`this.keys` を更新する。
* **Args**:
  * `hier` — 移動先フォルダの階層パス
  * `hostname` — 対象のホスト名

---

### `move(bookmarkItem: Object) -> boolean|Promise`

与えられたブックマークアイテムのホスト名を判定し、登録済みのルールに合致する場合は対応する `Mover` を用いて移動を行う。

* **処理フロー**:
  1. `bookmarkItem.url` が存在するか確認する。
  2. 存在する場合、`Util.parseURLX(bookmarkItem.url)` を用いて非同期でホスト名を取得する。
  3. 取得したホスト名が `this.keys` に含まれているか判定する。
  4. 含まれている場合、`this.group[hostname].move(bookmarkItem)` を非同期で呼び出して移動処理を実行し、結果を返す。
* **Args**:
  * `bookmarkItem` — 移動対象のブックマークノードオブジェクト
* **Returns**: ルーティング処理が起動した場合は `Promise`（最終的な移動結果）、URL が存在しない場合やルーティング対象外のドメインの場合は `false`。

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| [Mover](file:///E:/Cchrome-ext/bmx/js/mover.js) | 自動移動ルールごとの移動ロジック処理のために使用 |
| [Util](file:///E:/Cchrome-ext/bmx/js/util.js) | ブックマークのURLからホスト名を非同期で抽出するために使用 (`Util.parseURLX`) |

---

## 設計上の注意

* **ドメインマッピングのハードコーディング**:
  * 初期ルール（`www.youtube.com`, `www.amazon.co.jp` 等）が `get_mover_group` メソッド内に直接ハードコードされている。マッピング定義を動的化または外部ファイル（`items1.json` など）で管理することが望ましいが、現状はハードコーディングされている点が技術的負債となっている。
* **非同期処理と同期戻り値**:
  * `move` メソッド内における `Util.parseURLX` および `Mover.move` は非同期処理（Promise）であるが、`move` メソッドの同期的な戻り値は `false` となるか、あるいは Promise のチェーンが途中で代入された一時変数 `ret` となる。呼び出し元で移動の完了を同期的に待機したい場合は注意が必要である。
