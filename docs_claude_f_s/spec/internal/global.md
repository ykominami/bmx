# global — モジュール内部仕様書

**ファイル**: `js/global.js`

## 概要

`Globalx`（js/globalx.js、[[globalx]]参照）と機能的にほぼ等価な、クラス化以前の関数ベース実装。`chrome.storage.local` の `all` キー配下の `Options`/`Selected`/`Hiers`/`Misc` を管理する。AGENTS.md では「新規コードは `Globalx` を使うべき」とされている移行中のレガシーモジュール。

---

## モジュールレベル定数・型

| 変数名 | 値/型 | 用途 |
|--------|-------|------|
| Settings | Object（`let`） | `Globalx.Settings` 相当のメモリ上キャッシュ |
| StorageOptions | `'Options'` | 最近使用した対象フォルダ履歴のキー名 |
| StorageSelected | `'Selected'` | カテゴリキー毎の最終選択フォルダのキー名 |
| StorageHiers | `'Hiers'` | `ItemHashByHier` キー一覧のスナップショットのキー名 |
| StorageMisc | `'Misc'` | その他設定のキー名 |
| ANOTHER_FOLER | `-1` | 「別のフォルダを選ぶ」を意味するセンチネル値（`Globalx` と同じスペルミスを継承） |
| Keyvalues | `[[StorageOptions, []], [StorageSelected, {}], [StorageHiers, {}], [StorageMisc, {}]]` | 初期化時に `Settings` へ投入するキー・初期値ペアの一覧 |

---

## モジュールレベル関数

いずれも `Globalx`（[[globalx]]）の同名 static メソッドと1対1で対応する、ロジック的に同一の実装。詳細な処理内容は [[globalx]] を参照。

| 関数 | 概要 |
|------|------|
| `adjustValue(val)` | `null` なら空配列に正規化 |
| `async loadSettings()` | `chrome.storage.local.get(null)` から `all` キーを取得 |
| `initSettings_a()` | `Keyvalues` の初期値を `Settings` に投入 |
| `async initSettings_all()` | ストレージ値と `data.makeItemHashX()` の結果を `Settings` にマージ |
| `getSettingsByKey(assoc, key)` | 連想配列からキーの値を取得 |
| `setSettingsByKey(assoc, key, value)` | 連想配列にキー・値を設定 |
| `replace_in_Settings(asoc)` | `Keyvalues` のキーのみホワイトリスト方式でマージ |
| `addStorageSelected(key, value)` | `Settings[StorageSelected]` にキー・値を追加 |
| `setStorageOptions(value)` | `Settings[StorageOptions]` を置き換え |
| `getStorageOptions()` | `Settings[StorageOptions]` を取得（非配列なら空配列に初期化） |
| `async setStorageHiers(value)` | `StorageHiers` を空にして保存後、メモリ上のみ実値を設定 |
| `async storageOptionsUnshift(obj)` | `Settings[StorageOptions]` の先頭に追加して保存 |
| `async removeSettings()` | `StorageOptions`/`StorageSelected`/`StorageHiers` を削除 |
| `addRecentlyItemX(select, sOptions)` | 渡された履歴からセレクトの `<option>` を再構築 |
| `adjustRecentrlyFolder(value, text)` | 既存エントリを削除して先頭に追加（最近使用順の並べ替え） |
| `makeSelectOptionsData(options)` | `{value, text}` 配列から `<option>` のjQueryオブジェクト配列を作成 |
| `addRecentlyItem(select, value, text)` | 履歴取得→並べ替え→セレクト再構築を一括実行 |

---

## 設計上の注意

- 本ファイルは `Globalx` クラス（[[globalx]]）とロジックがほぼ完全に重複しており（関数シグネチャ・処理内容が1対1で対応）、DRY原則に反する典型的な移行途中のコードである。
- AGENTS.md には「`Util`（js/util.js）が本モジュールから `addRecentlyItemX`/`getStorageOptions` をインポートしている」と記載されているが、現在の `js/util.js` の実装は `Globalx` のみをインポートしており（[[util]]参照）、この記述は現状のソースと一致しない（ドキュメントの陳腐化、または既に修正済みで未更新の可能性がある）。
- 本プロジェクトのコーディング規約（AGENTS.md）には「独立関数を禁止しクラスメソッド化する」旨の明示的な規定はなく、独立関数群としての本モジュールは規約違反ではないが、`Globalx` との重複という観点で保守コストを増やしているレガシー資産である。
