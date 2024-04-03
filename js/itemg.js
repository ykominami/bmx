import {
  addItem,
  getItemByHier,
  getKeysOfItemByHier,
  getItem,
} from './data.js';
import { dumpTreeNodes } from './treenode.js';
import { getKeysOfStorageHiers } from './global.js';
import { Mover } from './mover.js';
import { Movergroup } from './movergroup.js';
import { parseURLX, parseURLX2 } from './util.js';
import { debugPrint2, debugPrint } from './debug.js';

let RootItems = [];
let TopItems = [];
// TODO: 引数elementには、chrome.bookmark.getTree()の返値が渡されると想定している

function create_item(element) {
  return {
    id: element.id,
    folder: true,
    root: false,
    top: false,
    kind: '',
    parentId: element.parentId,
    posindex: element.index,
    url: element.url,
    title: element.title,
    hier: '' /* hier */,
    children: [],
  };
}
function add_to_itemgroup(element) {
  // debugPrint2(`add_to_itemgroup 0`);
  /* フォルダのみを処理する（項目は無視する） */
  // if (element.url) {
  //  return null;
  //}
  let idnum = parseInt(element.id, 10);
  // debugPrint2(`idnum=${idnum}`);
  let parentIdnum = parseInt(element.parentId, 10);
  // debugPrint2(`parentIdnum=${parentIdnum}`);

  // debugPrint2(`element.url=${element.url}`);

  let item = create_item(element);
  if (element.url) {
    return null;
  } else {
    if (Number.isNaN(parentIdnum)) {
      // debugPrint2(`a 2`);
      item.root = true;
      item.kind = 'ROOT';
      RootItems.push(item);
      // item.hier = "";
      // item.hier = item.title;
    } else {
      // debugPrint2(`a idnum=${idnum}}`);
      // debugPrint2(`a parentIdnum=${parentIdnum}}`);
      /* 親フォルダがルート階層のフォルダであればトップ階層のフォルダにする */
      if (parentIdnum == 0) {
        // debugPrint2(`a 3 item.title=${item.title}`);
        item.top = true;
        item.kind = 'TOP';
        // item.hier = "";
        TopItems.push(item);
      } else {
        item.kind = 'FOLDER';

        // debugPrint2(`a 4 item.title=${item.title}`);
        /* 親フォルダが通常のフォルダであれば、自身の階層名をつくる */
        // debugPrint2(`add_to_itemgroup 5 item.parentId=${item.parentId}`);
        // debugPrint2(`add_to_itemgroup 7 item.parentId=${item.parentId}`);
        let parent_item = getItem(item.parentId);
        if (parent_item == null) {
          item.hier = '';
        } else {
          let parent_hier = parent_item.hier;
          item.hier = parent_hier + '/' + item.title;
        }
      }
    }
  }
  if (item.folder == true) {
    addItem(item);
    if (element.children != undefined) {
      if (element.children.length > 0) {
        let ignore_head = true;
        /* debugPrint2(
          `add_to_itemgroup element.children 2 root=${item.root} top=${item.top} parentIdnum=${parentIdnum} item.id=${item.id} item.title=${item.title}`
        );
        */
        item.children = dumpTreeNodes(element.children);
        // item.children = dumpTreeNodes(element.children);
        // debugPrint2(`2 getKeysOfItemByHier()=${getKeysOfItemByHier()}`);
        /* debugPrint2(
          `add_to_itemgroup element.children item.children.length=${item.children.length}`
        );
        */
      }
    }
  }
  return item;
}
function getItemFromRootByHostname(hostname) {
  RootItems.map((element) => {
    debugPrint2(`${element.url}`);
  });
}
function getItemFromRoot(key) {
  let ret = RootItems.find((element) => {
    element.title == key;
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
    debugPrint2(makeIndent(indent) + bookmarkItem.url);
  } else {
    debugPrint2(`${makeIndent(indent)}Folder`);
    debugPrint2(
      `${makeIndent(indent)}bookmarkItem.parentId=${bookmarkItem.parentId}`
    );
    debugPrint2(
      `${makeIndent(indent)}bookmarkItem.title=${bookmarkItem.title}`
    );
    debugPrint2(`${makeIndent(indent)}bookmarkItem.id=${bookmarkItem.id}`);
    indent++;
  }
  if (bookmarkItem.children) {
    for (const child of bookmarkItem.children) {
      logItems(child, indent);
    }
  }
  indent--;
}
function onRejected(error) {
  debugPrint2(`An error: ${error}`);
}

function logTree(bookmarkItems) {
  logItems(bookmarkItems[0], 0);
}

function logTree2(bookmarkItems) {
  // logItems2(bookmarkItems[0], 0);
  logItems2(bookmarkItems[0], 0);
}
function logItems2(bookmarkItem, indent) {
  if (indent > 1) {
    return;
  }
  if (bookmarkItem.url) {
    debugPrint2(makeIndent(indent) + bookmarkItem.url);
  } else {
    debugPrint2(`${makeIndent(indent)}Folder`);
    debugPrint2(
      `${makeIndent(indent)}bookmarkItem.parentId=${bookmarkItem.parentId}`
    );
    debugPrint2(
      `${makeIndent(indent)}bookmarkItem.title=${bookmarkItem.title}`
    );
    debugPrint2(`${makeIndent(indent)}bookmarkItem.id=${bookmarkItem.id}`);
    indent++;
  }
  if (bookmarkItem.children) {
    for (const child of bookmarkItem.children) {
      logItems(child, indent);
    }
  }
  indent--;
}

async function call_mover_group_move(mover_group, bookmarkItem) {
  mover_group.move(bookmarkItem);
}

async function moveBMXFolderBase(mover_group, src_folder_id) {
  let bookmarkItems = [];
  await chrome.bookmarks
    .getChildren(`${src_folder_id}`)
    .then((bms) => (bookmarkItems = bms));
  bookmarkItems.map((bookmarkItem) => {
    debugPrint2(`bookmarkItem.title = ${bookmarkItem.title}`);
    mover_group.move(bookmarkItem);
  });
}
function parse_b(parser) {
  debugPrint2(`pathname=${parser.pathname} host=${parser.host} `);

  let searchParams = parser.searchParams;
  debugPrint2(`${searchParams.toString()}`);
  //			   	   	let iterator = searchParams.keys();
  let origin = parser.origin;
  let port = parser.port;
  debugPrint2(`origin=${origin} port=${port}`);
  let hash = parser.hash;

  let iterator = searchParams.entries();
  let iteratorResult;
  debugPrint2(`==== START`);
  while (true) {
    iteratorResult = iterator.next(); // 順番に値を取りだす
    if (iteratorResult.done) break; // 取り出し終えたなら、break
    debugPrint2(iteratorResult.value); // 値をコンソールに出力
  }
  debugPrint2(`==== END`);
  debugPrint2(`${searchParams.get('s')}`);
  debugPrint2(`${searchParams.get('sr')}`);

  searchParams.forEach((value, name) => {
    debugPrint2(`${name}:${value}`);
  });
  debugPrint2(`hash[s]=${hash['s']}`);
  debugPrint2(`hash[sr]=${hash['sr']}`);
  // let keys = searchParams.keys()\
  // X let keys = searchParams.key()
  // debugPrint2( JSON.stringify(keys));
  // keys.map( key => debugPrint2(`key=${key} ${hash[key]}`) )
}
async function moveBMXFolderCheck(mover_group, src_folder_id) {
  let bookmarkItems = [];
  await chrome.bookmarks.getChildren(`${src_folder_id}`).then((bms) => {
    bms.map((bm) => {
      if (bm.url != undefined) {
        parseURLX2(bm.url).then((parser) => {
          debugPrint2(`bm.title=${bm.title}`);
          parse_b(parser);
        });
      }
    });
  });
}

function moveBMX3() {
  let hier = '/Amazon/Amazon';
  let group = Movergroup.get_mover_group();
  let obj = getItemByHier(hier);
  if (obj.id != null) {
    debugPrint2(`obj.id=${obj.id}`);
    moveBMXFolderCheck(group, obj.id);
  }
}
/*
	1 ブックマークツールバー
	2 その他のブックマーク
	3 モバイルのブックマーク
	*/
function moveBMX2() {
  // debugPrint2(`moveBMX2 1`)
  // moveBMXbase("2")
  let hier = '/0/0-etc/0';
  let group = Movergroup.get_mover_group();
  debugPrint2(`hier=${hier}`);
  let obj = getItemByHier(hier);
  debugPrint2(`obj.id=${obj.id}`);
  if (obj.id != null) {
    moveBMXFolderBase(group, obj.id);
  } else {
    debugPrint2(`obj=${obj}`);
  }
}

function moveBMX() {
  let group = Movergroup.get_mover_group();
  moveBMXFolderBase(group, '1');
}

export {
  add_to_itemgroup,
  getItemFromRootByHostname,
  getItemFromRoot,
  moveBMX,
  moveBMX2,
  moveBMX3,
};
