chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript({code: "console.log('" + 'Turning ' + tab.url + ' red!' +"');"});
/*
    consoloe.log('Turning ' + tab.url + ' red!');
    chrome.tabs.executeScript({
	code: 'document.body.style.backgroundColor="red"'
    });
*/
});
