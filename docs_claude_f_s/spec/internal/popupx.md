# PopupManager — クラス内部仕様書

**ファイル**: `js/popupx.js`
**継承**: なし

## 概要

拡張機能ポップアップのUI構築とイベント処理を統括するコントローラ。起動時に `start()` が呼ばれ、Add mode／Move modeの2種類のワークフローを提供する。ファイル末尾で `new PopupManager()` により即座にインスタンス化される（モジュール読み込み時の副作用。詳細は [[popupx_module]] を参照）。

---

## インスタンス変数

| 変数名 | 型 | 説明 |
|--------|----|----|
| Target | string\|null | 現在選択中のモードのjQueryセレクタ（`'#add-mode'` または `'#move-mode'`） |
| addFolder | AddFolder | フォルダ作成処理の委譲先 |
| itemGroup | ItemGroup | ブックマークツリー走査の委譲先 |
| items1 | Array | `config/items1.json` から読み込んだカテゴリ一覧（`[label, hier]` の配列） |
| reg | RegExp | デバッグ用の階層パスマッチ正規表現（`/Y/DashBoard`） |
| dumpTreeNodes_func | Function | `createDumpTreeNodes()` が生成した再帰ダンプ関数 |

---

## メソッド

### `constructor()`

各フィールドを初期化し、`this.init()` を呼んで即座に起動シーケンスへ入る。

### `init() -> void`

`DOMContentLoaded` のリスナー登録と `this.start()` の呼び出しを行う。

### `onDOMContentLoaded() -> void`

`#popupBtn` のクリックリスナーを登録する（中身は未実装、下記「設計上の注意」参照）。

### `makeMenuRecentlyAndCategorySelectBtn(category_max, items) -> Array`

「最近使用」メニューとカテゴリ選択ボタン群を1つの配列にまとめて返す。

### `makeDistinationMenu(items) -> void`

各アイテムについて対象フォルダ選択メニューを構築する（`'TODO'` ラベルの場合のみログ出力するデバッグ分岐あり）。

### `makeMenuXcategory(max, items) -> Array`

`items` からカテゴリボタン・セレクトのペア配列を、`max` 件を上限に生成する。

### `makeBtnHdrAndSelect(btn_jquery_id, select_jquery_id, keytop) -> Array`

`addSelect()` でセレクトを構築し、ボタンに `createOrMoveBKItem()` を呼ぶクリックリスナーを設定する。

### `makeMenuXrecently() -> Object`

「最近使用」ボタン（`#rbtn`）とセレクト（`#rinp`）のペアを返す。

### `addSelect(select, keytop) -> Array`

`keytop` に対応する `data` 上のアイテムからサブツリーの選択肢を非同期に構築し、セレクトへ反映する。末尾に「#別のフォルダ#」（`Globalx.ANOTHER_FOLER`）を追加する。

### `async getSelectOption(item, ignore_head) -> Promise<Array>`

`chrome.bookmarks.getSubTree()` でサブツリーを取得し、`dumpTreeItems()` で選択肢配列に変換する。

### `setTargetArea(val) -> void`

`this.Target` を切り替え、`#add-mode`/`#move-mode` の `class` 属性（`selected`/`not-selected`）を更新する。

### `async addSelectWaitingItemsX(select, folder_id) -> Promise<void>`

指定フォルダのサブツリー（1階層）を取得し、セレクトへ反映後、先頭を選択して `selectWaitingItemsBtnHdr()` を呼ぶ。

### `async tab_query_async(query, parent_id, parent_text) -> Promise<Array>`

`chrome.tabs.query()` の結果を `[tabs, parent_id, parent_text]` の形にまとめて返す。

### `async add_mode_x([tabs, parent_id, parent_text]) -> Promise<void>`

Add modeのラジオ選択（`s`/`m-r`/`m-l`/`x`）に応じ、単一タブ・右側タブ群・左側タブ群のブックマーク作成とタブのクローズを行う。

処理フロー（`m-r` の例）:
  1. アクティブタブより右側のタブを順にブックマーク作成
  2. 作成後、右側のタブを末尾から順に `chrome.tabs.remove()`
  3. 移動が必要だった場合、`Globalx.addRecentlyItem()` で履歴に追加

### `async createOrMoveBKItem(select_jquery_id, keytop) -> Promise<void>`

Add mode時はタブ問い合わせ結果を `add_mode_x()` に渡し、Move mode時は選択中ブックマークを `moveBKItem()` で移動する。

### `async closeTabs() -> Promise<void>`

Add modeのラジオ選択に応じて、アクティブタブの左右のタブを閉じる。

### `addSelectWaitingFolders(select, subselect) -> void`

`config/settings3.js` の `getKeys()` から対象フォルダの選択肢を構築し、末尾に「#別のフォルダ#」を追加してセレクトへ反映する。

### `async moveBKItem(id, src_parent_id, dest_parent_id) -> Promise<boolean>`

`chrome.bookmarks.move()` でブックマークを移動し、移動元フォルダの一覧を再表示する。

**Raises**: なし（`id === ''` の場合は `alert()` を出して `false` を返す）

### `dumpTreeNodesSub(element, count, parent_id, head_ignore = false) -> Object`

ツリーノード1件を再帰的にダンプし、`{buffer, count}` を返す。

### `dumpTreeItems(bookmarkTreeNodes, count, parent_id) -> Object`

複数のツリーノードについて `dumpTreeNodesSub()` を呼び、結果を集約する。

### `makeMenuOnBottomArea() -> void`

