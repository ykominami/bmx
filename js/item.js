import { data } from './data.js';

export class Item {
    constructor(element, itemGroup) {
        const idnumx = itemGroup.determine_id(element.id);
        const parentIdnumx = itemGroup.determine_id(element.parentId);

        this.id = element.id;
        this.idnum = idnumx;
        this.folder = true;
        this.root = false;
        this.top = false;
        this.kind = '';
        this.parentId = element.parentId;
        this.parentIdnum = parentIdnumx;
        this.posindex = element.index;
        this.url = element.url;
        this.title = element.title;
        this.hier = ''; /* hier */
        this.children = [];

        if (this.url) {
            this.folder = false;
            this.kind = 'ITEM';
            return;
        }

        if (parentIdnumx === -1) {
            this.root = true;
            this.kind = 'ROOT';
            itemGroup.RootItems.push(this);
        } else if (parentIdnumx === 0) {
            this.top = true;
            this.kind = 'TOP';
            itemGroup.TopItems.push(this);
        } else {
            this.kind = 'FOLDER';
            const parent_item = data.getItem(this.parentId);
            if (parent_item == null) {
                this.hier = '';
            } else {
                const parent_hier = parent_item.hier;
                this.hier = parent_hier + '/' + this.title;
            }
        }
    }
}


