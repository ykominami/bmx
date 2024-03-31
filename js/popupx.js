import {
  getItems1,
  getKeys,
  getNumOfRows,
  getMax,
  getPrefix,
  getFoldersFromPrefixes,
  getFoldersFromDayPrefixes,
} from './settings.js';
import {
  getYearAndNextMonthAsString,
  registerx,
  makeElement,
  makeItem,
  makeAndRegisterBookmarkFolder,
  addFolderx,
  addDayFolderx,
  lstree,
} from './addfolder.js';
import {
  getMonthx,
  adjustAsStr,
  makeBtnA,
  makeSelectA,
  getCategoryName,
  getSelectId,
  getBtnId,
  getJqueryId,
} from './util.js';
import {
  getItemByHier,
  setItemByHier,
  getItemHashByHierKeys,
  getItem,
  setItem,
  getItemHashKeys,
  initItems,
  printItemHashByHier,
  printItemHash,
} from './data.js';

import { debugPrint2, debugPrint } from './debug.js';

import {
  adjustValue,
  setSettings,
  setSettingsFromLoad,
  setSettingsFromLoad2,
  StorageOptions,
  StorageSelected,
  StorageHiers,
  getStorageHiers,
  ANOTHER_FOLER,
  initSettings_all,
  getSettingsByKey,
  setStorageSelected,
  getStorageOptions,
  setStorageHiers,
  setStorageOptions,
  setStorageMisc,
  storageOptionsUnshift,
  saveSettings,
  loadSettings,
  loadSettings2,
  removeSettings,
  copyFromLoadToSettingsX,
  copyFromLoad2ToSettingsX,
  printSettings,
  printSettingsFromLoad,
  printSettingsFromLoad2,
  printBase,
} from './global.js';

import { loadAsync } from './async.js';

/**
 * @fileoverview ファイルの説明、使い方や依存関係に
 * ついての情報。
 */
let Target;
let RootItems = [];
let TopItems = [];

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
  const ary = [];

  ary.push(makeMenuXrecently());
  const ary2 = ary.concat(makeMenuXcategory(category_max, items));

  return ary2;
}

function importUrls(urls) {
  const keytop = '/0/0-etc/1';
  const parent_item = getItemByHier(keytop);
  const parent_id = parent_item.id;

  urls.map(function (item) {
    chrome.bookmarks.create({
      parentId: parent_id,
      title: item[1],
      url: item[0],
    });
  });
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

function updateSelectRecently(ary2, select) {
  const opts1 = [];
  ary2.map((element) => {
    opts1.push(
      $('<option>', {
        value: element.value,
        text: element.text,
      })
    );
  });
  console.log(`------------------- updateSelectRecently ary2=${ary2}`);
  select.empty();
  if (opts1.length > 0) {
    select.append(opts1);
    select.val(ary2[0].value);
  }
}

/* ===== ----- ==== */
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
  let opts1 = [];
  let item, item2, value;
  if (keytop != null) {
    item = getItemByHier(keytop);
    if (item !== null && item !== undefined) {
      let xary = getSelectOption(item, true);
      xary.forEach((element, index, array) => {
        opts1.push(
          $('<option>', {
            value: element.value,
            text: element.text,
          })
        );
      });
      opts1.push(
        $('<option>', {
          value: ANOTHER_FOLER,
          text: '#別のフォルダ#',
        })
      );
      select.append(opts1);

      // x(keytop);
    } else {
      //		do nothing
    }
  }
}

function getSelectOption(item, ignore_head) {
  ignore_head =
    ignore_head === null || ignore_head === undefined ? false : ignore_head;

  const ary = [];
  if (!ignore_head) {
    ary.push({
      value: item.id,
      text: item.title,
    });
  }
  if (item.children.length > 0) {
    item.children.forEach((element, index, array) => {
      Array.prototype.push.apply(ary, getSelectOption(element));
    });
  }
  return ary;
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
  console.log(`folder_id=${folder_id}`);
  console.log(`item.id=${item.id}`);
  // debugPrint2(["folder_id=", folder_id]);

  chrome.bookmarks.getSubTree(item.id, (bookmarkTreeNodes) => {
    select.empty();
    const zary = dumpTreeItems(bookmarkTreeNodes, true);
    select.append(zary);
    const folder_id = select.val();
    console.log(`addSelectWaitingItemsX 2 folder_id=${folder_id}`);
    if (folder_id) {
      console.log(`addSelectWaitingItemsX 3 folder_id=${folder_id}`);
      selectWaitingItemsBtnHdr(folder_id);
    }
  });
}

