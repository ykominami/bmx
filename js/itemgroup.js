import { data } from './data.js';

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

    create_item(element) {
        let idnumx = this.determine_id(element.id);
        let parentIdnumx = this.determine_id(element.parentId);

        let item = {
            id: element.id,
            idnum: idnumx,
            folder: true,
            root: false,
            top: false,
            kind: '',
            parentId: element.parentId,
            parentIdnum: parentIdnumx,
            posindex: element.index,
            url: element.url,
            title: element.title,
            hier: '' /* hier */,
            children: [],
        };
        if (item.url) {
            item.folder = false;
            item.kind = 'ITEM';
            return item;
        }
        if (parentIdnumx === -1) {
            item.root = true;
            item.kind = 'ROOT';
            this.RootItems.push(item);
        } else {
            if (parentIdnumx === 0) {
                item.top = true;
                item.kind = 'TOP';
                this.TopItems.push(item);
            } else {
                item.kind = 'FOLDER';
                let parent_item = data.getItem(item.parentId);
                if (parent_item == null) {
                    item.hier = '';
                } else {
                    let parent_hier = parent_item.hier;
                    item.hier = parent_hier + '/' + item.title;
                }
            }
        }
        return item;
    }

    add_to_itemgroup(element, dumpTreeNodes) {
        let item = this.create_item(element);
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