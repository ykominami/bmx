import { debugPrint2, debugPrint } from './debug.js';

chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.executeScript({
    code: "debugPrint2('" + 'Turning ' + tab.url + ' red!' + "');",
  });
});
