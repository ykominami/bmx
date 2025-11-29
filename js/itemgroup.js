import { data } from './data.js';
import { Item } from './item.js';

/**
 * ブックマークアイテムグループを管理するクラス
 * @class ItemGroup
 */
export class ItemGroup {
    /**
     * ItemGroupクラスのコンストラクタ
     */
    constructor() {
        this.RootItems = [];
        this.TopItems = [];
    }

    /**
     * IDを数値に変換して返す
     * @param {string} id - 変換するID文字列
     * @returns {number} 変換された数値（NaNの場合は-1を返す）
     */
    determine_id(id) {
        let idnum = Number.parseInt(id, 10);
        let idnumx = idnum;
        if (Number.isNaN(idnum)) {
            idnumx = -1;
        }
        return idnumx;
    }

    /**
     * 要素をアイテムグループに追加する
     * @param {Object} element - 追加する要素
     * @param {Function} dumpTreeNodes - ツリーノードをダンプする関数
     * @returns {Item|null} 追加されたアイテム（ITEMの場合はnull）
     */
    add_to_itemgroup(element, dumpTreeNodes) {
        let item = new Item(element, this);
        if (item.kind === 'ITEM') {
            return null;
        } else {
            data.addItem(item);
            if (element.children.length > 0) {
                item.children = dumpTreeNodes(element.children);
            }
            return item;
        }
    }

    /**
     * BMXフォルダのベースを移動する
     * @param {Object} mover_group - 移動グループ
     * @param {string} src_folder_id - 移動元フォルダID
     * @returns {Promise<void>}
     */
    async moveBMXFolderBase(mover_group, src_folder_id) {
        // Manifest V3: chrome.bookmarks.getChildren() returns a Promise
        const bookmarkItems = await chrome.bookmarks.getChildren(`${src_folder_id}`);
        bookmarkItems.map((bookmarkItem) => {
            mover_group.move(bookmarkItem);
        });
    }
}