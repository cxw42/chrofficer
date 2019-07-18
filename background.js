// Portions Copyright (c) D3 Engineering, LLC.  All Rights Reserved.
// Show "active" icon when on an Outlook page
chrome.runtime.onMessage.addListener(function(msg, sender, respond) {
  if (msg !== 'chrofficer-attached') return;
  chrome.browserAction.setIcon({path: '/browser-action-icon-active.png'});
});

// Callback for handling notifications
function callback(details) {
  if(details.tabId === -1) { return; }
  console.log({'Reminder': details});

  chrome.windows.getCurrent(function(win) {
    chrome.tabs.get(details.tabId, function(ctab) {
      // TODO make this an option
      //if (win.focused && ctab.active) {
      //  return;
      //}
      chrome.tabs.sendMessage(details.tabId, "calendar_notify", function (resp) {
        resp.reminders.forEach(function(item) {
          let notification_id = chrome.notifications.create(  // TODO add notification ID
            {
              type: 'basic',
              iconUrl: chrome.extension.getURL('/app.png'),
              title: 'Calendar Reminder',
              message: item.title,
              contextMessage: `${item.start_time} (${item.relative_time})`,
              requireInteraction: true,   // Requires Chrome 50+
            }
          );
          console.log(`Notification ${notification_id} created`);
        });
      });
    });
  });
} //callback()

// Set up to be notified when the notification sound plays
chrome.webRequest.onBeforeRequest.addListener(
  callback,
  {urls: ['*://*/owa*notif*reminder.mp3', '*://*/owa*calendar_notify*']}
);
