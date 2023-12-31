// Saves options to chrome.storage
const saveOptions = () => {
  const color = document.getElementById("color").value;
  const likesColor = document.getElementById("like").checked;

  chrome.storage.sync.set(
    { favoriteColor: color, likesColor: likesColor },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById("status");
      status.textContent = "Options saved.";
      setTimeout(() => {
        status.textContent = "";
      }, 750);
    }
  );
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get(
    { favoriteColor: "red", likesColor: true },
    (items) => {
      document.getElementById("color").value = items.favoriteColor;
      document.getElementById("like").checked = items.likesColor;
    }
  );
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);

data_array = [
  ["d01", "d02", "loalhost"],
  ["d03", "d04", "localhost:3000"],
  ["abc", "def", "hij"],
];

//let tbody = document.querySelector("tbody");
let table = document.querySelector("#table0");
let tbody = document.querySelector("#tbody1");
// let tr1 = document.querySelector("#tr1");
// let tr2 = document.querySelector("#tr2");

data_array.map((ary) => {
  let newtr = document.createElement("tr");
  let td1 = document.createElement("td");
  td1.textContent = ary[0];
  let td2 = document.createElement("td");
  let a = document.createElement("a");
  a.href = ary[2];
  a.textContent = ary[1];
  td2.appendChild(a);

  newtr.appendChild(td1);
  newtr.appendChild(td2);
  // newtr.appendChild(a);
  tbody.append(newtr);
});
//td1.append("d12")

// table.insertBefore(newtr, tr1)
// table.insertBefore(newtr, tr2)
// tbody.insertBefore(newtr, tr1)
// tbody.prepend(newtr)
// tbody.insertBefore(newtr, tr2)
// table.appendChild(firstTr)

//li要素を生成
let li = document.createElement("li");

//テキストを設定
li.textContent = "item50";

//ulを取得
let ul = document.querySelector("ul");

//ulの最後の子要素として追加
ul.appendChild(li);

const add_anchor = (id_str, url, text) => {
  const element = document.querySelector(id_str);
  console.log(element);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.textContent = text;
  // element.insertBefore(anchor, element.firstChild);
  element.appendChild(anchor);
};

add_anchor("#search", "https://www.google.com", "GOOGLE");
add_anchor("#search", "https://northern-corss.info", "NORTHERN-CROSS");

const add_anchor2 = (id_str, url, text) => {
  const table = document.querySelector(id_str);
  console.log(table);
  let tr0 = table.insertRow(-1);
  // let tr1 = table.insertRow(-1);

  let td0 = tr0.insertCell(-1);
  // let td1 = tr1.insertCell(-1);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.textContent = text;
  // element.insertBefore(anchor, element.firstChild);
  td0.appendChild(anchor);
};

add_anchor2("#table1", "https://www.google.com", "GOOGLE");
add_anchor2("#table1", "https://northern-corss.info", "NORTHERN-CROSS");

console.log("options.js");
