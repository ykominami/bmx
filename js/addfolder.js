/* folder追加処理 */
function getYearAndNextMonthAsString() {
  let current = new Date();
  let month = current.getMonth();
  // 次の月に設定する
  current.setMonth(month + 1);
  let year = current.getFullYear();
  let next_month = getMonthx(current);
  let monthstr = adjustAsStr(next_month);
  let str = `${year}${monthstr}`;

  return str;
}
function registerx(key, value) {
  setItemByHier(key, value);
  setItem(value.id, value);
}
function makeElement(idx, parentidx, indexx, urlx, titlex) {
  let element = {
    id: idx,
    parentId: parentidx,
    index: indexx,
    url: urlx,
    title: titlex,
  };
  return element;
}
function makeItem(element) {
  const item = {
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
  return item;
}

function makeAndRegisterBookmarkFolder(keytop, parentidx, indexx, titlex) {
  let newFolderId = 0;
  chrome.bookmarks.create(
    {
      parentId: parentidx,
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
  let folders = getFolders();
  let year_month = getYearAndNextMonthAsString();

  folders.map((parent) => {
    const parent_item = getItemByHier(parent);
    if (parent_item !== undefined) {
      let prefix = getPrefix(parent);
      let title = `${prefix}-${year_month}`;
      let new_keytop = `${parent}/${title}`;
      let new_item = getItemByHier(new_keytop);
      if (new_item === undefined) {
        makeAndRegisterBookmarkFolder(new_keytop, parent_item.id, 0, title);
      }
    }
  });
}

export {
  getYearAndNextMonthAsString,
  registerx,
  makeElement,
  makeItem,
  makeAndRegisterBookmarkFolder,
  addFolderx,
};
