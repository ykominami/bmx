import { dumpTreeNodes, moveBMX, moveBMX2, moveBMX3 } from './treenode.js';
import { updateSelectRecently } from './async.js';
import { getItems1, getKeys, getNumOfRows, getMax } from './settings.js';
import { addFolderx, addDayFolderx, lstree } from './addfolder.js';
import {
  makeBtnA,
  makeSelectA,
  getCategoryName,
  getSelectId,
  getBtnId,
  getJqueryId,
  parseURLAsync,
} from './util.js';
import {
  getItemByHier,
  getKeysOfItemByHier,
  getItemHashByHierKeys,
  getItem,
} from './data.js';

import {
  ANOTHER_FOLER,
  initSettings_all,
  initSettings_a,
  addStorageSelected,
  setStorageHiers,
  setStorageOptions,
  getStorageOptions,
  removeSettings,
  addRecentlyItem,
  adjustValue,
} from './global.js';

import { restoreSelectRecently } from './async.js';

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

  const ary2 = ary.concat(makeMenuXcategory(category_max, items));

  return ary2;
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
  37;
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
 * @param {number} btn_jquery_id selectに対応するbtnを表すjqueryのid
 * @param {number} select_jquery_id optionを追加するselectを表すjqueryのid
 * @param {string} keytop bookmarkのサブツリーを指定する文字列(サブツリーまで
 */
function makeBtnHdrAndSelect(btn_jquery_id, select_jquery_id, keytop) {
  /* select作成 */
  addSelect($(select_jquery_id), keytop);
  /* ボタンハンドラ作成 */
  $(btn_jquery_id).click(() => {
    createOrMoveBKItem(select_jquery_id, keytop);
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
      const xary = getSelectOption(item, false);
      let opts1 = xary.map((element) => {
        return $('<option>', {
          value: element.value,
          text: element.text,
        });
      });
      if (opts1.length == 0) {
        let item2 = getItemByHier(keytop);
        opts1.push(
          $('<option>', {
            value: item2.id,
            text: item2.title,
          })
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
      if (opts1.length > 0) {
        select.val(xary[0].value);
      } else {
        //		do nothing
      }
    }
  }
}
function getSelectOption(item, ignore_head) {
  let ary = [];
  if (!ignore_head) {
    ary.push({
      value: item.id,
      text: item.title,
    });
  }
  if (item.children.length > 0) {
    ary = item.children.map((element) => {
      return getSelectOption(element, false);
    });
  }
  const aryx = ary.flat();
  return aryx;
}

/* ===== */

/* ===== popup window 上部 下位関数 ===== */
function setTargetArea(val) {
  if (Target != val) {
    Target = val;
    if (Target == '#add-mode') {
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
    select.empty();
    const zary = dumpTreeItems(bookmarkTreeNodes, true);
    select.append(zary);
    const folder_id = select.val();
    if (folder_id) {
      selectWaitingItemsBtnHdr(folder_id);
    }
  });
}

async function tab_query_async(query, parent_id, parent_text) {
  let ret_tab;
  await chrome.tabs.query(query).then((tab) => {
    ret_tab = tab;
  });
  return [ret_tab, parent_id, parent_text];
}
/* 非同期タブ問い合わせ */
async function add_mode_x([tabs, parent_id, parent_text]) {
  const current_tab = tabs[0];
  let i;
  let move_need = true;
  const radioval = $("input[name='add-mode']:checked").val();
  switch (radioval) {
    case 's':
      chrome.bookmarks.create({
        parentId: parent_id,
        title: current_tab.title,
        url: current_tab.url,
      });
      break;
    case 'm-r':
      for (i = tabs.index /* + 1*/; i < tabs.length; i++) {
        chrome.bookmarks.create({
          parentId: parent_id,
          title: tabs[i].title,
          url: tabs[i].url,
        });
      }
      /* 要検討 tabs.removeの引数をidではなくindexを指定できると勘違いしていたため、逆順に呼び出している */
      /* 引数はidなので、正順に呼び出しても構わないと思われる */
      for (i = tabs.length - 1; i >= current_tab.index; i--) {
        chrome.tabs.remove(tabs[i].id);
      }
      break;
    case 'm-l':
      for (i = 0; i /*<*/ <= current_tab.index; i++) {
        chrome.bookmarks.create({
          parentId: parent_id,
          title: tabs[i].text,
          url: tabs[i].url,
        });
      }
      /* 要検討 tabs.removeの引数をidではなくindexを指定できると勘違いしていたため、逆順に呼び出している */
      /* 引数はidなので、正順に呼び出しても構わないと思われる */
      for (i = current_tab.index /* - 1 */; i > -1; i--) {
        chrome.bookmarks.remove(tabs[i].id);
      }
      break;
    case 'x':
      // TODO　要実装
      move_need = false;
      break;
    default:
      chrome.bookmarks.create({
        parentId: parent_id,
        title: current_tab.title,
        url: current_tab.url,
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
  const parent_id = $(select_jquery_id).val();
  const selected_jquery_id = select_jquery_id + ' option:selected';
  const selected = $(selected_jquery_id);
  const parent_text = selected.text();
  // let id, text;

  addStorageSelected(keytop, selected.val());
  if (Target == '#add-mode') {
    tab_query_async(
      {
        active: true,
        currentWindow: true,
      },
      parent_id,
      parent_text
    ).then(add_mode_x);
  } else {
    const text = $('#oname').val();
    const url = $('#ourl').val();
    const id = $('#oid').val();
    //  console.log(`createOrMoveBKItem move-mode 1 id=${id}`)
    if (text != '' && url != '' && id != '') {
      // console.log(`createOrMoveBKItem move-mode 2`)
      chrome.bookmarks.get(id, (result) => {
        // console.log(`createOrMoveBKItem move-mode 3`)
        let ret = moveBKItem(id, result[0].parentId, parent_id);
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
    active: true,
    currentWindow: true,
  }).then(
    (tabs) => {
      const current_tab = tabs[0];
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
      });
    },
    (value) => {}
  );
}
function addSelectWaitingFolders(select, subselect) {
  const key_array = getKeys();

  const array = key_array.reduce(
    function (previousValue, currentValue) {
      const item = getItemByHier(currentValue);
      // console.log(`item=${item}`);
      if (item != null) {
        let item_title = item.title;
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
  let objs = array[1];

  opts1.push(
    $('<option>', {
      value: ANOTHER_FOLER,
      text: '#別のフォルダ#',
    })
  );
  if (opts1.length > 1) {
    select.empty();
    select.append(opts1);
    select.prop('selectedIndex', 0);
    // console.log(`addSelectWaitingFolders A select.val=${objs[0].value}`);
    addSelectWaitingItemsX(subselect, select.val());
  }
}

function dumpBookmarksFromSubTree(parentId) {
  chrome.bookmarks.getSubTree(parentId, (bookmarkTreeNodes) => {
    let item = getItem(parentId);
    item.children = dumpTreeNodes(bookmarkTreeNodes);
    addSelectWaitingItemsX($('#yinp'), parentId);
  });
}

function moveBKItem(id, src_parent_id, dest_parent_id) {
  let ret = false;
  if (id != '') {
    chrome.bookmarks
      .move(id, {
        parentId: dest_parent_id,
      })
      .then
      ()
      .then(addSelectWaitingItemsX($('#yinp'), src_parent_id))
      .then((ret = true));
  } else {
    alert("Can't move bookmark");
  }
  return ret;
}

/* ===== ----- ==== */
/***** bookmark 関連 下位関数 *****/
function dumpTreeItems(bookmarkTreeNodes, ignore_head = false) {
  let ary = [];
  let i;
  for (i = 0; i < bookmarkTreeNodes.length; i++) {
    const element = bookmarkTreeNodes[i];

    if (!ignore_head) {
      if (!element.url) {
        ary.push(
          $('<option>', {
            value: element.id,
            text: element.title,
          })
        );
        // console.log(`in popupx.js call dumpTreeItems 1 ary=${ary}`);
      }
    }
    if (element.children) {
      ary = ary.concat(dumpTreeItems(element.children, false));
    }
  }
  return ary;
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

  els.forEach(function (element, index, array) {
    ind = index % w;
    if (ind == 0) {
      if (index == 0) {
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
    createOrMoveBKItem('#rinp', 'recently');
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
    $('#rinp').val(ary[last_index].value);
  }
  if (ary.length > 0) {
    updateSelectRecently(ary, $('#rinp'));
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
            let host = parser.host;
            let hostname = parser.hostname;
            let pathname = parser.pathname;
            let protocol = parser.protocol;
            // $('#ox') = href;
            $('#ox').val(hostname);
            console.log(`href=${href}`);
            return hostname;
          })
          .catch((error) => {
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
  $('#yinp').click(() => {
    setTargetArea('#move-mode');
    let value = $('#yinp').val();
    selectWaitingItemsBtnHdr(value);
  });
  /* move-mode時の移動対象アイテム選択時の動作 */
  /*** ★chrome bookmarks APIにはidが必要。これは隠れフィールドoidに設定しておく***/
  $('#zinp').click(() => {
    /* move-mode領域を選択状態にする */
    setTargetArea('#move-mode');
    let value = $('#zinp').val();
    if (value != null) {
      /* 対象フォルダに含まれるアイテム一覧作成 */
      addSelectWaitingItemsX($('#yinp'), value);
    }
  });

  /* add-mode領域を選択状態にする(デフォルトにする) */
  setTargetArea('#add-mode');

  addSelectWaitingFolders($('#zinp'), $('#yinp'));

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
      (tab) => {
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
  $('#moveBMX3').click(() => {
    moveBMX3();
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
  const bookmarkTreeNodes = chrome.bookmarks.getTree();
  return bookmarkTreeNodes;
}

document.querySelector('#go-to-options').addEventListener('click', () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});

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
