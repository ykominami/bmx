``` mermaid
    classDiagram
        direction TB

        %% クラスおよびシングルトン、静的ユーティリティの定義
        class PopupManager {
            +addFolder: AddFolder
            +itemGroup: ItemGroup
            +start()
            +make_popup_ui()
        }
        class AddFolder {
            +addFolderx()
            +addDayFolderx()
            +getOrCreateFolder()
        }
        class ItemGroup {
            +RootItems: Array
            +TopItems: Array
            +add_to_itemgroup()
            +moveBMXFolderBase()
        }
        class Item {
            +id: string
            +hier: string
            +kind: string
            +folder: boolean
        }
        class Movergroup {
            +group: Object
            +keys: Array
            +get_mover_group()$
            +move()
        }
        class Mover {
            +hier: string
            +url: string
            +move()
        }
        class data {
            <<singleton>>
            +ItemHash: Object
            +ItemHashByHier: Object
            +getItem()
            +getItemByHier()
            +addItem()
        }
        class Globalx {
            <<static>>
            +Settings: Object
            +getStorageOptions()$
            +addRecentlyItemX()$
        }
        class Util {
            <<static>>
            +parseURLX()$
            +restoreSelectRecently()$
        }

        %% 依存関係の定義
        PopupManager --> AddFolder : "インスタンス保持"
        PopupManager --> ItemGroup : "インスタンス保持"
        PopupManager ..> Movergroup : "シングルトン取得"
        PopupManager ..> data : "データ登録・参照"
        PopupManager ..> Globalx : "設定・履歴のロード・保存"
        PopupManager ..> Util : "UI/URL処理ユーティリティ"

        AddFolder ..> data : "フォルダ追加時に登録"
        AddFolder ..> Util : "日付フォーマット処理"

        ItemGroup ..> Item : "要素解析時にインスタンス化"
        ItemGroup ..> data : "フォルダ追加時に登録"
        ItemGroup ..> Movergroup : "moveBMXFolderBaseでメソッド呼出"

        Item ..> data : "親フォルダの階層検索"
        Item ..> ItemGroup : "IDの数値変換ロジック"

        Movergroup ..> Mover : "ルール追加時にインスタンス化"
        Movergroup ..> Util : "URLからホスト名抽出"

        Mover ..> data : "移動先の親フォルダを階層パスから検索"

        Globalx ..> data : "データ構造作成 (makeItemHashX)"

        Util ..> Globalx : "最近使ったセレクト項目の復元"
```