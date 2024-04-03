import { setStorageHiers } from './global.js';
import { getKeysOfItemByHier } from './data.js';
import { add_to_itemgroup, getItemFromRoot } from './itemg.js';
import { debugPrint2, debugPrint } from './debug.js';

/* ===== bookmarkの情報を取得 ===== */
/* 指定フォルダ以下の対象フォルダの一覧取得(配列として) */
/* この関数は再帰的に呼び出されるが、内部処理は必ず最初はchromeのbookmarksのトップに対
    して呼び出されることを想定している */
/* 一気に全フォルダの階層構造をつくることが目的である */
function dumpTreeNodes(bookmarkTreeNodes) {
  /* bookmarkTreeNodes - フォルダと項目が混在している */
  // debugPrint2(`bookmarkTreeNodes.length=${bookmarkTreeNodes.length}`);
  return bookmarkTreeNodes.reduce((accumulator, element) => {
    let ret = null;
    if (element != undefined) {
      // debugPrint2(`DTs 6`);
      //debugPrint2(`### dumpTreeNodes map element 3`);
      ret = add_to_itemgroup(element);
      // debugPrint2(`DTs 4 ret.children=${JSON.stringify(ret)}`);
    }
    if (ret != null) {
      accumulator.push(ret);
    }
    return accumulator;
  }, []);
}
async function dumpTreeNodesAsync(bookmarkTreeNodes) {
  await dumpTreeNodes(bookmarkTreeNodes);
  const hierKeys = getKeysOfItemByHier();
  setStorageHiers(hierKeys);

  return bookmarkTreeNodes;
}

export { dumpTreeNodes, dumpTreeNodesAsync };
