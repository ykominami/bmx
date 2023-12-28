export class Item {
	constructor(id, parentId, index, url, title){
		this.id = id;
        this.folder = true;
        this.root = false;
        this.top: = false;
        this.parentId = parentId;
        this.posindex = index;
        this.url = url;
        this.title = title;
        this.hier = "" /* hier */;
        this.children = [];
	}
}
