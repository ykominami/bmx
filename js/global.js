import { debugPrint2, debugPrint } from "./debug.js";

const StorageOptions = "Options"; /* 選択された対象フォルダの履歴() */
const StorageSelected = "Selected"; /* 各keytop毎の選択された対象フォルダ */
const StorageHiers = "Hiers"; /* 各keytop毎の選択された対象フォルダ */
const StorageMisc = "Misc"; /* Misc */
const ANOTHER_FOLER = -1;

let Settings = {};

function adjustValue(val) {
  // console.log(`adjustValue 0 val=${val}`);
  let val2 = [];
  let val3 = null;
  // if (val == null || val === undefined) {
  if (val != null) {
    if (val !== undefined) {
      if (val !== "undefined") {
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

async function saveSettings_by_api() {
  let val = {};
  val[StorageOptions] = getStorageOptions();
  val[StorageSelected] = getStorageSelected();
  // val[StorageHiers] = getStorageHiers();
  val[StorageSelected] = [];
  // val[StorageMisc] = getStorageMisc();

  // console.log("==################################ saveSettings_by_api == 1");
  // console.log(Object.entries(val));

  // await chrome.storage.local.set(val);
  chrome.storage.local.set({ all: val });
  // console.log("==################################ saveSettings_by_api == 2");
}

async function loadSettings_by_api(mes = "") {
  // TODO: remove argument mes
  let result = await chrome.storage.local.get();
  let value = result["all"];
  Settings = value == null || value == undefined ? {} : value;
  // console.log(`loadSettings_by_api Settings=${Settings}`);

  return Settings;
}

function loadSettings(mes = "") {
  // TODO: remove argument mes
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

async function initSettings_all() {
  // console.log("initSettings_all 0");
  loadSettings_by_api().then((c) => {
    // console.log(`initSettings_all 3 c=${c}`);
  });
}

/* ===== グローバル変数 関連 ===== */
function setSettings(val) {
  // console.log(`================= setSettings ${JSON.stringify(val)}`);
  Settings = val;
}

function getSettingsByKey(assoc, key) {
  let ret = null;
  if (key in assoc) {
    ret = assoc[key];
  }
  return ret;
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
    typeof Settings[StorageSelected] === "object"
  ) {
    if (
      Settings[StorageSelected][keytop] !== null &&
      Settings[StorageSelected][keytop] !== undefined
    ) {
      if (typeof Settings[StorageSelected][keytop] === "object") {
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
  // console.log(`getStorageSelected ${selected}`);
  return selected;
}

function getStorageOptions() {
  // console.log("***=====================  getStorageOptions")
  let options = getSettingsByKey(Settings, StorageOptions);
  if (options == null) {
    options = [];
    setSettingsByKey(Settings, StorageOptions, options);
    // console.log(`############### 3 getStorageOptions undefined`);
  }
  if (Array.isArray(options) == false) {
    options = [];
    setSettingsByKey(Settings, StorageOptions, options);
    // console.log(`############### 4 getStorageOptions not Array`);
  }
  // console.log(`***=====================  getStorageOptions options=${options}`)
  return options;
}

function setStorageOptions(value) {
  Settings[StorageOptions] = value;
}

function getStorageHiers() {
  let ret = null;
  if (StorageHiers in Settings) {
    ret = Settings[StorageHiers];
  }
  return ret;
}

function setStorageHiers(value) {
  Settings[StorageHiers] = value;
  //console.log(
  //  `================= setStorageHiers value=${JSON.stringify(value)}`
  //);
  // localStorage[StorageHiers] = value;
}

function getStorageMisc() {
  let ret = null;
  if (StorageMisc in Settings) {
    ret = Settings[StorageMisc];
  }
  return ret;
}

function setStorageMisc(value) {
  /*
  console.log(
    `================= setStorageMisc value=${JSON.stringify(value)}`
  );
  */
  Settings[StorageMisc] = value;
  localStorage[StorageMisc] = value;
}

function storageOptionsUnshift(obj) {
  if (!StorageOptions in Settings) {
    Settings[StorageOptions] = [];
  }
  Settings[StorageOptions] = [obj, ...Settings[StorageOptions]];
  // localStorage[StorageOptions] = Settings[StorageOptions];
  localStorage[StorageOptions] = [obj, ...localStorage[StorageOptions]];
}

async function saveSettings() {
  let val = {};
  val[StorageOptions] = getStorageOptions();
  val[StorageSelected] = getStorageSelected();
  // val[StorageHiers] = getStorageHiers();
  val[StorageSelected] = [];
  // val[StorageMisc] = getStorageMisc();

  // console.log("==################################ saveSettings == 1");
  // console.log(Object.entries(val));

  await chrome.storage.local.set(val);
  console.log("==################################ saveSettings == 2");

  localStorage[StorageOptions] = val[StorageOptions];
  localStorage[StorageSelected] = val[StorageSelected];
  localStorage[StorageHiers] = val[StorageHiers];
  localStorage[StorageMisc] = val[StorageMisc];

  // console.log("========   saveSettings");
  /*
  	  console.log(
    `========   saveSettings localStorage[StorageSelected]=${localStorage[StorageSelected]}`
  );
  */
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

function copyFromLoad2ToSettings(key) {
  /* console.log(
    `================= copyFromLoad2ToSettings key=${key}|${SettingsFromLoad2[key]}`
  );
  */
  if (typeof SettingsFromLoad2 != "undefined") {
    if (typeof SettingsFromLoad2[key] != "undefined") {
      Settings[key] = SettingsFromLoad2[key];
    }
  }
}

function printBase(va, mes = "") {
  debugPrint2(`||| ${mes} |${va}`);
  Object.entries(va).map(([key, value]) => {
    debugPrint2(`${key} | ${JSON.stringify(value)}`);
  });
  debugPrint2(`|||====`);
}

function printSettingsBase(var_name, va, mes = "") {
  debugPrint2(`||| ${mes} loadSettings ${var_name}`);
  Object.entries(va).map(([key, value]) => {
    debugPrint2(`${key} | ${JSON.stringify(value)}`);
  });
}
function printSettings(mes = "") {
  printSettingsBase("Settings", Settings, (mes = ""));
}

function printSettingsFromLoad2(mes = "") {
  printSettingsBase("SettingsFromLoad2", SettingsFromLoad2, (mes = ""));
}

function addRecentlyItemX(select, value, text) {
  addRecentlyItem(select, value, text);
  /* 変更したSettingの内容をローカルに保存する */
  // saveSettings();
  saveSettings_by_api();
}

function addRecentlyItem(select, value, text) {
  /* console.log("## addRecentlyItem"); */
  /* 現在選択された対象フォルダが過去にも選択されていれば、過去の対象フォルダを直近に移動させる（つまりあらかじめ、過去の記録を削除する） */
  /* 直近で同一対象フォルダが選択されていても、いったん削除する */
  let storageOptions = getStorageOptions();
  const ind = storageOptions.findIndex((element, index, array) => {
    return element.value == value;
  });
  // console.log(`addRecentlyItem ind=${ind}`);
  if (ind >= 0) {
    storageOptions.splice(ind, 1);
  }
  let item = {
    value: value,
    text: text,
  };
  storageOptions = [item, ...storageOptions];

  /* selectにアイテムを追加する(いったんslectの内容を消去して、追加したデータを改めてselectに設定する) */
  const opts1 = storageOptions.map((element) => {
    return $("<option>", {
      value: element.value,
      text: element.text,
    });
  });
  select.empty();
  select.append(opts1);
  select.val(value);

  setStorageOptions(storageOptions);
}

function getKeysOfStorageHiers() {
  // return Object.keys(Settings[StorageHiers]);
  return Object.keys(Settings);
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
  loadSettings_by_api,
  removeSettings,
  copyFromLoadToSettingsX,
  copyFromLoad2ToSettingsX,
  copyFromLoad2ToSettings,
  //
  printBase,
  printSettings,
  printSettingsFromLoad2,
  //
  addRecentlyItemX,
  addRecentlyItem,
  getKeysOfStorageHiers,
};
