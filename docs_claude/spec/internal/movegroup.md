# Movergroup — クラス内部仕様書

**ファイル**: `js/movegroup.js`
**継承**: なし

## 概要

ホスト名 → 移動先階層パスのルールを束ねるレジストリ兼ディスパッチャクラス。ブックマークアイテムの URL のホスト名を調べ、該当する `Mover` があればそれに移動処理を委譲する。`get_mover_group()` によりモジュールスコープでシングルトン化される。

---

## インスタンス変数

| 変数名 | 型 | 説明 |
|--------|----|------|
| `group` | `Object<string, Mover>` | ホスト名をキーとする `Mover` インスタンスのハッシュ |
| `keys` | `Array<string>` | `group` の登録済みホスト名一覧（`add()` のたびに再計算） |

---

## メソッド

### `static get_mover_group() -> Movergroup`

`Movergroup.mover_group`（クラス静的プロパティ）が未生成なら新規作成し、以下の固定ルールを `add()` で登録する。2 回目以降の呼び出しでは既存インスタンスをそのまま返す（シングルトン）。

| 階層パス | ホスト名 |
|----------|----------|
| `/Video` | `www.youtube.com` |
| `/Video-nico` | `www.nicovideo.jp` |
| `/Video-bili` | `www.bilibili.com` |
| `/Amazon` | `www.amazon.co.jp` |
| `/Note.com` | `note.com` |

**Returns**: `Movergroup` シングルトンインスタンス

---

### `add(hier, hostname) -> void`

`new Mover(hier, hostname)` を生成し `this.group[hostname]` に登録、`this.keys` を再計算する。`mover.dest_parent_item` が `null`（`hier` に対応するフォルダが `data` に未登録）の場合でも登録自体は行われる（デバッグログのみ、握りつぶし）。

**Args**: `hier` — 移動先の階層パス、`hostname` — 対象ホスト名

---

### `move(bookmarkItem) -> boolean|Promise`

`bookmarkItem.url` があれば、`Util.parseURLX()` でホスト名を非同期取得し、`this.keys` に含まれていれば対応する `Mover.move()` を呼び出す。`url` がなければ `false` を返す。

**Args**: `bookmarkItem` — `{url?}` を持つブックマークアイテム
**Returns**: 呼び出し時点で確定している `ret`（下記「設計上の注意」参照）

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| `Mover`（js/mover.js） | ホスト名ごとの実際の移動処理 |
| `Util`（js/util.js） | `parseURLX()` で URL からホスト名を非同期抽出 |

---

## 設計上の注意

- `move()` は内部で `Util.parseURLX(...).then(...)` という非同期処理を行っているが、`return ret` は `then()` コールバックの外（同期的な箇所）で実行される。そのため `ret` は常に初期値 `false`、あるいは `.then()` が返す Promise オブジェクトそのものが代入された状態で返却され、呼び出し元（`ItemGroup.moveBMXFolderBase()`）は実際の移動結果を取得できない。**戻り値を当てにした呼び出し側のロジックは機能しない可能性が高い**。
- `add()` 内で `mover.dest_parent_item == null` のケースが握りつぶされている（コメントアウトされたログのみ）。`data` の初期化前に `get_mover_group()` が呼ばれると、対応する移動先フォルダが見つからないまま登録されてしまう。
