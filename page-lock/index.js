const SCRIPT_ID = 'page-lock-script';

async function onEnable() {
  try {
    const scripts = await chrome.scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] });
    if (scripts.length === 0) {
      await chrome.scripting.registerContentScripts([{
        id: SCRIPT_ID,
        matches: ["*://app.notion.com/*", "*://*.notion.so/*", "*://*.notion.site/*"],
        js: ["toast/main.js", "page-lock/main.js"],
        css: ["toast/styles.css"],
        runAt: "document_idle"
      }]);
      console.log('Page lock content script registered.');
    }
  } catch (err) {
    console.error('Failed to register page lock content script:', err);
  }
}

async function onDisable() {
  try {
    const scripts = await chrome.scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] });
    if (scripts.length > 0) {
      await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] });
      console.log('Page lock content script unregistered.');
    }
  } catch (err) {
    console.error('Failed to unregister page lock content script:', err);
  }
}

export default {
  id: 'pageLock',
  onEnable,
  onDisable
};
