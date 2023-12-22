import { dumpTreeItemsX } from "./data.js";
import { getItems1, getKeys, getNumOfRows, getMax } from "./settings.js";
import { addFolderx, addDayFolderx, lstree } from "./addfolder.js";
import {
  makeBtnA,
  makeSelectA,
  getCategoryName,
  getSelectId,
  getBtnId,
  getJqueryId,
} from "./util.js";
import {
  getItemByHier,
  setItemByHier,
  getItemHashByHierKeys,
  getItem,
  setItem,
  initItems,
} from "./data.js";

import { debugPrint2, debugPrint } from "./debug.js";

import {
  adjustValue,
  ANOTHER_FOLER,
  initSettings_all,
  setStorageSelected,
  getStorageOptions,
  setStorageHiers,
  setStorageOptions,
  loadSettings_by_api,
  removeSettings,
  addRecentlyItemX,
} from "./global.js";

import { loadAsync, updateSelectRecently } from "./async.js";

/**
 * @fileoverview ファイルの説明、使い方や依存関係に
 * ついての情報。
 */
let Target;
let RootItems = [];
let TopItems = [];

// always waits the document to be loaded when shown
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("popupBtn").addEventListener("click", function () {});
});

/* ===== popup window 下部 下位関数 ==== */
function makeMenuRecentlyAndCategorySelectBtn(category_max, items) {
  //  ary.push(makeMenuXrecently());
  const ary = [makeMenuXrecently()];
  const ary2 = ary.concat(makeMenuXcategory(category_max, items));

  return ary2;
}

function importUrls(urls) {
  const keytop = "/0/0-etc/1";
  const parent_item = getItemByHier(keytop);
  if (parent_item === null) {
    return;
  }
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
    btn_class_name = "button " + name;
    btn_id = name + "btn";
    select_class_name = "box " + i;
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
    first: makeBtnA("recently", "button a", "rbtn"),
    second: makeSelectA("box d", "rinp"),
  };
}

