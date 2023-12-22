let ItemHashByHier;
let ItemHash;

function dumpTreeItemsX(bookmarkTreeNodes) {
  let ary = [];
  let ary_children = [];
  for (let i = 0; i < bookmarkTreeNodes.length; i++) {
    let element = bookmarkTreeNodes[i];
    if (element.url) {
      ary.push(element.url);
    }

    if (element.children) {
      // ary = ary.concat(dumpTreeItemsX(element.children));
      ary_children = dumpTreeItemsX(element.children);
    }
    ary = [...ary, ...ary_children];
  }
  return ary;
}

function dumpTreeItemsXTop(folder_id) {
  let zary = [];
  const item = getItem(folder_id);

  chrome.bookmarks.getSubTree(item.id, (bookmarkTreeNodes) => {
    zary = dumpTreeItemsX(bookmarkTreeNodes);
  });
  return zary;
}

function getItemByHier(key) {
  let ret = null;
  //console.log(`itemHash.keys=${ Object.keys(ItemHashByHier) }`)
  if (key in ItemHashByHier) {
    ret = ItemHashByHier[key];
  }
  return ret;
}

function setItemByHier(key, value) {
  return (ItemHashByHier[key] = value);
}

function getItemHashByHierKeys() {
  return Object.keys(ItemHashByHier);
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

function getItemHashKeys() {
  return Object.keys(ItemHash);
}

function initItems() {
  ItemHashByHier = {};
  ItemHash = [];
}

function printItemHashByHier() {
  debubPrint2("=ItemHashByHier");
  debubPrint2(ItemHashByHier);
}

function printItemHash() {
  debubPrint2("=ItemHash");
  debubPrint2(ItemHas);
}
export {
  dumpTreeItemsX,
  dumpTreeItemsXTop,
  getItemByHier,
  setItemByHier,
  getItemHashByHierKeys,
  getItem,
  setItem,
  getItemHashKeys,
  initItems,
  printItemHashByHier,
  printItemHash,
};
