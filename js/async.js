import { getStorageOptions, addRecentlyItemX } from './global.js';

function restoreSelectRecently(select) {
  let sOptions = getStorageOptions();
  addRecentlyItemX(select, sOptions);
}

export { restoreSelectRecently };
