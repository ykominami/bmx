import { console.log, debugPrint } from './debug.js';
import { initSettings_all } from './global.js';
// document.addEventListener("DOMContentLoaded", restoreOptions);

const add_anchor = (id_str, url, text) => {
  const element = document.querySelector(id_str);
  console.log(element);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.textContent = text;
  // element.insertBefore(anchor, element.firstChild);
  element.appendChild(anchor);
};

const add_anchor2 = (id_str, url, text) => {
  const table = document.querySelector(id_str);
  console.log(table);
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
console.log('options.js');

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
  // console.log("start 2");

  dumpBookmarksAsync()
    .then((bookmarkTreeNodes) => {
      dumpTreeNodesAsync(bookmarkTreeNodes);
    })
    .then(
      // console.log("start call loadAsync 02"),
      loadSettings().then(initSettings_all)
    );
}
// console.log(`before start`);
start_options();
