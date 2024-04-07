import { debugPrint2, debugPrint } from './debug.js';
import { restoreSelectRecently } from './async.js';
import { makeItemHashX } from './data.js';

let Settings = {};

const StorageOptions = 'Options'; /* 選択された対象フォルダの履歴() */
const StorageSelected = 'Selected'; /* 各keytop毎の選択された対象フォルダ */
const StorageHiers = 'Hiers'; /* 各keytop毎の選択された対象フォルダ */
const StorageMisc = 'Misc'; /* Misc */
const ANOTHER_FOLER = -1;
const Keyvalues = [
  [StorageOptions, []],
  [StorageSelected, {}],
  [StorageHiers, {}],
  [StorageMisc, {}],
];

function getKeysOfStorageHiers(key, value) {
  let keys = Object.keys(StorageHiers);
  return keys;
}

function adjustValue(val) {
  // console.log(`adjustValue 0 val=${val}`);
  let val2 = [];

  let val3 = null;
  // if (val == null || val === undefined) {
  if (val != null) {
    if (val !== undefined) {
      if (val !== 'undefined') {
        val2 = val;
        val3 = 0;
      } else {
        val2 = [];
        val3 = 10;
      }
    } else {
      val2 = [];
      val3 = 20;
    }
  } else {
    val2 = [];
    val3 = 30;
  }
  // debugPrint2(`adjustValue 1 val2=${val2}`);
  // debugPrint2(`adjustValue 1 val3=${val3}`);
  return val2;
}

async function loadSettings() {
  let value = null;
  let str2 = '';
  return chrome.storage.local.get(null).then((result) => {
    if (result['all']) {
      value = result['all'];
      let str = JSON.stringify(value);
      let size = str.length;
      let str2 = '';
      if (str.length < 100) {
        str2 = str;
      } else {
        str2 = `${size}`;
      }
    } else {
      value = {};
    }
    return value;
  });
}
function initSettings_a() {
  Keyvalues.map(([key, value]) => setSettingsByKey(Settings, key, value));
}

async function initSettings_all() {
  await loadSettings().then((c) => {
    const itemhashx = makeItemHashX(StorageHiers);
    replace_in_Settings(c);
    replace_in_Settings(itemhashx);
  });
}

/* ===== グローバル変数 関連 ===== */
function getSettingsByKey(assoc, key) {
  if (assoc[key]) {
    return assoc[key];
  } else {
    return null;
  }
}

function setSettingsByKey(assoc, key, value) {
  assoc[key] = value;
}

function replace_in_Settings(asoc) {
  Keyvalues.map(([key, value]) => {
    // console.log(`replace_in_settings `);
    if (asoc[key]) {
      setSettingsByKey(Settings, key, asoc[key]);
    }
  });
}

function getStorageSelected() {
  let selected = adjustValue(Settings[StorageSelected]);
  // (`getStorageSelected ${selected}`);
  return selected;
}

function addStorageSelected(key, value) {
  // console.log(`Settings=${Settings}`);
  // console.log(`Settings[StorageSelected]=${Settings[StorageSelected]}`);
  setSettingsByKey(Settings[StorageSelected], key, value);
}

function setStorageOptions(value) {
  Settings[StorageOptions] = value;
}


function getStorageOptions() {
  let options = getSettingsByKey(Settings, StorageOptions);
  if (Array.isArray(options) == false) {
    options = [];
    setSettingsByKey(Settings, StorageOptions, options);
  }
  return options;
}

function getStorageHiers() {
  if (Settings[StorageHiers]) {
    return Settings[StorageHiers];
  } else {
    return [];
  }
}

async function setStorageHiers(value) {
  //Settings[StorageHiers] = value;
  // let d = getStorageHiers();
  Settings[StorageHiers] = {};
  await chrome.storage.local.set({ all: Settings });
  Settings[StorageHiers] = value;
}

async function setStorageMisc(value) {
  Settings[StorageMisc] = value;
  await chrome.storage.local.set({ all: Settings });
}

