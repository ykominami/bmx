import { data } from './data.js';

export class Globalx {
    static Settings = {};

    static StorageOptions = 'Options';
    static StorageSelected = 'Selected';
    static StorageHiers = 'Hiers';
    static StorageMisc = 'Misc';
    static ANOTHER_FOLER = -1;
    static Keyvalues = [
        [Globalx.StorageOptions, []],
        [Globalx.StorageSelected, {}],
        [Globalx.StorageHiers, {}],
        [Globalx.StorageMisc, {}],
    ];

    static adjustValue(val) {
        // console.log(`adjustValue 0 val=${val}`);
        let val2 = [];

        if (val != null) {
            val2 = val;
        }
        return val2;
    }

    static async loadSettings() {
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

    static initSettings_a() {
        Globalx.Keyvalues.map(([key, value]) => Globalx.setSettingsByKey(Globalx.Settings, key, value));
    }

    static async initSettings_all() {
        await Globalx.loadSettings().then((c) => {
                        const itemhashx = data.makeItemHashX(Globalx.StorageHiers);
            Globalx.replace_in_Settings(c);
            Globalx.replace_in_Settings(itemhashx);
        });
    }

    /* ===== グローバル変数 関連 ===== */
    static getSettingsByKey(assoc, key) {
        if (assoc[key]) {
            return assoc[key];
        } else {
            return null;
        }
    }

    static setSettingsByKey(assoc, key, value) {
        assoc[key] = value;
    }

    static replace_in_Settings(asoc) {
        Globalx.Keyvalues.map(([key, _]) => {
            // console.log(`replace_in_settings `);
            if (asoc[key]) {
                Globalx.setSettingsByKey(Globalx.Settings, key, asoc[key]);
            }
        });
    }

    static addStorageSelected(key, value) {
        Globalx.setSettingsByKey(Globalx.Settings[Globalx.StorageSelected], key, value);
    }

    static setStorageOptions(value) {
        Globalx.Settings[Globalx.StorageOptions] = value;
    }

    static getStorageOptions() {
        let options = Globalx.getSettingsByKey(Globalx.Settings, Globalx.StorageOptions);
        if (Array.isArray(options) === false) {
            options = [];
            Globalx.setSettingsByKey(Globalx.Settings, Globalx.StorageOptions, options);
        }
        return options;
    }

    static async setStorageHiers(value) {
        Globalx.Settings[Globalx.StorageHiers] = {};
        // Manifest V3: chrome.storage.local.set() returns a Promise
        await chrome.storage.local.set({all: Globalx.Settings});
        Globalx.Settings[Globalx.StorageHiers] = value;
    }

    static async storageOptionsUnshift(obj) {
        Globalx.Settings[Globalx.StorageOptions].unshift(obj);
        // Manifest V3: chrome.storage.local.set() returns a Promise
        await chrome.storage.local.set({all: Globalx.Settings});
        // let objx = Globalx.Settings[Globalx.StorageOptions];
    }

    static async removeSettings() {
        // Manifest V3: chrome.storage.local.remove() returns a Promise
        await chrome.storage.local.remove(
            [Globalx.StorageOptions, Globalx.StorageSelected, Globalx.StorageHiers]
        );
    }

    // const sOptions = Globalx.getStorageOptions();
    static addRecentlyItemX(select, sOptions) {
        /* selectにアイテムを追加する(いったんselectの内容を消去して、追加したデータを改めてselectに設定する) */
        const opts1 = Globalx.makeSelectOptionsData(sOptions);

        select.empty();
        if (opts1.length > 0) {
            select.append(opts1);
            const selected_value = select.find('option:first').val();
            select.val(selected_value);
        }
    }

    static adjustRecentrlyFolder(value, text) {
        const sOptions = Globalx.getStorageOptions();
        const ind = sOptions.findIndex((element) => {
            return element.value === value;
        });
        if (ind >= 0) {
            sOptions.splice(ind, 1);
        }
        Globalx.storageOptionsUnshift({
            value: value,
            text: text,
        });
    }

    static makeSelectOptionsData(options) {
        const opts1 = [];
        options.map((element) => {
            opts1.push(
                $('<option>', {
                    value: element.value,
                    text: element.text,
                })
            );
            /* console.log(
              `globalx.js | addRecentlyItem | element.value=${element.value} element.text=${element.text}| globalx.js`
            ); */
        });
        return opts1;
    }

    static addRecentlyItem(select, value = null, text = null) {
        // console.log(`## addRecentlyItem value=${value} text=${text} | globalx.js`);
        /* 現在選択された対象フォルダが過去にも選択されていれば、過去の対象フォルダを直近に移動させる（つまりあらかじめ、過去の記録を削除する） */
        /* 直近で同一対象フォルダが選択されていても、いったん削除する */
        const sOptions = Globalx.getStorageOptions();
        // console.log(`sOptions=${JSON.stringify(sOptions)} | globalx.js`);
        if (value != null && text != null) {
            Globalx.adjustRecentrlyFolder(value, text);
        }

        /* selectにアイテムを追加する(いったんslectの内容を消去して、追加したデータを改めてselectに設定する) */
        const opts1 = Globalx.makeSelectOptionsData(sOptions);
        // console.log(`## addRecentlyItem opts1=${JSON.stringify(opts1)} | globalx.js`);

        select.empty();
        if (opts1.length > 0) {
            select.append(opts1);
            const selected_value = select.find('option:first').val();
            select.val(selected_value);
            // saveSettings();
        }

        Globalx.replace_in_Settings(sOptions);
    }
}