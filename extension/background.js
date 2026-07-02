// background.js - Ephemeral Service Worker for DSA Mentor Companion

// Configure side panel to open when clicking the extension action icon
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("Error setting panel behavior:", error));
});
