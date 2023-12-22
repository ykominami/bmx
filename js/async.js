import {
  loadSettings,
  loadSettings_by_api,
  getStorageOptions,
  setStorageOptions,
  adjustValue,
  addRecentlyItem,
} from "./global.js";

function updateSelectRecently(ary, select) {
  // console.log(`updateSelectRecently ary=${JSON.stringify(ary)}`);
  const opts1 = ary.map((element) => {
    return $("<option>", {
      value: element.value,
      text: element.text,
    });
  });
  select.empty();
  select.append(opts1);
  if (opts1.size > 0) {
    select.val(ary[0].value);
  }
}

// async function loadAsync(mes = "") {
async function loadAsync() {
  let ret = await loadSettings_by_api("from loadAsync");
  let storageOptions = getStorageOptions();

  storageOptions["Options"] = adjustValue(storageOptions["Options"]);
  let options = [...ret["Options"]];
  setStorageOptions([]);
  updateSelectRecently(options, $("#rinp"));
}

export { loadAsync, updateSelectRecently };
