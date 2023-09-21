let ItemHashByHier = {};

function getItemByHier(key) {
  return ItemHashByHier[key];
}

function setItemByHier(key, value) {
  return (ItemHashByHier[key] = value);
}

let ItemHash = [];

function getItem(key) {
  return ItemHash[key];
}

function setItem(key, value) {
  return (ItemHash[key] = value);
}
