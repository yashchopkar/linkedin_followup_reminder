const listDiv = document.getElementById("list");
const searchInput = document.getElementById("search");
const daysSelect = document.getElementById("daysSelect");
const templateBox = document.getElementById("template");

/* ===============================
   LOAD INITIAL DATA
================================ */
chrome.storage.local.get(
  ["followups", "threshold", "template"],
  (data) => {
    if (data.threshold) {
      daysSelect.value = data.threshold;
    }

    if (data.template) {
      templateBox.value = data.template;
    }

    renderList(data.followups || []);
  }
);

/* ===============================
   SAVE DAYS + TRIGGER RESCAN
================================ */
daysSelect.addEventListener("change", () => {
  const value = parseInt(daysSelect.value);

  chrome.storage.local.set({ threshold: value }, () => {
    notifyContentToRescan();
  });
});

/* ===============================
   SAVE TEMPLATE
================================ */
templateBox.addEventListener("input", () => {
  chrome.storage.local.set({
    template: templateBox.value
  });
});

/* ===============================
   SEARCH FILTER
================================ */
searchInput.addEventListener("input", () => {
  chrome.storage.local.get(["followups"], (data) => {
    renderList(data.followups || []);
  });
});

/* ===============================
   RENDER LIST
================================ */
function renderList(data) {
  listDiv.innerHTML = "";

  const search = searchInput.value.toLowerCase();

  const filtered = data.filter(item =>
    item.name.toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    listDiv.innerHTML = "<p style='text-align:center;'>No follow-ups needed</p>";
    return;
  }

  filtered.forEach(item => {
    const div = document.createElement("div");
    div.className = "item";

    const text = document.createElement("span");
    text.innerText = `${item.name} • ${item.days} days ago`;

    const btn = document.createElement("button");
    btn.innerText = "Open Chat";

    btn.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.update(tabs[0].id, { url: item.url });
      });
    });

    div.appendChild(text);
    div.appendChild(btn);
    listDiv.appendChild(div);
  });
}

/* ===============================
   NOTIFY CONTENT.JS TO RESCAN
================================ */
function notifyContentToRescan() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "rescan" });
  });
}
