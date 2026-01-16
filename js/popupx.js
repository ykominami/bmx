import {getItems1, getKeys, getMax, getNumOfRows} from '../config/settings2.js';
import {ItemGroup} from './itemgroup.js';
import {Movergroup} from './movegroup.js';
import { AddFolder } from './addfolder.js';
import { Util } from './util.js';
import { data } from './data.js';

import { Globalx } from './globalx.js';

/**
 * @fileoverview ファイルの説明、使い方や依存関係に
 * ついての情報。
 */

/**
 * ポップアップウィンドウを管理するクラス
 * @class PopupManager
 */
class PopupManager {
  /**
   * PopupManagerクラスのコンストラクタ
   */
  constructor() {
    this.Target = null;
    this.addFolder = new AddFolder();
    this.itemGroup = new ItemGroup();
    this.reg = new RegExp('/Y/DashBoard', '');
    this.dumpTreeNodes_func = this.createDumpTreeNodes();
    this.init();
  }

  /**
   * 初期化処理
   */
  init() {
    document.addEventListener('DOMContentLoaded', () => this.onDOMContentLoaded());
    this.start();
  }

  /**
   * DOMContentLoadedイベントのハンドラ
   */
  onDOMContentLoaded() {
    document.getElementById('popupBtn').addEventListener('click', () => {
      // Original logic inside DOMContentLoaded
    });
  }

  /**
   * 最近使用したメニューとカテゴリ選択ボタンを作成する
   * @param {number} category_max - カテゴリの最大数
   * @param {Array} items - アイテム配列
   * @returns {Array} メニュー要素の配列
   */
  makeMenuRecentlyAndCategorySelectBtn(category_max, items) {
    const ary = [this.makeMenuXrecently()];
    return ary.concat(this.makeMenuXcategory(category_max, items));
  }

  /**
   * 対象フォルダ選択メニューを作成する
   * @param {Array} items - アイテム配列
   */
  makeDistinationMenu(items) {
    let i, name;
    for (i = 0; i < items.length; i++) {
      name = Util.getCategoryName(i);
      this.makeBtnHdrAndSelect(
        Util.getJqueryId(Util.getBtnId(name)),
        Util.getJqueryId(Util.getSelectId(name)),
        items[i][1]
      );
    }
  }

  /**
   * カテゴリメニューを作成する
   * @param {number} max - 最大数
   * @param {Array} items - アイテム配列
   * @returns {Array} メニュー要素の配列
   */
  makeMenuXcategory(max, items) {
    const ary = [];
    let i, name, text;
    let btn_id, btn_class_name, select_class_name, select_id;
    let lormax = items.length;
    if (max < lormax) {
      lormax = max;
    }
    for (i = 0; i < lormax; i++) {
      text = items[i][0];
      name = Util.getCategoryName(i);
      btn_class_name = 'button ' + name;
      btn_id = name + 'btn';
      select_class_name = 'box ' + i;
      select_id = Util.getSelectId(name);
      ary.push({
        first: Util.makeBtnA(text, btn_class_name, btn_id),
        second: Util.makeSelectA(select_class_name, select_id),
      });
    }
    return ary;
  }

  /**
   * ボタンとセレクト要素を設定する
   * @param {string} btn_jquery_id - ボタンのjQueryセレクタID
   * @param {string} select_jquery_id - セレクトのjQueryセレクタID
   * @param {string} keytop - キートップ
   */
  makeBtnHdrAndSelect(btn_jquery_id, select_jquery_id, keytop) {
    this.addSelect($(select_jquery_id), keytop);
    $(btn_jquery_id).click(() => {
      this.createOrMoveBKItem(select_jquery_id, keytop).then(()=>{});
    });
  }

  /**
   * 最近使用したメニューを作成する
   * @returns {Object} メニュー要素オブジェクト
   */
  makeMenuXrecently() {
    return {
      first: Util.makeBtnA('recently', 'button a', 'rbtn'),
      second: Util.makeSelectA('box d', 'rinp'),
    };
  }

