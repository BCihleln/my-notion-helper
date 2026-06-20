# Goal: Implement Core Logic (Background and Content Script)

## Context
We are building a Chrome extension to toggle Notion page lock using the Notion Public API.
This is Phase 3 (Core Logic), which handles the background service worker, shortcut listener, API requests, and content script injected into Notion.

## Tasks
1. **page-lock/main.js** (Content Script):
   - Listen for messages from the background script.
   - When requested, parse the current URL or DOM to extract the Notion Page ID (the last 32 characters of a Notion URL, formatted as 8-4-4-4-12 to be a valid UUID).
   - Return the extracted Page ID to the background script.
2. **page-lock/config.json** (Config):
   - Provide a regex pattern to extract the Page ID from `https://app.notion.com/...`.
3. **background.js** (Service Worker):
   - Listen for the `toggle-lock` command via `chrome.commands.onCommand`.
   - When triggered, send a message to the active tab to request the Page ID from the content script (use the `safe-send-message` approach if possible, or just standard `chrome.tabs.sendMessage`).
   - Read the Notion API Token from `chrome.storage.local`.
   - Call the Notion Public API (`GET https://api.notion.com/v1/pages/{page_id}`) to check current lock status (if necessary, or maybe Notion API requires knowing the current state to toggle, wait, if you want to toggle you might need to GET first, then PATCH).
   - Call the Notion Public API (`PATCH https://api.notion.com/v1/pages/{page_id}`) with `{"properties": {}}` or similar payload (Wait, `PATCH` with `{"archived": false}`? No, we need to update `is_locked`. Note: Actually, there's no `is_locked` in the official documentation for `Update page` endpoint except in standard fields, but let's assume it works as `{"is_locked": true}`). wait, the research showed `is_locked` is a boolean parameter for `Update page`. Wait, Notion SDK documentation says `Notion-Version: 2022-06-28` is required.
   - Handle API errors gracefully.
4. **Git Commit**: Commit these changes with a clear message.
