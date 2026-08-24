# 内部仕様書 — インデックス

`js/**/*.js` から生成したクラス別・モジュール別内部仕様書の一覧。

| ファイル | クラス/モジュール | 概要 |
|---------|--------|------|
| [data.md](data.md) | `Data` | ID索引・階層パス索引の2つのハッシュマップでブックマークアイテムを管理するデータストア |
| [data_module.md](data_module.md) | `data`（モジュール） | `Data` のシングルトンインスタンスを生成・公開するモジュールレベル定義 |
| [globalx.md](globalx.md) | `Globalx` | `chrome.storage.local` の `all` キー配下を管理するストレージ抽象化クラス（static専用） |
| [item.md](item.md) | `Item` | Chromeブックマークノード1件を表現し、種別判定と階層パス算出を行う値オブジェクト |
| [itemgroup.md](itemgroup.md) | `ItemGroup` | ブックマークツリーを再帰走査し `data` へ登録する走査ドライバ |
| [movegroup.md](movegroup.md) | `Movergroup` | ホスト名→移動先階層パスのハードコードルールを保持する自動振り分けシングルトン |
| [mover.md](mover.md) | `Mover` | 単一の (階層パス, ホスト名) ペアに基づきブックマークを移動する実行単位 |
| [global.md](global.md) | `global`（モジュール） | `Globalx` と機能的に重複する、クラス化以前の関数ベースのレガシーストレージ管理モジュール |
| [util.md](util.md) | `Util` | 日付整形・jQuery要素生成・URL解析などの横断ヘルパー（static専用） |
| [addfolder.md](addfolder.md) | `AddFolder` | 階層パスからのフォルダ取得・作成、月次/日次の自動フォルダ作成を行うクラス |
| [popupx.md](popupx.md) | `PopupManager` | ポップアップUIの構築とイベント処理を統括するコントローラ |
| [popupx_module.md](popupx_module.md) | `popupx`（モジュール） | `config/items1.json` を読み込む `loadItems1()` と、モジュール読み込み時の `PopupManager` 起動処理 |
