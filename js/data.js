<<<<<<< HEAD
let ItemHashByHier = {};
let ItemHash = {};

function makeItemHashX(key) {
    let hash = {};
    hash[key] = {
        ItemHashByHier: ItemHashByHier,
        ItemHash: ItemHash,
    };
    return hash;
}
||||||| 08029bf
let ItemHashByHier;
let ItemHash;
=======
class Data {
    #ItemHashByHier = {};
    #ItemHash = {};
>>>>>>> efcf8e4b9b2c746ea90beb135e3e49d30d1d102a

<<<<<<< HEAD
function dumpTreeItemsX(bookmarkTreeNodes) {
    let ary = [];
    let i;
    for (i = 0; i < bookmarkTreeNodes.length; i++) {
        const element = bookmarkTreeNodes[i];
        if (element.url) {
            ary.push(element.id);
        }
||||||| 08029bf
function dumpTreeItemsX(bookmarkTreeNodes) {
  let ary = [];
  let i;
  for (i = 0; i < bookmarkTreeNodes.length; i++) {
    const element = bookmarkTreeNodes[i];
    if (element.url) {
      ary.push(element.id);
    }
=======
    constructor() {
    }
>>>>>>> efcf8e4b9b2c746ea90beb135e3e49d30d1d102a

<<<<<<< HEAD
        if (element.children) {
            ary = ary.concat(dumpTreeItemsX(element.children));
        }
||||||| 08029bf
    if (element.children) {
      ary = ary.concat(dumpTreeItemsX(element.children));
=======
    makeItemHashX(key) {
        let hash = {};
        hash[key] = {
            ItemHashByHier: this.#ItemHashByHier,
            ItemHash: this.#ItemHash,
        };
        return hash;
    }

    dumpTreeItemsX(bookmarkTreeNodes) {
        let ary = [];
        let i;
        for (i = 0; i < bookmarkTreeNodes.length; i++) {
            const element = bookmarkTreeNodes[i];
            if (element.url) {
                ary.push(element.id);
            }

            if (element.children) {
                ary = ary.concat(this.dumpTreeItemsX(element.children));
            }
        }
        return ary;
    }

    dumpTreeItemsXTop(folder_id) {
        let zary = [];
        const item = this.getItem(folder_id);

        chrome.bookmarks.getSubTree(item.id, (bookmarkTreeNodes) => {
            zary = this.dumpTreeItemsX(bookmarkTreeNodes);
        });
        return zary;
    }

    getItemByHier(key) {
        if (this.#ItemHashByHier[key]) {
            return this.#ItemHashByHier[key];
        } else {
            return null;
        }
    }

    setItemByHier(key, value) {
        return (this.#ItemHashByHier[key] = value);
    }

    getKeysOfItemByHier() {
        return Object.keys(this.#ItemHashByHier);
    }

    getItemHashByHierKeys() {
        return Object.keys(this.#ItemHashByHier);
    }

    getItem(key) {
        if (this.#ItemHash[key]) {
            return this.#ItemHash[key];
        } else {
            return null;
        }
    }

    setItem(key, value) {
        return (this.#ItemHash[key] = value);
    }

    addItem(item) {
        // console.log(`addItem item=${JSON.stringify(item)}`);
        this.setItem(item.id, item);
        this.setItemByHier(item.hier, item);
>>>>>>> efcf8e4b9b2c746ea90beb135e3e49d30d1d102a
    }
<<<<<<< HEAD
    return ary;
||||||| 08029bf
  }
  return ary;
=======
>>>>>>> efcf8e4b9b2c746ea90beb135e3e49d30d1d102a
}

<<<<<<< HEAD
function dumpTreeItemsXTop(folder_id) {
    let zary = [];
    const item = getItem(folder_id);

    chrome.bookmarks.getSubTree(item.id, (bookmarkTreeNodes) => {
        zary = dumpTreeItemsX(bookmarkTreeNodes);
    });
    return zary;
}

function getItemByHier(key) {
    if (ItemHashByHier[key]) {
        return ItemHashByHier[key];
    } else {
        return null;
    }
}

function setItemByHier(key, value) {
    return (ItemHashByHier[key] = value);
}

function getKeysOfItemByHier() {
    return Object.keys(ItemHashByHier);
}

function getItemHashByHierKeys() {
    return Object.keys(ItemHashByHier);
}

function getItem(key) {
    if (ItemHash[key]) {
        return ItemHash[key];
    } else {
        return null;
    }
}

function setItem(key, value) {
    return (ItemHash[key] = value);
}

function addItem(item) {
    // console.log(`addItem item=${JSON.stringify(item)}`);
    setItem(item.id, item);
    setItemByHier(item.hier, item);
}

export {
    makeItemHashX,
    dumpTreeItemsX,
    dumpTreeItemsXTop,
    getItemByHier,
    setItemByHier,
    getKeysOfItemByHier,
    getItemHashByHierKeys,
    getItem,
    setItem,
    addItem,
};
||||||| 08029bf
function dumpTreeItemsXTop(folder_id) {
  let zary = [];
  const item = getItem(folder_id);

  chrome.bookmarks.getSubTree(item.id, (bookmarkTreeNodes) => {
    zary = dumpTreeItemsX(bookmarkTreeNodes);
  });
  return zary;
}


function getItemByHier(key) {
	let ret = null
	if (key in ItemHashByHier){
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
=======
const data = new Data();
export { data };
>>>>>>> efcf8e4b9b2c746ea90beb135e3e49d30d1d102a
