# 内部仕様書 — インデックス

`js/**/*.js` から生成したクラス別・モジュール別内部仕様書の一覧。

| ファイル | クラス/モジュール | 概要 |
|---------|--------|------|
| [data.md](data.md) | `Data` | ブックマークアイテムを ID・階層パスの 2 系統で保持するシングルトンデータストア |
| [globalx.md](globalx.md) | `Globalx` | `chrome.storage.local` を管理する static メソッド専用の新グローバル設定クラス |
| [item.md](item.md) | `Item` | Chrome ブックマークノードを ROOT/TOP/FOLDER/ITEM に分類するモデルクラス |
| [itemgroup.md](itemgroup.md) | `ItemGroup` | `Item` 生成とツリー走査・フォルダベース移動の起点処理を担うクラス |
| [movegroup.md](movegroup.md) | `Movergroup` | ホスト名 → 移動先フォルダのルールを束ねるディスパッチャクラス |
| [mover.md](mover.md) | `Mover` | 単一の移動元条件と移動先フォルダを結びつけるクラス |
| [global.md](global.md) | `Global`（モジュール） | `chrome.storage.local` を管理するレガシーなモジュールレベル関数群（`Globalx` と重複） |
| [util.md](util.md) | `Util` | 日付整形・jQuery 要素生成・URL 解析などの static ユーティリティクラス |
| [addfolder.md](addfolder.md) | `AddFolder` | 日付ベースの階層フォルダを作成・登録するクラス |
| [popupx.md](popupx.md) | `PopupManager` | ポップアップ UI 全体を統括するコントローラクラス |
| [popupx_module.md](popupx_module.md) | `Popupx`（モジュール） | `config/items1.json` を読み込むモジュールレベル関数 `loadItems1()` |
