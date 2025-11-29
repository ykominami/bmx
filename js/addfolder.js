import { Util } from './util.js'; // Updated import

import {getFoldersFromDayPrefixes, getFoldersFromPrefixes, getPrefix,} from '../config/settings2.js';

import { data } from './data.js';

/**
 * フォルダを追加・管理するクラス
 * @class AddFolder
 */
export class AddFolder {
    /**
     * AddFolderクラスのコンストラクタ
     */
    constructor() {
        // No specific state to initialize for now, but constructor is good practice.
    }

    /**
     * 現在の年と次の月を文字列として取得する（YYYYMM形式）
     * @returns {string} 年と次の月の文字列（例: "202501"）
     */
    getYearAndNextMonthAsString() {
        let current = new Date();
        let month = current.getMonth();
        // 次の月に設定する
        current.setMonth(month + 1);
        let year = current.getFullYear();
        let next_month = Util.getMonthx(current); // Updated call
        let monthstr = Util.adjustAsStr(next_month); // Updated call
        return `${year}${monthstr}`;
    }

    /**
     * 現在の年、月、日を文字列として取得する
     * @returns {Array<string>} [年, 年月, 年月日]の配列（例: ["2025", "202501", "20250107"]）
     */
    getYearAndMonthAndDayAsString() {
        let current = new Date();
        let month = current.getMonth();
        let monthx = Util.getMonthx(current); // Updated call
        let year = current.getFullYear();

        // console.log(`month=${month}`);
        // console.log(`monthx=${monthx}`);
        //  console.log(`next_month=${next_month}`);

        let month_str = Util.adjustAsStr(monthx); // Updated call
        let date = current.getDate();
        let date_str = Util.adjustAsStr(date); // Updated call
        //let date_str = date.padStart(2, '0'));

        // 次の月に設定する
        let y_str = `${year}`;
        let ym_str = `${year}${month_str}`;
        let ymd_str = `${year}${month_str}${date_str}`;

        return [y_str, ym_str, ymd_str];
    }

    /**
     * アイテムを登録する（階層パスとIDの両方に設定）
     * @param {string} key - 階層パス
     * @param {Object} value - アイテムオブジェクト
     */
    registerx(key, value) {
        data.setItemByHier(key, value);
        data.setItem(value.id, value);
    }

    /**
     * ブックマーク要素オブジェクトを作成する
     * @param {string} idx - ID
     * @param {string} parentidx - 親ID
     * @param {number} indexx - インデックス
     * @param {string|null} urlx - URL
     * @param {string} titlex - タイトル
     * @returns {Object} ブックマーク要素オブジェクト
     */
    makeElement(idx, parentidx, indexx, urlx, titlex) {
        return {
            id: idx,
            parentId: parentidx,
            index: indexx,
            url: urlx,
            title: titlex,
        };
    }

    /**
     * アイテムオブジェクトを作成する
     * @param {Object} element - ブックマーク要素オブジェクト
     * @returns {Object} アイテムオブジェクト
     */
    makeItem(element) {
        return {
            id: element.id,
            folder: true,
            root: false,
            top: false,
            parentId: element.parentId,
            posindex: element.index,
            url: element.url,
            title: element.title,
            hier: '' /* hier */,
            children: [],
        };
    }
    /**
     * ブックマークフォルダを作成して登録する
     * @param {string} keytop - 階層パス
     * @param {string|null} parentidx - 親ID
     * @param {number} indexx - インデックス
     * @param {string} titlex - タイトル
     * @param {number} from - 呼び出し元の識別子
     * @returns {Promise<Object>} 作成されたアイテムオブジェクト
     */
    async makeAndRegisterBookmarkFolder(keytop, parentidx, indexx, titlex, from) {
        let parentidstr = '';
        if( parentidx != null ) {
            parentidstr = `${parentidx}`;
        }
        console.log(`makeAndRegisterBookmarkFolder from=${from} parentidstr=${parentidstr} titlex=${titlex}`);
        
        // Manifest V3: chrome.bookmarks.create() returns a Promise
        const newFolder = await chrome.bookmarks.create({
            parentId: parentidstr,
            index: indexx,
            title: titlex,
        });
        
        let element = this.makeElement(newFolder.id, parentidx, indexx, null, titlex); // Call instance method

        let item = this.makeItem(element); // Call instance method
        item.hier = keytop;
        this.registerx(keytop, item); // Call instance method
        console.log(`makeAndRegisterBookmarkFolder from=${from} keytop=${keytop} item=${JSON.stringify(item)}`);

        return item;
    }

