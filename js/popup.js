$(document).ready( function(){
    var Target
    var ItemHash = []
    var ItemHashByHier = new Object()
    var RootItems = []
    var TopItems = []
    var WantItemArray = []
    const ANOTHER_FOLER = -1
    var debugOption = { count_at: 10 , count_init: 0 , count: 0 , count_min: 10 , count_max: 20 }
    var Settings = {}
    var Settings0 = {}
    Settings.options = []
    Settings0.options = []

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
		debugPrint2("#add-mode")
		$('#move-mode').attr({class:"not-selected"})
		$('#add-mode').attr({class:"selected"})
	    }
	    else {
		debugPrint2("#move-mode")
		$('#add-mode').attr({class:"not-selected"})
		$('#move-mode').attr({class:"selected"})
	    }
	}
    }
    
    function createOrMoveBKItemX(select_name){
	debugPrint2("select_name=")
	debugPrint2(select_name)
	var parent_id = $(select_name).val()
	var selected_name = select_name + ' option:selected'
	debugPrint2("selected_name=")
	debugPrint2(selected_name)
	var selected = $(selected_name)
	debugPrint2("selected=")
	debugPrint2(selected)
	var parent_text = selected.text()
	var id , text
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
		chrome.bookmarks.move( id , { parentId: parent_id} )
	    }
	    else{
		alert("Can't move bookmark")
	    }
	}

	addRecentlyItem( $('#rinp') , parent_id , parent_text )
    }

    function addRecentlyItem( select , value , text )
    {
	var ind = Settings.options.findIndex(function(element,index,array){
	    return element.id == value
	})
	if( ind != undefined && ind > 0 ){
	    Settings.options.splice(ind)
	}
	if( Settings.options.length > 0 ){
	    if( Settings.options[0].value != value ){
		Settings.options.unshift( { value: value , text: text } )
	    }
	}
	else{
	    Settings.options.unshift( { value: value , text: text } )
	}
	var opts1 = []
	Settings.options.forEach( function(element, index, array) {
	    opts1.push( $('<option>' , { value: element.value , text: element.text }) )
	})
	debugPrint2("addRecentlyItem opts1=")
	debugPrint2(opts1)
	debugPrint2("addRecentlyItem opions=")
	debugPrint2(Settings.options)
	
	select.empty()
	select.append(opts1)
	debugPrint2("addRecentlyItem select=")
	debugPrint2(select)
	var entity = {}
	entity.settings = Settings
	debugPrint2("addRecentlyItem entity=")
	debugPrint2(entity)
	chrome.storage.local.set(entity, function() {
	    debugPrint2("stored 2 addRecentlyItem")
	})
    }
    function setSettings(val)
    {
	Settings = val
    }
    function updateSelectRecently(ary2,settings,select)
    {
	debugPrint2("ary2=")
	debugPrint2(ary2)
	var opts1 = []
	Settings = settings
	ary2.forEach(function(element, index, array) {
	    opts1.push( $('<option>' , { value: element.value , text: element.text }) )
	})
	select.empty()
	if( opts1.length > 0 ){
	    select.append(opts1)
	}
	debugPrint2("=updateSelectRecently select")
	debugPrint2(select)
    }
    function loadAndAddSelectRecently(select)
    {
	debugPrint2("loadAndAddSelectRecently")
	debugPrint2(select)
	var ary = []
	var defaults = {}
	defaults.settings = {
	    options: ary
	}

	chrome.storage.local.get(defaults, function(result) {
	    if(!defaults.settings.options){
		debugPrint2("local.get 1")
		ary2 = []
	    }
	    else{
		debugPrint2("local.get 2 0")
		debugPrint2(result.settings.options)
		ary2 = result.settings.options
	    }
	    updateSelectRecently(ary , result.settings , select)
	})
    }
    function loadAndAddSelectRecentlyX(select)
    {
	var ary = []
	var defaults = {}
	defaults.settings = {
	    options: ary
	}

	chrome.storage.local.get(defaults, function(result) {
	    var ary2
	    if(!defaults.settings.options){
		debugPrint2("local.get 1")
		ary2 = []
	    }
	    else{
		if(defaults.settings.options != undefined){
		    debugPrint2("local.get 2 0")
		    debugPrint2(result.settings.options)
		    ary2 = result.settings.options
		}
		else{
		    debugPrint2("local.get 2 1")
		    debugPrint2(result.settings.options)
		    ary2 = []
		}
	    }
	    var opts1 = []
	    setSettings(result.settings)
	    ary2.forEach(function(element, index, array) {
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
//	$('#zinp').click()
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

	debugPrint2("C")
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
	var xary = getSelectItem(ItemHashByHier[keytop] , true)
	xary.forEach( function(element, index, array) {
	    opts1.push( $('<option>' , { value: element.value , text: element.text }) )
	})
	opts1.push( $('<option>' , { value: ANOTHER_FOLER , text: "#別のフォルダ#" }) )
	select.append(opts1);
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
//			debugPrint2( TopItems.length )
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
	    createOrMoveBKItemX( select_name )
	})
	addSelect($(select_name) , keytop)
    }
    function makeDistinationMenu(items)
    {
	var i
	for(i=0; i<items.length ; i++){
	    makeBtnHdrAndSelect('#c'+i+'btn' , '#c'+i+'inp' , items[i])
	}
    }
    // Event called on a profile startup.
    chrome.runtime.onStartup.addListener(function () {
	alert("onStartup")
	/*
	chrome.storage.local.get(['state'], function(result) {
	    if (!result.state)
		return;

	    chrome.storage.local.set({state: result.state});
	});
*/
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
    $('#test1btn').click(function(){
	var e = {
	    abc: undefined
	}
	var text
	if( e.abc === undefined ){
	    text = "undef"
	}
	else{
	    text = "defined"
	}
	alert("abc:" + text)
	if( e.out === undefined ){
	    text = "undef"
	}
	else{
	    text = "defined"
	}
	alert("out:" + text)
    })
    function dummyFunc(ary,entity)
    {
	debugPrint2("dummyFunc 0")
	debugPrint2(ary)
	var val = Date.now()
	var text = val % 10
	ary.push( { value: val , text: text } )
	entity.settings = {
	    options: ary
	}
	chrome.storage.local.set(entity, function() {
	    debugPrint2("stored")
	})
    }
    function makeSelect(select_name)
    {
	var value = Date.now()
	var text = value % 10
	var v = { value: value , text: text }
	Settings0.options.unshift(v)
	var opts1 = []
	Settings0.options.forEach(function(element, index, array){
	    opts1.push( $('<option>' , { value: element.value , text: element.text }) )
	})
	$(select_name).empty()
	$(select_name).append(opts1)
    }
    $('#test3btn').click(function(){
//	makeSelect('#c13inp')
//	makeSelect('#rinp')
    })
    $('#dummybtn').click(function(){
	var ary = []
	var entity = {}
	var defaults = {}

	defaults.settings = {
	    options: ary
	}
	chrome.storage.local.get(defaults, function(result) {
	    var ary2
	    if(!defaults.settings.options){
		debugPrint2("local.get 1")
		ary2 = []
	    }
	    else{
		if(defaults.settings.options != undefined){
		    debugPrint2("local.get 2 0")
		    debugPrint2(result.settings.options)
		    ary2 = result.settings.options
		}
		else{
		    debugPrint2("local.get 2 1")
		    debugPrint2(result.settings.options)
		    ary2 = []
		}
	    }
	    dummyFunc(ary2 , entity)
	});

    })
    
    $('#removebtn').click(function(){
	var ary = []
	var defaults = {}
	defaults.settings = {
	    options: ary
	}
	chrome.storage.local.remove(defaults, function(result) {
	})
    })
    //
    
    var query = ""
    dumpBookmarks(query)

    debugPrint2("A")
    
    chrome.tabs.query( {active: true, currentWindow: true} , function(tabs) {
	var current = tabs[0]
	var title = current.title
	$('#name').val(title)
	var url = current.url
	$('#url').val(url)
	$('#bk').val("bkx")

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
	debugPrint2("setTargetArea 0")
	setTargetArea( "#add-mode" )
    
	$('#rbtn').click(function(){
	    createOrMoveBKItemX( '#rinp' )
	})
	loadAndAddSelectRecently($('#rinp'))
	addSelectWaitingFolders( $('#zinp') )
	var items = [
	    '/0/doc',
	    '/0/book',
	    '/XD/1-DEV',
	    '/XD/1-DEV-ENV',
	    '/XD/1-DEV-LANG',
	    '/XD/1-DEV-P',
	    '/XD/1-DEV-TECH',
	    '/XD/1-DEV-WEB',
	    '/XD/1-DEV-WEB-DESIGN',
	    '/XD/1-SECURITY',
	    '/XD/8-SCI',
	    '/XD/0-WORK',
	    '/0/動画'
	]
	makeDistinationMenu(items)
    })
    
})

