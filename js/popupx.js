import {getItems1, getKeys, getMax, getNumOfRows} from '../config/settings2.js';
import {dumpTreeNodes, moveBMX, moveBMX2} from './treenode.js';
import {restoreSelectRecently, updateSelectRecently} from './async.js';
import {addDayFolderx, addFolderx, lstree} from './addfolder.js';
import {getBtnId, getCategoryName, getJqueryId, getSelectId, makeBtnA, makeSelectA, parseURLAsync,} from './util.js';
import {getItem, getItemByHier, getItemHashByHierKeys, getKeysOfItemByHier,} from './data.js';

import {
  addRecentlyItem,
  addStorageSelected,
  adjustValue,
  ANOTHER_FOLER,
  getStorageOptions,
  initSettings_a,
  initSettings_all,
  removeSettings,
  setStorageHiers,
  setStorageOptions,
} from './global.js';

/**
 * @fileoverview ファイルの説明、使い方や依存関係に
 * ついての情報。
 */
let Target;

// always waits the document to be loaded when shown
document.addEventListener('DOMContentLoaded', function () {
  // opens a communication between scripts
  // let port = chrome.runtime.connect();

  // listens to the click of the button into the popup content
  document.getElementById('popupBtn').addEventListener('click', function () {
    // sends a message throw the communication port
    // port.postMessage({
    //     'from': 'popup',
    //     'start': 'Y'
    // V});
  });
});

/* ===== popup window 下部 下位関数 ==== */
function makeMenuRecentlyAndCategorySelectBtn(category_max, items) {
  const ary = [makeMenuXrecently()];
  return ary.concat(makeMenuXcategory(category_max, items));
}

/* 対象フォルダ選択メニュー作成 */
function makeDistinationMenu(items) {
  let i, name;
  for (i = 0; i < items.length; i++) {
    /* "c" + i という形の文字列が返る */
    name = getCategoryName(i);
    /* getBtnId - name+"btn" という文字列が返る */
    /* getSelectId - name+"inp" という文字列が返る */
    /* getJqueryId - "#" + id という文字列が返る */
    /* makeBtnHdrAndSelect - 指定selectにkeytopで指定されたブックマークのサブツリー以下の項目をoption*/
    makeBtnHdrAndSelect(
      getJqueryId(getBtnId(name)),
      getJqueryId(getSelectId(name)),
      items[i][1]
    );
  }
}

function makeMenuXcategory(max, items) {
  const ary = [];
  let i, name, text;
  let btn_id, btn_class_name, select_class_name, select_id;
  let lormax = items.length;
  if (max < lormax) {
    lormax = max;
  }
  for (i = 0; i < lormax; i++) {
    /* itemsは次の構造の配列　配列の要素は[メニュー項目名 , フォルダ名の階層構造]　 settings.jsで定義 */
    text = items[i][0];
    /* "c" + i という形の文字列が返る */
    name = getCategoryName(i);
    btn_class_name = 'button ' + name;
    btn_id = name + 'btn';
    select_class_name = 'box ' + i;
    /* name + "inp"という形の文字列が返る */
    select_id = getSelectId(name);
    /* (keytop毎に)buttonとselectのjqueryオブジェクトの組を作成 */
    ary.push({
      first: makeBtnA(text, btn_class_name, btn_id),
      second: makeSelectA(select_class_name, select_id),
    });
  }
  /* 以下のハッシュの配列 - ハッシュの要素　first:ボタン second:セレクト */
  return ary;
}

/**
 * 指定selectにkeytopで指定されたブックマークのサブツリー以下の項目をoption
 * @param {string} btn_jquery_id selectに対応するbtnを表すjqueryのid
 * @param {string} select_jquery_id optionを追加するselectを表すjqueryのid
 * @param {string} keytop bookmarkのサブツリーを指定する文字列(サブツリーまで
 */
