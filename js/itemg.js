import {
  addItem,
  getItemByHier,
  getKeysOfItemByHier,
  getItem,
  dumpTreeItems,
} from "./data.js";
import { dumpTreeNodes } from "./treenode.js";
import { getKeysOfStorageHiers } from "./global.js";
import { parseURLX } from "./util.js";

let RootItems = [];
let TopItems = [];
// TODO: 引数elementには、chrome.bookmark.getTree()の返値が渡されると想定している

function create_item(element) {
  return {
    id: element.id,
    folder: true,
    root: false,
    top: false,
    kind: "",
    parentId: element.parentId,
    posindex: element.index,
    url: element.url,
    title: element.title,
    hier: "" /* hier */,
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
      item.kind = "ROOT";
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
        item.kind = "TOP";
        // item.hier = "";
        TopItems.push(item);
      } else {
        item.kind = "FOLDER";

        // console.log(`a 4 item.title=${item.title}`);
        /* 親フォルダが通常のフォルダであれば、自身の階層名をつくる */
        // console.log(`add_to_itemgroup 5 item.parentId=${item.parentId}`);
        // console.log(`add_to_itemgroup 7 item.parentId=${item.parentId}`);
        let parent_item = getItem(item.parentId);
        if (parent_item == null) {
          item.hier = "";
        } else {
          let parent_hier = parent_item.hier;
          item.hier = parent_hier + "/" + item.title;
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
        // dumpTreeItems(bookmarkTreeNodes, target = "FOLDER", ignore_head)
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
function getItemFromRootByHostname(hostname) {
  RootItems.map((element) => {
    console.log(`${element.url}`);
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
  return ".".repeat(indentLength);
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
function moveItemA(bookmarkItem, target_hostname, dest_parent_id) {
  if (bookmarkItem.url) {
    let hostname = parseURLX(bookmarkItem.url).then((hostname) => {
      // console.log(`${bookmarkItem.id} ${bookmarkItem.url} ${hostname}`);
      if (hostname == target_hostname) {
        console.log(
          `${bookmarkItem.id} ${
            bookmarkItem.url
          } ${hostname} dest_parent_id=${JSON.stringify(dest_parent_id)}`
        );
        chrome.bookmarks.move(bookmarkItem.id, {
          parentId: dest_parent_id,
        });
      }
    });
  }
}

function moveBMX() {
  // console.log("moveBMX");
  // let keys = getKeysOfStorageHiers();
  // console.log(`keys=${keys}`);
  const dest_parent_item = getItemByHier("/Video");
  if (dest_parent_item == null) {
    console.log(`dest_parent_item is null`);
    let keys = getKeysOfItemByHier();
    console.log(`keys=${keys}`);
    return;
  }
  console.log(`dest_parent_item.id=${dest_parent_item.id}`);
  chrome.bookmarks
    .getChildren("1")
    .then((bookmarkItems) =>
      bookmarkItems.map((bookmarkItem) =>
        moveItemA(bookmarkItem, "www.youtube.com", `${dest_parent_item.id}`)
      )
    );
}

export {
  add_to_itemgroup,
  getItemFromRootByHostname,
  getItemFromRoot,
  moveBMX,
};
