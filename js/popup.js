$(document).ready( function(){
    var Target
    var ItemHash = []
    var ItemHashByHier = new Object()
    var RootItems = []
    var TopItems = []
    const ANOTHER_FOLER = -1
    const StorageOptions = 'Options'
    const StorageSelected = 'Selected'
    var Settings = {
	StorageOptions: [],
	StorageSelected: {}
    }

    /* デバッグ用関数 */
    function debugPrint2( obj )
    {
	console.log( obj )
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
	$(btn_jquery_id).click(function(){
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

    function addSelect(select,keytop)
    {
	var opts1 = []
	var value
	if( keytop != null ){
	    var item = ItemHashByHier[keytop]
	    if( item != undefined ){
		var xary = getSelectOption(item , true)
		xary.forEach( function(element, index, array) {
		    opts1.push( $('<option>' , { value: element.value , text: element.text }) )
		})
		if( opts1.length == 0 ){
		    opts1.push( $('<option>' , { value: ItemHashByHier[keytop].id , text: ItemHashByHier[keytop].title } ) )

		}
		opts1.push( $('<option>' , { value: ANOTHER_FOLER , text: "#別のフォルダ#" }) )
		select.append(opts1);

		value = Settings[StorageSelected][keytop]
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
	}
    }

    function getSelectOption(item , ignore_head){
	ignore_head = ignore_head === undefined ? false : ignore_head

	var ary = []
	if (!ignore_head){
	    ary.push( { value: item.id , text: item.title } )
	}
	if (item.children) {
	    item.children.forEach( function(element, index, array) {
		Array.prototype.push.apply( this , getSelectOption(element) )
	    } , ary )
	}
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
				     function(bookmarkTreeNodes) {
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
		chrome.bookmarks.get( id , function(result){
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
	key_array.forEach( function(element, index, array) {
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
		ItemHash[parentId].children = dumpTreeNodes(bookmarkTreeNodes, query , { })
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
	var ind = Settings[StorageOptions].findIndex(function(element,index,array){
	    return element.value == value
	})
	if( ind >= 0 ){
	    Settings[StorageOptions].splice(ind)
	}
	Settings[StorageOptions].unshift( { value: value , text: text } )

	var opts1 = []
	Settings[StorageOptions].forEach( function(element, index, array) {
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
	chrome.storage.local.set( val, function() {
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
	var w = 5
	var count = 80
	var ind
	var next_start
	var b_c,b_r,s_c,s_r
	var els = makeMenuRecentlyAndCategorySelectBtn(count , getItems1())
	var aryx = new Array(els.length * 2)

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

	$('#rbtn').click(function(){
	    createOrMoveBKItem( '#rinp' , 'recently' )
	})
	updateSelectRecently(Settings[StorageOptions] , $('#rinp'))
    }

    /* ===== popup window 上部 ===== */
    function makeMenuOnUpperArea(title,url)
    {
	$('#name').val(title)
	$('#url').val(url)
	$('#zinp').click(function(){
	    setTargetArea( '#move-mode' )
	    addSelectWaitingItemsX($('#yinp') , $('#zinp').val())
	})
	$('#yinp').click(function(){
	    chrome.bookmarks.get( $('#yinp').val() , function(BookmarkTreeNodes){
		$('#oname').val( BookmarkTreeNodes[0].title )
		$('#ourl').val( BookmarkTreeNodes[0].url )
		$('#oid').val( BookmarkTreeNodes[0].id )
	    } )
	})
	setTargetArea( "#add-mode" )

	addSelectWaitingFolders( $('#zinp') )

	$('#add-mode').click(function(){
	    setTargetArea( '#add-mode' )
	})
	$('#move-mode').click(function(){
	    setTargetArea( '#move-mode' )
	})

	$('#gotobtn').click(function(){
	    chrome.tabs.create({url: $('#ourl').val()})
	})
	$('#removeitembtn').click(function(){
	    chrome.bookmarks.remove($('#oid').val(), function(result) {
		var parent_id = $('#zinp').val()
		$('#yinp').empty()
		dumpBookmarksFromSubTree( parent_id , "")
		$('#oname').val("")
		$('#ourl').val("")
		$('#oid').val("")
	    })
	})
	$('#bk').change(function(){
	    debugPrint2( $('#bk').val() )
	})
	$('#removebtn').click(function(){

	    chrome.storage.local.remove([StorageOptions, StorageSelected], function(result) {
	    })
	})
	$('#test1btn').click(function(){
	    var ary = []
	    var xitems = {}
	    Settings.Options.forEach(function(element,index,array){
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
	    chrome.storage.local.set( val, function() {
	    })
	})

    }

    /* ===== bookmarkの情報を取得 ===== */
    function dumpTreeNodes(bookmarkTreeNodes, query , parent_item) {
	var ary = []
	bookmarkTreeNodes.forEach( function(element, index, array) {
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
		    item.children = dumpTreeNodes(element.children, query, item) 
		}
		ary.push( item )
	    }
	} )
	return ary
    }

    /* ===== popup windowsの作成 ===== */
    function setupyPopupWindow(){
	chrome.tabs.query( {active: true, currentWindow: true} , function(tabs) {
	    var current = tabs[0]
	    var title = current.title
	    var url = current.url

	    makeMenuOnUpperArea(title,url)
	    makeMenuOnBottomArea()
	})
    }

    function dumpBookmarks(query) {
	var bookmarkTreeNodes = chrome.bookmarks.getTree(
	    function(bookmarkTreeNodes) {
		dumpTreeNodes(bookmarkTreeNodes, query , { root: true })

		setupyPopupWindow()
	    } )
    }

    function load()
    {
	chrome.storage.local.get([StorageOptions, StorageSelected] , function(result) {
	    if(!result[StorageOptions]){
		result[StorageOptions] = []
	    }
	    if(!result[StorageSelected]){
		result[StorageSelected] = {}
	    }
	    setSettings(result)

	    var query = ""
	    dumpBookmarks(query)
	})
    }

    function start()
    {
	load()
    }

    start()
})

