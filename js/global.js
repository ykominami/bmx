import {makeItemHashX} from './data.js';

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

function adjustValue(val) {
    // console.log(`adjustValue 0 val=${val}`);
    let val2 = [];

    if (val != null) {
        val2 = val;
    }
    return val2;
}

async function loadSettings() {
    // Manifest V3: chrome.storage.local.get() returns a Promise
    const result = await chrome.storage.local.get(null);
    let value = null;
    if (result['all']) {
        value = result['all'];
    } else {
        value = {};
    }
    return value;
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
    Keyvalues.map(([key, _]) => {
        // console.log(`replace_in_settings `);
        if (asoc[key]) {
            setSettingsByKey(Settings, key, asoc[key]);
        }
    });
}

function addStorageSelected(key, value) {
    setSettingsByKey(Settings[StorageSelected], key, value);
}

function setStorageOptions(value) {
    Settings[StorageOptions] = value;
}

function getStorageOptions() {
    let options = getSettingsByKey(Settings, StorageOptions);
    if (Array.isArray(options) === false) {
        options = [];
        setSettingsByKey(Settings, StorageOptions, options);
    }
    return options;
}

async function setStorageHiers(value) {
    Settings[StorageHiers] = {};
    // Manifest V3: chrome.storage.local.set() returns a Promise
    await chrome.storage.local.set({all: Settings});
    Settings[StorageHiers] = value;
}

async function storageOptionsUnshift(obj) {
    Settings[StorageOptions].unshift(obj);
    // Manifest V3: chrome.storage.local.set() returns a Promise
    await chrome.storage.local.set({all: Settings});
    // let objx = Settings[StorageOptions];
}

async function removeSettings() {
    // Manifest V3: chrome.storage.local.remove() returns a Promise
    await chrome.storage.local.remove(
        [StorageOptions, StorageSelected, StorageHiers]
    );
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
    const ind = sOptions.findIndex((element) => {
        return element.value === value;
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
    options.map((element) => {
        opts1.push(
            $('<option>', {
                value: element.value,
                text: element.text,
            })
        );
        /* console.log(
          `global.js | addRecentlyItem | element.value=${element.value} element.text=${element.text}| global.js`
        ); */
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
    getSettingsByKey,
    replace_in_Settings,
    addStorageSelected,
    getStorageOptions,
    setStorageOptions,
    setStorageHiers,
    storageOptionsUnshift,
    loadSettings,
    removeSettings,
    addRecentlyItem,
    addRecentlyItemX,
};
