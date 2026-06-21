import { isPageLockEnabled } from './utils.js';
import { handleToggleLockCommand } from './page-lock/toggle.js';

const SCRIPT_ID = 'page-lock-script';

async function updateScriptState(isEnabled) {
  try {
    const scripts = await chrome.scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] });
    if (isEnabled && scripts.length === 0) {
      await chrome.scripting.registerContentScripts([{
        id: SCRIPT_ID,
        matches: ["*://app.notion.com/*", "*://*.notion.so/*", "*://*.notion.site/*"],
        js: ["toast/main.js", "page-lock/main.js"],
        css: ["toast/styles.css"],
        runAt: "document_idle"
      }]);
      console.log('Content script registered.');
    } else if (!isEnabled && scripts.length > 0) {
      await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] });
      console.log('Content script unregistered.');
    }
  } catch (err) {
    console.error('Failed to update content script state:', err);
  }
}

async function initExtension() {
  const isEnabled = await isPageLockEnabled();
  await updateScriptState(isEnabled);
}

// Init on installed/startup
chrome.runtime.onInstalled.addListener(initExtension);
chrome.runtime.onStartup.addListener(initExtension);

// Watch for changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.modules) {
    const isEnabled = changes.modules.newValue?.pageLock !== false;
    updateScriptState(isEnabled);
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-lock') {
    handleToggleLockCommand();
  }
});
