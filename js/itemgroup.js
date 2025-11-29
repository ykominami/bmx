import { data } from './data.js';
import { Item } from './item.js';

export class ItemGroup {
    constructor() {
        this.RootItems = [];
        this.TopItems = [];
    }

    determine_id(id) {
        let idnum = Number.parseInt(id, 10);
        let idnumx = idnum;
        if (Number.isNaN(idnum)) {
            idnumx = -1;
        }
        return idnumx;
    }

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

    async moveBMXFolderBase(mover_group, src_folder_id) {
        // Manifest V3: chrome.bookmarks.getChildren() returns a Promise
        const bookmarkItems = await chrome.bookmarks.getChildren(`${src_folder_id}`);
        bookmarkItems.map((bookmarkItem) => {
            mover_group.move(bookmarkItem);
        });
    }
}