document.addEventListener("DOMContentLoaded", async () => {
  const toggleBtn = document.getElementById("toggle");
  const statusIndicator = document.getElementById("statusIndicator");
  const statusText = document.getElementById("statusText");

  // Get current status
  let isEnabled = true;
  const result = await chrome.storage.local.get("enabled");
  if (result.enabled !== undefined) {
    isEnabled = result.enabled;
  }
  
  updateStatus(isEnabled);

  toggleBtn.addEventListener("click", async () => {
    isEnabled = !isEnabled;
    await chrome.storage.local.set({ enabled: isEnabled });
    updateStatus(isEnabled);
    
    // Notify content script of the change
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: "toggle", enabled: isEnabled });
      }
    } catch (e) {
      // Ignore if content script not available
    }
    
    setTimeout(() => window.close(), 300);
  });

  function updateStatus(enabled) {
    if (enabled) {
      statusIndicator.className = "status-indicator enabled";
      statusText.textContent = "Active";
      toggleBtn.textContent = "Disable";
      toggleBtn.style.background = "#ff6b6b";
      toggleBtn.style.color = "white";
    } else {
      statusIndicator.className = "status-indicator disabled";
      statusText.textContent = "Disabled";
      toggleBtn.textContent = "Enable";
      toggleBtn.style.background = "#4CAF50";
      toggleBtn.style.color = "white";
    }
  }

  // Check if we're on a supported site
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.url) {
      const isSupported = /github\.com|gitlab\.com|bitbucket\.org/.test(tab.url);
      if (!isSupported) {
        statusText.textContent = "Unsupported site";
        statusIndicator.className = "status-indicator disabled";
        toggleBtn.disabled = true;
      }
    }
  } catch (e) {
    // Ignore
  }
});
  