function makeBtnHdrAndSelect(btn_jquery_id, select_jquery_id, keytop) {
  /* select作成 */
  addSelect($(select_jquery_id), keytop);
  // console.log(`addSelect keytop=${keytop}`)
  /* ボタンハンドラ作成 */
  $(btn_jquery_id).click(() => {
    createOrMoveBKItem(select_jquery_id, keytop).then(()=>{});
  });
}

/* recentlyのメニュー項目のデフォルト値 - buttonとselectのjqueryオブジェクト */
function makeMenuXrecently() {
  return {
    first: makeBtnA('recently', 'button a', 'rbtn'),
    second: makeSelectA('box d', 'rinp'),
  };
}
function addSelect(select, keytop) {
  let item;
  if (keytop != null) {
    item = getItemByHier(keytop);
    if (item != null) {
      getSelectOption(item, true).then((xary) => {
        // console.log(`### popupx.js addSelect xary.length=${xary.length}`);
        let opts1 = xary.map((ele) => $('<option>', {
          value: ele.value,
          text: ele.text,
        }))
        if (opts1.length === 0) {
          opts1.push(
              $('<option>', {value: item.id, text: item.title})
          );
        }
        opts1.push(
            $('<option>', {
              value: ANOTHER_FOLER,
              text: '#別のフォルダ#',
            })
        );
        select.empty();
        select.append(opts1);
        // console.log(`opts1=${JSON.stringify(opts1)}`)
        if (opts1.length > 0) {
          select.prop('selectedIndex', 0);
          console.log(`popupx.js addSelect opts1[0].value=${opts1[0].value}`)
          console.log(`popupx.js addSelect opts1=${ JSON.stringify(opts1) }`)
        } else {
          //		do nothing
        }
      })
    }
  }
}

async function getSelectOption(item, ignore_head) {
  let obj;
  let buffer = [];
  if (!ignore_head) {
    buffer.push({value: item.id, text: item.title});
  }
  // console.log(`popupx.js getSelection  XA item.id|${item.id}`)
  await chrome.bookmarks.getSubTree(item.id).then((bookmarkTreeNodes) => {
    let count = 100;
    obj = dumpTreeItems(bookmarkTreeNodes, count, item.id)
    if(obj.buffer.length > 0){
      buffer.push(...obj.buffer)
    }
    // console.log(`popupx.js getSelection count=${obj.count} 2 XB JSON buffer.length|${buffer.length}`)
  });
  // console.log(`popux.js getSelectOption ZZ ary.length=${ary.length}`)
  return buffer;
}

/* ===== */

/* ===== popup window 上部 下位関数 ===== */
function setTargetArea(val) {
  if (Target !== val) {
    Target = val;
    if (Target === '#add-mode') {
      $('#move-mode').attr({
        class: 'not-selected',
      });
      $('#add-mode').attr({
        class: 'selected',
      });
    } else {
      $('#add-mode').attr({
        class: 'not-selected',
      });
      $('#move-mode').attr({
        class: 'selected',
      });
    }
  }
}

function addSelectWaitingItemsX(select, folder_id) {
  const item = getItem(folder_id);
  if (item == null) {
    return;
  }

  chrome.bookmarks.getSubTree(item.id, (bookmarkTreeNodes) => {
    let count = 1;
    let obj = dumpTreeItems(bookmarkTreeNodes, count, item.id)
    let buffer2 = obj.buffer.map((ele) => $('<option>', {value: ele.value, text: ele.text}));
    select.append(buffer2);
    select.prop('selectedIndex', 0);
    const folder_id= select.val();
    if (folder_id) {
      selectWaitingItemsBtnHdr(folder_id);
    }
  });
}

