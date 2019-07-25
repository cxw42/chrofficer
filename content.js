// Portions Copyright (c) D3 Engineering, LLC.  All Rights Reserved.
var map = Array.prototype.map;
var eleText = function (span) {
  return span.innerText + ' ';
};

// Tell the background we are up and running
chrome.runtime.sendMessage("chrofficer-attached");

// Tell the background script about the pending notifications
chrome.runtime.onMessage.addListener(function(msg, sender, respond) {
  if (msg !== 'calendar_notify') return;

  // microsoft hates using IDs, apparently...

  // Find the "Reminders" pane
  let matches = document.evaluate(
    '/html/body//div[@aria-live="polite" and .//div/text()="Reminders"]',
    document,
    null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

  if(!matches || matches.snapshotLength != 1) {
    console.warn('Could not find "Reminders" div');
    return;
  }
  let pane = matches.snapshotItem(0);

  // Find the reminders therein
  matches = document.evaluate(
    './/button[@data-storybook="reminder"]//div[@class and not(@id) and ./text()]/../div',
    pane,
    null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

  console.info(`Found ${matches.snapshotLength} reminder div items`);
  if(!matches || (matches.snapshotLength % 4)) {
    console.warn(`Could not find reminders`);
    respond({msg: 'calendar_notify', reminders: [
      {
        title: 'Unknown reminder',
        start_time: 'Please check the Outlook window',
        relative_time: "I couldn't understand the notification format",
        location: '<unknown location>',
      }
    ]});
    return;
  }

  // Gather up the text.  Three rows per reminder.
  const field_names = ['title', 'relative_time', 'start_time', 'location'];

  let eles = [];
  for(let match_idx = 0; match_idx < matches.snapshotLength; ++match_idx) {
    let ele_idx = Math.floor(match_idx/field_names.length);
    if(!eles[ele_idx]) {
      eles[ele_idx] = {};
    }

    eles[ele_idx][field_names[match_idx % field_names.length]] =
      matches.snapshotItem(match_idx).textContent;
  }


  // Send it back to the background script
  respond({msg: "calendar_notify", reminders: eles});
});
