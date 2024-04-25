import { getStorageOptions, addRecentlyItemX } from './global.js';

function restoreSelectRecently(select) {
  let sOptions = getStorageOptions();
  addRecentlyItemX(select, sOptions);
}

function updateSelectRecently(ary, select) {
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
    select.val(ary[0].value);
  }
}

export { restoreSelectRecently, updateSelectRecently };
