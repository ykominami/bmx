import { getItemByHier } from "./data.js";

export class Mover {
	constructor(hostname, hier){
		this.hostname = hostname
		this.hier = hier
		this.dest_parent_item = getItemByHier(this.hier)
	}
	async move(bookmarkItem) {
	  let ret = true
	  //	  console.log(`Mover move`)
	  if (bookmarkItem.url) {
	      // console.log(`${bookmarkItem.id} ${bookmarkItem.url} ${bookmarkItem.title}`);
	      let prom = await chrome.bookmarks.move(bookmarkItem.id, {
	        parentId: this.dest_parent_item.id,
    	    }).then( (movedBookmark) => {
				    let ret2 = true
				    if (chrome.runtime.lastError) {
				      // console.error(chrome.runtime.lastError.message);
				      ret2 = false
				    } else {
				      // console.log('Bookmark moved', movedBookmark);
				    }
				    return ret2
		  	    } ).then( (ret3) => ret = ret3 )
			  }
	  return ret
	}
}

