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
  return new URL(url);
}

function parseURLX(url) {
  return parseURLAsync(url).then((parser) => {
    return parser.hostname;
  });
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
};
