export class  {
	constructor(hier, url){
		this.hier = hier
		this.url = url
		this.dest_parent_item = getItemByHier(this.hier)
	}
}