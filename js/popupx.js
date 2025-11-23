import {getItems1, getKeys, getMax, getNumOfRows} from '../config/settings2.js';
import {createDumpTreeNodes} from './treenode.js';
import {ItemGroup} from './itemgroup.js';
import {Movergroup} from './movegroup.js';
// Removed: import {restoreSelectRecently, updateSelectRecently} from './async.js';
import { AddFolder } from './addfolder.js';
import { Util } from './util.js';
import { data } from './data.js';

import { Globalx } from './globalx.js';

/**
 * @fileoverview ファイルの説明、使い方や依存関係に
 * ついての情報。
 */

class PopupManager {
  constructor() {
    this.Target = null;
    this.addFolder = new AddFolder();
    this.itemGroup = new ItemGroup();
    this.dumpTreeNodes = createDumpTreeNodes(this.itemGroup);
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => this.onDOMContentLoaded());
    this.start();
  }

  onDOMContentLoaded() {
    document.getElementById('popupBtn').addEventListener('click', () => {
      // Original logic inside DOMContentLoaded
    });
  }

  /* ===== popup window 下部 下位関数 ==== */
  makeMenuRecentlyAndCategorySelectBtn(category_max, items) {
    const ary = [this.makeMenuXrecently()];
    return ary.concat(this.makeMenuXcategory(category_max, items));
  }

  /* 対象フォルダ選択メニュー作成 */
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

  makeBtnHdrAndSelect(btn_jquery_id, select_jquery_id, keytop) {
    this.addSelect($(select_jquery_id), keytop);
    $(btn_jquery_id).click(() => {
      this.createOrMoveBKItem(select_jquery_id, keytop).then(()=>{});
    });
  }

  makeMenuXrecently() {
    return {
      first: Util.makeBtnA('recently', 'button a', 'rbtn'),
      second: Util.makeSelectA('box d', 'rinp'),
    };
  }

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

  async getSelectOption(item, ignore_head) {
    let obj;
    let buffer = [];
    if (!ignore_head) {
      buffer.push({value: item.id, text: item.title});
    }
    await chrome.bookmarks.getSubTree(item.id).then((bookmarkTreeNodes) => {
      let count = 100;
      obj = this.dumpTreeItems(bookmarkTreeNodes, count, item.id)
      if(obj.buffer.length > 0){
        buffer.push(...obj.buffer)
      }
    });
    return buffer;
  }

  /* ===== */

  /* ===== popup window 上部 下位関数 ===== */
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

  addSelectWaitingItemsX(select, folder_id) {
    const item = data.getItem(folder_id);
    if (item == null) {
      return;
    }

    chrome.bookmarks.getSubTree(item.id, (bookmarkTreeNodes) => {
      let count = 1;
      let obj = this.dumpTreeItems(bookmarkTreeNodes, count, item.id)
      let buffer2 = obj.buffer.map((ele) => $('<option>', {value: ele.value, text: ele.text}));
      select.append(buffer2);
      select.prop('selectedIndex', 0);
      const folder_id= select.val();
      if (folder_id) {
        this.selectWaitingItemsBtnHdr(folder_id);
      }
    });
  }

  async tab_query_async(query, parent_id, parent_text) {
    let ret_tabs;
    await chrome.tabs.query(query).then((tabs) => {
      ret_tabs = tabs;
    });
    return [ret_tabs, parent_id, parent_text];
  }

  /* 非同期タブ問い合わせ */
  async add_mode_x([tabs, parent_id, parent_text]) {
    let i;
    let active_tab = tabs.find((tab) => tab.active)
    let move_need = true;
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
        for (i = active_tab.index + 1; i < tabs.length; i++) {
          chrome.bookmarks.create({
            parentId: parent_id,
            title: tabs[i].title,
            url: tabs[i].url,
          });
        }
        for (i = tabs.length - 1; i > active_tab.index; i--) {
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
        for (i = active_tab.index - 1; i >= 0; i--) {
          chrome.bookmarks.remove(tabs[i].id);
        }
        break;
      case 'x':
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
      Globalx.addRecentlyItem($('#rinp'), parent_id, parent_text);
    }
  }

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
      ).then(this.add_mode_x);
    } else {
      const text = $('#oname').val();
      const url = $('#ourl').val();
      const id = $('#oid').val();
      if (text !== '' && url !== '' && id !== '') {
        chrome.bookmarks.get(id, (result) => {
          let ret = this.moveBKItem(id, result[0].parentId, parent_id);
          this.addSelectWaitingItemsX($('#yinp'), $('#zinp').val());
        });
      } else {
        alert("Can't move bookmark");
      }
    }
    Globalx.addRecentlyItem($('#rinp'), parent_id, parent_text);
  }

  closeTabs() {
      this.tab_query_async({
        currentWindow: true,
      }).then((tabs) => {
        let i;
        const radioval = $("input[name='add-mode']:checked").val();
        switch (radioval) {
          case 's':
            break;
          case 'm-r':
            for (i = tabs.length - 1; i > current_tab.index; i--) {
              chrome.tabs.remove(tabs[i].id);
            }
            break;
          case 'm-l':
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
      let opts2 = opts1.map((obj) => $('<option>', {value: obj[0], text: obj[1]}));
      select.empty();
      select.append(opts2);
      select.prop('selectedIndex', 0);
      this.addSelectWaitingItemsX(subselect, select.val());
    }
  }

  moveBKItem(id, src_parent_id, dest_parent_id) {
    let ret = false;
    if (id !== '') {
      chrome.bookmarks
        .move(id, {
          parentId: dest_parent_id,
        })
        .then
        ()
        .then( () => {this.addSelectWaitingItemsX($('#yinp'), src_parent_id)})
        .then(() => {ret = true});
    } else {
      alert("Can't move bookmark");
    }
    return ret;
  }

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

  /* ===== ----- ==== */
  /***** bookmark 関連 下位関数 *****/
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

  /*********************/
  /* ====== popup window 下部 ===== */
  makeMenuOnBottomArea() {
    const w = getNumOfRows();
    const count = getMax();
    let ind;
    let next_start;
    let b_c, b_r, s_c, s_r;
    let items = getItems1();
    const els = this.makeMenuRecentlyAndCategorySelectBtn(count, items);
    const aryx = new Array(els.length * 2);
  }
}

new PopupManager();
