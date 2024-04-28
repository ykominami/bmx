import {
    addItem,
    getItem,
} from './data.js';
import {dumpTreeNodes} from './treenode.js';

let RootItems = [];
let TopItems = [];

// TODO: 引数elementには、chrome.bookmark.getTree()の返値が渡されると想定している
function determine_id(id){
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
    if (parentIdnumx == -1) {
        // console.log(`a 2`);
        item.root = true;
        item.kind = 'ROOT';
        RootItems.push(item);
    } else {
        if (parentIdnumx == 0) {
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
    if (item.kind == 'ITEM') {
        return null;
    } else {
        // console.log(`In B add_to_itemgroup item.kind=${item.kind}`);
        addItem(item);
        if (element.children != undefined) {
            // console.log(`In C add_to_itemgroup item.kind=${item.kind}`);
            if (element.children.length > 0) {
                // console.log(`In D add_to_itemgroup item.kind=${item.kind}`);
                item.children = dumpTreeNodes(element.children);
            }
        }
        return item;
    }
}

function getItemFromRoot(key) {
    let ret = RootItems.find((element) => {
        element.title = key;
    });
    if (ret === undefined) {
        ret = null;
    }
    return ret;
}

function makeIndent(indentLength) {
    return '.'.repeat(indentLength);
}

function logItems(bookmarkItem, indent) {
    if (indent > 1) {
        return;
    }
    if (bookmarkItem.url) {
        console.log(makeIndent(indent) + bookmarkItem.url);
    } else {
        console.log(`${makeIndent(indent)}Folder`);
        console.log(
            `${makeIndent(indent)}bookmarkItem.parentId=${bookmarkItem.parentId}`
        );
        console.log(
            `${makeIndent(indent)}bookmarkItem.title=${bookmarkItem.title}`
        );
        console.log(`${makeIndent(indent)}bookmarkItem.id=${bookmarkItem.id}`);
        indent++;
    }
    if (bookmarkItem.children) {
        for (const child of bookmarkItem.children) {
            logItems(child, indent);
        }
    }
    indent--;
}

function logItems2(bookmarkItem, indent) {
    if (indent > 1) {
        return;
    }
    if (bookmarkItem.url) {
        console.log(makeIndent(indent) + bookmarkItem.url);
    } else {
        console.log(`${makeIndent(indent)}Folder`);
        console.log(
            `${makeIndent(indent)}bookmarkItem.parentId=${bookmarkItem.parentId}`
        );
        console.log(
            `${makeIndent(indent)}bookmarkItem.title=${bookmarkItem.title}`
        );
        console.log(`${makeIndent(indent)}bookmarkItem.id=${bookmarkItem.id}`);
        indent++;
    }
    if (bookmarkItem.children) {
        for (const child of bookmarkItem.children) {
            logItems(child, indent);
        }
    }
    indent--;
}

function parse_b(parser) {
    let searchParams = parser.searchParams;
    let origin = parser.origin;
    let port = parser.port;
    let hash = parser.hash;

    let iterator = searchParams.entries();
    let iteratorResult;
    while (true) {
        iteratorResult = iterator.next(); // 順番に値を取りだす
        if (iteratorResult.done) break; // 取り出し終えたなら、break
    }
    console.log(`==== END`);
    console.log(`${searchParams.get('s')}`);
    console.log(`${searchParams.get('sr')}`);

    searchParams.forEach((value, name) => {
        console.log(`${name}:${value}`);
    });
    console.log(`hash[s]=${hash['s']}`);
    console.log(`hash[sr]=${hash['sr']}`);
}

export {getItemFromRoot, add_to_itemgroup};
