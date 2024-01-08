function getMonthx(datex) {
  return datex.getMonth() + 1;
}

function adjustAsStr(num) {
  let str = `${num}`;
  if (num < 10) {
    str = `0${num}`;
  }
  return str;
}

/* buttonのjqueryオブジェクト */
function makeBtnA(name, class_name, id) {
  return $("<button>", {
    type: "button",
    name: name,
    class: class_name,
    id: id,
    text: name,
  });
}

/* selectのjqueryオブジェクト */
function makeSelectA(class_name, id) {
  return $("<select>", {
    class: class_name,
    id: id,
  });
}

function getCategoryName(i) {
  return "c" + i;
}

function getSelectId(name) {
  return name + "inp";
}

function getBtnId(name) {
  return name + "btn";
}

function getJqueryId(id) {
  return "#" + id;
}

async function parseURLAsync(url) {
  let parser = new URL(url);

  return parser;
}

function parseURLX(url) {
  let ret = parseURLAsync(url).then((parser) => {
    return parser.hostname;
  });
  return ret;
}

function parseURLX2(url) {
  return parseURLAsync(url).then((parser) => {
    return parser;
  });
}
function x() {
  let ret = parseURLAsync(url)
    .then((parser) => {
      let href = parser.href;
      let host = parser.host;
      let hostname = parser.hostname;
      let pathname = parser.pathname;
      let protocol = parser.protocol;
      // $('#ox') = href;
      // $("#ox").val(hostname);
      console.log(`href=${href}`);
      return hostname;
    })
    .catch((error) => {
      // return e;
      //alert(error.message);
      // $("#ox").val(error.message);
    });
  /*
  let search = parser.search;
  let hash = parser.hash;
  let origin = parser.origin;
  let port = parser.port;
  let username = parser.username;
  let password = parser.password;
  let searchParams = parser.searchParams;
  let searchParams_keys = searchParams.keys();
  let searchParams_values = searchParams.values();
  let searchParams_entries = searchParams.entries();
  let searchParams_toString = searchParams.toString();
  let searchParams_append = searchParams.append();
  let searchParams_delete = searchParams.delete();
  let searchParams_get = searchParams.get();
  let searchParams_getAll = searchParams.getAll();
  let searchParams_has = searchParams.has();
  let searchParams_set = searchParams.set();
  let searchParams_sort = searchParams.sort();
  let searchParams_forEach = searchParams.forEach();
  let searchParams_toJSON = searchParams.toJSON();
  let searchParams_toString = searchParams.toString();
  let searchParams_toString = searchParams.toString();
  */
  /*
console.log(
  `############  selectWaitingItemsBtnHdr folder_id=${folder_id} || #oid=${$(
    "#oid"
  ).val()}|| ${BookmarkTreeNodes.length}`
);
*/
}
export {
  getMonthx,
  adjustAsStr,
  makeBtnA,
  makeSelectA,
  getCategoryName,
  getSelectId,
  getBtnId,
  getJqueryId,
  parseURLAsync,
  parseURLX,
  parseURLX2,
};
