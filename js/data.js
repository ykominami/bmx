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

function dumpTreeItemsX(bookmarkTreeNodes) {
    let ary = [];
    let i;
    for (i = 0; i < bookmarkTreeNodes.length; i++) {
        const element = bookmarkTreeNodes[i];
        if (element.url) {
            ary.push(element.id);
        }

        if (element.children) {
            ary = ary.concat(dumpTreeItemsX(element.children));
        }
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
