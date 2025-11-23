import { Util } from './util.js'; // Updated import

import {getFoldersFromDayPrefixes, getFoldersFromPrefixes, getPrefix,} from '../config/settings2.js';

import { data } from './data.js';

export class AddFolder {
    constructor() {
        // No specific state to initialize for now, but constructor is good practice.
    }

    /* folder追加処理 */
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

    /* folder追加処理 */
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

    registerx(key, value) {
        data.setItemByHier(key, value);
        data.setItem(value.id, value);
    }

    makeElement(idx, parentidx, indexx, urlx, titlex) {
        return {
            id: idx,
            parentId: parentidx,
            index: indexx,
            url: urlx,
            title: titlex,
        };
    }

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
    async makeAndRegisterBookmarkFolder(keytop, parentidx, indexx, titlex) {
        let parentidstr = '';
        if( parentidx != null ) {
            parentidstr = `${parentidx}`;
        }
        console.log(`makeAndRegisterBookmarkFolder parentidstr=${parentidstr}`);
        
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

        return item;
    }

    async addFolderx() {
        let folders = getFoldersFromPrefixes();
        let year_month = this.getYearAndNextMonthAsString(); // Call instance method

        for (const parent of folders) {
            const parent_item = data.getItemByHier(parent);
            if (parent_item != null && parent_item.id != null) {
                let prefix = getPrefix(parent);
                let title = `${prefix}-${year_month}`;
                let new_keytop = `${parent}/${title}`;
                let new_item = data.getItemByHier(new_keytop);
                if (new_item === null) {
                    new_item = await this.makeAndRegisterBookmarkFolder(new_keytop, parent_item.id, 0, title); // Call instance method
                }
            }
        }
    }

    async addDayFolderx() {
        let folders = getFoldersFromDayPrefixes();
        console.log(`addDayFolderx folders=${JSON.stringify(folders)}`);
        let [y_str, ym_str, ymd_str] = this.getYearAndMonthAndDayAsString(); // Call instance method

        // "Y/Day"
        for (let parent of folders) {
            if (parent == null) {
                parent = '';
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
            const arrayx = [parent, y_str, ym_str, ymd_str];
            console.log(`arrayx=${JSON.stringify(arrayx)}`);
            let accumulator = '';
            for (const currentValue of arrayx) {
                const parent_item = data.getItemByHier(accumulator);
                const hier = [accumulator, currentValue].join('/');
                let item = data.getItemByHier(hier);
                if (item === null) {
                    if( parent_item != null) {
                        let new_item = await this.makeAndRegisterBokkmarkFolderx(parent_item, currentValue, hier); // Call instance method
                        item = new_item
                    }
                    console.log(`[new] item=${JSON.stringify(item)}`);
                    let new_item = data.getItemByHier(hier);
                    console.log(`new_item=${JSON.stringify(new_item)}`);
                    item = new_item;
                }
                console.log(`parent=${parent} hier=${hier} item=${item}`);
                console.log(`parent_item=${JSON.stringify(parent_item)}`);
                
                accumulator = hier; // Update accumulator for next iteration (like reduce)
            }
        }
    }

    async makeAndRegisterBokkmarkFolderx(parent_item, title, new_keytop) {
        let new_item = data.getItemByHier(new_keytop);
        if (new_item === null) {
            if( parent_item != null && parent_item.id != null) {
                let new_item_0 = await this.makeAndRegisterBookmarkFolder(new_keytop, parent_item.id, 0, title); // Call instance method
                new_item = data.getItemByHier(new_keytop);
            }
        }
        return new_item;
    }

    async lstree() {
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
