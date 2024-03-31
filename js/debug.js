/* デバッグ用関数 */
function debugPrint2(obj) {
  console.log(obj);
}

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
