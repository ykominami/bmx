# PopupManager — クラス内部仕様書

**ファイル**: `js/popupx.js`
**継承**: なし

## 概要

拡張機能のポップアップ UI 全体を統括するコントローラクラス。起動時にストレージ・ブックマークツリー・カテゴリ設定を初期化し、上部エリア（現在タブ情報・追加/移動モード切替）と下部エリア（カテゴリ別ボタン・セレクト群）の DOM を構築する。`AGENTS.md` の「起動シーケンス」節で説明される `start()` が起点。ファイル末尾のモジュールレベル関数 `loadItems1()`（`popupx_module.md` 参照）を利用する。

---

## インスタンス変数

| 変数名 | 型 | 説明 |
|--------|----|------|
| `Target` | `string\|null` | 現在のモード（`'#add-mode'` \| `'#move-mode'`） |
| `addFolder` | `AddFolder` | フォルダ作成機能への委譲先インスタンス |
| `itemGroup` | `ItemGroup` | ブックマークツリー走査・移動機能への委譲先インスタンス |
| `items1` | `Array` | `config/items1.json` から読み込んだカテゴリ一覧 |
| `reg` | `RegExp` | `/Y/DashBoard` にマッチする正規表現（デバッグログ用フィルタ） |
| `dumpTreeNodes_func` | `Function` | `createDumpTreeNodes()` が生成する再帰ツリー走査クロージャ |

---

## メソッド

### `constructor()`

インスタンス変数を初期化し、`this.dumpTreeNodes_func = this.createDumpTreeNodes()` でクロージャを生成した上で `this.init()` を呼ぶ。

---

### `init() -> void`

`DOMContentLoaded` イベントリスナーを登録し、`this.start()` を呼ぶ。

---

### `onDOMContentLoaded() -> void`

`#popupBtn` のクリックリスナーを登録する（現状ハンドラの中身は空）。

---

### `makeMenuRecentlyAndCategorySelectBtn(category_max, items) -> Array`

「最近使用」メニューとカテゴリメニューを結合した配列を返す。

---

### `makeDistinationMenu(items) -> void`

各カテゴリについて `makeBtnHdrAndSelect()` を呼び、対象フォルダ選択メニューを構築する（`items[i][0] === 'TODO'` の場合のみデバッグログを出す分岐がある）。

---

### `makeMenuXcategory(max, items) -> Array`

`items` からカテゴリボタン・セレクトのペア配列を、`max` と `items.length` の小さい方の件数だけ生成する。

---

### `makeBtnHdrAndSelect(btn_jquery_id, select_jquery_id, keytop) -> Array`

`addSelect()` でセレクトを構築し、ボタンクリック時に `createOrMoveBKItem()` を呼ぶリスナーを登録する。

---

### `makeMenuXrecently() -> Object`

「recently」ボタンとセレクト（`#rbtn`/`#rinp`）のペアを返す。

---

### `addSelect(select, keytop) -> Array`

「処理フロー」:
  1. `keytop` に対応する `data` 上のアイテムを取得する
  2. `getSelectOption()` で配下のフォルダ一覧を非同期取得する
  3. 空なら自分自身を、末尾に「#別のフォルダ#」（`Globalx.ANOTHER_FOLER`）を追加した `<option>` 一覧で select を作り直す

---

### `async getSelectOption(item, ignore_head) -> Promise<Array>`

`chrome.bookmarks.getSubTree(item.id)` を取得し `dumpTreeItems()` で `{value, text}` の配列に変換する。`ignore_head` が偽なら先頭に `item` 自身を追加する。

---

### `setTargetArea(val) -> void`

`this.Target` を切り替え、`#add-mode`/`#move-mode` 要素の `class`（`selected`/`not-selected`）を更新する。

---

### `async addSelectWaitingItemsX(select, folder_id) -> Promise<void>`

`folder_id` 配下のサブツリーから `<option>` 一覧を作り select に追加し、選択された `folder_id` があれば `selectWaitingItemsBtnHdr()` を呼ぶ。

---

### `async tab_query_async(query, parent_id, parent_text) -> Promise<Array>`

`chrome.tabs.query(query)` の結果を `[tabs, parent_id, parent_text]` のタプルにして返す。

---

### `async add_mode_x([tabs, parent_id, parent_text]) -> Promise<void>`

