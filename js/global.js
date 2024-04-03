import { debugPrint2, debugPrint } from './debug.js';

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

function set_flag() {
  if (promise == null) {
    promise = new Promise((resolve) => {
      resolve();
    });
  }
  promise.then();
}

let Settings = {};
let SettingsFromLoad = {};
let SettingsFromLoad2 = {};

function adjustValue(val) {
  // debugPrint2(`adjustValue 0 val=${val}`);
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
  // debugPrint2(`adjustValue 1 val2=${val2}`);
  // debugPrint2(`adjustValue 1 val3=${val3}`);
  return val2;
}

async function saveSettings_by_api() {
  let val = {};
  val[StorageOptions] = getStorageOptions();
  val[StorageSelected] = getStorageSelected();
  // val[StorageHiers] = getStorageHiers();
  // val[StorageSelected] = [];
  // val[StorageMisc] = getStorageMisc();

  debugPrint2('==################################ saveSettings_by_api == 1');
  debugPrint2(Object.entries(val));

  await chrome.storage.local.set({ all: val });
  // chrome.storage.local.set({ all: val });
  debugPrint2(`saveSettings_by_api Settings=${Object.keys(Settings)}`);
  debugPrint2('==################################ saveSettings_by_api == 2');
}

async function loadSettings_by_api(mes = '') {
  return new Promise((resolve) => {
    chrome.storage.local.get().then((result) => {
      let value = result['all'];
      Settings = value === null || value === undefined ? {} : value;
      Object.keys(Settings).map((k) => debugPrint2(`k=${k} | ${Settings[k]}`));
      debugPrint2(`loadSettings_by_api Settings=${Object.keys(Settings)}`);

      resolve(Settings);
    });
  });
}
function loadSettings(mes = '') {
  chrome.storage.local.get()
  let valStorageOptions = adjustValue(localStorage[StorageOptions]);
  let valStorageSelected = adjustValue(localStorage[StorageSelected]);
  let valStorageHiers = adjustValue(localStorage[StorageHiers]);
  let valStorageMisc = adjustValue(localStorage[StorageMisc]);

  setSettingsByKey(Settings, StorageOptions, valStorageOptions);
  setSettingsByKey(Settings, StorageSelected, valStorageSelected);
  setSettingsByKey(Settings, StorageHiers, valStorageHiers);
  setSettingsByKey(Settings, StorageMisc, valStorageMisc);

  return Settings;
}

function initSettings_z() {
  let c;

  setSettingsByKey(Settings, StorageOptions, []);
  setSettingsByKey(Settings, StorageSelected, {});
  setSettingsByKey(Settings, StorageHiers, {});
  setSettingsByKey(Settings, StorageMisc, {});

  setSettingsByKey(SettingsFromLoad, StorageOptions, []);
  setSettingsByKey(SettingsFromLoad, StorageSelected, {});
  setSettingsByKey(SettingsFromLoad, StorageHiers, {});
  setSettingsByKey(SettingsFromLoad, StorageMisc, {});

  setSettingsByKey(SettingsFromLoad2, StorageOptions, []);
  setSettingsByKey(SettingsFromLoad2, StorageSelected, {});
  setSettingsByKey(SettingsFromLoad2, StorageHiers, {});
  setSettingsByKey(SettingsFromLoad2, StorageMisc, {});

  // let c = loadSettings_by_api("Y1");
  // let c = loadSettings("Y1");
  debugPrint2(`StorageOptions ${c[StorageOptions]}`);
  Object.entries(c).map((key) => {
    debugPrint2(`key=${key}`);
  });
  debugPrint2(`StorageSelected ${c[StorageSelected]}`);

  setSettings(c);
  setSettingsFromLoad(c);
  setSettingsFromLoad2(c);
  copyFromLoad2ToSettingsX();

  debugPrint2('initSettings_z saveSettings');
  saveSettings();
}

