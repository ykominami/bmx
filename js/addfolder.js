import { getMonthx, adjustAsStr } from './util.js';

import {
  getPrefix,
  getFoldersFromPrefixes,
  getFoldersFromDayPrefixes,
} from './settings.js';

import {
  dumpTreeItemsXTop,
  getItemByHier,
  setItemByHier,
  setItem,
} from './data.js';

/* folder追加処理 */
function getYearAndNextMonthAsString() {
  let current = new Date();
  let month = current.getMonth();
  // 次の月に設定する
  current.setMonth(month + 1);
  let year = current.getFullYear();
  let next_month = getMonthx(current);
  let monthstr = adjustAsStr(next_month);
  return `${year}${monthstr}`;
}
/* folder追加処理 */
function getYearAndMonthAndDayAsString() {
  let current = new Date();
  let month = current.getMonth();
  let monthx = getMonthx(current);
  let year = current.getFullYear();

  console.log(`month=${month}`);
  console.log(`monthx=${monthx}`);
  //  console.log(`next_month=${next_month}`);

  let month_str = adjustAsStr(monthx);
  let date = current.getDate();
  let date_str = adjustAsStr(date);
  //let date_str = date.padStart(2, '0'));

  // 次の月に設定する
  let y_str = `${year}`;
  let ym_str = `${year}${month_str}`;
  let ymd_str = `${year}${month_str}${date_str}`;

  return [y_str, ym_str, ymd_str];
}

function registerx(key, value) {
  setItemByHier(key, value);
  setItem(value.id, value);
}
function makeElement(idx, parentidx, indexx, urlx, titlex) {
  return {
    id: idx,
    parentId: parentidx,
    index: indexx,
    url: urlx,
    title: titlex,
  };
}
function makeItem(element) {
  return {
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
}

function makeAndRegisterBookmarkFolder(keytop, parentidx, indexx, titlex) {
  let newFolderId = 0;
  let parentidstr = `${parentidx}`;
  console.log(`makeAndRegisterBookmarkFolder parentidstr=${parentidstr}`);
  chrome.bookmarks.create(
    {
      parentId: parentidstr,
      index: indexx,
      title: titlex,
    },
    function (newFolder) {
      newFolderId = newFolder.id;
    }
  );
  let element = makeElement(newFolderId, parentidx, indexx, null, titlex);

  let item = makeItem(element);
  item.hier = keytop;
  registerx(keytop, item);
}

function addFolderx() {
  let folders = getFoldersFromPrefixes();
  let year_month = getYearAndNextMonthAsString();

  folders.map((parent) => {
    const parent_item = getItemByHier(parent);
    if (parent_item !== null) {
      let prefix = getPrefix(parent);
      let title = `${prefix}-${year_month}`;
      let new_keytop = `${parent}/${title}`;
      let new_item = getItemByHier(new_keytop);
      if (new_item === null) {
        makeAndRegisterBookmarkFolder(new_keytop, parent_item.id, 0, title);
      }
    }
  });
}
function addDayFolderx() {
  let folders = getFoldersFromDayPrefixes();
  let [y_str, ym_str, ymd_str] = getYearAndMonthAndDayAsString();

  // "Y/Day"
  folders.map((parent) => {
    if (parent == null) {
      parent = '';
    }
    if (y_str == null) {
      y_str = '';
    }
    if (ym_str == null) {
      ym_str = '';
    }
    if (ymd_str == null) {
      ymd_str = '';
    }
    const arrayx = [parent, y_str, ym_str, ymd_str];
    arrayx.reduce((accumulator, currentValue) => {
      const parent_item = getItemByHier(accumulator);
      const hier = [accumulator, currentValue].join('/');
      let item = getItemByHier(hier);
      if (item === null) {
        makeAndRegisterBokkmarkFolderx(parent_item, currentValue, hier);
        item = getItemByHier(hier);
        console.log(`item=${JSON.stringify(item)}`);
      }
      console.log(`parent=${parent} hier=${hier} item=${item}`);

      return hier;
    });
  });
}
function makeAndRegisterBokkmarkFolderx(parent_item, title, new_keytop) {
  let new_item = getItemByHier(new_keytop);
  if (new_item === null) {
    makeAndRegisterBookmarkFolder(new_keytop, parent_item.id, 0, title);
    new_item = getItemByHier(new_keytop);
  }
  return new_item;
}
function lstree() {
  const hier = '/Y/Day/2023/202311';
  let item = getItemByHier(hier);
  console.log(item);
  let ary = dumpTreeItemsXTop(item.id);
  ary.map((item_id) => console.log(item_id));
}
export {
  getYearAndNextMonthAsString,
  registerx,
  makeElement,
  makeItem,
  addFolderx,
  addDayFolderx,
  lstree,
};
