import {ItemList} from "./itemlist.js";
import {Item} from "./item.js";

export class ItemGroup {
	constructor(){
		this.root = new ItemList();
		this.top = new ItemList();
	}
	add_bookmarkTreeNode(element, parent_item){
		if (!element.url) {
			let item = new Item(element.id, 
				element.parentId, element.index,
				element.url, element.title);
	    };
		if (!item.parentId) {
        	item.root = true;
        	this.root.add(item.id);
        	item.hier = item.title;
      	} else {
	        /* 親フォルダがルート階層のフォルダであればトップ階層のフォルダにする */
	        if (parent_item.root) {
	        	item.top = true;
	        	item.hier = "";
	        	this.Top.add(item.id);
	        } else {
	          /* 親フォルダが通常のフォルダであれば、自身の階層名をつくる */
	        	item.hier = parent_item.hier + "/" + item.title;
	        }
	    }
	    return item;
	}
}