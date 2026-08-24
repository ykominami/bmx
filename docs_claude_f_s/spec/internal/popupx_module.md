# popupx — モジュール内部仕様書

**ファイル**: `js/popupx.js`

## 概要

`PopupManager` クラス（[[popupx]]）とは別に、ファイル冒頭で定義される非同期ローダー関数 `loadItems1()` と、ファイル末尾の実行文（モジュール読み込み時の副作用）を扱う。

---

## モジュールレベル関数

### `async loadItems1() -> Promise<Array>`

`config/items1.json` を `chrome.runtime.getURL()` + `fetch(url, {cache:'no-cache'})` で読み込み、JSON配列として返す。

処理フロー:
  1. `chrome.runtime.getURL('config/items1.json')` でURLを解決
  2. `fetch(url, {cache: 'no-cache'})` で毎回キャッシュを無視して取得
  3. `response.ok` でなければ例外、JSONパース結果が配列でなければ例外を投げる

**Returns**: `config/items1.json` の内容（`[label, hier]` ペアの配列）
**Raises**: `Error` — HTTP応答が異常（`response.ok === false`）、またはパース結果が配列でない場合

---

## モジュールレベルの副作用文

| 記述 | 内容 |
|------|------|
| `new PopupManager();`（ファイル末尾） | モジュールが読み込まれた瞬間にUIコントローラが即座に生成・起動される。詳細は [[popupx]] を参照。 |

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| `PopupManager`（js/popupx.js） | `loadItems1()` は `PopupManager.start()` から呼び出される（[[popupx]]参照） |
| `chrome.runtime.getURL` / `fetch` | `config/items1.json` の読み込み |

---

## 設計上の注意

- AGENTS.md には「`popupx.js` 冒頭に `import {items1} from '../config/items1.js'` という静的importが残っており、これはdead codeで実際のデータは `loadItems1()` から取得される」と記載されているが、現在のソースにはこの静的importは存在しない。既に削除済みと見られ、AGENTS.md の当該記述は現状のコードより古い（ドキュメント陳腐化）。
- `loadItems1()` は毎回 `no-cache` でfetchするため、ポップアップを開くたびにネットワーク/ディスクI/Oが発生する。カテゴリ数が多くなった場合のパフォーマンス劣化要因になりうる。
- AGENTS.md の「`config/items1.json` は生のJSON配列でなければならない（JSモジュールではない）」という制約は、本関数の `Array.isArray(parsed)` チェックとして実装レベルで担保されている。
