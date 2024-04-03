import { debugPrint2, debugPrint } from './debug.js';

let Settings = {};

const StorageOptions = 'Options'; /* 選択された対象フォルダの履歴() */
const StorageSelected = 'Selected'; /* 各keytop毎の選択された対象フォルダ */
const StorageHiers = 'Hiers'; /* 各keytop毎の選択された対象フォルダ */
const StorageMisc = 'Misc'; /* Misc */
const ANOTHER_FOLER = -1;

let promise = null;
async function wait_flag() {
  if (promise == null) {
    promise = new Promise((resolve) => {
      resolve();
    });
  }
  promise.then();
}

function getKeysOfStorageHiers(key, value) {
  let keys = Object.keys(StorageHiers);
  return keys;
}

function set_flag() {
  if (promise == null) {
    promise = new Promise((resolve) => {
      resolve();
    });
  }
  promise.then();
}

function adjustValue(val) {
  // console.log(`adjustValue 0 val=${val}`);
  let val2;
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
  // console.log(`adjustValue 1 val2=${val2}`);
  // console.log(`adjustValue 1 val3=${val3}`);
  return val2;
}

async function loadSettings_by_api2(mes = '') {
  return await chrome.storage.local.get().then((result) => {
    let value = result['all'];
    let Settings = value === null || value === undefined ? {} : value;
    /*
    Object.keys(Settings).map((k) =>
      console.log(`k=${k} | ${JSON.stringify(Settings[k])}`)
    );
    */
    // console.log(`loadSettings_by_api2 Settings=${JSON.stringify(Settings)}`);

    return Settings;
  });
}
function initSettings_a() {
  setSettingsByKey(Settings, StorageOptions, []);
  setSettingsByKey(Settings, StorageSelected, {});
  setSettingsByKey(Settings, StorageHiers, {});
  setSettingsByKey(Settings, StorageMisc, {});
}
function initSettings_z() {
  let c;

  setSettingsByKey(Settings, StorageOptions, []);
  setSettingsByKey(Settings, StorageSelected, {});
  setSettingsByKey(Settings, StorageHiers, {});
  setSettingsByKey(Settings, StorageMisc, {});

  // let c = loadSettings_by_api("Y1");
  // let c = loadSettings("Y1");
  console.log(`StorageOptions ${c[StorageOptions]}`);
  Object.entries(c).map((key) => {
    console.log(`key=${key}`);
  });
  console.log(`StorageSelected ${c[StorageSelected]}`);

  setSettings(c);

  console.log('initSettings_z saveSettings');
  saveSettings();
}

async function initSettings_all() {
  // console.log('0');
  loadSettings_by_api2().then((c) => {
    initSettings_a();
    /*
    console.log(
      `initSettings_all() loadSettings_by_api2 then c=${JSON.stringify(c)}`
    );
    */
    setSettings(c);
    // console.log('3');
    // saveSettings();
  });
}

/* ===== グローバル変数 関連 ===== */
function setSettings(val) {
  // console.log(`================= setSettings ${JSON.stringify(val)}`);
  Settings = val;
}

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

function setStorageSelected(keytop, value) {
  if (
    Settings[StorageSelected] !== null &&
    Settings[StorageSelected] !== undefined &&
    typeof Settings[StorageSelected] === 'object'
  ) {
    if (
      Settings[StorageSelected][keytop] !== null &&
      Settings[StorageSelected][keytop] !== undefined
    ) {
      if (typeof Settings[StorageSelected][keytop] === 'object') {
        Settings[StorageSelected][keytop] = {};
      }
    }
  } else {
    Settings[StorageSelected] = {};
  }
  Settings[StorageSelected][keytop] = value;
}

function getStorageSelected() {
  let selected = adjustValue(Settings[StorageSelected]);
  console.log(`getStorageSelected ${selected}`);
  return selected;
}

function getStorageOptions() {
  let options = getSettingsByKey(Settings, StorageOptions);
  if (options == null) {
    options = [];
    setSettingsByKey(Settings, StorageOptions, options);
    console.log(`############### 3 getStorageOptions undefined`);
  }
  return options;
}

