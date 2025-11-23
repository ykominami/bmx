class Data {
    constructor() {
		this.ItemHashByHier = {};
		this.ItemHash = {};
    }

    makeItemHashX(key) {
        let hash = {};
        hash[key] = {
            ItemHashByHier: this.ItemHashByHier,
            ItemHash: this.ItemHash,
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

    async dumpTreeItemsXTop(folder_id) {
        const item = this.getItem(folder_id);

        // Manifest V3: chrome.bookmarks.getSubTree() returns a Promise
        const bookmarkTreeNodes = await chrome.bookmarks.getSubTree(item.id);
        const zary = this.dumpTreeItemsX(bookmarkTreeNodes);
        return zary;
    }

    getItemByHier(key) {
        let result = null
        if (this.ItemHashByHier[key] != null) {
            result = this.ItemHashByHier[key];
        }
        return result;
    }

    setItemByHier(key, value) {
        return (this.ItemHashByHier[key] = value);
    }

    getKeysOfItemByHier() {
        return Object.keys(this.ItemHashByHier);
    }

    getItemHashByHierKeys() {
        return Object.keys(this.ItemHashByHier);
    }

    getItem(key) {
        if (this.ItemHash[key]) {
            return this.ItemHash[key];
        } else {
            return null;
        }
    }

    setItem(key, value) {
        return (this.ItemHash[key] = value);
    }

    addItem(item) {
        // console.log(`addItem item=${JSON.stringify(item)}`);
        this.setItem(item.id, item);
        this.setItemByHier(item.hier, item);
    }
}

const data = new Data();
export { data };