/* 非同期タブ問い合わせ */
function tab_query_async(query) {
  const promise = new Promise(function (resolve, reject) {
    chrome.tabs.query(query, (tabs) => {
      resolve(tabs);
    });
  });
  return promise;
}

/* ボタンクリックハンドラの実体 */
/* 対象フォルダにbookmarkアイテムを作成または移動 */
async function createOrMoveBKItem(select_jquery_id, keytop) {
  const parent_id = $(select_jquery_id).val();
  const selected_jquery_id = select_jquery_id + ' option:selected';
  const selected = $(selected_jquery_id);
  const parent_text = selected.text();
  // let id, text;

  setStorageSelected(keytop, selected.val());
  if (Target == '#add-mode') {
    tab_query_async({
      active: true,
      currentWindow: true,
    }).then(
      (cur_tabs) => {
        console.log('createOrMoveBKItem 1');
        const current_tab = cur_tabs[0];
        tab_query_async({
          currentWindow: true,
        }).then((tabs) => {
          console.log('createOrMoveBKItem 2');
          let i;
          const radioval = $("input[name='add-mode']:checked").val();
          console.log(`createOrMoveBKItem radioval=${radioval}`);
          switch (radioval) {
            case 's':
              chrome.bookmarks.create({
                parentId: parent_id,
                title: current_tab.title,
                url: current_tab.url,
              });
              /* chrome.tabs.removebtn(current_tab.id) */
              break;
            case 'm-r':
              console.log('createOrMoveBKItem 3');
              for (i = current_tab.index /* + 1*/; i < tabs.length; i++) {
                console.log([i, tabs[i].text, tabs[i].url]);
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
            default:
              chrome.bookmarks.create({
                parentId: parent_id,
                title: current_tab.title,
                url: current_tab.url,
              });
          }
        });
      },
      (value) => {}
    );
  } else {
    const text = $('#oname').val();
    const url = $('#ourl').val();
    const id = $('#oid').val();
    if (text != '' && url != '' && id != '') {
      chrome.bookmarks.get(id, (result) => {
        moveBKItem(id, result[0].parentId, parent_id);
      });
    } else {
      alert("Can't move bookmark");
    }
  }

  addRecentlyItem($('#rinp'), parent_id, parent_text);

  const bucket = await chrome.storage.local.get();
  console.log('createOrMoveBKItem');
  console.log(Object.entries(bucket));
  console.log('createOrMoveBKItem END ====');
}

/* ボタンクリックハンドラの実体 */
/* Tabをclose */
function closeTabs() {
  tab_query_async({
    active: true,
    currentWindow: true,
  }).then(
    (cur_tabs) => {
      const current_tab = cur_tabs[0];
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
        }
      });
    },
    (value) => {}
  );
}

