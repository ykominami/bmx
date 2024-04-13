import { getStorageOptions, addRecentlyItemX } from './global.js';

function restoreSelectRecently(select) {
  let sOptions = getStorageOptions();
  addRecentlyItemX(select, sOptions);
}
/*
 * function updateSelectRecently(select) {
  console.log(`#- updateSelectRecently | async.js`);
  addRecentlyItem(select, null, null);
}
*/

function updateSelectRecently(ary, select) {
  // console.log(`updateSelectRecently ary=${JSON.stringify(ary)}`);
  const opts1 = ary.map((element) => {
    return $('<option>', {
      value: element.value,
      text: element.text,
    });
  });
}

export { loadAsync };
