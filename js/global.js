import { debugPrint2, debugPrint } from './debug.js';

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

async function loadSettings_by_api(mes = '') {
  // TODO: remove argument mes
  let result = await chrome.storage.local.get();
  let value = result['all'];
  Settings = value == null || value == undefined ? {} : value;
  // console.log(`loadSettings_by_api Settings=${Settings}`);

  return Settings;
}

function loadSettings(mes = '') {
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
  console.log(`StorageOptions ${c[StorageOptions]}`);
  Object.entries(c).map((key) => {
    console.log(`key=${key}`);
  });
  console.log(`StorageSelected ${c[StorageSelected]}`);

  setSettings(c);
  setSettingsFromLoad(c);
  setSettingsFromLoad2(c);
  copyFromLoad2ToSettingsX();

  saveSettings();
}

async function initSettings_0() {
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
}

async function initSettings_1(c) {
  console.log(`StorageOptions ${c[StorageOptions]}`);
  Object.entries(c).map((key) => {
    console.log(`key=${key}`);
  });
  console.log(`StorageSelected ${c[StorageSelected]}`);

  setSettings(c);
  setSettingsFromLoad(c);
  setSettingsFromLoad2(c);
  copyFromLoad2ToSettingsX();

  saveSettings();
}

async function initSettings_all() {
  console.log('0');
  await initSettings_0();
  console.log('1');
  let c = loadSettings_by_api();
  console.log('=====================================================2');
  await initSettings_1(c);
  console.log('3');
}

/* ===== グローバル変数 関連 ===== */
function setSettings(val) {
  console.log(`================= setSettings ${JSON.stringify(val)}`);
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
  /*
  console.log(
    `================= setSettingsByKey key=${key} value=${JSON.stringify(
      value
    )}`
  );
  */
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
  if (typeof options == 'undefined') {
    options = [];
    setSettingsByKey(Settings, StorageOptions, options);
    console.log(`############### 3 getStorageOptions undefined`);
  }
  if (Array.isArray(options) == false) {
    options = [];
    setSettingsByKey(Settings, StorageOptions, options);
  }
  return options;
}

function setStorageOptions(value) {
  console.log(
    `================= setStorageOptions value=${JSON.stringify(value)}`
  );
  Settings[StorageOptions] = value;
  localStorage[StorageOptions] = value;
}

function getStorageHiers() {
  return Settings[StorageHiers];
}

function setStorageHiers(value) {
  /*
  console.log(
    `================= setStorageHiers value=${JSON.stringify(value)}`
  );
  */
  Settings[StorageHiers] = value;
  localStorage[StorageHiers] = value;
}

function setStorageMisc(value) {
  Settings[StorageMisc] = value;
  localStorage[StorageMisc] = value;
}

function storageOptionsUnshift(obj) {
  Settings[StorageOptions].unshift(obj);
  // localStorage[StorageOptions] = Settings[StorageOptions];
  let objx = localStorage[StorageOptions];
  console.log(typeof objx);
  localStorage[StorageOptions] = objx;
}

async function saveSettings() {
  let val = {};
  val[StorageOptions] = getStorageOptions();
  val[StorageSelected] = getStorageSelected();
  // val[StorageHiers] = getStorageHiers();
  val[StorageSelected] = [];
  // val[StorageMisc] = getStorageMisc();

  console.log('==################################ saveSettings == 1');
  console.log(Object.entries(val));

  await chrome.storage.local.set(val);
  console.log('==################################ saveSettings == 2');

  localStorage[StorageOptions] = val[StorageOptions];
  localStorage[StorageSelected] = val[StorageSelected];
  localStorage[StorageHiers] = val[StorageHiers];
  localStorage[StorageMisc] = val[StorageMisc];

  console.log('========   saveSettings');
  console.log(
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
  console.log(`================= copyFromLoadToSettings key=${key}`);
  if (typeof SettingsFromLoad != 'undefined') {
    if (typeof SettingsFromLoad[key] != 'undefined') {
      Settings[key] = SettingsFromLoad[key];
    }
  }
}

function copyFromLoad2ToSettings(key) {
  /* console.log(
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
  console.log(`||| ${mes} |${va}`);
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

export {
  StorageOptions,
  StorageSelected,
  StorageHiers,
  ANOTHER_FOLER,
  adjustValue,
  loadSettings_by_api,
  initSettings_all,
  //
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
  removeSettings,
  copyFromLoadToSettingsX,
  copyFromLoad2ToSettingsX,
  copyFromLoadToSettings,
  copyFromLoad2ToSettings,
  printBase,
  printSettings,
  printSettingsFromLoad,
  printSettingsFromLoad2,
};
