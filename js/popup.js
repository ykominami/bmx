$(document).ready( function(){
    var Target
    var ItemHash = []
    var ItemHashByHier = new Object()
    var RootItems = []
    var TopItems = []
    var WantItemArray = []
    const ANOTHER_FOLER = -1
    var debugOption = { count_at: 10 , count_init: 0 , count: 0 , count_min: 10 , count_max: 20 }
    const StorageKey = 'Options'
    var Settings = {}
    Settings[StorageKey] = []

    function getWantItemArray( )
    {
	return WantItemArray
    }
    
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

    function setTargetArea( val )
    {
	if( Target != val ){
	    Target = val
	    if( Target == "#add-mode" ){
		// debugPrint2("#add-mode")
		$('#move-mode').attr({class:"not-selected"})
		$('#add-mode').attr({class:"selected"})
	    }
	    else {
		// debugPrint2("#move-mode")
		$('#add-mode').attr({class:"not-selected"})
		$('#move-mode').attr({class:"selected"})
	    }
	}
    }
    function createOrMoveBKItemRecently(select_name){
	var parent_id = $(select_name).val()
	var selected_name = select_name + ' option:selected'
	var selected = $(selected_name)
	var parent_text = selected.text()
	var id , text
	if( Target == "#add-mode" ){
	    text = $('#name').val()
	    url = $('#url').val()
	    alert( "1|parent_id=" + parent_id + "|text=" + text + "|url=" + url  )
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
	    debugPrint2("=ItemHash["+ id + "]")
	    debugPrint2(ItemHash[id])
	    ItemHash[id].parentId

	    alert( "2|parent_id=" + parent_id + "|text=" + text + "|url=" + url + "|id=" + id )
	    if( text != "" && url != "" && id != "" ){
		chrome.bookmarks.move( id , { parentId: parent_id} )
		$(select_name).empty()
		dumpBookmarksFromSubTree(parentId , query)
		addSelect($(select_name) , keytop)
	    }
	    else{
		alert("Can't move bookmark")
	    }
	}

	addRecentlyItem( $('#rinp') , parent_id , parent_text )
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
    function createOrMoveBKItem(select_name , keytop){
	var parent_id = $(select_name).val()
	var selected_name = select_name + ' option:selected'
	var selected = $(selected_name)
	var parent_text = selected.text()
	var id , text
	if( Target == "#add-mode" ){
	    text = $('#name').val()
	    url = $('#url').val()
//	    alert( "1|parent_id=" + parent_id + "|text=" + text + "|url=" + url  )
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
//	    alert( "2|parent_id=" + parent_id + "|text=" + text + "|url=" + url + "|id=" + id )
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

    function addRecentlyItem( select , value , text )
    {
	var ind = Settings[StorageKey].findIndex(function(element,index,array){
	    return element.id == value
	})
	if( ind != undefined && ind > 0 ){
	    Settings[StorageKey].splice(ind)
	}
	if( Settings[StorageKey].length > 0 ){
	    if( Settings[StorageKey][0].value == value ){
		return
	    }
	}

	Settings[StorageKey].unshift( { value: value , text: text } )

	var opts1 = []
	Settings[StorageKey].forEach( function(element, index, array) {
	    opts1.push( $('<option>' , { value: element.value , text: element.text }) )
	})
	
	select.empty()
	select.append(opts1)
	var val = {}
	val[StorageKey] = Settings[StorageKey]
	chrome.storage.local.set( val, function() {
	})
    }
    function setSettings(val)
    {
	Settings = val
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
	}
    }
    function loadAndAddSelectRecently(select)
    {
	chrome.storage.local.get(StorageKey, function(result) {
	    if(!result[StorageKey]){
		result[StorageKey] = []
	    }
	    setSettings(result)
	    updateSelectRecently(result[StorageKey] , select)
	})
    }
    function loadAndAddSelectRecentlyX(select)
    {
	chrome.storage.local.get(StorageKey, function(result) {
	    if(result[StorageKey] != undefined){
//		debugPrint2("local.get 2 0")
//		debugPrint2(result[StorageKey])
	    }
	    else{
//		debugPrint2("local.get 2 1")
//		debugPrint2(result[StorageKey])
		result[StorageKey] = []
	    }
	    var opts1 = []
	    setSettings(result)
	    result[StorageKey].forEach(function(element, index, array) {
		opts1.push( $('<option>' , { value: element.value , text: element.text }) )
	    })
	    select.empty()
	    if( opts1.length > 0 ){
		select.append(opts1)
	    }
	})
    }
    
    function addSelectWaitingFolders(select)
    {
	var opts1 = []
	var values = []
	var item
	var key_array = ['/0/a-ref','/0/0-etc','/0/new-action','/0/action','/0/1','/0/AdventCalendar']
	key_array.forEach( function(element, index, array) {
	    item = ItemHashByHier[element]
	    values.push(item.id)
	    opts1.push( $('<option>' , { value: item.id , text: element }) )
	})
	opts1.push( $('<option>' , { value: ANOTHER_FOLER , text: "#別のフォルダ#" }) )
	select.append(opts1);
	addSelectWaitingItemsX($('#yinp') , $('#zinp').val())
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
    
    function addSelect(select,keytop)
    {
	var opts1 = []
	if( keytop != null ){
	    var item = ItemHashByHier[keytop]
	    if( item != undefined ){
		var xary = getSelectItem(item , true)
		xary.forEach( function(element, index, array) {
		    opts1.push( $('<option>' , { value: element.value , text: element.text }) )
		})
		if( opts1.length == 0 ){
		    opts1.push( $('<option>' , { value: ItemHashByHier[keytop].id , text: ItemHashByHier[keytop].title } ) )
		    
		}
		opts1.push( $('<option>' , { value: ANOTHER_FOLER , text: "#別のフォルダ#" }) )
		select.append(opts1);
	    }
	    else{
		debugPrint2("key=" + keytop )
	    }
	}
    }
    
    function getSelectItem(item , ignore_head){
	ignore_head = ignore_head === undefined ? false : ignore_head

	var ary = []
	if (!ignore_head){
	    ary.push( { value: item.id , text: item.title } )
	}
	if (item.children) {
	    item.children.forEach( function(element, index, array) {
		Array.prototype.push.apply( this , getSelectItem(element) )
	    } , ary )
	}
	return ary
    }
    function dumpBookmarksFromSubTree(parentId , query)
    {
	var bookmarkTreeNodes = chrome.bookmarks.getSubTree(
	    parentId,
	    function(bookmarkTreeNodes) {
		ItemHash[parentId].children = dumpTreeNodes(bookmarkTreeNodes, query , { })
//		ItemHashByHier[item.hier] = item
	    } )
    }
    function dumpBookmarks(query) {
	var bookmarkTreeNodes = chrome.bookmarks.getTree(
	    function(bookmarkTreeNodes) {
		dumpTreeNodes(bookmarkTreeNodes, query , { root: true })
	    } )
    }
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
    function makeBtnHdrAndSelect(btn_name , select_name , keytop)
    {
	$(btn_name).click(function(){
	    createOrMoveBKItem( select_name , keytop)
	})
	addSelect($(select_name) , keytop)
    }
    function makeDistinationMenu(items)
    {
	var i
	for(i=0; i<items.length ; i++){
	    makeBtnHdrAndSelect('#c'+i+'btn' , '#c'+i+'inp' , items[i][1])
	}
    }
    // Event called on a profile startup.
    chrome.runtime.onStartup.addListener(function () {
	alert("onStartup")
    });
    chrome.runtime.onInstalled.addListener(function () {
	alert("onInstalled")
    });
    chrome.runtime.onSuspendCanceled.addListener(function () {
	alert("onSuspendCanceled")
    });
    chrome.runtime.onConnect.addListener(function () {
	alert("onConnect")
    });
    chrome.runtime.onConnectExternal.addListener(function () {
	alert("onConnectExternal")
    });
    chrome.runtime.onMessage.addListener(function () {
	alert("onMessage")
    });
    chrome.runtime.onMessageExternal.addListener(function () {
	alert("onMessageExternal")
    });

    $('#add-mode').click(function(){
	debugPrint2("setTargetArea 1")
	setTargetArea( '#add-mode' )
    })
    $('#move-mode').click(function(){
	debugPrint2("setTargetArea 2")
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
	    addSelectWaitingItemsX($('#yinp') , parent_id )
	    $('#oname').val("")
	    $('#ourl').val("")
	    $('#oid').val("")
	})
    })
    $('#bk').change(function(){
	debugPrint2( $('#bk').val() )
    })
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
    function makeMenuXrecently()
    {
	return { first: makeBtnA( "recently" , "button a" , "rbtn" ) ,
		 second: makeSelectA( "box d" , "rinp0" ) 
	       }
    }
    function makeMenuXcategory(max,items)
    {
	var ary = []
	var i
	var name
	var text
	var lormax = items.length
	if( max < lormax ){
	    lormax = max
	}
	for(i=0; i<lormax; i++){
	    text = items[i][0]

	    name = "c" + i
	    ary.push(
		{ first: makeBtnA( text , "button " + name , name + "btn" ),
		  second: makeSelectA( "box " + i , name + "inp" ) 
		} )
	}
	return ary
    }
    function makeMenuX(category_max , items)
    {
	var ary = []
	var ary2 = []
	
	ary.push( makeMenuXrecently() )
	ary2 = ary.concat( makeMenuXcategory(category_max , items) )

	return ary2
    }
 
    var w = 5
    var ind
    var next_start
    var b_c,b_r,s_c,s_r
    var items = [
	['doc', '/0/doc'],
	['book', '/0/book'],
	['Op', '/Op'],
	['Op2', '/Op2'],
	['Op3', '/Op3'],
	['Op4', '/Op4'],
	['Op5', '/Op5'],
	['1-DEV', '/XD/1-DEV'],
	['1-DEV-DOCUMENTATION', '/XD/1-DEV-DOCUMENTATION'],
	['1-DEV-EMBEDED', '/XD/1-DEV-EMBEDED'],
	['1-DEV-ENV', '/XD/1-DEV-ENV'],
	['1-DEV-ENV-2', '/XD/1-DEV-ENV-2'],
	['1-DEV-LANG', '/XD/1-DEV-LANG'],
	['1-DEV-LANG-2', '/XD/1-DEV-LANG-2'],
	['1-DEV-LANG-3', '/XD/1-DEV-LANG-3'],
	['1-DEV-LANG-4', '/XD/1-DEV-LANG-4'],
	['1-DEV-P', '/XD/1-DEV-P'],
	['1-DEV-TECH', '/XD/1-DEV-TECH'],
	['1-DEV-WEB-API', '/XD/1-DEV-WEB-API'],
	['1-DEV-WEB', '/XD/1-DEV-WEB'],
	['1-DEV-WEB-DESIGN', '/XD/1-DEV-WEB-DESIGN'],
	['1-SECURITY', '/XD/1-SECURITY'],
	['8-SCI', '/XD/8-SCI'],
	['0-WORK','/XD/0-WORK'],
	['動画','/0/動画'],
	['kurayama','/S/kurayama'],
	['9-SOC','/S/9-SOC'],
	['10-SOC','/S/10-SOC'],
	['9-ECONOMY','/S/9-ECONOMY'],
	['book','/L/book'],
	['L2','/L2'],
	['L','/L'],
	['HUMAN','/0/0-HUMAN']
	
    ]

    function getItems()
    {
	return items
    }

    function makeMenuY()
    {
	var els = makeMenuX(80 , items)
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
    }
    makeMenuY()
    
    var query = ""
    dumpBookmarks(query)

    debugPrint2("A")
    
    chrome.tabs.query( {active: true, currentWindow: true} , function(tabs) {
	var current = tabs[0]
	var title = current.title
	$('#name').val(title)
	var url = current.url
	$('#url').val(url)
	$('#zinp').click(function(){
	    debugPrint2("setTargetArea 3")
	    setTargetArea( '#move-mode' )
	    addSelectWaitingItemsX($('#yinp') , $('#zinp').val())
	})
	$('#yinp').click(function(){
	    chrome.bookmarks.get( $('#yinp').val() , function(BookmarkTreeNodes){
		$('#oname').val( BookmarkTreeNodes[0].title )
		$('#ourl').val( BookmarkTreeNodes[0].url )
		$('#oid').val( BookmarkTreeNodes[0].id )
		debugPrint2( BookmarkTreeNodes[0].id )
	    } )
	})
	setTargetArea( "#add-mode" )
	
	$('#rbtn').click(function(){
	    createOrMoveBKItemRecently( '#rinp' )
	})
	loadAndAddSelectRecently($('#rinp'))
	addSelectWaitingFolders( $('#zinp') )
	makeDistinationMenu( getItems() )
    })
    
})

