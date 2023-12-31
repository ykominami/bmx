let ItemHashByHier = {};
let ItemHash = {};

function getItemByHier(key) {
  let ret = null;
  if (key in ItemHashByHier) {
    ret = ItemHashByHier[key];
  }
  return ret;
}

function setItemByHier(key, value) {
  return (ItemHashByHier[key] = value);
}

function getKeysOfItemByHier(key, value) {
  let keys = Object.keys(ItemHashByHier);
  // console.log(`keys.length=${keys.length}`);
}

function getItem(key) {
  let ret = null;
  //console.log(`itemHash.keys=${ Object.keys(ItemHash) }`)
  if (key in ItemHash) {
    ret = ItemHash[key];
  }
  return ret;
}

function setItem(key, value) {
  return (ItemHash[key] = value);
}

function getKeysOfItem() {
  return Object.keys(ItemHash);
}

function addItem(item) {
  // console.log(`addItem item=${JSON.stringify(item)}`);
  setItem(item.id, item);
  setItemByHier(item.hier, item);
}
function initItems() {
  ItemHashByHier = {};
  ItemHash = {};
}

function printItemHashByHier() {
  debubPrint2("=ItemHashByHier");
  debubPrint2(ItemHashByHier);
}

function printItemHash() {
  debubPrint2("=ItemHash");
  debubPrint2(ItemHas);
}

function determine_kind(item) {
  let kind = "folder";
  if (item.url) {
    kind = "url";
  }
  return kind;
}
function is_target(element, target) {
  let ret = false;
  let kind = determine_kind(element);
  switch (target) {
    case "URL":
      if (kind == "url") {
        ret = true;
      }
      break;
    case "FOLDER":
      if (kind == "folder") {
        ret = true;
      }
      break;
    default:
      break;
  }
  return ret;
}

function dumpTreeItems(
  bookmarkTreeNodes,
  target = "FOLDER",
  kind = "SELECT_OPTION"
) {
  let ary = [];
  for (let i = 0; i < bookmarkTreeNodes.length; i++) {
    const element = bookmarkTreeNodes[i];
    let ret = is_target(element, target);
    // console.log(`H dumpTreeItems ret=${ret} kind=${kind} target=${target}`);
    if (ret) {
      switch (kind) {
        case "SELECT_OPTION":
          ary.push(
            $("<option>", {
              value: element.id,
              text: element.title,
            })
          );
          break;
        default:
          ary.push(element);
          break;
      }
      /*
      console.log(
        `X element.id=${element.id} element.title=${element.title}`
      );
      */
    }
    /*
    console.log(
      `0 dumpTreeItems element.children=${JSON.stringify(element.children)}`
    );
    */
    if (element.children) {
      let ary2 = dumpTreeItems(element.children, target, kind);
      ary = [...ary, ...ary2];
    }
  }
  // console.log(`1 dumpTreeItems ary=${JSON.stringify(ary)}`);
  return ary;
}

export {
  getItemByHier,
  setItemByHier,
  getKeysOfItemByHier,
  getItem,
  setItem,
  getKeysOfItem,
  addItem,
  initItems,
  printItemHashByHier,
  printItemHash,
  dumpTreeItems,
};
