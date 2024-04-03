import { getStorageOptions, adjustValue, addRecentlyItem } from './global.js';
import { debugPrint2 } from './debug.js';

function updateSelectRecently(select) {
  console.log(`#- updateSelectRecently | async.js`);
  addRecentlyItem(select, null, null);
}

async function loadAsync_0() {
  let ret = await loadSettings_by_api('from loadAsync');
}
// async function loadAsync(mes = "") {
async function loadAsync() {
  let ret = await loadSettings_by_api('from loadAsync');
  let storageOptions = getStorageOptions();

  console.log(
    `loadSettings_by_api 0 --- Options=${JSON.stringify(
      Object.entries(ret['Options'])
    )}||`
  );
  storageOptions['Options'] = adjustValue(storageOptions['Options']);
  console.log(
    `loadSettings_by_api 1 --- Options=${JSON.stringify(
      Object.entries(ret['Options'])
    )}||`
  );
  console.log(`ret=${JSON.stringify(Object.entries(ret))}||`);

  let options = [...ret['Options']];
  console.log(`async.js | loadAsync options=${JSON.stringify(options)}||`);
  updateSelectRecently($('#rinp'));
}

export { loadAsync, updateSelectRecently };