「処理フロー」:
  1. `input[name='add-mode']:checked` のラジオ値を見る
  2. `'s'`: アクティブタブのみをブックマーク作成
  3. `'m-r'`: アクティブタブより右側の全タブをブックマーク作成し、対象タブを閉じる
  4. `'m-l'`: アクティブタブより左側の全タブをブックマーク作成し、対象タブを閉じる
  5. `'x'`: 何もしない（`move_need = false`）
  6. `move_need` が真なら `Globalx.addRecentlyItem()` で履歴を更新する

---

### `async createOrMoveBKItem(select_jquery_id, keytop) -> Promise<void>`

`this.Target` に応じて追加モード（`add_mode_x()`）または移動モード（`chrome.bookmarks.get()` → `moveBKItem()`）を実行し、`Globalx.addStorageSelected()`・`Globalx.addRecentlyItem()` で選択状態を永続化する。移動モードで `#oname`/`#ourl`/`#oid` のいずれかが空の場合は `alert()` でエラー通知する。

---

### `async closeTabs() -> Promise<void>`

現在のラジオ選択（`m-r`/`m-l`）に応じて、アクティブタブの右側／左側のタブを閉じる。

---

### `addSelectWaitingFolders(select, subselect) -> void`

`getKeys()`（config/settings3.js）の各階層パスから `<option>` 候補を組み立て、末尾に「#別のフォルダ#」を追加して select に反映し、`addSelectWaitingItemsX()` を呼ぶ。jQuery オブジェクトとプレーンオブジェクトが混在した配列を正規化する分岐を含む。

---

### `async moveBKItem(id, src_parent_id, dest_parent_id) -> Promise<boolean>`

`chrome.bookmarks.move(id, {parentId: dest_parent_id})` でブックマークを移動し、`addSelectWaitingItemsX()` で移動元フォルダの表示を更新する。`id` が空文字なら `alert()` で通知し `false` を返す。

---

### `dumpTreeNodesSub(element, count, parent_id, head_ignore = false) -> Object`

`{buffer, count}` を返す再帰ヘルパー。`element.url` があれば即座に空 `buffer` を返す。`head_ignore` が偽なら自身を `buffer` に追加し、子要素を再帰的に処理して結合する。

---

### `dumpTreeItems(bookmarkTreeNodes, count, parent_id) -> Object`

`bookmarkTreeNodes` の各要素について `dumpTreeNodesSub()` を呼び、結果を結合した `{buffer, count}` を返す。

---

### `makeMenuOnBottomArea() -> void`

「処理フロー」:
  1. `getNumOfRows()`（列数）・`getMax()`（最大カテゴリ数）を取得する
  2. `makeMenuRecentlyAndCategorySelectBtn()` でボタン・セレクトのペア一覧を作る
  3. 各ペアに CSS グリッドクラス（`g-<row>-<col>`）を計算して付与する
  4. `#menu` にすべての要素を追加し、`makeDistinationMenu()` でカテゴリ選択メニューを構築する
  5. `#rbtn` にクリックリスナーを登録し、`Globalx` の `StorageOptions`/`StorageHiers` を最新状態に反映する

---

### `async makeMenuOnBottomAreaAsync() -> Promise<string>`

`makeMenuOnBottomArea()` を呼び、固定文字列 `'makeMunuOnBotttomAreaAsync'`（タイポを含む）を返す。

---

### `clear_in_move_mode_area() -> void`

`#oname`/`#ourl`/`#oid` の値を空にする。

---

### `async selectWaitingItemsBtnHdr(option_value) -> Promise<void>`

`chrome.bookmarks.get(option_value)` の結果から `#oname`/`#ourl`/`#oid`/`#ox` を更新し、URL のホスト名を非同期で `#ox` に反映する。

---

### `makeMenuOnUpperArea(title, url) -> void`

上部エリア（現在タブ情報表示・モード切替・各種操作ボタン）のイベントリスナー一式を登録する。`#gotobtn`（タブ URL 更新）、`#removeitembtn`（ブックマーク削除）、`#removebtn`（設定削除）、`#closebtn`（タブクローズ）、`#addFolderbtn`/`#addDbtn`（フォルダ作成）、`#moveBMX`/`#moveBMX2`（自動振り分け）、`#addFcbtn`（デバッグ用）、`#lsbtn`（デバッグ用ツリー表示）などを含む。`#importbtn` は未実装（ログ出力のみ）。

---

### `async setupPopupWindowAsync() -> Promise<void>`

`chrome.tabs.query({active: true, currentWindow: true})` で現在タブ情報を取得し、`#sid` に ID を設定した上で `makeMenuOnUpperArea()` を呼ぶ。

