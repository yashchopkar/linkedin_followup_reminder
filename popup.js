document.addEventListener("DOMContentLoaded", () => {
  const selector = document.getElementById("daySelector");
  const customInput = document.getElementById("customDays");
  const saveBtn = document.getElementById("saveBtn");
  const list = document.getElementById("list");

  // Show/hide custom input
  selector.addEventListener("change", () => {
    if (selector.value === "custom") {
      customInput.style.display = "block";
    } else {
      customInput.style.display = "none";
    }
  });

  // Save selected days
  saveBtn.addEventListener("click", () => {
    let days = selector.value;

    if (days === "custom") {
      days = customInput.value;
      if (!days || days < 1) {
        alert("Enter valid custom days");
        return;
      }
    }

    chrome.storage.local.set({ followUpDays: parseInt(days) }, () => {

      // Trigger refresh in content script
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "REFRESH_CHECK" });
      });

    });
  });

  // Load follow-ups list
  function loadFollowUps() {
    chrome.storage.local.get("followUps", (data) => {
      list.innerHTML = "";

      if (!data.followUps || data.followUps.length === 0) {
        list.innerHTML = "<li>No follow-ups needed</li>";
        return;
      }

      data.followUps.forEach(name => {
        const li = document.createElement("li");
        li.innerText = name;
        list.appendChild(li);
      });
    });
  }

  loadFollowUps();
});