async function tab_query_async(query, parent_id, parent_text) {
  let ret_tabs;
  await chrome.tabs.query(query).then((tabs) => {
    ret_tabs = tabs;
  });
  return [ret_tabs, parent_id, parent_text];
}
/* 非同期タブ問い合わせ */
async function add_mode_x([tabs, parent_id, parent_text]) {
  let i;
  let active_tab = tabs.find((tab) => tab.active)
  let move_need = true;
  // console.log(`popupx.js add_mode_x 0`)
  const radioval = $("input[name='add-mode']:checked").val();
  switch (radioval) {
    case 's':
      chrome.bookmarks.create({
        parentId: parent_id,
        title: active_tab.title,
        url: active_tab.url,
      });
      break;
    case 'm-r':
      // console.log(`popupx.js add_mode_x m-r 1 active_tab.index=${active_tab.index} tabs.length=${tabs.length}`)
      for (i = active_tab.index + 1; i < tabs.length; i++) {
        // console.log(`popupx.js add_mode_x m-r create i=${i} title=#{tabs[i].title}`)
        chrome.bookmarks.create({
          parentId: parent_id,
          title: tabs[i].title,
          url: tabs[i].url,
        });
      }
      // console.log(`popupx.js add_mode_x m-r 2`)
      /* 要検討 tabs.removeの引数をidではなくindexを指定できると勘違いしていたため、逆順に呼び出している */
      /* 引数はidなので、正順に呼び出しても構わないと思われる */
      for (i = tabs.length - 1; i > active_tab.index; i--) {
        // console.log(`popupx.js add_mode_x m-r remove i=${i}`)
        chrome.tabs.remove(tabs[i].id);
      }
      break;
    case 'm-l':
      for (i = 0; i /*<*/ < active_tab.index; i++) {
        chrome.bookmarks.create({
          parentId: parent_id,
          title: tabs[i].title,
          url: tabs[i].url,
        });
      }
      /* 要検討 tabs.removeの引数をidではなくindexを指定できると勘違いしていたため、逆順に呼び出している */
      /* 引数はidなので、正順に呼び出しても構わないと思われる */
      for (i = active_tab.index - 1; i >= 0; i--) {
        chrome.bookmarks.remove(tabs[i].id);
      }
      break;
    case 'x':
      // TODO:　要実装
      move_need = false;
      break;
    default:
      chrome.bookmarks.create({
        parentId: parent_id,
        title: active_tab.title,
        url: active_tab.url,
      });
      break;
  }
  if (move_need) {
    addRecentlyItem($('#rinp'), parent_id, parent_text);
  }
}

// async function
/* ボタンクリックハンドラの実体 */
/* 対象フォルダにbookmarkアイテムを作成または移動 */
async function createOrMoveBKItem(select_jquery_id, keytop) {
  let query;
  const radioval = $("input[name='add-mode']:checked").val();
  if( radioval === 'm-r' || radioval === 'm-l'){
    query = {
      currentWindow: true,
    }
  }
  else{
    // "s" or "x"
    query = {
      active: true,
      currentWindow: true,
    }
  }
  const parent_id = $(select_jquery_id).val();
  const selected_jquery_id = select_jquery_id + ' option:selected';
  const selected = $(selected_jquery_id);
  const parent_text = selected.text();
  // let id, text;

  addStorageSelected(keytop, selected.val());
  if (Target === '#add-mode') {
    tab_query_async(
        query,
        parent_id,
        parent_text
    ).then(add_mode_x);
  } else {
    const text = $('#oname').val();
    const url = $('#ourl').val();
    const id = $('#oid').val();
    //  console.log(`createOrMoveBKItem move-mode 1 id=${id}`)
    if (text !== '' && url !== '' && id !== '') {
      // console.log(`createOrMoveBKItem move-mode 2`)
      chrome.bookmarks.get(id, (result) => {
        // console.log(`createOrMoveBKItem move-mode 3`)
        let ret = moveBKItem(id, result[0].parentId, parent_id);
        // console.log(`createOrMoveBKItem ret=${ret}`)
        addSelectWaitingItemsX($('#yinp'), $('#zinp').val());
      });
    } else {
      alert("Can't move bookmark");
    }
  }
  addRecentlyItem($('#rinp'), parent_id, parent_text);
}

