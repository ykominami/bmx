import {
  loadSettings_by_api,
  getStorageOptions,
  setStorageOptions,
  adjustValue,
  addRecentlyItem,
} from './global.js';
import { debugPrint2 } from './debug.js';

function updateSelectRecently_0(ary2, select) {
  debugPrint2(`#- updateSelectRecently_0 | async.js`);
  ary2.map((element) => {
    debugPrint2(
      `async.js | updateSelectRecently element.value=${element.value} element.text=${element.text}`
    );
    addRecentlyItem(select, element.value, element.text);
  });
}
function updateSelectRecently(select) {
  debugPrint2(`#- updateSelectRecently | async.js`);
  addRecentlyItem(select, null, null);
}

// async function loadAsync(mes = "") {
async function loadAsync() {
  let ret = await loadSettings_by_api('from loadAsync');
  let storageOptions = getStorageOptions();

  debugPrint2(
    `loadSettings_by_api 0 --- Options=${JSON.stringify(
      Object.entries(ret['Options'])
    )}||`
  );
  storageOptions['Options'] = adjustValue(storageOptions['Options']);
  debugPrint2(
    `loadSettings_by_api 1 --- Options=${JSON.stringify(
      Object.entries(ret['Options'])
    )}||`
  );
  debugPrint2(`ret=${JSON.stringify(Object.entries(ret))}||`);
  // updateSelectRecently(storageOptions["Options"], $("#rinp"));

  let options = [...ret['Options']];
  debugPrint2(`async.js | loadAsync options=${JSON.stringify(options)}||`);
  // setStorageOptions([]);
  // updateSelectRecently(options, $('#rinp'));
  updateSelectRecently($('#rinp'));
}

export { loadAsync, updateSelectRecently };
