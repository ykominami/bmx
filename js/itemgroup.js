<<<<<<< HEAD
import {addItem, getItem,} from './data.js';
import {dumpTreeNodes} from './treenode.js';

let RootItems = [];
let TopItems = [];

// TODO: 引数elementには、chrome.bookmark.getTree()の返値が渡されると想定している
function determine_id(id) {
    let idnum = Number.parseInt(id, 10);
    let idnumx = idnum;
    if (Number.isNaN(idnum)) {
        idnumx = -1;
    }
    return idnumx;
}

function create_item(element) {
    let idnumx = determine_id(element.id);
    let parentIdnumx = determine_id(element.parentId);

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
        // console.log(`a 2`);
        item.root = true;
        item.kind = 'ROOT';
        RootItems.push(item);
    } else {
        if (parentIdnumx === 0) {
            item.top = true;
            item.kind = 'TOP';
            TopItems.push(item);
        } else {
            item.kind = 'FOLDER';
            /* 親フォルダが通常のフォルダであれば、自身の階層名をつくる */
            let parent_item = getItem(item.parentId);
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

function add_to_itemgroup(element) {
    let item = create_item(element);
    // console.log(`In A add_to_itemgroup item.kind=${item.kind}`);
    if (item.kind === 'ITEM') {
        return null;
    } else {
        // console.log(`In B add_to_itemgroup item.kind=${item.kind}`);
        addItem(item);
        if (element.children.length > 0) {
            // console.log(`In D add_to_itemgroup item.kind=${item.kind}`);
            item.children = dumpTreeNodes(element.children);
        }
        return item;
    }
}

async function moveBMXFolderBase(mover_group, src_folder_id) {
    let bookmarkItems = [];
    await chrome.bookmarks
        .getChildren(`${src_folder_id}`)
        .then((bms) => (bookmarkItems = bms));
    bookmarkItems.map((bookmarkItem) => {
        //console.log(`bookmarkItem.title = ${bookmarkItem.title}`);
        mover_group.move(bookmarkItem);
    });
}

export {add_to_itemgroup, moveBMXFolderBase};
||||||| 08029bf
=======
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
        let bookmarkItems = [];
        await chrome.bookmarks
            .getChildren(`${src_folder_id}`)
            .then((bms) => (bookmarkItems = bms));
        bookmarkItems.map((bookmarkItem) => {
            mover_group.move(bookmarkItem);
        });
    }
}
>>>>>>> efcf8e4b9b2c746ea90beb135e3e49d30d1d102a