/* ボタンクリックハンドラの実体 */
/* Tabをclose */
function closeTabs() {
    tab_query_async({
      currentWindow: true,
    }).then((tabs) => {
      let i;
      const radioval = $("input[name='add-mode']:checked").val();
      switch (radioval) {
        case 's':
          /* chrome.tabs.remove(current_tab.id) */
          break;
        case 'm-r':
          /* 引数はidなので、正順に呼び出しても構わないと思われる */
          for (i = tabs.length - 1; i > current_tab.index; i--) {
            chrome.tabs.remove(tabs[i].id);
          }
          break;
        case 'm-l':
          /* 引数はidなので、正順に呼び出しても構わないと思われる */
          for (i = current_tab.index - 1; i > -1; i--) {
            chrome.tabs.remove(tabs[i].id);
          }
          break;
        default:
          break;
      }
    },
    (_) => {}
  );
}
function addSelectWaitingFolders(select, subselect) {
  const key_array = getKeys();

  const array = key_array.reduce(
    function (previousValue, currentValue) {
      const item = getItemByHier(currentValue);
      // console.log(`item=${item}`);
      if (item != null) {
        let obj = {
          value: item.id,
          text: item.title,
        };
        previousValue[0].push($('<option>', obj));
        previousValue[1].push(obj);
      }
      return previousValue;
    },
    [[], []]
  ); // => 6

  let opts1 = array[0];
  opts1.push(
      {
        value: ANOTHER_FOLER,
        text: '#別のフォルダ#',
      }
  );
  if (opts1.length > 1) {
    let opts2 = opts1.map((obj) => $('<option>', {value: obj[0], text: obj[1]}));
    select.empty();
    select.append(opts2);
    select.prop('selectedIndex', 0);
    // console.log(`addSelectWaitingFolders A select.val=${objs[0].value}`);
    addSelectWaitingItemsX(subselect, select.val());
  }
}

function moveBKItem(id, src_parent_id, dest_parent_id) {
  let ret = false;
  if (id !== '') {
    chrome.bookmarks
      .move(id, {
        parentId: dest_parent_id,
      })
      .then
      ()
      .then( () => {addSelectWaitingItemsX($('#yinp'), src_parent_id)})
      .then(() => {ret = true});
  } else {
    alert("Can't move bookmark");
  }
  return ret;
}

function dumpTreeNodesSub(element, count, parent_id, head_ignore = false) {
  let ret = {buffer: [], count: count}

  if (element.url) {
    return ret;
  }
  if(!head_ignore){
    let objx = {value:element.id, text: element.title};
    ret.buffer.push(objx);
  }
  // console.log(`<<<<<<<<<< popupx.js dumpTreeItemsSub (HEAD) count|${count} O JSON parent_id=${parent_id} element.id=${element.id} element.title=${element.title} buffuer=${JSON.stringify(ret.buffer)}`)

  if (element.children) {
    element.children.map((child) => {
      let obj = dumpTreeNodesSub(child, count + 1, parent_id, false)
        ret.buffer.push(...obj.buffer)
    })
  }
  // console.log(`popupx.js dumpTreeItemsSub count|${count} Q before return parent_id=${parent_id} JSON ret.buffuer=${JSON.stringify(ret.buffer)}`)
  return ret
}

/* ===== ----- ==== */
/***** bookmark 関連 下位関数 *****/
function dumpTreeItems(bookmarkTreeNodes, count, parent_id) {
  let i;
  let obj;
  let ret = {buffer: [], count: count}

  // console.log(`########## 1 popupx.js dumpTreeItem ount|${count} parent_id=${parent_id} W length=${bookmarkTreeNodes.length}`)
  for (i = 0; i < bookmarkTreeNodes.length; i++) {
    let element = bookmarkTreeNodes[i]
    let head_ignore = true
    obj = dumpTreeNodesSub(element, parent_id, count, head_ignore);
    if( obj.buffer.length > 0){
      ret.buffer.push(...obj.buffer)
    }
    // console.log(`########## popupx.js dumpTreeItemSub count|${count} After reduce W parent_id=${parent_id} JSON buffer.length=${ret.buffer.length}`)
  }
  return ret
}

