// utils.js
export async function getCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs.length > 0 ? tabs[0] : null;
}

export async function showToast(message, tabId = null) {
  if (!tabId) {
    const tab = await getCurrentTab();
    if (!tab) return;
    tabId = tab.id;
  }
  try {
    await chrome.tabs.sendMessage(tabId, { action: 'show-toast', message });
  } catch (err) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (msg) => alert(msg),
        args: [message]
      });
    } catch (e) {
      console.error('Failed to show fallback alert', e);
    }
  }
}
