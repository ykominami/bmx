# Movergroup — クラス内部仕様書

**ファイル**: `js/movegroup.js`
**継承**: なし

## 概要

ホスト名 → 移動先階層パスのマッピングをハードコードで保持し、ブックマークURLのホスト名に応じて自動的に `Mover` へ振り分けるシングルトンクラス。`BX`/`BX2` ボタン（`PopupManager.moveBMX`/`moveBMX2`）から利用される。

---

## クラス定数

| 定数名 | 値 | 説明 |
|--------|----|----|
| mover_group | `null`（static, 初期値） | `get_mover_group()` が生成するシングルトンインスタンスのキャッシュ |

---

## メソッド

### `static get_mover_group() -> Movergroup`

シングルトンを取得する。未生成であれば、以下5件のルールを登録して生成する。

| 階層パス | ホスト名 |
|---------|---------|
| `/Video` | www.youtube.com |
| `/Video-nico` | www.nicovideo.jp |
| `/Video-bili` | www.bilibili.com |
| `/Amazon` | www.amazon.co.jp |
| `/Note.com` | note.com |

### `add(hier, hostname) -> void`

`hier`/`hostname` から `Mover` インスタンスを生成し `this.group[hostname]` に登録、`this.keys` を更新する。

### `async move(bookmarkItem) -> Promise<boolean>`

`bookmarkItem.url` があればホスト名解決後、対応する `Mover.move()` を呼ぶ。

処理フロー:
  1. `bookmarkItem.url` の有無を確認、なければ `false` を返す
  2. `await Util.parseURLX(url)` でホスト名を非同期取得
  3. ホスト名が `this.keys` に含まれるか判定し、含まれれば `await this.group[hostname].move(bookmarkItem)` の結果を `ret` に設定

**Args**: `bookmarkItem` — `{url?}` を持つブックマークアイテム
**Returns**: `url` が無ければ `false` を解決する Promise。ある場合はホスト名が一致すれば `Mover.move()` の結果、一致しなければ `false` を解決する Promise

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| `Mover`（js/mover.js） | ホストごとの移動処理の実行単位 |
| `Util`（js/util.js） | `parseURLX()` でURLからホスト名を取得 |

---

## 設計上の注意

- `move()` はかつて `Util.parseURLX(...).then(...)` の結果を待たずにローカル変数 `ret` を同期的に `return` していたが、`async`/`await` を用いた実装に修正済み。現在は内部の非同期処理が完全に解決してから戻り値を返す。呼び出し元（`ItemGroup.moveBMXFolderBase()`、[[itemgroup]]）は依然として `move()` の戻り値を `await` せずに呼び捨てているため、呼び出し側での完了待機は別途 [[itemgroup]] 側の課題として残る。