/*********************/
/* ====== popup window 下部 ===== */
function makeMenuOnBottomArea() {
  // console.log('makeMenuOnBottomArea 1');
  const w = getNumOfRows();
  const count = getMax();
  let ind;
  let next_start;
  let b_c, b_r, s_c, s_r;
  /* getItems1() itemsは次の構造の配列　配列の要素は[メニュー項目名 , フォルダ名の階層構造]　 settings.jsで定義 */
  let items = getItems1();
  /* recentlyのメニュー項目データの配列と対象フォルダ指定用selectとbuttonの作成 */
  const els = makeMenuRecentlyAndCategorySelectBtn(count, items);
  /* 一つの対象フォルダの指定は、一組のbuttonとselectで実現するため、配置の指定には要素数を2倍にする */
  const aryx = new Array(els.length * 2);

  els.forEach(function (element, index, _) {
    ind = index % w;
    if (ind === 0) {
      if (index === 0) {
        b_r = 1;
        next_start = 2;
      } else {
        b_r = next_start * 2;
        next_start = next_start + 1;
      }
      s_r = b_r + 1;

      b_c = 1;
      s_c = 1;
    } else {
      b_c = b_c + 1;
      s_c = s_c + 1;
    }
    element.first.addClass('g-' + b_r + '-' + b_c);
    element.second.addClass('g-' + s_r + '-' + s_c);
    aryx.push(element.first);
    aryx.push(element.second);
  });
  let menu = $('#menu')
  menu.addClass('wrapper');
  menu.append(aryx);

  /* getItems1() itemsは次の構造の配列　[メニュー項目名 , フォルダ名の階層構造]　という settings.jsで定義 */
  /* 全対象フォルダselect作成 */
  makeDistinationMenu(getItems1());
  /* recently ボタンクリック処理の設定 */
  $('#rbtn').click(() => {
    createOrMoveBKItem('#rinp', 'recently').then(() => {
    });
  });

  /* recently selectの選択肢の更新 */
  let storageOptions = getStorageOptions();

  let ary = adjustValue(storageOptions);
  setStorageOptions(ary);
  setStorageHiers(getKeysOfItemByHier());
  let rinp = $('#rinp')
  rinp.empty();
  rinp.append(ary);
  let last_index = ary.length - 1;
  if (last_index >= 0) {
    rinp.val(ary[last_index].value);
  }
  if (ary.length > 0) {
    updateSelectRecently(ary, rinp);
  }
}

async function makeMenuOnBottomAreaAsync() {
  makeMenuOnBottomArea();
  return 'makeMunuOnBotttomAreaAsync';
}

function clear_in_move_mode_area() {
  $('#oname').val('');
  $('#ourl').val('');
  $('#oid').val('');
}

/* move-mode領域の */
function selectWaitingItemsBtnHdr(option_value) {
  if (option_value != null) {
    chrome.bookmarks.get(option_value, (BookmarkTreeNodes) => {
      let len = BookmarkTreeNodes.length;
      if (len > 0) {
        let bt = BookmarkTreeNodes[0];
        let title = bt.title;
        let url = bt.url;
        let id = bt.id;

        $('#oname').val(`${len} ${title}`);
        $('#ourl').val(`${url}`);
        $('#oid').val(`${id}`);
        $('#ox').val(`abc`);
        parseURLAsync(url)
          .then((parser) => {
            let href = parser.href;
            // let host = parser.host;
            let hostname = parser.hostname;
            // let pathname = parser.pathname;
            // let protocol = parser.protocol;
            // $('#ox') = href;
            $('#ox').val(hostname);
            // console.log(`href=${href}`);
            return hostname;
          })
          .catch((error) => {
            console.log(`selectWaitingItemsBtnHdr error=${error}`)
          });
      }
    });
  }
}