    /**
     * フォルダを追加する（次の月のフォルダを作成）
     * @returns {Promise<void>}
     */
    async addFolderx() {
        let folders = getFoldersFromPrefixes();
        let year_month = this.getYearAndNextMonthAsString(); // Call instance method

        for (const parent_name of folders) {
            const parent_item = await this.getOrCreateFolder(parent_name);
            if (parent_item != null) {
                let prefix = getPrefix(parent_name);
                let title = `${prefix}-${year_month}`;
                let new_keytop = `${parent}/${title}`;
                console.log(`addFolderx new_keytop=${new_keytop}`);
                console.log(`addFolderx parent_name=${parent_name}`);
                await this.getOrCreateFolder(new_keytop);
            }
        }
    }
    /**
     * 配列から階層パスを構築してフォルダを取得または作成する
     * @param {Array<string>} ary - 階層パスのセグメント配列
     * @returns {Promise<Object>} フォルダアイテムオブジェクト
     */
    async getOrCreateFolderWithArray(ary) {
        console.log(`getOrCreateFolderWithArray ary=${JSON.stringify(ary)}`);

        let parent_item = null;
        if( ary.length <= 1) {
            return data.getBookmarkBarTopItem();
        }
        if( ary.length === 2) {
            if( ary[0] !== '' ) {
                throw new Error('hier must be a non-empty string');
            }
            else{
                parent_item = data.getBookmarkBarTopItem();
            }
        }
        let hier = ary.join('/');
        let item = data.getItemByHier(hier);
        if( item != null ) {
            return item;
        }
        const parent_array = ary.slice(0, -1);
        console.log(`getOrCreateFolderWithArray parent_array=${JSON.stringify(parent_array)}`);
        parent_item = await this.getOrCreateFolderWithArray(parent_array);
        let title = ary[ary.length - 1]
        console.log(`getOrCreateFolderWithArray title=${title}`);
        let new_item = await this.makeAndRegisterBookmarkFolder(hier, parent_item.id, 0, title, 1);    
        return new_item;
    }
    /**
     * 階層パスからフォルダを取得または作成する
     * @param {string} hier - 階層パス
     * @returns {Promise<Object>} フォルダアイテムオブジェクト
     * @throws {Error} hierが空文字列の場合
     */
    async getOrCreateFolder(hier) {
        console.log(`getOrCreateFolder D1 hier=${hier}`);
        if (typeof hier !== 'string' || hier.length === 0) {
            throw new Error('hier must be a non-empty string');
        }

        // ベースケース: 既に存在する場合はそれを返す
        const existingItem = data.getItemByHier(hier);
        if (existingItem != null) {
            console.log(`getOrCreateFolder D2 existingItem=${JSON.stringify(existingItem)}`);
            return existingItem;
        }

        // 再帰ケース: パスをセグメントに分割
        const segments = hier.split('/')
        
        // 親パスを構築（最後のセグメントを除く）
        const parentSegments = segments.slice(0, -1);
        let parent_item = await this.getOrCreateFolderWithArray(parentSegments);
        let title = segments[segments.length - 1];
        console.log(`getOrCreateFolder D3 title=${title}`);                
        let new_item = await this.makeAndRegisterBookmarkFolder(hier, parent_item.id, 0, title, 2);    

        return new_item;
    }

