# PopupManager — 内部仕様書

**ファイル**: `js/popupx.js`  
**継承**: なし

## 概要

拡張機能のポップアップウィンドウ（UI画面およびバックエンド処理の結合）全体を統括するコントローラクラス。追加（Add）モードと移動（Move）モードのUI切り替え、イベントハンドリング、Chrome API（`tabs`, `bookmarks`）との連携、およびグローバル設定のストレージ保存など、アプリケーションの中核フローを管理する。

---

## モジュールレベル定数・型

なし

---

## モジュールレベル関数

### `loadItems1() -> Promise<Array>`

`config/items1.json` を非同期でフェッチし、カテゴリ定義データをロードする。

* **処理フロー**:
  1. `chrome.runtime.getURL('config/items1.json')` よりURLを取得。
  2. `fetch(url, {cache: 'no-cache'})` を用いて、キャッシュなしでJSONファイルをロード。
  3. レスポンスが正常（ok）で、かつ配列データであることを確認した上でロードしたデータを解決する。
* **Returns**: カテゴリ一覧の配列（例: `[["Label", "/path"], ...]`）
* **Raises**: `Error` — ファイルの読み込みに失敗した場合、またはデータが配列でない場合。

---

## クラス定数

なし

---

## インスタンス変数

| 変数名 | 型 | 説明 |
|--------|----|------|
| `Target` | `string` | 現在アクティブなモード識別子（`'#add-mode'` または `'#move-mode'`）。 |
| `addFolder` | `AddFolder` | フォルダ自動作成等のロジックを委譲するインスタンス。 |
| `itemGroup` | `ItemGroup` | ブックマークツリー構築や移動のベース処理を委譲するインスタンス。 |
| `items1` | `Array` | カテゴリ定義の一覧配列。 |
| `reg` | `RegExp` | デバッグ等の出力判定用正規表現（`/Y/DashBoard`）。 |
| `dumpTreeNodes_func` | `Function` | ツリーノードを再帰走査して `ItemGroup` に追加するためのクロージャ関数。 |

---

## メソッド

### `constructor()`

コンストラクタ。各種委譲用インスタンス、正規表現、およびツリーダンプ用関数を初期化した後、`init()` を呼び出す。

---

### `init()`

初期化処理。DOMの読み込み完了を待機し、`start()` 処理を起動する。

---

### `onDOMContentLoaded()`

`DOMContentLoaded` 時の処理（現在はプレースホルダー）。

---

### `makeMenuRecentlyAndCategorySelectBtn(category_max: number, items: Array) -> Array<Object>`

履歴用メニューオブジェクトおよびカテゴリ選択用のボタン・セレクト要素ペアを生成して結合した配列を作成する。

* **Returns**: メニュー要素オブジェクトの配列

---

### `makeDistinationMenu(items: Array) -> void`

UI下部エリアに配置された各カテゴリボタンおよびセレクト要素に対してイベントおよび初期値を設定する。

---

### `makeMenuXcategory(max: number, items: Array) -> Array<Object>`

カテゴリのボタンとセレクトに対応する jQuery 要素のペアオブジェクトを指定数作成する。

---

### `makeBtnHdrAndSelect(btn_jquery_id: string, select_jquery_id: string, keytop: string) -> void`

指定されたカテゴリのボタンおよびセレクト要素をバインドする。ボタンクリック時に `createOrMoveBKItem` が実行されるように設定する。

---

### `makeMenuXrecently() -> Object`

履歴（Recently）用ボタンとセレクトの jQuery オブジェクトのペアを生成する。

---

### `addSelect(select: jQuery, keytop: string) -> void`

指定された階層パス（キートップ）配下にあるサブフォルダを、非同期でセレクト要素の選択肢として設定する。

* **処理フロー**:
  1. `data.getItemByHier(keytop)` からフォルダアイテムを取得。
  2. 該当アイテム配下のサブフォルダ群を `getSelectOption(item, true)` により非同期で取得。
  3. サブフォルダが存在しない場合は、自身を唯一の選択肢とする。
  4. 選択肢の末尾に「#別のフォルダ#」（`Globalx.ANOTHER_FOLER`）を追加。
  5. セレクト要素の中身を一旦クリアし、新しい選択肢を追加。

---

### `getSelectOption(item: Object, ignore_head: boolean) -> Promise<Array>`

指定されたフォルダ配下のフォルダツリーを走査し、フォルダのIDと名前のペア配列を取得する。

* **Returns**: `{value, text}` の配列を解決する `Promise`

---

### `setTargetArea(val: string) -> void`

アクティブな操作モードを切り替える。

* **Args**: `val` — モード識別文字列（`'#add-mode'` または `'#move-mode'`）
* **処理フロー**:
  * モードが切り替わった場合、ボタンのCSSクラス（`selected` / `not-selected`）を切り替えてUI側の表示（背景色や文字色）に反映させる。

