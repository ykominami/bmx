# Popupx — モジュール内部仕様書

**ファイル**: `js/popupx.js`

## 概要

`js/popupx.js` はクラス `PopupManager`（`popupx.md` 参照）に加え、モジュールスコープの補助関数 `loadItems1()` を持つ。本ドキュメントはそのモジュールレベル関数のみを扱う。`PopupManager` の依存表からも参照される。

---

## モジュールレベル関数

### `async loadItems1() -> Promise<Array>`

「処理フロー」:
  1. `chrome.runtime.getURL('config/items1.json')` で拡張機能内の URL を解決する
  2. `fetch(url, {cache: 'no-cache'})` でキャッシュを使わずに取得する
  3. レスポンスが `!ok` なら例外を投げる
  4. JSON をパースし、配列でなければ例外を投げる
  5. パース結果を返す

**Args**: なし
**Returns**: `config/items1.json` の内容（`["Label", "/path"]` ペアの配列）
**Raises**: `Error` — HTTP レスポンスが失敗、または内容が配列でない場合

---

## 設計上の注意

- AGENTS.md によれば `config/items1.json` は **生の JSON 配列でなければならず**、`export const items1 = [...]` のような JS モジュール形式にしてはならない制約がある。`loadItems1()` の `Array.isArray()` チェックはこの制約を実行時に検証している。
- `no-cache` フェッチのため、ポップアップを開くたびに `config/items1.json` が再取得される（ポップアップの起動頻度を考えるとキャッシュ戦略上の意図的なトレードオフと見られる）。