async function initSettings_all() {
  debugPrint2('0');
  loadSettings_by_api().then((c) => {
    debugPrint2('3');
  });
}

/* ===== グローバル変数 関連 ===== */
function setSettings(val) {
  debugPrint2(`================= setSettings ${JSON.stringify(val)}`);
  Settings = val;
}

function setSettingsFromLoad(val) {
  SettingsFromLoad = val;
}

function setSettingsFromLoad2(val) {
  SettingsFromLoad2 = val;
}

function getSettingsByKey(assoc, key) {
  return assoc[key];
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
  debugPrint2(`getStorageSelected ${selected}`);
  return selected;
}

function getStorageOptions() {
  let options = getSettingsByKey(Settings, StorageOptions);
  if (typeof options == 'undefined') {
    options = [];
    setSettingsByKey(Settings, StorageOptions, options);
    debugPrint2(`############### 3 getStorageOptions undefined`);
  }
  if (Array.isArray(options) == false) {
    options = [];
    setSettingsByKey(Settings, StorageOptions, options);
    debugPrint2(`############### 4 getStorageOptions not Array`);
  }
  return options;
}

function setStorageOptions(value) {
  debugPrint2(
    `================= setStorageOptions value=${JSON.stringify(value)}`
  );
  Settings[StorageOptions] = value;
  localStorage[StorageOptions] = value;
}

function getStorageHiers() {
  return Settings[StorageHiers];
}

function setStorageHiers(value) {
  Settings[StorageHiers] = value;
  localStorage[StorageHiers] = value;
}

function getStorageMisc() {
  return Settings[StorageMisc];
}

function setStorageMisc(value) {
  debugPrint2(
    `================= setStorageMisc value=${JSON.stringify(value)}`
  );
  Settings[StorageMisc] = value;
  localStorage[StorageMisc] = value;
}

function storageOptionsUnshift(obj) {
  Settings[StorageOptions].unshift(obj);
  // localStorage[StorageOptions] = Settings[StorageOptions];
  let objx = localStorage[StorageOptions];
  debugPrint2(typeof objx);
  localStorage[StorageOptions] = objx;
}