/* ===== popup window 上部 ===== */
function makeMenuOnUpperArea(title, url) {
  $('#name').val(title);
  $('#url').val(url);

  /* move-mode領域に対する初期設定 */

  /* 移動対象フォルダ内のアイテム一覧作成 - 要検討 */
  /* $('#zinp')は何も選択されていないので、ここでの処理は期待したとおりにならない */
  /* 表示されたときに、選択状態にしたいならば、別途初期化を行う関数を定義して、呼び出さなければならない */

  /* move-mode領域のフォルダ名選択時の動作 */
  let yinp = $('#yinp');
  yinp.click(() => {
    setTargetArea('#move-mode');
    let value = yinp.val();
    selectWaitingItemsBtnHdr(value);
  });
  /* move-mode時の移動対象アイテム選択時の動作 */
  /*** ★chrome bookmarks APIにはidが必要。これは隠れフィールドoidに設定しておく***/
  let zinp = $('#zinp')
  zinp.click(() => {
    /* move-mode領域を選択状態にする */
    setTargetArea('#move-mode');
    let value = zinp.val();
    if (value != null) {
      /* 対象フォルダに含まれるアイテム一覧作成 */
      addSelectWaitingItemsX(yinp, value);
    }
  });

  /* add-mode領域を選択状態にする(デフォルトにする) */
  setTargetArea('#add-mode');

  addSelectWaitingFolders(zinp, yinp);

  $('#add-mode').click(() => {
    setTargetArea('#add-mode');
  });
  $('#move-mode').click(() => {
    setTargetArea('#move-mode');
  });

  $('#gotobtn').click(() => {
    /* 隠しフィールドに設定したtab idは、val()で取得しただけでは文字列になるので、整数値にする */
    const sid = parseInt($('#sid').val(), 10);
    const ourl = $('#ourl').val();
    chrome.tabs.update(
      sid,
      {
        url: ourl,
      },
      (_) => {
        // console.log(["sid=", sid, "ourl=", ourl]);
      }
    );
  });
  $('#importbtn').click(() => {
    // #TODO: importbtnのハンドラの実装
    console.log('not implemented a handler of importbtn')
  });
  $('#removeitembtn').click(() => {
    let valx = $('#oid').val();
    chrome.bookmarks.remove(valx, () => {
      const parent_id = $('#zinp').val();
      clear_in_move_mode_area();
      let yinp = $('#yinp');
      yinp.empty();
      addSelectWaitingItemsX(yinp, parent_id);
    });
  });
  $('#removebtn').click(() => {
    removeSettings();
  });
  $('#closebtn').click(() => {
    closeTabs();
  });
  $('#addFolderbtn').click(() => {
    addFolderx();
  });
  $('#addDbtn').click(() => {
    addDayFolderx();
  });
  $('#moveBMX').click(() => {
    // removeSettings();
    moveBMX();
  });
  $('#moveBMX2').click(() => {
    moveBMX2();
    //    console.log("moveBMX2");
  });
  $('#addFcbtn').click(() => {
    console.log('addFcbtn');
  });

  $('#lsbtn').click(() => {
    lstree();
  });
  $('#test1btn').click(() => {
    // TODO: do nothing
  });
}

/* ===== popup windowsの作成 ===== */
async function setupPopupWindowAsync() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  const current = tabs[0];
  const title = current.title;
  const url = current.url;
  $('#sid').val(current.id);

  makeMenuOnUpperArea(title, url);
}

async function dumpBookmarksAsync() {
  return chrome.bookmarks.getTree();
}

async function make_popup_ui() {
  // (`### make_popup_ui`);
  await setupPopupWindowAsync();
  await makeMenuOnBottomAreaAsync();
  // console.log(`startI 4`);
}
async function get_bookmarks() {
  dumpBookmarksAsync().then((bookmarkTreeNodes) => {
    dumpTreeNodesAsync(bookmarkTreeNodes);
  });
}
async function dumpTreeNodesAsync(bookmarkTreeNodes) {
  dumpTreeNodes(bookmarkTreeNodes);
  const hierKeys = getItemHashByHierKeys();
  // console.log(`hierKeys=${hierKeys}`);
  setStorageHiers(hierKeys);
  return bookmarkTreeNodes;
}

async function start() {
  // console.log('startJ 1');
  initSettings_a();
  await initSettings_all();
  await get_bookmarks();
  await make_popup_ui();
  restoreSelectRecently($('#rinp'));
}

start();
