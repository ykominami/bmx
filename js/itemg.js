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
  // console.log(`add_to_itemgroup 0`);
  /* フォルダのみを処理する（項目は無視する） */
  // if (element.url) {
  //  return null;
  //}
  let idnum = parseInt(element.id, 10);
  // console.log(`idnum=${idnum}`);
  let parentIdnum = parseInt(element.parentId, 10);
  // console.log(`parentIdnum=${parentIdnum}`);

  // console.log(`element.url=${element.url}`);

  let item = create_item(element);
  if (element.url) {
    return null;
  } else {
    if (Number.isNaN(parentIdnum)) {
      // console.log(`a 2`);
      item.root = true;
      item.kind = 'ROOT';
      RootItems.push(item);
      // item.hier = "";
      // item.hier = item.title;
    } else {
      // console.log(`a idnum=${idnum}}`);
      // console.log(`a parentIdnum=${parentIdnum}}`);
      /* 親フォルダがルート階層のフォルダであればトップ階層のフォルダにする */
      if (parentIdnum == 0) {
        // console.log(`a 3 item.title=${item.title}`);
        item.top = true;
        item.kind = 'TOP';
        // item.hier = "";
        TopItems.push(item);
      } else {
        item.kind = 'FOLDER';

        // console.log(`a 4 item.title=${item.title}`);
        /* 親フォルダが通常のフォルダであれば、自身の階層名をつくる */
        // console.log(`add_to_itemgroup 5 item.parentId=${item.parentId}`);
        // console.log(`add_to_itemgroup 7 item.parentId=${item.parentId}`);
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
        /* console.log(
          `add_to_itemgroup element.children 2 root=${item.root} top=${item.top} parentIdnum=${parentIdnum} item.id=${item.id} item.title=${item.title}`
        );
        */
        item.children = dumpTreeNodes(element.children);
        // item.children = dumpTreeNodes(element.children);
        // console.log(`2 getKeysOfItemByHier()=${getKeysOfItemByHier()}`);
        /* console.log(
          `add_to_itemgroup element.children item.children.length=${item.children.length}`
        );
        */
      }
    }
  }
  return item;
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
function onRejected(error) {
  console.log(`An error: ${error}`);
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

async function call_mover_group_move(mover_group, bookmarkItem) {
  mover_group.move(bookmarkItem);
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
function parse_b(parser) {
  // console.log(`pathname=${parser.pathname} host=${parser.host} `);

  let searchParams = parser.searchParams;
  // console.log(`${searchParams.toString()}`);
  //			   	   	let iterator = searchParams.keys();
  let origin = parser.origin;
  let port = parser.port;
  // console.log(`origin=${origin} port=${port}`);
  let hash = parser.hash;

  let iterator = searchParams.entries();
  let iteratorResult;
  // console.log(`==== START`);
  while (true) {
    iteratorResult = iterator.next(); // 順番に値を取りだす
    if (iteratorResult.done) break; // 取り出し終えたなら、break
    // console.log(iteratorResult.value); // 値をコンソールに出力
  }
  console.log(`==== END`);
  console.log(`${searchParams.get('s')}`);
  console.log(`${searchParams.get('sr')}`);

  searchParams.forEach((value, name) => {
    console.log(`${name}:${value}`);
  });
  console.log(`hash[s]=${hash['s']}`);
  console.log(`hash[sr]=${hash['sr']}`);
  // let keys = searchParams.keys()\
  // X let keys = searchParams.key()
  // console.log( JSON.stringify(keys));
  // keys.map( key => console.log(`key=${key} ${hash[key]}`) )
			   	   // qid 本、Kindleを問わず同一
			   	   // sr  本、Kindleを問わず同一
			   	   // s:books 本のみ または Kindleのみ（Kindleにはそもそも存在しない)
			   	   //  
			   	   // k: ASINの値
			   	   // i: stripgbooks
			   	   // __mk__ja_JP
			   	   // crid:
			   	   // sprefix: ASINの値, stripbooks, 204
			   	   // ref: nb_sb_noss
}
async function moveBMXFolderCheck(mover_group, src_folder_id) {
  let bookmarkItems = [];
  await chrome.bookmarks.getChildren(`${src_folder_id}`).then((bms) => {
    bms.map((bm) => {
      if (bm.url != undefined) {
        parseURLX2(bm.url).then((parser) => {
          console.log(`bm.title=${bm.title}`);
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
    console.log(`obj.id=${obj.id}`);
    moveBMXFolderCheck(group, obj.id);
  }
}
/*
	1 ブックマークツールバー
	2 その他のブックマーク
	3 モバイルのブックマーク
	*/
function moveBMX2() {
  // console.log(`moveBMX2 1`)
  // moveBMXbase("2")
  let hier = '/0/0-etc/0';
  let group = Movergroup.get_mover_group();
  console.log(`hier=${hier}`);
  let obj = getItemByHier(hier);
  console.log(`obj.id=${obj.id}`);
  if (obj.id != null) {
    moveBMXFolderBase(group, obj.id);
  } else {
    console.log(`obj=${obj}`);
  }
}

function moveBMX() {
  let group = Movergroup.get_mover_group();
  moveBMXFolderBase(group, '1');
}

export { add_to_itemgroup, getItemFromRoot, moveBMX, moveBMX2, moveBMX3 };