function setStorageOptions(value) {
  console.log(
    `================= setStorageOptions value=${JSON.stringify(value)}`
  );
  Settings[StorageOptions] = value;
  chrome.storage.local.set({ StorageOptions: value }, (data) => {
    console.log(`data=${JSON.stringify(data)}`);
  });
}

function getStorageHiers() {
  if (Settings[StorageHiers]) {
    return Settings[StorageHiers];
  } else {
    return [];
  }
}

function setStorageHiers(value) {
  Settings[StorageHiers] = value;
  chrome.storage.local.set({ StorageHiers: value });
}

function setStorageMisc(value) {
  console.log(
    `================= setStorageMisc value=${JSON.stringify(value)}`
  );
  Settings[StorageMisc] = value;
  chrome.storage.local.set({ StorageMisc: value });
}

function storageOptionsUnshift(obj) {
  Settings[StorageOptions].unshift(obj);
  chrome.storage.local.set({ StorageOptions: Settings[StorageOptions] });
  let objx = Settings[StorageOptions];
  console.log(`storageOptionsUnshift obj=${JSON.stringify(objx)}`);
}

async function saveSettings() {
  let val = {};
  val[StorageOptions] = getStorageOptions();
  val[StorageSelected] = getStorageSelected();

  console.log('==################################ saveSettings == 1');
  console.log(Object.entries(val));

  await chrome.storage.local.set(val);
  console.log('==################################ saveSettings == 2');
  console.log('========   saveSettings');
}
const loadSettings2 = (key = null) =>
  new Promise((resolve) => {
    chrome.storage.local.get(key, resolve);
  });

async function loadSettings2_orig(mes = '') {
  const storagex = (await chrome.storage.local.get()).then((val) => val);
  // [StorageOptions, StorageSelected, StorageHiers, StorageMisc]
  return storagex;
}

function removeSettings() {
  chrome.storage.local.remove(
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

function addRecentlyItemX(select) {
  console.log(`# addRecentlyItemX | global.js`);
  addRecentlyItem(select);
}
function adjustRecentrlyFolder(value, text) {
  const sOptions = getStorageOptions();
  console.log(
    `global.js adjustRecentrlyFolder sOptions=${JSON.stringify(sOptions)}`
  );
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
    console.log(
      `global.js | addRecentlyItem | element.value=${element.value} element.text=${element.text}| global.js`
    );
  });
  console.log(
    `global.js | addRecentlyItem | opts1=${JSON.stringify(opts1)} | global.js`
  );
  return opts1;
}

function addRecentlyItem(select, value = null, text = null) {
  console.log(`## addRecentlyItem value=${value} text=${text} | global.js`);
  /* 現在選択された対象フォルダが過去にも選択されていれば、過去の対象フォルダを直近に移動させる（つまりあらかじめ、過去の記録を削除する） */
  /* 直近で同一対象フォルダが選択されていても、いったん削除する */
  const sOptions = getStorageOptions();
  console.log(`sOptions=${JSON.stringify(sOptions)} | global.js`);
  if (value != null && text != null) {
    adjustRecentrlyFolder(value, text);
  }

  /* selectにアイテムを追加する(いったんslectの内容を消去して、追加したデータを改めてselectに設定する) */
  const opts1 = makeSelectOptionsData(sOptions);
  console.log(`## addRecentlyItem opts1=${JSON.stringify(opts1)} | global.js`);

  select.empty();
  if (opts1.length > 0) {
    select.append(opts1);
    const selected_value = select.find('option:first').val();
    console.log(`selected_value=${selected_value} | global.js`);
    select.val(selected_value);
    console.log(`opts1[0].value=${opts1[0].value} | global.js`);
  }

  setStorageOptions(sOptions);
}

export {
  StorageOptions,
  StorageSelected,
  StorageHiers,
  ANOTHER_FOLER,
  adjustValue,
  initSettings_all,
  //
  setSettings,
  setStorageSelected,
  getStorageOptions,
  setStorageOptions,
  getKeysOfStorageHiers,
  getStorageHiers,
  setStorageHiers,
  setStorageMisc,
  storageOptionsUnshift,
  saveSettings,
  loadSettings_by_api2,
  removeSettings,
  printBase,
  printSettings,
  addRecentlyItemX,
  addRecentlyItem,
};
