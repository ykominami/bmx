import { data } from './data.js';

/**
 * グローバル設定とストレージ管理を提供するクラス
 * @class Globalx
 */
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

    /**
     * 値を調整する（nullの場合は空配列を返す）
     * @param {Array|null} val - 値
     * @returns {Array} 調整された値
     */
    static adjustValue(val) {
        // console.log(`adjustValue 0 val=${val}`);
        let val2 = [];

        if (val != null) {
            val2 = val;
        }
        return val2;
    }

    /**
     * ストレージから設定を読み込む
     * @returns {Promise<Object>} 設定オブジェクト
     */
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

    /**
     * 設定を初期化する（Keyvaluesから）
     */
    static initSettings_a() {
        Globalx.Keyvalues.map(([key, value]) => Globalx.setSettingsByKey(Globalx.Settings, key, value));
    }

    /**
     * すべての設定を初期化する（ストレージから読み込み）
     * @returns {Promise<void>}
     */
    static async initSettings_all() {
        await Globalx.loadSettings().then((c) => {
                        const itemhashx = data.makeItemHashX(Globalx.StorageHiers);
            Globalx.replace_in_Settings(c);
            Globalx.replace_in_Settings(itemhashx);
        });
    }

    /**
     * 連想配列からキーで値を取得する
     * @param {Object} assoc - 連想配列
     * @param {string} key - キー
     * @returns {*} 値（存在しない場合はnull）
     */
    static getSettingsByKey(assoc, key) {
        if (assoc[key]) {
            return assoc[key];
        } else {
            return null;
        }
    }

    /**
     * 連想配列にキーと値を設定する
     * @param {Object} assoc - 連想配列
     * @param {string} key - キー
     * @param {*} value - 値
     */
    static setSettingsByKey(assoc, key, value) {
        assoc[key] = value;
    }

    /**
     * 設定を置き換える
     * @param {Object} asoc - 連想配列
     */
    static replace_in_Settings(asoc) {
        Globalx.Keyvalues.map(([key, _]) => {
            // console.log(`replace_in_settings `);
            if (asoc[key]) {
                Globalx.setSettingsByKey(Globalx.Settings, key, asoc[key]);
            }
        });
    }

    /**
     * ストレージの選択された値を追加する
     * @param {string} key - キー
     * @param {*} value - 値
     */
    static addStorageSelected(key, value) {
        Globalx.setSettingsByKey(Globalx.Settings[Globalx.StorageSelected], key, value);
    }

    /**
     * ストレージのオプションを設定する
     * @param {Array} value - オプション配列
     */
    static setStorageOptions(value) {
        Globalx.Settings[Globalx.StorageOptions] = value;
    }

    /**
     * ストレージのオプションを取得する
     * @returns {Array} オプション配列
     */
    static getStorageOptions() {
        let options = Globalx.getSettingsByKey(Globalx.Settings, Globalx.StorageOptions);
        if (Array.isArray(options) === false) {
            options = [];
            Globalx.setSettingsByKey(Globalx.Settings, Globalx.StorageOptions, options);
        }
        return options;
    }

    /**
     * ストレージの階層パスを設定する
     * @param {Object} value - 階層パスオブジェクト
     * @returns {Promise<void>}
     */
    static async setStorageHiers(value) {
        Globalx.Settings[Globalx.StorageHiers] = {};
        // Manifest V3: chrome.storage.local.set() returns a Promise
        await chrome.storage.local.set({all: Globalx.Settings});
        Globalx.Settings[Globalx.StorageHiers] = value;
    }

    /**
     * ストレージのオプションの先頭にオブジェクトを追加する
     * @param {Object} obj - 追加するオブジェクト
     * @returns {Promise<void>}
     */
    static async storageOptionsUnshift(obj) {
        Globalx.Settings[Globalx.StorageOptions].unshift(obj);
        // Manifest V3: chrome.storage.local.set() returns a Promise
        await chrome.storage.local.set({all: Globalx.Settings});
        // let objx = Globalx.Settings[Globalx.StorageOptions];
    }

    /**
     * 設定を削除する
     * @returns {Promise<void>}
     */
    static async removeSettings() {
        // Manifest V3: chrome.storage.local.remove() returns a Promise
        await chrome.storage.local.remove(
            [Globalx.StorageOptions, Globalx.StorageSelected, Globalx.StorageHiers]
        );
    }

    /**
     * 最近使用したアイテムをselectに追加する
     * @param {jQuery} select - select要素のjQueryオブジェクト
     * @param {Array} sOptions - オプション配列
     */
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

    /**
     * 最近使用したフォルダを調整する（既存の場合は削除して先頭に追加）
     * @param {string} value - 値
     * @param {string} text - テキスト
     */
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

    /**
     * オプション配列からselectのオプション要素を作成する
     * @param {Array} options - オプション配列
     * @returns {Array<jQuery>} jQueryオプション要素の配列
     */
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

    /**
     * 最近使用したアイテムを追加する
     * @param {jQuery} select - select要素のjQueryオブジェクト
     * @param {string|null} [value=null] - 値
     * @param {string|null} [text=null] - テキスト
     */
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