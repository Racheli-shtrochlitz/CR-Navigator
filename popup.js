document.addEventListener("DOMContentLoaded", () => {
    const enableBtn = document.getElementById("enable");
    const disableBtn = document.getElementById("disable");
  
    enableBtn.addEventListener("click", () => {
      chrome.storage.local.set({ enabled: true });
      window.close();
    });
  
    disableBtn.addEventListener("click", () => {
      chrome.storage.local.set({ enabled: false });
      window.close();
    });
  });
  