let ItemHashByHier;
let ItemHash;

function getItemByHier(key) {
  return ItemHashByHier[key];
}

function setItemByHier(key, value) {
  return (ItemHashByHier[key] = value);
}

function getItemHashByHierKeys() {
  return Object.keys(ItemHashByHier);
}

function getItem(key) {
  return ItemHash[key];
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
