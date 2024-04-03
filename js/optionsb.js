import { getItemHashByHierKeys, initItems } from './data.js';
import { makeBtnA } from './util.js';
import {
  getStorageHiers,
  printSettings,
  printSettingsFromLoad,
} from './global.js';
import { loadAsync } from './async.js';
import { debugPrint2, debugPrint } from './debug.js';

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

// const saveOptions2 = () => {
function saveOptions2() {
  alert('ALERT 200');
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
// const restoreOptions = () => {
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
  debugPrint2('Settings = ');
  debugPrint2(keys);

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
printSettingsFromLoad();
await loadAsync(2);
xyz1();

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('save2').addEventListener('click', saveOptions2);
