class Util {
    static getMonthx(datex) {
        return datex.getMonth() + 1;
    }

    static adjustAsStr(num) {
        let str = `${num}`;
        if (num < 10) {
            str = `0${num}`;
        }
        return str;
    }

    /* buttonのjqueryオブジェクト */
    static makeBtnA(name, class_name, id) {
        return $("<button>", {
            type: "button",
            name: name,
            class: class_name,
            id: id,
            text: name,
        });
    }

    /* selectのjqueryオブジェクト */
    static makeSelectA(class_name, id) {
        return $("<select>", {
            class: class_name,
            id: id,
        });
    }

    static getCategoryName(i) {
        return "c" + i;
    }

    static getSelectId(name) {
        return name + "inp";
    }

    static getBtnId(name) {
        return name + "btn";
    }

    static getJqueryId(id) {
        return "#" + id;
    }

    static async parseURLAsync(url) {
        return new URL(url);
    }

    static parseURLX(url) {
        return Util.parseURLAsync(url).then((parser) => {
            return parser.hostname;
        });
    }
}

export { Util };