---

### `addSelectWaitingItemsX(select: jQuery, folder_id: string) -> Promise<void>`

移動モードにおいて、指定された移動元フォルダ配下にあるブックマークアイテム（ブックマーク）を取得し、選択肢としてセレクト要素に設定する。

* **処理フロー**:
  1. `data.getItem(folder_id)` でフォルダアイテムを取得。
  2. `chrome.bookmarks.getSubTree` を呼び出してサブツリーを取得。
  3. `dumpTreeItems` で子ブックマークのID・タイトル一覧を取得し、セレクト要素に追加。
  4. 取得した最初のブックマークの情報を `selectWaitingItemsBtnHdr` でテキストエリア等に表示する。

---

### `tab_query_async(query: Object, parent_id: string|null, parent_text: string|null) -> Promise<Array>`

現在のウィンドウから指定された条件のタブ情報を非同期でクエリする。

* **Returns**: `[tabs, parent_id, parent_text]` を解決する `Promise`

---

### `add_mode_x([tabs, parent_id, parent_text]: Array) -> Promise<void>`

追加（Add）モードにおいて、選択されているラジオボタンの状態に応じてタブをブックマークに作成し、タブを閉じる処理を行う。

* **処理フロー**:
  1. アクティブなタブオブジェクトを取得。
  2. ラジオボタン（`s` / `m-r` / `m-l` / `x`）の値を判定。
     * `'s'`: アクティブタブのみを `chrome.bookmarks.create` で追加。
     * `'m-r'`: アクティブタブより右側の全タブを追加し、該当タブを `chrome.tabs.remove` で閉じる。
     * `'m-l'`: アクティブタブより左側の全タブを追加し、該当タブを `chrome.tabs.remove` で閉じる。
     * `'x'`: ブックマーク追加を行わない（何もしない）。
  3. `Globalx.addRecentlyItem` を呼び出し、最近使用したフォルダ履歴を更新・適用する。

---

### `createOrMoveBKItem(select_jquery_id: string, keytop: string) -> Promise<void>`

カテゴリボタンがクリックされた際の決定アクション処理。

* **処理フロー**:
  1. ラジオボタンの状態に応じたクエリ条件を設定。
  2. `Globalx.addStorageSelected` で最後に選択されたフォルダをストレージに設定。
  3. `Target` モードを判定。
     * `'#add-mode'`: `tab_query_async` および `add_mode_x` を呼び出してタブのブックマーク追加を実行。
     * `'#move-mode'`: 移動元ブックマークの情報を取得し、`moveBKItem` を実行。移動元のブックマーク一覧を再読込。
  4. 最近使用した履歴（Recently）を保存・UI更新する。

---

### `closeTabs() -> Promise<void>`

追加処理後の不要になったタブを閉じる。

---

### `addSelectWaitingFolders(select: jQuery, subselect: jQuery) -> void`

移動モードの移動元フォルダリスト（`#zinp`）の選択肢を `getKeys()`（`settings3.js` で定義された key 郡）から構築し、初期化する。

* **処理フロー**:
  1. `getKeys()` をループし、対応するフォルダのIDとタイトルをオプションとして `#zinp` に設定。
  2. オプションの末尾に「#別のフォルダ#」を追加。
  3. 最初のエントリを初期選択状態とし、対応するフォルダ内のブックマーク一覧を `addSelectWaitingItemsX` で `#yinp` に読み込ませる。

---

### `moveBKItem(id: string, src_parent_id: string, dest_parent_id: string) -> Promise<boolean>`

指定されたIDのブックマークを、移動先フォルダ配下へ移動させる。

* **Returns**: 移動に成功した場合は `true` を解決する `Promise`
* **Raises**: エラー時は警告ダイアログ（`alert`）を表示。

---

### `dumpTreeNodesSub(element: Object, count: number, parent_id: string, head_ignore: boolean) -> Object`

`dumpTreeItems` で使用する再帰走査のヘルパーメソッド。ツリーを探索し、フォルダ情報をフラットな配列としてバッファに蓄積する。

---

### `dumpTreeItems(bookmarkTreeNodes: Array, count: number, parent_id: string) -> Object`

ブックマークツリーの配列から、フォルダ一覧バッファを作成して返す。

---

### `makeMenuOnBottomArea() -> void`

ポップアップ UI の下部エリア（カテゴリボタンのグリッド）を動的に構築し、スタイルクラスを適用してイベントをバインドする。

* **処理フロー**:
  1. `getNumOfRows()` (5列) および `getMax()` (400個) を基に、カテゴリボタン群を構築。
  2. 各要素に対し、グリッド配置用クラス `g-<row>-<col>` (例: `g-1-1`, `g-2-1`) を追加。
  3. 下部エリア要素 `#menu` に動的追加。
  4. 各種履歴ストレージ情報を初期ロードし、Recently のセレクト要素（`#rinp`）を復元。