async function storageOptionsUnshift(obj) {
  Settings[StorageOptions].unshift(obj);
  await chrome.storage.local.set({ all: Settings });
  let objx = Settings[StorageOptions];
  // console.log(`storageOptionsUnshift obj=${JSON.stringify(objx)}`);
}

async function saveSettings() {
  await chrome.storage.local.set({ all: Settings }).then(() => {
    // console.log(`Settings saved!`);
  });
}

async function removeSettings() {
  await chrome.storage.local.remove(
    [StorageOptions, StorageSelected, StorageHiers],
    (result) => {}
  );
}

function printBase(va, mes = '') {
  console.log(`||| ${mes} |${va}`);
  Object.entries(va).map(([key, value]) => {
    console.log(`${key} | ${JSON.stringify(value)}`);
  });
  console.log(`|||====`);
}

function printSettingsBase(var_name, va, mes = '') {
  console.log(`||| ${mes} loadSettings ${var_name}`);
  Object.entries(va).map(([key, value]) => {
    console.log(`${key} | ${JSON.stringify(value)}`);
  });
}
function printSettings(mes = '') {
  printSettingsBase('Settings', Settings, (mes = ''));
}

// const sOptions = getStorageOptions();
function addRecentlyItemX(select, sOptions) {
  /* selectにアイテムを追加する(いったんselectの内容を消去して、追加したデータを改めてselectに設定する) */
  const opts1 = makeSelectOptionsData(sOptions);

  select.empty();
  if (opts1.length > 0) {
    select.append(opts1);
    const selected_value = select.find('option:first').val();
    select.val(selected_value);
  }
}

function adjustRecentrlyFolder(value, text) {
  const sOptions = getStorageOptions();
  const ind = sOptions.findIndex((element, index, array) => {
    return element.value == value;
  });
  if (ind >= 0) {
    sOptions.splice(ind, 1);
  }
  storageOptionsUnshift({
    value: value,
    text: text,
  });
}
function makeSelectOptionsData(options) {
  const opts1 = [];
  options.map((element, index, array) => {
    opts1.push(
      $('<option>', {
        value: element.value,
        text: element.text,
      })
    );
    debugPrint2(
      `global.js | addRecentlyItem | element.value=${element.value} element.text=${element.text}| global.js`
    );
  });
  return opts1;
}
function addRecentlyItem(select, value = null, text = null) {
  // console.log(`## addRecentlyItem value=${value} text=${text} | global.js`);
  /* 現在選択された対象フォルダが過去にも選択されていれば、過去の対象フォルダを直近に移動させる（つまりあらかじめ、過去の記録を削除する） */
  /* 直近で同一対象フォルダが選択されていても、いったん削除する */
  const sOptions = getStorageOptions();
  // console.log(`sOptions=${JSON.stringify(sOptions)} | global.js`);
  if (value != null && text != null) {
    adjustRecentrlyFolder(value, text);
  }

  /* selectにアイテムを追加する(いったんslectの内容を消去して、追加したデータを改めてselectに設定する) */
  const opts1 = makeSelectOptionsData(sOptions);
  // console.log(`## addRecentlyItem opts1=${JSON.stringify(opts1)} | global.js`);

  select.empty();
  if (opts1.length > 0) {
    select.append(opts1);
    const selected_value = select.find('option:first').val();
    select.val(selected_value);
    // saveSettings();
  }

  replace_in_Settings(sOptions);
}

export {
  StorageOptions,
  StorageSelected,
  StorageHiers,
  ANOTHER_FOLER,
  adjustValue,
  initSettings_a,
  initSettings_all,
  //
  replace_in_Settings,
  addStorageSelected,
  getStorageOptions,
  setStorageOptions,
  getKeysOfStorageHiers,
  getStorageHiers,
  setStorageHiers,
  setStorageMisc,
  storageOptionsUnshift,
  saveSettings,
  loadSettings,
  removeSettings,
  printBase,
  printSettings,
  addRecentlyItem,
  addRecentlyItemX,
};
