import { setStorageHiers } from "./global.js";
import { getKeysOfItemByHier } from "./data.js";
import { add_to_itemgroup, getItemFromRoot } from "./itemg.js";

/* ===== bookmarkの情報を取得 ===== */
/* 指定フォルダ以下の対象フォルダの一覧取得(配列として) */
/* この関数は再帰的に呼び出されるが、内部処理は必ず最初はchromeのbookmarksのトップに対
    して呼び出されることを想定している */
/* 一気に全フォルダの階層構造をつくることが目的である */
function dumpTreeNodes(bookmarkTreeNodes) {
  /* bookmarkTreeNodes - フォルダと項目が混在している */

  return bookmarkTreeNodes.map((element, index, array) => {
    // console.log(`### dumpTreeNodes map element 1 element.url=${element.url}`);
    //console.log(`DTs 2`);
    let ret = null;

    //console.log(`DTs 5`);
    //console.log(`### dumpTreeNodes map element 2`);
    if (element != undefined) {
      //console.log(`DTs 6`);
      //console.log(`### dumpTreeNodes map element 3`);
      ret = add_to_itemgroup(element);
    }

    //console.log(`DTs 4`);
    return ret;
  });
}
async function dumpTreeNodesAsync(bookmarkTreeNodes) {
  // function dumpTreeNodesAsync(bookmarkTreeNodes) {
  console.log(`DTNA 1`);

  dumpTreeNodes(bookmarkTreeNodes);
  const hierKeys = getKeysOfItemByHier();
  console.log(`hierKeys=${hierKeys}`);
  setStorageHiers(hierKeys);

  return bookmarkTreeNodes;
}

export { dumpTreeNodes, dumpTreeNodesAsync };
