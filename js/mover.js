import { data } from './data.js';

/**
 * ブックマークを移動するクラス
 * @class Mover
 */
export class Mover {
    /**
     * Moverクラスのコンストラクタ
     * @param {string} hier - 階層パス
     * @param {string} url - URL
     */
    constructor(hier, url){
        this.hier = hier
        this.url = url
        this.dest_parent_item = data.getItemByHier(this.hier)
    }
    /**
     * ブックマークアイテムを移動する
     * @param {Object} bookmarkItem - 移動するブックマークアイテム
     * @param {string} bookmarkItem.id - ブックマークアイテムID
     * @returns {Promise<Object>} 移動結果
     * @throws {Error} 移動先の親アイテムが見つからない場合
     */
    async move(bookmarkItem){
        if( this.dest_parent_item != null ){
            // Manifest V3: chrome.bookmarks.move() returns a Promise
            return await chrome.bookmarks.move(bookmarkItem.id, {parentId: this.dest_parent_item.id});
        } else {
            return Promise.reject(new Error("Destination parent item not found."));
        }
    }
}
