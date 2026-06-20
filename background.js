const SCRIPT_ID = 'page-lock-script';

async function registerContentScript() {
  try {
    const scripts = await chrome.scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] });
    if (scripts.length === 0) {
      await chrome.scripting.registerContentScripts([{
        id: SCRIPT_ID,
        matches: [
          "*://app.notion.com/*",
          "*://*.notion.so/*",
          "*://*.notion.site/*"
        ],
        js: ["toast/main.js", "page-lock/main.js"],
        css: ["toast/styles.css"],
        runAt: "document_idle"
      }]);
      console.log('Content script registered.');
    }
  } catch (err) {
    console.error('Failed to register content script:', err);
  }
}

async function unregisterContentScript() {
  try {
    const scripts = await chrome.scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] });
    if (scripts.length > 0) {
      await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] });
      console.log('Content script unregistered.');
    }
  } catch (err) {
    console.error('Failed to unregister content script:', err);
  }
}

async function updateScriptState(isEnabled) {
  if (isEnabled) {
    await registerContentScript();
  } else {
    await unregisterContentScript();
  }
}

// Init on installed/startup
chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get(['modules']);
  const isEnabled = result.modules ? result.modules.pageLock !== false : true;
  await updateScriptState(isEnabled);
});

chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get(['modules']);
  const isEnabled = result.modules ? result.modules.pageLock !== false : true;
  await updateScriptState(isEnabled);
});

// Watch for changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.modules) {
    const newModules = changes.modules.newValue || {};
    const isEnabled = newModules.pageLock !== false;
    updateScriptState(isEnabled);
  }
});

async function showToast(message, tabId = null) {
  if (!tabId) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      tabId = tabs[0].id;
    } else {
      return;
    }
  }
  try {
    await chrome.tabs.sendMessage(tabId, { action: 'show-toast', message });
  } catch (err) {
    // Fallback if content script is missing
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
  if (command === 'toggle-lock') {
    try {
      const result = await chrome.storage.local.get(['modules', 'notionToken']);
      const isEnabled = result.modules ? result.modules.pageLock !== false : true;
      if (!isEnabled) {
        console.log('Page lock module is disabled. Ignoring shortcut.');
        return;
      }

      const notionToken = result.notionToken;
      if (!notionToken) {
        await showToast('Token Missing: Please set your Notion API Token in the extension popup.');
        return;
      }

      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];
      if (!tab) return;

      let response;
      try {
        response = await chrome.tabs.sendMessage(tab.id, { action: 'get-page-id' });
      } catch (err) {
        await showToast('Content Script Not Ready: Please refresh this Notion page to enable the lock shortcut.', tab.id);
        return;
      }

      if (!response || !response.success) {
        await showToast('Page ID Not Found: ' + (response?.error || 'Could not detect Notion Page ID from URL.'), tab.id);
        return;
      }

      const pageId = response.pageId;

      const headers = {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': '2026-03-11',
        'Content-Type': 'application/json'
      };


      let isDatabase = false;
      let pageData = null;

      // Step 1: Try pages endpoint first
      let getResponse = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'GET',
        headers
      });


      if (getResponse.ok) {
        pageData = await getResponse.json();
        if (pageData.object === 'database') {
          isDatabase = true;
          // Re-fetch from databases endpoint to ensure we get database-specific properties like is_locked
          getResponse = await fetch(`https://api.notion.com/v1/databases/${pageId}`, {
            method: 'GET',
            headers
          });
          if (getResponse.ok) {
            pageData = await getResponse.json();
          } else {
            await showToast('API Error: Failed to fetch database details.', tab.id);
            return;
          }
        }
      } else {
        // Step 2: pages endpoint failed, try databases endpoint
        getResponse = await fetch(`https://api.notion.com/v1/databases/${pageId}`, {
          method: 'GET',
          headers
        });
        
        if (getResponse.ok) {
          isDatabase = true;
          pageData = await getResponse.json();
        } else {
          await showToast('API Error: Failed to fetch page/database. Is it shared with your integration?', tab.id);
          return;
        }
      }

      const currentLockedState = pageData.is_locked === true;

      const endpoint = isDatabase ? `https://api.notion.com/v1/databases/${pageId}` : `https://api.notion.com/v1/pages/${pageId}`;
      const patchResponse = await fetch(endpoint, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          is_locked: !currentLockedState
        })
      });

      if (!patchResponse.ok) {
        await showToast(`API Error: Failed to update page: ${patchResponse.statusText}`, tab.id);
        return;
      }

      await showToast(`Page is now ${!currentLockedState ? 'locked' : 'unlocked'}.`, tab.id);
      
    } catch (error) {
      console.error('Error in toggle-lock command:', error);
      await showToast('Error: An unexpected error occurred. Check console for details.');
    }
  }
});
