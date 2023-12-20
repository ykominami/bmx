// background.js
chrome.runtime.onInstalled.addListener(() => {
  // 何かしらのバックグラウンド準備
  console.log('バックグラウンドサービスワーカーがインストールされました。');
  
  // アラームの設定など
  chrome.alarms.create('refresh', { periodInMinutes: 5 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refresh') {
    // 定期的な処理
    console.log('アラームイベントが発生しました。');
  }
});
