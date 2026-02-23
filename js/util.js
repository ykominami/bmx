import {addRecentlyItemX, getStorageOptions} from './global.js';

/**
 * ユーティリティ関数を提供するクラス
 * @class Util
 */
export class Util {
    /**
     * 日付から月を取得する（1-12）
     * @param {Date} datex - 日付オブジェクト
     * @returns {number} 月（1-12）
     */
    static getMonthx(datex) {
        return datex.getMonth() + 1;
    }

    /**
     * 数値を2桁の文字列に変換する（10未満の場合は0埋め）
     * @param {number} num - 数値
     * @returns {string} 2桁の文字列
     */
    static adjustAsStr(num) {
        let str = `${num}`;
        if (num < 10) {
            str = `0${num}`;
        }
        return str;
    }

    /**
     * ボタンのjQueryオブジェクトを作成する
     * @param {string} name - ボタン名
     * @param {string} class_name - クラス名
     * @param {string} id - ID
     * @returns {jQuery} ボタンのjQueryオブジェクト
     */
    static makeBtnA(name, class_name, id) {
        return $("<button>", {
            type: "button",
            name: name,
            class: class_name,
            id: id,
            text: name,
        });
    }

    /**
     * selectのjQueryオブジェクトを作成する
     * @param {string} class_name - クラス名
     * @param {string} id - ID
     * @returns {jQuery} selectのjQueryオブジェクト
     */
    static makeSelectA(class_name, id) {
        return $("<select>", {
            class: class_name,
            id: id,
        });
    }

    /**
     * カテゴリ名を取得する
     * @param {number} i - カテゴリインデックス
     * @returns {string} カテゴリ名（"c" + i）
     */
    static getCategoryName(i) {
        return "c" + i;
    }

    /**
     * selectのIDを取得する
     * @param {string} name - 名前
     * @returns {string} selectのID（name + "inp"）
     */
    static getSelectId(name) {
        return name + "inp";
    }

    /**
     * ボタンのIDを取得する
     * @param {string} name - 名前
     * @returns {string} ボタンのID（name + "btn"）
     */
    static getBtnId(name) {
        return name + "btn";
    }

    /**
     * jQueryセレクタIDを取得する
     * @param {string} id - ID
     * @returns {string} jQueryセレクタ（"#" + id）
     */
    static getJqueryId(id) {
        return "#" + id;
    }

    /**
     * URLを非同期でパースする
     * @param {string} url - URL文字列
     * @returns {Promise<URL>} URLオブジェクト
     */
    static async parseURLAsync(url) {
        return new URL(url);
    }

    /**
     * URLからホスト名を取得する
     * @param {string} url - URL文字列
     * @returns {Promise<string>} ホスト名
     */
    static parseURLX(url) {
        return Util.parseURLAsync(url).then((parser) => {
            return parser.hostname;
        });
    }

    /**
     * 最近使用したセレクトを復元する
     * @param {jQuery} select - セレクト要素のjQueryオブジェクト
     */
    static restoreSelectRecently(select) {
        let sOptions = getStorageOptions();
        addRecentlyItemX(select, sOptions);
    }

    /**
     * 最近使用したセレクトを更新する
     * @param {Array} ary - オプション配列
     * @param {jQuery} select - セレクト要素のjQueryオブジェクト
     */
    static updateSelectRecently(ary, select) {
        // console.log(`updateSelectRecently ary=${JSON.stringify(ary)}`);
        const opts1 = ary.map((element) => {
            return $('<option>', {
                value: element.value,
                text: element.text,
            });
        });
        select.empty();
        select.append(opts1);
        if (opts1.size > 0) {
            select.prop('selectedIndex', 0);
        }
    }
}
