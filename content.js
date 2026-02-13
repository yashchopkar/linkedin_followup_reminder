console.log("🔥 LinkedIn Follow-up Engine Running");

// ----------------------------
// DATE PARSER
// ----------------------------
function parseLinkedInDate(text) {
  const now = new Date();
  text = text.trim().toLowerCase();

  // Case 1: Time today like "4:47 AM"
  if (text.includes(":")) {
    return new Date(now);
  }

  // Case 2: Yesterday
  if (text === "yesterday") {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }

  // Case 3: 2d, 3d
  if (text.endsWith("d")) {
    const days = parseInt(text);
    if (!isNaN(days)) {
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d;
    }
  }

  // Case 4: 1w, 2w
  if (text.endsWith("w")) {
    const weeks = parseInt(text);
    if (!isNaN(weeks)) {
      const d = new Date();
      d.setDate(d.getDate() - (weeks * 7));
      return d;
    }
  }

  // Case 5: "Jan 20"
  const parts = text.split(" ");
  if (parts.length === 2) {
    const month = parts[0];
    const day = parseInt(parts[1]);
    if (!isNaN(day)) {
      return new Date(`${month} ${day}, ${now.getFullYear()}`);
    }
  }

  return null;
}

// ----------------------------
// MAIN CHECK FUNCTION
// ----------------------------
function checkConversations() {
  chrome.storage.local.get("followUpDays", (data) => {

    const SELECTED_DAYS = data.followUpDays || 2;
    const items = document.querySelectorAll(".msg-conversation-listitem");
    const followUps = [];

    items.forEach(item => {

      const timeEl = item.querySelector("time");
      const nameEl = item.querySelector(".msg-conversation-listitem__participant-names");

      if (!timeEl || !nameEl) return;

      const dateText = timeEl.innerText;
      const messageDate = parseLinkedInDate(dateText);
      if (!messageDate) return;

      const now = new Date();

      const diffDays = Math.floor(
        (now - messageDate) / (1000 * 60 * 60 * 24)
      );

      // 🔥 EXACT DAY MATCH
      if (diffDays === SELECTED_DAYS) {
        item.style.borderLeft = "5px solid red";
        followUps.push(nameEl.innerText.trim());
      } else {
        item.style.borderLeft = "";
      }
    });

    // Save to storage
    chrome.storage.local.set({ followUps });

    // Update badge
    chrome.runtime.sendMessage({
      type: "UPDATE_BADGE",
      count: followUps.length
    });
  });
}

// ----------------------------
// INITIAL RUN
// ----------------------------
setTimeout(checkConversations, 3000);

// ----------------------------
// OBSERVE LINKEDIN DYNAMIC LOAD
// ----------------------------
const observer = new MutationObserver(() => {
  checkConversations();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// ----------------------------
// LISTEN FOR POPUP REFRESH
// ----------------------------
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "REFRESH_CHECK") {
    checkConversations();
  }
});
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "rescan") {
    scanConversations();   // your existing scan function
  }
});
