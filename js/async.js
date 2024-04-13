import { loadSettings, loadSettings_by_api } from './global.js';

function loadAsync(mes = '') {
  return new Promise((resolve, reject) => {
    // loadSettings(mes);
    loadSettings_by_api(mes);

    resolve({});
  });
}

export { loadAsync };