  /**
   * セレクト要素にオプションを追加する
   * @param {jQuery} select - セレクト要素のjQueryオブジェクト
   * @param {string} keytop - キートップ
   */
  addSelect(select, keytop) {
    let item;
    if (keytop != null) {
      item = data.getItemByHier(keytop);
      if (item != null) {
        this.getSelectOption(item, true).then((xary) => {
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
                value: Globalx.ANOTHER_FOLER,
                text: '#別のフォルダ#',
              })
          );
          select.empty();
          select.append(opts1);
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

  /**
   * セレクトオプションを取得する
   * @param {Object} item - アイテムオブジェクト
   * @param {boolean} ignore_head - ヘッドを無視するか
   * @returns {Promise<Array>} オプション配列
   */
  async getSelectOption(item, ignore_head) {
    let obj;
    let buffer = [];
    if (!ignore_head) {
      buffer.push({value: item.id, text: item.title});
    }
    // Manifest V3: chrome.bookmarks.getSubTree() returns a Promise
    const bookmarkTreeNodes = await chrome.bookmarks.getSubTree(item.id);
    let count = 100;
    obj = this.dumpTreeItems(bookmarkTreeNodes, count, item.id)
    if(obj.buffer.length > 0){
      buffer.push(...obj.buffer)
    }
    return buffer;
  }

  /**
   * ターゲットエリアを設定する
   * @param {string} val - ターゲットエリアの値（'#add-mode' または '#move-mode'）
   */
  setTargetArea(val) {
    if (this.Target !== val) {
      this.Target = val;
      if (this.Target === '#add-mode') {
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

  /**
   * 待機中のアイテムをセレクトに追加する
   * @param {jQuery} select - セレクト要素のjQueryオブジェクト
   * @param {string} folder_id - フォルダID
   * @returns {Promise<void>}
   */
  async addSelectWaitingItemsX(select, folder_id) {
    const item = data.getItem(folder_id);
    if (item == null) {
      return;
    }

    // Manifest V3: chrome.bookmarks.getSubTree() returns a Promise
    const bookmarkTreeNodes = await chrome.bookmarks.getSubTree(item.id);
    let count = 1;
    let obj = this.dumpTreeItems(bookmarkTreeNodes, count, item.id)
    let buffer2 = obj.buffer.map((ele) => $('<option>', {value: ele.value, text: ele.text}));
    select.append(buffer2);
    select.prop('selectedIndex', 0);
    folder_id = select.val();
    if (folder_id) {
      this.selectWaitingItemsBtnHdr(folder_id);
    }
  }

  /**
   * タブを非同期で問い合わせる
   * @param {Object} query - クエリオブジェクト
   * @param {string} parent_id - 親ID
   * @param {string} parent_text - 親テキスト
   * @returns {Promise<Array>} [タブ配列, 親ID, 親テキスト]
   */
  async tab_query_async(query, parent_id, parent_text) {
    // Manifest V3: chrome.tabs.query() returns a Promise
    const ret_tabs = await chrome.tabs.query(query);
    return [ret_tabs, parent_id, parent_text];
  }

  /**
   * 追加モードでタブを処理する
   * @param {Array} [tabs, parent_id, parent_text] - タブ配列、親ID、親テキスト
   * @returns {Promise<void>}
   */
  async add_mode_x([tabs, parent_id, parent_text]) {
    let i;
    let active_tab = tabs.find((tab) => tab.active)
    let move_need = true;
    const radioval = $("input[name='add-mode']:checked").val();
    switch (radioval) {
      case 's':
        // Manifest V3: chrome.bookmarks.create() returns a Promise
        await chrome.bookmarks.create({
          parentId: parent_id,
          title: active_tab.title,
          url: active_tab.url,
        });
        break;
      case 'm-r':
        for (i = active_tab.index + 1; i < tabs.length; i++) {
          // Manifest V3: chrome.bookmarks.create() returns a Promise
          await chrome.bookmarks.create({
            parentId: parent_id,
            title: tabs[i].title,
            url: tabs[i].url,
          });
        }
        for (i = tabs.length - 1; i > active_tab.index; i--) {
          // Manifest V3: chrome.tabs.remove() returns a Promise
          await chrome.tabs.remove(tabs[i].id);
        }
        break;
      case 'm-l':
        for (i = 0; i /*<*/ < active_tab.index; i++) {
          // Manifest V3: chrome.bookmarks.create() returns a Promise
          await chrome.bookmarks.create({
            parentId: parent_id,
            title: tabs[i].title,
            url: tabs[i].url,
          });
        }
        for (i = active_tab.index - 1; i >= 0; i--) {
          chrome.bookmarks.remove(tabs[i].id);
        }
        break;
      case 'x':
        move_need = false;
        break;
      default:
        // Manifest V3: chrome.bookmarks.create() returns a Promise
        await chrome.bookmarks.create({
          parentId: parent_id,
          title: active_tab.title,
          url: active_tab.url,
        });
        break;
    }
    if (move_need) {
      Globalx.addRecentlyItem($('#rinp'), parent_id, parent_text);
    }
  }

  /**
   * ブックマークアイテムを作成または移動する
   * @param {string} select_jquery_id - セレクトのjQueryセレクタID
   * @param {string} keytop - キートップ
   * @returns {Promise<void>}
   */
  async createOrMoveBKItem(select_jquery_id, keytop) {
    let query;
    const radioval = $("input[name='add-mode']:checked").val();
    if( radioval === 'm-r' || radioval === 'm-l'){
      query = {
        currentWindow: true,
      }
    }
    else{
      query = {
        active: true,
        currentWindow: true,
      }
    }
    const parent_id = $(select_jquery_id).val();
    const selected_jquery_id = select_jquery_id + ' option:selected';
    const selected = $(selected_jquery_id);
    const parent_text = selected.text();

    Globalx.addStorageSelected(keytop, selected.val());
    if (this.Target === '#add-mode') {
      this.tab_query_async(
          query,
          parent_id,
          parent_text
      ).then((result) => this.add_mode_x(result));
    } else {
      const text = $('#oname').val();
      const url = $('#ourl').val();
      const id = $('#oid').val();
      if (text !== '' && url !== '' && id !== '') {
        // Manifest V3: chrome.bookmarks.get() returns a Promise
        const result = await chrome.bookmarks.get(id);
        let ret = await this.moveBKItem(id, result[0].parentId, parent_id);
        this.addSelectWaitingItemsX($('#yinp'), $('#zinp').val());
      } else {
        alert("Can't move bookmark");
      }
    }
    Globalx.addRecentlyItem($('#rinp'), parent_id, parent_text);
  }

  /**
   * タブを閉じる（モードに応じて）
   * @returns {Promise<void>}
   */
  async closeTabs() {
      const [tabs] = await this.tab_query_async({
        currentWindow: true,
      }, null, null);
      let i;
      const active_tab = tabs.find((tab) => tab.active);
      if (!active_tab) {
        return;
      }
      const radioval = $("input[name='add-mode']:checked").val();
      switch (radioval) {
        case 's':
          break;
        case 'm-r':
          for (i = tabs.length - 1; i > active_tab.index; i--) {
            // Manifest V3: chrome.tabs.remove() returns a Promise
            await chrome.tabs.remove(tabs[i].id);
          }
          break;
        case 'm-l':
          for (i = active_tab.index - 1; i > -1; i--) {
            // Manifest V3: chrome.tabs.remove() returns a Promise
            await chrome.tabs.remove(tabs[i].id);
          }
          break;
        default:
          break;
      }
  }

  /**
   * 待機中のフォルダをセレクトに追加する
   * @param {jQuery} select - セレクト要素のjQueryオブジェクト
   * @param {jQuery} subselect - サブセレクト要素のjQueryオブジェクト
   */
  addSelectWaitingFolders(select, subselect) {
    const key_array = getKeys();

    const array = key_array.reduce(
      function (previousValue, currentValue) {
        const item = data.getItemByHier(currentValue);
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
          value: Globalx.ANOTHER_FOLER,
          text: '#別のフォルダ#',
        }
    );
    if (opts1.length > 1) {
      let opts2 = opts1.map((obj) => {
        if (obj && typeof obj.jquery !== 'undefined') {
          // obj is a jQuery element, extract value and text
          return $('<option>', {
            value: obj.attr('value') || obj.val(),
            text: obj.text(),
          });
        } else {
          // obj is a plain object
          return $('<option>', {
            value: obj.value,
            text: obj.text,
          });
        }
      });
      select.empty();
      select.append(opts2);
      select.prop('selectedIndex', 0);
      this.addSelectWaitingItemsX(subselect, select.val());
    }
  }

  /**
   * ブックマークアイテムを移動する
   * @param {string} id - アイテムID
   * @param {string} src_parent_id - 移動元の親ID
   * @param {string} dest_parent_id - 移動先の親ID
   * @returns {Promise<boolean>} 移動成功時はtrue
   */
  async moveBKItem(id, src_parent_id, dest_parent_id) {
    let ret = false;
    if (id !== '') {
      // Manifest V3: chrome.bookmarks.move() returns a Promise
      await chrome.bookmarks.move(id, {
        parentId: dest_parent_id,
      });
      await this.addSelectWaitingItemsX($('#yinp'), src_parent_id);
      ret = true;
    } else {
      alert("Can't move bookmark");
    }
    return ret;
  }

  /**
   * ツリーノードのサブ要素をダンプする
   * @param {Object} element - 要素オブジェクト
   * @param {number} count - カウント
   * @param {string} parent_id - 親ID
   * @param {boolean} [head_ignore=false] - ヘッドを無視するか
   * @returns {Object} {buffer: Array, count: number}
   */
  dumpTreeNodesSub(element, count, parent_id, head_ignore = false) {
    let ret = {buffer: [], count: count}

    if (element.url) {
      return ret;
    }
    if(!head_ignore){
      let objx = {value:element.id, text: element.title};
      ret.buffer.push(objx);
    }
    if (element.children) {
      element.children.map((child) => {
        let obj = this.dumpTreeNodesSub(child, count + 1, parent_id, false)
          ret.buffer.push(...obj.buffer)
      })
    }
    return ret
  }

  /**
   * ブックマークツリーアイテムをダンプする
   * @param {Array} bookmarkTreeNodes - ブックマークツリーノードの配列
   * @param {number} count - カウント
   * @param {string} parent_id - 親ID
   * @returns {Object} {buffer: Array, count: number}
   */
  dumpTreeItems(bookmarkTreeNodes, count, parent_id) {
    let i;
    let obj;
    let ret = {buffer: [], count: count}

    for (i = 0; i < bookmarkTreeNodes.length; i++) {
      let element = bookmarkTreeNodes[i]
      let head_ignore = true
      obj = this.dumpTreeNodesSub(element, parent_id, count, head_ignore);
      if( obj.buffer.length > 0){
        ret.buffer.push(...obj.buffer)
      }
    }
    return ret
  }

  /**
   * ポップアップウィンドウの下部エリアにメニューを作成する
   */
  makeMenuOnBottomArea() {
    const w = getNumOfRows();
    const count = getMax();
    let ind;
    let next_start;
    let b_c, b_r, s_c, s_r;
    let items = getItems1();
    const els = this.makeMenuRecentlyAndCategorySelectBtn(count, items);
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

    this.makeDistinationMenu(getItems1());
    $('#rbtn').click(() => {
      this.createOrMoveBKItem('#rinp', 'recently').then(() => {
      });
    });

    let storageOptions = Globalx.getStorageOptions();

    let ary = Globalx.adjustValue(storageOptions);
    Globalx.setStorageOptions(ary);
    Globalx.setStorageHiers(data.getKeysOfItemByHier());
    let rinp = $('#rinp')
    if (ary.length > 0) {
      Util.updateSelectRecently(ary, rinp);
    }
  }

  /**
   * ポップアップウィンドウの下部エリアにメニューを非同期で作成する
   * @returns {Promise<string>}
   */
  async makeMenuOnBottomAreaAsync() {
    this.makeMenuOnBottomArea();
    return 'makeMunuOnBotttomAreaAsync';
  }

  /**
   * 移動モードエリアをクリアする
   */
  clear_in_move_mode_area() {
    $('#oname').val('');
    $('#ourl').val('');
    $('#oid').val('');
  }

  /**
   * 待機中のアイテムボタンヘッダーを選択する
   * @param {string} option_value - オプション値
   * @returns {Promise<void>}
   */
  async selectWaitingItemsBtnHdr(option_value) {
    if (option_value != null) {
      // Manifest V3: chrome.bookmarks.get() returns a Promise
      const BookmarkTreeNodes = await chrome.bookmarks.get(option_value);
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
        Util.parseURLAsync(url)
          .then((parser) => {
            let href = parser.href;
            let hostname = parser.hostname;
            $('#ox').val(hostname);
            return hostname;
          })
          .catch((error) => {
            console.log(`selectWaitingItemsBtnHdr error=${error}`)
          });
      }
    }
  }

  /**
   * ポップアップウィンドウの上部エリアにメニューを作成する
   * @param {string} title - タイトル
   * @param {string} url - URL
   */
  makeMenuOnUpperArea(title, url) {
    $('#name').val(title);
    $('#url').val(url);

    let yinp = $('#yinp');
    yinp.click(() => {
      this.setTargetArea('#move-mode');
      let value = yinp.val();
      this.selectWaitingItemsBtnHdr(value);
    });
    let zinp = $('#zinp')
    zinp.click(() => {
      this.setTargetArea('#add-mode');
      let value = zinp.val();
      if (value != null) {
        this.addSelectWaitingItemsX(yinp, value);
      }
    });

    this.setTargetArea('#add-mode');

    this.addSelectWaitingFolders(zinp, yinp);

    $('#add-mode').click(() => {
      this.setTargetArea('#add-mode');
    });
    $('#move-mode').click(() => {
      this.setTargetArea('#move-mode');
    });

    $('#gotobtn').click(async () => {
      const sid = parseInt($('#sid').val(), 10);
      const ourl = $('#ourl').val();
      // Manifest V3: chrome.tabs.update() returns a Promise
      await chrome.tabs.update(sid, {
        url: ourl,
      });
      // console.log(["sid=", sid, "ourl=", ourl]);
    });
    $('#importbtn').click(() => {
      console.log('not implemented a handler of importbtn')
    });
    $('#removeitembtn').click(async () => {
      let valx = $('#oid').val();
      // Manifest V3: chrome.bookmarks.remove() returns a Promise
      await chrome.bookmarks.remove(valx);
      const parent_id = $('#zinp').val();
      this.clear_in_move_mode_area();
      let yinp = $('#yinp');
      yinp.empty();
      await this.addSelectWaitingItemsX(yinp, parent_id);
    });
    $('#removebtn').click(() => {
      Globalx.removeSettings();
    });
    $('#closebtn').click(() => {
      this.closeTabs();
    });
    $('#addFolderbtn').click(() => {
      console.log('addFolderbtn');
      this.addFolder.addFolderx();
    });
    $('#addDbtn').click(() => {
      console.log('addDbtn');
      this.addFolder.addDayFolderx();
    });
    $('#moveBMX').click(() => {
      this.moveBMX();
    });
    $('#moveBMX2').click(() => {
      this.moveBMX2();
    });
    $('#addFcbtn').click(() => {
	  this.addFc();
      console.log('addFcbtn');
    });

    $('#lsbtn').click(() => {
      this.addFolder.lstree();
    });
    $('#test1btn').click(() => {
      // TODO: do nothing
    });
  }

  /**
   * ポップアップウィンドウを非同期でセットアップする
   * @returns {Promise<void>}
   */
  async setupPopupWindowAsync() {
    // Manifest V3: chrome.tabs.query() returns a Promise
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const current = tabs[0];
    const title = current.title;
    const url = current.url;
    $('#sid').val(current.id);

    this.makeMenuOnUpperArea(title, url);
  }

  /**
   * ブックマークを非同期でダンプする
   * @returns {Promise<Array>} ブックマークツリーノードの配列
   */
  async dumpBookmarksAsync() {
    // Manifest V3: chrome.bookmarks.getTree() returns a Promise
    return await chrome.bookmarks.getTree();
  }

  /**
   * ポップアップUIを非同期で作成する
   * @returns {Promise<void>}
   */
  async make_popup_ui() {
    await this.setupPopupWindowAsync();
    await this.makeMenuOnBottomAreaAsync();
  }
  /**
   * ブックマークを非同期で取得する
   * @returns {Promise<void>}
   */
  async get_bookmarks() {
    this.dumpBookmarksAsync().then((bookmarkTreeNodes) => {
      this.dumpTreeNodesAsync(bookmarkTreeNodes);
    });
  }
  /**
   * ツリーノードを非同期でダンプする
   * @param {Array} bookmarkTreeNodes - ブックマークツリーノードの配列
   * @returns {Promise<Array>} ブックマークツリーノードの配列
   */
  async dumpTreeNodesAsync(bookmarkTreeNodes) {
    this.dumpTreeNodes_func(bookmarkTreeNodes);
    const hierKeys = data.getItemHashByHierKeys();
    Globalx.setStorageHiers(hierKeys);
    return bookmarkTreeNodes;
  }

  /**
   * 初期化処理を開始する
   * @returns {Promise<void>}
   */
  async start() {
    Globalx.initSettings_a();
    await Globalx.initSettings_all();
    await this.get_bookmarks();
    await this.make_popup_ui();
  }

  /**
   * BMXフォルダを移動する（特定の階層パス）
   */
  moveBMX2() {
      let hier = '/0/0-etc/0';
      let group = Movergroup.get_mover_group();
      // console.log(`hier=${hier}`);
      let obj = data.getItemByHier(hier);
      // console.log(`obj.id=${obj.id}`);
      if (obj.id != null) {
          this.itemGroup.moveBMXFolderBase(group, obj.id).then(() => {
          });
      } else {
          // console.log(`obj=${obj}`);
      }
  }

  /**
   * BMXフォルダを移動する（ブックマークバー）
   */
  moveBMX() {
      let group = Movergroup.get_mover_group();
      this.itemGroup.moveBMXFolderBase(group, '1').then(() => {
      });
  }

  /**
   * 条件に応じて結果を出力する
   * @param {Object} ret - 結果オブジェクト
   * @param {string} ret.hier - 階層パス
   * @param {string} ret.title - タイトル
   */
  print_with_cond_ret(ret) {
    if (this.reg.exec(ret.hier)) {
          console.log(`dumpTreeNodes 1 ret.hier=${ret.hier}  Reg.title=${ret.title}`)
    }
  }
  
  /**
   * フォルダを追加する（テスト用）
   */
  addFc() {
	  /*
    const root = data.getItemByHier('/');
	  console.log(`root=${JSON.stringify(root)}`)
	  */
   const root0 = data.getItemByHier('');
	  console.log(`root0=${JSON.stringify(root0)}`)
    data.getKeysOfItemByHier().map((key) => {
      if( key.trim().startsWith('//') ){
      console.log(key)
    }});
  }

  /**
   * ツリーノードをダンプする関数を作成する
   * @returns {Function} ダンプ関数
   */
  createDumpTreeNodes() {
      const self = this;
      function dumpTreeNodes_func(bookmarkTreeNodes) {
          return bookmarkTreeNodes.reduce((accumulator, element) => {
              let ret = self.itemGroup.add_to_itemgroup(element, dumpTreeNodes_func);
              if (ret != null) {
                  self.print_with_cond_ret(ret);
                  accumulator.push(ret);
              }
              return accumulator;
          }, []);
      }
      return dumpTreeNodes_func;
  }
}

new PopupManager();