async function saveSettings() {
  let val = {};
  val[StorageOptions] = getStorageOptions();
  val[StorageSelected] = getStorageSelected();
  // val[StorageHiers] = getStorageHiers();
  val[StorageSelected] = [];
  // val[StorageMisc] = getStorageMisc();

  debugPrint2('==################################ saveSettings == 1');
  debugPrint2(Object.entries(val));

  await chrome.storage.local.set(val);
  debugPrint2('==################################ saveSettings == 2');
  /*
  localStorage[StorageOptions] = val[StorageOptions];
  localStorage[StorageSelected] = val[StorageSelected];
  localStorage[StorageHiers] = val[StorageHiers];
  localStorage[StorageMisc] = val[StorageMisc];
  */
  debugPrint2('========   saveSettings');
  debugPrint2(
    `========   saveSettings localStorage[StorageSelected]=${localStorage[StorageSelected]}`
  );
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

function copyFromLoadToSettingsX() {
  copyFromLoadToSettings(StorageOptions);
  copyFromLoadToSettings(StorageSelected);
  copyFromLoadToSettings(StorageHiers);
  copyFromLoadToSettings(StorageMisc);
}

function copyFromLoad2ToSettingsX() {
  copyFromLoad2ToSettings(StorageOptions);
  copyFromLoad2ToSettings(StorageSelected);
  copyFromLoad2ToSettings(StorageHiers);
  copyFromLoad2ToSettings(StorageMisc);
}

function copyFromLoadToSettings(key) {
  // SettingsFromLoad[key] = Settings[key];
  debugPrint2(`================= copyFromLoadToSettings key=${key}`);
  if (typeof SettingsFromLoad != 'undefined') {
    if (typeof SettingsFromLoad[key] != 'undefined') {
      Settings[key] = SettingsFromLoad[key];
    }
  }
}

function copyFromLoad2ToSettings(key) {
  /* debugPrint2(
    `================= copyFromLoad2ToSettings key=${key}|${SettingsFromLoad2[key]}`
  );
  */
  if (typeof SettingsFromLoad2 != 'undefined') {
    if (typeof SettingsFromLoad2[key] != 'undefined') {
      Settings[key] = SettingsFromLoad2[key];
    }
  }
}

function printBase(va, mes = '') {
  debugPrint2(`||| ${mes} |${va}`);
  Object.entries(va).map(([key, value]) => {
    debugPrint2(`${key} | ${JSON.stringify(value)}`);
  });
  debugPrint2(`|||====`);
}

function printSettingsBase(var_name, va, mes = '') {
  debugPrint2(`||| ${mes} loadSettings ${var_name}`);
  Object.entries(va).map(([key, value]) => {
    debugPrint2(`${key} | ${JSON.stringify(value)}`);
  });
}
function printSettings(mes = '') {
  printSettingsBase('Settings', Settings, (mes = ''));
}

function printSettingsFromLoad(mes = '') {
  printSettingsBase('SettingsFromLoad', SettingsFromLoad, (mes = ''));
}

function printSettingsFromLoad2(mes = '') {
  printSettingsBase('SettingsFromLoad2', SettingsFromLoad2, (mes = ''));
}

function addRecentlyItemX(select) {
  debugPrint2(`# addRecentlyItemX | global.js`);
  addRecentlyItem(select);
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
  debugPrint2(
    `global.js | addRecentlyItem | opts1=${JSON.stringify(opts1)} | global.js`
  );
  return opts1;
}

function addRecentlyItem(select, value = null, text = null) {
  debugPrint2(`## addRecentlyItem value=${value} text=${text} | global.js`);
  /* 現在選択された対象フォルダが過去にも選択されていれば、過去の対象フォルダを直近に移動させる（つまりあらかじめ、過去の記録を削除する） */
  /* 直近で同一対象フォルダが選択されていても、いったん削除する */
  const sOptions = getStorageOptions();
  debugPrint2(`sOptions=${JSON.stringify(sOptions)} | global.js`);
  if (value != null && text != null) {
    adjustRecentrlyFolder(value, text);
  }

  /* selectにアイテムを追加する(いったんslectの内容を消去して、追加したデータを改めてselectに設定する) */
  const opts1 = makeSelectOptionsData(sOptions);
  debugPrint2(`## addRecentlyItem opts1=${JSON.stringify(opts1)} | global.js`);

  select.empty();
  if (opts1.length > 0) {
    select.append(opts1);
    const selected_value = select.find('option:first').val();
    debugPrint2(`selected_value=${selected_value} | global.js`);
    select.val(selected_value);
    debugPrint2(`opts1[0].value=${opts1[0].value} | global.js`);
  }

  setStorageOptions(sOptions);
  debugPrint2(
    `## addRecentlyItem call saveSettings_by_api() sOptions=${JSON.stringify(
      sOptions
    )} | global.js`
  );
}

export {
  StorageOptions,
  StorageSelected,
  StorageHiers,
  ANOTHER_FOLER,
  adjustValue,
  initSettings_all,
  //
  saveSettings_by_api,
  setSettings,
  setSettingsFromLoad,
  setSettingsFromLoad2,
  getSettingsByKey,
  setStorageSelected,
  getStorageOptions,
  setStorageOptions,
  getStorageHiers,
  setStorageHiers,
  getStorageMisc,
  setStorageMisc,
  storageOptionsUnshift,
  saveSettings,
  loadSettings,
  loadSettings2,
  loadSettings_by_api,
  removeSettings,
  copyFromLoadToSettingsX,
  copyFromLoad2ToSettingsX,
  copyFromLoadToSettings,
  copyFromLoad2ToSettings,
  printBase,
  printSettings,
  printSettingsFromLoad,
  printSettingsFromLoad2,
  addRecentlyItemX,
  addRecentlyItem,
};
