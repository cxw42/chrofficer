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

          let context_msg = `${item.start_time} (${item.relative_time})`;
          if(item.location) {
            context_msg += ` at/in ${item.location}`;
          }

          let title_msg = 'Calendar Reminder';
          if(resp.reminders.length>1) {
            title_msg += ' (check the tray for more)';
          }

          let notification_id = chrome.notifications.create(  // TODO add notification ID
            {
              type: 'basic',
              iconUrl: chrome.extension.getURL('/app.png'),
              title: title_msg,
              message: item.title,
              contextMessage: context_msg,
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