---

### `async dumpBookmarksAsync() -> Promise<Array>`

`chrome.bookmarks.getTree()` の結果を返す。

---

### `async make_popup_ui() -> Promise<void>`

`setupPopupWindowAsync()` → `makeMenuOnBottomAreaAsync()` の順に実行する。

---

### `async get_bookmarks() -> Promise<void>`

`dumpBookmarksAsync()` の結果を `dumpTreeNodesAsync()` に渡す。

---

### `async dumpTreeNodesAsync(bookmarkTreeNodes) -> Promise<Array>`

`this.dumpTreeNodes_func(bookmarkTreeNodes)` を実行して `data` へのアイテム登録を完了させ、`Globalx.setStorageHiers()` で階層パス一覧を保存する。

---

### `async start() -> Promise<void>`

「処理フロー」（`AGENTS.md` の「起動シーケンス」に対応）:
  1. `Globalx.initSettings_a()` — デフォルト設定をシード
  2. `Globalx.initSettings_all()` — ストレージから設定を上書き
  3. `loadItems1()` — `config/items1.json` を取得
  4. `get_bookmarks()` — ブックマークツリーを走査し `data` を構築
  5. `make_popup_ui()` — 上部・下部 UI を描画

---

### `moveBMX2() -> void`

固定階層パス `/0/0-etc/0` を起点に `Movergroup.get_mover_group()` を使ってフォルダベースの自動振り分け移動を行う（`BX2` ボタン用）。

---

### `moveBMX() -> void`

ブックマークバー（ID `'1'`）を起点に自動振り分け移動を行う（`BX` ボタン用）。

---

### `print_with_cond_ret(ret) -> void`

`this.reg`（`/Y/DashBoard`）にマッチする `ret.hier` の場合のみデバッグログを出力する。

---

### `addFc() -> void`

`data.getKeysOfItemByHier()` の中から `'//'` で始まるキーを探してログ出力するデバッグ用メソッド。

---

### `createDumpTreeNodes() -> Function`

`bookmarkTreeNodes` を `reduce()` で走査し、各要素を `itemGroup.add_to_itemgroup()` に渡して非 `null` の結果を蓄積する再帰関数（クロージャ）を生成して返す。生成された関数は `itemGroup.add_to_itemgroup()` 自身にも渡され、子要素の再帰走査に使われる。

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| `getKeys`/`getMax`/`getNumOfRows`（config/settings3.js） | メニューのレイアウト・対象フォルダ一覧を決定 |
| `ItemGroup`（js/itemgroup.js） | ブックマークツリー走査・自動振り分け移動 |
| `Movergroup`（js/movegroup.js） | `moveBMX()`/`moveBMX2()` での自動振り分けルール |
| `AddFolder`（js/addfolder.js） | フォルダ作成機能 |
| `Util`（js/util.js） | jQuery 要素生成・ID 命名規則・URL 解析 |
| `data`（js/data.js） | ブックマークアイテムの検索・登録状態の参照 |
| `Globalx`（js/globalx.js） | ストレージ設定の初期化・永続化 |
| `loadItems1()`（js/popupx.js モジュールレベル関数、`popupx_module.md` 参照） | `config/items1.json` の読み込み |

---

## 設計上の注意

- `dumpTreeItems()` は `dumpTreeNodesSub(element, parent_id, count, head_ignore)` という順で呼び出しているが、`dumpTreeNodesSub` の実際のシグネチャは `(element, count, parent_id, head_ignore)` であり、**`count` と `parent_id` の引数位置が入れ替わって渡されている**。カウント処理・親 ID 処理が意図通りに動作していない可能性が高いバグ。
- AGENTS.md は「`popupx.js` 冒頭の `import {items1} from '../config/items1.js'` は死んだコードである」と記述しているが、現行ソースにはこの import 自体が存在しない（既に削除済みと見られ、ドキュメントが古い）。
- `#importbtn` はクリックリスナーが登録されているが実処理は未実装（`console.log('not implemented a handler of importbtn')` のみ）。
- `alert()` によるエラー通知（`createOrMoveBKItem()`・`moveBKItem()`）は、他の非同期処理が概ね `try/catch` を使わず Promise チェーンで完結している本コードベースの中で、同期的なブロッキング UI という一貫性のない例外処理になっている。
- ファイル全体にわたり多数の `console.log`（一部はコメントアウト）がデバッグ目的で残存している。
