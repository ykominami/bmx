$(document).ready( function(){
    var Target
    var ItemHash = []
//    var ItemHashByHier = new Object()
    var ItemHashByHier = {}
    var RootItems = []
    var TopItems = []
    const ANOTHER_FOLER = -1
    const StorageOptions = 'Options'
    const StorageSelected = 'Selected'

    var Settings = {}
    Settings[StorageOptions] = []
    Settings[StorageSelected] = {}

    /* デバッグ用関数 */
    function debugPrint2( obj )
    {
//	console.log( obj )
    }
    
    function debugPrint( obj )
    {
	if( debugOption.count_min <= debugOption.count && debugOption.count_max >= debugOption.count){
	    console.log( obj )
}
	debugOption.count++
    }

    /* ===== グローバル変数 関連 ===== */
    function setSettings(val)
    {
	Settings = val
    }
    /* ===== popup window 下部 下位関数 ==== */
    function makeMenuRecentlyAndCategorySelectBtn(category_max , items)
    {
	var ary = []
	var ary2 = []

	ary.push( makeMenuXrecently() )
	ary2 = ary.concat( makeMenuXcategory(category_max , items) )

	return ary2
    }

    function makeDistinationMenu(items)
    {
	var i,name
	for(i=0; i<items.length ; i++){
	    name = getCategoryName( i )
	    makeBtnHdrAndSelect(getJqueryId( getBtnId(name) ) , getJqueryId( getSelectId(name) ) , items[i][1])
	}
    }

    function updateSelectRecently(ary2,select)
    {
	var opts1 = []
	ary2.forEach(function(element, index, array) {
	    opts1.push( $('<option>' , { value: element.value , text: element.text }) )
	})
	select.empty()
	if( opts1.length > 0 ){
	    select.append(opts1)
//	    select.val( ary2[(ary2.length - 1)].value )
	    select.val( ary2[0].value )
	}
    }

    /* ===== ----- ==== */
    function makeMenuXcategory(max,items)
    {
	var ary = []
	var i, name, text
	var btn_id , btn_class_name , select_class_name, select_id
	var lormax = items.length
	if( max < lormax ){
	    lormax = max
	}
	for(i=0; i<lormax; i++){
	    text = items[i][0]
	    name = getCategoryName( i )
	    btn_class_name = "button " + name
	    btn_id = name + "btn"
	    select_class_name = "box " + i
	    select_id = getSelectId(name)
	    ary.push({
		first: makeBtnA( text , btn_class_name , btn_id ),
		second: makeSelectA( select_class_name , select_id )
	    })
	}
	return ary
    }

    function makeBtnHdrAndSelect(btn_jquery_id , select_jquery_id , keytop)
    {
	addSelect($(select_jquery_id) , keytop)
	$(btn_jquery_id).click(() => {
	    createOrMoveBKItem( select_jquery_id , keytop)
	})
    }

    function makeMenuXrecently()
    {
	return { first: makeBtnA( "recently" , "button a" , "rbtn" ) ,
		 second: makeSelectA( "box d" , "rinp" )
	       }
    }

    function makeBtnA( name , class_name , id )
    {
	return $('<button>' , {
	    type: "button",
	    name: name,
	    class: class_name,
	    id: id,
	    text: name
	})
    }

    function makeSelectA( class_name , id )
    {
	return $('<select>' , {
	    class: class_name,
	    id: id
	})
    }
    function getCategoryName( i )
    {
	return "c" + i
    }
    function getSelectId(name)
    {
	return name + "inp"
    }
    function getBtnId(name)
    {
	return name + "btn"
    }
    function getJqueryId( id )
    {
	return "#" + id
    }

    function getItemByHier(key)
    {
	return ItemHashByHier[key]
    }

    function addSelect(select,keytop)
    {
	var opts1 = []
	var item,value
	if( keytop != null ){
	    debugPrint2("addSelect keytop=")
	    debugPrint2(keytop)
	    debugPrint2(ItemHashByHier)
	    item = getItemByHier(keytop)
	    debugPrint2("addSelect itemm=")
	    debugPrint2(item)
	    debugPrint2("addSelect length=")
	    debugPrint2(ItemHashByHier.length)
	    if( item != undefined ){
		debugPrint2("addSelect 1")
		var xary = getSelectOption(item , true)
		xary.forEach( (element, index, array) => {
		    opts1.push( $('<option>' , { value: element.value , text: element.text }) )
		})
		if( opts1.length == 0 ){
		    opts1.push( $('<option>' , { value: ItemHashByHier[keytop].id , text: ItemHashByHier[keytop].title } ) )

		}
		opts1.push( $('<option>' , { value: ANOTHER_FOLER , text: "#別のフォルダ#" }) )
		select.append(opts1);

		if( Settings[StorageSelected] != undefined ){
		    value = Settings[StorageSelected][keytop]
		}
		else{
		    Settings[StorageSelected] = {}
		    value = undefined
		}
		if(value != undefined){
		    select.val(value)
		}
		else{
		    value = Settings[StorageSelected][keytop] = opts1[0][0].value
		}
		debugPrint2("addSelect keytop =")
		debugPrint2(keytop)
		debugPrint2("addSelect value =")
		debugPrint2(value)
		debugPrint2("addSelect xary =")
		debugPrint2(xary)
		debugPrint2("addSelect item =")
		debugPrint2(item)
	    }
	    else{
		debugPrint2("addSelect 2")
	    }
	}
    }

    function getSelectOption(item , ignore_head){
	ignore_head = ignore_head === undefined ? false : ignore_head

	var ary = []
	if (!ignore_head){
	    ary.push( { value: item.id , text: item.title } )
	}
	if (item.children) {
	    item.children.forEach( (element, index, array) => {
		Array.prototype.push.apply( ary , getSelectOption(element) )
	    } )
	}
	debugPrint2("getSelectOption item=")
	debugPrint2(item)
	debugPrint2("getSelectOption ary=")
	debugPrint2(ary)
	return ary
    }

    /* ===== */

    /* ===== popup window 上部 下位関数 ===== */
    function setTargetArea( val )
    {
	if( Target != val ){
	    Target = val
	    if( Target == "#add-mode" ){
		$('#move-mode').attr({class:"not-selected"})
		$('#add-mode').attr({class:"selected"})
	    }
	    else {
		$('#add-mode').attr({class:"not-selected"})
		$('#move-mode').attr({class:"selected"})
	    }
	}
    }

    function addSelectWaitingItemsX(select , folder_id)
    {
	var item = ItemHash[folder_id]
	chrome.bookmarks.getSubTree( item.id ,
				     (bookmarkTreeNodes) => {
					 select.empty()
					 var zary = dumpTreeItems(bookmarkTreeNodes , true)
					 select.append( zary )
				     })
    }

    function createOrMoveBKItem(select_jquery_id , keytop){
	var parent_id = $(select_jquery_id).val()
	var selected_jquery_id = select_jquery_id + ' option:selected'
	var selected = $(selected_jquery_id)
	var parent_text = selected.text()
	var id , text

	if( Settings[StorageSelected][keytop] != undefined ){
	    Settings[StorageSelected][keytop] = selected.val()
	}
	if( Target == "#add-mode" ){
	    text = $('#name').val()
	    url = $('#url').val()
	    if( text != "" && url != "" ){
		chrome.bookmarks.create( { parentId: parent_id, title: text , url: url } )
	    }
	    else{
		alert("Can't add bookmark")
	    }
	}
	else {
	    text = $('#oname').val()
	    url = $('#ourl').val()
	    id = $('#oid').val()
	    if( text != "" && url != "" && id != "" ){
		chrome.bookmarks.get( id , (result) => {
		    moveBKItem( id , result[0].parentId , parent_id)
		} )
	    }
	    else{
		alert("Can't move bookmark")
	    }
	}

	addRecentlyItem( $('#rinp') , parent_id , parent_text )
    }

    function addSelectWaitingFolders(select)
    {
	var opts1 = []
	var values = []
	var item
	var key_array = ['/0/new-action','/0/action','/0/1','/0/AdventCalendar', '/0/0-etc', '/0/a-ref']
	key_array.forEach( (element, index, array) => {
	    item = ItemHashByHier[element]
	    values.push(item.id)
	    opts1.push( $('<option>' , { value: item.id , text: element }) )
	})
	opts1.push( $('<option>' , { value: ANOTHER_FOLER , text: "#別のフォルダ#" }) )
	select.append(opts1);
	addSelectWaitingItemsX($('#yinp') , $('#zinp').val())
    }

    function dumpBookmarksFromSubTree(parentId , query)
    {
	var bookmarkTreeNodes = chrome.bookmarks.getSubTree(
	    parentId,
	    function(bookmarkTreeNodes) {
		ItemHash[parentId].children = dumpTreeNodes(bookmarkTreeNodes, { })
		addSelectWaitingItemsX($('#yinp') , parentId )
	    } )
    }

    function moveBKItem(id , src_parent_id , dest_parent_id)
    {
	if( id != "" ){
	    chrome.bookmarks.move( id , { parentId: dest_parent_id} )
	    dumpBookmarksFromSubTree(src_parent_id , "")
	    addSelectWaitingItemsX($('#yinp') , src_parent_id)
	    $('#oname').val("")
	    $('#ourl').val("")
	    $('#oid').val("")
	}
	else{
	    alert("Can't move bookmark")
	}
    }

    /* ===== ----- ==== */
    function addRecentlyItem( select , value , text )
    {
	var ind = Settings[StorageOptions].findIndex((element,index,array) => {
	    return element.value == value
	})
	if( ind >= 0 ){
	    Settings[StorageOptions].splice(ind)
	}
	Settings[StorageOptions].unshift( { value: value , text: text } )

	var opts1 = []
	Settings[StorageOptions].forEach( (element, index, array) => {
	    opts1.push( $('<option>' , { value: element.value , text: element.text }) )
	})
	select.empty()
	select.append(opts1)
	select.val(value)

	var val = {}
	val[StorageOptions] = Settings[StorageOptions]
	val[StorageSelected] = Settings[StorageSelected]
	debugPrint2("addRecentlyItem=StorageSelected")
	debugPrint2(Settings[StorageSelected])
	chrome.storage.local.set( val, () => {
	})
    }
    /*********************/
    
    /***** bookmark 関連 下位関数 *****/
    function dumpTreeItems(bookmarkTreeNodes , ignore_head) {
	ignore_head = ignore_head === undefined ? false : ignore_head

	var ary = []
	var i
	for(i=0; i<bookmarkTreeNodes.length; i++){
	    element = bookmarkTreeNodes[i]
	    if (!ignore_head) {
		if (element.url) {
		    ary.push( $('<option>' , { value: element.id , text: element.title } ) )
		}
	    }
	    if(element.children){
		ary = ary.concat( dumpTreeItems(element.children) )
	    }
	}
	return ary
    }
    
    /*********************/

    /* ====== popup window 下部 ===== */
    function makeMenuOnBottomArea()
    {
	debugPrint2("makeMenuOnBottomArea")
	var w = 5
	var count = 80
	var ind
	var next_start
	var b_c,b_r,s_c,s_r
	var items = getItems1()
	var els = makeMenuRecentlyAndCategorySelectBtn(count , items)
	var aryx = new Array(els.length * 2)

	debugPrint2("items=")
	debugPrint2(items)
	debugPrint2("els=")
	debugPrint2(els)
	els.forEach(function(element, index, array){
	    ind = index % w
	    if( ind == 0 ){
		if( index == 0){
		    b_r = 1
		    next_start = 2
		}
		else{
		    b_r = next_start * 2
		    next_start = next_start + 1
		}
		s_r = b_r + 1

		b_c = 1
		s_c = 1
	    }
	    else{
		b_c = b_c + 1
		s_c = s_c + 1
	    }
	    element.first.addClass( 'g-' + b_r + '-' + b_c)
	    element.second.addClass('g-' + s_r + '-' + s_c)
	    aryx.push(element.first)
	    aryx.push(element.second)
	})
	$('#menu').addClass("wrapper")
	$('#menu').append( aryx )

	makeDistinationMenu( getItems1() )

	$('#rbtn').click(() => {
	    createOrMoveBKItem( '#rinp' , 'recently' )
	})
	updateSelectRecently(Settings[StorageOptions] , $('#rinp'))
    }

    /* ===== popup window 上部 ===== */
    function makeMenuOnUpperArea(title,url)
    {
	$('#name').val(title)
	$('#url').val(url)
	$('#zinp').click(() => {
	    setTargetArea( '#move-mode' )
	    addSelectWaitingItemsX($('#yinp') , $('#zinp').val())
	})
	$('#yinp').click(() => {
	    chrome.bookmarks.get( $('#yinp').val() , (BookmarkTreeNodes) => {
		$('#oname').val( BookmarkTreeNodes[0].title )
		$('#ourl').val( BookmarkTreeNodes[0].url )
		$('#oid').val( BookmarkTreeNodes[0].id )
	    } )
	})
	setTargetArea( "#add-mode" )

	addSelectWaitingFolders( $('#zinp') )

	$('#add-mode').click(() => {
	    setTargetArea( '#add-mode' )
	})
	$('#move-mode').click(() => {
	    setTargetArea( '#move-mode' )
	})

	$('#gotobtn').click(() => {
	    chrome.tabs.create({url: $('#ourl').val()})
	})
	$('#removeitembtn').click(() => {
	    chrome.bookmarks.remove($('#oid').val(), (result) => {
		var parent_id = $('#zinp').val()
		$('#yinp').empty()
		dumpBookmarksFromSubTree( parent_id , "")
		$('#oname').val("")
		$('#ourl').val("")
		$('#oid').val("")
	    })
	})
	$('#bk').change(() => {
	    debugPrint2( $('#bk').val() )
	})
	$('#removebtn').click(() => {

	    chrome.storage.local.remove([StorageOptions, StorageSelected], (result) => {
	    })
	})
	$('#test1btn').click(() => {
	    var ary = []
	    var xitems = {}
	    Settings.Options.forEach((element,index,array) => {
		if( !xitems[element.value] ){
		    xitems[element.value] = element
		    ary.push(element)
		}
	    })
	    Settings[StorageOptions] = ary
	    $('#rinp').empty()
	    $('#rinp').append( ary )
	    $('#rinp').val( ary[0].value )
	    var val = {}
	    val[StorageOptions] = Settings[StorageOptions]
	    val[StorageSelected] = Settings[StorageSelected]
	    chrome.storage.local.set( val, () => {
	    })
	})

    }

    /* ===== bookmarkの情報を取得 ===== */
    function dumpTreeNodes(bookmarkTreeNodes , parent_item) {
	var ary = []
	bookmarkTreeNodes.forEach( (element, index, array) => {
	    var hier = ""
	    if ( ItemHash[element.parentId] ){
		hier = ItemHash[element.parentId].hier + '/' + element.title
	    }
	    if ( ! element.url ) {
		var item = {
		    id: element.id,
		    folder: true,
		    root: false,
		    top: false,
		    parentId: element.parentId,
		    posindex: element.index,
		    url: element.url,
		    title: element.title,
		    hier: hier,
		    children: [],
		    top_hier: ""
		}
		
		if ( !item.parentId ) {
		    item.root = true
		    RootItems.push(item.id)
		    item.hier = item.title
		}
		else {
		    if ( parent_item.root ) {
			item.top = true
			item.top_hier = item.title
			item.hier = ""
			TopItems.push(item.id)
		    }
		    else {
			item.hier = parent_item.hier + '/' +  item.title
		    }
		}
		
		ItemHash[item.id] = item
		ItemHashByHier[item.hier] = item
		if ( element.children ) {
		    item.children = dumpTreeNodes(element.children , item) 
		}
		ary.push( item )
	    }
	} )
	return ary
    }

    /* ===== popup windowsの作成 ===== */
    function setupPopupWindow(){
	chrome.tabs.query( {active: true, currentWindow: true} , (tabs) => {
	    var current = tabs[0]
	    var title = current.title
	    var url = current.url

	    makeMenuOnUpperArea(title,url)
	})
    }

    function dumpBookmarks() {
	var bookmarkTreeNodes = chrome.bookmarks.getTree(
	    (bookmarkTreeNodes) => {
		var ary = dumpTreeNodes(bookmarkTreeNodes, { root: true })
		debugPrint2("dumpBookmarks ItemHashByHier=")
		debugPrint2(ItemHashByHier)
		debugPrint2("dumpBookmarks ItemHashByHier[/0]=")
		debugPrint2(ItemHashByHier["/0"])
	    } )
    }

    function load()
    {
	chrome.storage.local.get([StorageOptions, StorageSelected] , (result)  => {
	    if(!result[StorageOptions]){
		result[StorageOptions] = []
	    }
	    if(!result[StorageSelected]){
		result[StorageSelected] = {}
	    }
	    setSettings(result)
	})
    }
    function dumpBookmarksAsync(){
	return new Promise( (resolve, reject ) => {
	    var bookmarkTreeNodes = chrome.bookmarks.getTree(
		(bookmarkTreeNodes) => {
		    var ary = dumpTreeNodes(bookmarkTreeNodes, { root: true })
		    debugPrint2("dumpBookmarksAsync ItemHashByHier=")
		    debugPrint2(ItemHashByHier)
		    debugPrint2("dumpBookmarksAsync ItemHashByHier[/0]=")
		    debugPrint2(ItemHashByHier["/0"])
		    resolve({})
		} )
	} )
    }
    function loadAsync(){
	return new Promise( (resolve, reject) => {
	    chrome.storage.local.get([StorageOptions, StorageSelected] , (result)  => {
		debugPrint2(result)
		debugPrint2("loadAsync 1")
		if(!result[StorageOptions]){
		    debugPrint2("loadAsync 1 A")
		    result[StorageOptions] = []
		}
		debugPrint2("loadAsync 1 B")
		if(!result[StorageSelected]){
		    debugPrint2("loadAsync C")
		    result[StorageSelected] = {}
		}
		setSettings(result)
		debugPrint2("loadAsync 2")
		debugPrint2("result=")
		debugPrint2(result)
		debugPrint2("Settings=")
		debugPrint2(Settings)
		resolve({})
	    })
	} )
    }
    function start()
    {
	dumpBookmarksAsync().then( ()=>{ loadAsync() } )
	    .then( ()=>{setupPopupWindow()} )
	    .then( ()=>{makeMenuOnBottomArea()} )
    }
    start()
})

