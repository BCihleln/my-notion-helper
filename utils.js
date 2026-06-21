// utils.js
export async function getCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs.length > 0 ? tabs[0] : null;
}

export async function getModulesState() {
  const result = await chrome.storage.local.get(['modules']);
  return result.modules || {};
}

export async function isPageLockEnabled() {
  const modules = await getModulesState();
  return modules.pageLock !== false; // default to true
}
