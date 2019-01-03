/**
 * @fileoverview ファイルの説明、使い方や依存関係に
 * ついての情報。
 */
$(document).ready( function(){
    var Target
    var ItemHash = []
    var ItemHashByHier = new Object()
    //    var ItemHashByHier = {}
    var RootItems = []
    var TopItems = []
    const ANOTHER_FOLER = -1
    const StorageOptions = 'Options'  /* 選択された対象フォルダの履歴() */
    const StorageSelected = 'Selected' /* 各keytop毎の選択された対象フォルダ */

    var Settings = {}
    Settings[StorageOptions] = []
    Settings[StorageSelected] = {}

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

    /* 対象フォルダ選択メニュー作成 */
    function makeDistinationMenu(items)
    {
        var i,name
        for(i=0; i<items.length ; i++){
            /* "c" + i という形の文字列が返る */
            name = getCategoryName( i )
            /* getBtnId - name+"btn" という文字列が返る */
            /* getSelectId - name+"inp" という文字列が返る */
            /* getJqueryId - "#" + id という文字列が返る */
            /* makeBtnHdrAndSelect - 指定selectにkeytopで指定されたブックマークのサブツリー以下の項目をoption*/
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
            /* itemsは次の構造の配列　配列の要素は[メニュー項目名 , フォルダ名の階層構造]　 settings.jsで定義 */
            text = items[i][0]
            /* "c" + i という形の文字列が返る */
            name = getCategoryName( i )
            btn_class_name = "button " + name
            btn_id = name + "btn"
            select_class_name = "box " + i
            /* name + "inp"という形の文字列が返る */
            select_id = getSelectId(name)
            /* (keytop毎に)buttonとselectのjqueryオブジェクトの組を作成 */
            ary.push({
                first: makeBtnA( text , btn_class_name , btn_id ),
                second: makeSelectA( select_class_name , select_id )
            })
        }
        /* 以下のハッシュの配列 - ハッシュの要素　first:ボタン second:セレクト */
        return ary
    }

    /**
     * 指定selectにkeytopで指定されたブックマークのサブツリー以下の項目をoption
     * @param {number} btn_jquery_id selectに対応するbtnを表すjqueryのid
     * @param {number} select_jquery_id optionを追加するselectを表すjqueryのid
     * @param {string} keytop bookmarkのサブツリーを指定する文字列(サブツリーまで
     */
    function makeBtnHdrAndSelect(btn_jquery_id , select_jquery_id , keytop)
    {
        /* select作成 */
        addSelect($(select_jquery_id) , keytop)
        /* ボタンハンドラ作成 */
        $(btn_jquery_id).click(() => {
            createOrMoveBKItem( select_jquery_id , keytop)
        })
    }

    /* recentlyのメニュー項目のデフォルト値 - buttonとselectのjqueryオブジェクト */
    function makeMenuXrecently()
    {
        return {
            first: makeBtnA( "recently" , "button a" , "rbtn" ) ,
            second: makeSelectA( "box d" , "rinp" )
        }
    }

    /* buttonのjqueryオブジェクト */
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

    /* selectのjqueryオブジェクト */
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
            item = getItemByHier(keytop)
            if( item != undefined ){
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
            }
            else{
                //		do nothing
            }
        }
    }

    function getSelectOption(item , ignore_head){
        ignore_head = ignore_head === undefined ? false : ignore_head

        var ary = []
        if (!ignore_head){
            ary.push( { value: item.id , text: item.title } )
        }
        if (item.children.length > 0) {
            item.children.forEach( (element, index, array) => {
                Array.prototype.push.apply( ary , getSelectOption(element) )
            } )
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

    function dumpTreeItemsX(bookmarkTreeNodes) {
        var ary = []
        var i
        for (i = 0; i < bookmarkTreeNodes.length; i++) {
            element = bookmarkTreeNodes[i]
            if (element.url) {
                ary.push(element.id)
            }

            if (element.children) {
                ary = ary.concat(dumpTreeItemsX(element.children))
            }
        }
        return ary
    }

    function dumpTreeItemsXTop(folder_id) {
        var zary = []
        var item = ItemHash[folder_id]

        chrome.bookmarks.getSubTree(item.id,
            (bookmarkTreeNodes) => {
                zary = dumpTreeItemsX(bookmarkTreeNodes)
            })
        debugPrint2(["dumpTreeItemsXTop", "folder_id=", folder_id, "item.id=", item.id, "zary.lenght=", zary.length])
        return zary
    }

    function addSelectWaitingItemsX(select , folder_id)
    {
        var item = ItemHash[folder_id]
        debugPrint2( ["folder_id=" , folder_id ])


        chrome.bookmarks.getSubTree( item.id ,
                        (bookmarkTreeNodes) => {
                            select.empty()
                            var zary = dumpTreeItems(bookmarkTreeNodes , true)
                            select.append( zary )
                            var folder_id = select.val()
                            if( folder_id ){
                                selectWaitingItemsBtnHdr(folder_id)
                            }
                        })
    }

    /* 非同期タブ問い合わせ */
    function tab_query_async(query) {
        var promise = new Promise(function (resolve, reject) {
                chrome.tabs.query(query, (tabs) => {
                    resolve(tabs)
                })
        })
        return promise
    }

    /* ボタンクリックハンドラの実体 */
    /* 対象フォルダにbookmarkアイテムを作成または移動 */
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
            tab_query_async({
                active: true,
                currentWindow: true
            }).then(
                (cur_tabs) => {
                    var current_tab = cur_tabs[0]
                    tab_query_async({
                        currentWindow: true
                    }).then(
                        (tabs) => {
                            var i
                            var radioval = $("input[name='add-mode']:checked").val()
                            switch (radioval) {
                                case 'single':
                                    chrome.bookmarks.create({
                                        parentId: parent_id,
                                        title: current_tab.title,
                                        url: current_tab.url
                                    })
                                    /* chrome.tabs.remove(current_tab.id) */
                                    break
                                case 'multi-r':
                                    for (i = current_tab.index + 1; i < tabs.length; i++) {
                                        console.log( [i, tabs[i].text , tabs[i].url ] )
                                        chrome.bookmarks.create({
                                            parentId: parent_id,
                                            title: tabs[i].title,
                                            url: tabs[i].url
                                        })
                                    }
                                    /* 要検討 tabs.removeの引数をidではなくindexを指定できると勘違いしていたため、逆順に呼び出している */
                                    /* 引数はidなので、正順に呼び出しても構わないと思われる */
                                    for (i = tabs.length - 1; i > current_tab.index; i--) {
                                        chrome.tabs.remove( tabs[i].id )
                                    }
                                    break
                                case 'multi-l':
                                    for (i = 0; i < current_tab.index; i++) {
                                        chrome.bookmarks.create({
                                            parentId: parent_id,
                                            title: tabs[i].text,
                                            url: tabs[i].url
                                        })
                                    }
                                    /* 要検討 tabs.removeの引数をidではなくindexを指定できると勘違いしていたため、逆順に呼び出している */
                                    /* 引数はidなので、正順に呼び出しても構わないと思われる */
                                    for (i = current_tab.index - 1; i > -1; i--) {
                                        chrome.bookmarks.remove(tabs[i].id)
                                    }
                                    break
                                default:
                                    chrome.bookmarks.create({
                                        parentId: parent_id,
                                        title: current_tab.title,
                                        url: current_tab.url
                                    })
                            }
                        }
                    )
                },
                (value) => {}
            )
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
        var key_array = getKeys()
        key_array.forEach( (element, index, array) => {
            item = ItemHashByHier[element]
            if( item !== undefined ){
                values.push(item.id)
                opts1.push( $('<option>' , { value: item.id , text: element }) )
            }
        })
        opts1.push( $('<option>' , { value: ANOTHER_FOLER , text: "#別のフォルダ#" }) )
        select.append(opts1);
        debugPrint2("addSelectWaitingFolders");
        addSelectWaitingItemsX( $('#yinp'), values[0] )
    }

    function dumpBookmarksFromSubTree(parentId , query)
    {
        var bookmarkTreeNodes = chrome.bookmarks.getSubTree(
            parentId,
            (bookmarkTreeNodes) => {
                ItemHash[parentId].children = dumpTreeNodes(bookmarkTreeNodes, { })
                addSelectWaitingItemsX($('#yinp') , parentId )
            }
        )
    }

    function moveBKItem(id , src_parent_id , dest_parent_id)
    {
        if( id != "" ){
            chrome.bookmarks.move( id , { parentId: dest_parent_id} )
            dumpBookmarksFromSubTree(src_parent_id , "")
            /* addSelectWaitingItemsX($('#yinp') , src_parent_id) */
        }
        else{
            alert("Can't move bookmark")
        }
    }

    /* ===== ----- ==== */
    function addRecentlyItem( select , value , text )
    {
        /* 現在選択された対象フォルダが過去にも選択されていれば、過去の対象フォルダを直近に移動させる（つまりあらかじめ、過去の記録を削除する） */
        /* 直近で同一対象フォルダが選択されていても、いったん削除する */
        var ind = Settings[StorageOptions].findIndex((element,index,array) => {
            return element.value == value
        })
        if( ind >= 0 ){
            Settings[StorageOptions].splice(ind, 1)
        }
        Settings[StorageOptions].unshift( { value: value , text: text } )

        /* selectにアイテムを追加する(いったんslectの内容を消去して、追加したデータを改めてselectに設定する) */
        var opts1 = []
        Settings[StorageOptions].forEach( (element, index, array) => {
            opts1.push( $('<option>' , { value: element.value , text: element.text }) )
        })
        select.empty()
        select.append(opts1)
        select.val(value)

        /* 変更したSettingの内容をローカルに保存する */
        var val = {}
        val[StorageOptions] = Settings[StorageOptions]
        val[StorageSelected] = Settings[StorageSelected]
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
        debugPrint2("makeMenuOnBottomArea 1")
        var w = 5
        var count = 80
        var ind
        var next_start
        var b_c,b_r,s_c,s_r
        /* getItems1() itemsは次の構造の配列　配列の要素は[メニュー項目名 , フォルダ名の階層構造]　 settings.jsで定義 */
        var items = getItems1()
        /* recentlyのメニュー項目データの配列と対象フォルダ指定用selectとbuttonの作成 */
        var els = makeMenuRecentlyAndCategorySelectBtn(count , items)
        /* 一つの対象フォルダの指定は、一組のbuttonとselectで実現するため、配置の指定には要素数を2倍にする */
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

        /* getItems1() itemsは次の構造の配列　[メニュー項目名 , フォルダ名の階層構造]　という settings.jsで定義 */
        /* 全対象フォルダselect作成 */
        makeDistinationMenu( getItems1() )
        /* recently ボタンクリック処理の設定 */
        $('#rbtn').click(() => {
            createOrMoveBKItem( '#rinp' , 'recently' )
        })
        /* recently selectの選択肢の更新 */
        updateSelectRecently(Settings[StorageOptions] , $('#rinp'))
        debugPrint2("makeMenuOnBottomArea 2")
    }

    function makeMenuOnBottomAreaAsync() {
        return new Promise( (resolve, reject) => {
            debugPrint2("makeMenuOnBottomAreaAsyc 1")
            makeMenuOnBottomArea() 
            debugPrint2("makeMenuOnBottomAreaAsyc")
            resolve()
        } )
    }

    /* ===== popup window 上部 ===== */
    function makeMenuOnUpperArea(title,url)
    {
        /* add-mode領域 */
        $('#name').val(title)
        $('#url').val(url)

        /* move-mode領域に対する初期設定 */

        /* 移動対象フォルダ内のアイテム一覧作成 - 要検討 */
        /* $('#zinp')は何も選択されていないので、ここでの処理は期待したとおりにならない */
        /* 表示されたときに、選択状態にしたいならば、別途初期化を行う関数を定義して、呼び出さなければならない */

        /* move-mode領域のフォルダ名選択時の動作 */
        $('#zinp').click(() => {
            /* move-mode領域を選択状態にする */
            setTargetArea( '#move-mode' )
            /* 対象フォルダに含まれるアイテム一覧作成 */
            addSelectWaitingItemsX($('#yinp') , $('#zinp').val())
        })　
        /* move-mode時の移動対象アイテム選択時の動作 */
        /*** ★hrome bookmarks APIにはidが必要。これは隠れフィールドoidに設定しておく***/
        $('#yinp').click(() => {
            selectWaitingItemsBtnHdr( $('#yinp').val() )
        })

        /* add-mode領域を選択状態にする(デフォルトにする) */
        setTargetArea( "#add-mode" )

        addSelectWaitingFolders( $('#zinp') )

        $('#add-mode').click(() => {
            setTargetArea( '#add-mode' )
        })
        $('#move-mode').click(() => {
            setTargetArea( '#move-mode' )
        })

        $('#gotobtn').click(() => {
            /* 隠しフィールドに設定したtab idは、val()で取得しただけでは文字列になるので、整数値にする */
            var sid = parseInt( $('#sid').val() , 10 )
            var ourl = $('#ourl').val()
            chrome.tabs.update(sid, {
                        url: ourl
                    }, (tab) => {
                        console.log(["sid=",sid , "ourl=", ourl ])
                    }
            )
        })
        $('#removeitembtn').click(() => {
            chrome.bookmarks.remove($('#oid').val(), (result) => {
            var parent_id = $('#zinp').val()
            $('#yinp').empty()
            $('#ourl').val("")
            $('#oid').val("")
            dumpBookmarksFromSubTree( parent_id , "")
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
            } )
        })
    }

    /* move-mode領域の */
    function selectWaitingItemsBtnHdr(folder_id) {
        chrome.bookmarks.get(folder_id, (BookmarkTreeNodes) => {
            $('#oname').val(BookmarkTreeNodes[0].title)
            $('#ourl').val(BookmarkTreeNodes[0].url)
            $('#oid').val(BookmarkTreeNodes[0].id)
        })
    }

    /* ===== bookmarkの情報を取得 ===== */
    /* 指定フォルダ以下の対象フォルダの一覧取得(配列として) */
    /* この関数は再帰的に呼び出されるが、内部処理は必ず最初はchromeのbookmarksのトップに対
    して呼び出されることを想定している */
    /* 一気に全フォルダの階層構造をつくることが目的である */
    function dumpTreeNodes(bookmarkTreeNodes , parent_item) {
        //	debugPrint2("dTN 1")
        var ary = []
        /* bookmarkTreeNodes - フォルダと項目が混在している */
        bookmarkTreeNodes.forEach( (element, index, array) => {
            /* フォルダのみを処理する（項目は無視する） */
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
                    hier: ""/* hier */,
                    children: [],
                }
                /* 親フォルダがなければ、ルート階層のフォルダとする */
                if ( !item.parentId ) {
                    item.root = true
                    RootItems.push(item.id)
                    item.hier = item.title
                }
                else {
                    /* 親フォルダがルート階層のフォルダであればトップ階層のフォルダにする */
                    if ( parent_item.root ) {
                        item.top = true
                        item.hier = ""
                        TopItems.push(item.id)
                    }
                    /* 親フォルダが通常のフォルダであれば、自身の階層名をつくる */
                    else {
                        item.hier = parent_item.hier + '/' +  item.title
                    }
                }

                ItemHash[item.id] = item
                ItemHashByHier[item.hier] = item
                if ( element.children.length > 0 ) {
                    item.children = dumpTreeNodes(element.children , item) 
                }
                ary.push( item )
            }
        } )
        return ary
    }

    function dumpTreeNodesAsync(bookmarkTreeNodes) {
        return new Promise( (resolve, reject) => {
            debugPrint2("Promise dumpTreeNodes 1")
            dumpTreeNodes(bookmarkTreeNodes, { root: true }) 
            debugPrint2("Promise dumpTreeNodes 2")
            resolve({})
        } )
    }
    /* ===== popup windowsの作成 ===== */
    function setupPopupWindowAsync(){
        return new Promise( (resolve, reject) => {
            debugPrint2("setupPopupWindowAsync 1")

            chrome.tabs.query( {active: true, currentWindow: true} , (tabs) => {
                var current = tabs[0]
                var title = current.title
                var url = current.url
                $('#sid').val(current.id)

                makeMenuOnUpperArea(title,url)
                debugPrint2("setupPopupWindowAsync 2")
                resolve({})
            })
        } )
    }

    function loadAsync(){
        return new Promise( (resolve, reject) => {
            debugPrint2("Promise loadAsync 1")
            chrome.storage.local.get([StorageOptions, StorageSelected] , (result)  => {
                if(!result[StorageOptions]){
                    debugPrint2("loadAsync 1 A")
                    result[StorageOptions] = []
                }
                if(!result[StorageSelected]){
                    debugPrint2("loadAsync C")
                    result[StorageSelected] = {}
                }
                setSettings(result)
                debugPrint2("Promise loadAsync 2")

                resolve({})
            })
        } )
    }

    function dumpBookmarksAsync(){
        return new Promise( (resolve, reject ) => {
            debugPrint2("Promise dumpBookmarksAsync")
            chrome.bookmarks.getTree(
            (bookmarkTreeNodes) => {
                resolve(bookmarkTreeNodes)
            } )
        } )
    }

    function start()
    {
        dumpBookmarksAsync()
            .then( (bookmarkTreeNodes) => {dumpTreeNodesAsync(bookmarkTreeNodes)} )
            .then(
                loadAsync().then( setupPopupWindowAsync ).then( makeMenuOnBottomAreaAsync )
            )
    }
    start()
})

