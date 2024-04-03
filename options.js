import { debugPrint2, debugPrint } from './debug.js';
// document.addEventListener("DOMContentLoaded", restoreOptions);

const add_anchor = (id_str, url, text) => {
  const element = document.querySelector(id_str);
  debugPrint2(element);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.textContent = text;
  // element.insertBefore(anchor, element.firstChild);
  element.appendChild(anchor);
};

const add_anchor2 = (id_str, url, text) => {
  const table = document.querySelector(id_str);
  debugPrint2(table);
  let tr0 = table.insertRow(-1);
  // let tr1 = table.insertRow(-1);

  let td0 = tr0.insertCell(-1);
  // let td1 = tr1.insertCell(-1);

  if (url != null) {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.textContent = text;
    // element.insertBefore(anchor, element.firstChild);
    td0.appendChild(anchor);
  } else {
    const anchor = document.createElement('a');
    tr0.textContent = text;
  }
};
/*
add_anchor2("#table1", "https://www.google.com", "GOOGLE");
add_anchor2("#table1", "https://northern-corss.info", "NORTHERN-CROSS");

add_anchor2("#table2", null, "Category1");
add_anchor2("#table2", "https://www.google.com", "GOOGLE");
add_anchor2("#table2", "https://northern-corss.info", "NORTHERN-CROSS");
add_anchor2("#table2", null, "Category2");
add_anchor2("#table2", "https://www.google.com", "GOOGLE");
add_anchor2("#table2", "https://northern-corss.info", "NORTHERN-CROSS");
*/
debugPrint2('options.js');

function add_make_filter() {
  let tr0 = table.insertRow(-1);
  let td0 = tr0.insertCell(-1);
  let input = document.createElement('input');
  input.type = 'text';
  input.id = 'filter';
  input.value = '';
  td0.appendChild(input);
}

async function start_options() {
  initItems();
  // debugPrint2("start 2");

  dumpBookmarksAsync()
    .then((bookmarkTreeNodes) => {
      dumpTreeNodesAsync(bookmarkTreeNodes);
    })
    .then(
      // debugPrint2("start call loadAsync 02"),
      loadAsync().then(loadSettings_by_api('P2')).then(initSettings_all)
    );
}
// debugPrint2(`before start`);
start_options();