ポップアップ下部のカテゴリメニューをグリッドレイアウトで構築し、`#menu` へ追加する。ストレージオプションの復元と `Globalx.setStorageHiers()` の呼び出しも行う。

### `async makeMenuOnBottomAreaAsync() -> Promise<string>`

`makeMenuOnBottomArea()` を呼んで固定文字列を返すだけのラッパー。

### `clear_in_move_mode_area() -> void`

`#oname`/`#ourl`/`#oid` を空にする。

### `async selectWaitingItemsBtnHdr(option_value) -> Promise<void>`

選択されたブックマークの情報を取得し、`#oname`/`#ourl`/`#oid`/`#ox` に反映する。ホスト名解析にも `Util.parseURLAsync()` を使用する。

### `makeMenuOnUpperArea(title, url) -> void`

ポップアップ上部エリア（現在タブ情報、モード切替、各種ボタン）のイベントハンドラを一括で配線する。`#gotobtn`/`#importbtn`/`#removeitembtn`/`#removebtn`/`#closebtn`/`#addFolderbtn`/`#addDbtn`/`#moveBMX`/`#moveBMX2`/`#addFcbtn`/`#lsbtn`/`#test1btn` 等、多数のボタンをここで一括登録する。

### `async setupPopupWindowAsync() -> Promise<void>`

現在アクティブなタブ情報を取得し、`makeMenuOnUpperArea()` に渡す。

### `async dumpBookmarksAsync() -> Promise<Array>`

`chrome.bookmarks.getTree()` の結果を返す。

### `async make_popup_ui() -> Promise<void>`

`setupPopupWindowAsync()` → `makeMenuOnBottomAreaAsync()` の順に呼び、UI全体を構築する。

### `async get_bookmarks() -> Promise<void>`

`dumpBookmarksAsync()` の結果を `await` した上で `dumpTreeNodesAsync()` に渡し、その完了も `await` する。これにより `start()` 側の `await this.get_bookmarks()` が `data` の構築完了まで正しく待機する。

### `async dumpTreeNodesAsync(bookmarkTreeNodes) -> Promise<Array>`

`dumpTreeNodes_func()` でツリー全体を走査し、`data.getItemHashByHierKeys()` の結果を `Globalx.setStorageHiers()` に渡す。

### `async start() -> Promise<void>`

アプリ全体の起動シーケンスを実行する。

処理フロー:
  1. `Globalx.initSettings_a()` — 既定値からSettingsを初期化
  2. `Globalx.initSettings_all()` — ストレージから上書き
  3. `loadItems1()` — `config/items1.json` を取得（[[popupx_module]]参照）
  4. `get_bookmarks()` — ブックマークツリーを走査し `data` を構築
  5. `make_popup_ui()` — 上部・下部UIを構築

### `moveBMX2() -> void`

`/0/0-etc/0` を起点に `Movergroup` による自動振り分け移動を実行する。

### `moveBMX() -> void`

ブックマークバー（ID: `'1'`）を起点に `Movergroup` による自動振り分け移動を実行する。

### `print_with_cond_ret(ret) -> void`

`ret.hier` が `this.reg` にマッチする場合のみログ出力するデバッグ用メソッド。

### `addFc() -> void`

`data.getKeysOfItemByHier()` から `//` で始まるキーをログ出力するデバッグ用メソッド。

### `createDumpTreeNodes() -> Function`

`itemGroup.add_to_itemgroup()` を使って再帰的にツリーをダンプするクロージャ関数を生成する。

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| `ItemGroup`（js/itemgroup.js） | ブックマークツリー走査・`moveBMXFolderBase()` 呼び出し |
| `Movergroup`（js/movegroup.js） | `moveBMX`/`moveBMX2` での自動振り分け |
| `AddFolder`（js/addfolder.js） | `#addFolderbtn`/`#addDbtn` からのフォルダ自動作成 |
| `Util`（js/util.js） | ボタン/セレクト生成、URL解析 |
| `data`（js/data.js） | アイテムの検索・階層キー一覧の取得 |
| `Globalx`（js/globalx.js） | ストレージ連携、最近使用履歴 |
| `config/settings3.js`（`getKeys`/`getMax`/`getNumOfRows`） | メニューのグリッド構成・件数上限・対象フォルダキー |
| `loadItems1()`（js/popupx.js モジュールレベル） | `config/items1.json` の読み込み。詳細は [[popupx_module]] |
| jQuery (`$`) / `chrome.bookmarks.*` / `chrome.tabs.*` | DOM操作およびChrome拡張API全般 |

---

## 設計上の注意

- コンストラクタ内で `this.init()` を呼び、`init()` がさらに `this.start()` を呼ぶことで、`DOMContentLoaded` を待たずに非同期起動シーケンスが即座に走る。一方 `onDOMContentLoaded()` 内のクリックハンドラ登録はコメントのみで実装が空（`// Original logic inside DOMContentLoaded`）であり、未実装のデッドコードになっている。
- `moveBMX()`/`moveBMX2()` は `itemGroup.moveBMXFolderBase(...)` の結果を `.then(() => {})` で握りつぶしており、エラーハンドリングが存在しない（[[itemgroup]] に記載の非同期の未解決課題と連鎖する）。
- `addFc()` はテスト/デバッグ用の未使用コードで、通常の操作フローには組み込まれていない。
- 894行に及ぶ単一クラスにUI構築・イベント配線・データ操作が全て集約されており、ファイルサイズの目安（800行程度）を超過している。責務分割（UI構築、イベント配線、データ操作等）の余地がある。
