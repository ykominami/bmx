/**
 * データ管理クラス
 * @class Data
 */
class Data {
    /**
     * Dataクラスのコンストラクタ
     */
    constructor() {
		this.ItemHashByHier = {};
		this.ItemHash = {};
    }

    /**
     * アイテムハッシュを作成する
     * @param {string} key - キー
     * @returns {Object} アイテムハッシュオブジェクト
     */
    makeItemHashX(key) {
        let hash = {};
        hash[key] = {
            ItemHashByHier: this.ItemHashByHier,
            ItemHash: this.ItemHash,
        };
        return hash;
    }

    /**
     * ブックマークツリーノードからアイテムIDの配列を取得する
     * @param {Array} bookmarkTreeNodes - ブックマークツリーノードの配列
     * @returns {Array<string>} アイテムIDの配列
     */
    dumpTreeItemsX(bookmarkTreeNodes) {
        let ary = [];
        let i;
        for (i = 0; i < bookmarkTreeNodes.length; i++) {
            const element = bookmarkTreeNodes[i];
            if (element.url) {
                ary.push(element.id);
            }

            if (element.children) {
                ary = ary.concat(this.dumpTreeItemsX(element.children));
            }
        }
        return ary;
    }

    /**
     * フォルダIDからトップレベルのアイテムIDの配列を取得する
     * @param {string} folder_id - フォルダID
     * @returns {Promise<Array<string>>} アイテムIDの配列
     */
    async dumpTreeItemsXTop(folder_id) {
        const item = this.getItem(folder_id);

        // Manifest V3: chrome.bookmarks.getSubTree() returns a Promise
        const bookmarkTreeNodes = await chrome.bookmarks.getSubTree(item.id);
        const zary = this.dumpTreeItemsX(bookmarkTreeNodes);
        return zary;
    }

    /**
     * 階層パスからアイテムを取得する
     * @param {string} key - 階層パス
     * @returns {Object|null} アイテムオブジェクト（存在しない場合はnull）
     */
    getItemByHier(key) {
        let result = null
        if (this.ItemHashByHier[key] != null) {
            result = this.ItemHashByHier[key];
        }
        return result;
    }

    /**
     * 階層パスにアイテムを設定する
     * @param {string} key - 階層パス
     * @param {Object} value - アイテムオブジェクト
     * @returns {Object|null} 設定されたアイテム（既に存在する場合はnull）
     */
    setItemByHier(key, value) {
        if(key == null || key.length == 0 || key.trim() == '') {
            return null;
        }
        if( this.ItemHashByHier[key] != null) {
            return null;
        }
        return (this.ItemHashByHier[key] = value);
    }

    /**
     * 階層パスのキー一覧を取得する
     * @returns {Array<string>} 階層パスのキー配列
     */
    getKeysOfItemByHier() {
        return Object.keys(this.ItemHashByHier);
    }

    /**
     * 階層パスのキー一覧を取得する（getKeysOfItemByHierのエイリアス）
     * @returns {Array<string>} 階層パスのキー配列
     */
    getItemHashByHierKeys() {
        return Object.keys(this.ItemHashByHier);
    }

    /**
     * IDからアイテムを取得する
     * @param {string} key - アイテムID
     * @returns {Object|null} アイテムオブジェクト（存在しない場合はnull）
     */
    getItem(key) {
        if (this.ItemHash[key]) {
            return this.ItemHash[key];
        } else {
            return null;
        }
    }

    /**
     * IDにアイテムを設定する
     * @param {string} key - アイテムID
     * @param {Object} value - アイテムオブジェクト
     * @returns {Object|null} 設定されたアイテム（既に存在する場合はnull）
     */
    setItem(key, value) {
        if(key == null || key.length == 0 || key.trim() == '') {
            return null;
        }
        if(this.ItemHash[key] != null) {
            return null;
        }
        return (this.ItemHash[key] = value);
    }

    /**
     * アイテムを追加する（IDと階層パスの両方に設定）
     * @param {Object} item - アイテムオブジェクト
     */
    addItem(item) {
        // console.log(`addItem item=${JSON.stringify(item)}`);
        this.setItem(item.id, item);
        this.setItemByHier(item.hier, item);
    }
    /**
     * ブックマークバーのトップアイテムを取得する
     * @returns {Object|null} ブックマークバーのトップアイテム（ID: '1'）
     */
    getBookmarkBarTopItem() {
        return this.getItem('1');
    }
}

const data = new Data();
export { data };