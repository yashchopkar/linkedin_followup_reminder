chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "UPDATE_BADGE") {
    chrome.action.setBadgeText({
      text: message.count > 0 ? message.count.toString() : ""
    });

    chrome.action.setBadgeBackgroundColor({
      color: "#ff0000"
    });
  }
});
