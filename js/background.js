import { debugPrint2, debugPrint } from './debug.js';

chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.executeScript({
    code: "console.log('" + 'Turning ' + tab.url + ' red!' + "');",
  });
});
