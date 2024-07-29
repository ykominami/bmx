import {add_to_itemgroup, moveBMXFolderBase} from './itemg.js';

let Reg = new RegExp('\/Y\/DashBoard', '');
/* ===== bookmarkの情報を取得 ===== */
/* 指定フォルダ以下の対象フォルダの一覧取得(配列として) */
/* この関数は再帰的に呼び出されるが、内部処理は必ず最初はchromeのbookmarksのトップに対
    して呼び出されることを想定している */

function print_with_cond_ret(ret) {
    if (Reg.exec(ret.hier)) {
        /*
          console.log(`dumpTreeNodes 1 ret.hier=${ret.hier}  Reg.title=${ret.title}`)
       */
    }
}

/* 一気に全フォルダの階層構造をつくることが目的である */
function dumpTreeNodes(bookmarkTreeNodes) {
    /* bookmarkTreeNodes - フォルダと項目が混在している */
    return bookmarkTreeNodes.reduce((accumulator, element) => {
        let ret = add_to_itemgroup(element);
        if (ret != null) {
            print_with_cond_ret(ret);
            accumulator.push(ret);
        } else {
            // console.log(`dumpTreeNodes element.title=${element.title}  `)
        }
        return accumulator;
    }, []);
}

/*
        1 ブックマークツールバー
        2 その他のブックマーク
        3 モバイルのブックマーク
        */
function moveBMX2() {
    let hier = '/0/0-etc/0';
    let group = Movergroup.get_mover_group();
    // console.log(`hier=${hier}`);
    let obj = getItemByHier(hier);
    // console.log(`obj.id=${obj.id}`);
    if (obj.id != null) {
        moveBMXFolderBase(group, obj.id).then(() => {
        });
    } else {
        // console.log(`obj=${obj}`);
    }
}

function moveBMX() {
    let group = Movergroup.get_mover_group();
    moveBMXFolderBase(group, '1').then(() => {
    });
}

export {dumpTreeNodes, moveBMX, moveBMX2};
