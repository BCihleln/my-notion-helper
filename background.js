import { getCurrentTab, isPageLockEnabled } from './utils.js';

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

async function showToast(message, tabId = null) {
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

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-lock') return;

  try {
    if (!(await isPageLockEnabled())) {
      console.log('Page lock module is disabled.');
      return;
    }

    const { notionToken } = await chrome.storage.local.get(['notionToken']);
    if (!notionToken) return showToast('Token Missing: Please set your Notion API Token in the extension popup.');

    const tab = await getCurrentTab();
    if (!tab) return;

    let response;
    try {
      response = await chrome.tabs.sendMessage(tab.id, { action: 'get-page-id' });
    } catch (err) {
      return showToast('Content Script Not Ready: Please refresh this Notion page.', tab.id);
    }

    if (!response?.success) {
      return showToast('Page ID Not Found: ' + (response?.error || 'Could not detect Notion Page ID.'), tab.id);
    }

    const { pageId } = response;
    const headers = {
      'Authorization': `Bearer ${notionToken}`,
      'Notion-Version': '2026-03-11',
      'Content-Type': 'application/json'
    };

    // Try fetching as page, fallback to database
    let res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, { method: 'GET', headers });
    let isDatabase = false;
    let data = null;

    if (res.ok) {
      data = await res.json();
      if (data.object === 'database') {
        isDatabase = true;
        res = await fetch(`https://api.notion.com/v1/databases/${pageId}`, { method: 'GET', headers });
        if (res.ok) data = await res.json();
      }
    } else {
      res = await fetch(`https://api.notion.com/v1/databases/${pageId}`, { method: 'GET', headers });
      if (res.ok) {
        isDatabase = true;
        data = await res.json();
      }
    }

    if (!res.ok || !data) {
      return showToast('API Error: Failed to fetch page/database. Is it shared with your integration?', tab.id);
    }

    const endpoint = isDatabase ? `https://api.notion.com/v1/databases/${pageId}` : `https://api.notion.com/v1/pages/${pageId}`;
    const patchRes = await fetch(endpoint, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ is_locked: !data.is_locked })
    });

    if (!patchRes.ok) return showToast(`API Error: ${patchRes.statusText}`, tab.id);

    await showToast(`Page is now ${data.is_locked ? 'unlocked' : 'locked'}.`, tab.id);
  } catch (error) {
    console.error('Error:', error);
    await showToast('Error: An unexpected error occurred. Check console.');
  }
});