function addSelectWaitingFolders(select) {
  const opts1 = [];
  const values = [];
  let item;
  const key_array = getKeys();

  console.log(key_array);

  key_array.forEach((element, index, array) => {
    console.log(`element=${element}`);
    item = getItemByHier(element);
    console.log(`item=${item}`);
    if (item !== null && item !== undefined) {
      values.push(item.id);
      opts1.push(
        $('<option>', {
        $('<option>', {
          value: item.id,
          text: element,
        })
      );
    }
  });
  opts1.push(
    $('<option>', {
      value: ANOTHER_FOLER,
      text: '#別のフォルダ#',
    })
  );
  select.append(opts1);
  // debugPrint2("addSelectWaitingFolders");
  console.log(values);
  addSelectWaitingItemsX($('#yinp'), values[0]);
}

function dumpBookmarksFromSubTree(parentId, query) {
  chrome.bookmarks.getSubTree(parentId, (bookmarkTreeNodes) => {
    let item = getItem(parentId);
    item.children = dumpTreeNodes(bookmarkTreeNodes, {});
    addSelectWaitingItemsX($('#yinp'), parentId);
    addSelectWaitingItemsX($('#yinp'), parentId);
  });
}

function moveBKItem(id, src_parent_id, dest_parent_id) {
  if (id != '') {
    chrome.bookmarks.move(id, {
      parentId: dest_parent_id,
    });
    dumpBookmarksFromSubTree(src_parent_id, '');
    /* addSelectWaitingItemsX($('#yinp') , src_parent_id) */
  } else {
    alert("Can't move bookmark");
  }
}

/* ===== ----- ==== */
function addRecentlyItem(select, value, text) {
  console.log('## addRecentlyItem');
  /* 現在選択された対象フォルダが過去にも選択されていれば、過去の対象フォルダを直近に移動させる（つまりあらかじめ、過去の記録を削除する） */
  /* 直近で同一対象フォルダが選択されていても、いったん削除する */
  const storageOptions = getStorageOptions();
  console.log(`storageOptions=${storageOptions}`);
  console.log(JSON.stringify(storageOptions));
  const ind = storageOptions.findIndex((element, index, array) => {
    return element.value == value;
  });
  if (ind >= 0) {
    storageOptions.splice(ind, 1);
  }
  storageOptionsUnshift({
    value: value,
    text: text,
  });

  /* selectにアイテムを追加する(いったんslectの内容を消去して、追加したデータを改めてselectに設定する) */
  const opts1 = [];
  storageOptions.forEach((element, index, array) => {
    opts1.push(
      $('<option>', {
        value: element.value,
        text: element.text,
      })
    );
  });
  select.empty();
  select.append(opts1);
  select.val(value);

  console.log('## addRecentlyItem call saveSettings()');
  /* 変更したSettingの内容をローカルに保存する */
  saveSettings();
}

/***** bookmark 関連 下位関数 *****/
function dumpTreeItems(bookmarkTreeNodes, ignore_head) {
  ignore_head =
    ignore_head === null || ignore_head === undefined ? false : ignore_head;

  let ary = [];
  let i;
  for (i = 0; i < bookmarkTreeNodes.length; i++) {
    const element = bookmarkTreeNodes[i];
    if (!ignore_head) {
      if (element.url) {
        ary.push(
          $('<option>', {
            value: element.id,
            text: element.title,
          })
        );
      }
    }
    if (element.children) {
      ary = ary.concat(dumpTreeItems(element.children));
    }
  }
  return ary;
}

/*********************/

/* ====== popup window 下部 ===== */
function makeMenuOnBottomArea() {
  // debugPrint2("makeMenuOnBottomArea 1");
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
  $('#menu').addClass('wrapper');
  $('#menu').append(aryx);

  /* getItems1() itemsは次の構造の配列　[メニュー項目名 , フォルダ名の階層構造]　という settings.jsで定義 */
  /* 全対象フォルダselect作成 */
  makeDistinationMenu(getItems1());
  /* recently ボタンクリック処理の設定 */
  $('#rbtn').click(() => {
    createOrMoveBKItem('#rinp', 'recently');
  });
  /* recently selectの選択肢の更新 */
  let storageOptions = getStorageOptions();

  storageOptions['Options'] = adjustValue(storageOptions['Options']);
  console.log(`Options ${Object.entries(storageOptions['Options'])}`);
  updateSelectRecently(storageOptions['Options'], $('#rinp'));
}

function makeMenuOnBottomAreaAsync() {
  return new Promise((resolve, reject) => {
    // debugPrint2("makeMenuOnBottomAreaAsyc 1");
    makeMenuOnBottomArea();
    // saveSettings();
    // debugPrint2("makeMenuOnBottomAreaAsyc 2");
    /*
	    let keys = getItemHashByHierKeys()
		console.log(keys);
		console.log("======");
*/
    resolve();
  });
}

/* ===== popup window 上部 ===== */
function makeMenuOnUpperArea(title, url) {
  console.log('++++++++++++++++++++++++++++ ==== makeMenuOnUpperArea');
  /* add-mode領域 */
  $('#name').val(title);
  $('#url').val(url);

  /* move-mode領域に対する初期設定 */

  /* 移動対象フォルダ内のアイテム一覧作成 - 要検討 */
  /* $('#zinp')は何も選択されていないので、ここでの処理は期待したとおりにならない */
  /* 表示されたときに、選択状態にしたいならば、別途初期化を行う関数を定義して、呼び出さなければならない */

  /* move-mode領域のフォルダ名選択時の動作 */
  $('#zinp').click(() => {
    /* move-mode領域を選択状態にする */
    setTargetArea('#move-mode');
    /* 対象フォルダに含まれるアイテム一覧作成 */
    addSelectWaitingItemsX($('#yinp'), $('#zinp').val());
  });
  /* move-mode時の移動対象アイテム選択時の動作 */
  /*** ★hrome bookmarks APIにはidが必要。これは隠れフィールドoidに設定しておく***/
  $('#yinp').click(() => {
    selectWaitingItemsBtnHdr($('#yinp').val());
  });

  /* add-mode領域を選択状態にする(デフォルトにする) */
  setTargetArea('#add-mode');

  addSelectWaitingFolders($('#zinp'));

  $('#add-mode').click(() => {
    setTargetArea('#add-mode');
  $('#add-mode').click(() => {
    setTargetArea('#add-mode');
  });
  $('#move-mode').click(() => {
    setTargetArea('#move-mode');
  $('#move-mode').click(() => {
    setTargetArea('#move-mode');
  });

  $('#gotobtn').click(() => {
  $('#gotobtn').click(() => {
    /* 隠しフィールドに設定したtab idは、val()で取得しただけでは文字列になるので、整数値にする */
    const sid = parseInt($('#sid').val(), 10);
    const ourl = $('#ourl').val();
    const sid = parseInt($('#sid').val(), 10);
    const ourl = $('#ourl').val();
    chrome.tabs.update(
      sid,
      {
        url: ourl,
      },
      (tab) => {
        console.log(['sid=', sid, 'ourl=', ourl]);
      }
    );
  });
  $('#importbtn').click(() => {
  $('#importbtn').click(() => {
    if (getUrls !== null && getUrls !== undefined) {
      importUrls(getUrls());
    }
  });
  $('#removeitembtn').click(() => {
    chrome.bookmarks.remove($('#oid').val(), (result) => {
      const parent_id = $('#zinp').val();
      $('#yinp').empty();
      $('#ourl').val('');
      $('#oid').val('');
      dumpBookmarksFromSubTree(parent_id, '');
    });
  });
  $('#bk').change(() => {
    // debugPrint2($("#bk").val());
  });
  $('#todaybtn').click(() => {
    removeSettings();
  });
  $('#removebtn').click(() => {
    removeSettings();
  });
  $('#closebtn').click(() => {
  $('#closebtn').click(() => {
    closeTabs();
  });
  $('#addFolderbtn').click(() => {
    addFolderx();
  });
  $('#addDbtn').click(() => {
    addDayFolderx();
  });
  $('#addFbbtn').click(() => {
    console.log('addFbbtn');
  });
  $('#addFcbtn').click(() => {
    debugPrint2('addFcbtn');
  });

  $('#lsbtn').click(() => {
  $('#lsbtn').click(() => {
    lstree();
  });
  $('#test1btn').click(() => {
    const ary = [];
    const xitems = {};
    getStorageOptions().forEach((element, index, array) => {
      if (!xitems[element.value]) {
        xitems[element.value] = element;
        ary.push(element);
      }
    });
    setStorageOptions(ary);
    // Settings[StorageOptions] = ary;
    setStorageHiers(getItemHashByHierKeys());
    // Settings[StorageHiers] = getItemHashByHierKeys();
    $('#rinp').empty();
    $('#rinp').append(ary);
    $('#rinp').val(ary[0].value);
  });
}

/* move-mode領域の */
function selectWaitingItemsBtnHdr(folder_id) {
  chrome.bookmarks.get(folder_id, (BookmarkTreeNodes) => {
    $('#oname').val(BookmarkTreeNodes[0].title);
    $('#ourl').val(BookmarkTreeNodes[0].url);
    $('#oid').val(BookmarkTreeNodes[0].id);
  });
}

/* ===== bookmarkの情報を取得 ===== */
/* 指定フォルダ以下の対象フォルダの一覧取得(配列として) */
/* この関数は再帰的に呼び出されるが、内部処理は必ず最初はchromeのbookmarksのトップに対
    して呼び出されることを想定している */
/* 一気に全フォルダの階層構造をつくることが目的である */
function dumpTreeNodes(bookmarkTreeNodes, parent_item) {
  //	debugPrint2("dTN 1")
  let ary = [];

  // debugPrint2(bookmarkTreeNodes)
  /* bookmarkTreeNodes - フォルダと項目が混在している */
  bookmarkTreeNodes.forEach((element, index, array) => {
    /* フォルダのみを処理する（項目は無視する） */
    if (!element.url) {
      let item = {
        id: element.id,
        folder: true,
        root: false,
        top: false,
        parentId: element.parentId,
        posindex: element.index,
        url: element.url,
        title: element.title,
        hier: '' /* hier */,
        children: [],
      };
      /* 親フォルダがなければ、ルート階層のフォルダとする */
      if (!item.parentId) {
        item.root = true;
        RootItems.push(item.id);
        item.hier = item.title;
      } else {
        /* 親フォルダがルート階層のフォルダであればトップ階層のフォルダにする */
        if (parent_item.root) {
          item.top = true;
          item.hier = '';
          TopItems.push(item.id);
        } else {
          /* 親フォルダが通常のフォルダであれば、自身の階層名をつくる */
          item.hier = parent_item.hier + '/' + item.title;
        }
      }

      setItem(item.id, item);
      setItemByHier(item.hier, item);
      if (element.children.length > 0) {
        item.children = dumpTreeNodes(element.children, item);
      }
      ary.push(item);
    }
  });
  return ary;
}
function dumpTreeNodesAsync(bookmarkTreeNodes) {
  return new Promise((resolve, reject) => {
    // debugPrint2("Promise dumpTreeNodes 1");
    dumpTreeNodes(bookmarkTreeNodes, {
      root: true,
    });
    const hierKeys = getItemHashByHierKeys();
    setStorageHiers(hierKeys);
    console.log('P1 in loadSettings2 then END');

    resolve({});
  });
}

function dumpTreeNodesAsync_0(bookmarkTreeNodes) {
  return new Promise((resolve, reject) => {
    dumpTreeNodes(bookmarkTreeNodes, {
      root: true,
      s,
    });
    // let storagex = loadSettings2("P1").then((value) => {});
    /*
    let storagex = loadSettings2("P1");
    setSettingsFromLoad2(storagex);
    copyFromLoad2ToSettingsX();
    console.log(
      " ==dumpTreeNodesAsync_0 =========================================="
    );
    printSettings();
    console.log("============================================");
    console.log("P1 in loadSettings2 then END");
    */
    // const keys = getItemHashKeys();
    const hierKeys = getItemHashByHierKeys();
    setStorageHiers(hierKeys);
    let d = new Date();
    let str = `${d.getSeconds()}`;
    //let str = 1000;
    console.log(`==str MISC = ${str}`);
    setStorageMisc(str);

    saveSettings();
    let storagex2 = loadSettings2('P2');
    // setSettingsFromLoad2(storagex2);
    // copyFromLoad2ToSettingsX();
    resolve({});
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
  // console.log("dumpBookmarksAsync 1");
  const bookmarkTreeNodes = chrome.bookmarks.getTree();
  // console.log("dumpBookmarksAsync 3");
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

function dumpBookmarksAsync() {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      resolve(bookmarkTreeNodes);
    });
  });
}

function gotooptions() {
  $('#go-to-options').click(() => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('optionsy.html'));
    }
  });
}

async function start() {
  // await initSettings_all();

  initItems();

  gotooptions();
  dumpBookmarksAsync()
    .then((bookmarkTreeNodes) => {
      dumpTreeNodesAsync(bookmarkTreeNodes);
    })
    .then(
      loadAsync()
        .then(setupPopupWindowAsync)
        .then(makeMenuOnBottomAreaAsync)
        .then(initSettings_all)
    );
}

function startA() {
  initSettings();
  initItems();

  gotooptions();
  loadAsync()
    .then(dumpBookmarksAsync())
    .then((bookmarkTreeNodes) => {
      dumpTreeNodesAsync(bookmarkTreeNodes);
    });
}

function start1() {
  initSettings();
  initItems();

  gotooptions();
  loadAsync()
    .then(dumpBookmarksAsync())
    .then((bookmarkTreeNodes) => {
      dumpTreeNodesAsync(bookmarkTreeNodes);
    })
    .then(setupPopupWindowAsync)
    .then(makeMenuOnBottomAreaAsync);
}
start();
