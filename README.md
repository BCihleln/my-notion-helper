# My Notion Helper (Notion Page Lock Toggle)

This is a Chrome Extension built on Manifest V3 designed to simplify the process of locking and unlocking Notion pages. With a simple keyboard shortcut, you can quickly toggle the lock status of your current Notion page or database without navigating through menus!

## Features

- **Quick Toggle**: Use a shortcut (`Alt+L` on Windows/Linux, `Ctrl+L` on Mac) to instantly lock or unlock the current Notion page or database.
- **Support for Databases and Sub-pages**: Accurately detects whether you are viewing a standard page, a database, or a peek-view sub-page (via the `p=` URL parameter) and toggles the lock appropriately.
- **On/Off Toggle**: Easily disable or enable the feature from the extension popup.
- **Custom Toast Notifications**: Seamless, non-intrusive notifications right inside your Notion workspace to let you know the lock status or if any errors occurred.

## Architecture

This extension follows a modular Manifest V3 design:

1. **Background Service Worker (`background.js`)**: 
   - Listens for the keyboard shortcut.
   - Communicates with the Content Script to retrieve the current Notion Page ID.
   - Communicates directly with the official Notion API to retrieve and update the `is_locked` status of pages and databases.
   - Dynamically registers/unregisters the content script based on the user's enable/disable preference.
2. **Popup Interface (`popup.html`, `popup.js`, `popup.css`)**: 
   - A clean UI for users to input and securely save their Notion Integration Access Token (`chrome.storage.local`).
   - A toggle switch to turn the Page Lock module on or off.
3. **Content Script (`page-lock/main.js`)**: 
   - Parses the active Notion URL to accurately extract the 32-character ID and formats it into standard UUID format (8-4-4-4-12) for API calls.
   - Handles the injection and display of custom toast notifications (`utils/toast.html`).

## Installation & Setup

### 1. Get a Notion Integration Token

This extension leverages the official Notion API, so you'll need an integration token:
1. Go to [Notion My Integrations](https://app.notion.com/my-integrations) and create a new integration.
2. Ensure the integration has capabilities to read/update content.
3. Copy the **Internal Integration Secret (Access Token)**.

### 2. Install the Extension

1. Clone or download this project folder.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the `my-notion-chrome-extension` directory.
5. Click on the extension icon in your toolbar, paste your Integration Token, and save it.

### 3. Granting Access to Pages

Because of Notion's security model, the integration can only modify pages it has been explicitly given access to:
1. Open your Notion workspace.
2. On the top-level page(s) or database(s) where you want to use the lock toggle, click the `...` menu in the top right corner.
3. Go to **Add connections** and select your integration.
4. Now, pressing `Alt+L` (or `MacCtrl+L` on Mac) on that page or its nested pages will toggle the lock status!

---

> [!WARNING]
> **Known Pitfall: Decoupled Database Share Settings**
> 
> If a database page's share settings are decoupled from the database itself, it will cause the integration's authorization to not sync properly (leading to an 'integration unauthorized' error from our plugin). When this happens, the user should revert the share settings to follow the database, and then re-configure the integration.
