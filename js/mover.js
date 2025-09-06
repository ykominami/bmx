import { data } from './data.js';

export class Mover {
    constructor(hier, url){
        this.hier = hier
        this.url = url
        this.dest_parent_item = data.getItemByHier(this.hier)
    }
    move(bookmarkItem){
        if( this.dest_parent_item != null ){
            return chrome.bookmarks.move(bookmarkItem.id, {parentId: this.dest_parent_item.id});
        } else {
            return Promise.reject(new Error("Destination parent item not found."));
        }
    }
}