---

### `makeMenuOnBottomAreaAsync() -> Promise<string>`

`makeMenuOnBottomArea` を非同期実行するためのラッパー。

---

### `clear_in_move_mode_area() -> void`

移動モードの選択アイテム情報（タイトル、URL、ID）の表示用テキストエリアをクリアする。

---

### `selectWaitingItemsBtnHdr(option_value: string) -> Promise<void>`

移動モードで現在選択されているブックマークアイテムの詳細情報を取得し、表示用エリア（`#oname`, `#ourl`, `#oid`）にセットする。URLのホスト名抽出も行う。

---

### `makeMenuOnUpperArea(title: string, url: string) -> void`

UIの上部エリア（現在のアクティブタブタイトル・URL、移動元・移動対象セレクト、制御用ボタンなど）に対する初期化およびイベントハンドラの設定を行う。

---

### `setupPopupWindowAsync() -> Promise<void>`

アクティブなタブ情報（タイトル、URL、ID）を取得し、上部エリアの初期値として設定する。

---

### `dumpBookmarksAsync() -> Promise<Array>`

Chromeブックマークツリー全体を非同期で取得する。

---

### `make_popup_ui() -> Promise<void>`

ポップアップのUI構築シーケンスを順次呼び出す。

---

### `get_bookmarks() -> Promise<void>`

ブックマーク情報を取得し、ツリーのダンプ処理を起動する。

---

### `dumpTreeNodesAsync(bookmarkTreeNodes: Array) -> Promise<Array>`

ツリーノードをダンプ走査した結果から、階層パスの一覧を取り出しストレージに設定する。

---

### `start() -> Promise<void>`

ポップアップ全体のメイン起動シーケンス。

* **起動順序**:
  1. `Globalx.initSettings_a()`
  2. `Globalx.initSettings_all()`
  3. `loadItems1()` (カテゴリ定義の非同期ロード)
  4. `get_bookmarks()` (ブックマークツリーの構築、`data` の初期化)
  5. `make_popup_ui()` (UIの構築)

---

### `moveBMX2() -> void`

`/0/0-etc/0` 配下のブックマークを対象に自動ルーティング移動を実行する。

---

### `moveBMX() -> void`

ブックマークバー（ID `'1'`) 配下のブックマークを対象に自動ルーティング移動を実行する。

---

### `print_with_cond_ret(ret: Object) -> void`

デバッグ用。条件（パスが `/Y/DashBoard` に合致）を満たした場合にログを出力する。

---

### `addFc() -> void`

テスト用。`data` のキー一覧から不正なパス（`//` から始まるものなど）を検出してコンソールに出力する。

---

### `createDumpTreeNodes() -> Function`

ブックマークツリーの再帰的解析と、`itemGroup.add_to_itemgroup` を呼び出すダンプ関数のクロージャを作成して返す。

---

## 依存

| クラス/変数 | 用途 |
|-------------|------|
| [AddFolder](file:///E:/Cchrome-ext/bmx/js/addfolder.js) | フォルダ自動追加・日付フォルダ追加などの処理の委譲 |
| [ItemGroup](file:///E:/Cchrome-ext/bmx/js/itemgroup.js) | ツリーダンプ処理および自動ルーティング移動の委譲 |
| [Movergroup](file:///E:/Cchrome-ext/bmx/js/movegroup.js) | 自動ルーティング用ルールの取得 |
| [Util](file:///E:/Cchrome-ext/bmx/js/util.js) | ボタン・セレクト要素作成、ホスト名取得、セレクト更新などのユーティリティ処理 |
| [data](file:///E:/Cchrome-ext/bmx/js/data.js) | ブックマーク情報の格納および取得 |
| [Globalx](file:///E:/Cchrome-ext/bmx/js/globalx.js) | 各種設定情報の初期化、履歴情報の管理・保存 |
| `config/settings3.js` | グリッド構築パラメータ（`getNumOfRows`, `getMax`）および移動元キー情報（`getKeys`）の取得 |
| jQuery (`$`) | DOM操作および動的UI要素生成に使用 |

---

## 設計上の注意

* **非同期と起動順序の厳密性**:
  * 起動順序（`start()` 内の実行ステップ）は非常に厳密である。`get_bookmarks()` による `data` シングルトンの構築が完了する前に `make_popup_ui()` が実行されると、UI要素にフォルダ情報がロードされず、正常にブックマークの保存・移動ができなくなる。
* **UIレイアウトの静的CSS連携**:
  * ボタンへの `g-<row>-<col>` クラスの適用は、動的に生成されたボタンをグリッド上の特定位置に配置するための仕組みであり、`popupy.css` に定義された配置指定と緊密に連携している。
