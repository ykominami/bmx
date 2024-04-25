import { getItemHashByHierKeys, initItems } from './data.js';
import { makeBtnA } from './util.js';
import { getStorageHiers, printSettings } from './global.js';
import { loadAsync } from './async.js';

function setKeyItems() {
  const keys2 = getItemHashByHierKeys();
  $('#treex').append(keys2);
}

function saveOptions() {
  const color = document.getElementById('color').value;
  const likesColor = document.getElementById('like').checked;

  chrome.storage.sync.set(
    { favoriteColor: color, likesColor: likesColor },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 750);
    }
  );
}

function saveOptions2() {
  alert('ALERT 200');
}

function restoreOptions() {
  chrome.storage.sync.get(
    { favoriteColor: 'red', likesColor: true },
    (items) => {
      document.getElementById('color').value = items.favoriteColor;
      document.getElementById('like').checked = items.likesColor;
    }
  );
}

function xyz(name, class_name, id) {
  return makeBtnA(name, class_name, id);
}

function xyz1() {
  let keys = getStorageHiers();
  printSettings();
  console.log('Settings = ');
  console.log(keys);

  let aryx = keys.map((value, idx) => {
    let btn = xyz(value, `g-${idx + 1}-1`, `${value}-${idx + 1}`);
    return btn;
  });
  $('#treex').addClass('wrapper');
  $('#treex').append(aryx);

  printSettings();
}

// initSettings();
initItems();
printSettings();
await loadAsync(2);
xyz1();

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('save2').addEventListener('click', saveOptions2);