    /**
     * 日付フォルダを追加する（年、年月、年月日のフォルダを作成）
     * @returns {Promise<void>}
     */
    async addDayFolderx() {
        let folders = getFoldersFromDayPrefixes();
        console.log(`addDayFolderx folders=${JSON.stringify(folders)}`);
        let [y_str, ym_str, ymd_str] = this.getYearAndMonthAndDayAsString(); // Call instance method
        let hier = '';

        // "Y/Day"
        for (let parent_name of folders) {
            if (parent_name == null) {
                parent_name = '';
            }
            if (y_str == null) {
                y_str = '';
            }
            if (ym_str == null) {
                ym_str = '';
            }
            if (ymd_str == null) {
                ymd_str = '';
            }
            // const arrayx = [parent, y_str, ym_str, ymd_str];
            const arrayx = [y_str, ym_str, ymd_str];
            console.log(`arrayx=${JSON.stringify(arrayx)}`);
            let accumulator = parent_name;
            for (const currentValue of arrayx) {
                hier = [accumulator, currentValue].join('/');
                console.log(`addDayFolderx hier=${hier}`);
                console.log(`addDayFolderx accumulator=${accumulator}`);
                let item = await this.getOrCreateFolder(hier);
                console.log(`addDayFolderx item=${ JSON.stringify(item)}`);
                accumulator = hier; // Update accumulator for next iteration (like reduce)
            }
        }
    }

    /**
     * 指定されたIDのブックマークノード（ブックマークまたはフォルダ）の
     * タイトルを非同期で取得します。
     *
     * @param {string} nodeId - タイトルを取得したいブックマークノードのID。
     * @returns {Promise<string>}
     * ノードのタイトルを解決するPromise。ノードが存在しない、またはエラーの場合はPromiseを拒否します。
     */
    async getBookmarkTitle(nodeId) {
        return new Promise((resolve, reject) => {
        if (!nodeId || typeof nodeId !== 'string') {
            return reject(new Error("無効なノードIDが提供されました。IDは文字列である必要があります。"));
        }
    
        // chrome.bookmarks.get(id, callback) を使用して指定されたノードを取得します
        chrome.bookmarks.get(nodeId, (nodes) => {
            // APIがエラーを報告したかチェックします
            if (chrome.runtime.lastError) {
            console.error(`ID ${nodeId} のブックマーク取得中にエラーが発生しました:`, chrome.runtime.lastError.message);
            reject(new Error(chrome.runtime.lastError.message));
            return;
            }
            
            // chrome.bookmarks.get() はノードの配列を返すため、最初のエントリを確認します
            if (!nodes || nodes.length === 0) {
            // IDが有効でない場合やノードが見つからない場合に発生します
            reject(new Error(`ID "${nodeId}" に対応するブックマークノードが見つかりませんでした。`));
            return;
            }
    
            // 最初のノード（nodes[0]）が、指定されたIDのノードです
            const node = nodes[0];
            
            // 成功した場合、ノードのタイトルを解決します
            resolve(node.title);
        });
        });
    }
    
    /**
     * ブックマークツリーをリスト表示する（テスト用）
     * @returns {Promise<void>}
     */
    async lstree() {
        this.getBookmarkTitle('0').then((title) => {
            console.log(`title=${title}`);
        });
        this.getBookmarkTitle(('1')).then((title) => {
            console.log(`title=${title}`);
        });
        this.getBookmarkTitle(('2')).then((title) => {
            console.log(`title=${title}`);
        });
        this.getBookmarkTitle(('3')).then((title) => {
            console.log(`title=${title}`);
        });
    }
    /**
     * ブックマークツリーをリスト表示する（テスト用、特定の階層パス）
     * @returns {Promise<void>}
     */
    async lstree_0() {
        // const hier = '/Y/Day/2023/202311';
        // const hier = '/0/Day-Arc/2023/202311';
        // let keys = data.getKeysOfItemByHier();
        // keys.map((key) => console.log(key));

        // const hier = '/0/Day-Arc/2023/202311';
        const hier = '/0/Y-DAY/Day/2025/202504/20250407';
        let item = data.getItemByHier(hier);
        console.log(item);
        if( item != null && item.id != null) {
            let ary = await data.dumpTreeItemsXTop(item.id);
            ary.map((item_id) => console.log(item_id));
        }
    }
}
