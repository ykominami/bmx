import {
  loadSettings_by_api,
  getStorageOptions,
  setStorageOptions,
  adjustValue,
  addRecentlyItem,
} from "./global.js";

function updateSelectRecently(ary2, select) {
  ary2.map((element) => {
    addRecentlyItem(select, element.value, element.text);
  });
}

// async function loadAsync(mes = "") {
async function loadAsync() {
  let ret = await loadSettings_by_api("from loadAsync");
  let storageOptions = getStorageOptions();

  storageOptions["Options"] = adjustValue(storageOptions["Options"]);
  console.log(
    `loadSettings_by_api --- Options ${Object.entries(ret["Options"])}`
  );
  console.log(`ret= ${Object.entries(ret)}`);
  // updateSelectRecently(storageOptions["Options"], $("#rinp"));

  let options = [...ret["Options"]];
  setStorageOptions([]);
  updateSelectRecently(options, $("#rinp"));
}

export { loadAsync, updateSelectRecently };