function addSelect(select, keytop) {
  let item, item2, value;
  if (keytop != null) {
    item = getItemByHier(keytop);
    // console.log(`0 addSelect keytop=${keytop} item=${JSON.stringify(item)})`);

    if (item != null) {
      const xary = getSelectOption(item, true);
      // console.log(`addSelect 2-0 addSelect xary=${JSON.stringify(xary)}`);
      let opts1 = xary.map((element) => {
        return $("<option>", {
          value: element.value,
          text: element.text,
        });
      });

      opts1.push(
        $("<option>", {
          value: ANOTHER_FOLER,
          text: "#別のフォルダ#",
        })
      );
      // console.log(`addSelect 2 addSelect opts1=${JSON.stringify(opts1)}`);
      select.empty();
      select.append(opts1);
      if (opts1.length > 0) {
        select.val(xary[0].value);
        // console.log(`addSelect 1 val  ${JSON.stringify(opts1[0])})`);
        // console.log(`addSelect 2 val  ${Object.entries(opts1[0])})`);
      } else {
        //		do nothing
        // console.log("addSelect dont ");
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
  // console.log(`getSelectOption E ary=${JSON.stringify(ary)}`);
  let ary10 = ary.flat();
  // console.log(`getSelectOption F ary10=${JSON.stringify(ary10)}`);
  return ary10;
}

/* ===== popup window 上部 下位関数 ===== */
function setTargetArea(val) {
  if (Target != val) {
    Target = val;
    if (Target == "#add-mode") {
      $("#move-mode").attr({
        class: "not-selected",
      });
      $("#add-mode").attr({
        class: "selected",
      });
    } else {
      $("#add-mode").attr({
        class: "not-selected",
      });
      $("#move-mode").attr({
        class: "selected",
      });
    }
  }
}
function addSelectWaitingItemsX(select, item_id, target) {
  const item = getItem(item_id);
  /* 
  console.log(
    `addSelectWaitingItemsX 1 item_id=${item_id} target=${target} item=${JSON.stringify(
      item
    )}`
  );
  */
  if (item == null) {
    return false;
  }
  // console.log(`addSelectWaitingItemsX item=${JSON.stringify(item)}`);
  // debugPrint2(["folder_id=", folder_id]);

  chrome.bookmarks.getSubTree(item.id, (bookmarkTreeNodes) => {
    // select.empty();
    // const [zary, head_id] = dumpTreeItems(bookmarkTreeNodes, false);
    const zary = dumpTreeItems(bookmarkTreeNodes, target, false);
    // console.log(`addSelectWaitingItemsX zary=${JSON.stringify(zary)}`);
    clear_in_move_mode_area();

    select.append(zary);
    select.prop("selectedIndex", 0);
    let item_id = select.val();
    selectWaitingItemsBtnHdr(item_id);
    // console.log(`addSelectWaitingItemsX 3 item.id=${item.id}`);
  });

  return true;
}

/* 非同期タブ問い合わせ */
async function tab_query_async(query) {
  const tabs = await chrome.tabs.query(query);
  return tabs;
}

/* ボタンクリックハンドラの実体 */
/* 対象フォルダにbookmarkアイテムを作成または移動 */
async function createOrMoveBKItem(select_jquery_id, keytop) {
  const parent_id = $(select_jquery_id).val();
  const selected_jquery_id = select_jquery_id + " option:selected";
  const selected = $(selected_jquery_id);
  const parent_text = selected.text();
  // let id, text;

  setStorageSelected(keytop, selected.val());
  if (Target == "#add-mode") {
    tab_query_async({
      active: true,
      currentWindow: true,
    }).then(
      (cur_tabs) => {
        // ("createOrMoveBKItem 1");
        const current_tab = cur_tabs[0];
        tab_query_async({
          currentWindow: true,
        }).then((tabs) => {
          // console.log("createOrMoveBKItem 2");
          let i;
          const radioval = $("input[name='add-mode']:checked").val();
          // console.log(`createOrMoveBKItem radioval=${radioval}`);
          switch (radioval) {
            case "s":
              chrome.bookmarks.create({
                parentId: parent_id,
                title: current_tab.title,
                url: current_tab.url,
              });
              /* chrome.tabs.removebtn(current_tab.id) */
              break;
            case "m-r":
              // console.log("createOrMoveBKItem 3");
              for (i = current_tab.index /* + 1*/; i < tabs.length; i++) {
                // console.log([i, tabs[i].text, tabs[i].url]);
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
            case "m-l":
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
            case "x":
              const id = $("#oid").val();
              if (id != "") {
                console.log(`id=${id}`);
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
    const text = $("#oname").val();
    const url = $("#ourl").val();
    const id = $("#oid").val();
    if (text != "" && url != "" && id != "") {
      chrome.bookmarks.get(id, (result) => {
        moveBKItem(id, result[0].parentId, parent_id);
      });
    } else {
      alert("Can't move bookmark");
    }
  }
  addRecentlyItemX($("#rinp"), parent_id, parent_text);
  // const bucket = await chrome.storage.local.get();
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
          case "s":
            /* chrome.tabs.remove(current_tab.id) */
            break;
          case "m-r":
            /* 引数はidなので、正順に呼び出しても構わないと思われる */
            for (i = tabs.length - 1; i > current_tab.index; i--) {
              chrome.tabs.remove(tabs[i].id);
            }
            break;
          case "m-l":
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
        previousValue[0].push($("<option>", obj));
        previousValue[1].push(obj);
      }
      return previousValue;
    },
    [[], []]
  ); // => 6

  let opts1 = array[0];
  let objs = array[1];

  opts1.push(
    $("<option>", {
      value: ANOTHER_FOLER,
      text: "#別のフォルダ#",
    })
  );
  if (opts1.length > 1) {
    select.empty();
    select.append(opts1);
    select.prop("selectedIndex", 0);
    // console.log(`addSelectWaitingFolders A select.val=${objs[0].value}`);
    addSelectWaitingItemsX(subselect, select.val(), "URL");
  }
}

function dumpBookmarksFromSubTree(parentId, query) {
  chrome.bookmarks.getSubTree(parentId, (bookmarkTreeNodes) => {
    let item = getItem(parentId);
    item.children = dumpTreeNodes(bookmarkTreeNodes, {});
    console.log(`dumpBookmarksFromSubTree B parentId=${parentId}}`);
    addSelectWaitingItemsX($("#yinp"), parentId, "URL");
  });
}

function moveBKItem(id, src_parent_id, dest_parent_id) {
  if (id != "") {
    chrome.bookmarks.move(id, {
      parentId: dest_parent_id,
    });
    console.log(
      `moveBKItem A src_parent_id=${src_parent_id} dest_parent_id=${dest_parent_id}`
    );
    /* dumpBookmarksFromSubTree(src_parent_id, ""); */
    addSelectWaitingItemsX($("#yinp"), src_parent_id, "URL");
  } else {
    alert("Can't move bookmark");
  }
}

/* ===== ----- ==== */
/***** bookmark 関連 下位関数 *****/
function determine_kind(item) {
  let kind = "folder";
  if (item.url) {
    kind = "url";
  }
  return kind;
}
function is_target(element, target) {
  let ret = false;
  let kind = determine_kind(element);
  switch (target) {
    case "URL":
      if (kind == "url") {
        ret = true;
      }
      break;
    case "FOLDER":
      if (kind == "folder") {
        ret = true;
      }
      break;
    default:
      break;
  }
  return ret;
}

function dumpTreeItems(bookmarkTreeNodes, target = "FOLDER", ignore_head) {
  let ary = [];
  for (let i = 0; i < bookmarkTreeNodes.length; i++) {
    const element = bookmarkTreeNodes[i];
    if (!ignore_head) {
      if (is_target(element, target)) {
        // console.log(`A dumpTreeItems id=${element.id} title=${element.title}`);
        ary.push(
          $("<option>", {
            value: element.id,
            text: element.title,
          })
        );
        /*
        console.log(
          `X element.id=${element.id} element.title=${element.title}`
        );
        */
      }
    }
    if (element.children) {
      let ary2 = dumpTreeItems(element.children, target, false);
      /*
      console.log(
        `C dumpTreeItems children=${element.children} head_id2=${head_id2}`
      );
      */
      ary = [...ary, ...ary2];
      // ary = ary.concat(dumpTreeItems(element.children, false));
    }
  }
  // console.log(`D dumpTreeItems ary=${ary} ary_id=${JSON.stringify(ary_id)}`);
  return ary;
}

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
  let aryx = new Array(els.length * 2);

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
    element.first.addClass("g-" + b_r + "-" + b_c);
    element.second.addClass("g-" + s_r + "-" + s_c);
    aryx.push(element.first);
    aryx.push(element.second);
  });
  $("#menu").addClass("wrapper");
  $("#menu").append(aryx);

  /* getItems1() itemsは次の構造の配列　[メニュー項目名 , フォルダ名の階層構造]　という settings.jsで定義 */
  /* 全対象フォルダselect作成 */
  makeDistinationMenu(getItems1());
  /* recently ボタンクリック処理の設定 */
  $("#rbtn").click(() => {
    createOrMoveBKItem("#rinp", "recently");
  });

  /* recently selectの選択肢の更新 */
  let storageOptions = getStorageOptions();

  // storageOptions["Options"] = adjustValue(storageOptions["Options"]);
  let ary = adjustValue(storageOptions);
  let obj;
  // console.log(`***** ================== makeMenuOnBottomArea Options ${Object.entries(storageOptions["Options"])}`);
  setStorageOptions(ary);
  // Settings[StorageOptions] = ary;
  setStorageHiers(getItemHashByHierKeys());
  // Settings[StorageHiers] = getItemHashByHierKeys();
  $("#rinp").empty();
  $("#rinp").append(ary);
  let last_index = ary.length - 1;
  if (last_index >= 0) {
    $("#rinp").val(ary[last_index].value);
    // updateSelectRecently(storageOptions["Options"], $("#rinp"));
    obj = ary[last_index];
  }
  if (ary.length > 0) {
    obj = ary[0];
    updateSelectRecently(ary, $("#rinp"));
  }
}

async function makeMenuOnBottomAreaAsync() {
  makeMenuOnBottomArea();
}

function clear_in_move_mode_area() {
  $("#oname").val("");
  $("#ourl").val("");
  $("#oid").val("");
}

/* ===== popup window 上部 ===== */
function makeMenuOnUpperArea(title, url) {
  // console.log("++++++++++++++++++++++++++++ ==== makeMenuOnUpperArea");
  /* add-mode領域 */
  $("#name").val(title);
  $("#url").val(url);

  /* move-mode領域に対する初期設定 */

  /* 移動対象フォルダ内のアイテム一覧作成 - 要検討 */
  /* $('#zinp')は何も選択されていないので、ここでの処理は期待したとおりにならない */
  /* 表示されたときに、選択状態にしたいならば、別途初期化を行う関数を定義して、呼び出さなければならない */

  /* move-mode領域のフォルダ名選択時の動作 */
  $("#yinp").click(() => {
    /* move-mode領域を選択状態にする */
    setTargetArea("#move-mode");
    console.log(`yinp click`);
    let value = $("#yinp").val();
    selectWaitingItemsBtnHdr(value);
  });
  /* move-mode時の移動対象アイテム選択時の動作 */
  /*** ★chrome bookmarks APIにはidが必要。これは隠れフィールドoidに設定しておく***/
  $("#zinp").click(() => {
    /* move-mode領域を選択状態にする */
    setTargetArea("#move-mode");
    console.log("#zinp click");
    let value = $("#zinp").val();
    console.log(`#zinp click value=${JSON.stringify(value)}`);
    if (value != null) {
      /* 対象フォルダに含まれるアイテム一覧作成 */
      addSelectWaitingItemsX($("#zinp"), $("#yinp").val(), "FOLDER");
    }
  });

  /* add-mode領域を選択状態にする(デフォルトにする) */
  setTargetArea("#add-mode");

  addSelectWaitingFolders($("#zinp"), $("#yinp"));

  $("#add-mode").click(() => {
    setTargetArea("#add-mode");
  });
  $("#move-mode").click(() => {
    setTargetArea("#move-mode");
  });

  $("#gotobtn").click(() => {
    /* 隠しフィールドに設定したtab idは、val()で取得しただけでは文字列になるので、整数値にする */
    const sid = parseInt($("#sid").val(), 10);
    const ourl = $("#ourl").val();
    chrome.tabs.update(
      sid,
      {
        url: ourl,
      },
      (tab) => {
        console.log(["sid=", sid, "ourl=", ourl]);
      }
    );
  });
  $("#importbtn").click(() => {
    if (getUrls !== null && getUrls !== undefined) {
      importUrls(getUrls());
      selectWaitingItemsBtnHdr(value);
    }
  });
  $("#removeitembtn").click(() => {
    let valx = $("#oid").val();
    chrome.bookmarks.remove(valx, () => {
      const parent_id = $("#zinp").val();
      // const v = $("#oid").val();
      // $("#yinp option:selected").remove();
      // $(`yinp option[]"`).remove();
      clear_in_move_mode_area();
      // $("#yinp option:selected");
      $("#yinp").empty();
      addSelectWaitingItemsX($("#yinp"), parent_id, "URL");
    });
  });
  $("#bk").change(() => {
    // debugPrint2($("#bk").val());
  });
  $("#todaybtn").click(() => {
    removeSettings();
  });
  $("#removebtn").click(() => {
    removeSettings();
  });
  $("#closebtn").click(() => {
    closeTabs();
  });
  $("#addFolderbtn").click(() => {
    addFolderx();
  });
  $("#addDbtn").click(() => {
    addDayFolderx();
  });
  $("#addFbbtn").click(() => {
    console.log("addFbbtn");
  });
  $("#addFcbtn").click(() => {
    console.log("addFcbtn");
  });

  $("#lsbtn").click(() => {
    lstree();
  });
  $("#test1btn").click(() => {
    // TODO: do nothing
  });
}

/* move-mode領域の */
async function parseURLAsync(url) {
  let parser = new URL(url);

  return parser;
}
function selectWaitingItemsBtnHdr(option_value) {
  // console.log(`selectWaitingItemsBtnHdr option_value=${option_value}`);
  if (option_value != null || option_value != undefined) {
    chrome.bookmarks.get(option_value, (BookmarkTreeNodes) => {
      let len = BookmarkTreeNodes.length;
      if (len > 0) {
        let bt = BookmarkTreeNodes[0];
        let title = bt.title;
        let url = bt.url;
        // let id = JSON.stringify(bt);
        let id = bt.id;
        //clear_in_move_mode_area();

        $("#oname").val(`${len} ${title}`);
        $("#ourl").val(`${url}`);
        $("#oid").val(`${id}`);
        $("#ox").val(`abc`);
        url = null;
        let ret = parseURLAsync(url)
          .then((parser) => {
            let href = parser.href;
            let host = parser.host;
            let hostname = parser.hostname;
            let pathname = parser.pathname;
            let protocol = parser.protocol;
            // $('#ox') = href;
            $("#ox").val(hostname);
            console.log(`href=${href}`);
            return hostname;
          })
          .catch((error) => {
            // return e;
            //alert(error.message);
            // $("#ox").val(error.message);
          });
        /*
          let search = parser.search;
          let hash = parser.hash;
          let origin = parser.origin;
          let port = parser.port;
          let username = parser.username;
          let password = parser.password;
          let searchParams = parser.searchParams;
          let searchParams_keys = searchParams.keys();
          let searchParams_values = searchParams.values();
          let searchParams_entries = searchParams.entries();
          let searchParams_toString = searchParams.toString();
          let searchParams_append = searchParams.append();
          let searchParams_delete = searchParams.delete();
          let searchParams_get = searchParams.get();
          let searchParams_getAll = searchParams.getAll();
          let searchParams_has = searchParams.has();
          let searchParams_set = searchParams.set();
          let searchParams_sort = searchParams.sort();
          let searchParams_forEach = searchParams.forEach();
          let searchParams_toJSON = searchParams.toJSON();
          let searchParams_toString = searchParams.toString();
          let searchParams_toString = searchParams.toString();
          */
        /*
        console.log(
          `############  selectWaitingItemsBtnHdr folder_id=${folder_id} || #oid=${$(
            "#oid"
          ).val()}|| ${BookmarkTreeNodes.length}`
        );
        */
      }
    });
  }
}

/* ===== bookmarkの情報を取得 ===== */
/* 指定フォルダ以下の対象フォルダの一覧取得(配列として) */
/* この関数は再帰的に呼び出されるが、内部処理は必ず最初はchromeのbookmarksのトップに対
    して呼び出されることを想定している */
/* 一気に全フォルダの階層構造をつくることが目的である */
function dumpTreeNodes(bookmarkTreeNodes, parent_item) {
  // console.log(`dumpTreeNodes parent_item=${parent_item.id}`);
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
        hier: "" /* hier */,
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
          item.hier = "";
          TopItems.push(item.id);
        } else {
          /* 親フォルダが通常のフォルダであれば、自身の階層名をつくる */
          item.hier = parent_item.hier + "/" + item.title;
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
async function dumpTreeNodesAsync(bookmarkTreeNodes) {
  /* console.log(
    `### dumpTreeNodesAsync bookmarkTreeNodes.length= ${bookmarkTreeNodes.length}`
  );
  */
  dumpTreeNodes(bookmarkTreeNodes, {
    root: true,
  });
  const hierKeys = getItemHashByHierKeys();
  // console.log(`hierKeys=${hierKeys}`);
  setStorageHiers(hierKeys);
  return bookmarkTreeNodes;
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
  $("#sid").val(current.id);

  makeMenuOnUpperArea(title, url);
}

async function dumpBookmarksAsync() {
  // console.log("dumpBookmarksAsync 1");
  const bookmarkTreeNodes = await chrome.bookmarks.getTree();
  // console.log("dumpBookmarksAsync 3");
  return bookmarkTreeNodes;
}

document.querySelector("#go-to-options").addEventListener("click", () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("options.html"));
  }
});

async function start() {
  // await initSettings_all();
  // ("start 1");

  initItems();
  // console.log("start 2");

  // gotooptions();
  dumpBookmarksAsync()
    .then((bookmarkTreeNodes) => {
      // console.log("start dumpBookmarksAsync 01");
      dumpTreeNodesAsync(bookmarkTreeNodes);
    })
    .then(
      loadAsync()
        .then(setupPopupWindowAsync)
        .then(makeMenuOnBottomAreaAsync)
        .then(loadSettings_by_api("P2"))
        .then(initSettings_all)
    );
}

start();
