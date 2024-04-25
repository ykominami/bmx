import { add_to_itemgroup } from './itemg.js';

/* ===== bookmarkの情報を取得 ===== */
/* 指定フォルダ以下の対象フォルダの一覧取得(配列として) */
/* この関数は再帰的に呼び出されるが、内部処理は必ず最初はchromeのbookmarksのトップに対
    して呼び出されることを想定している */
/* 一気に全フォルダの階層構造をつくることが目的である */
function dumpTreeNodes(bookmarkTreeNodes) {
  /* bookmarkTreeNodes - フォルダと項目が混在している */
  return bookmarkTreeNodes.reduce((accumulator, element) => {
    let ret = null;
    let reg = new RegExp('\/Y\/DashBoard', '');
    if (element != undefined) {
      ret = add_to_itemgroup(element);
    }
    if (ret != null) {
      if (reg.exec(ret.hier)){
        console.log(`dumpTreeNodes 1 ret.hier=${ret.hier}  reg.title=${ret.title}`)
      }
      accumulator.push(ret);
    }
    else{
      // console.log(`dumpTreeNodes element.title=${element.title}  `)
    }
    return accumulator;
  }, []);
}

function moveBMX3() {
  let hier = '/Amazon/Amazon';
  let group = Movergroup.get_mover_group();
  let obj = getItemByHier(hier);
  if (obj.id != null) {
    console.log(`obj.id=${obj.id}`);
    moveBMXFolderCheck(group, obj.id);
  }
}
/*
        1 ブックマークツールバー
        2 その他のブックマーク
        3 モバイルのブックマーク
        */
function moveBMX2() {
  let hier = '/0/0-etc/0';
  let group = Movergroup.get_mover_group();
  console.log(`hier=${hier}`);
  let obj = getItemByHier(hier);
  console.log(`obj.id=${obj.id}`);
  if (obj.id != null) {
    moveBMXFolderBase(group, obj.id);
  } else {
    console.log(`obj=${obj}`);
  }
}

function moveBMX() {
  let group = Movergroup.get_mover_group();
  moveBMXFolderBase(group, '1');
}

export { dumpTreeNodes, moveBMX, moveBMX2, moveBMX3 };
