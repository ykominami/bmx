
/* デバッグ用関数 */
function debugPrint2(obj) {
  console.log(obj);
}
let debugOption = {count:0 , count_win:0, count_max:0}
function debugPrint(obj) {
  if (
    debugOption.count_min <= debugOption.count &&
    debugOption.count_max >= debugOption.count
  ) {
    console.log(obj);
  }
  debugOption.count++;
}

export { debugPrint2, debugPrint };
