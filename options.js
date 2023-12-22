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

data_array = [["d01", "d02", "loalhost"], ["d03", "d04", "localhost:3000"] ];

//let tbody = document.querySelector("tbody");
let table = document.querySelector("table");
let tbody = document.querySelector("#tbody1");
// let tr1 = document.querySelector("#tr1");
// let tr2 = document.querySelector("#tr2");

data_array.map( (ary) => {
	let newtr = document.createElement('tr');
	let td1 = document.createElement('td');
	td1.textContent = ary[0];
	let td2 = document.createElement('td');
	let a = document.createElement('a');
	a.href = ary[2];
	a.textContent = ary[1];
	td2.appendChild(a);

	newtr.appendChild(td1);
	newtr.appendChild(td2);
	// newtr.appendChild(a);
	tbody.append(newtr)
}
)
//td1.append("d12")

// table.insertBefore(newtr, tr1)
// table.insertBefore(newtr, tr2)
// tbody.insertBefore(newtr, tr1)
// tbody.prepend(newtr)
// tbody.insertBefore(newtr, tr2)
// table.appendChild(firstTr)

//li要素を生成
let li = document.createElement('li');

//テキストを設定
li.textContent = 'item5';

//ulを取得
let ul = document.querySelector('ul');

//ulの最後の子要素として追加
ul.appendChild(li);