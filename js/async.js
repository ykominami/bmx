import { getStorageOptions, addRecentlyItemX } from './global.js';

function restoreSelectRecently(select) {
  let sOptions = getStorageOptions();
  addRecentlyItemX(select, sOptions);
}
function updateSelectRecently(select) {
  debugPrint2(`#- updateSelectRecently | async.js`);
  addRecentlyItem(select, null, null);
}

export { restoreSelectRecently };
