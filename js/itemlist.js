import {Item} from "./item.js";
	
export class ItemList {
	constructor(){
		this.array = [];
	}
	add(item){
		this.array.push(item);	
	}
	getItem(key){
		let ret = this.array.find((element) => {
			return element.title == key
		}
		if (ret === undefined ){
			ret = null;
		}
		return ret;
	}

}