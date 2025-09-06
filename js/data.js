class Data {
    #ItemHashByHier = {};
    #ItemHash = {};

    constructor() {
    }

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
    }
}

const data = new Data();
export { data };